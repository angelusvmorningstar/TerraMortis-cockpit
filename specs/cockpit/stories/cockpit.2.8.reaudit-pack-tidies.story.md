---
epic: 2
story: 2.8
story_key: cockpit.2.8.reaudit-pack-tidies
title: Pack tidy-ups surfaced by the Story 3.1 re-audit
status: review
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/stories/epic-3-reaudit-results.md
  - specs/cockpit/stories/cockpit.3.1.validate-grounding.story.md
---

# Story 2.8: Pack tidy-ups surfaced by the Story 3.1 re-audit

Status: in-progress

> The four non-blocking findings logged by the Story 3.1 re-audit (QA-approved as
> correctly scoped: data/wording, not fabrication defects). Bundled into one small story.

## Story

As the ST,
I want the four re-audit-surfaced pack improvements applied,
so the pack closes the instance-1 soft spot, resolves the Keeper by name, stops
conflating Charles's clan with his bloodline, and can state the real discipline-territory
atmosphere instead of only refusing to invent it.

## Acceptance Criteria

1. **(haven→travel)** The standing instruction explicitly forbids inferring travel
   direction or method from a haven location. After regeneration, the pack's Standing
   instruction contains that prohibition.
2. **(Keeper alias)** A disambiguation entry maps "Henry St. John" to the index entry
   "Senator Keeper", so the Keeper resolves by name as well as by collision note. After
   regeneration, the pack carries the alias.
3. **(Charles wording)** The Charles/Charlie disambiguation note distinguishes clan
   (Ventrue) from bloodline (Gorgons), no longer presenting "Gorgon" as if it were the
   clan.
4. **(discipline-territory rows)** The `discipline-territory-table` chronicle rule carries
   the real rows from the suite source (`_DISCIPLINE_TERRITORIAL_EFFECTS` in
   `public/js/admin/downtime-views.js`), not the pending placeholder. After regeneration,
   the pack's Codified Rules state the actual per-discipline atmospheric effects.
5. No production writes. Seed runs target the LOCAL `tm_chronicle` sandbox only. British
   English throughout.

## Dev Notes

- Item 1: `lib/serialise-pack.mjs` `STANDING_INSTRUCTION` (pure code; regeneration reflects
  it immediately, no seed run needed).
- Items 2-3: `seeds/seed-disambiguations.mjs` (data). Re-run the seed against local
  `tm_chronicle`, then regenerate.
- Item 4: `seeds/seed-chronicle-rules.mjs` — replace the `pending: true` placeholder with
  the 9 real rows. Source of truth: `_DISCIPLINE_TERRITORIAL_EFFECTS` (Animalism, Auspex,
  Dominate, Majesty, Nightmare, Obfuscate, Protean, Cruac, Theban; copy verbatim). Re-run
  the seed, regenerate.

## Tasks / Subtasks

- [x] Item 1: extend `STANDING_INSTRUCTION`; regenerate; confirm prohibition in pack.
- [x] Item 2: add Henry St. John → Senator Keeper disambiguation; re-seed; confirm in pack.
- [x] Item 3: split clan/bloodline in the Charles note; re-seed; confirm in pack.
- [x] Item 4: seed the real discipline-territory rows; re-seed; confirm in pack.
- [x] Regenerate pack; confirm haven PII still absent (no regression on Story 2.7).

## Dev Agent Record

### Implementation
- **Item 1** — `lib/serialise-pack.mjs`: appended to `STANDING_INSTRUCTION`: "A haven
  location records where someone sleeps, not how or which way they travelled on a given
  night: never infer travel direction or method from a haven."
- **Item 2** — `seeds/seed-disambiguations.mjs`: new entry `keeper-henry-st-john` mapping
  Henry St. John / Keeper / Senator Keeper to the single Character Index entry.
- **Item 3** — same file, `charles-vs-charlie` note reworded to "Ventrue clan, Gorgons
  bloodline … Note: Gorgons is Charles's bloodline, not his clan."
- **Item 4** — `seeds/seed-chronicle-rules.mjs`: replaced the `pending: true` placeholder
  with the 9 real rows (Animalism, Auspex, Dominate, Majesty, Nightmare, Obfuscate,
  Protean, Cruac, Theban) copied verbatim from the suite source of truth
  `_DISCIPLINE_TERRITORIAL_EFFECTS` (`public/js/admin/downtime-views.js`). Also fixed the
  seed's stale "(incl. 1 pending placeholder)" log line.

### Testing / validation
Re-ran both seeds against LOCAL `tm_chronicle` (disambiguations: 4 notes; chronicle_rules:
5 rules), regenerated the pack (`node generate-pack.mjs DT5`, exit 0), and grepped output:
- AC1 ✅ "never infer travel direction or method from a haven" in Standing instruction.
- AC2 ✅ Keeper alias note present.
- AC3 ✅ Charles note splits clan (Ventrue) from bloodline (Gorgons).
- AC4 ✅ Codified Rules carry the real per-discipline atmospheric effects (no placeholder).
- AC5 ✅ regression: `grep -ci "haven="` → 0; suburb/realestate strings → 0.

### File List
- `lib/serialise-pack.mjs` (modified)
- `seeds/seed-disambiguations.mjs` (modified)
- `seeds/seed-chronicle-rules.mjs` (modified)
- `out/drafting-pack.md` (regenerated — gitignored)

## QA Review
_(pending — after dev)_

## References
- `specs/cockpit/stories/epic-3-reaudit-results.md` → "Key findings" 2 and 4
- Suite source for item 4: `public/js/admin/downtime-views.js` `_DISCIPLINE_TERRITORIAL_EFFECTS`
