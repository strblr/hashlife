import { DEFAULT_STEP_EXP, INITIAL_LEVEL, MAX_STEP_EXP } from "@/shared";

export interface Node {
  readonly level: number;
  readonly nw: Node | null; // null only on level-0 leaves
  readonly ne: Node | null;
  readonly sw: Node | null;
  readonly se: Node | null;
  alive: number; // level-0 bit, level-1 packed 2x2 mask, otherwise meaningless
  readonly population: number;
  id: number; // mutable: gc() compacts ids to keep mark bitmap bounded
  result: Node | null; // last compute() result; stale if resultJ != requested j
  resultJ: number;
  next: Node | null; // chain in cache bucket
  // Render memoization
  gfxCache: number;
  gfxOffset: number;
  gfxLen: number;
  gfxX: number;
  gfxY: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const DEAD: Node = {
  level: 0,
  nw: null,
  ne: null,
  sw: null,
  se: null,
  alive: 0,
  population: 0,
  id: 0,
  result: null,
  resultJ: -1,
  next: null,
  gfxCache: 0,
  gfxOffset: 0,
  gfxLen: 0,
  gfxX: Number.NaN,
  gfxY: Number.NaN
};

export const ALIVE: Node = {
  level: 0,
  nw: null,
  ne: null,
  sw: null,
  se: null,
  alive: 1,
  population: 1,
  id: 1,
  result: null,
  resultJ: -1,
  next: null,
  gfxCache: 0,
  gfxOffset: 0,
  gfxLen: 0,
  gfxX: Number.NaN,
  gfxY: Number.NaN
};

// chained hash table of canonical nodes
const CACHE_SIZE = 1 << 24;
const CACHE_MASK = CACHE_SIZE - 1;
export const CACHE_MAX = (CACHE_SIZE * 0.9) | 0;
const cache = new Array<Node | null>(CACHE_SIZE).fill(null);
let nextId = 2;

const GENERATION_INCREMENTS = Array.from(
  { length: MAX_STEP_EXP + 1 },
  (_, exp) => 1n << BigInt(exp)
);

// emptyCache[L] = canonical fully-dead node at level L
const emptyCache: Node[] = [];

// transient buffers for gc() (mark bitmap, reachable set, traversal stack)
let mark: Uint8Array = new Uint8Array(0);
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
  node.alive = b;
  return node;
});

// Conway base case: index = four packed level-1 quadrants (NW | NE<<4 | SW<<8 | SE<<12),
// value = canonical level-1 next-state node (a LEVEL1 entry).
const BASE_TABLE = (() => {
  const cell = (b: number, self: number, nbs: readonly number[]) => {
    let n = 0;
    for (let i = 0; i < 8; i++) n += (b >> nbs[i]) & 1;
    const alive = (b >> self) & 1;
    return alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
  };
  return Array.from({ length: 1 << 16 }, (_, b) => {
    const out =
      cell(b, 3, [0, 1, 4, 2, 6, 8, 9, 12]) |
      (cell(b, 6, [1, 4, 5, 3, 7, 9, 12, 13]) << 1) |
      (cell(b, 9, [2, 3, 6, 8, 12, 10, 11, 14]) << 2) |
      (cell(b, 12, [3, 6, 7, 9, 13, 11, 14, 15]) << 3);
    return LEVEL1[out];
  });
})();

export function makeNode(nw: Node, ne: Node, sw: Node, se: Node): Node {
  // Compact child-id mix (inlined: hottest call site)
  const h = (((((nw.id * 23) ^ ne.id) * 23) ^ sw.id) * 23) ^ se.id;
  const idx = h & CACHE_MASK;
  const head = cache[idx];
  for (let n = head; n !== null; n = n.next) {
    if (n.nw === nw && n.ne === ne && n.sw === sw && n.se === se) return n;
  }
  const node: Node = {
    level: nw.level + 1,
    nw,
    ne,
    sw,
    se,
    alive: 0,
    population: nw.population + ne.population + sw.population + se.population,
    id: nextId++,
    result: null,
    resultJ: -1,
    next: head,
    gfxCache: 0,
    gfxOffset: 0,
    gfxLen: 0,
    gfxX: Number.NaN,
    gfxY: Number.NaN
  };
  cache[idx] = node;
  return node;
}

function hashChildren(nw: Node, ne: Node, sw: Node, se: Node): number {
  return (((((nw.id * 23) ^ ne.id) * 23) ^ sw.id) * 23) ^ se.id;
}

// Mark/sweep from root, emptyCache, and result links; rebuild cache chains
export function gc(): void {
  if (mark.length < nextId) {
    let cap = mark.length || 4096;
    while (cap < nextId) cap *= 2;
    mark = new Uint8Array(cap);
  }
  gcStack.push(root);
  for (const e of emptyCache) if (e) gcStack.push(e);
  for (const n of LEVEL1) gcStack.push(n);
  while (gcStack.length > 0) {
    const n = gcStack.pop()!;
    if (n.level === 0 || mark[n.id]) continue;
    mark[n.id] = 1;
    reachable.push(n);
    gcStack.push(n.nw!, n.ne!, n.sw!, n.se!);
    if (n.result) gcStack.push(n.result);
  }
  // Clear mark (using old id) and compact id
  for (let i = 0; i < reachable.length; i++) {
    const n = reachable[i];
    mark[n.id] = 0;
    n.id = i + 2;
  }
  nextId = reachable.length + 2;
  cache.fill(null);
  for (let i = 0; i < reachable.length; i++) {
    const n = reachable[i];
    const idx = hashChildren(n.nw!, n.ne!, n.sw!, n.se!) & CACHE_MASK;
    n.next = cache[idx];
    cache[idx] = n;
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
  if (n.level === 0) return LEVEL1[n.alive << 3];
  const e = emptyNode(n.level - 1);
  return makeNode(
    makeNode(e, e, e, n.nw!),
    makeNode(e, e, n.ne!, e),
    makeNode(e, n.sw!, e, e),
    makeNode(n.se!, e, e, e)
  );
}

// central 2^(L-1) block after 2^(L-2) ticks
function computeFast(n: Node): Node {
  const j = n.level - 2;
  if (n.resultJ === j) return n.result!;

  let result: Node;
  if (n.level === 2) {
    const nw = n.nw!,
      ne = n.ne!,
      sw = n.sw!,
      se = n.se!;
    const bits =
      nw.alive | (ne.alive << 4) | (sw.alive << 8) | (se.alive << 12);
    result = BASE_TABLE[bits];
  } else {
    const nw = n.nw!,
      ne = n.ne!,
      sw = n.sw!,
      se = n.se!;
    const nwne = nw.ne!,
      nwsw = nw.sw!,
      nwse = nw.se!;
    const nenw = ne.nw!,
      nesw = ne.sw!,
      nese = ne.se!;
    const swnw = sw.nw!,
      swne = sw.ne!,
      swse = sw.se!;
    const senw = se.nw!,
      sene = se.ne!,
      sesw = se.sw!;
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

  n.result = result;
  n.resultJ = j;
  return result;
}

// central 2^(L-1) block after 2^j ticks; needs level >= 2 and j <= L-2
export function compute(n: Node, j: number): Node {
  if (n.resultJ === j) return n.result!;
  if (j === n.level - 2) return computeFast(n);

  const nw = n.nw!,
    ne = n.ne!,
    sw = n.sw!,
    se = n.se!;
  const nwnw = nw.nw!,
    nwne = nw.ne!,
    nwsw = nw.sw!,
    nwse = nw.se!;
  const nenw = ne.nw!,
    nene = ne.ne!,
    nesw = ne.sw!,
    nese = ne.se!;
  const swnw = sw.nw!,
    swne = sw.ne!,
    swsw = sw.sw!,
    swse = sw.se!;
  const senw = se.nw!,
    sene = se.ne!,
    sesw = se.sw!,
    sese = se.se!;
  const m00 = makeNode(nwnw.se!, nwne.sw!, nwsw.ne!, nwse.nw!);
  const m01 = makeNode(nwne.se!, nenw.sw!, nwse.ne!, nesw.nw!);
  const m02 = makeNode(nenw.se!, nene.sw!, nesw.ne!, nese.nw!);
  const m10 = makeNode(nwsw.se!, nwse.sw!, swnw.ne!, swne.nw!);
  const m11 = makeNode(nwse.se!, nesw.sw!, swne.ne!, senw.nw!);
  const m12 = makeNode(nesw.se!, nese.sw!, senw.ne!, sene.nw!);
  const m20 = makeNode(swnw.se!, swne.sw!, swsw.ne!, swse.nw!);
  const m21 = makeNode(swne.se!, senw.sw!, swse.ne!, sesw.nw!);
  const m22 = makeNode(senw.se!, sene.sw!, sesw.ne!, sese.nw!);
  const o0 = compute(makeNode(m00, m01, m10, m11), j);
  const o1 = compute(makeNode(m01, m02, m11, m12), j);
  const o2 = compute(makeNode(m10, m11, m20, m21), j);
  const o3 = compute(makeNode(m11, m12, m21, m22), j);
  const result = makeNode(o0, o1, o2, o3);

  n.result = result;
  n.resultJ = j;
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
  while (r.level < minLevel || !hasEmptyBorder(r)) r = expand(r);
  root = compute(r, j);
  generation += GENERATION_INCREMENTS[j];
}

// bbox of all live cells, or null
export function bounds(): Bounds | null {
  if (root.population === 0) return null;
  const half = 2 ** (root.level - 1);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const walk = (n: Node, x: number, y: number): void => {
    if (n.population === 0) return;
    if (n.level === 0) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    const size = 2 ** n.level;
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
    walk(n.nw!, x, y);
    walk(n.se!, x + h, y + h);
    walk(n.ne!, x + h, y);
    walk(n.sw!, x, y + h);
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
  const half = 2 ** (root.level - 1);
  return x >= -half && x < half && y >= -half && y < half;
}

function setCellAt(n: Node, x: number, y: number, alive: 0 | 1): Node {
  if (n.level === 0) return alive ? ALIVE : DEAD;
  if (n.level === 1) {
    const bit = (x >= 0 ? 1 : 0) | (y >= 0 ? 2 : 0);
    return LEVEL1[(n.alive & ~(1 << bit)) | (alive << bit)];
  }
  const o = 2 ** (n.level - 2);
  if (x < 0 && y < 0) {
    return makeNode(setCellAt(n.nw!, x + o, y + o, alive), n.ne!, n.sw!, n.se!);
  }
  if (x >= 0 && y < 0) {
    return makeNode(n.nw!, setCellAt(n.ne!, x - o, y + o, alive), n.sw!, n.se!);
  }
  if (x < 0 && y >= 0) {
    return makeNode(n.nw!, n.ne!, setCellAt(n.sw!, x + o, y - o, alive), n.se!);
  }
  return makeNode(n.nw!, n.ne!, n.sw!, setCellAt(n.se!, x - o, y - o, alive));
}

// depth-2 padding: live cells only in each quadrant's innermost 2x2 sub-block
function hasEmptyBorder(n: Node) {
  const nw = n.nw!,
    ne = n.ne!,
    sw = n.sw!,
    se = n.se!;
  return (
    nw.population === nw.se!.se!.population &&
    ne.population === ne.sw!.sw!.population &&
    sw.population === sw.ne!.ne!.population &&
    se.population === se.nw!.nw!.population
  );
}
