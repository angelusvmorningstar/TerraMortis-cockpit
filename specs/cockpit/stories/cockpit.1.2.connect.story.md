---
epic: 1
story: 1.2
story_key: cockpit.1.2.connect
title: Single isolated data boundary (connect.mjs)
status: done
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/stories/cockpit.1.1.scaffold.story.md
---

# Story 1.2: Single isolated data boundary (connect.mjs)

Status: done

## Story

As the ST,
I want one connection module that can only ever reach local databases,
so that the cockpit can read the sandbox and reference data while being structurally incapable of touching production.

## Acceptance Criteria

1. **Given** a `cockpit/.env` copied from `.env.example`, **When** `lib/connect.mjs` connects, **Then** it opens **read** access to `tm_suite_dev` (`SANDBOX_URI`) and **read/write** access to local `tm_chronicle` (`CHRONICLE_URI`), and exposes read helpers for callers.
2. **Given** the module, **Then** it holds **no production write credentials**; the only configured hosts are local, and there is no exposed write handle to `tm_suite_dev` (the sandbox is read-only at the tool's API surface).
3. **Given** a verify step, **When** the ST runs it, **Then** the tool **reports the configured hosts and databases** and **refuses to proceed (non-zero exit / thrown error) if any non-local host is detected** (FR3) — e.g. a `mongodb+srv://…` Atlas URI, a `*.mongodb.net` host, or any non-loopback host is rejected before any connection is attempted.
4. **Given** valid local URIs and a running local MongoDB, **When** the verify step runs, **Then** it confirms both connections are reachable (a ping) and reports success.

## Dev Notes

### What this story creates
- `lib/connect.mjs` — the **single DB access point** for the whole cockpit. No other module opens a Mongo connection.
- A **runnable verify path** (AC 3/4): make `lib/connect.mjs` runnable directly (`node lib/connect.mjs`) so that, when run as the entry, it prints the host/DB report, runs the locality guard, and pings — exiting non-zero on any failure. (Use the `import.meta.url === pathToFileURL(process.argv[1]).href` main-check idiom so importing the module does not auto-run the verify.)

Do **not** create the index builder, assemblers, or seeds here (later stories). No write paths are exercised in 1.2 — `tm_chronicle` is *writable by design* but only seed stories use that; 1.2 is the boundary + read helpers + the locality guard.

### Established connection idiom to mirror (read these, do NOT import them)
The cockpit is a **separate repo** — `connect.mjs` must not import anything from the suite. But mirror the suite's proven idiom:
- `server/db.js`: `import { MongoClient } from 'mongodb'` → `new MongoClient(uri, {...})` → `client.db(<name>)` → `export function getCollection(name)`.
- `server/scripts/*.js`: `import 'dotenv/config'; const c = new MongoClient(process.env.MONGODB_URI); await c.connect(); const db = c.db('tm_suite');`

Key driver facts:
- `import 'dotenv/config'` auto-loads `.env` from the current working directory — matches the suite scripts. (Run the cockpit from the `cockpit/` repo root so `.env` is found.)
- `client.db()` **with no argument** uses the database named in the URI path. Our `.env.example` already puts the DB in the path: `…:27017/tm_suite_dev` and `…:27017/tm_chronicle` — so `client.db()` returns the right DB without a separate name.

### Connection shape (decision — carried from Story 1.1 QA)
There are **two separate URIs** (`SANDBOX_URI`, `CHRONICLE_URI`), each with its DB in the path. Use **two `MongoClient` instances** — one per URI — rather than one shared client. Rationale: the two URIs are independent connection strings (could differ in host/port/credentials), each carries its own default DB, and two clients keep the read (sandbox) and read/write (chronicle) handles cleanly separated. Each `client.db()` (no arg) yields its URI's DB.

### The locality guard (FR3 — the structural safety mechanism)
Before connecting, parse **each** URI and assert it is local; otherwise throw/exit. Define "local" explicitly:
- **Allow** hosts: `127.0.0.1`, `localhost`, `::1` (loopback only), scheme `mongodb://`.
- **Reject**: scheme `mongodb+srv://` (Atlas DNS-seedlist), any host ending `.mongodb.net`, and any host that is not one of the loopback values above. Reject before opening a socket.
- Parse robustly: a `mongodb://host:port/db` URL parses with the WHATWG `URL` (or `new URL(uri.replace('mongodb://','http://'))` if needed) to extract the hostname; for `mongodb+srv://` reject on scheme alone. Handle a comma-separated replica-set host list by checking every host.
- The guard runs for **both** URIs. If either is non-local, the whole tool refuses (no partial connect).

This guard is *the* enforcement of connection isolation: even if someone pasted a prod URI into `.env`, the tool refuses to run. It is also fully testable without a live Mongo (pure string logic).

### Read-only-at-the-API-surface
The Mongo driver does not itself make a connection read-only (that would need a read-only DB user). For Phase 1, "read-only sandbox" is enforced by **what `connect.mjs` exposes**: expose a sandbox **read** helper (e.g. `sandboxCollection(name)` returning a collection for `find`/`aggregate`) and a chronicle **read/write** helper. Do **not** export a generic writable sandbox handle. (The ST may *optionally* also configure a read-only Mongo user for `tm_suite_dev`, but that is not required by this story.)

### Suggested module API (adjust names to taste, keep camelCase)
- `assertLocalUri(uri)` — throws on non-local (the guard).
- `connect()` — runs the guard on both URIs, creates + connects both clients, returns `{ sandbox, chronicle, close }` where `sandbox`/`chronicle` are `Db` handles (or expose `sandboxCollection(name)` / `chronicleCollection(name)`).
- `verify()` — prints hosts + DB names for both URIs, runs the guard, pings both, reports pass/fail. Invoked by the direct-run main check.

### Constraints / guardrails
- **No new dependencies** — `mongodb` ^7 + `dotenv` ^17 are already installed (Story 1.1). Reuse them.
- kebab-case `.mjs`, camelCase functions; British English in any output text.
- Must run from the **cockpit repo** (`cockpit/`); no imports from the suite.
- Fail loudly: a missing `.env`, a missing URI, or a non-local host must throw a clear message and exit non-zero (never silently default to a remote/prod host).
- `.env` itself is gitignored (Story 1.1); only `.env.example` is committed. The verify needs a real `.env` (copied from the example) to run.

## Tasks / Subtasks

- [x] Create `lib/connect.mjs` (AC 1, 2) — `import 'dotenv/config'`; read `SANDBOX_URI` + `CHRONICLE_URI`; two `MongoClient`s; `client.db()` (URI-default DB); expose sandbox **read** helper (`readOnlyCollection` wrapper — find/findOne/aggregate/distinct/count only) + chronicle read/write helper + `chronicleDb` + `ping()` + `close()`. No writable sandbox handle.
- [x] Implement `assertLocalUri(uri)` (AC 3) — loopback-only allowlist (`127.0.0.1`/`localhost`/`::1`); reject `mongodb+srv`, any non-loopback host; strips `user:pass@` and `:port`, handles `[::1]` and comma-separated replica-set host lists; run for both URIs before connecting.
- [x] Implement the verify path (AC 3, 4) — reports hosts + DBs for **both** URIs first (so a rejected URI is still shown), then runs the guard, then pings both; runnable via `node lib/connect.mjs` (main-check via `import.meta.url` vs `pathToFileURL(process.argv[1]).href` so importing does not auto-run); non-zero exit on any failure.
- [x] Fail-loud handling — missing `.env`/URI → clear error + non-zero exit; credentials redacted in messages.
- [x] Smoke: (a) remote `SANDBOX_URI` (`mongodb+srv://…`, `10.0.0.5`, hostname) → **rejected before connecting** ✓; (b) live ping with local URIs — connect/ping path runs (reached `ECONNREFUSED`), **PASS pending a running local Mongo** (see Dev Agent Record).

## Dev Agent Record

### Implementation notes
- Single new file `lib/connect.mjs`; no new dependencies (reuses `mongodb` ^7 + `dotenv` ^17 from Story 1.1). Mirrors the suite idiom (`import 'dotenv/config'` + `new MongoClient(uri)` + `client.db()`), **without importing from the suite** (separate repo). British English.
- **Two `MongoClient`s** (one per URI), each `client.db()` using the URI-default DB (DB name lives in the `.env` URI path). Decision per Story 1.1 QA.
- **Locality guard `assertLocalUri`** is the FR3 enforcement: parses every host (handles `user:pass@`, `:port`, `[::1]`, comma-separated replica-set lists), rejects `mongodb+srv://` on scheme and any non-loopback host. Run for **both** URIs **before** any socket is opened.
- **Read-only sandbox at the API surface:** `sandboxCollection()` returns a `readOnlyCollection` wrapper exposing only read ops (find/findOne/aggregate/distinct/count) — no write method reaches `tm_suite_dev` through the tool. `chronicleCollection()` / `chronicleDb` are read/write (for later seed stories). No raw sandbox `Db` is exposed.
- **`verify()`** reports both URIs' host(s)+DB first, then asserts locality, then pings; runnable directly via the `import.meta.url` main-check (importing the module does not auto-run it). Fail-loud: missing `.env`/URI, non-local host, or unreachable DB → clear message + `process.exit(1)`.

### Testing / validation (commands run)
- `node --check lib/connect.mjs` → **parse OK**.
- **Locality guard** (no Mongo needed): rejected `mongodb+srv://x.mongodb.net/...`, `mongodb://10.0.0.5:27017/db`, `mongodb://db.example.com:27017/x`; accepted `mongodb://127.0.0.1…`, `mongodb://localhost…`, `mongodb://[::1]…`. All correct (exit 0).
- **`node lib/connect.mjs` with local URIs:** printed the host/DB report + `Locality guard: PASS`, then ping → `ECONNREFUSED 127.0.0.1:27017` (exit 1). The connect/ping path runs correctly; the failure is purely **no local MongoDB running yet** (the sandbox is seeded in Story 1.3). **AC4 live-PASS is pending a running local Mongo** — environment limitation, not a code defect.
- **`node lib/connect.mjs` with a remote `SANDBOX_URI`:** reported both URIs, then **refused before connecting** with `Refusing mongodb+srv:// (Atlas/remote) URI…` (exit 1) — proves FR3/AC3.
- No test framework (repo convention is manual verification).

### File List
- `lib/connect.mjs` (new)

### Change Log
- 2026-06-24: Closed out (status review → done). Integration-validated by the Phase 1 live end-to-end run (Story 2.6): `generate-pack.mjs DT5` exercised this story’s code over real seeded data, exit 0. QA already on record.
- 2026-06-24: Added `lib/connect.mjs`, the single isolated data boundary — two local MongoClients (sandbox read-only at the API surface; chronicle read/write), `assertLocalUri` loopback-only guard (FR3) that refuses any non-local host before connecting, and a runnable `verify`. Cockpit Story 1.2.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE.** No changes required.

Verified independently:
- **Imports clean** — only `dotenv/config`, `mongodb`, `node:url`; no suite imports (cockpit is a separate repo).
- **Locality guard is watertight** — 8 adversarial cases all correct: userinfo-spoof (`127.0.0.1@evil.com` → reject), password-with-`@` (`user:p@ss@127.0.0.1` → accept), subdomain tricks (`127.0.0.1.evil.com`, `localhost.evil.com` → reject), mixed replica-set list (`127.0.0.1,evil.com` → reject), all-local replica-set (accept), uppercase scheme (accept), decimal-IP `2130706433` (reject). Allowlist approach fails safe.
- **Verify** reports both URIs then refuses a remote one before connecting (exit 1) — FR3/AC3 proven.

**Findings (none blocking):**
- *Low:* `readOnlyCollection.aggregate` can write via a `$out`/`$merge` stage, so the sandbox surface isn't absolutely write-proof — but the locality guard contains any such write to the local, disposable sandbox (never prod). Consider a `$out`/`$merge` reject or a comment; `aggregate` is needed for the index builder's `$lookup`.
- *Low:* `connect()` connects the two clients sequentially; a second-client failure leaks the first (no close). Negligible in the CLI path (process exits); add a try/close when later stories call `connect()` programmatically.
- *Info:* AC4 live ping PASS pending a running local Mongo (Story 1.3 sandbox seed); the `ECONNREFUSED` confirms the ping path runs.

**Post-review hardening (both Low findings RESOLVED, 2026-06-24):**
- Added `assertNoWriteStages(pipeline)` (exported) and wired it into the read-only `aggregate` — `$out`/`$merge` now throw, closing the sandbox write-hole. Verified: throws on `$out`/`$merge`, passes `$lookup`/plain/undefined.
- Wrapped `connect()`'s two `connect()` calls in try/close so a partial-connect failure closes the client that opened (no leak).
- Re-smoked: parse OK; `$out`/`$merge` reject correct; remote-URI refuse-before-connect regression intact.

## Testing

No test framework (repo convention is manual verification). The smoke is two-part: the **locality guard** is exercised with a deliberately remote URI (must reject — this needs no live Mongo), and the **live connection** is exercised against a local Mongo if one is running. The sandbox need not be seeded yet (Story 1.3); an empty/absent `tm_suite_dev` still proves the connection + guard. Record what was run.

## References

- Epic 1 / Story 1.2 and the Implementation Patterns + Project Structure sections: `specs/cockpit/epics.md`, `specs/cockpit/architecture.md` (lib/connect.mjs is "the single data boundary"; `tm_suite_dev` read-only + `tm_chronicle` read/write; connection isolation = safety mechanism).
- Idiom to mirror (do not import): `server/db.js` (in the sibling TM Suite repo — `MongoClient` + `client.db()` + `getCollection`), `server/scripts/*.js` (`import 'dotenv/config'` + `new MongoClient`).
- Config from Story 1.1: `.env.example` (`SANDBOX_URI=mongodb://127.0.0.1:27017/tm_suite_dev`, `CHRONICLE_URI=…/tm_chronicle`), `package.json` (`mongodb ^7.1.1`, `dotenv ^17.3.1`, `type:module`).
- FR2, FR3 (PRD `specs/cockpit/prd.md`).
