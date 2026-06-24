// seeds/seed-disambiguations.mjs — populate tm_chronicle.disambiguations with curated
// identity notes the forename auto-pass cannot derive (plot nuance, different forenames).
// Idempotent (upsert by key). Content from the suite's downtime-grounding-hardening.md §2.A.
import { connect } from '../lib/connect.mjs';

const DISAMBIGUATIONS = [
  {
    key: 'rene-meyer-vs-st-dominique',
    names: ['René Meyer', 'René St. Dominique'],
    note: 'René Meyer (Daeva, Carthian, sire Oscar) is DISTINCT from René St. Dominique (Ventrue, Invictus, Notary).',
    source: 'hardening §2.A',
  },
  {
    key: 'charles-vs-charlie',
    names: ['Charles Mercer-Willows', 'Charlie Ballsack'],
    note: 'Charles Mercer-Willows (Gorgon, Circle of the Crone, ghouled family) is DISTINCT from Charlie Ballsack (Nosferatu, Invictus, ST character).',
    source: 'hardening §2.A',
  },
  {
    key: 'astrid-odeliese-elise',
    names: ['Astrid', 'Odeliese', 'Elise'],
    note: "Astrid (Conrad's dead wife) vs Odeliese (Keeper's dead wife, a decanted memory implanted in a living body) vs Elise (a clean living mortal who merely resembles Astrid). The Odeliese implant does NOT reside in the real Elise.",
    source: 'hardening §2.A',
  },
];

async function seedDisambiguations() {
  const conn = await connect();
  try {
    const col = conn.chronicleCollection('disambiguations');
    let upserted = 0;
    for (const doc of DISAMBIGUATIONS) {
      await col.updateOne({ key: doc.key }, { $set: doc }, { upsert: true });
      upserted += 1;
    }
    console.log(`disambiguations: upserted ${upserted} notes.`);
  } finally {
    await conn.close();
  }
}

seedDisambiguations().catch((err) => {
  console.error(`Seed FAILED: ${err.message}`);
  process.exit(1);
});
