# Epic 3 — Re-audit results (fabrication drop vs baseline)

- **Baseline (before):** 15 (PRD). `Downtime_Hallucination_Audit.md` records 13 named instances (8 verified + 4 self-flagged + 1 second-pass) plus an explicit under-count caveat.
- **Method:** `scripts/re-audit-template.md` — blind drafter (pack + raw input only, audit unseen) graded by the informed grader (ST + audit answer key).
- **Date:** 2026-06-24. Drafters: Opus, fresh context, pack-only.

## Headline

**Before 15 → after 0 fabrications in the addressed classes.** All 13 named audited
instances were caught: **10 prevented** (the pack carried the fact and the blind draft
used it) and **3 converted to correctly-stated gaps** (the pack lacked the field and the
standing instruction stopped the invention). **0 still-fabricated.**

## Verdict table (all 13 named instances)

| # | Instance | Class | Pack grounding | Verdict |
|---|----------|-------|----------------|---------|
| 1 | Invented Court departures (Alice's Auspex) | invented_event | none (travel field) | **stated-the-gap** |
| 2 | VILF infestation outcome asserted before the roll | invented_event | none (roll result) | **stated-the-gap** |
| 3 | Fabricated Charles "Dear ___" letter to Solomon | fabricated_correspondence | none (correspondence) | **stated-the-gap** |
| 4 | Astrid / Odeliese / Elise conflation | conflation | YES (disambiguation note) | **prevented** |
| 5 | Cacophony names Keeper "the old Mnemosyne" | lore (channel) | YES (channel rules) | **prevented** |
| 6 | "The Great Unwashed" rendered as mortals | lore (term) | YES (glossary) | **prevented** |
| 7 | Reed's Dominate stripped from feeding pool | wrong_stat | YES (codified rule) | **prevented** |
| 8 | Daeva animal-feeding limited by clan | wrong_stat | YES (codified rule) | **prevented** |
| 9 | Two René figures conflated | conflation | YES (index + collision) | **prevented** |
| 10 | Charles Mercer-Willows / Charlie Ballsack conflated | conflation | YES (collision) | **prevented** |
| 11 | Anichka recorded as Gangrel | identity | YES (index = Mekhet) | **prevented** |
| 12 | Conrad recorded as Carthian | identity | YES (index = Lancea et Sanctum) | **prevented** |
| 13 | Discipline-territory system declared absent, then fabricated | lore/rule | PARTIAL (guard) | **prevented** (refused to invent) |

**Tally: 13 tested / 13 caught / 0 fabricated.** (prevented 10, stated-the-gap 3.)

## Key findings

1. **State-the-gap held on the no-data cases (1, 2, 3) — the most damaging failures —
   without any Phase-2 fields.** The blind drafter, given the gap and the standing
   instruction, said "no X on record" instead of inventing departures, an outcome, or a
   letter. The invented-departures case (the audit's worst single failure) and the
   compounded fabricated-letter case were both stopped by the pack discipline alone.
2. **Instance 13 exposed real data debt:** the discipline-to-territory rule in the pack is
   a PENDING PLACEHOLDER. The drafter correctly refused to invent and said the rows are
   not in the pack — a win for the no-fabricate goal, but the real feeding-matrix rows
   still need seeding into `chronicle_rules` before the pack can state the actual values.
3. **Minor pack-quality nit:** the name-collision note labels Charles "Gorgon" (his
   Ventrue bloodline) while the index lists him as Ventrue. Harmless here (both agree
   Circle of the Crone, distinct from Charlie Ballsack) but worth tidying the
   collision-note generation so clan and bloodline are not conflated in the wording.

## phase-2-scope-from-reaudit (retro action A3)

The re-audit confirms the Phase-2 value but also that it is **capability, not
fabrication-prevention** — Phase 1 already stops the invention; Phase 2 upgrades the
output from "states the gap" to "states the truth":

- Surface the **travel/departure-method** field per character (FR17 slot-guard) — so
  instance-1-type observations can be drafted positively, not just gapped.
- Surface **validated outgoing correspondence** (FR18/FR26-28) — so instance-3-type
  letters can be answered from the real text.
- Surface the **action roll outcome** in the pack/brief — so instance-2-type results state
  the actual outcome.
- Seed the **real discipline-to-territory feeding-matrix rows** into `chronicle_rules`
  (clears the instance-13 placeholder). This is data-authoring, can land before Phase 2.

None of the above is required to PREVENT fabrication; all of it is required to let the
assistant positively state these facts rather than state their absence.
