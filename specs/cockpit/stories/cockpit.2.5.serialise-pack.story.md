---
epic: 2
story: 2.5
story_key: cockpit.2.5.serialise-pack
title: Serialise the drafting pack
status: done
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/stories/cockpit.2.2.character-index.story.md
  - specs/cockpit/stories/cockpit.2.3.detect-collisions.story.md
  - specs/cockpit/stories/cockpit.2.4.assemblers.story.md
---

# Story 2.5: Serialise the drafting pack

Status: done

## Story

As the ST,
I want a fixed-format markdown pack assembled from the index, collisions, and reference sections,
so that every regeneration is reproducible and the assistant is told to state gaps rather than fill them.

## Acceptance Criteria

1. **Given** the index, collisions, and the three reference sections, **When** `serialisePack(...)` runs, **Then** it returns markdown in the **fixed order**: header → `## Character Index` → `## Glossary` → `## Channel Rules (Cacophony)` → `## Codified Rules` → `## Standing instruction`.
2. **Given** any blank/absent data, **Then** it renders the **fixed gap markers** (e.g. `[none on record]` passed through from the index; a section's `gap` line in place of its list) — never omitted, never invented; provenance is carried where available.
3. **Given** the output, **Then** the **state-the-gap instruction appears verbatim**, and all generated text is British English.

## Dev Notes

### What this story creates
`lib/serialise-pack.mjs` exporting `serialisePack({ label, characterIndex, collisions, glossary, channelRules, rules })` — a **PURE** function: data in, markdown string out. **No DB, no I/O, no `connect` import, no suite import.** The 2.6 orchestrator builds the inputs (index/collisions/sections) and calls this; it writes the returned string to `out/drafting-pack.md`.

This is the **most testable** module in the build — there is **no pending-Mongo gate**. Smoke it fully with stub inputs.

### Inputs (already-built shapes from Stories 2.2-2.4)
- `characterIndex` = `{ characters: [{ displayName, clan, covenant, bloodline, courtTitle, dossierFacts: [{tag,value,source}], npcs: [{name,isCorrespondent}] }], npcs: [...] }` (Story 2.2). The `clan/covenant/bloodline/courtTitle` values already carry `[none on record]` for blanks — render them as-is.
- `collisions` = `{ collisions: [{ forename, members: [{displayName, kind, disambiguator}] }], curated: [{ key, names, note }] }` (Story 2.3).
- `glossary` / `channelRules` / `rules` = the section objects from Story 2.4: `{ title, entries|channels|rules, gap? }`.

### The fixed pack format (the invariant — emit exactly this order)
```
# Drafting Pack — <label>

_Generated from tm_suite_dev. Draft only from what follows._

## Character Index
(projection · displayName · clan · covenant · bloodline · court title)

- <displayName> — <clan> · <covenant> · <bloodline> · <courtTitle>
  …one line per character, sorted by sortName/displayName for stable output…
  (where dossierFacts exist, optionally a compact sub-line: `facts: <tag>=<value> (<source>); …` — provenance, FR14)

⚠ NAME COLLISIONS
- "<forename>" — <N> distinct:
    • <member.displayName> (<member.disambiguator>)   ← one bullet per member
- <curated.names joined " / ">: <curated.note>        ← one line per curated note
(omit the whole ⚠ block only if both collisions.collisions and collisions.curated are empty)

## Glossary
- **<term>** — <definition>          ← one per entry
(if glossary.gap: render the gap line instead, e.g. `glossary.gap`)

## Channel Rules (Cacophony)
- **<channel>** — visible: <visible joined ", ">; invisible: <invisible joined ", ">
(if channelRules.gap: the gap line)

## Codified Rules
- **<title>** — <body>               ← one per rule (the discipline-territory placeholder appears here as-is)
(if rules.gap: the gap line)

## Standing instruction
Draft only from the facts above and the submission text provided. Where a fact is absent, say so ("no X on record") — never invent it. Resolve identity only via the Character Index; never by name-matching.
```

- **Header label** is passed in (`label`) — do NOT call `Date.now()`/`new Date()` (unavailable in cockpit scripts; the orchestrator passes any cycle name/timestamp).
- **Standing instruction is verbatim** — copy the wording above exactly (confirm against `specs/cockpit/architecture.md` "Format Patterns / Standing instruction"; if the architecture's wording differs, the architecture wins — read it and match).
- **Stable ordering everywhere** (characters sorted; sections already sorted by 2.4) so the same inputs always produce byte-identical output (a fixed-format invariant).
- Escape nothing exotic; this is plain markdown. Keep it readable when pasted into an AI assistant.

### Guardrails
- PURE: no DB, no `connect`, no file writes, no `Date.now`/`Math.random`/`new Date`. No new deps. No suite imports.
- kebab-case `.mjs`, camelCase helpers (e.g. `renderCharacterIndex`, `renderSection`), British English.
- Render gap-bearing sections via their `gap` field; never throw on empty/missing inputs (treat missing `characterIndex.characters` as `[]`, etc.).

## Tasks / Subtasks

- [x] `lib/serialise-pack.mjs` exporting `serialisePack({ label, characterIndex, collisions, glossary, channelRules, rules })` (AC 1) — emits the fixed section order with small per-section render helpers.
- [x] Character Index block: identity line per character (sorted by sortName), optional dossier-facts sub-line with `(source)` provenance, then the `⚠ NAME COLLISIONS` block from `collisions.collisions` + `collisions.curated` (AC 2, FR14).
- [x] Reference sections: render glossary/channel/rules; if a section has `gap`, render the gap line instead of its list (AC 2).
- [x] Standing instruction verbatim; British English throughout (AC 3).
- [x] Validate: `node --check` (parse OK); **full stub smoke PASSED** — all six order/gap/collision/instruction assertions green (see below).

## Dev Agent Record

### Implementation notes
- `lib/serialise-pack.mjs` exporting `serialisePack({ label, characterIndex, collisions, glossary, channelRules, rules })`. **Pure** — data in → markdown string out; no DB, no I/O, no `connect`/suite imports, no `Date.now`/`new Date`/`Math.random`, no new deps. The `label` is passed in by the 2.6 orchestrator.
- Small camelCase render helpers (`renderCharacterIndex`, `renderGlossary`, `renderChannelRules`, `renderRules`) emit the **fixed section order**: header + generation note → `## Character Index` (+ `⚠ NAME COLLISIONS`) → `## Glossary` → `## Channel Rules (Cacophony)` → `## Codified Rules` → `## Standing instruction`.
- Characters sorted by `sortName || displayName` for byte-stable output. `[none on record]` and section `gap` lines pass through verbatim — never omitted, never invented. Dossier facts render with `(source)` provenance (FR14). Standing instruction is the verbatim wording. Robust to missing inputs (`?? []` / `?.` guards) — never throws. British English.

### Testing / validation
- `node --check lib/serialise-pack.mjs` → **parse OK**.
- **Full pure smoke (no Mongo) PASSED.** Stub inputs (two characters incl. `[none on record]` fields, a three-Renés collision, the Astrid/Odeliese/Elise curated note, a populated glossary + channel section, and a **gapped** rules section). All six assertions green: fixed section order (monotonic `indexOf` of the six headings), `[none on record]` present, the `rené` collision lists **3** members, the `Astrid / Odeliese / Elise` curated line present, the rules section shows `[no codified rules on record]`, and the standing instruction (`…never invent it.`) is verbatim. The full rendered pack was inspected and reads as a clean, pasteable drafting pack.
- This module had **no pending-Mongo gate** — it is fully verified.

### File List
- `lib/serialise-pack.mjs` (new)

### Change Log
- 2026-06-24: Closed out (status review → done). Integration-validated by the Phase 1 live end-to-end run (Story 2.6): `generate-pack.mjs DT5` exercised this story’s code over real seeded data, exit 0. QA already on record.
- 2026-06-24: Added `lib/serialise-pack.mjs` — pure fixed-order markdown serialiser for the drafting pack (header → Character Index + collisions → Glossary → Channel Rules → Codified Rules → Standing instruction), with gap-marker passthrough, dossier-fact provenance, and the verbatim state-the-gap instruction. Fully smoke-verified. Cockpit Story 2.5.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE.** No changes required.

Verified independently:
- **Pure** — confirmed no `import`/`Date`/`Math.random`/`fs`/`connect` in code (the only matches were in the descriptive header comment).
- **Robustness** — `serialisePack()` (no args) does not throw and still emits the skeleton + verbatim standing instruction; an all-empty/gapped input renders the gap lines and correctly omits the `⚠ NAME COLLISIONS` block.
- **Determinism + stable sort** — identical output on repeat; characters sorted by `sortName` (A before B).
- Fixed section order (dev smoke), `[none on record]`/section-gap passthrough, dossier `(source)` provenance, verbatim instruction.

**Findings (none blocking):**
- *Info:* section bodies/definitions render inline, so ST-authored reference text containing markdown could affect formatting — acceptable for trusted Phase-1 content.

## Testing

No test framework, but this module is **fully testable now with no Mongo** (pure). The stub smoke asserts the fixed order (indexOf the six headings is monotonically increasing), gap-marker passthrough, collision rendering, and the verbatim instruction. There is **no pending-Mongo gate** for this story.

## References

- Epic 2 / Story 2.5 (FR8/FR13/FR14): `specs/cockpit/epics.md`.
- Fixed pack format + standing instruction wording: `specs/cockpit/architecture.md` (Implementation Patterns → Format Patterns — the Drafting Pack).
- Inputs: `buildCharacterIndex` (2.2), `detectCollisions` (2.3), the three assemblers (2.4).
- Consumer: `generate-pack.mjs` (2.6) writes the returned string to `out/drafting-pack.md`.
