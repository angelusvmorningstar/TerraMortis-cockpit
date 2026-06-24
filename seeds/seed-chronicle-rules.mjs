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
    // Real rows, copied verbatim from the suite source of truth
    // (_DISCIPLINE_TERRITORIAL_EFFECTS in public/js/admin/downtime-views.js).
    // Closes audit instance 13: the system EXISTS and now states its actual effects.
    key: 'discipline-territory-table',
    title: 'Discipline-to-territory atmosphere effects',
    body: 'Heavy use of a discipline in a territory imparts an atmosphere. '
      + 'Animalism: feral edge, heightened animal activity, lower inhibitions, territoriality. '
      + 'Auspex: feeling of being watched, paranoia, superstition, ghost sightings, out-of-body experiences. '
      + 'Dominate: forgetfulness, complacency, compliance, passivity, docility, confusion, rigidity. '
      + 'Majesty: salacious activity, lasciviousness, obsessive behaviour, stalking, adultery, jealousy, heightened passions. '
      + 'Nightmare: fear, dread, paranoia, nightmares, delusions, insomnia, restlessness. '
      + 'Obfuscate: long shadows, things seen in peripheral vision, losing things, getting lost, disconnectedness, isolation, quietude, false identity, loneliness, vagrancy. '
      + 'Protean: desire for body modification, dysphoria, outlandishness, provocative fashion, counter-cultural, hyper fitness, dysmorphia, rebelliousness. '
      + 'Cruac: Dionysian excess, wantonness, rebelliousness, corruption, primal energy, ecstasis, frenzy, debauchery. '
      + 'Theban: judgmental atmosphere, righteousness, prideful piety, rapture, guilt, sternness, rigidity, certitude.',
    source: 'suite _DISCIPLINE_TERRITORIAL_EFFECTS (public/js/admin/downtime-views.js)',
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
    console.log(`chronicle_rules: upserted ${upserted} rules.`);
  } finally {
    await conn.close();
  }
}

seedRules().catch((err) => {
  console.error(`Seed FAILED: ${err.message}`);
  process.exit(1);
});
