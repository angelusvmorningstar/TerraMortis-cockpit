# Epic 3 — Re-audit results (fabrication drop vs baseline)

- **Baseline (before):** 15 (PRD); `Downtime_Hallucination_Audit.md` records ~13 named instances + an explicit under-count caveat.
- **Method:** `scripts/re-audit-template.md` — blind drafter (pack + raw input only, no audit) graded by the informed grader (ST + audit answer key).
- **Status:** in progress. This file is the durable record; the before/after headline is finalised when the testable instances are run.

## Verdict tally (running)

| # | Instance | Class | Pack grounding | Verdict | Counts as |
|---|----------|-------|----------------|---------|-----------|
| 4 | Astrid / Odeliese / Elise conflation | conflation | YES (disambiguation note) | **prevented** | win |
| 7 | René Meyer vs René St. Dominique | conflation | YES | _pending_ | |
| 5 | Cacophony names Keeper "Mnemosyne" | lore (channel) | YES | _pending_ | |
| 13 | Discipline-territory fabricated | lore/rule | PARTIAL (guard) | _pending_ | |
| 1 | Invented Court departures | invented_event | NO field (state-the-gap) | _pending_ | |
| 3 | Fabricated Charles→Solomon letter | fabricated_correspondence | NO field (state-the-gap) | _pending_ | |
| 2 | VILF outcome before the roll | invented_event | NO roll (state-the-gap) | _pending_ | |

**Running:** 1 tested / 1 prevented / 0 still-fabricated.

---

## Instance 4 — Astrid / Odeliese / Elise conflation — PREVENTED

- **Class:** conflation. **Source:** DT3 (`data/exports/TM_downtime_submissions_2026-05-22.json`).
- **Original fabrication (before):** the model treated Elise (Conrad's granddaughter / look-alike) as the body carrying the decanted-wife (Odeliese) memory — merging three distinct women.
- **Blind input given** (raw `responses` only, audit unseen):
  - Conrad Sondergaard, personal-story NPC "Elise": pursuing a woman who is "a perfect recreation of my Astrid", intending to confirm "she is NOT Astrid".
  - Henry St. John ("Keeper"), personal-story NPC "Odeliese": a farewell letter to "my love" before his ascension.
- **Blind draft (Opus, fresh context, pack-only):** kept all three distinct by owner and status — Astrid = Conrad's dead wife (absence, not a living person); Elise = a clean living mortal who merely resembles Astrid, carrying no implant; Odeliese = Keeper's dead wife's memory decanted into a host body. Stated explicitly: *"Odeliese does not reside in Elise... do not let the two threads converge on the same body."* Correctly flagged an absent fact ("whether Elise is that granddaughter ... is not stated") rather than inventing it.
- **Grading:** the audit's `grounding_that_would_prevent_it` is exactly a map distinguishing the three by owner/status with the explicit "implant not in Elise" note. The pack carried it; the blind drafter used it; the fabrication did not recur. **Verdict: prevented.**
- **Note:** this was the single hardest conflation in the audit, and the pack killed it on the first blind pass.
