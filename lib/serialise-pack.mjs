// lib/serialise-pack.mjs — compose the fixed-order drafting pack as markdown.
// PURE: already-built data in (index / collisions / reference sections) → markdown out.
// No DB, no I/O, no Date.now/new Date (the orchestrator passes `label`), no suite imports.
// The fixed section order is an invariant: the same inputs produce byte-identical output.

const STANDING_INSTRUCTION =
  'Draft only from the facts above and the submission text provided. '
  + 'Where a fact is absent, say so ("no X on record") — never invent it. '
  + 'Resolve identity only via the Character Index; never by name-matching.';

function renderCharacterIndex(characterIndex, collisions) {
  const characters = (characterIndex?.characters ?? [])
    .slice()
    .sort((a, b) => String(a.sortName || a.displayName).localeCompare(String(b.sortName || b.displayName)));
  const lines = ['## Character Index', '(projection · displayName · clan · covenant · bloodline · court title)', ''];
  for (const c of characters) {
    lines.push(`- ${c.displayName} — ${c.clan} · ${c.covenant} · ${c.bloodline} · ${c.courtTitle}`);
    const facts = c.dossierFacts ?? [];
    if (facts.length) {
      lines.push(`  facts: ${facts.map((x) => `${x.tag}=${x.value} (${x.source})`).join('; ')}`);
    }
  }
  const groups = collisions?.collisions ?? [];
  const curated = collisions?.curated ?? [];
  if (groups.length || curated.length) {
    lines.push('', '⚠ NAME COLLISIONS');
    for (const g of groups) {
      lines.push(`- "${g.forename}" — ${g.members.length} distinct:`);
      for (const m of g.members) lines.push(`    • ${m.displayName} (${m.disambiguator})`);
    }
    for (const d of curated) {
      lines.push(`- ${(d.names || []).join(' / ')}: ${d.note}`);
    }
  }
  return lines.join('\n');
}

function renderGlossary(section) {
  const lines = [`## ${section?.title || 'Glossary'}`, ''];
  if (section?.gap) { lines.push(section.gap); return lines.join('\n'); }
  for (const e of section?.entries ?? []) lines.push(`- **${e.term}** — ${e.definition}`);
  return lines.join('\n');
}

function renderChannelRules(section) {
  const lines = [`## ${section?.title || 'Channel Rules (Cacophony)'}`, ''];
  if (section?.gap) { lines.push(section.gap); return lines.join('\n'); }
  for (const ch of section?.channels ?? []) {
    lines.push(`- **${ch.channel}** — visible: ${(ch.visible || []).join(', ')}; invisible: ${(ch.invisible || []).join(', ')}`);
  }
  return lines.join('\n');
}

function renderRules(section) {
  const lines = [`## ${section?.title || 'Codified Rules'}`, ''];
  if (section?.gap) { lines.push(section.gap); return lines.join('\n'); }
  for (const r of section?.rules ?? []) lines.push(`- **${r.title}** — ${r.body}`);
  return lines.join('\n');
}

export function serialisePack({ label, characterIndex, collisions, glossary, channelRules, rules } = {}) {
  return [
    `# Drafting Pack — ${label || '(unlabelled)'}`,
    '',
    '_Generated from tm_suite_dev. Draft only from what follows._',
    '',
    renderCharacterIndex(characterIndex, collisions),
    '',
    renderGlossary(glossary),
    '',
    renderChannelRules(channelRules),
    '',
    renderRules(rules),
    '',
    '## Standing instruction',
    '',
    STANDING_INSTRUCTION,
    '',
  ].join('\n');
}
