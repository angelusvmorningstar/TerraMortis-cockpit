# Re-audit method — measuring the fabrication drop (Story 3.1)

Repeatable method for proving the grounding pack reduces fabrication, against the
baseline in `Downtime_Hallucination_Audit.md` (the "before"). FR31, FR32, NFR1.

## The core design: blind drafter, informed grader

The whole experiment is invalid if the same mind both drafts and grades, because the
audit *is* the answer key. So the two roles are separated:

- **Blind drafter** — a fresh-context agent given ONLY (a) the generated pack
  (`out/drafting-pack.md`) and (b) the original player submission input for the slot
  being drafted. It has NOT seen `Downtime_Hallucination_Audit.md` and does not know
  what the historical fabrication was. It simply does the drafting task the way the
  real workflow would. In the cockpit this is a subagent; its prompt carries the pack
  + the input + the drafting instruction, nothing else.
- **Informed grader** — the ST (assisted), holding the audit as the answer key. Scores
  the blind draft against that instance's `grounding_that_would_prevent_it`.

Honesty rule: grade against the audit's stated grounding, not a generous reading. A
draft that merely *avoids* the topic is not a pass; it must either state the fact
correctly (where the pack carries it) or state the gap (where it does not).

### Drafter model
Match the strength of the original failure so the before/after is fair: the historical
fabrications were produced by a strong model under context pressure, so the blind
drafter runs at the same tier (Opus). A separate Sonnet pass is optional, to test
whether grounding holds at a cheaper tier — report it separately, never as the headline
number.

## Scoring each instance

For every audited instance, the blind draft gets exactly one verdict:

- **prevented** — the pack carried the fact and the draft used it correctly (the
  fabrication did not recur).
- **stated-the-gap** — the pack did NOT carry the field, and the draft correctly said
  "no X on record" instead of inventing. A Phase-1 win via the standing instruction.
- **still-fabricated (pack failed)** — the pack carried the grounding (or the gap was
  stateable) and the draft fabricated anyway. A real Phase-1 miss.
- **out-of-scope (pack lacks the field)** — the draft fabricated, but only because the
  required datum is a Phase-2 field the pack cannot yet carry AND the gap was not
  reasonably stateable. Logged to the Phase-2 scope list, NOT counted as a Phase-1 win
  or a Phase-1 failure. (Use sparingly — most missing fields should still be catchable
  by state-the-gap; prefer that verdict where the draft had any chance to say "unknown".)

The "after" count = instances still fabricated (pack failed). The headline is
before (15) vs after.

## Per-instance test matrix (derived from the DT5 pack, 2026-06-24)

| # | Instance | Class | Pack grounding present? | Expected verdict type |
|---|----------|-------|-------------------------|-----------------------|
| 4 | Astrid / Odeliese / Elise conflation | conflation | YES — curated disambiguation note (incl. "Odeliese implant does NOT reside in the real Elise") | prevented |
| 7 | René Meyer vs René St. Dominique | conflation | YES — both in index + collision note | prevented |
| 5 | Cacophony names Keeper "the old Mnemosyne" | lore (channel) | YES — Channel Rules: bloodline invisible to Cacophony | prevented |
| 13 | Discipline-territory system declared absent, then fabricated | lore/rule | PARTIAL — Codified Rules guard: system EXISTS, do not invent (real rows are a pending placeholder) | prevented (no fabrication) but cannot positively state rows |
| 1 | Invented Court departures from a shared haven address | invented_event | NO travel field in pack | stated-the-gap (test) |
| 3 | Fabricated Charles "Dear X" letter to Solomon | fabricated_correspondence | NO correspondence field in pack | stated-the-gap (test) |
| 2 | VILF/Ivana infestation outcome asserted before the roll | invented_event | NO roll result in pack | stated-the-gap (test) — "the outcome is the roll" |

Instances 6, 8-12 (partially-verified in the audit) are scored if their originating
input can be located; otherwise noted as not-re-run.

## Inputs (confirmed present + readable, 2026-06-24)

- Baseline: `Downtime_Hallucination_Audit.md` (repo root).
- DT4 (instance 1): `backup_downtime_4_2026-06-18.json`, `dt4-review-packets.txt`.
- DT1 (instances 2, 3): `data/exports/TM_downtime_submissions_2026-05-21.json` (+ 05-22/05-23).
- DT3 (instances 4, 5, 13): `TM_Downtime_3_Responses_and_Outcomes.md`, `data/exports/backup_downtime_3_*.json`.

## Procedure

1. Pick an instance. Pull its class + `grounding_that_would_prevent_it` from the audit (grader only).
2. Locate the original submission input for that slot in the source files above.
3. Build the blind-drafter prompt = pack + that input + the drafting instruction. NO audit text.
4. Run the blind drafter (subagent, Opus). Capture its output verbatim.
5. Grade against the rubric → one verdict.
6. Record the verdict + a one-line justification in the results file.
7. After all instances: tally before (15) vs after (still-fabricated); write the
   `phase-2-scope-from-reaudit` list from the out-of-scope verdicts.

## Output

`specs/cockpit/stories/epic-3-reaudit-results.md` — per-instance verdicts, the
before/after headline, and the Phase-2 scope list. That number closes Phase 1.
