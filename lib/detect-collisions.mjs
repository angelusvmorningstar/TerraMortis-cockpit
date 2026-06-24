// lib/detect-collisions.mjs — flag people who share a forename so the assistant never
// conflates two distinct individuals. PURE: operates only on the passed-in data; no DB, no I/O.
//
//   detectCollisions(index, disambiguations = [])
//     index           — buildCharacterIndex() result { characters: [...], npcs: [...] }
//     disambiguations — curated notes [{ key, names: [string], note }] (from tm_chronicle),
//                       supplied by the caller (this module never touches the DB).
//   returns { collisions: [{ forename, members:[{ displayName, kind, disambiguator }] }],
//             curated:    [{ key, names, note }] }

function forenameOf(name) {
  return String(name || '').trim().split(/\s+/)[0].toLowerCase();
}

function characterDisambiguator(c) {
  return [c.clan, c.covenant, c.courtTitle]
    .filter((x) => x && x !== '[none on record]')
    .join(' · ');
}

function npcDisambiguator(n) {
  return 'NPC'
    + (n.isCorrespondent ? ' · correspondent' : '')
    + (n.linkedCharacterId ? ' · linked' : '');
}

export function detectCollisions(index, disambiguations = []) {
  const characters = index?.characters ?? [];
  const npcs = index?.npcs ?? [];

  // Flat people list: every character and every NPC, with display name + forename + disambiguator.
  const people = [
    ...characters.map((c) => ({
      displayName: c.displayName || c.sortName,
      forename: forenameOf(c.sortName || c.displayName),
      kind: 'character',
      disambiguator: characterDisambiguator(c),
    })),
    ...npcs.map((n) => ({
      displayName: n.name,
      forename: forenameOf(n.name),
      kind: 'npc',
      disambiguator: npcDisambiguator(n),
    })),
  ];

  // Group by forename; a collision is a forename shared by >= 2 entries.
  const byForename = new Map();
  for (const p of people) {
    if (!p.forename) continue;
    if (!byForename.has(p.forename)) byForename.set(p.forename, []);
    byForename.get(p.forename).push(p);
  }
  const collisions = [];
  for (const [forename, members] of byForename) {
    if (members.length >= 2) {
      collisions.push({
        forename,
        members: members.map(({ displayName, kind, disambiguator }) => ({ displayName, kind, disambiguator })),
      });
    }
  }

  // Curated merge: include any disambiguation whose names intersect the current people
  // (match on full display name OR forename, case-insensitive). Catches what the forename
  // grouping cannot — e.g. Charles vs Charlie, or the Astrid/Odeliese/Elise plot nuance.
  const nameSet = new Set();
  for (const p of people) {
    nameSet.add(String(p.displayName).toLowerCase());
    nameSet.add(p.forename);
  }
  const curated = (disambiguations || [])
    .filter((d) => (d.names || []).some((nm) => {
      const low = String(nm).toLowerCase();
      return nameSet.has(low) || nameSet.has(forenameOf(nm));
    }))
    .map(({ key, names, note }) => ({ key, names, note }));

  return { collisions, curated };
}
