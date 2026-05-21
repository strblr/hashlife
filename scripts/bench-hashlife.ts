// Usage: bun scripts/bench-hashlife.ts [out.md]

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

import * as hl from "@/lib/hashlife/hashlife";
import { parseMC, parseRLE } from "@/lib/hashlife";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATTERNS_DIR = resolve(__dirname, "../src/assets/patterns");

const STEP_TIMEOUT_MS = 5000;
const TRIAL_TIMEOUT_MS = 15000;
const TRIALS = 5;

const CELLS: Array<[string, number, number]> = [
  ["glider.rle", 0, 20000],
  ["glider.rle", 8, 20000],
  ["acorn.rle", 0, 5000],
  ["acorn.rle", 8, 5000],
  ["gosperglidergun.rle", 0, 10000],
  ["gosperglidergun.rle", 8, 10000],
  ["otcametapixel.rle", 8, 100],
  ["otcametapixel.rle", 14, 100],
  ["metapixel-galaxy.mc", 8, 20],
  ["metapixel-galaxy.mc", 14, 10],
  ["metapixel-parity64.mc", 8, 20],
  ["metapixel-parity64.mc", 14, 10]
];

interface Cell {
  pattern: string;
  stepExp: number;
  n: number;
  loadMs: number;
  firstMs: number | "timeout";
  avgMs: number | "timeout";
  tailMs: number | "timeout";
  cacheSize: number;
  cacheDelta: number;
  // Correctness check, must match across algorithm changes.
  population: number;
  generation: bigint;
}

async function loadFresh(pattern: string): Promise<{ loadMs: number }> {
  const text = await Bun.file(resolve(PATTERNS_DIR, pattern)).text();
  const t0 = performance.now();
  hl.clear();
  const parsed = pattern.endsWith(".mc") ? parseMC(text) : parseRLE(text);
  hl.loadRoot(parsed.root);
  hl.gc();
  return { loadMs: performance.now() - t0 };
}

type StepStats =
  | { timedOut: false; firstMs: number; avgMs: number; tailMs: number }
  | { timedOut: true };

function runSteps(stepExp: number, n: number): StepStats {
  hl.setStepExp(stepExp);
  const start = performance.now();
  hl.step();
  const afterFirst = performance.now();
  if (afterFirst - start > STEP_TIMEOUT_MS) return { timedOut: true };

  for (let i = 1; i < n; i++) {
    hl.step();
    if ((i & 31) === 0) {
      const elapsed = performance.now() - start;
      if (elapsed > TRIAL_TIMEOUT_MS || elapsed / (i + 1) > STEP_TIMEOUT_MS) {
        return { timedOut: true };
      }
    }
  }

  const end = performance.now();
  const totalMs = end - start;
  return {
    timedOut: false,
    firstMs: afterFirst - start,
    avgMs: totalMs / n,
    tailMs: n === 1 ? 0 : (end - afterFirst) / (n - 1)
  };
}

async function benchOne(
  pattern: string,
  stepExp: number,
  n: number
): Promise<Cell> {
  let bestAvg = Infinity;
  let bestFirst = Infinity;
  let bestTail = Infinity;
  let bestLoad = Infinity;
  let timedOut = false;
  let bestCacheDelta = 0;
  for (let t = 0; t < TRIALS; t++) {
    const { loadMs } = await loadFresh(pattern);
    if (loadMs < bestLoad) bestLoad = loadMs;
    const cacheBefore = hl.cacheSize();
    const stats = runSteps(stepExp, n);
    const cacheDelta = hl.cacheSize() - cacheBefore;
    if (stats.timedOut) {
      timedOut = true;
      break;
    }
    if (stats.avgMs < bestAvg) {
      bestAvg = stats.avgMs;
      bestFirst = stats.firstMs;
      bestTail = stats.tailMs;
      bestCacheDelta = cacheDelta;
    }
  }
  return {
    pattern,
    stepExp,
    n,
    loadMs: bestLoad,
    firstMs: timedOut ? "timeout" : bestFirst,
    avgMs: timedOut ? "timeout" : bestAvg,
    tailMs: timedOut ? "timeout" : bestTail,
    cacheSize: hl.cacheSize(),
    cacheDelta: bestCacheDelta,
    population: hl.root.population,
    generation: hl.generation
  };
}

function fmtTable(rows: Cell[]): string {
  const head =
    "| pattern | stepExp | n | load-ms | first-ms | avg-ms | tail-ms | cacheSize | cacheDelta | population | generation |";
  const sep =
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |";
  const body = rows.map(c => {
    const first = c.firstMs === "timeout" ? "timeout" : c.firstMs.toFixed(6);
    const avg = c.avgMs === "timeout" ? "timeout" : c.avgMs.toFixed(6);
    const tail = c.tailMs === "timeout" ? "timeout" : c.tailMs.toFixed(6);
    return `| ${c.pattern} | ${c.stepExp} | ${c.n} | ${c.loadMs.toFixed(2)} | ${first} | ${avg} | ${tail} | ${c.cacheSize} | ${c.cacheDelta} | ${c.population} | ${c.generation.toString()} |`;
  });
  return [head, sep, ...body].join("\n");
}

const out: Cell[] = [];
for (const [pattern, stepExp, n] of CELLS) {
  process.stderr.write(`bench: ${pattern} stepExp=${stepExp} n=${n}…\n`);
  out.push(await benchOne(pattern, stepExp, n));
}

console.table(out);

const outPath = process.argv[2];

if (outPath) {
  writeFileSync(outPath, fmtTable(out) + "\n");
  process.stderr.write(`\nwrote ${outPath}\n`);
}
