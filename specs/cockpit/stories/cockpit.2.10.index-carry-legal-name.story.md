---
epic: 2
story: 2.10
story_key: cockpit.2.10.index-carry-legal-name
title: Character Index must carry the legal name alongside the moniker
status: done
phase: 1
repo: TerraMortis-cockpit
inputs:
  - lib/build-character-index.mjs
  - lib/serialise-pack.mjs
---

# Story 2.10: Character Index must carry the legal name alongside the moniker

Status: in-progress

> Found in the DT4 full-cycle live run (2026-06-24). Two submissions could not be grounded
> because the pack showed only the moniker. Doc = Margaret Kane, Etsy = Don Ezzelino Rocio
> were in the index under their monikers, but their legal names appeared nowhere, and DT
> submissions key on the legal `character_name`.

## The defect

`buildCharacterIndex()` projects `displayName` (honorific + moniker||name) and `sortName`
(moniker||name) but NOT the legal `name`. So a character with a moniker shows ONLY the
moniker in the pack:
- "Protector Doc" (legal name Margaret Kane — 0 hits in the pack)
- "Etsy" (legal name Don Ezzelino Rocio — 0 hits in the pack)

Downtime submissions carry `character_name` = the legal name, so a drafter resolving a
submission against the pack cannot match it. The two characters were wrongly reported as
"missing from the index" in the live run; they were present, but unfindable by legal name.

## Acceptance Criteria

1. Each Character Index entry exposes the character's legal `name` in addition to the
   moniker/displayName.
2. In the generated pack, an entry whose moniker differs from the legal name shows the
   legal name so a lookup by legal name resolves. Specifically, after regeneration:
   `grep -i "Margaret Kane"` and `grep -i "Ezzelino"` against the pack return hits.
3. Entries with no moniker (displayName already is the legal name) are NOT awkwardly
   duplicated (no "Name (Name)").
4. No production writes; regenerate only (no seed change). British English.

## Dev Notes

- `lib/build-character-index.mjs`: add `legalName: c.name` to each entry (displayName and
  sortName already computed).
- `lib/serialise-pack.mjs` `renderCharacterIndex`: when `legalName` differs from `sortName`
  (i.e. a moniker is in use), append " (<legalName>)" to the bullet. Pure render change.
- Live-data typo to flag to Peter (NOT fixed here): the character record stores "MArgaret
  Kane" (capital A). Rendering uses whatever is stored; a case-insensitive lookup still
  resolves.

## Tasks / Subtasks

- [x] Add `legalName` to the index entry in `build-character-index.mjs`.
- [x] Render legal name in `serialise-pack.mjs` when it differs from the moniker.
- [x] Regenerate; confirm AC2 (grep legal names) and AC3 (no duplication).

## Dev Agent Record

### Implementation
- `lib/build-character-index.mjs`: added `legalName: c.name` to each entry.
- `lib/serialise-pack.mjs` `renderCharacterIndex`: appends ` (<legalName>)` to the bullet
  when `legalName !== sortName` (i.e. a moniker is in use); no suffix when displayName is
  already the legal name.

### Testing / validation
Regenerated pack (exit 0), grepped:
- AC2 ✅ `- Protector Doc (Margaret Kane) — …` and `- Etsy (Don Ezzelino Rocio) — …` now
  present; legal names resolvable. Fix generalises: Cazz (Casamir), Gel (Jelle Dunneweld),
  Mac (Macheath), Keeper (Henry St. John) all now show legal names too.
- AC3 ✅ no-moniker entries (e.g. Conrad Sondergaard) show no "(name)" duplication.
- Regression ✅ `grep -ci "haven="` → 0.

Note: this is the systematic root-cause fix; the 2.8 one-off "Henry St. John" disambiguation
alias was a symptom of this same gap (it can stay as belt-and-braces).

### File List
- `lib/build-character-index.mjs` (modified)
- `lib/serialise-pack.mjs` (modified)
- `out/drafting-pack.md` (regenerated — gitignored)

## QA Review

**Verdict: APPROVE (independent, 2026-06-24).** AC2 (Margaret Kane / Ezzelino now
resolvable), AC3 (no "Name (Name)" duplication; honorific-only and no-moniker entries
correctly suppress the parenthetical) and the haven-PII regression check all PASS. Guard
condition `legalName && legalName !== sortName` confirmed structurally correct, not just
data-passing. Status: review -> done.

## References
- Live-run findings: `scratchpad/dt4full/FINDINGS.md` section A (correction).
- Relates to [[feedback_refer_by_moniker]] (display uses moniker; the pack must still carry
  the legal name for cross-referencing submissions).
