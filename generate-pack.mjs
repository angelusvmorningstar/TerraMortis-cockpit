// generate-pack.mjs — the cockpit CLI entry. Orchestrates the Phase 1 generator:
// build Character Index → detect collisions → assemble reference sections → serialise →
// write out/drafting-pack.md. Reads only (sandbox read-only surface + chronicle reads);
// the sole write is the local pack file.
//
// Usage (from the cockpit repo root, with .env configured + a seeded local Mongo):
//   node generate-pack.mjs <label>      e.g. node generate-pack.mjs DT5
//   npm run generate -- <label>
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { connect } from './lib/connect.mjs';
import { buildCharacterIndex } from './lib/build-character-index.mjs';
import { detectCollisions } from './lib/detect-collisions.mjs';
import { assembleGlossary } from './lib/assemble-glossary.mjs';
import { assembleChannelRules } from './lib/assemble-channel-rules.mjs';
import { assembleRules } from './lib/assemble-rules.mjs';
import { serialisePack } from './lib/serialise-pack.mjs';

async function main() {
  const label = process.argv[2] || '(unlabelled cycle)';

  // 1) Character Index — buildCharacterIndex opens/closes its own connection (reads tm_suite_dev).
  const index = await buildCharacterIndex();

  // 2-3) One shared connection for the chronicle side (disambiguations + the three assemblers).
  const conn = await connect();
  let collisions;
  let md;
  try {
    const disambiguations = await conn.chronicleCollection('disambiguations').find({}).toArray();
    collisions = detectCollisions(index, disambiguations);
    const glossary = await assembleGlossary(conn);
    const channelRules = await assembleChannelRules(conn);
    const rules = await assembleRules(conn);
    md = serialisePack({ label, characterIndex: index, collisions, glossary, channelRules, rules });
  } finally {
    await conn.close();
  }

  // 4) Write to cockpit/out/drafting-pack.md, resolved relative to THIS script (not the caller's cwd).
  const outPath = join(dirname(fileURLToPath(import.meta.url)), 'out', 'drafting-pack.md');
  writeFileSync(outPath, md, 'utf8');

  // 5) stdout + run summary.
  console.log(md);
  console.log(
    `\n— ${index.characters.length} characters, ${collisions.collisions.length} collision groups, `
    + `${collisions.curated.length} curated notes — written to out/drafting-pack.md`,
  );
}

main().catch((err) => {
  console.error(`generate-pack FAILED: ${err.message}`);
  process.exit(1);
});
