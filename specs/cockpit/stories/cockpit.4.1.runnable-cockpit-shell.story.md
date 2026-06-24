---
epic: 4
story: 4.1
story_key: cockpit.4.1.runnable-cockpit-shell
title: Minimal runnable cockpit — localhost browser shell over the Phase 1 pack
status: done
phase: 2
repo: TerraMortis-cockpit
inputs:
  - specs/cockpit/mockup.html
  - specs/cockpit/architecture.md
  - lib/build-character-index.mjs
  - lib/serialise-pack.mjs
  - generate-pack.mjs
---

# Story 4.1: Minimal runnable cockpit — localhost browser shell over the Phase 1 pack

Status: in-progress

> First slice of Epic 4 (Phase 2). Goal: something the ST can actually OPEN IN A BROWSER
> and click, instead of reading a markdown file. Read-only views only; the
> draft/propose/commit workspace and slot-guards are later Epic 4 stories.

## Story

As the ST,
I want to open the cockpit in a browser and click through the grounding pack (Character
Index, Glossary, Channel Rules, Codified Rules, raw pack) with a Regenerate button,
so that I can actually see and use the tool as an app rather than reading a markdown file.

## Scope

IN (this slice):
- A localhost HTTP server that serves a browser UI and one data endpoint.
- Read-only views rendered from the existing Phase 1 lib: Character Index (with legal
  names), Glossary, Channel Rules, Codified Rules, and the raw serialised pack.
- A Regenerate action that re-fetches live from the sandbox.
- Styling from `specs/cockpit/mockup.html` (Parchment tokens, Cinzel/Lato/Libre
  Baskerville, crimson accent), light mode only.

OUT (later Epic 4 stories): the draft → propose → commit workspace, staged changes, the
two structural slot-guards, `assembleContext`, correspondence, the re-audit UI, any write
endpoint. The sidebar may show these as disabled/"future".

## Acceptance Criteria

1. `npm start` (i.e. `node server.mjs`) starts a localhost-bound HTTP server on a fixed
   port using ONLY Node built-ins (no new npm dependencies beyond the existing
   mongodb + dotenv).
2. `GET /` returns the cockpit UI: a sidebar (domains) + content area, styled per the
   mockup design tokens, light mode.
3. `GET /api/pack-data` returns JSON assembled from the existing Phase 1 lib: character
   index (including `legalName`), glossary, channel rules, codified rules, collisions, and
   the serialised markdown pack.
4. The UI renders, navigable via the sidebar: Character Index (showing "Moniker (Legal
   Name)" where a moniker exists), Glossary, Channel Rules, Codified Rules, and a raw-pack
   view. A Regenerate button re-fetches `/api/pack-data` live.
5. Shared orchestration is extracted to `lib/build-pack-data.mjs` and used by BOTH
   `generate-pack.mjs` and `server.mjs` (single composition path). The CLI pack output is
   byte-identical to before this story (no Phase 1 regression) — verify by hashing the
   generated pack before and after.
6. Read-only and local: the server only reads via the existing `connect.mjs` surface; no
   write endpoints; binds to localhost. British English; light mode only.

## Dev Notes

- Server: Node `http` module, bind `127.0.0.1`, fixed port (propose 4317). No framework.
- Reuse: `buildCharacterIndex`, `detectCollisions`, `assembleGlossary`,
  `assembleChannelRules`, `assembleRules`, `serialisePack` — all already exist. Extract the
  generate-pack orchestration into `lib/build-pack-data.mjs` (`buildPackData(label)` →
  `{ label, index, collisions, glossary, channelRules, rules, markdown }`).
- UI: a single static HTML page (sidebar + content), inline CSS lifted from the mockup,
  inline JS that fetches `/api/pack-data` and renders the four reference views + raw pack,
  switching on sidebar clicks. Keep it one file for the slice.
- Verify no regression: hash `out/drafting-pack.md`, refactor, regenerate, confirm same hash.

## Tasks / Subtasks

- [x] Extract `lib/build-pack-data.mjs`; refactor `generate-pack.mjs` to use it; confirm
      byte-identical pack output (hash before/after).
- [x] Add `server.mjs` (Node http, localhost, `/` + `/api/pack-data`).
- [x] Add `public/cockpit.html` (UI shell + render logic) served at `/`.
- [x] Add `"start": "node server.mjs"` to package.json.
- [x] Run it; confirm the page loads, all views render, Regenerate works, read-only.

## Dev Agent Record

### Implementation
- **`lib/build-pack-data.mjs`** (new) — single composition path: `buildPackData(label)` →
  `{ label, index, collisions, glossary, channelRules, rules, markdown }`. Holds the
  orchestration that was inline in generate-pack.
- **`generate-pack.mjs`** — refactored to a thin wrapper over `buildPackData`; writes the
  markdown + prints the summary. Output byte-identical (md5 `6cd66590…` before and after).
- **`server.mjs`** (new) — Node built-in `http`, binds `127.0.0.1`, port 8731 (override
  with `COCKPIT_PORT`; 4317 was taken by another local app, so the default moved and an
  EADDRINUSE handler now prints a helpful message). Routes: `GET /` → UI, `GET
  /api/pack-data` → JSON. Non-GET → 405 (no write surface).
- **`public/cockpit.html`** (new) — single-file UI: sidebar (Character Index, Glossary,
  Channel Rules, Codified Rules, Raw Pack; future items disabled) + content, styled with
  the mockup's Parchment tokens (light mode). Fetches `/api/pack-data`, renders the views,
  Regenerate re-fetches. Character Index shows "Moniker (Legal Name)".
- **package.json** — added `"start": "node server.mjs"`.

### Testing / validation
Server live on http://127.0.0.1:8731 (background):
- `GET /` → 200, title "Terra Mortis — ST Cockpit".
- `GET /api/pack-data?label=DT5` → 200, 182 KB: 36 chars, 6 collision groups + 4 curated,
  2 glossary terms, 1 channel, 5 rules. Doc carried as "Protector Doc / Margaret Kane"
  (the 2.10 legal-name fix visible in the app).
- Read-only: `POST /api/pack-data` → 405; bogus path → 404.
- AC5 regression: generate-pack output md5 unchanged (`6cd66590ef60d3070bd0f3b2bb266d56`).
- No new dependencies (built-in `http`).

### File List
- `lib/build-pack-data.mjs` (new), `server.mjs` (new), `public/cockpit.html` (new)
- `generate-pack.mjs` (refactored), `package.json` (start script)

## QA Review

**Verdict: APPROVE (independent, 2026-06-24).** All six ACs verified against the running
server and the source: built-ins only (no new deps), `GET /` → 200 + correct title,
`/api/pack-data` returns the assembled JSON with `legalName` on every entry (6 monikers
differ, e.g. Etsy / Don Ezzelino Rocio), the UI renders all five views + Regenerate and
shows "Moniker (Legal Name)", single composition path via `build-pack-data.mjs` with
byte-identical CLI output (md5 `6cd66590…` unchanged), and read-only enforced (POST → 405,
no write routes). Status: review → done.

## References
- `specs/cockpit/mockup.html` (design target)
- `specs/cockpit/architecture.md` (localhost, reuse stack, normalised CSS, light mode)
