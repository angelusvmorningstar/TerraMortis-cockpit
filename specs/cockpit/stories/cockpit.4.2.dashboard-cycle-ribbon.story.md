---
epic: 4
story: 4.2
story_key: cockpit.4.2.dashboard-cycle-ribbon
title: Cockpit dashboard with a game-cycle ribbon
status: done
phase: 2
repo: TerraMortis-cockpit
inputs:
  - public/cockpit.html
  - specs/cockpit/mockup.html
---

# Story 4.2: Cockpit dashboard with a game-cycle ribbon

Status: done (QA APPROVED 2026-06-24)

> Angelus is definite about ONE element for now: a ribbon tracking the game cycle. The rest
> of the dashboard is open, so this story delivers the ribbon as the centrepiece plus a
> modest grounded "at a glance" strip, with room to add cards later.

## Story

As the ST,
I want a dashboard landing view with a ribbon showing the eight phases of the game cycle
and where we currently are,
so that I can see the chronicle's cadence at a glance when I open the cockpit.

## The game cycle (canonical, from `reference_game_cycle`)

Eight phases, in order:
1. **Cycle Opens** — feeding panel + pre-sign-in open; feeding primed from last downtime.
2. **Pre-Game** — players sign in and pay ahead, to start on time.
3. **Game** — the session runs.
4. **Game Closes** — Regency panel opens; Regents confirm feeding rights.
5. **Downtimes Open** — feeding gate lifts; players submit downtime forms.
6. **Downtimes Close** — submissions in; processing begins.
7. **ST Processing** — STs validate and resolve downtimes.
8. **Push Cycle** — approvals released, feeding reopened; loop to next cycle.

## Current-phase source (decision)

There is NO stored game-cycle-phase field (data only has per-submission statuses). For
this read-only v1 the current phase is **set in the browser and persisted to
localStorage** (click a phase to mark it current; it survives reload). This keeps the
cockpit read-only and gives an immediately usable ribbon. A later story can wire it to a
real source (a `tm_chronicle` cycle-state doc) if wanted.

## Acceptance Criteria

1. The cockpit has a **Dashboard** view, set as the default landing view (sidebar first
   item, active on load).
2. The dashboard shows a **game-cycle ribbon**: all eight phases in order, the current
   phase highlighted, earlier phases marked done, later phases muted.
3. Clicking a phase sets it current; the choice persists across reloads (localStorage).
   The current phase's name + one-line description is shown beneath the ribbon.
4. The dashboard also shows a small grounded "at a glance" strip from `/api/pack-data`
   (cycle label, character count, collision-group count, curated-note count) — clearly
   extensible, not the focus.
5. The existing views (Character Index, Glossary, Channel Rules, Codified Rules, Raw Pack)
   still work, reachable from the sidebar.
6. No server changes required (phases are static; current phase is client-side). Read-only,
   light mode, British English, styled with the existing tokens.

## Dev Notes

- All client-side: edit `public/cockpit.html` only. Add a `dashboard` view + the 8-phase
  `PHASES` array + ribbon render + click-to-set + localStorage key `tm_cockpit_phase`.
- Default `VIEW='dashboard'`; sidebar gains a Dashboard button as the first item.
- "At a glance" reuses the already-fetched `DATA` (label, characters.length,
  collisions.collisions.length, collisions.curated.length).

## Tasks / Subtasks

- [x] Add Dashboard sidebar item (first, default-on); set default view.
- [x] Add the 8-phase ribbon (render, current highlight, done/muted states).
- [x] Click-to-set current phase + localStorage persistence + current-phase caption.
- [x] Add the grounded at-a-glance strip.
- [x] Confirm existing views still render; read-only unchanged.

## Dev Agent Record

### Implementation
All client-side in `public/cockpit.html` (no server change):
- Added a **Dashboard** sidebar button as the first item; default `VIEW='dashboard'`.
- `PHASES` array = the 8 canonical game-cycle phases (name + one-line description).
- `renderDashboard()` draws the **ribbon** (8 segments): earlier phases `done` (gold +
  check), current `current` (crimson), later muted; below it a caption with the current
  phase name + description; then a grounded "Pack at a glance" strip (cycle label, char
  count, collision-group count, curated-note count).
- Click a segment → `setPhase()` persists to `localStorage['tm_cockpit_phase']` and
  re-renders. `currentPhase()` reads it (defaults to phase 1).
- `render()` paints the dashboard even before pack data loads (ribbon is static; glance
  fills on fetch); `load()` keeps the ribbon up during fetch rather than flashing a loader.

### Testing / validation
- `GET /` → 200; served page contains all dashboard markers (data-view=dashboard, PHASES,
  renderDashboard, ribbon, phase-seg, tm_cockpit_phase).
- Inline JS parses cleanly (`new Function(js)` — no syntax errors).
- No server change, so read-only + byte-identical pack from 4.1 are unaffected.
- NOTE: visual rendering verified by the ST in-browser (no headless browser in this env);
  code structure + logic verified here.

### File List
- `public/cockpit.html` (modified — dashboard view + ribbon)

## QA Review

**Verdict: APPROVE (independent, 2026-06-24).** All six ACs verified by reading the served
page and reasoning about the logic: Dashboard is the default first view; the 8-phase PHASES
array is correct and in order; ribbon class logic (i<cur→done, i===cur→current, else muted)
has no off-by-one; the `tm_cockpit_phase` localStorage key is consistent between read and
write and `currentPhase()` bounds-checks (default 0); the at-a-glance strip is guarded for
DATA===null so the ribbon renders before data; the existing five views still dispatch and
the nav handler is unchanged; only `public/cockpit.html` changed (server read-only,
byte-identical pack unaffected); inline JS parses. No bugs found. Status: review → done.

Note: visual rendering confirmed by the ST in-browser (no headless browser in the dev env).

## References
- `reference_game_cycle` (the 8 phases)
- `public/cockpit.html` (Story 4.1 shell)
