import { mkdir, readdir, stat, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { PATTERNS } from "../src/lib/patterns.ts";

function patternUrl(filename: string): string {
  if (filename.endsWith(".mc")) {
    return `https://copy.sh/life/examples/${filename}`;
  }
  return `https://conwaylife.com/patterns/${filename}`;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "src/assets/patterns");

await mkdir(OUT_DIR, { recursive: true });

const wanted = new Set(PATTERNS.map(p => p.filename));
const remotePatterns = PATTERNS.filter(p => p.source !== "manual");
const manualPatterns = PATTERNS.filter(p => p.source === "manual");

let removed = 0;
for (const ent of await readdir(OUT_DIR, { withFileTypes: true })) {
  if (!ent.isFile()) continue;
  if (wanted.has(ent.name)) continue;
  await unlink(resolve(OUT_DIR, ent.name));
  console.log(`− ${ent.name}`);
  removed++;
}

let fetched = 0;
let skipped = 0;
let failed = 0;
let manualPresent = 0;
let manualMissing = 0;

for (const { filename } of remotePatterns) {
  const out = resolve(OUT_DIR, filename);
  try {
    const s = await stat(out);
    if (s.isFile() && s.size > 0) {
      console.log(`· ${filename}`);
      skipped++;
      continue;
    }
  } catch {
    // missing or empty file: fetch
  }

  const url = patternUrl(filename);
  const r = spawnSync(
    "curl",
    [
      "-fsSL",
      "-H",
      "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      "-o",
      out,
      url
    ],
    { stdio: ["ignore", "ignore", "inherit"] }
  );
  if (r.status === 0) {
    console.log(`✓ ${filename}`);
    fetched++;
  } else {
    console.error(`× ${filename}: curl exited ${r.status}`);
    failed++;
  }
}

for (const { filename } of manualPatterns) {
  const out = resolve(OUT_DIR, filename);
  try {
    const s = await stat(out);
    if (s.isFile() && s.size > 0) {
      console.log(`⌂ ${filename} (manual)`);
      manualPresent++;
      continue;
    }
  } catch {
    // checked below
  }
  console.error(`× ${filename}: manual file missing in src/assets/patterns`);
  manualMissing++;
}

console.log(
  `\n${fetched} fetched, ${skipped} already present, ${manualPresent} manual present, ${removed} removed, ${failed + manualMissing} failed`
);
process.exit(failed + manualMissing === 0 ? 0 : 1);
