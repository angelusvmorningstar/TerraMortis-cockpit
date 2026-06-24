---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
lastStep: 8
completedAt: '2026-06-24'
inputDocuments:
  - specs/cockpit/prd.md
  - st-working/downtime-grounding-hardening.md
  - st-working/character-schema-gap-analysis.md
  - Downtime_Hallucination_Audit.md
  - st-working/research/blades-in-the-dark-factions.md
  - specs/project-context.md
  - specs/architecture/tech-stack.md
  - specs/architecture/system-map.md
workflowType: 'architecture'
project_name: 'Terra Mortis ST Cockpit (Phase 1)'
user_name: 'Angelus'
date: '2026-06-24'
scope: 'Phase 1 MVP only (Tier-1 grounding pack); Phase 2/3 noted as future work, not designed here'
---

# Architecture Decision Document — Terra Mortis ST Cockpit (Phase 1)

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

_Scope: Phase 1 MVP only — the no-UI "Tier-1 grounding pack" (a read-only generator + reference docs + the state-the-gap discipline). Phase 2 (localhost cockpit UI, assembleContext, slot-guards) and Phase 3 (living city, map, factions) are explicitly out of scope here and noted only as future direction._

**Carried constraint (applies in Phase 2, when the UI exists):** the cockpit UI must use the existing normalised CSS design system (tokens from `public/css/theme.css`, reuse `public/css/components.css`; no bare hex, `rgba()`, or inline styles), per `specs/project-context.md`. **Light mode only** — the default Parchment theme; `[data-theme="dark"]` is NOT implemented for the cockpit. (Phase 1 has no UI, so this does not apply yet.)

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements (Phase 1 subset):** sandbox seed + isolation (FR1-3); Character Index as a live projection with collision detection and NPC inclusion (FR4-7); reference-pack assembly of glossary/channel-rules/rules into pasteable output (FR8-12); the state-the-gap grounding discipline and per-fact provenance (FR13-14); regenerate-after-edit (FR22); re-audit and before/after fabrication count (FR31-32). Phase 2/3 FRs (slot-guards, assembleContext service, correspondence, city_events, factions, map) are out of scope here.

**Non-Functional Requirements (architecture drivers):** grounding integrity (full traceability; projection cannot drift; zero-fabrication target vs baseline 15); security/privacy (no production write credentials; PII excluded from the pack; local-only); performance (regeneration in seconds for ~30 characters); reliability (sandbox disposable and re-seedable); maintainability (small AI-codeable modules).

**Scale & Complexity:** bimodal — low engineering, medium-high data/grounding.

- Primary domain: AI-grounding / deterministic context-assembly tooling.
- Complexity level: low-to-medium (Phase 1).
- Estimated components: a CLI entrypoint, a Mongo read/projection layer, an index builder with collision detection, a reference-pack assembler, a pack serialiser, and a re-audit helper.

### Technical Constraints & Dependencies

Localhost only; reuse the existing Node + MongoDB stack; no Tauri/Electron/desktop packaging; not part of the production deploy. Build and test against a local `tm_suite_dev` (seeded read-only from prod). The Character Index is a projection, never a stored copy (SSOT). Grounding is deterministic queries plus a context-packing function, explicitly not a vector DB or RAG. British English; solo-hobby calibration (AI-written code, minimum ceremony).

### Cross-Cutting Concerns Identified

SSOT preservation (projection-not-copy); provenance and traceability of every emitted fact; sandbox isolation as the safety mechanism; the state-the-gap discipline applied to all output; graceful handling of blank or partial sheets and missing NPCs (confirmed empirically during the portrait run, which exercised this projection by hand across ~35 characters).

---

## Starter Template Evaluation

### Primary Technology Domain

CLI tool, an in-repo Node script, not a standalone application. This is a brownfield internal tool, so the relevant foundation is the existing repository, not a greenfield scaffold.

### Starter Options Considered

**None adopted.** A starter template (oclif, a Next/Vite app, etc.) was considered and rejected: it would introduce a second toolchain, new dependencies, and project scaffolding that directly conflict with the PRD's reuse-the-existing-stack constraint and the AI-codeability NFR. Versions were verified from the repo's `server/package.json` rather than the web, because we pin to the existing, already-installed stack rather than introduce anything new.

### Selected Foundation: the existing repository

**Rationale:** Phase 1 is a deterministic generator that reads MongoDB and emits text. The repo already provides everything it needs, the same Node ESM + mongodb-driver pattern the existing `server/scripts/*.mjs` use. Reusing it means no new runtime, no install step, and one toolchain for the AI to reason about.

**Initialization:** no scaffold command. The first implementation story is simply creating the generator entry script in the repo (home decided in the next step: a new `cockpit/` directory, or `server/scripts/` alongside the existing tools).

**Architectural decisions inherited from the existing stack:**

- **Language & runtime:** JavaScript, ES modules (`.mjs`), Node ≥20.19 (dev on v24).
- **Data access:** the `mongodb` driver (^7.1.1) already in `server/`, plus `dotenv` (^17.3.1) for the connection string.
- **No new dependencies** required for Phase 1 (Mongo read + text/markdown output only).
- **Styling/build/testing:** not applicable to a no-UI CLI in Phase 1 (the normalised-CSS constraint is carried for Phase 2).
- **Code organisation:** small single-concern ES modules, consistent with the repo's existing scripts and the AI-codeability NFR.

**Note:** "Create the generator entry script" is the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (block implementation):** the two-database split, the projection-not-copy Character Index, the deterministic grounding engine, and connection-isolation security.

**Important (shape the architecture):** the generator's component breakdown, the pack output format, and the state-the-gap behaviour.

**Deferred (Phase 2+):** the audited `POST /api/cockpit/commit` write endpoint, the two structural slot-guards (no haven address into a travel slot; prior-letter slot only from a validated record), `assembleContext` as a live service, the cockpit UI, and correspondence / city-events / factions.

### Data Architecture

- **Two databases by ownership.** `tm_suite` (canonical, player-facing) is the read-only source; `tm_chronicle` holds ST-authored reference data (glossary, Cacophony channel rules, codified rules). In Phase 1 both are local: `tm_suite_dev` (seeded read-only from prod) and a local `tm_chronicle`.
- **Character Index = projection, never a stored copy.** Built fresh each run from `tm_suite_dev.characters` (left-joining `npcs` / `character_dossier`). No second character dataset; SSOT preserved. This is the central invariant.
- **Name-collision detection computed at generation** (group by shared forename across characters + NPCs; surfaces the three Renés, etc.).
- **No caching, no ORM, no validation layer** (read-only; the source is authoritative; regeneration is fast).
- **"Migrations" in Phase 1** are only the seed scripts that populate `tm_chronicle`'s reference collections locally; these become the replayable scripts handed to Peter later. Phase 1 writes nothing to production.

### Authentication & Security

- **Connection isolation is the security mechanism.** The generator's `.env` points only at the local sandbox and local `tm_chronicle`; it holds no production write credentials. The single production touch is a one-time read to seed the sandbox (a `mongodump`/export the ST runs).
- **No authentication** (single operator, local CLI).
- **PII guard:** the pack carries identity and lore only; haven addresses and real locations are excluded.

### API & Communication Patterns

- **No API/server in Phase 1.** It is a CLI: input via command args, output to stdout and/or a markdown file (the pasteable pack). REST/GraphQL does not arise yet.
- **Error handling:** fail loudly and clearly; never swallow. Missing data is surfaced explicitly (state-the-gap), not omitted.

### Frontend Architecture

- **None in Phase 1** (no UI). The normalised-CSS and light-mode-only constraints are carried for Phase 2.

### Infrastructure & Deployment

- **Localhost only**, run via `node`. No CI/CD, no hosting, no deploy, no Netlify/Render. A local MongoDB (Community Server or Docker) provides the sandbox. Logging is simple console output (a run summary, like `build-map-local.mjs`).

### Grounding Engine (headline decision)

- **Deterministic queries + a context-packing function**, explicitly not a vector DB or RAG. Every fact in the pack is traceable to a source record (provenance-tagged).
- **State-the-gap is structural:** the generator emits explicit markers for absent data (e.g. `[no travel field recorded]`, `[blank sheet — confirm with ST]`) rather than omitting silently, informed by the portrait run where many sheets were blank or partial.

### Decision Impact Analysis

**Component breakdown (sets up the implementation stories):** CLI entry → config/connect (sandbox + `tm_chronicle`) → `buildCharacterIndex` (projection + collision detection) → reference assemblers (glossary, channel rules, rules) → pack serialiser (markdown) → output; plus a re-audit helper for the before/after fabrication count.

**Home:** a new top-level **`cockpit/`** directory (decided), keeping the tool cleanly separate from `server/` so it never enters the production deploy.

**Cross-component dependencies:** the pack serialiser depends on every assembler; all assemblers depend on the config/connect layer; collision detection depends on both the character projection and the NPC read.

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

Six conflict points where AI agents could diverge: code/file naming, module structure, the pack output format, provenance/gap-marker syntax, Mongo access, and the safety invariants.

### Naming Patterns

- **Database/collection names (fixed):** `tm_suite_dev` (sandbox), `tm_chronicle` (reference). Reference collections: `glossary`, `cacophony_channels`, `chronicle_rules`. Existing collections keep their names (`characters`, `npcs`, `character_dossier`). Use these exact strings, no variants.
- **Files:** kebab-case `.mjs` ES modules, matching the repo (`build-map-local.mjs`); e.g. `build-character-index.mjs`, `assemble-pack.mjs`.
- **Functions/variables:** camelCase (`buildCharacterIndex`, `detectCollisions`), matching the repo. No snake_case in code.

### Structure Patterns

- **Home:** all Phase 1 code under top-level `cockpit/`. One file per concern (CLI entry, connect, index builder, each reference assembler, serialiser). No server-style routes (no server in Phase 1).
- **Config:** a `cockpit/.env` holding only the local sandbox and `tm_chronicle` connection string. Never a production write credential.
- **No test framework required** (repo convention is manual verification); a single smoke run of the generator is the check.

### Format Patterns — the Drafting Pack (most important)

The pack is markdown with a fixed section order so every regeneration is identical in shape:

1. `# Drafting Pack — <cycle/label>` header with a generation note.
2. `## Character Index` — one row/block per character: `displayName` (moniker || name), clan, covenant, bloodline, court title; collision callouts inline (e.g. "three distinct Renés: …").
3. `## Glossary`, `## Channel Rules (Cacophony)`, `## Codified Rules` — from `tm_chronicle`.
4. `## Standing instruction` — the state-the-gap rule, verbatim.

- **Provenance:** every non-obvious fact is traceable; sourced facts may be tagged `(sheet)` / `(dossier)` where ambiguous.
- **Gap markers (fixed syntax):** absent data is rendered explicitly as `[none on record]` or `[blank sheet — confirm with ST]`, never omitted or guessed.

### Process Patterns

- **State-the-gap (hard rule):** the generator never fabricates or silently drops a missing field; it emits a gap marker. This is the product's whole point.
- **Error handling:** fail loudly with a clear message and non-zero exit; never swallow a Mongo or config error. A run-summary line on success (counts), like `build-map-local.mjs`.
- **Reuse, don't re-derive:** if a value is a known canonical computation (XP, influence), reuse the existing repo module rather than reimplementing.

### Enforcement Guidelines

**All AI agents MUST:**

- Keep the Character Index a projection (never write a character copy anywhere).
- Hold no production write credentials; operate only against `tm_suite_dev` + local `tm_chronicle`.
- Emit gap markers for absent data; never fabricate.
- Produce the pack in the fixed section order above.
- Use British English in all generated text (Defence, Honour, Socialise).

**Anti-patterns to avoid:** storing the Character Index as a collection; pointing `.env` at prod; "filling in" a blank field; reordering or renaming pack sections; snake_case code.

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
cockpit/
├── README.md                      # setup: seed the sandbox, run the generator
├── package.json                   # type:module; deps: mongodb ^7, dotenv ^17 (self-contained)
├── .env.example                   # SANDBOX_URI, CHRONICLE_URI — LOCAL only, no prod write creds
├── .gitignore                     # ignores .env and out/
├── generate-pack.mjs              # CLI ENTRY: orchestrates build -> writes the pack
├── lib/
│   ├── connect.mjs                # dotenv + MongoClient to sandbox + tm_chronicle (no prod creds)
│   ├── build-character-index.mjs  # projection over tm_suite_dev.characters (+ npcs/dossier left-join)
│   ├── detect-collisions.mjs      # shared-forename collisions across characters + npcs
│   ├── assemble-glossary.mjs      # read tm_chronicle.glossary
│   ├── assemble-channel-rules.mjs # read tm_chronicle.cacophony_channels
│   ├── assemble-rules.mjs         # read tm_chronicle.chronicle_rules
│   └── serialise-pack.mjs         # compose fixed-order markdown + gap markers + standing instruction
├── seeds/                         # idempotent seeds for tm_chronicle (become Peter's migration scripts)
│   ├── seed-glossary.mjs
│   ├── seed-cacophony-channels.mjs
│   └── seed-chronicle-rules.mjs
├── scripts/
│   ├── seed-sandbox.md            # documented mongodump(prod, read-only) -> mongorestore(tm_suite_dev)
│   └── re-audit-template.md       # the before/after fabrication-count method (ST runs one cycle)
└── out/
    └── drafting-pack.md           # generated output (gitignored)
```

### Architectural Boundaries

- **Data boundary (the safety line):** `lib/connect.mjs` is the only DB access point. It connects read-only to `tm_suite_dev` and read/write to local `tm_chronicle`. It holds no production credentials; the sole prod contact is the documented one-time read in `scripts/seed-sandbox.md`, run by the ST outside the tool.
- **No API / component / service boundaries** (CLI, no server, no UI in Phase 1).
- **External integration:** the AI assistant (Claude.ai) is reached by manual paste of `out/drafting-pack.md`; no programmatic call in Phase 1.

### Requirements to Structure Mapping

- **Sandbox + isolation (FR1-3):** `scripts/seed-sandbox.md`, `lib/connect.mjs`, `README.md`.
- **Character Index (FR4-5, 7):** `lib/build-character-index.mjs` (projection, no stored copy, NPC left-join).
- **Collision detection (FR6):** `lib/detect-collisions.mjs`.
- **Reference pack (FR8-11):** `lib/assemble-glossary.mjs`, `assemble-channel-rules.mjs`, `assemble-rules.mjs`, fed by `seeds/*`.
- **Pasteable output + state-the-gap + provenance (FR12-14):** `lib/serialise-pack.mjs`, `generate-pack.mjs`.
- **Regenerate after edit (FR22):** rerun `generate-pack.mjs`.
- **Re-audit / measure (FR31-32):** `scripts/re-audit-template.md` (a method, not code).

### Integration Points & Data Flow

`tm_suite_dev` + `tm_chronicle` (local Mongo) -> builders/assemblers (`lib/`) -> `serialise-pack.mjs` -> `out/drafting-pack.md` -> manual paste -> AI assistant. Seeds flow `seeds/*` -> `tm_chronicle` (local), and are later handed to Peter as the production migration path.

### File Organisation Notes

- **Config:** `.env` (gitignored) from `.env.example`; local URIs only.
- **Source:** one concern per file under `lib/`; `generate-pack.mjs` is the thin orchestrator.
- **Tests:** none (manual smoke run per repo convention).
- **Output:** `out/` gitignored; the pack is a disposable artifact.

---

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** all choices reinforce each other — ESM + mongodb-driver + dotenv is the repo's proven pattern; the two-DB split, projection-not-copy, and deterministic grounding are mutually consistent; no contradictions.

**Pattern Consistency:** the fixed pack format, gap-marker syntax, and connection-isolation rule directly serve the decisions. Naming is consistent (kebab `.mjs`, camelCase functions, fixed collection names).

**Structure Alignment:** the `cockpit/` tree realises every decision; `connect.mjs` is the single data boundary enforcing isolation; `serialise-pack.mjs` enforces the format pattern; seeds feed `tm_chronicle`.

### Requirements Coverage Validation

**Functional Requirements:** every Phase-1 FR (1-14, 22, 31-32) maps to a specific file. Phase 2/3 FRs are explicitly and correctly deferred.

**Non-Functional Requirements:** grounding integrity (provenance + drift-proof projection); security (connection isolation, no prod write creds, PII guard); performance (no caching needed); reliability (sandbox re-seedable); maintainability (small single-concern modules).

### Implementation Readiness Validation

Decisions documented; patterns enforceable; the directory tree is complete and specific; the single data boundary and the manual-paste integration point are defined. An AI agent can implement each `lib/` module from this document alone.

### Gap Analysis Results

- **Important (prerequisite, not architectural):** the reference data must be authored before the pack is useful — the `glossary`, `cacophony_channels` allow/deny list, and `chronicle_rules`. Source content already exists in `Downtime_Hallucination_Audit.md` and `downtime-grounding-hardening.md`; the seeds just need populating.
- **Minor (risk):** the sandbox seed (`mongodump` from Atlas) may hit the documented local SRV/ISP block; fallback is a node-driver export or the MongoDB MCP export. Noted in `scripts/seed-sandbox.md`.
- **Out of scope (data work, Peter/ST):** completing missing NPCs (Astrid, Elise, Charlie Ballsack) and blank character sheets; the generator handles these gracefully via gap markers meanwhile.

### Architecture Completeness Checklist

**Requirements Analysis** — [x] context analysed · [x] scale/complexity assessed · [x] constraints identified · [x] cross-cutting concerns mapped

**Architectural Decisions** — [x] critical decisions documented (versions verified from repo) · [x] stack fully specified · [x] integration patterns defined · [x] performance addressed

**Implementation Patterns** — [x] naming · [x] structure · [x] communication (CLI/pack format) · [x] process (error handling, state-the-gap)

**Project Structure** — [x] complete directory tree · [x] boundaries established · [x] integration points mapped · [x] FR-to-structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION (all 16 items checked; no critical gaps; open items are data-authoring prerequisites, not architecture).

**Confidence Level:** high.

**Key Strengths:** safety-by-construction (connection isolation), drift-proof SSOT (projection-not-copy), minimal surface (reuses the repo, zero new runtime), and a fixed pack contract that makes outputs reproducible.

**Areas for Future Enhancement (Phase 2+):** the audited prod-write endpoint, the two structural slot-guards, `assembleContext` as a service, and the localhost UI.

### Implementation Handoff

**AI Agent Guidelines:** follow the decisions and patterns exactly; keep the Index a projection; never hold prod write creds; emit gap markers, never fabricate; British English in output.

**First Implementation Priority:** create `cockpit/` with `package.json` + `.env.example` + `connect.mjs` (the boundary), then `build-character-index.mjs`.
