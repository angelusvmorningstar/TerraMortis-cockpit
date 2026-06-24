---
epic: 1
story: 1.3
story_key: cockpit.1.3.seed-sandbox
title: Seed the sandbox from production
status: review
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/stories/cockpit.1.2.connect.story.md
  - specs/cockpit/stories/cockpit.1.1.scaffold.story.md
---

# Story 1.3: Seed the sandbox from production

Status: review

## Story

As the ST,
I want a documented, one-time, read-only way to copy production into my local sandbox,
so that the cockpit has realistic data to read while production is never written to.

## Acceptance Criteria

1. **Given** `scripts/seed-sandbox.md`, **When** the ST follows it, **Then** a **read-only** export of production restores into local `tm_suite_dev` (matching `SANDBOX_URI = mongodb://127.0.0.1:27017/tm_suite_dev`).
2. **Given** the doc, **Then** it states plainly that the production access is **read-only** (export/`find` only; never a write or restore back to prod) and that the restore target is the **local** sandbox only.
3. **Given** that the local ISP blocks SRV DNS, **Then** the doc includes an **ordered fallback** that does not rely on `mongodb+srv://`: (a) the non-SRV seed-list connection string, (b) a small node-driver export script, (c) the MongoDB MCP export — so the ST can seed even when `mongodump mongodb+srv://…` fails to resolve.
4. **Given** the seed has run and local MongoDB is up, **When** the ST runs `node lib/connect.mjs`, **Then** the verify **ping PASSES** — closing Story 1.2 AC4.

## Dev Notes

### What this story delivers
A **document**: `scripts/seed-sandbox.md`. Optionally a **helper export script** `scripts/seed-sandbox.mjs` (the node-driver fallback), but it is a **one-time ST-run setup script**, not part of the cockpit's runtime, and **must not be run automatically** by the dev agent.

This story writes **no production code** and does **not** modify `connect.mjs`.

### The critical nuance — the seed is OUTSIDE the local-only boundary
`lib/connect.mjs` (Story 1.2) is **local-only**: its `assertLocalUri` guard *refuses* any non-loopback host, including the Atlas production host. So the seed step **cannot and must not** use `connect.mjs`. The seed is the **single, deliberate, read-only touch of production**, performed by the ST as a one-time setup outside the tool's normal operation, using the ST's own production **read** credentials transiently. After seeding, normal cockpit operation uses only the local `SANDBOX_URI`/`CHRONICLE_URI` and holds no production credentials. The doc must make this boundary explicit so the safety model stays intact.

If a `scripts/seed-sandbox.mjs` helper is committed, it:
- has its own prod connection (read-only) and **does not import `connect.mjs`**;
- reads named collections from prod and writes them **only** to `mongodb://127.0.0.1:27017/tm_suite_dev`;
- never writes to prod; never restores back.

### Environment facts to bake into the doc (from project reality)
- Production = MongoDB **Atlas**, database `tm_suite`, reached via a `mongodb+srv://…` URI.
- The ST's local **ISP blocks SRV DNS lookups**, so `mongodump`/`mongorestore` against the `mongodb+srv://` URI can fail to resolve. This is a known, recurring issue — the fallbacks exist precisely for it.
- The **non-SRV** form is the workaround: the explicit seed-list string `mongodb://host1:27017,host2:27017,host3:27017/tm_suite?ssl=true&replicaSet=<rs>&authSource=admin` (the same shape the suite's local server uses). Atlas → Connect → "Connect your application" → driver version pre-3.6 shows this non-SRV string.
- A local **MongoDB must be running** to receive the restore (the same instance `connect.mjs` pings).
- Collections the cockpit reads (Epic 2 Character Index): at minimum `characters`, `npcs`, `character_dossier`. Others are optional; seeding the whole `tm_suite` DB is fine.

### Recommended doc structure (`scripts/seed-sandbox.md`)
1. **What & why** — one-time, read-only prod → local `tm_suite_dev`; the safety boundary note above.
2. **Prerequisites** — local MongoDB running; `mongodump`/`mongorestore` (or Node); the ST's prod **read** connection string.
3. **Primary path** — `mongodump` the needed collections from prod (read-only), then `mongorestore` into local `tm_suite_dev`. Give exact commands with placeholders, e.g.:
   - `mongodump --uri="<prod-read-uri>" --db=tm_suite --collection=characters --out=./_seed`
   - `mongorestore --uri="mongodb://127.0.0.1:27017" --nsFrom="tm_suite.*" --nsTo="tm_suite_dev.*" ./_seed`
4. **Fallback A — non-SRV string** — use the explicit seed-list URI when `mongodb+srv://` won't resolve (the ISP/SRV block).
5. **Fallback B — node-driver export** — `scripts/seed-sandbox.mjs` (or an inline snippet): connect to prod read-only, `find()` each collection, `insertMany` into local `tm_suite_dev`. No SRV dependency if given the non-SRV string.
6. **Fallback C — MongoDB MCP export** — export collections via the MCP tooling, then import locally.
7. **Verify** — run `node lib/connect.mjs`; the ping should PASS (Story 1.2 AC4). Note that `_seed/` dump output should be deleted afterwards and is gitignored (it may carry player PII).
8. **Re-seeding** — the sandbox is disposable; drop `tm_suite_dev` and repeat to refresh.

### Guardrails
- British English; kebab-case filenames.
- **Read-only against prod, always.** No command in the doc writes to or restores into production.
- Per project convention, **the ST runs the export/import**, not the dev agent. The dev agent authors the doc (and optionally the helper script) but does not execute any prod-touching command.
- If `_seed/` (dump output) is referenced, add it to `.gitignore` (may carry player PII; never commit).

## Tasks / Subtasks

- [x] Write `scripts/seed-sandbox.md` (AC 1-4) covering: the read-only + local-only safety boundary; prerequisites; the primary `mongodump`/`mongorestore` path (`nsFrom tm_suite.*` → `nsTo tm_suite_dev.*`); the three ordered SRV-free fallbacks (non-SRV seed-list string; node-driver export; MCP export); the `node lib/connect.mjs` verify step; and re-seeding.
- [x] Add `scripts/seed-sandbox.mjs` — node-driver read-only export → local insert helper. Does NOT import `connect.mjs`; reads prod read-only via `SEED_SOURCE_URI`; refuses without `--confirm`; refuses a non-local target; never writes to prod. One-time ST-run script.
- [x] Add `_seed/` to `.gitignore` (PII; never commit).
- [x] Confirm the doc's verify step ties back to Story 1.2 AC4 (ping PASS after seeding).

## Dev Agent Record

### Implementation notes
- Documentation/setup story. Created `scripts/seed-sandbox.md` (the doc) + `scripts/seed-sandbox.mjs` (the node-driver fallback helper); added `_seed/` to `.gitignore`. No production code, no `connect.mjs` change, no new dependencies.
- **Safety boundary honoured:** `seed-sandbox.mjs` deliberately does NOT import `lib/connect.mjs` (whose guard would refuse the remote prod host). It is the single, deliberate read-only prod touch, with its own `SEED_SOURCE_URI`. It writes **only** to a local target and **refuses a non-local `SEED_TARGET_URI`** — the inverse guard to `connect.mjs` (connect refuses remote *sources*; the seed refuses remote *targets*). It also requires `--confirm` and refuses if source==target.
- The doc leads with the read-only/local-only boundary, gives the primary `mongodump`/`mongorestore` path, then the three ordered SRV-free fallbacks for the known ISP/SRV block, and ties the verify step to `node lib/connect.mjs` (closing Story 1.2 AC4).

### Testing / validation (commands run — none touch production)
- `node --check scripts/seed-sandbox.mjs` → **parse OK**.
- Exercised all four pre-connection refusal guards (each throws before any `MongoClient.connect()`, so no network/prod access): missing `SEED_SOURCE_URI` → refused; missing `--confirm` → refused; remote `SEED_TARGET_URI` → refused ("must be loopback"); source==target → refused. All exit 1 with clear messages.
- **The live seed (a real prod → `tm_suite_dev` copy, then `node lib/connect.mjs` ping PASS) is the ST's one-time step** — not run by the dev agent (it requires prod read credentials and touches production read-only). AC4's live ping confirmation happens on that run.

### File List
- `scripts/seed-sandbox.md` (new)
- `scripts/seed-sandbox.mjs` (new)
- `.gitignore` (modified — added `_seed/`)

### Change Log
- 2026-06-24: Added the sandbox-seed documentation (`scripts/seed-sandbox.md`) and a guarded node-driver export helper (`scripts/seed-sandbox.mjs`, read-only prod → local sandbox, `--confirm` + local-target guards); gitignored `_seed/`. Completes Epic 1. Cockpit Story 1.3.
- 2026-06-24: Post-QA fix — target guard now checks **all** target hosts (`hostsOf`), closing a gap where a multi-host `SEED_TARGET_URI` with a remote member passed the first-host-only check.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE** (after one Med fix, applied and re-verified).

Verified independently:
- **Read-only source:** only `find()` on the source DB; no insert/update/delete/drop on `sdb`. All writes go to the local `tdb` (`deleteMany`+`insertMany`). No `connect.mjs` import (only `mongodb`).
- **Doc:** read-only/local-only boundary unambiguous; the three fallbacks are genuinely SRV-free (non-SRV seed-list string, node-driver, MCP) and followable; no command writes to prod; verify step ties to Story 1.2 AC4. British English; no new deps; live seed correctly left as the ST's step.

**Finding (resolved):**
- *Med — FIXED:* the target-local guard originally checked only the first host (`hostOf` → `split(',')[0]`), so a multi-host `SEED_TARGET_URI` with a remote member (`mongodb://127.0.0.1,evil.invalid/...`) slipped past and would have written the prod copy to a remote replica-set member. Demonstrated, then fixed: `hostsOf` now parses every host and the guard rejects if **any** is non-loopback — mirroring `connect.mjs`. Re-verified: multi-host-remote target now rejected before connecting; single-remote still rejected; all-local still passes.
- *Low (non-blocking):* host-parsing logic is duplicated from `connect.mjs` — acceptable, since the seed is standalone by design and must not import `connect.mjs`.

## Testing

No code to test (documentation deliverable). Validation is a **doc review**: the steps are followable, the read-only/local-only boundary is unambiguous, and the SRV-free fallbacks are present. The end-to-end proof (a real seed + `node lib/connect.mjs` ping PASS) is the **ST's one-time run** on their own machine with prod read credentials — not executed by the dev agent. Record in the Dev Agent Record that the live seed is the ST's step.

## References

- Epic 1 / Story 1.3 (FR1): `specs/cockpit/epics.md`.
- Architecture `scripts/seed-sandbox.md` entry + SRV/ISP fallback note: `specs/cockpit/architecture.md`.
- Local-only boundary this must sit outside: `lib/connect.mjs` `assertLocalUri` (Story 1.2) — the seed uses prod read creds directly, never `connect.mjs`.
- Sandbox target: `.env.example` `SANDBOX_URI=mongodb://127.0.0.1:27017/tm_suite_dev` (Story 1.1).
- Closes: Story 1.2 AC4 (live ping PASS once the local sandbox exists).
