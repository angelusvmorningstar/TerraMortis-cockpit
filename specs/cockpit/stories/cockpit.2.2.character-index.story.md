---
epic: 2
story: 2.2
story_key: cockpit.2.2.character-index
title: Build the Character Index (projection)
status: review
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/stories/cockpit.1.2.connect.story.md
  - specs/cockpit/stories/cockpit.2.1.seed-chronicle.story.md
---

# Story 2.2: Build the Character Index (projection)

Status: review

## Story

As the ST,
I want a Character Index projected live from the sandbox,
so that the drafting pack always has correct identities and the assistant never invents or mis-assigns clan, covenant, or bloodline.

## Acceptance Criteria

1. **Given** `tm_suite_dev`, **When** `buildCharacterIndex()` runs, **Then** it returns one entry per **non-retired** character with `displayName` (honorific + moniker || name), `clan`, `covenant`, `bloodline`, and `courtTitle`, with `character_dossier` and `npcs` left-joined.
2. **Given** the read path, **Then** it **writes nothing** back to any collection — guaranteed structurally because it reads via `connect.mjs`'s `sandboxCollection` (the read-only wrapper exposes no write method).
3. **Given** a missing field, **Then** it is **marked, not omitted** — `bloodline`, `courtTitle` (and any absent identity field) render as the gap marker `[none on record]`, never dropped.

## Dev Notes

### Confirmed live schema (queried read-only from `tm_suite` — the sandbox has the same shapes)

**`characters`** (exact fields):
- `_id` (ObjectId), `name` (string), `clan` (string, e.g. "Mekhet"), `covenant` (string, e.g. "Invictus"), `bloodline` (string **or null**), `court_title` (string **or null**), `honorific` (string or null, e.g. "Lord"), `moniker` (string **or null**), `retired` (boolean).
- Non-retired filter: `{ retired: { $ne: true } }` (robust if the field is absent on some docs).

**`npcs`** (48 docs): `name`, `is_correspondent` (bool), and an **optional** `created_by: { type, player_id, character_id }`. ST-created NPCs (e.g. Odeliese) have **no** `created_by`. The NPC→character link, when present, is `created_by.character_id` — **a string**, not an ObjectId.

**`character_dossier`** (30 docs): `character_id` (**ObjectId** → `characters._id`), `facts: [{ tag, value, source }]` (EAV tagged facts; `source` e.g. "history" gives provenance).

> **id-type nuance (must handle):** `character_dossier.character_id` is an **ObjectId**; `npcs.created_by.character_id` is a **string**. Normalise both to string when keying the join (`String(id)` / `_id.toString()`).

### What this story creates
`lib/build-character-index.mjs` exporting `buildCharacterIndex()` — a **module that returns data**, used by `serialise-pack.mjs` (2.5). It is NOT the CLI entry (that is `generate-pack.mjs`, 2.6). No `_id`-less stored copy: the return value is an in-memory structure only.

### Projection-not-copy (the central invariant)
Read **only** via `connect()`'s `sandboxCollection(name)`. That wrapper exposes `find/findOne/aggregate/distinct/count` only — there is **no write method**, so AC2 ("writes nothing") is guaranteed by construction. Do **not** add a write, do **not** persist the index to any collection or file. (The pack file is written later by 2.6, from this in-memory data.)

### Build approach (JS join — simplest for ~30 chars)
1. `const conn = await connect();`
2. `characters = await conn.sandboxCollection('characters').find({ retired: { $ne: true } }).toArray();`
3. `dossiers = await conn.sandboxCollection('character_dossier').find({}).toArray();` → `Map` keyed by `String(d.character_id)`.
4. `npcs = await conn.sandboxCollection('npcs').find({}).toArray();` → group by `String(n.created_by?.character_id)` where present; keep the full list too.
5. For each character build an entry (below); attach its dossier facts and any character-linked NPCs.
6. `await conn.close();` return the structure.

(Alternative: a `$lookup` aggregate via `sandboxCollection('characters').aggregate([...])` — allowed read-only. The JS join is clearer at this scale; either is acceptable.)

### Entry shape (suits the 2.5 serialiser)
```
{
  id: String(c._id),
  displayName: [c.honorific, (c.moniker || c.name)].filter(Boolean).join(' '),   // "Lord Wan Yelong"
  sortName: c.moniker || c.name,
  clan: orGap(c.clan),
  covenant: orGap(c.covenant),
  bloodline: orGap(c.bloodline),
  courtTitle: orGap(c.court_title),
  dossierFacts: [{ tag, value, source }, …],   // from character_dossier; source = provenance (FR14)
  npcs: [{ name, isCorrespondent }],            // NPCs linked via created_by.character_id (may be empty)
}
```
- `displayName` rule = honorific + (moniker || name); `sortName` = moniker || name. **Reimplement the rule** — do NOT import the suite's `displayName` helper (separate repo).
- `orGap(v)` helper: returns `[none on record]` for `null`/`undefined`/empty-string; otherwise `v`. This is the architecture's fixed gap-marker (AC3).

### NPC inclusion (FR7) — decision
Return NPCs **both** ways: a top-level **parallel list** of all NPCs (`{ name, isCorrespondent, linkedCharacterId? }`) AND, where `created_by.character_id` matches, attached to that character's `npcs`. Rationale: Story 2.3's collision detection needs every name (characters + NPCs, e.g. Odeliese for the Astrid/Odeliese/Elise disambiguation) in one namespace, and most NPCs are not character-linked. So `buildCharacterIndex()` returns e.g. `{ characters: [...entries], npcs: [...all npcs] }`.

### Provenance (FR14)
Each dossier fact already carries `source` (e.g. "history") — surface it. The index entry is sourced from `characters` (the sheet) with dossier/npcs joined; note "(sheet)" vs "(dossier)" provenance at serialisation (2.5) using these fields.

### Guardrails
- kebab-case `.mjs`, camelCase functions, British English. No new dependencies.
- Reads `tm_suite_dev` only, via the read-only sandbox surface. Never writes.
- Running it needs a seeded local `tm_suite_dev` (Story 1.3, your step) + local Mongo — **pending**. Dev MAY `node --check` and reason about the logic; the live run is the same environment gate as prior stories.

## Tasks / Subtasks

- [x] Create `lib/build-character-index.mjs` exporting `buildCharacterIndex()` (AC 1) — reads non-retired characters, dossiers, npcs via `sandboxCollection`; JS-joins by string-normalised `character_id`; returns `{ characters: [entries], npcs: [all] }`.
- [x] `orGap()` gap-marker helper + the `displayName`/`sortName` rule (reimplemented locally, not imported) (AC 1, 3).
- [x] Attach dossier `facts` (with `source`) and character-linked NPCs per entry; build the parallel NPC list incl. ST-created NPCs (AC 1, FR7, provenance).
- [x] Confirm read-only: no write call anywhere; uses `sandboxCollection` only (AC 2). Closes the connection in `finally`.
- [x] Validate: `node --check` (parse OK); local Mongo down + sandbox unseeded, so the live throwaway run is **pending** (recorded below).

## Dev Agent Record

### Implementation notes
- Single module `lib/build-character-index.mjs` exporting `buildCharacterIndex()`. Returns `{ characters: [entries], npcs: [all] }` — an in-memory projection, **no stored copy** anywhere.
- **Reads only via `sandboxCollection`** (the read-only wrapper) for characters/`character_dossier`/`npcs` — so AC2 ("writes nothing") holds structurally; grep confirms zero write calls. Connection closed in a `finally`. No suite imports; import is only `./connect.mjs`. No new deps.
- **Non-retired filter** `{ retired: { $ne: true } }` (robust to a missing field).
- **Join id-type nuance handled:** dossiers keyed by `String(d.character_id)` (ObjectId → string); NPCs grouped by `String(n.created_by.character_id)` (already a string). Both normalised, so the join can't silently miss.
- **Entry shape** per the story: `id, displayName (honorific + moniker||name, reimplemented), sortName, clan/covenant/bloodline/courtTitle via orGap, dossierFacts [{tag,value,source}], npcs [character-linked]`.
- **`orGap()`** returns `[none on record]` for null/undefined/empty-string (e.g. Wan Yelong's null `bloodline` → marker) — gap shown, never omitted (AC3).
- **NPC parallel list (FR7)** includes **every** NPC, including ST-created ones with no `created_by` (e.g. Odeliese), each with `linkedCharacterId` (null if unlinked) — so Story 2.3 collision detection sees all names in one namespace.

### Testing / validation
- `node --check lib/build-character-index.mjs` → **parse OK**.
- grep confirmed **no write operations** and **no suite imports** (only `./connect.mjs`).
- Local Mongo is **down** and `tm_suite_dev` is unseeded, so the live run was **not** executed. The live verification — call `buildCharacterIndex()`, assert entry count == non-retired character count, a known null field shows `[none on record]`, a joined dossier fact appears, and the NPC list includes Odeliese — is **pending a seeded local Mongo** (same gate as Story 1.2 AC4 / 1.3 / 2.1). No test framework (manual verification).

### File List
- `lib/build-character-index.mjs` (new)

### Change Log
- 2026-06-24: Added `lib/build-character-index.mjs` — the Character Index projection over `tm_suite_dev` (non-retired characters, left-join `character_dossier` + `npcs`), read-only via `sandboxCollection`, gap markers, reimplemented displayName, parallel all-NPC list for collision detection. Parse-verified; live run pending seeded sandbox. Cockpit Story 2.2.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE.** No changes required.

Verified independently:
- **Projection-not-copy** — grep confirms zero write calls; reads only via the read-only `sandboxCollection`. AC2 holds structurally.
- **Join correctness** — the ObjectId→string (dossier) and string (npc `created_by.character_id`) normalisation is consistent; both keyed by `String(...)`. Live check of `character_dossier` cardinality: **30 distinct characters, max 1 dossier each, 0 with multiples**, so the dossier `Map` (one entry per `character_id`) cannot overwrite/lose facts on the real data.
- **Spec conformance** — `{ retired: { $ne: true } }`; `orGap()` → `[none on record]`; reimplemented `displayName`/`sortName` (no suite import); dossier `facts` with `source` provenance; all-NPC parallel list including ST-created NPCs (Odeliese) with `linkedCharacterId`. Connection closed in `finally`. No new deps; British English.

**Findings (none blocking):**
- *Info:* assumes one dossier doc per character — verified true today (max 1 each). If that invariant ever changes, switch the dossier `Map` from overwrite to merge.
- *Info:* live run (counts == non-retired total, gap markers, join, Odeliese present) pending the seeded sandbox — same gate as Story 1.2 AC4 / 1.3 / 2.1.

## Testing

No test framework (manual verification). Checks: `node --check` parses; with a seeded local `tm_suite_dev`, a throwaway caller prints the entry count (should equal the non-retired character count), shows gap markers on a known null field (e.g. Wan Yelong's `bloodline` → `[none on record]`), and shows a joined dossier fact + the NPC list. Live run pending the seeded sandbox (same gate as Story 1.2 AC4 / 1.3 / 2.1).

## References

- Epic 2 / Story 2.2 (FR4/FR5/FR7/FR14): `specs/cockpit/epics.md`.
- Architecture: projection-not-copy invariant; `lib/build-character-index.mjs` role; gap markers.
- Read path: `lib/connect.mjs` `sandboxCollection(name)` (read-only wrapper) — Story 1.2.
- Live schema (queried read-only 2026-06-24): `characters` (name/clan/covenant/bloodline/court_title/honorific/moniker/retired); `npcs` (name/is_correspondent/created_by.character_id string); `character_dossier` (character_id ObjectId, facts[{tag,value,source}]).
