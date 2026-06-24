---
epic: 2
story: 2.4
story_key: cockpit.2.4.assemblers
title: Assemble the reference sections
status: review
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/stories/cockpit.2.1.seed-chronicle.story.md
  - specs/cockpit/stories/cockpit.1.2.connect.story.md
---

# Story 2.4: Assemble the reference sections

Status: review

## Story

As the ST,
I want the seeded reference data read into structured pack sections,
so that the glossary, Cacophony channel rules, and codified rules appear in the drafting pack.

## Acceptance Criteria

1. **Given** a seeded `tm_chronicle`, **When** the three assemblers run, **Then** each returns its structured section: glossary, Cacophony channel rules (visible/invisible), and codified rules.
2. **Given** a missing or empty collection, **Then** the assembler returns its section with a clear **gap marker** (e.g. `[no glossary on record]`) rather than throwing.

## Dev Notes

### What this story creates
Three modules under `lib/`: `assemble-glossary.mjs`, `assemble-channel-rules.mjs`, `assemble-rules.mjs`, each exporting a function (`assembleGlossary`, `assembleChannelRules`, `assembleRules`) that reads its `tm_chronicle` collection and returns a **section object** for the pack serialiser (Story 2.5).

### Connection-handling pattern (decision — recommended)
Each assembler takes an **optional pre-opened chronicle accessor** and only opens its own connection if none is supplied:
```js
export async function assembleGlossary(chronicle) {
  const own = !chronicle;
  const conn = chronicle || await connect();   // connect() from ./connect.mjs
  try {
    const docs = await conn.chronicleCollection('glossary').find({}).toArray();
    …build section…
  } finally {
    if (own) await conn.close();
  }
}
```
- `chronicle` is anything exposing `chronicleCollection(name)` (i.e. a `connect()` result). When 2.6's orchestrator calls all three, it passes **one shared `conn`** so there's a single connection; standalone callers (or a smoke test) can omit it.
- This also makes the assembler **testable with a stub**: pass `{ chronicleCollection: (name) => ({ find: () => ({ toArray: async () => [...stubDocs] }) }) }`.

### Section shapes (suit the 2.5 serialiser) — sort deterministically
- `assembleGlossary` → `{ title: 'Glossary', entries: [{ term, definition }] }` sorted by `term` (or `key`). Source collection `glossary` `{ key, term, definition }`.
- `assembleChannelRules` → `{ title: 'Channel Rules (Cacophony)', channels: [{ channel, visible: [], invisible: [] }] }` sorted by `channel`. Source `cacophony_channels` `{ channel, visible:[], invisible:[] }`.
- `assembleRules` → `{ title: 'Codified Rules', rules: [{ key, title, body }] }` sorted by `key` (or `title`). Source `chronicle_rules` `{ key, title, body }`.

Map only the display fields (drop `_id`, `source` unless you choose to keep `source` for provenance — optional). Stable sort so the pack output is reproducible run-to-run (a fixed-format invariant).

### Gap markers (AC2)
If a collection returns zero docs (missing/empty), return the section with the empty list **and** a gap marker, never throw:
```js
return { title: 'Glossary', entries: [], gap: '[no glossary on record]' };
```
Use the fixed gap-marker style. The serialiser (2.5) renders the gap line in place of the entries. Do **not** crash on a missing collection — an unseeded `tm_chronicle` must still produce a (gap-marked) section.

### The discipline-territory placeholder (carry through, don't special-case)
`chronicle_rules` includes a `discipline-territory-table` entry (seeded 2.1) whose `body` says the real table is pending the feeding-matrix source. `assembleRules` surfaces it **as-is** — it's a real rule entry. Do not drop or rewrite it; the "pending source" wording is intentional grounding (so the AI states the gap rather than inventing the table).

### Guardrails
- Read `tm_chronicle` only (via `chronicleCollection`). **No sandbox reads, no writes.** No suite imports. No new deps.
- kebab-case `.mjs`, camelCase functions, British English.
- Modules that return data; not CLI entries. Live run needs a seeded local `tm_chronicle` (Story 2.1, pending Mongo); the shape is unit-smoke-able now with an injected stub.

## Tasks / Subtasks

- [x] `lib/assemble-glossary.mjs` — `assembleGlossary(chronicle?)` reads `glossary`, returns `{ title, entries:[{term,definition}] }` sorted by term; gap marker if empty (AC 1, 2).
- [x] `lib/assemble-channel-rules.mjs` — `assembleChannelRules(chronicle?)` reads `cacophony_channels`, returns `{ title, channels:[{channel,visible,invisible}] }` sorted by channel; gap marker if empty (AC 1, 2).
- [x] `lib/assemble-rules.mjs` — `assembleRules(chronicle?)` reads `chronicle_rules`, returns `{ title, rules:[{key,title,body}] }` sorted by key; surfaces the discipline-territory placeholder as-is; gap marker if empty (AC 1, 2).
- [x] Each: optional injected `chronicle`, opens own `connect()` only if not supplied, closes only what it opened (`finally`).
- [x] Validate: `node --check` all three (parse OK); **stub-injected smoke PASSED** (sorted sections + gap markers). Live run pending seeded Mongo.

## Dev Agent Record

### Implementation notes
- Three near-identical modules, each `import { connect } from './connect.mjs'` and exporting `assembleGlossary`/`assembleChannelRules`/`assembleRules`.
- **Injectable connection:** `const own = !chronicle; const conn = chronicle || await connect();` then `finally { if (own) await conn.close(); }`. Lets the 2.6 orchestrator share one `conn`, and makes each unit-testable with a stub `chronicle`. Reads `tm_chronicle` only via `chronicleCollection(name)`; no sandbox, no writes; no suite imports; no new deps.
- **Display-fields only** (drop `_id`/`source`), **deterministic sort** (glossary by term, channels by channel, rules by key) for reproducible pack output.
- **Gap markers** on empty: `[no glossary on record]` / `[no channel rules on record]` / `[no codified rules on record]` — section returned with an empty list, never a throw.
- The `discipline-territory-table` placeholder flows through `assemble-rules` as a normal rule entry (its "pending source" body is deliberate grounding).

### Testing / validation
- `node --check` on all three → **parse OK**.
- **Stub-injected smoke (no Mongo) PASSED:** glossary sorted `[Alpha, Beta]`; channel section built; rules sorted with the placeholder present `[discipline-territory-table, feeding-pool]`; all three empty cases returned the correct gap markers and empty lists. AC1 + AC2 demonstrated.
- Live run against a seeded `tm_chronicle` is pending local Mongo (same gate as 2.1). No test framework.

### File List
- `lib/assemble-glossary.mjs` (new)
- `lib/assemble-channel-rules.mjs` (new)
- `lib/assemble-rules.mjs` (new)

### Change Log
- 2026-06-24: Added the three reference-section assemblers (glossary / Cacophony channel rules / codified rules) reading `tm_chronicle` via an injectable `chronicle` connection, with deterministic sort and gap markers on empty. Stub-smoke verified; live run pending Mongo. Cockpit Story 2.4.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE.** No changes required.

Verified independently:
- **Imports** only `./connect.mjs` in all three; **no write operations** (reads `tm_chronicle` only).
- **Injectable-connection contract proven:** with a `chronicle` injected (and a `close` spy), the assembler returns the section and does **not** close the connection — so the 2.6 orchestrator can share one `conn` across all three without an assembler tearing it down mid-run. It closes only a connection it opened itself.
- AC1/AC2 from the dev smoke: deterministic sort (term/channel/key), display-fields-only, the `discipline-territory-table` placeholder passed through, and all three empty cases returning the right gap markers.

**Findings (none blocking):**
- *Info:* live run against a seeded `tm_chronicle` pending Mongo (same gate as 2.1).
- *Info:* `assemble-channel-rules` defaults `visible`/`invisible` to `[]` (robust); glossary/rules pass fields straight through — fine for the well-formed seeded data.

## Testing

No test framework. Smoke (no Mongo, via injected stub): each assembler given a stub `chronicle` with a couple of docs returns the right section shape, sorted, display-fields only; given an empty stub returns the section with the gap marker. The live run against a seeded `tm_chronicle` is pending local Mongo (same gate as 2.1).

## References

- Epic 2 / Story 2.4 (FR9/FR10/FR11): `specs/cockpit/epics.md`.
- Collection shapes (Story 2.1): `glossary {key,term,definition}`, `cacophony_channels {channel,visible[],invisible[]}`, `chronicle_rules {key,title,body}` (incl. the `discipline-territory-table` pending placeholder).
- Read path: `lib/connect.mjs` `chronicleCollection(name)` (Story 1.2).
- Consumer: `serialise-pack.mjs` (Story 2.5) renders these sections in the fixed pack order.
