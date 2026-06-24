---
epic: 4
story: 4.4
story_key: cockpit.4.4.assembled-drafting-prompt
title: Submission intake → assembled, copy-ready grounded prompt
status: done
phase: 2
repo: TerraMortis-cockpit
inputs:
  - public/cockpit.html
  - specs/cockpit/stories/cockpit.4.3.grounded-brief-panel.story.md
---

# Story 4.4: Submission intake → assembled, copy-ready grounded prompt

Status: done (QA APPROVED 2026-06-24)

> The keystone of the context-assembler decision (Epic 4, 2026-06-24): the cockpit does NOT
> call an LLM. It assembles a focused, grounded, copy-ready prompt the ST pastes into their
> own AI. Builds directly on the 4.3 brief.

## Story

As the ST,
I want to pick a character, paste their player submission, and get a single copy-ready
prompt that bundles the grounded brief, the reference prelude, the standing instruction,
and the submission,
so that I can paste one block into my AI and draft the resolution with full grounding.

## Acceptance Criteria

1. A **Draft** view (sidebar): pick a character (reuses the 4.3 selection), a textarea to
   paste the player submission, and a "Build grounded prompt" action.
2. The assembled prompt is **self-contained** and contains, in order: a task framing; the
   character's grounded brief (identity + provenance, gap fields travel/prior-letters,
   dossier facts, "distinct from" collision notes); the reference prelude (glossary,
   channel rules, codified rules) and the pack's **standing instruction** verbatim; the
   pasted submission; and a closing instruction to state gaps and never invent.
3. The standing instruction in the prompt is the **same text the pack carries** (sourced
   from the live pack data, not a separate hardcoded copy that could drift).
4. A **Copy** button copies the assembled prompt to the clipboard; a visible confirmation
   ("copied") is shown.
5. If no character is selected or the submission box is empty, the build action prompts the
   ST rather than producing an empty/partial prompt.
6. Read-only, client-side only; existing views still work; light mode; British English.

## Dev Notes

- Client-side in `public/cockpit.html`. Add a `draft` view: roster (reuse selection) +
  `<textarea>` + Build button + output `<pre>` + Copy button.
- Reuse 4.3 helpers (`renderBrief` building blocks) to produce the brief-as-text. Pull the
  reference sections from `DATA` (glossary.entries, channelRules.channels, rules.rules).
- Standing instruction: slice it from `DATA.markdown` after the "## Standing instruction"
  heading so it always matches the pack (no second source of truth).
- Copy: `navigator.clipboard.writeText`; fall back to selecting the `<pre>` if clipboard
  API is unavailable.

## Tasks / Subtasks

- [x] Add Draft view: roster + submission textarea + Build + output + Copy.
- [x] Assemble the prompt (brief text + reference prelude + standing instruction + submission + task).
- [x] Source the standing instruction from DATA.markdown (no drift).
- [x] Copy-to-clipboard with confirmation; empty-state guards.
- [x] Confirm other views still work; read-only unchanged; JS parses.

## Dev Agent Record

### Implementation
Client-side in `public/cockpit.html`:
- New **Draft** sidebar view. `renderDraft()`: roster (reuses `tm_cockpit_char` selection)
  + a submission `<textarea id="subm">` + "Build grounded prompt" + hidden Copy button +
  `<pre id="promptout">` output.
- `assemblePrompt(c, submission)` builds a self-contained prompt: task framing → GROUNDED
  BRIEF (`briefText`: identity + gap rows for travel/prior-letters + "distinct from"
  collisions + dossier facts) → REFERENCE PRELUDE (`refPrelude`: glossary, channel rules,
  codified rules from DATA) → STANDING INSTRUCTION → PLAYER SUBMISSION → TASK.
- `standingInstruction()` slices the text after "## Standing instruction" from
  `DATA.markdown`, so it always matches the pack (no second source of truth — AC3).
- Build reads the live textarea; empty char/submission → inline warning (AC5). Output via
  `textContent` (no HTML injection). Copy uses `navigator.clipboard` with a range-select
  fallback; shows "copied". `SUBMISSION` is kept on `input` so switching characters doesn't
  lose the pasted text.

### Testing / validation
- `GET /` → 200; draft markers present (data-view=draft, renderDraft, assemblePrompt,
  buildp, subm, standingInstruction). Inline JS parses (`new Function`).
- Dry-run of the assembler logic on live DT5 data: standing instruction slices correctly;
  for René St. Dominique the brief surfaces 1 collision group + 1 curated note (so the
  "distinct from" disambiguation lands in the prompt).
- No server change; read-only and byte-identical pack unaffected.
- NOTE: clipboard + visual confirmed by the ST in-browser (no headless browser here).

### File List
- `public/cockpit.html` (modified — Draft / context-assembler view)

## QA Review

**Verdict: APPROVE (independent, 2026-06-24).** All six ACs pass. Critically confirmed the
context-assembler decision holds: the ONLY network call is the GET to /api/pack-data — no
LLM/external API, no POST. Assembled prompt has all six sections in order (task → brief →
reference prelude → standing instruction → submission → task); `standingInstruction()`
slices live `DATA.markdown` (verified against the endpoint — yields the real instruction
mentioning "never invent"/"haven"), not a hardcoded copy; Copy uses clipboard + range
fallback with "copied" confirmation; empty char/submission guard fires correctly; output
via `textContent` (no HTML injection); draft added to TITLES/count/render-map with other
views intact; only public/cockpit.html changed. Post-QA tidy: removed the now-redundant
"Draft workspace" future placeholder. Status: review → done.

## References
- Epic 4 architecture decision: context-assembler, not in-app LLM (epics.md).
- `public/cockpit.html` (4.1/4.2/4.3)
