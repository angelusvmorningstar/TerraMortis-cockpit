// generate-pack.mjs — the cockpit CLI entry. Thin wrapper over the shared composition
// path (lib/build-pack-data.mjs): assemble the pack, write out/drafting-pack.md, print a
// summary. Reads only (sandbox read-only surface + chronicle reads); the sole write is the
// local pack file.
//
// Usage (from the cockpit repo root, with .env configured + a seeded local Mongo):
//   node generate-pack.mjs <label>      e.g. node generate-pack.mjs DT5
//   npm run generate -- <label>
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildPackData } from './lib/build-pack-data.mjs';

async function main() {
  const label = process.argv[2] || '(unlabelled cycle)';

  const { index, collisions, markdown } = await buildPackData(label);

  // Write to cockpit/out/drafting-pack.md, resolved relative to THIS script (not the caller's cwd).
  const outPath = join(dirname(fileURLToPath(import.meta.url)), 'out', 'drafting-pack.md');
  writeFileSync(outPath, markdown, 'utf8');

  // stdout + run summary.
  console.log(markdown);
  console.log(
    `\n— ${index.characters.length} characters, ${collisions.collisions.length} collision groups, `
    + `${collisions.curated.length} curated notes — written to out/drafting-pack.md`,
  );
}

main().catch((err) => {
  console.error(`generate-pack FAILED: ${err.message}`);
  process.exit(1);
});
