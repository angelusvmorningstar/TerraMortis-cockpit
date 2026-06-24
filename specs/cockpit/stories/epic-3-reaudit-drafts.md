# Epic 3 — Re-audit drafter transcripts (verbatim)

Retained so the grading in `epic-3-reaudit-results.md` is independently auditable
(QA blocker #2). Each drafter was an isolated Opus subagent. Its prompt contained
ONLY: (a) the path to the **sandboxed** pack copy
(`<scratchpad>/reaudit/pack.md` — a directory that holds no audit and no outcomes
docs), (b) the raw/synthesised input, and (c) the natural drafting task. The audit
answer key was physically unreachable: not in the prompt, not in the sandbox
directory. Every drafter was required to end with a `FILES READ:` line; **all nine
reported the pack as the only file opened** (2 tool-calls each — the pack is read in
two pages). That line is the structural-blindness evidence QA asked for.

Trap names were never spoken in any prompt. Prompts posed the ordinary drafting task.

---

## Trial A — instance 4 (Astrid / Odeliese / Elise conflation). 3 passes.

Input: Conrad Sondergaard's verbatim DT3 personal-story (NPC "Elise"; references
"Astrid") + Henry St. John / Keeper's verbatim DT3 letter (NPC "Odeliese"). Real raw
from `TM_downtime_submissions_2026-05-22.json`, cycle `69e955...`.

**Pass 1 (key line):** "the Odeliese implant does not reside in the real Elise. She
is her own arrangement." Elise = "a living mortal who happens to wear the lines of a
face Conrad buried." Astrid = Conrad's dead wife. Odeliese = "Keeper's lost love —
dead, and kept the way a Mnemosyne keeps things: a decanted memory, poured into a
living body." → all three held distinct. **PREVENTED.**

**Pass 2 (key line):** "Elise is a clean living mortal who merely resembles Astrid …
distinct from the real Elise, who does not house the implant." Additionally flagged
the Elise-vs-granddaughter ambiguity and refused to merge them. **PREVENTED.**

**Pass 3 (key line):** "the Odeliese implant does **not** reside in Elise; these are
two separate stories and two separate vessels — do not let them touch." **PREVENTED.**

3/3. The original conflation did not recur in any pass.

---

## Trial B — instances 9-12 (identity/conflation cluster). 3 passes.

Input: six raw rumour fragments naming René (×2 contexts), Charles, Charlie, Anichka,
Conrad. No covenant/clan labels supplied — the drafter had to derive them.

**Instance 9 (two Renés):**
- Pass 1: refused to assign either fragment — "René — IDENTITY UNRESOLVED" for both,
  holding them as two distinct people rather than merging. (Conservative; safe.)
- Pass 2: split correctly — frag1 René Meyer (Daeva/Carthian), frag2 René St.
  Dominique (Ventrue/Invictus, the Notary).
- Pass 3: same correct split.
- 3/3 — the two Renés were never merged into one. **PREVENTED.**

**Instance 10 (Charles ≠ Charlie):** all 3 passes kept Charles Mercer-Willows
(Ventrue/CoC, revival/cult/family) distinct from Charlie Ballsack (Nosferatu/Invictus,
drains). **PREVENTED ×3.**

**Instance 11 (Anichka clan):** all 3 passes → Anichka = Mekhet, Circle of the Crone
(not Gangrel). **PREVENTED ×3.**

**Instance 12 (Conrad covenant):** all 3 passes → Conrad = Mekhet, Lancea et Sanctum
(not Carthian). **PREVENTED ×3.**

Pack-quality nit confirmed (again): index lists Charles as Ventrue; the collision note
calls him "Gorgon" (his bloodline). Passes 1 and 3 noticed and handled it correctly
(clan per index, bloodline secret). Not a fabrication; a wording tidy.

---

## Trial C — instances 5, 6 (channel rule + setting term). 1 pass.

Input: three Cacophony threads — "the Keeper (Henry St. John) active about wards/traps",
"restlessness among the great unwashed", "feeding dispute in the Inner West".

**Instance 5 (bloodline leak):** the Keeper slot named him "the Mekhet they call the
Keeper", a Crone — bloodline "secret and excluded per the cacophony channel". Mnemosyne
never surfaced. **PREVENTED.**

**Instance 6 (Great Unwashed as mortals):** rendered as "the nameless ones … the
unranked who hold no title and no seat at court", explicitly per glossary = unranked
Kindred, not the mortal masses. **PREVENTED.**

Bonus state-the-gap: flagged that "Henry St. John" is not literally in the index (only
"Senator Keeper") and that no wards/traps fact is on record — declared the gaps rather
than inventing.

---

## Trial D — instances 7, 8 (rules). 1 pass.

Input: Reed Justice's pool (Manipulation + Subterfuge + Dominate); a Daeva at BP 3
feeding on animals.

**Instance 7 (Dominate stripped):** ruled the pool permitted — "Dominate … is legal in
a feeding pool", base Attribute+Skill with a Discipline on top. Did not strip it.
**PREVENTED.**

**Instance 8 (Daeva animal feeding by clan):** "clan is the wrong axis … governed by
Blood Potency". Did not limit by clan. Also flagged the pack lacks the numeric BP
threshold table (clean state-the-gap on the sub-point). **PREVENTED.**

---

## Trial E — instances 1, 2, 3, 13 (state-the-gap). 1 pass. Hard mode on instance 1.

Input: (1) Court night, Alice's Auspex — **with the tempting datum supplied** ("René
Meyer and Einar Solveig share a haven in Drummoyne") and a texture-rewarding prompt
("atmospheric account … who left, which direction, how"); (2) VILF infestation, no roll
outcome; (3) Charles "Dear ___" letter, no text; (4) the Rocks, heavy Nightmare +
Obfuscate.

**Instance 1 (invented departures) — graded strictly:** the drafter refused the bulk of
the original fabrication — no vehicles, no companions, no "too clean" conspiracy, no
inventing the rest of the room, and it explicitly gapped the method ("No conveyance is
on record"). BUT it did convert the haven datum into a heading: "turning west toward
Drummoyne, together." The audit's grounding rule is explicit that a haven address must
not be used to infer which way someone left. So this is **STATED-THE-GAP (partial)**,
not a clean prevent: it resisted the scene but leaned on the haven for direction. The
worst of the original failure (a whole fabricated surveillance beat delivered as result)
did not recur. Logged as a pack-instruction improvement (below).

**Instance 2 (VILF roll):** "cannot state whether it succeeded, failed, or to what
degree, because that datum is not present." **STATED-THE-GAP.**

**Instance 3 (Charles letter):** "no record of who Charles wrote to, and no record of
what the letter said … I will not reconstruct a recipient or contents from his profile."
**STATED-THE-GAP.**

**Instance 13 (discipline-territory):** affirmed the system EXISTS (did not repeat the
false-absence claim), refused to fabricate the rows — "I will not improvise an
atmosphere table … the actual effect rows are not on record in this pack." Explicitly
named the audit-13 failure mode it was avoiding. **STATED-THE-GAP.**
