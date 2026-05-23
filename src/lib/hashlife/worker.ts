import {
  hl,
  gfx,
  parseRLE,
  parseMC,
  generateSoupRLE,
  type Node,
  type Camera,
  type Viewport,
  type Bounds
} from ".";
import {
  DEFAULT_CAMERA,
  MIN_CELL_SIZE,
  MAX_CELL_SIZE,
  FPS_SMOOTHING,
  METRICS_INTERVAL_MS,
  FIT_PADDING
} from "@/shared";
import type { TerminalLog } from "@/stores";

export type MainToWorker =
  | { type: "init"; offscreen: OffscreenCanvas; view: Viewport }
  | { type: "resize"; view: Viewport }
  | { type: "panBy"; dx: number; dy: number }
  | { type: "zoomBy"; x: number; y: number; factor: number }
  | { type: "paintAt"; x: number; y: number; alive: 0 | 1 }
  | { type: "setQuadOverlay"; enabled: boolean }
  | { type: "play" }
  | { type: "pause" }
  | { type: "stepOnce" }
  | { type: "setStepExp"; stepExp: number }
  | { type: "clear" }
  | { type: "collectGarbage" }
  | { type: "fit" }
  | { type: "loadPreset"; filename: string }
  | { type: "loadRleText"; text: string }
  | { type: "loadFile"; file: File }
  | { type: "loadSoup"; size: number; density: number };

export type WorkerToMain =
  | { type: "log"; line: TerminalLog }
  | { type: "camera"; camera: Camera }
  | { type: "bounds"; bounds: Bounds | null }
  | {
      type: "metrics";
      generation: bigint;
      population: number;
      cacheSize: number;
      fps: number;
      level: number;
    };

let ready = false;
let playing = false;
let dirty = false;
let lastMetricsPost = 0;
let lastFrameTime = 0;
let fps = 0;

const LOADERS = import.meta.glob<string>("../../assets/patterns/*.{rle,mc}", {
  query: "?raw",
  import: "default"
});

function postLog(line: TerminalLog): void {
  self.postMessage({ type: "log", line } satisfies WorkerToMain);
}

function postMetrics(): void {
  self.postMessage({
    type: "metrics",
    generation: hl.generation,
    population: hl.nodePopulation[hl.root],
    cacheSize: hl.cacheSize(),
    fps,
    level: hl.nodeLevel[hl.root]
  } satisfies WorkerToMain);
}

function postCamera(): void {
  self.postMessage({
    type: "camera",
    camera: gfx.camera
  } satisfies WorkerToMain);
}

function postBounds(bounds: Bounds | null): void {
  self.postMessage({ type: "bounds", bounds } satisfies WorkerToMain);
}

function logGc(): void {
  postLog({ type: "system", text: `gc: ${hl.cacheSize()} nodes kept.` });
}

function pauseInternal(): void {
  if (!playing) return;
  playing = false;
  fps = 0;
  lastFrameTime = 0;
}

function fit(): void {
  const { view } = gfx;
  if (view.w === 0 || view.h === 0) return;
  if (hl.nodePopulation[hl.root] === 0) {
    const cs = DEFAULT_CAMERA.cellSize;
    gfx.updateCamera({
      cellSize: cs,
      cellX: -view.w / cs / 2,
      cellY: -view.h / cs / 2
    });
    dirty = true;
    postCamera();
    postBounds(null);
    return;
  }
  const b = hl.bounds();
  if (!b) return;
  const widthCells = b.maxX - b.minX + 1;
  const heightCells = b.maxY - b.minY + 1;
  const padW = widthCells * (1 + FIT_PADDING * 2);
  const padH = heightCells * (1 + FIT_PADDING * 2);
  const cellSize = Math.max(
    MIN_CELL_SIZE,
    Math.min(MAX_CELL_SIZE, Math.min(view.w / padW, view.h / padH))
  );
  const cx = (b.minX + b.maxX + 1) / 2;
  const cy = (b.minY + b.maxY + 1) / 2;
  gfx.updateCamera({
    cellSize,
    cellX: cx - view.w / cellSize / 2,
    cellY: cy - view.h / cellSize / 2
  });
  dirty = true;
  postCamera();
  postBounds(b);
}

function panBy(dx: number, dy: number): void {
  const cam = gfx.camera;
  if (cam.cellSize === 0) return;
  gfx.updateCamera({
    cellSize: cam.cellSize,
    cellX: cam.cellX - dx / cam.cellSize,
    cellY: cam.cellY - dy / cam.cellSize
  });
  dirty = true;
  postCamera();
}

function zoomBy(x: number, y: number, factor: number): void {
  const cam = gfx.camera;
  const nextSize = Math.max(
    MIN_CELL_SIZE,
    Math.min(MAX_CELL_SIZE, cam.cellSize * factor)
  );
  if (nextSize === cam.cellSize) return;
  const worldX = cam.cellX + x / cam.cellSize;
  const worldY = cam.cellY + y / cam.cellSize;
  gfx.updateCamera({
    cellSize: nextSize,
    cellX: worldX - x / nextSize,
    cellY: worldY - y / nextSize
  });
  dirty = true;
  postCamera();
}

function paintAt(x: number, y: number, alive: 0 | 1): void {
  const cam = gfx.camera;
  const cellX = Math.floor(cam.cellX + x / cam.cellSize);
  const cellY = Math.floor(cam.cellY + y / cam.cellSize);
  const prev = hl.root;
  hl.setCell(cellX, cellY, alive);
  if (hl.root !== prev) {
    dirty = true;
    if (!playing) postMetrics();
  }
}

async function loadPreset(filename: string) {
  const loader = LOADERS[`../../assets/patterns/${filename}`];
  if (!loader) {
    postLog({ type: "error", text: `Missing preset "${filename}"` });
    return;
  }
  try {
    const text = await loader();
    loadFromText(fileType(filename), text, `preset "${filename}"`);
  } catch (e: unknown) {
    const text = castError(e);
    postLog({ type: "error", text: `Failed to load "${filename}": ${text}` });
  }
}

function loadRleText(text: string) {
  loadFromText("rle", text, "custom RLE");
}

async function loadFile(file: File) {
  try {
    const text = await file.text();
    loadFromText(fileType(file.name), text, `file "${file.name}"`);
  } catch (e: unknown) {
    const text = castError(e);
    postLog({ type: "error", text: `Failed to read file: ${text}` });
  }
}

function loadSoup(side: number, density: number): void {
  loadFromText(
    "rle",
    generateSoupRLE(side, density),
    `random soup (${side}×${side}, density ${density})`
  );
}

function loadFromText(type: "rle" | "mc", text: string, label: string) {
  let root: Node;
  try {
    root = (type === "mc" ? parseMC(text) : parseRLE(text)).root;
  } catch (e) {
    postLog({
      type: "error",
      text: `Invalid ${type.toUpperCase()}: ${castError(e)}`
    });
    return;
  }
  if (hl.nodePopulation[root] === 0) {
    postLog({ type: "error", text: "Pattern is empty." });
    return;
  }
  hl.loadRoot(root);
  finalizeLoad(`Loaded ${label}.`);
}

function finalizeLoad(outputText: string) {
  hl.gc();
  dirty = true;
  fit();
  postMetrics();
  postLog({ type: "output", text: outputText });
  logGc();
}

function fileType(filename: string) {
  return filename.toLowerCase().endsWith(".mc") ? "mc" : "rle";
}

function castError(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

function step(): void {
  hl.step();
  if (hl.cacheSize() > hl.CACHE_MAX) {
    hl.gc();
    logGc();
  }
  dirty = true;
}

function fpsTick(now: number): void {
  if (lastFrameTime !== 0) {
    const instant = 1000 / (now - lastFrameTime);
    fps = fps === 0 ? instant : fps + FPS_SMOOTHING * (instant - fps);
  }
  lastFrameTime = now;
}

function tick(now: number): void {
  if (playing) {
    step();
    fpsTick(now);
  }
  if (ready && dirty) {
    gfx.render(hl.root);
    dirty = false;
  }
  if (playing && now - lastMetricsPost >= METRICS_INTERVAL_MS) {
    postMetrics();
    lastMetricsPost = now;
  }
  self.requestAnimationFrame(tick);
}

self.requestAnimationFrame(tick);

self.onmessage = (e: MessageEvent<MainToWorker>) => {
  const msg = e.data;
  if (!ready && msg.type !== "init") return;
  switch (msg.type) {
    case "init":
      gfx.init(msg.offscreen);
      gfx.updateView(msg.view);
      ready = true;
      dirty = true;
      postLog({
        type: "system",
        text: "Hashlife worker initialized.",
        silent: true
      });
      break;
    case "resize":
      gfx.updateView(msg.view);
      dirty = true;
      break;
    case "panBy":
      panBy(msg.dx, msg.dy);
      break;
    case "zoomBy":
      zoomBy(msg.x, msg.y, msg.factor);
      break;
    case "paintAt":
      paintAt(msg.x, msg.y, msg.alive);
      break;
    case "setQuadOverlay":
      gfx.setQuadOverlay(msg.enabled);
      dirty = true;
      break;
    case "play":
      if (!playing) {
        playing = true;
        lastFrameTime = 0;
        lastMetricsPost = 0;
        postMetrics();
      }
      break;
    case "pause":
      if (playing) {
        pauseInternal();
        postMetrics();
      }
      break;
    case "stepOnce":
      step();
      postMetrics();
      break;
    case "setStepExp":
      hl.setStepExp(msg.stepExp);
      break;
    case "clear":
      pauseInternal();
      hl.clear();
      hl.gc();
      dirty = true;
      postMetrics();
      postBounds(null);
      postLog({ type: "output", text: "Cleared universe." });
      logGc();
      break;
    case "collectGarbage":
      hl.gc();
      postMetrics();
      logGc();
      break;
    case "fit":
      fit();
      break;
    case "loadPreset":
      pauseInternal();
      loadPreset(msg.filename);
      break;
    case "loadRleText":
      pauseInternal();
      loadRleText(msg.text);
      break;
    case "loadFile":
      pauseInternal();
      loadFile(msg.file);
      break;
    case "loadSoup":
      pauseInternal();
      loadSoup(msg.size, msg.density);
      break;
  }
};
