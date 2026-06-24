---
epic: 2
story: 2.6
story_key: cockpit.2.6.generate-pack
title: The generate-pack CLI
status: review
phase: 1
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/epics.md
  - specs/cockpit/architecture.md
  - specs/cockpit/stories/cockpit.2.2.character-index.story.md
  - specs/cockpit/stories/cockpit.2.3.detect-collisions.story.md
  - specs/cockpit/stories/cockpit.2.4.assemblers.story.md
  - specs/cockpit/stories/cockpit.2.5.serialise-pack.story.md
  - specs/cockpit/stories/cockpit.1.2.connect.story.md
---

# Story 2.6: The generate-pack CLI

Status: review

## Story

As the ST,
I want one command that produces the drafting pack,
so that I can regenerate a fresh, grounded pack whenever I draft a cycle.

## Acceptance Criteria

1. **Given** a configured sandbox + chronicle (`.env` + seeded local Mongo), **When** the ST runs `node generate-pack.mjs [label]` (or `npm run generate`), **Then** it connects, builds the index, detects collisions, assembles the three sections, serialises the pack, **writes `out/drafting-pack.md`** and prints it to stdout, ending with a **run-summary line**.
2. **Given** a sandbox edit, **When** the ST re-runs the command, **Then** the regenerated pack reflects the change (FR22) — true by construction, the tool reprojects every run with no cache.
3. **Given** any failure (missing `.env`, a non-local host refused by `connect`'s guard, unreachable Mongo), **Then** it prints a clear error and exits **non-zero**; the run-summary prints only on success.

## Dev Notes

### What this story creates
`generate-pack.mjs` at the **cockpit repo root** (the CLI entry; matches `package.json` `scripts.generate = "node generate-pack.mjs"`). It is the **thin orchestrator** — NOT pure; it MAY use `node:fs` and `process.argv`. It imports the Epic 2 pieces from `./lib/*` and `connect` from `./lib/connect.mjs`.

### Orchestration (exact wiring)
```js
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { connect } from './lib/connect.mjs';
import { buildCharacterIndex } from './lib/build-character-index.mjs';
import { detectCollisions } from './lib/detect-collisions.mjs';
import { assembleGlossary } from './lib/assemble-glossary.mjs';
import { assembleChannelRules } from './lib/assemble-channel-rules.mjs';
import { assembleRules } from './lib/assemble-rules.mjs';
import { serialisePack } from './lib/serialise-pack.mjs';

async function main() {
  const label = process.argv[2] || '(unlabelled cycle)';

  // 1) Character Index — buildCharacterIndex opens/closes its OWN connection (reads tm_suite_dev).
  const index = await buildCharacterIndex();

  // 2-3) One shared connection for the chronicle side (disambiguations + the three assemblers).
  const conn = await connect();
  let md;
  try {
    const disambiguations = await conn.chronicleCollection('disambiguations').find({}).toArray();
    const collisions = detectCollisions(index, disambiguations);
    const glossary = await assembleGlossary(conn);
    const channelRules = await assembleChannelRules(conn);
    const rules = await assembleRules(conn);
    md = serialisePack({ label, characterIndex: index, collisions, glossary, channelRules, rules });
  } finally {
    await conn.close();
  }

  // 4) Write to cockpit/out/drafting-pack.md (resolved relative to THIS script, not the caller's cwd).
  const outPath = join(dirname(fileURLToPath(import.meta.url)), 'out', 'drafting-pack.md');
  writeFileSync(outPath, md, 'utf8');

  // 5) stdout + run summary.
  console.log(md);
  console.log(
    `\n— ${index.characters.length} characters, ${collisions.collisions.length} collision groups, `
    + `${collisions.curated.length} curated notes — written to out/drafting-pack.md`,
  );
}

main().catch((err) => { console.error(`generate-pack FAILED: ${err.message}`); process.exit(1); });
```
(`collisions` is referenced in the summary — hoist it so it's in scope for the final log, or compute the summary inside the try and stash the counts.)

### Key points
- **Output path resolved relative to the script** (`fileURLToPath(import.meta.url)` → `dirname` → `out/drafting-pack.md`), so it always writes `cockpit/out/`, regardless of the caller's cwd. `out/` exists (`out/.gitkeep`, Story 1.1); `out/*.md` is gitignored.
- **`.env` is loaded by `connect.mjs` / `buildCharacterIndex` via `import 'dotenv/config'` from the cwd** — so run from the cockpit repo root (`cd cockpit && node generate-pack.mjs`, or `npm run generate`). Note this in usage.
- **Label** is `process.argv[2]` (e.g. a cycle name like `DT5`); default `(unlabelled cycle)`. **No `Date.now`/`new Date`** anywhere.
- **Fail loud:** the top-level `.catch` prints and `process.exit(1)`. The run-summary prints only after a successful write. `connect`'s locality guard already refuses a non-local host before any read.
- **FR22 (regenerate):** no cache — every run reprojects from the sandbox, so a sandbox edit is reflected on the next run automatically.

### Connection nuance (flag — do NOT change 2.2 here)
`buildCharacterIndex()` opens its **own** connection (Story 2.2 is not injectable), and the orchestrator opens a **second** connection for the chronicle reads + assemblers. So a run uses **two** connections, not one. Acceptable for a once-per-cycle local CLI. *Future refactor:* make `buildCharacterIndex` accept an injectable connection so the whole run shares one — out of scope for this story.

### Guardrails
- kebab-case file, camelCase functions, British English. No new deps. No suite imports.
- Reads only (sandbox via the read-only surface; chronicle reads); the only write is `out/drafting-pack.md` (local output). Never writes to either database.

### Live run (the big one) — pending the sandbox seed
This is the **full Phase-1 end-to-end**. It needs: a local Mongo running, a **seeded `tm_suite_dev`** (Story 1.3, the ST's one-time seed) and a **seeded `tm_chronicle`** (run the `seeds/*` from Stories 2.1 + 2.3). Until then the dev can `node --check generate-pack.mjs` and reason about the wiring, but the live `node generate-pack.mjs` (which produces a real `out/drafting-pack.md` from real data) is the **ST's end-to-end smoke after seeding**. Record live run pending. (Unlike the pure modules, this cannot be fully smoke-tested headless because `buildCharacterIndex` connects.)

## Tasks / Subtasks

- [x] Create `generate-pack.mjs` at the cockpit repo root (AC 1) — orchestrates per the wiring: `buildCharacterIndex()` → `connect()` for the chronicle → read `disambiguations` → `detectCollisions` → three assemblers (shared conn) → `serialisePack` → write `out/drafting-pack.md` (path relative to the script) + stdout + run summary; `conn.close()` in `finally`.
- [x] Fail-loud top-level `.catch` → clear message + `process.exit(1)`; run-summary only on success (AC 3).
- [x] Confirmed `package.json` `scripts.generate` = `node generate-pack.mjs` already matches (Story 1.1) — no change needed. Usage: `cd cockpit && npm run generate -- <label>` or `node generate-pack.mjs <label>`.
- [x] Validate: `node --check generate-pack.mjs` (parse OK) + verified all 7 lib import targets resolve to their named exports. Live `node generate-pack.mjs` end-to-end is **pending** a seeded local Mongo (`tm_suite_dev` + `tm_chronicle`) — the ST's step. Code-complete on parse + wiring.

## Dev Agent Record

### Implementation notes
- Created `generate-pack.mjs` at the **cockpit repo root** (the CLI entry; `main()` runs on load — it's the entry script). Imports `node:fs`/`node:url`/`node:path` and the seven `./lib/*` exports. No new deps, no suite imports, no `Date.now`/`new Date`.
- Orchestration exactly as specced: `buildCharacterIndex()` (its own connection) → `connect()` for the chronicle → read `disambiguations` → `detectCollisions(index, disambiguations)` → `assembleGlossary/ChannelRules/Rules(conn)` sharing the one connection → `serialisePack(...)`. `collisions`/`md` hoisted (`let`) so the summary and write see them; `conn.close()` in `finally`.
- **Output path resolved relative to the script** (`fileURLToPath(import.meta.url)` → `dirname` → `out/drafting-pack.md`), so it always writes `cockpit/out/` regardless of the caller's cwd. Then prints the pack to stdout and a run-summary line.
- **Fail loud:** top-level `.catch` prints `generate-pack FAILED: <msg>` and `process.exit(1)`; the summary prints only after a successful write. `connect`'s locality guard refuses any non-local host before reads.
- Reads only (sandbox read-only surface + chronicle reads); the sole write is the local `out/drafting-pack.md`. Never writes to either database. FR22 holds by construction (no cache — every run reprojects).
- **Connection nuance (recorded, not changed):** `buildCharacterIndex` opens its own connection and the orchestrator opens a second for the chronicle side → two connections per run. Acceptable for a once-per-cycle local CLI; a future refactor could make `buildCharacterIndex` injectable to share one. Out of scope here (do not change 2.2).

### Testing / validation
- `node --check generate-pack.mjs` → **parse OK**.
- Verified **all 7 lib import targets resolve to their named exports** (`connect`, `buildCharacterIndex`, `detectCollisions`, `assembleGlossary`, `assembleChannelRules`, `assembleRules`, `serialisePack` are all functions) — so the orchestrator's wiring is valid.
- Confirmed `package.json` `scripts.generate` = `node generate-pack.mjs`.
- **Live end-to-end pending the seed:** `generate-pack.mjs` cannot be run headless (it connects via `buildCharacterIndex`, and local Mongo is down / sandbox + chronicle unseeded). The real `node generate-pack.mjs` (producing `out/drafting-pack.md` from real data) is the **ST's run after** seeding `tm_suite_dev` (Story 1.3) and `tm_chronicle` (the `seeds/*` from 2.1 + 2.3). No test framework.

### File List
- `generate-pack.mjs` (new)

### Change Log
- 2026-06-24: Added `generate-pack.mjs` — the cockpit CLI orchestrator (build index → collisions → assemble sections → serialise → write `out/drafting-pack.md` + stdout + run summary; fail-loud, output path relative to the script). Parse + import-resolution verified; live e2e pending the sandbox/chronicle seed. **Completes Epic 2 and the Phase 1 generator at code level.** Cockpit Story 2.6.

## QA Review (Quinn) — 2026-06-24

**Verdict: APPROVE.** No changes required.

Verified independently (code review — the orchestrator connects, so no headless run):
- **No DB writes**, no `Date.now`/`new Date`/`Math.random`; imports only `node:*` + `./lib/*` (no suite imports).
- **Wiring valid** — all 7 lib import targets resolve to their named exports (dev step); data flow index → `detectCollisions` → assemblers(shared conn) → `serialisePack` is correct.
- **Scope/lifecycle** — `let collisions`/`let md` declared before the `try` and used after it (write + summary); chronicle `conn` closed in `finally`; `buildCharacterIndex` manages its own connection. Fail-loud top-level `.catch` → `process.exit(1)`, summary only after a successful write.
- **Output** — path resolved relative to the script (`import.meta.url`), `out/` exists so no `ENOENT`; single local write, never to a database.

**Findings (none blocking):**
- *Info:* live end-to-end (`node generate-pack.mjs` → real `out/drafting-pack.md`) pending the ST seeding `tm_suite_dev` (1.3) + `tm_chronicle` (`seeds/*`).
- *Info:* two connections per run (documented nuance; future refactor could make `buildCharacterIndex` injectable to share one).

## Testing

No test framework. `node --check generate-pack.mjs` confirms it parses and the imports resolve. The **live end-to-end** (a real `out/drafting-pack.md` from seeded data) is the ST's run after standing up the sandbox + chronicle seeds — the headline Phase-1 smoke. This story cannot be fully exercised headless (it connects via `buildCharacterIndex`), so the gate is honest: code-complete now, live e2e on seed.

## References

- Epic 2 / Story 2.6 (FR12/FR22): `specs/cockpit/epics.md`.
- Architecture: `generate-pack.mjs` is the CLI entry / thin orchestrator; `out/` gitignored output.
- Wires: `buildCharacterIndex` (2.2), `detectCollisions` (2.3), the three assemblers (2.4), `serialisePack` (2.5), `connect` (1.2).
- Seeds the run needs: `tm_suite_dev` (Story 1.3 — ST seed), `tm_chronicle` (`seeds/*` from 2.1 + 2.3).

## Epic 2 completion note
Completing this story **completes Epic 2 and the entire Phase 1 generator** at the code level. The cockpit can now project a Character Index, detect collisions, assemble the reference layer, and serialise a fixed-format grounded drafting pack. The only thing standing between code-complete and a real pasteable pack is the **ST's one-time sandbox/chronicle seed** (Stories 1.3 + the seed runs) — after which `node generate-pack.mjs` produces `out/drafting-pack.md` for real, and Epic 3 (re-audit) measures the fabrication drop.
