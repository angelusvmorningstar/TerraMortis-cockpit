// seeds/seed-chronicle-rules.mjs — populate tm_chronicle.chronicle_rules with the
// chronicle's own rules text, so a pool/mechanic is only ever flagged against this, never
// against memory. Idempotent (upsert by `key`).
// Content from the suite's downtime-grounding-hardening.md §2.D (audit-sourced).
import { connect } from '../lib/connect.mjs';

const RULES = [
  {
    key: 'feeding-pool',
    title: 'Feeding pool construction',
    body: 'Feeding pool = Attribute + Skill base, with a Discipline permitted on top (Dominate in a feeding pool is legal).',
    source: 'audit instance 7',
  },
  {
    key: 'animal-feeding-blood-potency',
    title: 'Animal feeding capacity',
    body: 'Animal-feeding capacity is governed by Blood Potency, not clan.',
    source: 'audit instance 8',
  },
  {
    key: 'chronicle-timing-overrides-book',
    title: 'Timing and reallocation',
    body: 'Chronicle timing and reallocation rulings override book terminology ("immediately", not "end of chapter").',
    source: 'audit instance 14',
  },
  {
    key: 'st-ruling-overrides-default',
    title: 'ST rulings override the default pathway',
    body: 'Specific ST rulings override the default rules pathway (e.g. a straight XP refund, not a Sanctity of Merits reallocation).',
    source: 'audit instance 15',
  },
  {
    // Placeholder, NOT the table itself. Inventing the rows here would reproduce instance 13.
    key: 'discipline-territory-table',
    title: 'Discipline-to-territory atmosphere table',
    body: "A discipline-to-territory atmosphere system EXISTS in the chronicle's feeding matrix. Locate and seed its real rows from the suite feeding-matrix source. DO NOT invent it — inventing it would reproduce audit instance 13 (the model declared a real system absent, then fabricated a replacement).",
    source: 'audit instance 13 — content PENDING the feeding-matrix source',
    pending: true,
  },
];

async function seedRules() {
  const conn = await connect();
  try {
    const col = conn.chronicleCollection('chronicle_rules');
    let upserted = 0;
    for (const doc of RULES) {
      await col.updateOne({ key: doc.key }, { $set: doc }, { upsert: true });
      upserted += 1;
    }
    console.log(`chronicle_rules: upserted ${upserted} rules (incl. 1 pending placeholder).`);
  } finally {
    await conn.close();
  }
}

seedRules().catch((err) => {
  console.error(`Seed FAILED: ${err.message}`);
  process.exit(1);
});
