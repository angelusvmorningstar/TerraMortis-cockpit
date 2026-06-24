---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - specs/cockpit/prd.md
  - specs/cockpit/architecture.md
  - specs/project-context.md
scope: 'Phase 1 MVP (Tier-1 grounding pack); Phase 2/3 captured only as future epics, not storied'
---

# Terra Mortis ST Cockpit - Epic Breakdown

## Overview

This document decomposes the cockpit PRD (`specs/cockpit/prd.md`) and architecture (`specs/cockpit/architecture.md`) into implementable stories. **Scope: Phase 1 (the no-UI Tier-1 grounding pack).** Phase 2 (cockpit UI, `assembleContext` service, structural slot-guards, correspondence) and Phase 3 (living city, map, factions) are recorded only as high-level future epics, not broken into stories.

## Requirements Inventory

### Functional Requirements

FRs are phase-tagged in the PRD. Phase 1 (MVP) requirements are the in-scope set; Phase 2 / Vision are listed for completeness only.

**Phase 1 (MVP) — in scope:**
- FR1: The ST can seed a local sandbox database from a read-only snapshot of production.
- FR2: The system operates exclusively against the sandbox and holds no production write credentials.
- FR3: The ST can verify that the tool has no path to write to production data.
- FR4: The system can generate a Character Index by projecting canonical character fields (name, clan, covenant, bloodline, court title) from the sandbox.
- FR5: The system regenerates the Index from the source on each run and stores no separate copy of character data.
- FR6: The system can detect and flag name collisions across characters and NPCs.
- FR7: The system can include NPC entities alongside characters in the Index for disambiguation.
- FR8: The system can assemble a single drafting pack combining the Character Index, glossary, channel rules, and codified rules.
- FR9: The ST can retrieve in-world term definitions that override plain-English meaning.
- FR10: The system can express channel-scoping rules (visible versus invisible facts) for player-facing channels.
- FR11: The system can surface the codified rules reference relevant to a drafting task.
- FR12: The ST can output the assembled pack in a form pasteable into an external AI assistant.
- FR13: The drafting pack instructs the assistant to state gaps rather than fill them.
- FR14: The system marks each fact in a brief with traceable provenance to a source record.
- FR22: The ST can regenerate the pack after a sandbox edit so changes take effect immediately.
- FR31: The ST can re-audit a drafted cycle for fabrications using the original audit methodology.
- FR32: The system records the before-and-after fabrication count against the baseline of fifteen.

**Phase 2 (out of scope here):** FR15 (confidence labelling), FR16 (exclude ST-hidden), FR17 (no haven→travel slot), FR18 (validated-letter-only slot), FR19 (add NPCs to sandbox), FR20 (disambiguation notes), FR21 (sire field), FR23-25 (migration scripts + Peter reconciliation), FR26-28 (assembleContext brief, invariant prelude, correspondence thread).

**Vision (out of scope here):** FR29-30 (in-cockpit drafting + staged-change review), FR33-35 (city_events, map view, faction state/clocks).

### NonFunctional Requirements

- NFR1 (Grounding integrity): every fact in a brief is traceable to a source record; the Character Index is a fresh projection that cannot drift; target zero ST-caught fabrications in the addressed classes against a baseline of fifteen.
- NFR2 (Security & privacy): no production write credentials; player PII (haven addresses, locations) excluded from the pack; the sandbox runs locally and is not networked.
- NFR3 (Performance): pack regeneration completes in seconds for the current roster (~30 characters), so staleness is never a reason to skip a regeneration.
- NFR4 (Reliability & recoverability): the sandbox is disposable and rebuildable by re-seeding; seeds/migrations are idempotent.
- NFR5 (Maintainability / AI-codeability): small single-concern ES modules; no file large enough to defeat AI-assisted editing.
- NFR6 (Deliberately excluded): scalability and broad accessibility conformance are out of scope (single operator).

### Additional Requirements

From the architecture (technical decisions that shape the stories):

- **No starter template.** Reuse the existing Node ESM + `mongodb` driver stack; all Phase 1 code under a new top-level `cockpit/` directory (kept out of the production deploy). A small self-contained `cockpit/package.json` (`type: module`, deps `mongodb ^7`, `dotenv ^17`).
- **Connection isolation is the security mechanism.** A single `lib/connect.mjs` is the only DB access point; it holds local-only URIs (sandbox + `tm_chronicle`), never production write credentials.
- **Two databases:** `tm_suite_dev` (sandbox, read-only) and a local `tm_chronicle` (ST-authored reference). Reference collections: `glossary`, `cacophony_channels`, `chronicle_rules`.
- **Fixed pack format** (header → Character Index → Glossary → Channel Rules → Codified Rules → Standing instruction), with provenance tags and a fixed gap-marker syntax (`[none on record]`, `[blank sheet — confirm with ST]`).
- **Reference content must be authored:** `seeds/*` populate `tm_chronicle` from `Downtime_Hallucination_Audit.md` and `st-working/downtime-grounding-hardening.md` (a data-authoring prerequisite, not just code).
- **Sandbox seed:** a documented one-time read-only prod → `tm_suite_dev` export, with an SRV/ISP fallback (node-driver export or MongoDB MCP export).
- **Standards:** British English in output; minimum ceremony; manual smoke-run verification (no test framework).

### UX Design Requirements

None. Phase 1 has no user interface (CLI + markdown output). The normalised-CSS and light-mode-only constraints are carried for the Phase 2 UI, recorded in the architecture, and are not Phase 1 work.

### FR Coverage Map

- FR1, FR2, FR3 → Epic 1 (sandbox isolation)
- FR4-7 → Epic 2 (Character Index: projection, collisions, NPCs)
- FR8-14, FR22 → Epic 2 (pack assembly, output, provenance, state-the-gap, regenerate)
- FR31, FR32 → Epic 3 (re-audit and before/after count)
- FR15-28 → Epic 4 (Phase 2, future, not storied)
- FR29-30, FR33-35 → Epic 5 (Vision, future, not storied)

Every Phase-1 FR is mapped; nothing orphaned.

## Epic List

### Epic 1: Safe sandbox foundation
The ST can stand up an isolated local sandbox the tool reads from, with no path to production — the "safety to play" baseline.
**FRs covered:** FR1, FR2, FR3

### Epic 2: The grounded drafting pack
The ST can generate a pasteable drafting pack — the Character Index (projection + collision detection + NPCs) plus the glossary, channel rules, and codified rules — under the state-the-gap discipline. The core deliverable and the biggest hallucination-killer.
**FRs covered:** FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR22

### Epic 3: Validate the grounding
The ST runs one real downtime cycle through the pack and measures the fabrication drop against the baseline of fifteen — the MVP's success proof.
**FRs covered:** FR31, FR32

### Epic 4 (Phase 2, future — named only, not storied)
The localhost cockpit: `assembleContext` service, the two structural slot-guards (no haven→travel; validated-letter-only), correspondence retrieval, sandbox NPC/`sire` capture, and migration-script handoff to Peter.
**FRs covered:** FR15-28

### Epic 5 (Vision, future — named only, not storied)
The living city: in-cockpit drafting with staged-change review, `city_events`, the chronicle map, and faction state/clocks.
**FRs covered:** FR29-30, FR33-35

### Future feature idea (backlog — not scoped, ST-noted 2026-06-24)
**Ordeals in the cockpit.** Surface/track player ordeal status (Questionnaire, History, Lore, Rules, Covenant), grade feedback rounds, and draft per-answer notes with grounding — reading the same ordeal data the player app uses (`ordeal_responses` / `ordeal_submissions` / `questionnaire_responses`). Candidate Phase 2/3 epic; explicitly **not** in the current Phase 1 plan.

---

## Epic 1: Safe sandbox foundation

The ST can stand up an isolated local sandbox the tool reads from, with no path to production.

### Story 1.1: Scaffold the cockpit tool

As the ST,
I want a self-contained `cockpit/` tool skeleton,
So that the grounding generator has a home separate from the production app.

**Acceptance Criteria:**

**Given** the repo
**When** the cockpit is scaffolded
**Then** `cockpit/` exists with `package.json` (`type: module`, deps `mongodb ^7`, `dotenv ^17`), `.env.example` (`SANDBOX_URI`, `CHRONICLE_URI`, local URIs only), and `.gitignore` (ignoring `.env` and `out/`)
**And** `npm install` in `cockpit/` succeeds with no new global tooling
**And** `cockpit/` is excluded from the production deploy (not under `server/` or `public/`)

### Story 1.2: Single isolated data boundary

As the ST,
I want one connection module that can only reach local databases,
So that the tool can never write to production.

**Acceptance Criteria:**

**Given** a `cockpit/.env` from the example
**When** `lib/connect.mjs` connects
**Then** it opens read access to `tm_suite_dev` and read/write to local `tm_chronicle`, exposing read helpers
**And** it holds no production write credentials; the only configured hosts are local
**When** the ST runs a verify step
**Then** the tool reports the configured hosts and refuses to proceed if any non-local host is detected (FR3)

### Story 1.3: Seed the sandbox from production

As the ST,
I want a documented one-time way to copy production into the sandbox,
So that I work against realistic data safely.

**Acceptance Criteria:**

**Given** `scripts/seed-sandbox.md`
**When** the ST follows it
**Then** a read-only export of production restores into local `tm_suite_dev`
**And** the doc states the read is read-only and includes the SRV/ISP fallback (node-driver export or MongoDB MCP export) for when `mongodump` against Atlas fails

## Epic 2: The grounded drafting pack

The ST can generate a pasteable drafting pack under the state-the-gap discipline.

### Story 2.1: Seed the chronicle reference collections

As the ST,
I want the glossary, channel rules, and codified rules populated locally,
So that the pack can carry the setting facts that stop lore, term, and rule hallucinations.

**Acceptance Criteria:**

**Given** the source content in `Downtime_Hallucination_Audit.md` and `downtime-grounding-hardening.md`
**When** the `seeds/*` scripts run
**Then** `tm_chronicle` holds `glossary`, `cacophony_channels`, and `chronicle_rules` populated (incl. "the Great Unwashed", the Cacophony visible/invisible list, feeding-pool construction, animal-feeding-by-Blood-Potency, and the discipline-territory table)
**And** re-running a seed is idempotent (no duplicates)

### Story 2.2: Build the Character Index (projection)

As the ST,
I want a Character Index projected live from the sandbox,
So that the assistant always has correct identities and never invents or mis-assigns clan or covenant.

**Acceptance Criteria:**

**Given** `tm_suite_dev`
**When** `build-character-index.mjs` runs
**Then** it returns one entry per non-retired character with `displayName` (moniker || name), clan, covenant, bloodline, court title, left-joining `npcs`/`character_dossier`
**And** it writes nothing back to any collection (projection only)
**And** absent fields are marked, not omitted (e.g. `bloodline: [none on record]`)

### Story 2.3: Detect name collisions

As the ST,
I want name collisions surfaced automatically,
So that the assistant never conflates two people who share a name.

**Acceptance Criteria:**

**Given** the index plus NPCs
**When** `detect-collisions.mjs` runs
**Then** characters and NPCs sharing a forename are flagged as distinct with disambiguators (e.g. the three Renés: Meyer / St. Dominique / the NPC)
**And** unique names produce no collision flag

### Story 2.4: Assemble the reference sections

As the ST,
I want the seeded reference data read into pack sections,
So that glossary, channel rules, and codified rules appear in the pack.

**Acceptance Criteria:**

**Given** the seeded `tm_chronicle`
**When** the three assemblers run
**Then** each returns its structured section (glossary, Cacophony allow/deny, codified rules)
**And** a missing or empty collection yields a clear gap marker, not a crash

### Story 2.5: Serialise the drafting pack

As the ST,
I want a fixed-format markdown pack,
So that every regeneration is reproducible and the AI is told to state gaps.

**Acceptance Criteria:**

**Given** the index, collisions, and reference sections
**When** `serialise-pack.mjs` runs
**Then** it emits markdown in the fixed order: header → Character Index → Glossary → Channel Rules → Codified Rules → Standing instruction
**And** facts carry provenance where ambiguous, blank data uses the fixed gap markers, and the state-the-gap instruction appears verbatim
**And** all generated text is British English

### Story 2.6: The generate-pack CLI

As the ST,
I want one command that produces the pack,
So that I can regenerate it fresh whenever I draft.

**Acceptance Criteria:**

**Given** a configured sandbox and chronicle
**When** the ST runs `node cockpit/generate-pack.mjs`
**Then** it connects, builds, assembles, serialises, and writes `out/drafting-pack.md` (and prints to stdout) with a run-summary line
**And** re-running after a sandbox edit regenerates a fresh pack reflecting the change (FR22)

## Epic 3: Validate the grounding

The ST proves the pack reduces fabrication.

### Story 3.1: Re-audit a grounded cycle and record the drop

As the ST,
I want a method to measure fabrications before and after,
So that I have evidence the grounding works.

**Acceptance Criteria:**

**Given** `scripts/re-audit-template.md`
**When** the ST drafts one real cycle using the pack and applies the original audit's classification
**Then** the fabrications in the addressed classes (identity, conflation, setting-term, rule) are counted
**And** the before/after is recorded against the baseline of fifteen (FR31, FR32)
