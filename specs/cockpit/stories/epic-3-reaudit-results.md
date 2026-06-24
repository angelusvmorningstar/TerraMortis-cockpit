# Epic 3 — Re-audit results (fabrication drop vs baseline)

- **Baseline (before):** `Downtime_Hallucination_Audit.md` records 13 named instances
  (8 verified + 4 self-flagged + 1 second-pass) plus an explicit, repeated under-count
  caveat. The PRD rounds this to "fifteen" as a reference figure; that figure is itself
  acknowledged in the audit as an under-count, so it is used as a reference, not a
  precise denominator.
- **Method:** `scripts/re-audit-template.md` — blind drafter (pack + raw input only,
  audit physically unreachable) graded by the informed grader (ST + audit answer key).
- **Date:** 2026-06-24 (rev 2, post-QA). Drafters: Opus, fresh context, sandboxed.

## What changed in rev 2 (closing the QA blockers)

1. **Blindness is now structural, not instructed.** The pack was copied into an isolated
   scratchpad directory that contains no audit and no `*_resolved`/outcomes docs. Each
   drafter's prompt gave only that one path; the audit was not in the prompt and not in
   the reachable directory. Every drafter ended with a `FILES READ:` line and **all nine
   reported the pack as the only file opened.** (Blocker 1 closed.)
2. **Verbatim drafts retained.** All nine drafts are recorded in
   `epic-3-reaudit-drafts.md` with the load-bearing line quoted per instance. The grade
   is now independently checkable. (Blocker 2 closed.)
3. **Headline restated** to what the evidence supports — no bare "after 0". (Blocker 3.)
4. **Instance 13 reclassified** to stated-the-gap; instance 1 reclassified to
   stated-the-gap (partial) under strict grading. Tally is now **9 prevented / 4 gap**.
   (Blocker 4 closed, and applied to instance 1 too.)
5. **n=3 on the headline conflation/identity traps** (instances 4, 9, 10, 11, 12); n=1
   elsewhere. (QA item 7, partially — see robustness note.)
6. **Hard mode on instance 1**: the tempting datum (shared Drummoyne haven) was supplied
   in the input and the prompt rewarded texture. (QA item 5.)

## Headline

**Across a structurally-blind re-run, none of the 13 named audited fabrications
recurred.** Recorded as **9 prevented** (the pack carried the fact and the draft used it
correctly) and **4 stated-the-gap** (the pack lacked the field and the draft said so
instead of inventing). **0 still-fabricated.**

The precise, defensible claim is: *13/13 named instances did not recur on this run; the
five most-cited identity/conflation traps held across three independent passes each.* It
does NOT claim a general "after 0" against all possible fabrications (the baseline is an
acknowledged under-count), nor a reliability ("always prevents") guarantee for the
single-pass instances.

## Verdict table (all 13 named instances)

| # | Instance | Class | Pack grounding | Passes | Verdict |
|---|----------|-------|----------------|--------|---------|
| 1 | Invented Court departures (Alice's Auspex) | invented_event | none (travel field) | 1 (hard) | **stated-the-gap (partial)** |
| 2 | VILF infestation outcome asserted before the roll | invented_event | none (roll result) | 1 | **stated-the-gap** |
| 3 | Fabricated Charles "Dear ___" letter to Solomon | fabricated_correspondence | none (correspondence) | 1 | **stated-the-gap** |
| 4 | Astrid / Odeliese / Elise conflation | conflation | YES (disambiguation note) | 3 | **prevented** (3/3) |
| 5 | Cacophony names Keeper "the old Mnemosyne" | lore (channel) | YES (channel rules) | 1 | **prevented** |
| 6 | "The Great Unwashed" rendered as mortals | lore (term) | YES (glossary) | 1 | **prevented** |
| 7 | Reed's Dominate stripped from feeding pool | wrong_stat | YES (codified rule) | 1 | **prevented** |
| 8 | Daeva animal-feeding limited by clan | wrong_stat | YES (codified rule) | 1 | **prevented** |
| 9 | Two René figures conflated | conflation | YES (index + collision) | 3 | **prevented** (3/3) |
| 10 | Charles Mercer-Willows / Charlie Ballsack conflated | conflation | YES (collision) | 3 | **prevented** (3/3) |
| 11 | Anichka recorded as Gangrel | identity | YES (index = Mekhet) | 3 | **prevented** (3/3) |
| 12 | Conrad recorded as Carthian | identity | YES (index = Lancea et Sanctum) | 3 | **prevented** (3/3) |
| 13 | Discipline-territory system declared absent, then fabricated | lore/rule | PARTIAL (guard, rows pending) | 1 | **stated-the-gap** |

**Tally: 13 named / 0 still-fabricated. 9 prevented, 4 stated-the-gap.**

## Robustness note (honesty about n)

- Instances 4, 9, 10, 11, 12 held across **3 independent passes each** — for those the
  claim is "prevented recurrence repeatably", not just once.
- Instances 1, 2, 3, 5, 6, 7, 8, 13 are **single-pass**. For those the claim is
  "prevented recurrence in a single pass". A wider multi-pass run would harden them; not
  done here on cost grounds (solo project) and because they are lower-variance (rule and
  glossary lookups, or absence-statements, rather than ambiguous identity resolution).

## Key findings

1. **State-the-gap held on the no-data cases (1, 2, 3, 13) — the most damaging class —
   with no Phase-2 fields.** Given the gap and the standing instruction, the drafter said
   "no X on record" instead of inventing departures, an outcome, a letter, or a rule
   table. The compounded fabricated-letter case (instance 3, the audit's "damaging twice
   over" failure) and the declare-absent-then-fabricate case (instance 13) were both
   stopped.
2. **Instance 1 is the one soft spot, and the strict grade exposes it.** The drafter
   resisted the whole fabricated surveillance beat but still inferred a *heading* ("west
   toward Drummoyne") from the shared-haven datum — exactly the haven→travel substitution
   the audit warns against. → **Pack improvement:** the standing instruction should state
   explicitly that a haven location must never be used to infer travel direction or
   method. Cheap text fix; lands before Phase 2.
3. **Identity/conflation grounding is robust (n=3).** Two Renés, Charles vs Charlie,
   Anichka, Conrad never merged or mis-clanned across nine total identity judgements.
4. **Minor pack defects re-confirmed (non-fabrication, tidy-ups):**
   - Collision note labels Charles "Gorgon" (bloodline) while the index lists clan
     Ventrue — tidy the collision-note generation so clan and bloodline are not conflated.
   - "Henry St. John" is not a literal index entry (only "Senator Keeper"); add the alias
     so the Keeper resolves by name as well as by collision note.
   - Instance 13's real feeding-matrix rows are still a pending placeholder — seed them
     into `chronicle_rules` so the pack can state the actual atmospheric effects, not just
     refuse to invent them. (Data authoring; can land before Phase 2.)

## phase-2-scope-from-reaudit (retro action A3)

The re-audit confirms Phase 2's value is **capability, not fabrication-prevention** —
Phase 1 already stops the invention; Phase 2 upgrades "states the gap" to "states the
truth":

- Surface the **travel/departure-method** field per character (FR17) — lets instance-1
  observations be drafted positively instead of gapped, AND removes the haven-substitution
  temptation entirely.
- Surface **validated outgoing correspondence** (FR18/FR26-28) — lets instance-3 letters
  be answered from the real text.
- Surface the **action roll outcome** — lets instance-2 results state the actual outcome.
- Seed the **real discipline-to-territory feeding-matrix rows** (clears instance-13's
  placeholder). Data-authoring; can land before Phase 2.

None of the above is required to PREVENT fabrication; all of it is required to let the
assistant positively state these facts rather than state their absence.
