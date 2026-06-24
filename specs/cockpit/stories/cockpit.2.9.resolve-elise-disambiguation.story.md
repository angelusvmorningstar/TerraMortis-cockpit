---
epic: 2
story: 2.9
story_key: cockpit.2.9.resolve-elise-disambiguation
title: Resolve the Elise disambiguation (Conrad's granddaughter)
status: done
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/stories/epic-3-reaudit-results.md
  - seeds/seed-disambiguations.mjs
---

# Story 2.9: Resolve the Elise disambiguation (Conrad's granddaughter)

Status: in-progress

> Surfaced by the live DT4 run (2026-06-24): a grounded drafter correctly refused to
> assert who Elise is, because the pack said only "a living mortal who resembles Astrid"
> and did not record that she is Conrad's granddaughter. The canon answer was confirmed
> from the character touchstone data.

## Story

As the ST,
I want the Elise disambiguation note to record that Elise is Conrad's living mortal
granddaughter (who resembles his late wife Astrid),
so that grounded drafts can state the relationship instead of gapping it, while the
Astrid / Odeliese / Elise distinction is preserved.

## Canon source (confirmed 2026-06-24)

Conrad Sondergaard's touchstone in the character data, agreeing across four files:
- `data/dev-fixtures/characters.json` → `touchstones: [{name: "Elise (Granddaughter)"}]`
- `public/dt-proto-data/characters.json` → same
- `public/mockups/data/chars.json` → same
- `data/archive/chars_v2.json` → `{name: "Elise", desc: "Granddaughter"}`

Reconciliation: Elise is one person — Conrad's living mortal granddaughter, who resembles
Astrid (his late wife / her grandmother). The DT4 ST vignette states it plainly ("She is
your granddaughter"). Not a separate cafe woman.

## Acceptance Criteria

1. The `astrid-odeliese-elise` disambiguation note states Elise is Conrad's living mortal
   granddaughter who resembles his late wife Astrid.
2. The note PRESERVES the existing distinctions: Astrid = Conrad's dead wife; Odeliese =
   Keeper's dead wife, a decanted memory in a living body; and the clause that the Odeliese
   implant does NOT reside in Elise.
3. After re-seeding local `tm_chronicle` and regenerating, the pack carries the updated
   note; haven PII remains absent (no 2.7 regression).
4. No production writes; seed run targets the LOCAL sandbox only. British English.

## Tasks / Subtasks

- [x] Update the `astrid-odeliese-elise` entry in `seeds/seed-disambiguations.mjs`.
- [x] Re-seed local `tm_chronicle`; regenerate the pack.
- [x] Confirm AC1/AC2 in the pack; confirm AC3 (no `haven=`).

## Dev Agent Record

### Implementation
`seeds/seed-disambiguations.mjs`, `astrid-odeliese-elise` note updated: Elise is now
"Conrad's living mortal granddaughter, who resembles his late wife Astrid; she is his
touchstone", with an added clause "Elise and Odeliese are different people." Astrid and
Odeliese definitions and the "Odeliese implant does NOT reside in Elise" clause preserved.
Source field cites the character touchstone data + DT4 live run.

### Testing / validation
Re-seeded local `tm_chronicle` (4 notes), regenerated pack (exit 0), grepped:
- AC1/AC2 ✅ updated Elise note + preserved Astrid/Odeliese distinction present in pack.
- AC3 ✅ `grep -ci "haven="` → 0 (no 2.7 regression).

### File List
- `seeds/seed-disambiguations.mjs` (modified)
- `out/drafting-pack.md` (regenerated — gitignored)

## QA Review

**Verdict: APPROVE (independent, 2026-06-24).** AC1 (Elise note), AC2 (Astrid/Odeliese
distinctions + "implant not in Elise" clause preserved), AC3 (no `haven=` regression) all
PASS. Canon-source independently verified: Conrad's touchstone records Elise as
"Granddaughter" in `dev-fixtures/characters.json` and `data/archive/chars_v2.json` — the
claim is grounded, not fabricated. Seed-to-pack consistency confirmed (edit is in the
seed, not hand-patched). Status: review → done.

## References
- `specs/cockpit/stories/cockpit.2.8.reaudit-pack-tidies.story.md` (same fix shape)
- Live-run finding: `epic-3-reaudit-results.md` had Elise flagged as a gap; now resolved.
