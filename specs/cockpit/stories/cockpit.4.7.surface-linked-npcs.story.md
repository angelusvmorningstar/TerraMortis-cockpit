---
epic: 4
story: 4.7
story_key: cockpit.4.7.surface-linked-npcs
title: Surface a character's linked NPCs in pack, brief, and prompt
status: done
phase: 2
repo: TerraMortis-cockpit
inputs:
  - lib/build-character-index.mjs
  - lib/serialise-pack.mjs
  - public/cockpit.html
---

# Story 4.7: Surface a character's linked NPCs in pack, brief, and prompt

Status: done (QA APPROVED 2026-06-24)

> Scoped down from "NPC + sire capture (FR19/FR21)" after checking the data:
> - **Sire (FR21):** already grounded — sire is a dossier fact for 25/36 characters and is
>   already in the pack, brief, and assembled prompt. No structured `sire` field exists on
>   character docs, so there is nothing extra to project. FR21 considered covered.
> - **Linked NPCs (FR19, surfacing side):** the sandbox holds 48 NPCs; 3 characters (Yusuf,
>   Alice, Anichka) have NPCs linked to them, but those linked NPCs are surfaced NOWHERE —
>   the index collects them only to feed collision detection. THIS is the buildable gap.
> - **Data side (NOT built here):** importing more NPCs into the sandbox and enriching the
>   thin dossiers (Benedict, Livia have no facts) is live-data work — Peter's domain.

## Story

As the ST,
I want a character's own linked NPCs (and which are correspondents) surfaced in their
grounding,
so that when a submission references one of their known NPCs the cockpit grounds it instead
of leaving it unsupported.

## Acceptance Criteria

1. A character's **linked NPCs** (name + correspondent flag) are surfaced in all three
   grounding surfaces: the pack markdown (`serialise-pack`), the Character Brief panel, and
   the assembled drafting prompt.
2. The three surfaces show the **same** linked-NPC grounding (consistency — single
   composition path principle).
3. A character with **no linked NPCs** renders cleanly — no empty "NPCs:" line, header, or
   section anywhere.
4. Correspondents are marked (e.g. "Name (correspondent)").
5. Existing identity/facts/collisions output is unchanged; read-only; British English.

## Dev Notes

- The index entry already carries `npcs: [{ name, isCorrespondent }]`
  (`build-character-index.mjs`) — no index change needed.
- `lib/serialise-pack.mjs` `renderCharacterIndex`: after the facts line, add a `npcs:` line
  when `c.npcs?.length`.
- `public/cockpit.html`: brief (`renderBrief`) gains a "Known NPCs" section; the assembler
  (`briefText`) gains an NPCs block — both only when the character has linked NPCs.
- Pack output will change (NPC lines added for the 3 linked characters) — this is intended,
  not a regression; existing lines otherwise unchanged.

## Tasks / Subtasks

- [x] serialise-pack: add per-character linked-NPC line (guarded for none); regenerate.
- [x] cockpit.html brief: add Known NPCs section (guarded).
- [x] cockpit.html assembler: add NPCs block to the grounded prompt (guarded).
- [x] Verify the 3 linked-NPC characters show NPCs in all three surfaces; others unchanged.

## Dev Agent Record

### Implementation
- `lib/serialise-pack.mjs`: after the facts line, emit `  npcs: Name (correspondent); …`
  when `c.npcs?.length` (guarded — no line otherwise).
- `public/cockpit.html` `renderBrief`: "Known NPCs (n)" section, guarded; correspondents
  flagged.
- `public/cockpit.html` `briefText` (assembler): "Known NPCs:" block in the grounded
  prompt, guarded; correspondents flagged. So all three surfaces carry the same data.

### Testing / validation
- Regenerated pack (exit 0): exactly 3 `npcs:` lines, matching the 3 linked-NPC characters
  the API reports — Alice Vunder (Holly; Mum and Dad), Anichka (Kateryna; Kateryna), Yusuf
  Kalusicj (Solomon Clay; Miriam Kral (LaRoux)). Characters without linked NPCs emit no
  line/section (guarded).
- Client JS parses (`new Function`); brief + assembler carry "Known NPCs".
- Regression: `grep -ci "haven="` → 0 (Story 2.7 intact); existing identity/facts/collision
  output unchanged apart from the added npcs line.
- Sire (FR21): confirmed already grounded via dossier facts; no structured sire field on
  character docs, so nothing further to project.

### Data notes for Peter (not cockpit bugs)
- Anichka's linked NPC "Kateryna" appears duplicated; Yusuf's links look mismatched. These
  are sandbox/live-data link quirks, surfaced now that NPCs are visible.

### File List
- `lib/serialise-pack.mjs` (modified), `public/cockpit.html` (modified)
- `out/drafting-pack.md` (regenerated — gitignored)

## QA Review

**Verdict: APPROVE (independent, 2026-06-24).** All five ACs pass: linked NPCs surfaced in
pack + brief + assembler from `c.npcs`; pack and API agree exactly on the 3 linked-NPC
characters and their NPC names (Alice/Anichka/Yusuf); all three code paths guarded by
`if(npcs.length)` (pack has exactly 3 npcs lines = 3 characters, no spurious lines);
correspondent-flag logic present (not exercised — current data has no correspondents);
no regression (haven= 0; identity/facts/collision rendering otherwise unchanged; only
serialise-pack.mjs + cockpit.html changed; JS parses). Status: review → done.

## References
- Live-run findings: `scratchpad/dt4full/FINDINGS.md` (NPCs / thin dossiers).
- `lib/build-character-index.mjs` (already collects linked npcs).
