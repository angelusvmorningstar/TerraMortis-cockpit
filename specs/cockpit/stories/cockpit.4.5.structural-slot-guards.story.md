---
epic: 4
story: 4.5
story_key: cockpit.4.5.structural-slot-guards
title: Structural slot-guards (no haven→travel; validated-letter-only)
status: superseded
phase: 2
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/stories/cockpit.4.4.assembled-drafting-prompt.story.md
---

# Story 4.5: Structural slot-guards (no haven→travel; validated-letter-only)

Status: superseded by 4.4 + the context-assembler decision (2026-06-24)

## Disposition: SUPERSEDED — not built

The two structural slot-guards (FR17 no haven→travel; FR18 validated-letter-only) were
scoped when the cockpit might auto-populate drafting slots or call an LLM that could
mis-fill them. The Epic 4 architecture decision (2026-06-24) made the cockpit a
**context-assembler**: it never auto-fills a slot and never drafts — it assembles a prompt
the ST runs in their own AI.

In that model the "guard" is the prompt text, and **Story 4.4 already prints it**:
- `Travel: [none on record] - do not infer from a haven.`
- `Prior letters: [none validated this cycle].`
- the closing TASK line: `Do not infer travel direction or method from a haven.`
- plus the pack's standing instruction (sliced live).

There is no slot being filled to guard structurally, so there is nothing left to enforce in
code beyond what 4.4 emits. Building a separate "structural guard" would be enforcing a
rule against a code path that does not exist.

**If the decision ever flips to in-app drafting** (the cockpit calling an LLM), reopen this
story: then the guards become real (the cockpit would be choosing what goes into each slot
and must be prevented from putting a haven into a travel slot or an unvalidated letter into
a prior-letter slot).

**FRs:** FR17, FR18 — satisfied at the prompt level by 4.4 for the assembler model;
deferred as structural enforcement unless in-app drafting is adopted.

## References
- `specs/cockpit/stories/cockpit.4.4.assembled-drafting-prompt.story.md`
- Epic 4 architecture decision (epics.md): context-assembler, not in-app LLM.
