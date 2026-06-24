# Terra Mortis — ST Cockpit (Phase 1)

A localhost, read-only grounding-pack generator for running Terra Mortis downtimes with AI assistance that is grounded in recorded data. It projects a "drafting pack" (Character Index + glossary + channel rules + codified rules) from a **local sandbox** database. It holds no production write credentials and never writes to production — connection isolation is the safety mechanism.

This is a standalone Node ESM tool in its **own git repository** (`TerraMortis-cockpit`), developed as a subfolder alongside the Terra Mortis Suite but kept as a separate repo — it is **not** part of the suite codebase or its deploys. It reads the suite's data (a local sandbox database), never its files.

**Setup:** copy `.env.example` to `.env` (local URIs only), then run `npm install` in this directory.

See `specs/cockpit/` for the full plan — PRD, architecture, epics/stories, and the UI mockup.
