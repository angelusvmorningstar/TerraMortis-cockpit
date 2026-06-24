// seeds/seed-glossary.mjs — populate tm_chronicle.glossary with in-world term meanings
// that override any plain-English reading. Idempotent (upsert by `key`).
// Content from the suite's downtime-grounding-hardening.md §2.B (audit-sourced).
import { connect } from '../lib/connect.mjs';

const GLOSSARY = [
  {
    key: 'the-great-unwashed',
    term: 'the Great Unwashed',
    definition: 'Unranked Kindred of the Sydney Court without title or identity at court. NOT the mortal masses.',
    source: 'audit instance 6',
  },
  {
    key: 'bloodline-names-secret',
    term: 'Bloodline names',
    definition: 'Bloodline names (Mnemosyne, Scions of the First City, etc.) are SECRET, not public.',
    source: 'hardening §2.B',
  },
];

async function seedGlossary() {
  const conn = await connect();
  try {
    const col = conn.chronicleCollection('glossary');
    let upserted = 0;
    for (const doc of GLOSSARY) {
      await col.updateOne({ key: doc.key }, { $set: doc }, { upsert: true });
      upserted += 1;
    }
    console.log(`glossary: upserted ${upserted} entries.`);
  } finally {
    await conn.close();
  }
}

seedGlossary().catch((err) => {
  console.error(`Seed FAILED: ${err.message}`);
  process.exit(1);
});
