// lib/assemble-rules.mjs — read tm_chronicle.chronicle_rules into a pack section.
// Optional pre-opened `chronicle` (see assemble-glossary.mjs for the pattern).
// Surfaces the `discipline-territory-table` placeholder as-is — its "pending source"
// body is deliberate grounding (state the gap, do not invent the table).
import { connect } from './connect.mjs';

export async function assembleRules(chronicle) {
  const own = !chronicle;
  const conn = chronicle || (await connect());
  try {
    const docs = await conn.chronicleCollection('chronicle_rules').find({}).toArray();
    if (!docs.length) {
      return { title: 'Codified Rules', rules: [], gap: '[no codified rules on record]' };
    }
    const rules = docs
      .map((d) => ({ key: d.key, title: d.title, body: d.body }))
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
    return { title: 'Codified Rules', rules };
  } finally {
    if (own) await conn.close();
  }
}
