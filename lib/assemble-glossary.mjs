// lib/assemble-glossary.mjs — read tm_chronicle.glossary into a pack section.
// Takes an optional pre-opened `chronicle` (a connect() result, or any object exposing
// chronicleCollection(name)); opens its own connection only if none is supplied, so the
// 2.6 orchestrator can share one connection and tests can inject a stub.
import { connect } from './connect.mjs';

export async function assembleGlossary(chronicle) {
  const own = !chronicle;
  const conn = chronicle || (await connect());
  try {
    const docs = await conn.chronicleCollection('glossary').find({}).toArray();
    if (!docs.length) {
      return { title: 'Glossary', entries: [], gap: '[no glossary on record]' };
    }
    const entries = docs
      .map((d) => ({ term: d.term, definition: d.definition }))
      .sort((a, b) => String(a.term).localeCompare(String(b.term)));
    return { title: 'Glossary', entries };
  } finally {
    if (own) await conn.close();
  }
}
