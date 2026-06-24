---
epic: 3
story: 3.1
story_key: cockpit.3.1.validate-grounding
title: Re-audit a grounded cycle and record the fabrication drop
status: in-progress
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/prd.md
  - specs/cockpit/stories/epic-1-2-retro-2026-06-24.md
  - Downtime_Hallucination_Audit.md
---

# Story 3.1: Re-audit a grounded cycle and record the fabrication drop

Status: in-progress

> SM-drafted 2026-06-24 (cockpit convention; not the suite `_bmad` flow). Ready for dev on Angelus's go. This is Epic 3 — the Phase 1 MVP success proof. The generator (Epics 1-2) is done and proven; this story takes the actual reading.

## Story

As the ST,
I want to re-draft the already-audited downtime material through the grounding pack and recount fabrications with the original audit method,
so that I have evidence the pack reduces fabrication against the baseline of fifteen (FR31, FR32, NFR1).

## Acceptance Criteria

1. **Given** `Downtime_Hallucination_Audit.md` as the "before" baseline (~13 named instances; PRD baseline of fifteen) and the confirmed source inputs for the audited DT1/DT3/DT4 material, **When** each audited drafting task is **re-drafted using only the generated pack as grounding**, **Then** the recurrence of fabrication in the addressed classes (identity, conflation, setting-term/lore, rule, invented-event, fabricated-correspondence) is counted with the same classification the original audit used.
2. **Given** the re-draft results, **Then** a before/after is recorded against the baseline of fifteen (FR31, FR32) in a durable results file in the cockpit repo.
3. **Given** any audited fabrication the Phase-1 pack **cannot** prevent (because it needs data the pack does not yet carry — travel fields, validated correspondence, sire), **Then** it is logged into a `phase-2-scope-from-reaudit` list rather than silently passed (retro action A3). Distinguishing "pack failed" from "pack lacks the field" is part of the result.
4. **Given** the method, **Then** `scripts/re-audit-template.md` exists documenting it, so the re-audit is repeatable for future cycles.
5. All generated text and notes are British English; no production writes; reads only the local sandbox/chronicle + the repo's downtime source files.

## Dev Notes

### The decided method (from the Phase 1 retrospective)
Re-draft the **already-audited material**, not a fresh live cycle. The audit *is* the "before" (same inputs → controlled comparison → real delta). A fresh DT5 draft has no before-count and cannot produce a delta; DT5 is only a supplementary "stays clean going forward" check. See `specs/cockpit/stories/epic-1-2-retro-2026-06-24.md`.

### Baseline source
`Downtime_Hallucination_Audit.md` (repo root): 8 verified + 4 partially-verified instances + an explicit under-count caveat; PRD rounds the baseline to fifteen. Each instance carries `class`, `root_cause`, `how_i_caught_it`, and `grounding_that_would_prevent_it` — use those fields directly to score the re-draft.

### Confirmed source inputs (critical-path prerequisite #1 — verified present + text-readable 2026-06-24)
- **DT4** (Alice Auspex departures — instance 1; ground truth: Einar left as a raven): `backup_downtime_4_2026-06-18.json`, `dt4-review-packets.txt` (both contain the travel fields + `raven`/Einar).
- **DT1** (Charles "Dear X" letter to Solomon — instance 3; VILF/Ivana infestation — instance 2): `data/exports/TM_downtime_submissions_2026-05-21.json` (and the 05-22/05-23 exports) contain `solomon` and `vilf`.
- **DT3** (Astrid/Odeliese/Elise conflation — instance 4; Cacophony naming Mnemosyne — instance 5; discipline-territory error — instance 13): `TM_Downtime_3_Responses_and_Outcomes.md` + `data/exports/backup_downtime_3_*.json` + the submission exports.

### What the Phase-1 pack is expected to address vs not
- **Should prevent (pack carries the data):** identity/conflation (the three Renés; Astrid/Odeliese/Elise) via the Character Index + `disambiguations` collection; setting-term/lore (Cacophony naming a bloodline) via the Channel Rules; rule errors (discipline-territory) via the Codified Rules.
- **Tests state-the-gap (pack lacks the field):** the invented departures and the fabricated Charles letter hinge on travel/correspondence fields the Phase-1 pack does NOT carry (Phase 2: FR17/FR18/FR26-28). The test here is whether the verbatim state-the-gap instruction stops the assistant from fabricating when the datum is absent. If a fabrication still occurs, that is a real Phase-1 miss; if the assistant correctly states the gap, that is a Phase-1 win even though the field is Phase-2.

### Deliverables
- `scripts/re-audit-template.md` — the repeatable method (AC4).
- A results record (e.g. `specs/cockpit/stories/epic-3-reaudit-results.md`) — before/after count vs fifteen, per-instance verdict, and the `phase-2-scope-from-reaudit` list.

### Guardrails
- This is an ST-judgement task (the ST grades whether a re-draft fabricated), assisted by the tool. Keep the grading honest: score against the audit's `grounding_that_would_prevent_it`, not against a generous reading.
- No DB writes. Reads: local sandbox/chronicle (for the pack) + the repo downtime source files (for the original inputs).

## Tasks / Subtasks

- [x] Write `scripts/re-audit-template.md`: the method — blind-drafter / informed-grader design, scoring verdicts, per-instance test matrix, inputs, procedure, output (AC4). Done 2026-06-24.
- [ ] Extract the audited instance set from `Downtime_Hallucination_Audit.md` with each instance's class + `grounding_that_would_prevent_it` as the scoring rubric.
- [ ] For each instance, locate the original submission input in the confirmed source files and re-draft the relevant slot using only the generated pack as grounding.
- [ ] Classify each re-draft: prevented / still-fabricated / correctly-stated-gap; separate "pack failed" from "pack lacks the field (Phase 2)" (AC1, AC3).
- [ ] Tally and record before/after against the baseline of fifteen in the results file (AC2, FR31/FR32).
- [ ] Produce the `phase-2-scope-from-reaudit` list (retro action A3) — feeds Epic 4 planning.

## Dev Agent Record

### Implementation notes
_(pending dev)_

### Testing / validation
_(pending dev)_

### File List
_(pending dev)_

### Change Log
- 2026-06-24: Story drafted (SM, cockpit convention). Critical-path prerequisite #1 (source inputs for DT1/3/4) confirmed present and text-readable. Awaiting dev go-ahead.
- 2026-06-24: Dev started (status todo→in-progress). Verified pack coverage against the audit: instances 4/7/5/13 directly grounded (expect prevented), instances 1/3/2 lack the field (state-the-gap tests). Wrote `scripts/re-audit-template.md` with the blind-drafter/informed-grader design and per-instance matrix. Next: run the first blind-drafter trial.

## QA Review
_(pending — runs after dev per the loop: dev-story → QA → done)_

## Testing
No test framework. Validation is the re-audit itself: the recorded before/after fabrication count is the story's own proof.

## References
- `specs/cockpit/epics.md` → Epic 3 / Story 3.1 (FR31, FR32)
- `specs/cockpit/prd.md` → NFR1 (grounding integrity; baseline of fifteen)
- `specs/cockpit/stories/epic-1-2-retro-2026-06-24.md` → method decision + action items
- `Downtime_Hallucination_Audit.md` → the baseline
