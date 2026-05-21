import { ALIVE, DEAD, emptyNode, makeNode, type Node } from "./hashlife";

export function parseMC(text: string) {
  let rule: string | undefined;
  const nodes: Node[] = [];

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line[0] === "#") {
      const m = /^#R\s+(\S+)/i.exec(line);
      if (m) rule = m[1];
      continue;
    }
    if (line[0] === "[") continue;

    const c = line.charCodeAt(0);
    // MC leaf lines start with $ . or *
    if (c === 0x24 || c === 0x2e || c === 0x2a) {
      nodes.push(parseLeaf(line));
    } else if (c >= 0x30 && c <= 0x39) {
      const parts = line.split(/\s+/);
      const level = parseInt(parts[0], 10);
      const empty = emptyNode(level - 1);
      nodes.push(
        makeNode(
          ref(nodes, parts[1], empty),
          ref(nodes, parts[2], empty),
          ref(nodes, parts[3], empty),
          ref(nodes, parts[4], empty)
        )
      );
    }
  }

  if (nodes.length === 0) {
    throw new Error("Empty MC pattern: no nodes defined.");
  }
  return { root: nodes[nodes.length - 1], rule };
}

function ref(nodes: Node[], token: string, empty: Node): Node {
  const i = parseInt(token, 10);
  return i === 0 ? empty : nodes[i - 1];
}

function parseLeaf(line: string): Node {
  let row = 0;
  let col = 0;
  const cells: Node[] = new Array(64).fill(DEAD);
  for (let i = 0; i < line.length; i++) {
    const ch = line.charCodeAt(i);
    if (ch === 0x24) {
      row++;
      col = 0;
    } else if (ch === 0x2e) {
      col++;
    } else if (ch === 0x2a) {
      if (row < 8 && col < 8) cells[row * 8 + col] = ALIVE;
      col++;
    }
  }

  let grid = cells;
  let size = 8;
  while (size > 1) {
    const half = size / 2;
    const next: Node[] = new Array(half * half);
    for (let y = 0; y < half; y++) {
      for (let x = 0; x < half; x++) {
        const i = 2 * y * size + 2 * x;
        next[y * half + x] = makeNode(
          grid[i],
          grid[i + 1],
          grid[i + size],
          grid[i + size + 1]
        );
      }
    }
    grid = next;
    size = half;
  }
  return grid[0];
}
