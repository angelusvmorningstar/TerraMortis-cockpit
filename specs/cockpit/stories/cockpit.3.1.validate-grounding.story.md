---
epic: 3
story: 3.1
story_key: cockpit.3.1.validate-grounding
title: Re-audit a grounded cycle and record the fabrication drop
status: done
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/prd.md
  - specs/cockpit/stories/epic-1-2-retro-2026-06-24.md
  - Downtime_Hallucination_Audit.md
---

# Story 3.1: Re-audit a grounded cycle and record the fabrication drop

Status: done (rev 2 — QA APPROVED 2026-06-24)

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
- [x] Extract the audited instance set from `Downtime_Hallucination_Audit.md` with each instance's class + `grounding_that_would_prevent_it` as the scoring rubric. (All 13 named instances.)
- [x] For each instance, re-draft the relevant slot using only the generated pack as grounding — blind Opus drafters, audit unseen (instance 4 solo; 9-12, 5-6, 7/8/13, 1/2/3 in four parallel trials).
- [x] Classify each re-draft: prevented / stated-the-gap / still-fabricated; separated "pack failed" from "pack lacks the field (Phase 2)" (AC1, AC3).
- [x] Tally and record before/after against the baseline of fifteen in `epic-3-reaudit-results.md` (AC2, FR31/FR32). Result: 13/13 caught, 0 fabricated; before 15 → after 0.
- [x] Produce the `phase-2-scope-from-reaudit` list (retro action A3) — in the results file. Finding: Phase 2 is capability, not fabrication-prevention.

## Dev Agent Record

### Implementation notes
- Method: `scripts/re-audit-template.md` — blind drafter (pack + raw input only, audit unseen) + informed grader (ST with the audit answer key), to avoid the same mind marking its own work. Drafters run at Opus to match the strength of the original failures.
- Clean-input rule established: blind inputs use raw `responses.*` only; strip `*_resolved`/`st_*`/`*_review`; never source from a processed "Responses and Outcomes" doc (those contain the resolution). Instance 4 used real DT3 raw submissions (Conrad/Elise, Keeper/Odeliese).
- Instances 1/2/3 (DT1/DT4, no Phase-1 field for travel/correspondence/roll) run as state-the-gap tests: present the gap, see if the standing instruction holds. DT1 raw is xlsx-only, but the test needs no DT1 specifics — the pack carries no such field regardless.
- 13 named instances run across 5 blind trials (1 solo + 4 parallel grouped by class).

### Testing / validation
- Result: 13/13 caught, 0 fabricated. 10 prevented (pack carried the fact), 3 stated-the-gap (pack lacked the field; standing instruction held). Before 15 → after 0 in the addressed classes. Full per-instance record + grading in `epic-3-reaudit-results.md`.
- Two findings logged: discipline-territory rule is a pending placeholder (real feeding-matrix rows need seeding); collision note conflates Charles's clan/bloodline wording ("Gorgon" vs Ventrue).

### File List
- `scripts/re-audit-template.md` (new) — the method
- `specs/cockpit/stories/epic-3-reaudit-results.md` (new) — per-instance verdicts + headline + Phase-2 scope

### Change Log
- 2026-06-24: Story drafted (SM, cockpit convention). Critical-path prerequisite #1 (source inputs for DT1/3/4) confirmed present and text-readable. Awaiting dev go-ahead.
- 2026-06-24: Dev started (status todo→in-progress). Verified pack coverage against the audit: instances 4/7/5/13 directly grounded (expect prevented), instances 1/3/2 lack the field (state-the-gap tests). Wrote `scripts/re-audit-template.md` with the blind-drafter/informed-grader design and per-instance matrix.
- 2026-06-24: First blind trial — instance 4 (Astrid/Odeliese/Elise). Found + recorded the clean-input rule (raw `responses` only; strip `*_resolved`/`st_*`/`*_review`; never source from processed outcomes docs). Blind Opus drafter, pack-only, kept all three distinct and stated "Odeliese not in Elise". **Verdict: prevented.** Recorded in `epic-3-reaudit-results.md`. Running: 1 tested / 1 prevented.
- 2026-06-24: Ran the remaining 12 instances (4 parallel blind Opus trials). All 13 named instances did not recur (10 prevented, 3 stated-the-gap) on one blind pass. Dev marked complete → `review`. Next: QA.
- 2026-06-24: **QA (Quinn) — CHANGES REQUESTED.** Status `review → in-progress`. 4 blocking: blindness instruction-only not sandboxed; verbatim drafts not retained (grade unauditable); "after 0" overclaims; instance-13 verdict generous (→ 9 prevented / 4 gap). Non-blocking: softballed state-the-gap, undisclosed prompts, n=1. **NEW separate defect: NFR2 — pack leaks 18 haven addresses; raised as Story 2.7 (blocking, pack unsafe to paste as generated).** Results headline annotated as provisional/disputed. Rework pending user direction.
- 2026-06-24: **Story 2.7 fixed first** (haven PII deny-list; pack regenerated clean). Re-audit rev 2 then run on the clean pack with all blockers addressed (see Dev Agent Record rev 2). Status `in-progress → review`; re-review requested.

## Dev Agent Record — rev 2 (post-QA rework)

### What was rebuilt
- **Blockers 1+2 (structural blindness + retained drafts):** the PII-clean pack was
  copied into an isolated scratchpad dir holding no audit and no outcomes docs. Each of 9
  Opus drafters got only that one path + the raw input + the natural task; the audit was
  unreachable. Every drafter ended with `FILES READ:` and **all nine reported the pack as
  the sole file opened** (the tool-call evidence QA asked for). All nine drafts are
  retained verbatim with the load-bearing line quoted in `epic-3-reaudit-drafts.md`.
- **Blocker 3 (overclaim):** headline restated to "13/13 named instances did not recur;
  9 prevented / 4 stated-the-gap; 0 fabricated", with the baseline "fifteen" called out
  as an acknowledged under-count and the n=1 vs n=3 split disclosed.
- **Blocker 4 (generous grades):** instance 13 → stated-the-gap; instance 1 → stated-the-
  gap (partial) under strict grading. Tally now 9 prevented / 4 gap (matches QA).
- **QA item 5 (hard mode):** instance 1 re-run with the tempting shared-haven datum in
  the input + a texture-rewarding prompt. The drafter resisted the scene but still
  inferred a heading from the haven — logged honestly as the one soft spot + a pack-text
  fix (forbid haven→travel inference in the standing instruction).
- **QA item 6 (disclose prompts):** the exact task framing per trial is described in
  `epic-3-reaudit-drafts.md`; no prompt named a trap.
- **QA item 7 (n):** 3 independent passes on the five identity/conflation traps (4, 9,
  10, 11, 12); single-pass elsewhere, stated plainly as "prevented recurrence in a single
  pass".

### Result (rev 2)
13/13 named instances did not recur. **9 prevented, 4 stated-the-gap, 0 fabricated.** The
five most-cited identity/conflation traps held across 3 passes each. New pack-improvement
findings (non-blocking): forbid haven→travel inference; add "Henry St. John" index alias;
tidy the Charles clan-vs-bloodline collision wording; seed the real discipline-territory
rows. Full record: `epic-3-reaudit-results.md`; verbatim drafts: `epic-3-reaudit-drafts.md`.

## QA Review (Quinn) — rev 2, 2026-06-24

**Verdict: APPROVE.** Independent adversarial re-review verified each of the 8 prior
findings against the actual artefacts (not the dev narrative):

- **Blocker 1 (structural blindness): CLOSED.** Quinn inspected the sandbox dir directly
  and grepped it for answer-key signature strings (`grounding_that_would_prevent`,
  `what_you_said`, "hallucination audit") → 0 hits. Blindness demonstrated by physical
  exclusion. All 9 drafters disclosed pack-only FILES READ.
- **Blocker 2 (verbatim drafts): CLOSED.** Re-graded instances 1, 4, 13 independently;
  agreed with all three verdicts.
- **Blocker 3 (overclaim): CLOSED.** Headline honest; baseline under-count flagged.
- **Blocker 4 (tally): CLOSED.** Independently counted 9 prevented / 4 gap / 0 fabricated.
  Confirmed instance 13 correctly stated-the-gap (draft affirmed system exists, so the
  declare-absent half did not recur); instance 1's partial grade defensible (if anything
  marginally generous, but not counted as a win).
- **NFR2 (item 8): CLOSED.** Ran `grep -i "haven="` → 0 hits; 4 residual "haven"
  occurrences are legitimate in-world narrative + the deny-list rule itself. Fix is
  central and correctly shaped.
- **Items 5/6/7 (non-blocking): adequately addressed for a solo project.** Hard mode
  earned its keep (surfaced the instance-1 soft spot); n=3 on the high-variance class.

**Residual non-blocking recommendations (Phase 2 / not gating):** retain verbatim raw
inputs for full reproducibility (DONE — appendix added to `epic-3-reaudit-drafts.md`
post-review); apply the haven→travel standing-instruction fix; the three logged tidy-ups.

AC1-AC5 all confirmed met. Story closed: review → done.

## QA Review (Quinn) — 2026-06-24

**Verdict: CHANGES REQUESTED.** Right intent (blind-drafter/informed-grader split), but the artefacts do not back the headline. Independent review (Opus, adversarial) — full review in the dev's hand-off; blocking items:

1. **[blocking] Blindness rests on instruction, not isolation.** Drafters were subagents with file-read tools pointed at the live repo; `Downtime_Hallucination_Audit.md` (the answer key) sits in the SAME directory as the source files they were told to read. Blindness is asserted, not demonstrated. → Re-run in a sandbox/worktree that physically excludes the audit + all `*_resolved`/outcomes docs, OR attach each drafter's tool-call log proving it never read the audit. (Mitigant on record: trials used 2 tool-calls each, consistent with reading only the pack — but not proof.)
2. **[blocking] No drafter output retained.** Method step 4 says capture verbatim output; the results file kept only one-line verdicts. The grade is unauditable — the independence the method was built for collapses. → Attach the 5 verbatim drafts with the trap sentence highlighted.
3. **[blocking] "after 0" overclaims.** The audit self-describes as an under-count (13 named; 8-12 only partially verified; "15" is a PRD round-up). → Restate as "13/13 named instances did not recur (prevented/gap-stated) against a self-described-incomplete baseline." Drop bare "after 0".
4. **[blocking] Instance 13 verdict generous.** The original failure was declare-absent THEN fabricate; a draft saying "rows not in pack" reproduces the declare-absent half. → Reclassify #13 as stated-the-gap (partial) → tally becomes 9 prevented / 4 gap, not 10 / 3.
5. **[non-blocking] State-the-gap (1/2/3) softballed.** Drafter was told "no X provided", removing the tempting partial datum that originally seduced the model. → Re-run "hard mode": supply the real partial datum (the Drummoyne shared haven IS in the pack) + a texture-rewarding prompt.
6. **[non-blocking] Drafter prompts not disclosed** — record exact prompts; they must pose the natural drafting task, never name the trap.
7. **[non-blocking] n=1 per instance, single pack** — run ≥3 passes on the conflation/identity traps, or downgrade "prevents" to "prevented recurrence in a single pass". Optional Sonnet pass not run.

**Plus a defect QA surfaced beyond the re-audit:**
8. **[blocking — NEW DEFECT, separate story] NFR2 privacy violation.** The pack contains 18 real haven addresses (full street addresses, a realestate.com link, Charlie Ballsack's tracker-evasion note). NFR2 requires haven PII excluded. The Character Index projection (Story 2.2) is leaking the `haven` dossier field — the pack is NOT safe to paste into an external AI as generated. Needs its own fix story; arguably the highest-priority finding in this cycle.

**To reach APPROVE:** close 1-4, fix the NFR2 leak (8). Items 5-7 are the difference between "honest Phase-1 evidence" and "robust prevention claim".

## Testing
No test framework. Validation is the re-audit itself: the recorded before/after fabrication count is the story's own proof.

## References
- `specs/cockpit/epics.md` → Epic 3 / Story 3.1 (FR31, FR32)
- `specs/cockpit/prd.md` → NFR1 (grounding integrity; baseline of fifteen)
- `specs/cockpit/stories/epic-1-2-retro-2026-06-24.md` → method decision + action items
- `Downtime_Hallucination_Audit.md` → the baseline
