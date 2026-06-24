---
epic: 2
story: 2.3
story_key: cockpit.2.3.detect-collisions
title: Detect name collisions
status: done
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/stories/cockpit.2.2.character-index.story.md
  - specs/cockpit/stories/cockpit.2.1.seed-chronicle.story.md
  - ../st-working/downtime-grounding-hardening.md §2.A (curated notes)
---

# Story 2.3: Detect name collisions

Status: done

## Story

As the ST,
I want name collisions surfaced automatically,
so that the assistant never conflates two people who share a name (the audit's biggest single failure class after lore).

## Acceptance Criteria

1. **Given** the Character Index (characters + npcs in one namespace), **When** `detectCollisions(index)` runs, **Then** people sharing a forename are flagged as **distinct** with disambiguators — e.g. the three Renés (René Meyer [Daeva/Carthian], René St. Dominique [Ventrue/Invictus], the René NPC).
2. **Given** unique names, **Then** **no** collision flag is produced.
3. **Given** curated disambiguations are supplied, **Then** any whose names intersect the current people are merged into the output alongside the auto-detected collisions (covers cases the forename match cannot catch, e.g. Charles vs Charlie).

## Dev Notes

### What this story creates
- `lib/detect-collisions.mjs` exporting `detectCollisions(index, disambiguations = [])` — **pure over the index** (no DB) for the auto pass; the curated `disambiguations` are passed **in** as a parameter (the caller, generate-pack 2.6, reads them from `tm_chronicle`). Returns data for the serialiser (2.5); not a CLI entry.
- `seeds/seed-disambiguations.mjs` — a 2.1-style idempotent seed populating the **new** `tm_chronicle.disambiguations` collection with the audit's curated notes (see "Curated content").

### Auto forename collision (the pure pass)
Over the union of `index.characters` (use `sortName`, fall back `displayName`) and `index.npcs` (use `name`):
- `forename = name.trim().split(/\s+/)[0].toLowerCase()` (strip a leading honorific only if it leaked in — `sortName` already excludes the honorific, so the first token is the real forename).
- Group people by `forename`. A **collision** = a forename shared by **≥2 distinct entries**.
- Output per collision: `{ forename, members: [{ displayName, kind: 'character'|'npc', disambiguator }] }` where the disambiguator is, for characters, `clan · covenant · courtTitle`; for NPCs, `"NPC" + (correspondent? / linkedCharacterId?)`.
- Each index entry is one member; no entry collides with itself.

**Verify against real data:** "René" → three distinct members (the two characters + the NPC) ✓. A unique forename → no group ✓.

### Curated disambiguations (the merge pass) — resolves the Story 2.1 flag
Some conflations the forename match **cannot** catch:
- **Charles vs Charlie** — different forenames ("Charles" Mercer-Willows vs "Charlie" Ballsack), so no forename group forms. Needs a curated note.
- **Astrid / Odeliese / Elise** — plot nuance (a decanted-memory implant), not a name clash at all.

`detectCollisions` accepts `disambiguations` (array of `{ key, names: [string], note }`). It includes any disambiguation **whose `names` intersect the current people** (match on full displayName or forename, case-insensitive) in the output as `{ key, names, note, kind: 'curated' }`. Pure: the caller supplies the array.

**DECISION for ST confirmation (recommended):** the curated notes live in a **new `tm_chronicle` reference collection `disambiguations`** (shape `{ key, names: [], note }`), seeded 2.1-style — NOT as glossary entries (they are person-disambiguations, not term definitions). Confirm this at review; if you prefer glossary entries instead, the seed target changes but `detectCollisions` is unaffected (it just takes the array).

### Curated content to seed (verbatim from hardening §2.A — do not invent)
- `rene-meyer-vs-st-dominique` — names `["René Meyer", "René St. Dominique"]` — *"René Meyer (Daeva, Carthian, sire Oscar) is DISTINCT from René St. Dominique (Ventrue, Invictus, Notary)."*
- `charles-vs-charlie` — names `["Charles Mercer-Willows", "Charlie Ballsack"]` — *"Charles Mercer-Willows (Gorgon, Circle of the Crone, ghouled family) is DISTINCT from Charlie Ballsack (Nosferatu, Invictus, ST character)."*
- `astrid-odeliese-elise` — names `["Astrid", "Odeliese", "Elise"]` — *"Astrid (Conrad's dead wife) vs Odeliese (Keeper's dead wife, a decanted memory implanted in a living body) vs Elise (a clean living mortal who merely resembles Astrid). The Odeliese implant does NOT reside in the real Elise."*

### Output shape (suits the 2.5 serialiser)
```
{
  collisions: [ { forename, members: [{ displayName, kind, disambiguator }] } ],  // auto
  curated:    [ { key, names, note } ],                                            // merged-in
}
```

### Guardrails
- `detect-collisions.mjs` is **pure** (no DB, no I/O) for testability; the seed uses `connect().chronicleCollection('disambiguations')` (read/write), idempotent upsert by `key` (mirrors Story 2.1).
- kebab-case `.mjs`, camelCase functions, British English. No new deps. No suite imports.
- The curated seed run + the live merge are pending a local Mongo (parse-check now; same gate as prior stories). The **auto** pass is testable in-memory with a stub index now.

## Tasks / Subtasks

- [x] `lib/detect-collisions.mjs` exporting `detectCollisions(index, disambiguations = [])` — auto forename grouping over characters + npcs (AC 1, 2); curated merge by name intersection (AC 3); returns `{ collisions, curated }`. Pure (no DB, no imports).
- [x] `seeds/seed-disambiguations.mjs` — idempotent upsert (by `key`) of the three curated notes into `tm_chronicle.disambiguations` via `connect().chronicleCollection`.
- [x] Validate: `node --check` both files (parse OK); **in-memory auto-pass smoke PASSED** (see below). Live seed run pending local Mongo.

## Dev Agent Record

### Implementation notes
- `lib/detect-collisions.mjs` exports `detectCollisions(index, disambiguations = [])`. **Pure** — no DB, no I/O, **no imports**; operates only on the passed-in data. The caller (generate-pack 2.6) reads `tm_chronicle.disambiguations` and supplies the array, keeping this module testable.
- Auto pass: forename = first whitespace token of `sortName` (NPCs: `name`), lower-cased; group; collision = forename shared by ≥2 entries. Character disambiguator = `clan · covenant · courtTitle` (gap markers `[none on record]` filtered out); NPC = `NPC[ · correspondent][ · linked]`.
- Curated merge: includes any supplied disambiguation whose `names` intersect the current people (full displayName OR forename, case-insensitive) — covers Charles-vs-Charlie (different forenames) and the Astrid/Odeliese/Elise plot nuance the forename pass can't derive.
- `seeds/seed-disambiguations.mjs` seeds the **new `tm_chronicle.disambiguations`** collection (ST-confirmed home) with the three curated notes verbatim from hardening §2.A, idempotent upsert by `key` via `connect().chronicleCollection`.
- British English; no new deps; kebab-case files, camelCase functions.

### Testing / validation
- `node --check` on both files → **parse OK**.
- **Auto-pass smoke (pure, ran without Mongo)** against a stub index (René Meyer, René St. Dominique, Aleksei Romanov + a René NPC): the `rené` collision returned **3 members** with correct disambiguators (`Daeva · Carthian · Regent` | `Ventrue · Invictus` | `NPC`); `aleksei` produced **no** collision; a supplied `René Meyer` curated note **was** merged while a Charles/Charlie note (not in the cycle) **was not**. **SMOKE PASS** — AC1/AC2/AC3 demonstrated.
- The seed's live run + the live merge against real cycle data are pending a local Mongo (same gate as 2.1). No test framework (manual verification).

### File List
- `lib/detect-collisions.mjs` (new)
- `seeds/seed-disambiguations.mjs` (new)

### Change Log
- 2026-06-24: Closed out (status review → done). Integration-validated by the Phase 1 live end-to-end run (Story 2.6): `generate-pack.mjs DT5` exercised this story’s code over real seeded data, exit 0. QA already on record.
- 2026-06-24: Added `lib/detect-collisions.mjs` (pure forename-collision detector + curated-note merge) and `seeds/seed-disambiguations.mjs` (new `tm_chronicle.disambiguations` collection, three audit-sourced notes). Auto pass smoke-verified (three-Renés → 3 members; unique → none); seed live run pending Mongo. Resolves the Story 2.1 disambiguation-home flag (new collection, ST-confirmed). Cockpit Story 2.3.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE.** No changes required.

Verified independently:
- **`detect-collisions.mjs` is genuinely pure** — no imports, no DB/I-O. Seed imports only `../lib/connect.mjs`.
- **Auto pass** — the dev smoke (three Renés → 3 members; `aleksei` → none) plus an added cross-namespace edge (character "John Smith" + NPC "John Doe" → one `john` collision, members `character,npc`) both correct.
- **Curated merge** — includes only disambiguations whose names intersect the cycle (the dev smoke confirmed `rene-note` merged, Charles/Charlie excluded).
- **Seed fidelity** — content matches hardening §2.A: 4/5 phrases exact; the one flagged ("merely resembles Astrid") is a **line-wrap** in the source, not a change. Substance faithful (Astrid=Conrad's wife; Odeliese=Keeper's wife, decanted-memory implant; Elise resembles Astrid; implant NOT in real Elise). Idempotent upsert by `key` into the new `disambiguations` collection.

**Findings (none blocking):**
- *Info:* seed notes add two articles ("a decanted memory", "a clean living mortal") vs the source for flow — every fact preserved.
- *Info:* the curated merge matches on forename as well as full name, so it may over-surface a note if an unrelated person shares a forename — by design (over-surfacing a disambiguation is safer than missing it).
- *Info:* seed live run pending Mongo (same gate as 2.1).

## Testing

No test framework. The **auto pass is testable now** with a throwaway stub index (no Mongo): assert the three-Renés group has 3 members, a unique forename yields nothing, and a supplied curated disambiguation merges. The seed's live run is pending a local Mongo (same gate as 2.1).

## References

- Epic 2 / Story 2.3 (FR6): `specs/cockpit/epics.md`.
- Input: `buildCharacterIndex()` result (Story 2.2) — `{ characters:[{displayName, sortName, clan, covenant, courtTitle, …}], npcs:[{name, isCorrespondent, linkedCharacterId}] }`.
- Seed pattern + write path: Story 2.1; `connect().chronicleCollection` (Story 1.2).
- Curated content + provenance: `../st-working/downtime-grounding-hardening.md` §2.A; `../Downtime_Hallucination_Audit.md`.
