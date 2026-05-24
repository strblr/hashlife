import { DEFAULT_CAMERA, DEFAULT_SHOW_QUADS } from "@/shared";
import {
  nodeLevel,
  nodeNe,
  nodeNw,
  nodePopulation,
  nodeSe,
  nodeSw,
  type Node
} from "./hashlife";

// colors

const COLOR_BG = [0x05 / 255, 0x05 / 255, 0x05 / 255, 1];
const COLOR_FG = [0x00 / 255, 0xed / 255, 0x3f / 255, 1];
const COLOR_BORDER = [0x20 / 255, 0x20 / 255, 0x20 / 255, 1];
const COLOR_QUAD = [0xd8 / 255, 0xd8 / 255, 0xd8 / 255, 0.2];

// thresholds (CSS px per cell)

const GRID_THRESHOLD_CSS = 8;
const DOT_THRESHOLD_CSS = 1;
const QUAD_LINE_WIDTH_CSS = 1;

export interface Camera {
  cellSize: number;
  cellX: number;
  cellY: number;
}

export interface Viewport {
  w: number;
  h: number;
  dpr: number;
}

export let camera: Camera = DEFAULT_CAMERA;
export let view: Viewport = { w: 0, h: 0, dpr: 1 };
export let showQuads = DEFAULT_SHOW_QUADS;

// gl state (set in init)

let canvas!: OffscreenCanvas;
let gl!: WebGL2RenderingContext;
let cellProg!: WebGLProgram;
let gridProg!: WebGLProgram;
let quadProg!: WebGLProgram;
let cellU!: Record<"invHalfRes" | "pad" | "color", WebGLUniformLocation>;
let gridU!: Record<
  "res" | "cellPx" | "phase" | "bg" | "line",
  WebGLUniformLocation
>;
let quadU!: Record<"invHalfRes" | "linePx" | "color", WebGLUniformLocation>;
let instBuf!: WebGLBuffer;
let cellVAO!: WebGLVertexArrayObject;
let gridVAO!: WebGLVertexArrayObject;
let quadVAO!: WebGLVertexArrayObject;
let instBytes = 0;

// tree-walk scratch

let g_data = new Float32Array(0);
let g_len = 0;
let g_cap = 0;
let g_fbW = 0;
let g_fbH = 0;
let g_dotPx = 1;
let g_cacheId = 0;
let g_px = camera.cellSize * view.dpr;
let g_showGrid = camera.cellSize >= GRID_THRESHOLD_CSS;

let gfxCap = 4096;
let gfxCache = new Uint32Array(gfxCap);
let gfxOffset = new Uint32Array(gfxCap);
let gfxLen = new Uint32Array(gfxCap);
let gfxX = new Float64Array(gfxCap);
let gfxY = new Float64Array(gfxCap);

export function init(c: OffscreenCanvas) {
  canvas = c;
  const ctx = canvas.getContext("webgl2", {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: true,
    powerPreference: "high-performance"
  });
  if (!ctx) throw new Error("WebGL2 not supported");
  gl = ctx;
  gl.clearColor(COLOR_BG[0], COLOR_BG[1], COLOR_BG[2], COLOR_BG[3]);

  cellProg = link(VS_CELL, FS_CELL);
  gridProg = link(VS_GRID, FS_GRID);
  quadProg = link(VS_QUAD, FS_QUAD);

  cellU = {
    invHalfRes: must(gl.getUniformLocation(cellProg, "u_invHalfRes")),
    pad: must(gl.getUniformLocation(cellProg, "u_pad")),
    color: must(gl.getUniformLocation(cellProg, "u_color"))
  };
  gridU = {
    res: must(gl.getUniformLocation(gridProg, "u_res")),
    cellPx: must(gl.getUniformLocation(gridProg, "u_cellPx")),
    phase: must(gl.getUniformLocation(gridProg, "u_phase")),
    bg: must(gl.getUniformLocation(gridProg, "u_bg")),
    line: must(gl.getUniformLocation(gridProg, "u_line"))
  };
  quadU = {
    invHalfRes: must(gl.getUniformLocation(quadProg, "u_invHalfRes")),
    linePx: must(gl.getUniformLocation(quadProg, "u_linePx")),
    color: must(gl.getUniformLocation(quadProg, "u_color"))
  };

  gl.useProgram(gridProg);
  gl.uniform4fv(gridU.bg, COLOR_BG);
  gl.uniform4fv(gridU.line, COLOR_BORDER);
  gl.useProgram(cellProg);
  gl.uniform4fv(cellU.color, COLOR_FG);
  gl.useProgram(quadProg);
  gl.uniform4fv(quadU.color, COLOR_QUAD);

  // Triangle-strip unit quad: (0,0) (1,0) (0,1) (1,1).
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const ringBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ringBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0,
      0, 0, 0, 0, 1
    ]),
    gl.STATIC_DRAW
  );

  instBuf = gl.createBuffer();

  // Cell VAO: a_corner per-vertex (divisor 0), a_inst per-instance (divisor 1)
  cellVAO = gl.createVertexArray();
  gl.bindVertexArray(cellVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  const cellCorner = gl.getAttribLocation(cellProg, "a_corner");
  gl.enableVertexAttribArray(cellCorner);
  gl.vertexAttribPointer(cellCorner, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  const cellInst = gl.getAttribLocation(cellProg, "a_inst");
  gl.enableVertexAttribArray(cellInst);
  gl.vertexAttribPointer(cellInst, 3, gl.FLOAT, false, 12, 0);
  gl.vertexAttribDivisor(cellInst, 1);

  // Grid VAO: a_corner per-vertex (divisor 0)
  gridVAO = gl.createVertexArray();
  gl.bindVertexArray(gridVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  const gridCorner = gl.getAttribLocation(gridProg, "a_corner");
  gl.enableVertexAttribArray(gridCorner);
  gl.vertexAttribPointer(gridCorner, 2, gl.FLOAT, false, 0, 0);

  // Quad overlay VAO: hollow-ring geometry; rasterizes only the border band.
  quadVAO = gl.createVertexArray();
  gl.bindVertexArray(quadVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, ringBuf);
  const quadVert = gl.getAttribLocation(quadProg, "a_vert");
  gl.enableVertexAttribArray(quadVert);
  gl.vertexAttribPointer(quadVert, 3, gl.FLOAT, false, 12, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  const quadInst = gl.getAttribLocation(quadProg, "a_inst");
  gl.enableVertexAttribArray(quadInst);
  gl.vertexAttribPointer(quadInst, 3, gl.FLOAT, false, 12, 0);
  gl.vertexAttribDivisor(quadInst, 1);

  gl.bindVertexArray(null);
}

export function updateView(v: Viewport): void {
  view = v;
  g_fbW = Math.max(1, Math.round(view.w * view.dpr));
  g_fbH = Math.max(1, Math.round(view.h * view.dpr));
  canvas.width = g_fbW;
  canvas.height = g_fbH;
  g_dotPx = DOT_THRESHOLD_CSS * view.dpr;
  gl.viewport(0, 0, g_fbW, g_fbH);
  gl.useProgram(gridProg);
  gl.uniform2f(gridU.res, g_fbW, g_fbH);
  gl.useProgram(cellProg);
  gl.uniform2f(cellU.invHalfRes, 2 / g_fbW, 2 / g_fbH);
  gl.useProgram(quadProg);
  gl.uniform2f(quadU.invHalfRes, 2 / g_fbW, 2 / g_fbH);
  gl.uniform1f(quadU.linePx, QUAD_LINE_WIDTH_CSS * view.dpr);
  updateCamera(camera);
}

export function updateCamera(c: Camera): void {
  camera = c;
  g_px = camera.cellSize * view.dpr;
  g_showGrid = camera.cellSize >= GRID_THRESHOLD_CSS;
  const phaseX = (Math.ceil(camera.cellX) - camera.cellX) * g_px;
  const phaseY = (Math.ceil(camera.cellY) - camera.cellY) * g_px;
  gl.useProgram(gridProg);
  gl.uniform1f(gridU.cellPx, g_px);
  gl.uniform2f(gridU.phase, phaseX, phaseY);
  gl.useProgram(cellProg);
  gl.uniform1f(cellU.pad, g_showGrid ? view.dpr : 0);
}

export function setQuadOverlay(enabled: boolean): void {
  showQuads = enabled;
}

export function render(root: Node): void {
  if (g_showGrid) {
    gl.useProgram(gridProg);
    gl.bindVertexArray(gridVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  } else {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  const rootLevel = nodeLevel[root];
  const size = 2 ** rootLevel;
  const half = size * 0.5;
  const nodeX = (-half - camera.cellX) * g_px;
  const nodeY = (-half - camera.cellY) * g_px;
  const screenSize = size * g_px;

  g_len = 0;
  g_cacheId++;
  emit(root, nodeX, nodeY, screenSize);

  if (g_len > 0) {
    uploadInstances();
    gl.useProgram(cellProg);
    gl.bindVertexArray(cellVAO);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, g_len / 3);
  }

  if (showQuads && rootLevel > 0 && screenSize >= g_dotPx) {
    g_len = 0;
    g_cacheId++;
    emitQuad(root, nodeX, nodeY, screenSize);

    if (g_len === 0) return;
    uploadInstances();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(quadProg);
    gl.bindVertexArray(quadVAO);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 10, g_len / 3);
    gl.disable(gl.BLEND);
  }
}

function emit(n: Node, nodeX: number, nodeY: number, screenSize: number): void {
  const nodeR = nodeX + screenSize;
  const nodeB = nodeY + screenSize;
  if (
    nodePopulation[n] === 0 ||
    nodeX >= g_fbW ||
    nodeY >= g_fbH ||
    nodeR <= 0 ||
    nodeB <= 0
  ) {
    return;
  }

  if (nodeLevel[n] === 0 || screenSize < g_dotPx) {
    const o = g_len;
    const end = o + 3;
    if (end > g_cap) growData(end);
    g_data[o] = nodeX;
    g_data[o + 1] = nodeY;
    g_data[o + 2] = screenSize;
    g_len = end;
    return;
  }

  if (nodeX >= 0 && nodeY >= 0 && nodeR <= g_fbW && nodeB <= g_fbH) {
    emitInside(n, nodeX, nodeY, screenSize);
    return;
  }

  const half = screenSize * 0.5;
  const xh = nodeX + half;
  const yh = nodeY + half;
  emit(nodeNw[n], nodeX, nodeY, half);
  emit(nodeNe[n], xh, nodeY, half);
  emit(nodeSw[n], nodeX, yh, half);
  emit(nodeSe[n], xh, yh, half);
}

function emitInside(
  n: Node,
  nodeX: number,
  nodeY: number,
  screenSize: number
): void {
  if (nodePopulation[n] === 0) return;

  if (nodeLevel[n] === 0 || screenSize < g_dotPx) {
    const o = g_len;
    const end = o + 3;
    if (end > g_cap) growData(end);
    g_data[o] = nodeX;
    g_data[o + 1] = nodeY;
    g_data[o + 2] = screenSize;
    g_len = end;
    return;
  }

  // Memo hit: copy the first occurrence's already-emitted g_data slice
  if (n >= gfxCap) growGfx(n + 1);
  if (gfxCache[n] === g_cacheId) {
    const len = gfxLen[n];
    const outEnd = g_len + len;
    if (outEnd > g_cap) growData(outEnd);
    const data = g_data;
    let src = gfxOffset[n];
    const end = src + len;
    const dx = nodeX - gfxX[n];
    const dy = nodeY - gfxY[n];
    let o = g_len;
    while (src < end) {
      data[o] = data[src] + dx;
      data[o + 1] = data[src + 1] + dy;
      data[o + 2] = data[src + 2];
      src += 3;
      o += 3;
    }
    g_len = outEnd;
    return;
  }

  // Memo miss: recurse normally, then record the g_data slice
  const start = g_len;
  const half = screenSize * 0.5;
  const xh = nodeX + half;
  const yh = nodeY + half;
  emitInside(nodeNw[n], nodeX, nodeY, half);
  emitInside(nodeNe[n], xh, nodeY, half);
  emitInside(nodeSw[n], nodeX, yh, half);
  emitInside(nodeSe[n], xh, yh, half);
  gfxCache[n] = g_cacheId;
  gfxOffset[n] = start;
  gfxLen[n] = g_len - start;
  gfxX[n] = nodeX;
  gfxY[n] = nodeY;
}

function emitQuad(
  n: Node,
  nodeX: number,
  nodeY: number,
  screenSize: number
): void {
  const nodeR = nodeX + screenSize;
  const nodeB = nodeY + screenSize;
  if (
    nodePopulation[n] === 0 ||
    nodeX >= g_fbW ||
    nodeY >= g_fbH ||
    nodeR <= 0 ||
    nodeB <= 0
  ) {
    return;
  }

  if (nodeX >= 0 && nodeY >= 0 && nodeR <= g_fbW && nodeB <= g_fbH) {
    emitQuadInside(n, nodeX, nodeY, screenSize);
    return;
  }

  const o = g_len;
  const end = o + 3;
  if (end > g_cap) growData(end);
  g_data[o] = nodeX;
  g_data[o + 1] = nodeY;
  g_data[o + 2] = screenSize;
  g_len = end;

  const half = screenSize * 0.5;
  if (nodeLevel[n] === 1 || half < g_dotPx) return;
  const xh = nodeX + half;
  const yh = nodeY + half;
  emitQuad(nodeNw[n], nodeX, nodeY, half);
  emitQuad(nodeNe[n], xh, nodeY, half);
  emitQuad(nodeSw[n], nodeX, yh, half);
  emitQuad(nodeSe[n], xh, yh, half);
}

function emitQuadInside(
  n: Node,
  nodeX: number,
  nodeY: number,
  screenSize: number
): void {
  if (nodePopulation[n] === 0) return;

  // Memo hit: copy the first occurrence's already-emitted g_data slice
  if (n >= gfxCap) growGfx(n + 1);
  if (gfxCache[n] === g_cacheId) {
    const len = gfxLen[n];
    const outEnd = g_len + len;
    if (outEnd > g_cap) growData(outEnd);
    const data = g_data;
    let src = gfxOffset[n];
    const end = src + len;
    const dx = nodeX - gfxX[n];
    const dy = nodeY - gfxY[n];
    let o = g_len;
    while (src < end) {
      data[o] = data[src] + dx;
      data[o + 1] = data[src + 1] + dy;
      data[o + 2] = data[src + 2];
      src += 3;
      o += 3;
    }
    g_len = outEnd;
    return;
  }

  // Memo miss: recurse normally, then record the g_data slice
  const start = g_len;
  const o = g_len;
  const end = o + 3;
  if (end > g_cap) growData(end);
  g_data[o] = nodeX;
  g_data[o + 1] = nodeY;
  g_data[o + 2] = screenSize;
  g_len = end;

  const half = screenSize * 0.5;
  if (nodeLevel[n] > 1 && half >= g_dotPx) {
    const xh = nodeX + half;
    const yh = nodeY + half;
    emitQuadInside(nodeNw[n], nodeX, nodeY, half);
    emitQuadInside(nodeNe[n], xh, nodeY, half);
    emitQuadInside(nodeSw[n], nodeX, yh, half);
    emitQuadInside(nodeSe[n], xh, yh, half);
  }
  gfxCache[n] = g_cacheId;
  gfxOffset[n] = start;
  gfxLen[n] = g_len - start;
  gfxX[n] = nodeX;
  gfxY[n] = nodeY;
}

function uploadInstances() {
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  const needBytes = g_len * 4;
  if (needBytes > instBytes) {
    let nb = instBytes || 4096;
    while (nb < needBytes) nb *= 2;
    gl.bufferData(gl.ARRAY_BUFFER, nb, gl.STREAM_DRAW);
    instBytes = nb;
  }
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, g_data, 0, g_len);
}

function growData(n: number) {
  let nc = g_cap || 4096 * 3;
  while (nc < n) nc *= 2;
  const nd = new Float32Array(nc);
  if (g_len > 0) nd.set(g_data.subarray(0, g_len));
  g_data = nd;
  g_cap = nc;
}

function growGfx(n: number) {
  let nc = gfxCap;
  while (nc < n) nc *= 2;
  const cache = new Uint32Array(nc);
  const offset = new Uint32Array(nc);
  const len = new Uint32Array(nc);
  const x = new Float64Array(nc);
  const y = new Float64Array(nc);
  cache.set(gfxCache);
  offset.set(gfxOffset);
  len.set(gfxLen);
  x.set(gfxX);
  y.set(gfxY);
  gfxCap = nc;
  gfxCache = cache;
  gfxOffset = offset;
  gfxLen = len;
  gfxX = x;
  gfxY = y;
}

// shader helpers

function compile(type: number, src: string): WebGLShader {
  const s = must(gl.createShader(type));
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`Shader compile error: ${log}`);
  }
  return s;
}

function link(vsSrc: string, fsSrc: string): WebGLProgram {
  const vs = compile(gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`Program link error: ${log}`);
  }
  return p;
}

function must<T>(v: T | null): T {
  if (v === null) throw new Error("WebGL allocation failed");
  return v;
}

// shaders

// Inst: device-px x,y,size; u_pad gaps cells for grid; max(z,1) keeps sub-pixel quads visible.
const VS_CELL = `#version 300 es
in vec2 a_corner;
in vec3 a_inst;
uniform vec2 u_invHalfRes;
uniform float u_pad;
void main() {
  float s = max(a_inst.z - u_pad, 1.0);
  vec2 p = a_inst.xy + a_corner * s;
  vec2 ndc = p * u_invHalfRes - 1.0;
  gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
}`;

const FS_CELL = `#version 300 es
precision highp float;
uniform vec4 u_color;
out vec4 oColor;
void main() { oColor = u_color; }`;

// Fullscreen quad; grid is periodic in screen px only (avoids huge world coords in float32).
const VS_GRID = `#version 300 es
in vec2 a_corner;
uniform vec2 u_res;
out vec2 v_screen;
void main() {
  gl_Position = vec4(a_corner.x * 2.0 - 1.0, 1.0 - a_corner.y * 2.0, 0.0, 1.0);
  v_screen = a_corner * u_res;
}`;

// u_phase ∈ [0,u_cellPx): first grid line offset in screen px.
const FS_GRID = `#version 300 es
precision highp float;
in vec2 v_screen;
uniform float u_cellPx;
uniform vec2 u_phase;
uniform vec4 u_bg;
uniform vec4 u_line;
out vec4 oColor;
void main() {
  vec2 m = mod(v_screen - u_phase, u_cellPx);
  vec2 dist = min(m, u_cellPx - m);
  float l = min(dist.x, dist.y);
  float a = 1.0 - smoothstep(0.0, 1.0, l);
  oColor = mix(u_bg, u_line, a);
}`;

// Hollow-ring borders for optional quadtree overlay (band geometry in VS, MSAA edges).
// Relies on CPU invariant sizePx >= u_linePx (emit gate uses g_dotPx == u_linePx);
// at sizePx == u_linePx the inner ring naturally collapses to the cell center.
const VS_QUAD = `#version 300 es
in vec3 a_vert;
in vec3 a_inst;
uniform vec2 u_invHalfRes;
uniform float u_linePx;
void main() {
  vec2 corner = a_vert.xy;
  float h = u_linePx * 0.5;
  vec2 sgn = corner * 2.0 - 1.0;
  vec2 outer = corner * a_inst.z + sgn * h;
  vec2 inner = corner * a_inst.z - sgn * h;
  vec2 local = mix(outer, inner, a_vert.z);
  vec2 p = a_inst.xy + local;
  vec2 ndc = p * u_invHalfRes - 1.0;
  gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
}`;

const FS_QUAD = `#version 300 es
precision highp float;
uniform vec4 u_color;
out vec4 oColor;
void main() { oColor = u_color; }`;
