# Seeding the local sandbox from production

One-time setup. Copies production data **read-only** into a local `tm_suite_dev` database so the cockpit has realistic data to read. Production is **never written to**.

## Safety boundary (read this first)

- This is the **only** step that touches production, and it is **read-only** (export / `find` only).
- The restore target is the **local** sandbox only (`mongodb://127.0.0.1:27017/tm_suite_dev`).
- It sits **outside** the cockpit's local-only boundary: `lib/connect.mjs` refuses any non-local host, so it cannot be used here. The seed uses your production **read** credentials directly, once. After seeding, normal cockpit operation holds no production credentials.
- Dump output (`_seed/`) may carry player PII — it is gitignored; delete it when done.

## Prerequisites

- A local MongoDB running (the same instance `lib/connect.mjs` pings).
- Your production **read** connection string. If your ISP blocks SRV DNS (a known issue here), use the **non-SRV** form (see Fallback A).
- `mongodump` / `mongorestore` (MongoDB Database Tools) for the primary path, or Node for the script fallback.

## Primary path — mongodump / mongorestore

Read the collections you need from prod, then restore them into the local sandbox under the `tm_suite_dev` name:

```sh
mongodump  --uri="<PROD_READ_URI>" --db=tm_suite \
  --collection=characters --collection=npcs --collection=character_dossier \
  --out=./_seed

mongorestore --uri="mongodb://127.0.0.1:27017" \
  --nsFrom="tm_suite.*" --nsTo="tm_suite_dev.*" ./_seed
```

(You can dump the whole `tm_suite` DB instead of named collections; the cockpit only needs `characters`, `npcs`, `character_dossier` for the Character Index, but more is fine.)

## Fallback A — non-SRV connection string (ISP blocks SRV)

If `mongodump mongodb+srv://…` fails to resolve, use the explicit seed-list URI instead of the `+srv` form:

```
mongodb://host1:27017,host2:27017,host3:27017/tm_suite?ssl=true&replicaSet=<rs>&authSource=admin
```

Get it from Atlas → **Connect** → *Connect your application* → driver **3.4 or earlier**, which shows the non-SRV string. Use it as `<PROD_READ_URI>` in the primary path.

## Fallback B — node-driver export (`scripts/seed-sandbox.mjs`)

No `mongodump` needed; pure Node, and no SRV dependency if you pass the non-SRV string. The ST runs it (never automatically):

```sh
SEED_SOURCE_URI="<PROD_READ_URI>" node scripts/seed-sandbox.mjs --confirm
```

Options:

- `--collections characters,npcs,character_dossier` — collections to copy (default shown).
- `--db tm_suite` — source database (default `tm_suite`).
- `SEED_TARGET_URI` — local target (default `mongodb://127.0.0.1:27017/tm_suite_dev`).

The script reads prod **read-only**, refuses unless `--confirm` is given, refuses to write to a non-local target, and refreshes each collection in the local sandbox.

## Fallback C — MongoDB MCP export

Export the needed collections via the MongoDB MCP tooling, then import them into local `tm_suite_dev` (e.g. via `mongoimport`, or the same node insert approach as Fallback B).

## Verify

Start local MongoDB, ensure `.env` has the local `SANDBOX_URI`, then:

```sh
node lib/connect.mjs
```

The locality guard passes and the **ping PASSES** — this closes Story 1.2 AC4.

## Re-seeding

The sandbox is disposable. To refresh, drop `tm_suite_dev` (or let Fallback B's per-collection refresh handle it) and run the seed again. Delete `_seed/` afterwards.
