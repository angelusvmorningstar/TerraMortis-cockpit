---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
releaseMode: phased
inputDocuments:
  - Downtime_Hallucination_Audit.md
  - st-working/downtime-grounding-hardening.md
  - st-working/character-schema-gap-analysis.md
  - st-working/research/blades-in-the-dark-factions.md
  - specs/project-context.md
  - specs/prd.md
  - specs/architecture.md
  - CLAUDE.md
workflowType: 'prd'
classification:
  projectType: 'Single-operator AI-grounding / context-assembly tool (phased vessel: Phase 1 generator script + drafting pack, no UI; Phase 2 localhost web app over a sandbox DB)'
  domain: 'AI-assisted authoring with verifiable grounding (anti-hallucination), applied to tabletop LARP chronicle operations'
  complexity: 'Medium overall, split — low engineering/delivery (single user, no auth/concurrency/compliance, reuses stack), medium-high data-model + grounding design'
  projectContext: 'Greenfield during build (tm_suite_dev sandbox), brownfield on integration (reconcile to live tm_suite via Peter)'
date: '2026-06-24'
---

# Product Requirements Document - Terra Mortis ST Cockpit

**Author:** Angelus
**Date:** 24 June 2026

---

## Executive Summary

The Terra Mortis ST Cockpit is a single-operator authoring environment that lets the Storyteller draft chronicle content with AI assistance that is grounded in verified data, so it cannot invent false canon. It serves one user, the ST, who currently holds an entire living chronicle of thirty-plus characters in his head and uses a general AI assistant to draft downtime outcomes, reply letters, and rumours. That workflow has a measured failure mode: across recorded drafting sessions, the assistant fabricated facts (invented people, wrong clans and covenants, a letter that never existed, conflated characters) in fifteen verified instances, every one of which would have reached players as false canon had the ST not caught it manually.

The Cockpit's purpose is to make AI-assisted authoring trustworthy enough to scale the ST's effort without shipping lies to thirty players. It does this by assembling a deterministic, verified context for every drafting task (a structured reference layer plus a discipline that forces the model to state gaps rather than fill them) and, in a later phase, by externalising the living city (characters, NPCs, factions, places, story threads) so the ST makes informed choices instead of relying on memory. The tool is built and tested entirely against a local sandbox copy of the live data and never writes to production until deliberately wired in; data-model improvements are handed to the data developer (Peter) as reviewable migration scripts.

### What Makes This Special

The Cockpit is grounding-first, not interface-first. Its core value is a context contract that makes the AI verifiably honest, and that value is established by a real failure audit before any of the tool is built, which is rare. The guiding insight is that the human is the working safety system and the AI is the unreliable component, so the intervention belongs upstream in what the model is fed, not downstream in a dashboard the human inspects. Two principles fall out of that and shape the whole design: the single source of truth (MongoDB) is enriched, never forked, and all development happens against a disposable sandbox so experimentation can never endanger live game data. The decisive moment for the user is the first downtime cycle in which the assistant drafts a reply that correctly cites prior facts with zero hand-feeding and zero invention.

## Project Classification

- **Project Type:** Single-operator AI-grounding and context-assembly tool, delivered as a phased vessel. Phase 1 is a generator script plus a drafting context pack with no user interface; Phase 2 is a localhost web application over the sandbox database, reusing the existing web stack and design tokens. It is deliberately not a packaged desktop app and not part of the production deploy.
- **Domain:** AI-assisted authoring with verifiable grounding (anti-hallucination), applied to tabletop LARP chronicle operations. The transferable hard problem is grounding; the LARP is the subject matter.
- **Complexity:** Medium overall, and bimodal. Engineering and delivery complexity is low (single user, no authentication, concurrency, or compliance burden; reuses the existing stack). Data-model and grounding-design complexity is medium-high.
- **Project Context:** Greenfield during build (against the `tm_suite_dev` sandbox) and brownfield on integration (reconciled to the live `tm_suite` system via the data developer).

---

## Success Criteria

### User Success

The single user (the ST) succeeds when he can hand a downtime cycle's drafting to the AI and trust the output enough to ship it after a light review, rather than a forensic fact-check. Concretely, success is felt at the moment the assistant drafts a reply or outcome that correctly cites prior facts (a character's clan, a previous letter, an in-world term) with no facts hand-fed by the ST and nothing invented. The relief is the disappearance of the "is this real or did it make this up" tax on every drafted line.

### Operator Success (in place of business success)

- **Reduced fact-checking burden:** the ST spends materially less time catching and correcting fabrications per cycle than the current baseline (fifteen caught instances across the audit window).
- **Trust threshold crossed:** the ST is willing to draft a full downtime cycle through the grounded workflow rather than reverting to unaided chats.
- **No new maintenance debt:** the grounding layer does not become a chore that rots; the reference data is regenerated from the source, not hand-maintained.

### Technical Success

- **SSOT preserved:** zero character facts are stored outside `tm_suite` / `tm_suite_dev`; the Character Index is a regenerated projection, never an edited copy.
- **Sandbox isolation:** zero writes to production `tm_suite` during the entire build phase; the cockpit only ever holds the sandbox connection.
- **Deterministic grounding:** context is assembled by plain queries (no vector database or RAG), so every fact in a brief is traceable to a source record.
- **Reconcilable handover:** one hundred per cent of data-model improvements are expressed as replayable migration scripts for Peter to review and apply, never ad-hoc edits to a diverged database.

### Measurable Outcomes

- **Primary metric, hallucination drop:** in a drafted downtime cycle run through the grounded workflow, the number of fabrications the ST must catch in the addressed classes (invented identity, conflation, setting-term, rule) is zero. Baseline: fifteen caught across the prior audit window.
- **Zero hand-fed context:** the ST adds no character, NPC, or lore fact by hand during a drafted cycle; all such context originates from the generated pack.
- **Re-audit confirmation:** a re-audit of the first grounded cycle reproduces the methodology of the original audit and records the before/after difference.

## Product Scope

The product ships in three phases: an MVP grounding pack (no UI), a Phase 2 localhost cockpit, and a Phase 3 living city. The full strategy, must-have capabilities, resource model, and risk mitigation are defined in "Project Scoping and Phased Development" below; the functional requirements carry per-FR phase tags that trace to those phases.

---

## User Journeys

### Journey 1 — The ST drafts a downtime cycle (primary, success path)

**Opening.** It is Tuesday night, the cycle closed on Sunday, thirty submissions are waiting, and the kettle has just boiled. Tonight Angelus opens the grounded workflow instead of the usual six tabs.

**Rising action.** He generates the drafting pack fresh from the sandbox: a Character Index projected live from `tm_suite_dev`, the glossary, the Cacophony channel rules, the codified rules. He pastes it into the assistant with the standing instruction (state the gap, never fill it) and begins on the first player's outcome.

**Climax.** The assistant refers to René Meyer correctly as Daeva, Carthian, and does not conflate him with René St. Dominique or the NPC René who is Conrad's rival. It cites the player's actual feeding submission, and where the submission is silent on travel it says so rather than inventing a route. The ST reads the draft and it is simply right.

**Resolution.** He ships the cycle after a light read, in a fraction of the old time, without the fact-checking dread on every line.

*Reveals:* the read-only Character Index generator (projection plus collision detection), reference-pack assembly (glossary, channel rules, rules), and the standing prompt discipline.

### Journey 2 — The ST hits a grounding gap (primary, edge case)

**Opening.** Drafting a scene where a player tries to track Astrid, the assistant returns: "No record of Astrid in the NPC register. I will not invent her."

**Rising action.** Instead of a confident fabrication, the ST gets an honest blank, and realises Astrid was never captured in structured data (exactly the gap the audit exposed).

**Climax.** He adds Astrid to the sandbox NPC register (a permitted write to `tm_suite_dev`), notes her relation to Conrad and Odeliese, and regenerates the pack.

**Resolution.** The re-draft now grounds correctly, and the addition is automatically queued as a migration script for Peter, so the live SSOT will gain her later without a forked dataset.

*Reveals:* the state-the-gap behaviour, sandbox NPC capture, one-command regeneration, and migration-script emission as a by-product of sandbox edits.

### Journey 3 — Standing up the sandbox (primary, setup and operations)

**Opening.** First run. Nothing exists locally.

**Rising action.** Angelus installs a local MongoDB, seeds `tm_suite_dev` from a read-only snapshot of production, and runs the generator.

**Climax.** The generator prints a complete drafting pack and, unprompted, flags the name collisions it detected (the three Renés, Charles versus Charlie).

**Resolution.** He now has a disposable playground that mirrors live data and cannot touch production, because the tool only ever holds the sandbox connection string.

*Reveals:* local Mongo provisioning, a read-only production-to-sandbox seed, the generator CLI, automatic collision detection, and connection isolation as the safety mechanism.

### Journey 4 — Peter reconciles the improvements (secondary user, handover)

**Opening.** Between downtime cycles, Angelus hands Peter a folder of migration scripts plus access to the sandbox.

**Rising action.** Peter reviews each script as a statement of intent (add the `sire` field, seed the missing NPCs, create the `glossary` collection), not as a forensic diff of two databases.

**Climax.** He replays the approved scripts against live `tm_suite`, timed to fall between Angelus's cycles so live game data is not in flux.

**Resolution.** Production gains the structural improvements; sandbox and live stay reconciled through scripts, never through a fork.

*Reveals:* idempotent replayable migration scripts, review-as-intent handover, and scheduling around the downtime cadence.

### Journey Requirements Summary

The journeys reveal these capability areas:
- **Reference generation:** read-only Character Index projection with automatic name-collision detection; assembly of glossary, channel rules, and rules into a single drafting pack.
- **Grounding discipline:** the state-the-gap behaviour, surfaced as honest blanks rather than fabrications.
- **Sandbox data editing:** permitted writes to `tm_suite_dev` (NPC capture, schema additions) that never reach production.
- **Migration emission:** sandbox changes captured as replayable scripts for reconciliation.
- **Environment and isolation:** local Mongo setup, read-only prod-to-sandbox seed, sandbox-only connection.
- **Handover:** review-as-intent migration review and cadence-aware application to live.

---

## Domain-Specific Requirements

### Data Sensitivity and Privacy

- **Player PII.** Haven addresses and real-world locations are personal data (the existing map artefact already flags this). The grounding pack carries identity and lore, not addresses; PII stays out of anything sent to an external AI assistant. Single-operator local execution is itself the containment mechanism.
- **ST-only secrets.** The dossier and story-thread layers carry ST-hidden material (secrets with severity and compromised flags). Context assembly must respect the `st_hidden` flag and never surface ST secrets into a player-facing draft.

### Data Integrity (the domain's core constraint)

- **Single source of truth.** MongoDB is authoritative; the Character Index is a regenerated projection, never a stored copy. No second character dataset is ever created.
- **Sandbox isolation.** All development runs against `tm_suite_dev`; zero writes reach production until deliberate integration.
- **Reconciliation by script.** Schema and data improvements are replayable migration scripts, not ad-hoc edits.

### Grounding Contract (anti-hallucination, domain-specific)

- Every fact in a generated brief is traceable to a source record.
- Absence is rendered as an explicit blank (state the gap), never filled.
- Channel scoping: player-facing channels (for example the Cacophony) filter out invisible facts (bloodline, devotions, haven specifics) before output.
- Derived or inferred data (and, later, phantom/spatial data) is labelled by confidence and never presented as fact.

### Conventions (inherited from the main project)

- British English throughout; no em-dashes in player-facing output text.
- Effective ratings are read for pools and prerequisites; derived stats are never stored.

### Risks and Mitigations

- **Grounding goes stale:** regenerate from source every run; no hand-maintained reference.
- **Sandbox drifts from production:** re-seed at handover, timed between downtime cycles.
- **PII leaks via the AI assistant:** keep addresses out of the pack; pack carries identity and lore only.
- **ST secrets leak into player drafts:** enforce the `st_hidden` filter in context assembly.

---

## Innovation and Novel Patterns

### Detected Innovation Areas

- **Audit-driven grounding.** The anti-hallucination design is specified by a real failure audit (fifteen classified instances) before the tool is built, rather than by assumption. The failure data, not intuition, ranks what to ground first. This inverts the usual "build features, discover failures later" order.
- **Deterministic context assembly instead of RAG.** At this scale the relevant context per task is small and structurally addressable, so grounding is plain queries plus a context-packing function, not embeddings. This is a deliberate rejection of the industry-default vector pipeline in favour of fully traceable retrieval.
- **Grounding as a structural property, not a prompt.** Two of the guards (no haven address into a travel slot; a prior-letter slot filled only from a validated record) are slot-contract validators in code, so the failure cannot occur, rather than instructions the model may ignore.
- **Projection-not-copy reference layer.** The Character Index is regenerated from the source on every run, so the grounding layer adds no second dataset and cannot drift, directly addressing the project's documented fragmentation history.

### Validation Approach

The whole thesis is validated cheaply and early: run the Tier-1 pack through one real downtime cycle and re-audit using the original audit's methodology. The primary metric (zero caught fabrications in the addressed classes against a baseline of fifteen) is the validation. If the rate does not drop, the grounding thesis is wrong and we learn it for the cost of an afternoon's collation, before any application is built.

### Risk Mitigation

- **If grounding does not reduce hallucination:** the failure surfaces in the first re-audit, before any UI investment. Fallback is to re-examine whether the failures were missing facts (fix by capture) or wrong sources (a deeper SSOT problem), per the audit's open question.
- **If deterministic assembly proves insufficient at scale:** Atlas Vector Search can be added later as a second index over the same records, with no change to the model, so the boring approach is not a dead end.

---

## Technical Architecture and Project-Type Requirements

### Project-Type Overview

A phased, single-operator local tool. Phase 1 is a Node command-line generator that projects the sandbox database into a drafting pack; it is run locally, never published. Phase 2 is a localhost web application over the same sandbox, reusing the existing web stack and design tokens. Neither phase is part of the production deploy, has external users, or requires authentication, hosting, SEO, or app-store compliance.

### Technical Architecture Considerations

- **Stack reuse, no new runtime.** Node plus a thin local server (Express or equivalent) and a static frontend reusing `theme.css` tokens. A packaged desktop runtime (Tauri, Electron) is explicitly rejected to keep the surface small and vibe-codeable.
- **Data layer.** A local MongoDB instance holding `tm_suite_dev`, seeded read-only from a production snapshot. The safety mechanism is connection isolation: the tool only ever holds the sandbox connection string and carries no production credentials, so it cannot write to live data even in error.
- **Phase 1 surface (CLI).** A generator that projects the sandbox into a drafting pack: the Character Index (with automatic name-collision detection), the glossary, the Cacophony channel rules, and the codified rules, emitted as a pasteable artefact. No server, no UI.
- **Phase 2 surface (localhost web).** A local server exposing read projections, permitted sandbox writes (NPC capture, schema edits), and the `assembleContext()` function. The two structural slot-guards (no haven address into a travel slot; validated-letter-only) are enforced server-side, not in prompts.
- **Grounding engine.** Deterministic queries plus a context-packing function; no vector database. Atlas Vector Search may later be added as a second index over the same records if the corpus outgrows structural retrieval, with no change to the model.
- **Migration emission.** Sandbox edits are captured as idempotent, replayable scripts for Peter to review and apply to live.

### Runtime and Environment

- Local MongoDB (Community Server or Docker); the existing Node runtime; a one-command run for the generator and, in Phase 2, for the local server.
- No deployment pipeline, no Netlify or Render involvement, no authentication, no hosting.

### Implementation Considerations

- **Reuse, do not re-derive.** Where the tool needs canonical computations (XP, influence, derived stats), it reuses existing repo modules rather than reimplementing them, consistent with the anti-fragmentation discipline.
- **Standards.** British English; for Phase 2 UI, CSS design tokens and component reuse per `project-context.md`.
- **Explicitly out of scope:** SEO, app-store compliance, broad browser support, SDK or package distribution, and broad accessibility conformance (single known operator). These are recorded as deliberately skipped, not overlooked.

---

## Project Scoping and Phased Development

### MVP Strategy and Philosophy

**MVP Approach:** Problem-solving MVP aimed at validated learning. The single question the MVP must answer is whether grounding reduces hallucination, measured by re-audit. It deliberately ships no application, because the evidence says the value is in the data and discipline, not the interface.

**Resource Requirements:** Solo. Angelus directs and the AI assistant writes the code; Peter contributes only at the reconciliation boundary (reviewing and applying migration scripts to live). No team, no hosting, no deploy.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:** Journey 3 (standing up the sandbox), Journey 1 (drafting a cycle through the pack), and the grounding half of Journey 2 (the state-the-gap behaviour).

**Must-Have Capabilities:**
- Local MongoDB sandbox (`tm_suite_dev`) seeded read-only from production.
- Read-only Character Index generator (projection over the sandbox) with automatic name-collision detection.
- Assembly of the glossary, Cacophony channel rules, and codified rules into a single pasteable drafting pack.
- The standing prompt discipline: state the gap, never fill it.
- A re-audit of one real cycle to measure the hallucination drop against the baseline of fifteen.

### Post-MVP Features

**Phase 2 (Growth):** The localhost cockpit over the sandbox: `assembleContext()` automating the pack, correspondence-thread retrieval, the two structural slot-guards enforced in code, completion of the NPC register (the missing figures), and the single `sire` reference field on the character schema. Supports the full Journey 2 (sandbox capture) and Journey 4 (Peter's reconciliation).

**Phase 3 (Vision):** The living city: the `city_events` log (place and time), the chronicle map as substrate, faction state and clocks on the Blades model, movement trails with honest uncertainty, and the full in-cockpit downtime loop where the AI proposes and the ST reviews staged changes before commit.

### Risk Mitigation Strategy

- **Technical risks:** The riskiest assumption is that deterministic grounding actually reduces hallucination; it is de-risked by the Phase 1 re-audit before any UI is built. The secondary risk (Atlas SRV connection from this machine) is sidestepped by a local MongoDB sandbox.
- **Adoption risk (in place of market risk):** The only user is the ST, so the real risk is that he does not adopt the workflow because capture feels like a chore. Mitigated by designing capture as a by-product of work already done, and by proving the time saving in a single trial cycle.
- **Resource risks:** With a solo builder and a part-time reconciler, the MVP is intentionally collation-scale (an afternoon), with each later phase gated on the prior phase's proof, so the project degrades gracefully if effort is scarce.

---

## Functional Requirements

### Sandbox Environment and Isolation

- FR1: The ST can seed a local sandbox database from a read-only snapshot of production. (MVP)
- FR2: The system operates exclusively against the sandbox and holds no production write credentials. (MVP)
- FR3: The ST can verify that the tool has no path to write to production data. (MVP)

### Reference Generation (Character Index)

- FR4: The system can generate a Character Index by projecting canonical character fields (name, clan, covenant, bloodline, court title) from the sandbox. (MVP)
- FR5: The system regenerates the Index from the source on each run and stores no separate copy of character data. (MVP)
- FR6: The system can detect and flag name collisions across characters and NPCs. (MVP)
- FR7: The system can include NPC entities alongside characters in the Index for disambiguation. (MVP)

### Grounding Pack Assembly

- FR8: The system can assemble a single drafting pack combining the Character Index, glossary, channel rules, and codified rules. (MVP)
- FR9: The ST can retrieve in-world term definitions that override plain-English meaning. (MVP)
- FR10: The system can express channel-scoping rules (visible versus invisible facts) for player-facing channels. (MVP)
- FR11: The system can surface the codified rules reference relevant to a drafting task. (MVP)
- FR12: The ST can output the assembled pack in a form pasteable into an external AI assistant. (MVP)

### Grounding Discipline (Anti-Hallucination)

- FR13: The drafting pack instructs the assistant to state gaps rather than fill them. (MVP)
- FR14: The system marks each fact in a brief with traceable provenance to a source record. (MVP)
- FR15: The system can label derived or inferred data by confidence so it is not presented as fact. (Phase 2)
- FR16: The system can exclude ST-hidden material from player-facing context. (Phase 2)
- FR17: The context assembly refuses to populate a travel slot from a haven address. (Phase 2)
- FR18: The context assembly populates a prior-letter slot only from a validated letter record, or marks it explicitly empty. (Phase 2)

### Sandbox Data Editing and Capture

- FR19: The ST can add missing NPC entities to the sandbox NPC register. (Phase 2)
- FR20: The ST can record disambiguation notes on entities that are conceptually confusable. (Phase 2)
- FR21: The ST can add a sire reference to a character in the sandbox. (Phase 2)
- FR22: The ST can regenerate the pack after a sandbox edit so changes take effect immediately. (MVP)

### Migration and Reconciliation

- FR23: The system captures each sandbox data or schema change as a replayable migration script. (Phase 2)
- FR24: The migration scripts are idempotent so they can be safely reviewed and replayed against production. (Phase 2)
- FR25: Peter can review each migration as a statement of intent and apply approved scripts to production. (Phase 2)

### Context Assembly Service

- FR26: The system can assemble per-subject context (a brief) for a drafting task by querying the sandbox. (Phase 2)
- FR27: Every assembled brief includes the invariant reference prelude (Index, glossary, channel rules, rules). (Phase 2)
- FR28: The system can retrieve a character's prior correspondence thread for a reply task. (Phase 2)
- FR29: The ST can drive drafting from within the cockpit while the assistant proposes outcomes. (Vision)
- FR30: The ST can review staged changes before any commit to canonical data. (Vision)

### Validation and Measurement

- FR31: The ST can re-audit a drafted cycle for fabrications using the original audit methodology. (MVP)
- FR32: The system records the before-and-after fabrication count against the baseline of fifteen. (MVP)

### Living City (Vision)

- FR33: The system can record city events carrying place and time (scene, feed, journey, letter). (Vision)
- FR34: The ST can view the chronicle as a map with events and entities anchored spatially. (Vision)
- FR35: The system can track faction state (tier, hold, status) and advance faction clocks. (Vision)

---

## Non-Functional Requirements

### Correctness and Grounding Integrity (the primary quality attribute)

- Every fact in a generated brief is traceable to a source record; the system produces no untraceable assertions.
- The Character Index never diverges from the source: it is a fresh projection with no stored copy, so drift is structurally impossible.
- Primary measurable target: zero ST-caught fabrications in the addressed classes (invented identity, conflation, setting-term, rule) in a drafted cycle, against the baseline of fifteen.

### Security and Privacy

- The tool holds no production write credentials; the only production access is a read for the initial sandbox seed.
- Player PII (haven addresses, real-world locations) is excluded from any artefact sent to an external AI assistant.
- ST-hidden material is excluded from player-facing context.
- The sandbox runs locally and is not hosted or exposed on a network.

### Performance

- Pack regeneration completes fast enough to run on demand without discouraging re-running (target: a few seconds for the current roster of roughly thirty characters), so staleness is never a reason to skip a regeneration.

### Reliability and Recoverability

- The sandbox is disposable: any sandbox state can be rebuilt by re-seeding from production and replaying the migration scripts.
- Migration scripts are idempotent and produce the same result on replay.

### Maintainability (AI-codeability)

- The codebase is structured so that no single file is large enough to defeat AI-assisted editing, the driver behind keeping the cockpit separate from the admin monolith. New code lands in small, single-concern modules.

### Deliberately Excluded

- **Scalability** (a single operator, no growth axis) and **broad accessibility conformance** (a single known user) are intentionally out of scope, recorded so the omission is a decision, not an oversight.
