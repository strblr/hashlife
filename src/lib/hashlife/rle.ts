import { ALIVE, DEAD, emptyNode, makeNode, type Node } from "./hashlife";
import { INITIAL_LEVEL } from "@/shared";

const HEADER_RE =
  /x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+)(?:\s*,\s*rule\s*=\s*([^\s,]+))?/i;

export function parseRLE(rle: string) {
  let width = 0;
  let height = 0;
  let rule: string | undefined;
  let body = "";

  for (const rawLine of rle.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (!body && /^x\s*=/i.test(line)) {
      const m = HEADER_RE.exec(line);
      if (m) {
        width = parseInt(m[1], 10);
        height = parseInt(m[2], 10);
        rule = m[3];
      }
      continue;
    }
    body += line;
  }

  const cells: Array<[number, number]> = [];
  let x = 0;
  let y = 0;
  let run = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body.charCodeAt(i);
    if (ch >= 48 && ch <= 57) {
      run = run * 10 + (ch - 48);
      continue;
    }
    if (body[i] === "!") break;
    const n = run === 0 ? 1 : run;
    run = 0;
    switch (body[i]) {
      case "b":
      case "B":
        x += n;
        break;
      case "o":
      case "O":
        for (let k = 0; k < n; k++) cells.push([x + k, y]);
        x += n;
        break;
      case "$":
        y += n;
        x = 0;
        break;
    }
  }

  if (width === 0) width = computeMax(cells, 0);
  if (height === 0) height = computeMax(cells, 1);
  const dx = -Math.floor(width / 2);
  const dy = -Math.floor(height / 2);
  for (const c of cells) {
    c[0] += dx;
    c[1] += dy;
  }
  return { root: cellsToRoot(cells), rule };
}

export function generateSoupRLE(side: number, density: number): string {
  let body = "";
  for (let y = 0; y < side; y++) {
    let runChar: "b" | "o" = "b";
    let runLen = 0;
    for (let x = 0; x < side; x++) {
      const ch: "b" | "o" = Math.random() < density ? "o" : "b";
      if (ch === runChar) {
        runLen++;
      } else {
        if (runLen > 0) body += (runLen > 1 ? String(runLen) : "") + runChar;
        runChar = ch;
        runLen = 1;
      }
    }
    if (runLen > 0) body += (runLen > 1 ? String(runLen) : "") + runChar;
    body += y === side - 1 ? "!" : "$";
  }
  return `x = ${side}, y = ${side}\n${body}`;
}

function computeMax(cells: Array<[number, number]>, axis: 0 | 1): number {
  let max = 0;
  for (const c of cells) if (c[axis] + 1 > max) max = c[axis] + 1;
  return max;
}

function cellsToRoot(cells: ReadonlyArray<readonly [number, number]>): Node {
  const n = cells.length;
  const xs = new Int32Array(n);
  const ys = new Int32Array(n);
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  if (n > 0) {
    minX = maxX = cells[0][0];
    minY = maxY = cells[0][1];
  }
  for (let i = 0; i < n; i++) {
    const x = cells[i][0];
    const y = cells[i][1];
    xs[i] = x;
    ys[i] = y;
    if (x < minX) minX = x;
    else if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    else if (y > maxY) maxY = y;
  }
  const extent = Math.max(-minX, maxX + 1, -minY, maxY + 1, 1);
  let level = INITIAL_LEVEL;
  while (2 ** (level - 1) < extent) level++;
  const off = 2 ** (level - 1);
  for (let i = 0; i < n; i++) {
    xs[i] += off;
    ys[i] += off;
  }
  return setupRecurse(0, n - 1, xs, ys, level);
}

function setupRecurse(
  start: number,
  end: number,
  xs: Int32Array,
  ys: Int32Array,
  level: number
): Node {
  if (start > end) return emptyNode(level);
  if (level === 2) return level2Setup(start, end, xs, ys);
  level--;
  const mask = 1 << level;
  const p3 = partition(start, end, ys, xs, mask);
  const p2 = partition(start, p3 - 1, xs, ys, mask);
  const p4 = partition(p3, end, xs, ys, mask);
  return makeNode(
    setupRecurse(start, p2 - 1, xs, ys, level),
    setupRecurse(p2, p3 - 1, xs, ys, level),
    setupRecurse(p3, p4 - 1, xs, ys, level),
    setupRecurse(p4, end, xs, ys, level)
  );
}

function partition(
  start: number,
  end: number,
  test: Int32Array,
  other: Int32Array,
  mask: number
): number {
  let i = start;
  let j = end;
  while (i <= j) {
    while (i <= end && (test[i] & mask) === 0) i++;
    while (j > start && (test[j] & mask) !== 0) j--;
    if (i >= j) break;
    let t = test[i];
    test[i] = test[j];
    test[j] = t;
    t = other[i];
    other[i] = other[j];
    other[j] = t;
    i++;
    j--;
  }
  return i;
}

function level2Setup(
  start: number,
  end: number,
  xs: Int32Array,
  ys: Int32Array
): Node {
  let bits = 0;
  for (let i = start; i <= end; i++) {
    bits |= 1 << ((xs[i] & 3) + ((ys[i] & 3) << 2));
  }
  return makeNode(
    makeNode(
      bits & 0x0001 ? ALIVE : DEAD,
      bits & 0x0002 ? ALIVE : DEAD,
      bits & 0x0010 ? ALIVE : DEAD,
      bits & 0x0020 ? ALIVE : DEAD
    ),
    makeNode(
      bits & 0x0004 ? ALIVE : DEAD,
      bits & 0x0008 ? ALIVE : DEAD,
      bits & 0x0040 ? ALIVE : DEAD,
      bits & 0x0080 ? ALIVE : DEAD
    ),
    makeNode(
      bits & 0x0100 ? ALIVE : DEAD,
      bits & 0x0200 ? ALIVE : DEAD,
      bits & 0x1000 ? ALIVE : DEAD,
      bits & 0x2000 ? ALIVE : DEAD
    ),
    makeNode(
      bits & 0x0400 ? ALIVE : DEAD,
      bits & 0x0800 ? ALIVE : DEAD,
      bits & 0x4000 ? ALIVE : DEAD,
      bits & 0x8000 ? ALIVE : DEAD
    )
  );
}
