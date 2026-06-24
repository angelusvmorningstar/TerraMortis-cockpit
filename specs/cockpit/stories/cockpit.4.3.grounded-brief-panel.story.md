---
epic: 4
story: 4.3
story_key: cockpit.4.3.grounded-brief-panel
title: Grounded brief panel — per-character context view
status: done
phase: 2
repo: TerraMortis-cockpit
inputs:
  - public/cockpit.html
  - specs/cockpit/mockup.html
---

# Story 4.3: Grounded brief panel — per-character context view

Status: done (QA APPROVED 2026-06-24)

> Next Epic 4 slice after the shell (4.1) and dashboard (4.2). Turns the flat index into a
> focused per-character brief — the always-present grounded context the mockup's right
> column shows. Read-only, client-side (data already in /api/pack-data). Sets up 4.4 (paste
> a submission → assembled prompt).

## Story

As the ST,
I want to pick a character and see a focused grounded brief — identity with provenance,
their dossier facts, the "distinct from" collision notes that apply to them, and the gap
fields the pack deliberately does not carry,
so that I have the character's grounded context in front of me before drafting.

## Acceptance Criteria

1. A **Brief** view (sidebar item) with a roster of selectable characters (chips or list);
   selecting one shows that character's brief. Selection persists in the browser
   (localStorage) across reloads.
2. The brief shows **identity** — displayName, legal name (where a moniker exists), clan,
   covenant, bloodline, court title — each with its provenance where available, and gap
   markers ("none on record") for absent identity fields.
3. The brief shows the character's **dossier facts** grouped/readable (tag, value,
   provenance), matching what the pack carries for them.
4. The brief surfaces any **collision / "distinct from" notes** (auto + curated) that name
   this character, so the ST sees the disambiguation in context.
5. The brief shows explicit **gap fields the pack does not carry** — Travel and Prior
   letters — each marked "none on record — do not infer" (previewing the 4.5 slot-guards).
6. Existing views (Dashboard, Character Index, Glossary, Channel Rules, Codified Rules, Raw
   Pack) still work. Client-side only; read-only; light mode; British English; existing
   tokens.

## Dev Notes

- Client-side in `public/cockpit.html`. Add a `brief` view: a roster (reuse the sorted
  character list) + a selected-character panel. Persist selection under
  `localStorage['tm_cockpit_char']` (by character id).
- All data is already in `DATA` (index.characters with dossierFacts + legalName;
  collisions.collisions / collisions.curated). The collision match: include any curated
  note whose `names` include this character's displayName/legalName/sortName, and any auto
  collision group whose members include this character.
- Gap fields (Travel, Prior letters) are static "none on record — do not infer" rows; the
  pack carries no such field in Phase 1. This previews FR17/FR18.
- Model the panel on the mockup's right-column "Grounded brief" (`.brief`, `.fact`, `.k`,
  `.v`, `.prov`, `.gap`, `.warn-collide`).

## Tasks / Subtasks

- [x] Add Brief sidebar view + roster; persist selection (localStorage).
- [x] Render identity block (with provenance + gap markers).
- [x] Render dossier facts (grouped, readable).
- [x] Surface applicable collision / distinct-from notes.
- [x] Add the Travel / Prior-letters gap rows.
- [x] Confirm other views still work; read-only unchanged.

## Dev Agent Record

### Implementation
All client-side in `public/cockpit.html`:
- Added a **Character Brief** sidebar view (`data-view="brief"`).
- `renderBrief()`: a roster of name chips (sorted, moniker labels) + the selected
  character's brief card. Selection persists under `localStorage['tm_cockpit_char']` (by
  id); `setChar()` writes + re-renders.
- Identity block via `idRow()`: Clan / Covenant / Bloodline / Court title, each value +
  `(sheet)` provenance, or a `gap` chip when "[none on record]".
- Two explicit gap rows via `gapRow()`: Travel ("do not infer from haven") and Prior
  letters ("none validated this cycle") — previewing FR17/FR18.
- `collisionsFor(c)`: matches curated notes + auto collision groups whose names/members
  overlap the character's name tokens (displayName/legalName/sortName), rendered as a
  "Distinct from — do not merge" box.
- Dossier facts grouped (tag, value, source).
- Roster chip clicks handled via the existing `#content` delegated listener (extended to
  `.chip[data-char]` alongside `.phase-seg`).

### Testing / validation
- `GET /` → 200; served page has the brief markers (data-view=brief, renderBrief,
  tm_cockpit_char, collisionsFor, brief-card, chip[data-char]).
- Inline JS parses cleanly (`new Function`).
- No server change; read-only and byte-identical pack unaffected.
- NOTE: visual rendering confirmed by the ST in-browser (no headless browser here).

### File List
- `public/cockpit.html` (modified — Character Brief view)

## QA Review

**Verdict: APPROVE (independent, 2026-06-24).** All six ACs verified by reading the served
page and reasoning about the logic, with collision matching checked against live DT5 data:
brief view + roster + `tm_cockpit_char` persistence (key consistent get/set; both click
branches present); `idRow()` provenance + gap detection (`!val||val==='[none on record]'`);
dossier facts incl. empty case; `collisionsFor()` surfaces the right notes for René St.
Dominique, Charles, Charlie, Keeper, Brandy, Eve (and `nameTokens` guards absent fields);
Travel + Prior-letters gap rows always render; TITLES/count/render-map all carry brief and
the other six views remain; only public/cockpit.html + epics.md changed; JS parses. One
non-blocking advisory (collision match couples to displayName shape) addressed with a code
comment. Status: review → done.

## References
- `specs/cockpit/mockup.html` (right-column grounded brief)
- `public/cockpit.html` (4.1/4.2)
