---
epic: 1
story: 1.1
story_key: cockpit.1.1.scaffold
title: Scaffold the cockpit tool
status: done
phase: 1
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/prd.md
---

# Story 1.1: Scaffold the cockpit tool

Status: done

## Story

As the ST,
I want a self-contained `cockpit/` tool skeleton,
so that the Phase 1 grounding generator has a home separate from the production app, with a connection config that can only ever point at local databases.

## Acceptance Criteria

1. **Given** the repo, **When** the cockpit is scaffolded, **Then** a top-level `cockpit/` directory exists containing `package.json` (`type: module`; deps `mongodb` and `dotenv`), `.env.example` (`SANDBOX_URI`, `CHRONICLE_URI` — local URIs only, no production write credentials), and `.gitignore` (ignoring `.env` and `out/`).
2. **Given** `cockpit/`, **When** `npm install` is run inside it, **Then** it succeeds with no new global tooling and no change to the root or `server/` dependency trees.
3. **Given** the deploy configs, **When** Netlify and Render build, **Then** `cockpit/` is **not** included (it is outside `public/` which Netlify publishes, and outside the `server/`/`bot` `rootDir`s that Render builds).
4. **Given** `.env.example`, **When** an ST copies it to `.env`, **Then** the file contains only local-host connection strings and an explicit comment that production credentials must never be placed here (connection isolation is the safety mechanism).

## Dev Notes

### What this story creates (and ONLY this)
A scaffold — config files only. No DB code yet (`connect.mjs` is Story 1.2; the generator modules are Epic 2). Create:

```
cockpit/
├── package.json          # type:module; deps mongodb ^7.1.1, dotenv ^17.3.1; private; node >=20.19
├── .env.example          # SANDBOX_URI, CHRONICLE_URI — local only, with the "never prod" comment
├── .gitignore            # .env, out/, node_modules/
├── README.md             # one-paragraph stub: what this is + "see specs/cockpit/ for the plan"
└── out/.gitkeep          # so the generated-pack output dir exists (out/* stays gitignored)
```

Do **not** create `lib/`, `seeds/`, `scripts/`, `generate-pack.mjs` or any `.mjs` module in this story — those are later stories. Keep the surface minimal.

### Verified conventions to mirror (read before writing)
- **Stack is pinned — match `server/package.json` exactly** to avoid drift: `mongodb` `^7.1.1`, `dotenv` `^17.3.1`, `"type": "module"`, `"engines": { "node": ">=20.19.0" }`. (Confirmed from `server/package.json`; dev runs Node v24.) No web version lookup needed — we pin to what `server/` already uses. No other dependencies.
- **ESM `.mjs` script idiom** is established by `server/scripts/build-map-local.mjs` (top-level `import … from 'node:fs'`, plain functions). The cockpit follows the same idiom in later stories; nothing executable is added here.
- **Naming** (architecture → Implementation Patterns): files kebab-case `.mjs`; functions camelCase. Fixed collection/db names for later use: `tm_suite_dev` (sandbox), `tm_chronicle` (reference). British English in any prose.

### Deploy-exclusion evidence (AC3 — already verified)
- `netlify.toml` → `publish = "public"`. A top-level `cockpit/` is not under `public/`, so it is never published to Netlify.
- `render.yaml` → services use `rootDir: server` and `rootDir: bot`. `cockpit/` is in neither, so Render never builds or runs it.
- Therefore placing the tool at the repo top level (not under `public/` or `server/`) satisfies AC3 by construction. Do not nest it under either.

### .gitignore facts (so we don't double-handle)
- The **root** `.gitignore` already ignores `.env` and `node_modules/` globally, so `cockpit/.env` and `cockpit/node_modules/` are already covered. `out/` is **not** globally ignored.
- `cockpit/.gitignore` should still list `.env`, `out/`, `node_modules/` explicitly — self-documenting and robust if the tool is ever extracted. The key new line is `out/`.
- Commit `out/.gitkeep` so the directory exists; everything else in `out/` stays ignored.

### `.env.example` shape
Two local connection strings only, with a hard-rule comment, e.g.:
```
# Cockpit connects ONLY to local databases. NEVER put production credentials here.
# Connection isolation is the Phase 1 safety mechanism (the tool holds no prod write creds).
SANDBOX_URI=mongodb://127.0.0.1:27017/tm_suite_dev
CHRONICLE_URI=mongodb://127.0.0.1:27017/tm_chronicle
```
(Default to a local `mongodb://127.0.0.1:27017` instance; the ST may adjust host/port for their local Mongo / Docker, but it must stay local.)

### package.json shape
- `name` e.g. `tm-cockpit`, `version` `0.1.0`, `private: true`, `"type": "module"`, `"engines": { "node": ">=20.19.0" }`.
- `dependencies`: `mongodb` `^7.1.1`, `dotenv` `^17.3.1`. Nothing else.
- A `scripts.generate` placeholder pointing at the future entry (`"generate": "node generate-pack.mjs"`) is acceptable — it documents the entry point — but note it will not run until Story 2.6 creates `generate-pack.mjs`. No build/test scripts (no framework).

### Constraints / guardrails
- **Nothing writes to production in Phase 1.** This story creates no DB connection at all; it only ships an example config that, by its comment and local defaults, steers the operator to local-only.
- Reuse the existing Node ESM + mongodb-driver stack; **no starter template, no new runtime, no bundler**.
- This is greenfield — there are no existing `cockpit/` files to read or preserve.

## Tasks / Subtasks

- [x] Create `cockpit/package.json` (AC 1, 2) — `type:module`, `private`, `engines.node >=20.19.0`, deps `mongodb ^7.1.1` + `dotenv ^17.3.1` (matched to `server/`), `scripts.generate` placeholder.
- [x] Create `cockpit/.env.example` (AC 1, 4) — `SANDBOX_URI` + `CHRONICLE_URI` local `127.0.0.1` defaults + the "never put production credentials here" comment.
- [x] Create `cockpit/.gitignore` (AC 1) — `.env`, `out/*` (with `!out/.gitkeep`), `node_modules/`; added `cockpit/out/.gitkeep`.
- [x] Create `cockpit/README.md` — one-paragraph stub pointing to `specs/cockpit/` for the full plan.
- [x] Verify `npm install` inside `cockpit/` succeeds and adds nothing to root/`server` trees (AC 2).
- [x] Confirm `cockpit/` sits at repo top level, not under `public/` or `server/` (AC 3).

## Dev Agent Record

### Implementation notes
- Created the five scaffold files exactly as specced; no DB code or `.mjs` modules (those are Story 1.2 / Epic 2). British English throughout.
- `package.json`: `tm-cockpit`, `private`, `type:module`, `engines.node >=20.19.0`, deps `dotenv ^17.3.1` + `mongodb ^7.1.1` (pinned to match `server/package.json`). `scripts.generate` placeholder points at the future `generate-pack.mjs` (Story 2.6) — documents the entry point; not runnable yet.
- `.gitignore` uses `out/*` + `!out/.gitkeep` (rather than a bare `out/`) so the directory is tracked via `.gitkeep` while generated packs stay ignored — satisfies both "ignore `out/`" and "keep the dir".
- `.env.example` ships local `127.0.0.1` URIs only with the hard "never put production credentials here" comment (connection isolation).

### Testing / validation
- `package.json` parses as valid JSON.
- **Smoke (AC 2):** `npm install --prefix cockpit` succeeded — 0 vulnerabilities; `dotenv` + `mongodb` installed into `cockpit/node_modules`; `cockpit/package-lock.json` created. `server/package.json` unchanged. The root `package.json` shows only a **pre-existing, unrelated** change (`@turf/turf`, present at session start from map work) — the cockpit install did not touch it.
- **gitignore behaviour:** `git check-ignore` confirms `cockpit/node_modules`, `cockpit/.env`, and `cockpit/out/*` are ignored; git tracks exactly `package.json`, `package-lock.json`, `.env.example`, `.gitignore`, `README.md`, `out/.gitkeep`.
- **AC 3:** `cockpit/` is at repo top level; verified against `netlify.toml` (`publish = "public"`) and `render.yaml` (`rootDir: server`/`bot`) that it is outside both deploys.
- No test framework (repo convention is manual verification); the smoke above is the check. No runtime to execute yet (entry script is Story 2.6).

### File List
- `cockpit/package.json` (new)
- `cockpit/.env.example` (new)
- `cockpit/.gitignore` (new)
- `cockpit/README.md` (new)
- `cockpit/out/.gitkeep` (new)
- `cockpit/package-lock.json` (new — generated by `npm install`)

### Change Log
- 2026-06-24: Closed out (status review → done). Integration-validated by the Phase 1 live end-to-end run (Story 2.6): `generate-pack.mjs DT5` exercised this story’s code over real seeded data, exit 0. QA already on record.
- 2026-06-24: Scaffolded the `cockpit/` Phase 1 tool — `package.json` (ESM; mongodb/dotenv pinned to `server/`), local-only `.env.example`, `.gitignore`, README stub, `out/.gitkeep`. `npm install` smoke passed; deploy-excluded by construction. Cockpit Story 1.1.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE.** No changes required.

Verified independently:
- **Connection isolation sound** — the only host literal anywhere in `cockpit/` (outside `node_modules`) is `127.0.0.1`; no SRV/Atlas/Render/prod hosts, no embedded credentials. `.env.example` local-only; `.env` ignored by both cockpit and root `.gitignore`, so a real config cannot be committed.
- **Deploy-exclusion holds** — top-level dir; root has **no** npm `workspaces` to absorb it; outside Netlify `public/` and Render `server`/`bot` rootDirs. Cannot ship.
- **`package.json` correct** — `type:module`, `private`, deps match `server/` (`mongodb ^7.1.1`, `dotenv ^17.3.1`), Node engine sane.
- **`.gitignore` negation proven** — `git status` shows `out/.gitkeep` trackable and a dropped `out/*.md` ignored. (Earlier `git check-ignore -v` on `.gitkeep` returned 0 because it matched the *negation* rule — a tooling quirk, not a defect.)
- **Install smoke** — `npm install` 0 vulnerabilities, contained to `cockpit/`; `server/package.json` clean; root `@turf/turf` change is pre-existing/unrelated.

**Findings (none blocking):**
- *Nit:* `npm run generate` errors until Story 2.6 creates `generate-pack.mjs` (documented placeholder).
- *Forward note (Story 1.2):* two separate local URIs (sandbox + chronicle) → `connect.mjs` will need two `MongoClient`s or one client + two `.db()` calls; each DB name is embedded in its URI.

## Testing

No test framework (repo convention is manual verification; `server/` vitest does not cover tooling). The check is a smoke: `npm install` inside `cockpit/` succeeds, and the four files exist with the required content. No runtime to execute yet (the entry script arrives in Story 2.6).

## References

- Epic 1 / Story 1.1 and the Implementation Patterns + Project Structure sections: `specs/cockpit/epics.md`, `specs/cockpit/architecture.md`.
- Convention to mirror (ESM script idiom): `server/scripts/build-map-local.mjs`.
- Pinned versions: `server/package.json` (`mongodb ^7.1.1`, `dotenv ^17.3.1`, `type:module`, `node >=20.19.0`).
- Deploy exclusion: `netlify.toml` (`publish = "public"`), `render.yaml` (`rootDir: server` / `bot`).
- FR context: FR1-3 (PRD `specs/cockpit/prd.md`).
