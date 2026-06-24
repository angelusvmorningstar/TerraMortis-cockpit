// lib/build-pack-data.mjs — the single composition path for the drafting pack.
// Orchestrates: Character Index projection → collision detection → reference assemblers →
// serialised markdown. Returns BOTH the structured data (for the UI) and the markdown
// (for the CLI / paste). Read-only: every read goes through connect.mjs; no writes.
//
//   buildPackData(label) → { label, index, collisions, glossary, channelRules, rules, markdown }
//
// Used by generate-pack.mjs (CLI: writes markdown) and server.mjs (UI: serves JSON), so the
// two never drift — there is one place that assembles the pack.
import { connect } from './connect.mjs';
import { buildCharacterIndex } from './build-character-index.mjs';
import { detectCollisions } from './detect-collisions.mjs';
import { assembleGlossary } from './assemble-glossary.mjs';
import { assembleChannelRules } from './assemble-channel-rules.mjs';
import { assembleRules } from './assemble-rules.mjs';
import { serialisePack } from './serialise-pack.mjs';

export async function buildPackData(label = '(unlabelled cycle)') {
  // 1) Character Index — buildCharacterIndex opens/closes its own connection (reads tm_suite_dev).
  const index = await buildCharacterIndex();

  // 2-3) One shared connection for the chronicle side (disambiguations + the three assemblers).
  const conn = await connect();
  try {
    const disambiguations = await conn.chronicleCollection('disambiguations').find({}).toArray();
    const collisions = detectCollisions(index, disambiguations);
    const glossary = await assembleGlossary(conn);
    const channelRules = await assembleChannelRules(conn);
    const rules = await assembleRules(conn);
    const markdown = serialisePack({ label, characterIndex: index, collisions, glossary, channelRules, rules });
    return { label, index, collisions, glossary, channelRules, rules, markdown };
  } finally {
    await conn.close();
  }
}
