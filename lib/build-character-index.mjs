// lib/build-character-index.mjs — the Character Index: a live PROJECTION over the sandbox,
// never a stored copy. Reads non-retired characters and left-joins character_dossier and
// npcs, returning an in-memory structure for the pack serialiser (Story 2.5).
// Reads ONLY via connect.mjs's read-only sandbox surface, so it cannot write back.
import { connect } from './connect.mjs';

// PII tags excluded from all pack output (real-world addresses, tracker-evasion notes).
// Extend this list as new PII-bearing dossier fields are introduced — never remove from it.
const PII_DENY_TAGS = new Set(['haven']);

// Gap marker for absent identity fields — shown, never silently omitted.
function orGap(value) {
  if (value === null || value === undefined) return '[none on record]';
  if (typeof value === 'string' && value.trim() === '') return '[none on record]';
  return value;
}

// displayName = honorific + (moniker || name); sortName = moniker || name.
// Reimplemented locally — the suite's helper is in a separate repo and must not be imported.
function displayName(c) {
  return [c.honorific, c.moniker || c.name].filter(Boolean).join(' ');
}

export async function buildCharacterIndex() {
  const conn = await connect();
  try {
    const characters = await conn
      .sandboxCollection('characters')
      .find({ retired: { $ne: true } })
      .toArray();
    const dossiers = await conn.sandboxCollection('character_dossier').find({}).toArray();
    const npcs = await conn.sandboxCollection('npcs').find({}).toArray();

    // Index dossiers by character_id. Dossier character_id is an ObjectId — normalise to string.
    const dossierByChar = new Map();
    for (const d of dossiers) dossierByChar.set(String(d.character_id), d);

    // Group character-linked NPCs by created_by.character_id (a string; normalise anyway).
    const npcsByChar = new Map();
    for (const n of npcs) {
      const linked = n.created_by?.character_id;
      if (linked == null) continue;
      const key = String(linked);
      if (!npcsByChar.has(key)) npcsByChar.set(key, []);
      npcsByChar.get(key).push({ name: n.name, isCorrespondent: !!n.is_correspondent });
    }

    const entries = characters.map((c) => {
      const idStr = String(c._id);
      const dossier = dossierByChar.get(idStr);
      return {
        id: idStr,
        displayName: displayName(c),
        sortName: c.moniker || c.name,
        legalName: c.name, // legal name kept for cross-referencing (submissions key on it)
        clan: orGap(c.clan),
        covenant: orGap(c.covenant),
        bloodline: orGap(c.bloodline),
        courtTitle: orGap(c.court_title),
        dossierFacts: (dossier?.facts ?? []).filter(f => !PII_DENY_TAGS.has(f.tag)), // PII stripped
        npcs: npcsByChar.get(idStr) ?? [],
      };
    });

    // Parallel list of ALL NPCs (incl. ST-created ones with no created_by, e.g. Odeliese)
    // so Story 2.3 collision detection sees every name in one namespace.
    const allNpcs = npcs.map((n) => ({
      name: n.name,
      isCorrespondent: !!n.is_correspondent,
      linkedCharacterId: n.created_by?.character_id ? String(n.created_by.character_id) : null,
    }));

    return { characters: entries, npcs: allNpcs };
  } finally {
    await conn.close();
  }
}
