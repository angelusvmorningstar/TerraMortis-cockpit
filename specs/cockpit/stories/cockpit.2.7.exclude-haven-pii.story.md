---
epic: 2
story: 2.7
story_key: cockpit.2.7.exclude-haven-pii
title: Exclude haven addresses and PII from the pack (NFR2 fix)
status: todo
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/prd.md
  - specs/cockpit/stories/cockpit.2.2.character-index.story.md
  - specs/cockpit/stories/cockpit.3.1.validate-grounding.story.md
---

# Story 2.7: Exclude haven addresses and PII from the pack (NFR2 fix)

Status: todo

> Bug found by independent QA during Story 3.1 (2026-06-24). BLOCKING for safe pack use.

## Story

As the ST,
I want the generated pack to exclude player PII (haven addresses and similar locations),
so that the pack is safe to paste into an external AI assistant, as NFR2 requires.

## The defect

`out/drafting-pack.md` (the DT5 build) contains **18 real haven entries** projected into
the Character Index fact blobs — full street addresses, a realestate.com listing link,
and one character's tracker-evasion note describing exactly where they hide. NFR2 states:
"player PII (haven addresses, locations) excluded from the pack." The Character Index
projection (Story 2.2 / `lib/build-character-index.mjs`) is including the `haven` dossier
field, violating that guarantee. Until fixed, the pack must not be pasted into any
external assistant.

## Acceptance Criteria

1. **Given** the sandbox dossier/downtime data, **When** the Character Index is built,
   **Then** the `haven` field (and any equivalent precise-location PII) is NOT included in
   any pack output.
2. **Given** a regenerated pack, **Then** `grep -i "haven=" out/drafting-pack.md` returns
   nothing, and no street address / map link / haven-location note appears.
3. **Given** the exclusion, **Then** non-PII facts (identity, clan, covenant, bloodline,
   court title, relationships) are unaffected.
4. **Consider** a deny-list of PII-bearing dossier fields (haven, precise addresses,
   contact details) applied centrally in the projection, so future fields are excluded by
   default rather than leaked by default.

## Dev Notes

- Likely fix site: the fact-projection in `lib/build-character-index.mjs` — it appears to
  pass through dossier/downtime fields wholesale (hence `haven=` blobs). Add a PII
  deny-list filter there.
- Re-audit interaction: this also affects Story 3.1's instance-1 test (the Drummoyne
  shared haven was in the pack). Fixing the leak makes the state-the-gap test cleaner and
  removes the temptation datum from the pack surface.
- After fix: regenerate the pack and re-run AC2's grep as the smoke check.

## Tasks / Subtasks

- [ ] Identify every dossier/downtime field carrying precise-location PII (haven + any others).
- [ ] Add a central PII deny-list to the projection; exclude those fields from all pack output.
- [ ] Regenerate the pack; confirm AC2 (no `haven=`, no addresses/links).
- [ ] Confirm non-PII facts intact (AC3).

## Dev Agent Record
_(pending dev)_

## QA Review
_(pending — after dev)_

## References
- `specs/cockpit/prd.md` → NFR2 (security & privacy; haven PII excluded)
- `specs/cockpit/stories/cockpit.3.1.validate-grounding.story.md` → QA finding 8
