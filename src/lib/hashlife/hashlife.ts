import { DEFAULT_STEP_EXP, INITIAL_LEVEL, MAX_STEP_EXP } from "@/shared";

export type Node = number;

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const DEAD: Node = 0;
export const ALIVE: Node = 1;

// chained hash table of canonical nodes
const CACHE_SIZE = 1 << 24;
const CACHE_MASK = CACHE_SIZE - 1;
export const CACHE_MAX = (CACHE_SIZE * 0.9) | 0;
const cache = new Int32Array(CACHE_SIZE).fill(-1);

let nodeCap = 4096;
export let nodeLevel = new Uint8Array(nodeCap);
export let nodeNw = new Uint32Array(nodeCap);
export let nodeNe = new Uint32Array(nodeCap);
export let nodeSw = new Uint32Array(nodeCap);
export let nodeSe = new Uint32Array(nodeCap);
export let nodeAlive = new Uint8Array(nodeCap);
export let nodePopulation = new Float64Array(nodeCap);
export let nodeResult = new Uint32Array(nodeCap);
export let nodeResultJ = new Int16Array(nodeCap).fill(-1);
export let nodeNext = new Int32Array(nodeCap).fill(-1);

nodeAlive[ALIVE] = 1;
nodePopulation[ALIVE] = 1;

let nextId = 2;

const GENERATION_INCREMENTS = Array.from(
  { length: MAX_STEP_EXP + 1 },
  (_, exp) => 1n << BigInt(exp)
);

// emptyCache[L] = canonical fully-dead node at level L
const emptyCache: Node[] = [];

// transient buffers for gc() (mark bitmap, reachable set, traversal stack)
let mark: Uint8Array = new Uint8Array(0);
let remap: Uint32Array = new Uint32Array(0);
const reachable: Node[] = [];
const gcStack: Node[] = [];

// live exports (current value on each read)
export let generation = 0n;
export let root: Node = emptyNode(INITIAL_LEVEL);
export let stepExp = DEFAULT_STEP_EXP;

export function cacheSize() {
  return nextId - 2;
}

// LEVEL1[bits] = canonical level-1 node for a 4-bit child mask
const LEVEL1 = Array.from({ length: 16 }, (_, b) => {
  const node = makeNode(
    b & 1 ? ALIVE : DEAD,
    b & 2 ? ALIVE : DEAD,
    b & 4 ? ALIVE : DEAD,
    b & 8 ? ALIVE : DEAD
  );
  nodeAlive[node] = b;
  return node;
});

// Conway base case: index = four packed level-1 quadrants (NW | NE<<4 | SW<<8 | SE<<12),
// value = canonical level-1 next-state node (a LEVEL1 entry).
const BASE_TABLE = (() => {
  const NBS0 = [0, 1, 4, 2, 6, 8, 9, 12];
  const NBS1 = [1, 4, 5, 3, 7, 9, 12, 13];
  const NBS2 = [2, 3, 6, 8, 12, 10, 11, 14];
  const NBS3 = [3, 6, 7, 9, 13, 11, 14, 15];
  const cell = (b: number, self: number, nbs: readonly number[]) => {
    let n = 0;
    for (let i = 0; i < 8; i++) n += (b >> nbs[i]) & 1;
    const alive = (b >> self) & 1;
    return alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
  };
  const table = new Uint32Array(1 << 16);
  for (let b = 0; b < table.length; b++) {
    const out =
      cell(b, 3, NBS0) |
      (cell(b, 6, NBS1) << 1) |
      (cell(b, 9, NBS2) << 2) |
      (cell(b, 12, NBS3) << 3);
    table[b] = LEVEL1[out];
  }
  return table;
})();

export function makeNode(nw: Node, ne: Node, sw: Node, se: Node): Node {
  const h = (((((nw * 23) ^ ne) * 23) ^ sw) * 23) ^ se;
  const idx = h & CACHE_MASK;
  const head = cache[idx];
  const nws = nodeNw;
  const nes = nodeNe;
  const sws = nodeSw;
  const ses = nodeSe;
  const next = nodeNext;
  for (let n = head; n !== -1; n = next[n]) {
    if (nws[n] === nw && nes[n] === ne && sws[n] === sw && ses[n] === se) {
      return n;
    }
  }
  const node = nextId++;
  if (node >= nodeCap) growNodeStorage(node + 1);
  nodeNw[node] = nw;
  nodeNe[node] = ne;
  nodeSw[node] = sw;
  nodeSe[node] = se;
  nodeLevel[node] = nodeLevel[nw] + 1;
  nodePopulation[node] =
    nodePopulation[nw] +
    nodePopulation[ne] +
    nodePopulation[sw] +
    nodePopulation[se];
  nodeNext[node] = head;
  cache[idx] = node;
  return node;
}

function growNodeStorage(minCap: number): void {
  let cap = nodeCap;
  while (cap < minCap) cap *= 2;

  const level = new Uint8Array(cap);
  const nw = new Uint32Array(cap);
  const ne = new Uint32Array(cap);
  const sw = new Uint32Array(cap);
  const se = new Uint32Array(cap);
  const alive = new Uint8Array(cap);
  const population = new Float64Array(cap);
  const result = new Uint32Array(cap);
  const resultJ = new Int16Array(cap);
  const next = new Int32Array(cap);

  level.set(nodeLevel);
  nw.set(nodeNw);
  ne.set(nodeNe);
  sw.set(nodeSw);
  se.set(nodeSe);
  alive.set(nodeAlive);
  population.set(nodePopulation);
  result.set(nodeResult);
  resultJ.set(nodeResultJ);
  resultJ.fill(-1, nodeCap);
  next.set(nodeNext);
  next.fill(-1, nodeCap);

  nodeCap = cap;
  nodeLevel = level;
  nodeNw = nw;
  nodeNe = ne;
  nodeSw = sw;
  nodeSe = se;
  nodeAlive = alive;
  nodePopulation = population;
  nodeResult = result;
  nodeResultJ = resultJ;
  nodeNext = next;
}

// Mark/sweep from root, emptyCache, and result links; rebuild cache chains
export function gc(): void {
  if (mark.length < nextId) {
    let cap = mark.length || 4096;
    while (cap < nextId) cap *= 2;
    mark = new Uint8Array(cap);
  }
  if (remap.length < nextId) {
    let cap = remap.length || 4096;
    while (cap < nextId) cap *= 2;
    remap = new Uint32Array(cap);
  }
  remap.fill(0, 0, nextId);
  remap[ALIVE] = ALIVE;
  gcStack.push(root);
  for (const e of emptyCache) if (e) gcStack.push(e);
  for (const n of LEVEL1) gcStack.push(n);
  const levels = nodeLevel;
  const nws = nodeNw;
  const nes = nodeNe;
  const sws = nodeSw;
  const ses = nodeSe;
  const results = nodeResult;
  const alives = nodeAlive;
  const populations = nodePopulation;
  const resultJs = nodeResultJ;
  while (gcStack.length > 0) {
    const n = gcStack.pop()!;
    if (levels[n] === 0 || mark[n]) continue;
    mark[n] = 1;
    reachable.push(n);
    gcStack.push(nws[n], nes[n], sws[n], ses[n]);
    const result = results[n];
    if (result !== 0) gcStack.push(result);
  }

  for (let i = 0; i < reachable.length; i++) {
    const old = reachable[i];
    remap[old] = i + 2;
  }

  const level = new Uint8Array(nodeCap);
  const nw = new Uint32Array(nodeCap);
  const ne = new Uint32Array(nodeCap);
  const sw = new Uint32Array(nodeCap);
  const se = new Uint32Array(nodeCap);
  const alive = new Uint8Array(nodeCap);
  const population = new Float64Array(nodeCap);
  const result = new Uint32Array(nodeCap);
  const resultJ = new Int16Array(nodeCap).fill(-1);
  const next = new Int32Array(nodeCap);
  alive[ALIVE] = 1;
  population[ALIVE] = 1;

  for (let i = 0; i < reachable.length; i++) {
    const old = reachable[i];
    const id = i + 2;
    mark[old] = 0;
    level[id] = levels[old];
    nw[id] = remap[nws[old]];
    ne[id] = remap[nes[old]];
    sw[id] = remap[sws[old]];
    se[id] = remap[ses[old]];
    alive[id] = alives[old];
    population[id] = populations[old];
    const oldResult = results[old];
    result[id] = oldResult === 0 ? 0 : remap[oldResult];
    resultJ[id] = resultJs[old];
  }

  root = root < 2 ? root : remap[root];
  for (let i = 0; i < emptyCache.length; i++) {
    const e = emptyCache[i];
    if (e) emptyCache[i] = remap[e];
  }
  for (let i = 0; i < LEVEL1.length; i++) LEVEL1[i] = remap[LEVEL1[i]];
  for (let i = 0; i < BASE_TABLE.length; i++)
    BASE_TABLE[i] = remap[BASE_TABLE[i]];

  nodeLevel = level;
  nodeNw = nw;
  nodeNe = ne;
  nodeSw = sw;
  nodeSe = se;
  nodeAlive = alive;
  nodePopulation = population;
  nodeResult = result;
  nodeResultJ = resultJ;
  nodeNext = next;

  nextId = reachable.length + 2;
  cache.fill(-1);
  for (let id = 2; id < nextId; id++) {
    const idx =
      ((((((nw[id] * 23) ^ ne[id]) * 23) ^ sw[id]) * 23) ^ se[id]) & CACHE_MASK;
    next[id] = cache[idx];
    cache[idx] = id;
  }
  reachable.length = 0;
}

export function emptyNode(level: number): Node {
  if (level === 0) return DEAD;
  const cached = emptyCache[level];
  if (cached) return cached;
  const c = emptyNode(level - 1);
  return (emptyCache[level] = makeNode(c, c, c, c));
}

// empty border one level wider, centered on n
export function expand(n: Node): Node {
  const level = nodeLevel[n];
  if (level === 0) return LEVEL1[nodeAlive[n] << 3];
  const e = emptyNode(level - 1);
  return makeNode(
    makeNode(e, e, e, nodeNw[n]),
    makeNode(e, e, nodeNe[n], e),
    makeNode(e, nodeSw[n], e, e),
    makeNode(nodeSe[n], e, e, e)
  );
}

// central 2^(L-1) block after 2^(L-2) ticks
function computeFast(n: Node): Node {
  const level = nodeLevel[n];
  const j = level - 2;
  if (nodeResultJ[n] === j) return nodeResult[n];

  let result: Node;
  const nws = nodeNw;
  const nes = nodeNe;
  const sws = nodeSw;
  const ses = nodeSe;
  const nw = nws[n],
    ne = nes[n],
    sw = sws[n],
    se = ses[n];
  if (level === 2) {
    const alive = nodeAlive;
    const bits =
      alive[nw] | (alive[ne] << 4) | (alive[sw] << 8) | (alive[se] << 12);
    result = BASE_TABLE[bits];
  } else {
    const nwne = nes[nw],
      nwsw = sws[nw],
      nwse = ses[nw];
    const nenw = nws[ne],
      nesw = sws[ne],
      nese = ses[ne];
    const swnw = nws[sw],
      swne = nes[sw],
      swse = ses[sw];
    const senw = nws[se],
      sene = nes[se],
      sesw = sws[se];
    const m00 = computeFast(nw);
    const m01 = computeFast(makeNode(nwne, nenw, nwse, nesw));
    const m02 = computeFast(ne);
    const m10 = computeFast(makeNode(nwsw, nwse, swnw, swne));
    const m11 = computeFast(makeNode(nwse, nesw, swne, senw));
    const m12 = computeFast(makeNode(nesw, nese, senw, sene));
    const m20 = computeFast(sw);
    const m21 = computeFast(makeNode(swne, senw, swse, sesw));
    const m22 = computeFast(se);
    const o0 = computeFast(makeNode(m00, m01, m10, m11));
    const o1 = computeFast(makeNode(m01, m02, m11, m12));
    const o2 = computeFast(makeNode(m10, m11, m20, m21));
    const o3 = computeFast(makeNode(m11, m12, m21, m22));
    result = makeNode(o0, o1, o2, o3);
  }

  nodeResult[n] = result;
  nodeResultJ[n] = j;
  return result;
}

// central 2^(L-1) block after 2^j ticks; needs level >= 2 and j <= L-2
export function compute(n: Node, j: number): Node {
  if (nodeResultJ[n] === j) return nodeResult[n];
  if (j === nodeLevel[n] - 2) return computeFast(n);

  const nws = nodeNw;
  const nes = nodeNe;
  const sws = nodeSw;
  const ses = nodeSe;
  const nw = nws[n],
    ne = nes[n],
    sw = sws[n],
    se = ses[n];
  const nwnw = nws[nw],
    nwne = nes[nw],
    nwsw = sws[nw],
    nwse = ses[nw];
  const nenw = nws[ne],
    nene = nes[ne],
    nesw = sws[ne],
    nese = ses[ne];
  const swnw = nws[sw],
    swne = nes[sw],
    swsw = sws[sw],
    swse = ses[sw];
  const senw = nws[se],
    sene = nes[se],
    sesw = sws[se],
    sese = ses[se];
  const m00 = makeNode(ses[nwnw], sws[nwne], nes[nwsw], nws[nwse]);
  const m01 = makeNode(ses[nwne], sws[nenw], nes[nwse], nws[nesw]);
  const m02 = makeNode(ses[nenw], sws[nene], nes[nesw], nws[nese]);
  const m10 = makeNode(ses[nwsw], sws[nwse], nes[swnw], nws[swne]);
  const m11 = makeNode(ses[nwse], sws[nesw], nes[swne], nws[senw]);
  const m12 = makeNode(ses[nesw], sws[nese], nes[senw], nws[sene]);
  const m20 = makeNode(ses[swnw], sws[swne], nes[swsw], nws[swse]);
  const m21 = makeNode(ses[swne], sws[senw], nes[swse], nws[sesw]);
  const m22 = makeNode(ses[senw], sws[sene], nes[sesw], nws[sese]);
  const o0 = compute(makeNode(m00, m01, m10, m11), j);
  const o1 = compute(makeNode(m01, m02, m11, m12), j);
  const o2 = compute(makeNode(m10, m11, m20, m21), j);
  const o3 = compute(makeNode(m11, m12, m21, m22), j);
  const result = makeNode(o0, o1, o2, o3);

  nodeResult[n] = result;
  nodeResultJ[n] = j;
  return result;
}

export function setCell(x: number, y: number, alive: 0 | 1 = 1) {
  while (!contains(x, y)) root = expand(root);
  root = setCellAt(root, x, y, alive);
}

export function setStepExp(exp: number): void {
  stepExp = exp;
}

// 2^stepExp ticks; pad so everything lives inside inner 2^(L-2) before compute
export function step() {
  const j = stepExp;
  const minLevel = j + 3;
  let r = root;
  while (nodeLevel[r] < minLevel || !hasEmptyBorder(r)) r = expand(r);
  root = compute(r, j);
  generation += GENERATION_INCREMENTS[j];
}

// bbox of all live cells, or null
export function bounds(): Bounds | null {
  if (nodePopulation[root] === 0) return null;
  const levels = nodeLevel;
  const populations = nodePopulation;
  const nws = nodeNw;
  const nes = nodeNe;
  const sws = nodeSw;
  const ses = nodeSe;
  const half = 2 ** (levels[root] - 1);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const walk = (n: Node, x: number, y: number): void => {
    if (populations[n] === 0) return;
    const level = levels[n];
    if (level === 0) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    const size = 2 ** level;
    if (
      x >= minX &&
      x + size - 1 <= maxX &&
      y >= minY &&
      y + size - 1 <= maxY
    ) {
      return;
    }
    const h = size / 2;
    // NW/SE first pins all four extremes; NE/SW then usually prune.
    walk(nws[n], x, y);
    walk(ses[n], x + h, y + h);
    walk(nes[n], x + h, y);
    walk(sws[n], x, y + h);
  };
  walk(root, -half, -half);
  return { minX, minY, maxX, maxY };
}

export function loadRoot(r: Node) {
  root = r;
  generation = 0n;
}

export function clear() {
  loadRoot(emptyNode(INITIAL_LEVEL));
}

function contains(x: number, y: number) {
  const half = 2 ** (nodeLevel[root] - 1);
  return x >= -half && x < half && y >= -half && y < half;
}

function setCellAt(n: Node, x: number, y: number, alive: 0 | 1): Node {
  const level = nodeLevel[n];
  if (level === 0) return alive ? ALIVE : DEAD;
  if (level === 1) {
    const bit = (x >= 0 ? 1 : 0) | (y >= 0 ? 2 : 0);
    const mask = 1 << bit;
    return LEVEL1[(nodeAlive[n] & ~mask) | (alive ? mask : 0)];
  }
  const o = 2 ** (level - 2);
  const nw = nodeNw[n],
    ne = nodeNe[n],
    sw = nodeSw[n],
    se = nodeSe[n];
  if (x < 0 && y < 0) {
    return makeNode(setCellAt(nw, x + o, y + o, alive), ne, sw, se);
  }
  if (x >= 0 && y < 0) {
    return makeNode(nw, setCellAt(ne, x - o, y + o, alive), sw, se);
  }
  if (x < 0 && y >= 0) {
    return makeNode(nw, ne, setCellAt(sw, x + o, y - o, alive), se);
  }
  return makeNode(nw, ne, sw, setCellAt(se, x - o, y - o, alive));
}

// depth-2 padding: live cells only in each quadrant's innermost 2x2 sub-block
function hasEmptyBorder(n: Node) {
  const nws = nodeNw;
  const nes = nodeNe;
  const sws = nodeSw;
  const ses = nodeSe;
  const populations = nodePopulation;
  const nw = nws[n],
    ne = nes[n],
    sw = sws[n],
    se = ses[n];
  return (
    populations[nw] === populations[ses[ses[nw]]] &&
    populations[ne] === populations[sws[sws[ne]]] &&
    populations[sw] === populations[nes[nes[sw]]] &&
    populations[se] === populations[nws[nws[se]]]
  );
}
