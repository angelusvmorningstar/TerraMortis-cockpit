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
    note: 'Charles Mercer-Willows (Ventrue clan, Gorgons bloodline, Circle of the Crone, ghouled family) is DISTINCT from Charlie Ballsack (Nosferatu, Invictus, ST character). Note: Gorgons is Charles’s bloodline, not his clan.',
    source: 'hardening §2.A',
  },
  {
    key: 'keeper-henry-st-john',
    names: ['Henry St. John', 'Keeper', 'Senator Keeper'],
    note: '"Henry St. John" and "Keeper" both refer to the Character Index entry "Senator Keeper" (Mekhet, Circle of the Crone). Resolve any of these names to that single character.',
    source: 're-audit 3.1 finding (Keeper alias)',
  },
  {
    key: 'astrid-odeliese-elise',
    names: ['Astrid', 'Odeliese', 'Elise'],
    note: "Astrid (Conrad's dead wife) vs Odeliese (Keeper's dead wife, a decanted memory implanted in a living body) vs Elise (Conrad's living mortal granddaughter, who resembles his late wife Astrid; she is his touchstone). The Odeliese implant does NOT reside in the real Elise; Elise and Odeliese are different people.",
    source: 'hardening §2.A; Elise=granddaughter confirmed from character touchstone data (DT4 live run 2026-06-24)',
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
