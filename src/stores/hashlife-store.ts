import { create } from "zustand";
import { useTerminalStore } from "@/stores";
import type {
  MainToWorker,
  WorkerToMain,
  Camera,
  Bounds,
  Viewport
} from "@/lib";
import {
  DEFAULT_STEP_EXP,
  DEFAULT_CAMERA,
  DEFAULT_SHOW_QUADS,
  INITIAL_LEVEL,
  MAX_STEP_EXP,
  STEP_OPTIONS
} from "@/shared";

export interface HashlifeStore {
  generation: bigint;
  population: number;
  cacheSize: number;
  fps: number;
  level: number;
  camera: Camera;
  bounds: Bounds | null;
  playing: boolean;
  stepExp: number;
  mode: "view" | "edit";
  quadOverlay: boolean;
  pointer: { sx: number; sy: number } | null;
  api: HashlifeApi;
}

export interface HashlifeApi {
  togglePlay(): void;
  stepOnce(): void;
  reset(): void;
  collectGarbage(): void;
  setStepExp(n: number): void;
  bumpStepExp(delta: number): void;
  toggleMode(): void;
  toggleQuadOverlay(): void;
  loadPreset(filename: string): void;
  loadRleText(text: string): void;
  loadFile(file: File): void;
  loadSoup(size: number, density: number): void;
  attachCanvas(canvas: HTMLCanvasElement, view: Viewport): void;
  resize(view: Viewport): void;
  fit(): void;
  panBy(dx: number, dy: number): void;
  zoomBy(x: number, y: number, factor: number): void;
  paintAt(x: number, y: number, alive: 0 | 1): void;
  setPointer(sx: number, sy: number): void;
  clearPointer(): void;
}

// Store

export const useHashlifeStore = create<HashlifeStore>(set => ({
  generation: 0n,
  population: 0,
  cacheSize: 0,
  fps: 0,
  level: INITIAL_LEVEL,
  camera: DEFAULT_CAMERA,
  bounds: null,
  playing: false,
  stepExp: DEFAULT_STEP_EXP,
  mode: "view",
  quadOverlay: DEFAULT_SHOW_QUADS,
  pointer: null,

  api: {
    togglePlay() {
      set(prev => {
        const playing = !prev.playing;
        post({ type: playing ? "play" : "pause" });
        return { playing, fps: !playing ? 0 : prev.fps };
      });
    },
    stepOnce() {
      post({ type: "stepOnce" });
    },
    reset() {
      set({ playing: false, fps: 0 });
      post({ type: "reset" });
    },
    collectGarbage() {
      post({ type: "collectGarbage" });
    },
    setStepExp(n) {
      n = Math.max(0, Math.min(MAX_STEP_EXP, Math.floor(n)));
      set({ stepExp: n });
      post({ type: "setStepExp", stepExp: n });
    },
    bumpStepExp(delta) {
      set(prev => {
        const idx = STEP_OPTIONS.indexOf(prev.stepExp);
        if (idx < 0) return prev;
        const next = STEP_OPTIONS[idx + delta];
        if (next === undefined) return prev;
        post({ type: "setStepExp", stepExp: next });
        return { stepExp: next };
      });
    },
    toggleMode() {
      set(prev => ({ mode: prev.mode === "view" ? "edit" : "view" }));
    },
    toggleQuadOverlay() {
      set(prev => {
        const quadOverlay = !prev.quadOverlay;
        post({ type: "setQuadOverlay", enabled: quadOverlay });
        return { quadOverlay };
      });
    },
    loadPreset(filename) {
      set({ playing: false, fps: 0 });
      post({ type: "loadPreset", filename });
    },
    loadRleText(text) {
      set({ playing: false, fps: 0 });
      post({ type: "loadRleText", text });
    },
    loadFile(file) {
      set({ playing: false, fps: 0 });
      post({ type: "loadFile", file });
    },
    loadSoup(size, density) {
      set({ playing: false, fps: 0 });
      post({ type: "loadSoup", size, density });
    },
    attachCanvas(canvas, view) {
      const offscreen = canvas.transferControlToOffscreen();
      post({ type: "init", offscreen, view }, [offscreen]);
    },
    resize(view) {
      post({ type: "resize", view });
    },
    fit() {
      post({ type: "fit" });
    },
    panBy(dx, dy) {
      post({ type: "panBy", dx, dy });
    },
    zoomBy(x, y, factor) {
      post({ type: "zoomBy", x, y, factor });
    },
    paintAt(x, y, alive) {
      post({ type: "paintAt", x, y, alive });
    },
    setPointer(sx, sy) {
      set({ pointer: { sx, sy } });
    },
    clearPointer() {
      set({ pointer: null });
    }
  }
}));

export const hashlifeApi = useHashlifeStore.getState().api;

// Worker

const worker = new Worker(
  new URL("../lib/hashlife/worker.ts", import.meta.url),
  { type: "module" }
);

function post(msg: MainToWorker, transfer?: Transferable[]): void {
  worker.postMessage(msg, transfer!);
}

worker.addEventListener("message", (e: MessageEvent<WorkerToMain>) => {
  const msg = e.data;
  switch (msg.type) {
    case "log":
      useTerminalStore.getState().addLine(msg.line);
      break;
    case "camera":
      useHashlifeStore.setState({ camera: msg.camera });
      break;
    case "bounds":
      useHashlifeStore.setState({ bounds: msg.bounds });
      break;
    case "metrics":
      useHashlifeStore.setState({
        generation: msg.generation,
        population: msg.population,
        cacheSize: msg.cacheSize,
        fps: msg.fps,
        level: msg.level
      });
      break;
  }
});
