---
epic: 2
story: 2.1
story_key: cockpit.2.1.seed-chronicle
title: Seed the chronicle reference collections
status: done
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/stories/cockpit.1.2.connect.story.md
  - ../Downtime_Hallucination_Audit.md (sibling TM Suite repo — provenance)
  - ../st-working/downtime-grounding-hardening.md (sibling TM Suite repo — curated content)
---

# Story 2.1: Seed the chronicle reference collections

Status: done

## Story

As the ST,
I want the glossary, Cacophony channel rules, and codified rules populated locally,
so that the drafting pack can carry the setting facts that stop the lore, term, and rule hallucinations the audit caught.

## Acceptance Criteria

1. **Given** the source content, **When** the `seeds/*` scripts run against a local MongoDB, **Then** `tm_chronicle` holds three populated collections — `glossary`, `cacophony_channels`, `chronicle_rules` — with the content listed under "Content to seed" below.
2. **Given** a seed has already run, **When** it is run again, **Then** the result is **idempotent** — no duplicate documents (each doc keyed by a stable `key`/`channel`).
3. **Given** the seeded collections, **Then** each document's shape suits the Story 2.4 assemblers that will render them into pack sections (shapes below).

## Dev Notes

### What this story creates
Three seed scripts under `seeds/`: `seed-glossary.mjs`, `seed-cacophony-channels.mjs`, `seed-chronicle-rules.mjs`. Each embeds its content **as data** (extracted from the suite's audit/hardening docs) and writes it to the matching `tm_chronicle` collection. The seeds **do not import from the TM Suite repo** — the content is copied in as literals.

### Write path (single data boundary)
Write through `connect.mjs`: `const conn = await connect(); const col = conn.chronicleCollection('glossary'); … await conn.close();`. `chronicleCollection(name)` is the read/write helper on `tm_chronicle` (Story 1.2). Note: `connect()` also opens the sandbox client and requires **both** `SANDBOX_URI` and `CHRONICLE_URI` in `.env`; the sandbox connection is unused by the seed but harmless (it only needs the local Mongo server up, not a populated `tm_suite_dev`). This keeps the single-boundary invariant. (Alternative: add a `connectChronicle()` helper to `connect.mjs` — flagged, not required; reusing `connect()` is preferred for Phase 1.)

### Idempotency
Per document use a stable identifier and **upsert**: `updateOne({ key }, { $set: doc }, { upsert: true })` (glossary/rules keyed by `key`; channels keyed by `channel`). Re-running replaces in place — never duplicates. (A whole-collection `deleteMany({})` + `insertMany(set)` is an acceptable alternative since the seed owns the full set, but upsert-by-key is cleaner and preserves any `_id`s.)

### Content shapes (suit the Story 2.4 assemblers)
- `glossary`: `{ key, term, definition }`
- `cacophony_channels`: `{ channel, visible: [string], invisible: [string] }`
- `chronicle_rules`: `{ key, title, body }`

Optionally add a `source` note (e.g. `"audit instance 6"`) for provenance — useful but not required.

### Content to seed (verbatim from the curated hardening doc — do NOT paraphrase loosely or invent)

**glossary** (source: `downtime-grounding-hardening.md` §2.B):
- `the-great-unwashed` — term "the Great Unwashed": *unranked Kindred of the Sydney Court without title or identity at court. NOT the mortal masses.* (Audit instance 6 — was reproduced after correction, so this must be hard-surfaced.)
- `bloodline-names-secret` — term "Bloodline names": *Bloodline names (Mnemosyne, Scions of the First City, etc.) are SECRET, not public.*

**cacophony_channels** (source: §2.C):
- `channel: cacophony` — `visible: [clan, covenant, public title, observable behaviour]`, `invisible: [bloodline, devotions, haven specifics, Court-private matters]`.

**chronicle_rules** (source: §2.D):
- `feeding-pool` — "Feeding pool construction": *Feeding pool = Attribute + Skill base, with a Discipline permitted on top (Dominate in a feeding pool is legal).* (instance 7)
- `animal-feeding-blood-potency` — "Animal feeding capacity": *Animal-feeding capacity is governed by Blood Potency, not clan.* (instance 8)
- `chronicle-timing-overrides-book` — "Timing & reallocation": *Chronicle timing and reallocation rulings override book terminology ("immediately", not "end of chapter").* (instance 14)
- `st-ruling-overrides-default` — "ST rulings override default pathway": *Specific ST rulings override the default rules pathway (e.g. a straight XP refund, not a Sanctity of Merits reallocation).* (instance 15)

### Known gap — the discipline-territory table (flag, do not invent)
The audit's instance 13 references a **discipline-to-territory atmosphere table** whose real content lives in the suite's *feeding-matrix* source file, **not** in the audit/hardening docs. Per the grounding rule "search before declaring absent; never invent a replacement," the dev must **not** fabricate this table. For 2.1, seed a `chronicle_rules` entry `discipline-territory-table` whose body states the table **exists and must be sourced** (e.g. *"A discipline-to-territory atmosphere system exists in the chronicle's feeding matrix; locate and seed its real content — do not invent."*), and flag in the Dev Agent Record that its real rows are pending the feeding-matrix source. (Ironically, inventing it here would reproduce instance 13.)

### Open question (flag, do not silently resolve)
The audit's curated **identity-disambiguation notes** (Rene Meyer vs Rene St. Dominique; Charles Mercer-Willows vs Charlie Ballsack; Astrid vs Odeliese vs Elise — the Odeliese implant does NOT reside in the real Elise) are **reference content**, not auto-detectable by Story 2.3's name-collision pass (which only finds shared forenames, not plot nuance). They are out of scope for 2.1's three collections. Flag for the ST: do these belong in a new `disambiguations` collection, or as `glossary` entries? Decide before Story 2.3.

### Guardrails
- No new dependencies (`mongodb` + `dotenv` already installed). kebab-case `.mjs`, camelCase functions; British English.
- `tm_chronicle` is the **local** reference DB (`CHRONICLE_URI` is local; `connect.mjs`'s guard enforces it). The seed writes locally only.
- Running a seed needs a local MongoDB up (same precondition as `connect.mjs`). The dev agent MAY run the seeds **if** a local Mongo is available; otherwise `node --check` each and record that the live seed is pending local Mongo.

## Tasks / Subtasks

- [x] `seeds/seed-glossary.mjs` (AC 1-3) — upserts the two glossary entries into `tm_chronicle.glossary` via `connect().chronicleCollection('glossary')`; idempotent by `key`.
- [x] `seeds/seed-cacophony-channels.mjs` (AC 1-3) — upserts the `cacophony` channel doc into `cacophony_channels`; idempotent by `channel`.
- [x] `seeds/seed-chronicle-rules.mjs` (AC 1-3) — upserts the four codified rules + the `discipline-territory-table` "exists, must be sourced" placeholder into `chronicle_rules`; idempotent by `key`.
- [x] Each seed prints a one-line summary (counts upserted) and closes the connection.
- [x] Validate: `node --check` each seed (all parse OK). Local Mongo is **down**, so the live run + idempotency check is **pending a running local Mongo** (recorded below) — same gate as Story 1.2 AC4 / Story 1.3.

## Dev Agent Record

### Implementation notes
- Three seed scripts under `seeds/`, each embedding its content as data literals (verbatim from the story's "Content to seed", sourced from the suite's hardening doc) — **no imports from the TM Suite repo**.
- **Idempotent by stable key:** `updateOne({ key }, { $set: doc }, { upsert: true })` for glossary/rules (keyed by `key`) and the channel doc (keyed by `channel`). Re-running replaces in place — never duplicates.
- **Single data boundary:** each seed `import { connect } from '../lib/connect.mjs'`, uses `conn.chronicleCollection(name)` (read/write on `tm_chronicle`), prints a one-line upsert summary, and `conn.close()`s in a `finally`. No new dependencies; British English; kebab-case files, camelCase functions.
- **`discipline-territory-table` is a deliberate PLACEHOLDER, not the table.** Its body states the real system exists in the suite feeding-matrix and must be sourced — inventing the rows would reproduce audit instance 13. Marked `pending: true`. Flagged for follow-up: locate the feeding-matrix source and seed the real rows.
- Carried-forward open question (from the story): the curated identity-disambiguation notes (Rene/Rene, Charles/Charlie, Astrid/Odeliese/Elise) have **no home yet** — out of scope here; decide (new `disambiguations` collection vs glossary entries) before Story 2.3.

### Testing / validation
- `node --check` on all three seeds → **parse OK**.
- Local MongoDB probe (`node lib/connect.mjs` against local URIs) → **MONGO_DOWN**. Per instruction, the seeds were **not** run. The live run (populate the three collections) and the idempotency re-run check are **pending a local Mongo** (same environment gate as Story 1.2 AC4 and Story 1.3's live seed). All three are local-only writes when run; no production access.
- No test framework (repo convention is manual verification).

### File List
- `seeds/seed-glossary.mjs` (new)
- `seeds/seed-cacophony-channels.mjs` (new)
- `seeds/seed-chronicle-rules.mjs` (new)

### Change Log
- 2026-06-24: Closed out (status review → done). Integration-validated by the Phase 1 live end-to-end run (Story 2.6): `generate-pack.mjs DT5` exercised this story’s code over real seeded data, exit 0. QA already on record.
- 2026-06-24: Added the three `tm_chronicle` reference seeds (glossary, cacophony_channels, chronicle_rules) with audit-sourced content, idempotent upserts via `connect.mjs`, and a flagged `discipline-territory-table` placeholder (real rows pending the feeding-matrix source). Parse-verified; live run pending local Mongo. Cockpit Story 2.1.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE.** No changes required.

Verified independently:
- **Content fidelity:** seeded grounding text matches the source hardening doc (§2.B/§2.C/§2.D). Two automated "mismatch" flags were investigated and are non-issues: "without title or identity at court" is split by a **line-wrap** in the source; `"immediately", not "end of chapter"` differs only in comma placement (British logical quotation vs the source's American style) — identical meaning.
- **No suite imports** — all three seeds import only `../lib/connect.mjs`.
- **Idempotency** — all three use `updateOne({ key|channel }, { $set }, { upsert: true })`; provably non-duplicating by inspection.
- **Non-defects handled correctly:** the `discipline-territory-table` stub is a flagged "exists, must be sourced, do not invent" placeholder (avoids reproducing audit instance 13), and the identity-disambiguation-notes home is an open question tracked for before Story 2.3.

**Findings (none blocking):**
- *Info:* the live DB confirmation (populate + idempotent re-run) is pending a running local Mongo — same environment gate as Story 1.2 AC4 / Story 1.3 / the seed itself.
- *Follow-up (tracked, not a defect):* source and seed the real discipline-territory rows from the feeding-matrix file; decide the disambiguation-notes home before Story 2.3.

## Testing

No test framework (repo convention is manual verification). The check is: `node --check` each seed parses; and, with a local Mongo, running each seed populates its collection and a re-run leaves counts unchanged (idempotency). If no local Mongo, parse-check only and note the live run is pending (same gate as Story 1.2 AC4 / Story 1.3).

## References

- Epic 2 / Story 2.1 (FR9-11): `specs/cockpit/epics.md`.
- Architecture: `seeds/` populate `tm_chronicle`; Story 2.4 assemblers read these; collection names `glossary` / `cacophony_channels` / `chronicle_rules`.
- Write path: `lib/connect.mjs` `chronicleCollection(name)` (Story 1.2).
- Curated content + provenance: `../st-working/downtime-grounding-hardening.md` §2.B/§2.C/§2.D; `../Downtime_Hallucination_Audit.md` (the 15 instances).
