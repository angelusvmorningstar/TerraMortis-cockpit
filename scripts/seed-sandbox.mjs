// scripts/seed-sandbox.mjs — ONE-TIME setup, run by the ST (never automatically).
//
// Reads production READ-ONLY and writes a copy into the LOCAL tm_suite_dev sandbox.
// This is the single, deliberate touch of production; it sits OUTSIDE the cockpit's
// local-only boundary (lib/connect.mjs), so it deliberately does NOT import connect.mjs.
// It never writes to production and never restores back.
//
// Env:
//   SEED_SOURCE_URI  production READ connection string. If your ISP blocks SRV DNS, use the
//                    NON-SRV seed-list form (see scripts/seed-sandbox.md). READ-ONLY here.
//   SEED_TARGET_URI  local sandbox (default mongodb://127.0.0.1:27017/tm_suite_dev).
//
// Usage:
//   SEED_SOURCE_URI="mongodb://h1,h2,h3/tm_suite?ssl=true&replicaSet=rs&authSource=admin" \
//     node scripts/seed-sandbox.mjs --confirm
//   Options: --collections characters,npcs,character_dossier   --db tm_suite
import { MongoClient } from 'mongodb';

const DEFAULT_TARGET = 'mongodb://127.0.0.1:27017/tm_suite_dev';
const DEFAULT_COLLECTIONS = ['characters', 'npcs', 'character_dossier'];
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1']);

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

// EVERY host of a mongodb URI, lower-cased (strips userinfo, port, IPv6 brackets;
// handles comma-separated replica-set host lists). Mirrors connect.mjs's guard so a
// remote member can't slip past via a multi-host target.
function hostsOf(uri) {
  const m = /^mongodb(?:\+srv)?:\/\/([^/?]+)/i.exec(uri || '');
  if (!m) return [];
  const authority = m[1].includes('@') ? m[1].slice(m[1].lastIndexOf('@') + 1) : m[1];
  return authority.split(',').map((hp) => {
    let host = hp.trim();
    if (host.startsWith('[')) host = host.slice(1, host.indexOf(']'));
    else if (host.includes(':')) host = host.slice(0, host.lastIndexOf(':'));
    return host.toLowerCase();
  });
}

async function main() {
  const sourceUri = process.env.SEED_SOURCE_URI;
  const targetUri = process.env.SEED_TARGET_URI || DEFAULT_TARGET;
  const sourceDbName = argValue('--db', 'tm_suite');
  const requested = (argValue('--collections', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const collections = requested.length ? requested : DEFAULT_COLLECTIONS;
  const confirmed = process.argv.includes('--confirm');

  if (!sourceUri) {
    throw new Error('SEED_SOURCE_URI is not set (your production READ connection string).');
  }
  if (!confirmed) {
    throw new Error(
      'Refusing to run without --confirm. This reads production (read-only) and writes the ' +
      'local sandbox. Re-run with --confirm once you are sure.',
    );
  }
  // Safety: EVERY target host must be local — never write a copy to a remote host
  // (including a remote member of a multi-host replica-set target).
  const targetHosts = hostsOf(targetUri);
  const remoteHost = targetHosts.find((h) => !LOOPBACK.has(h));
  if (!targetHosts.length || remoteHost) {
    throw new Error(`SEED_TARGET_URI host "${remoteHost || '(unparseable)'}" is not local — refused. The sandbox target must be loopback (all hosts).`);
  }
  if (sourceUri === targetUri) {
    throw new Error('Source and target URIs are identical — refused.');
  }

  console.log('Seeding local sandbox from production (READ-ONLY source).');
  console.log(`  source db:   ${sourceDbName}  (read-only)`);
  console.log(`  target:      ${targetUri}`);
  console.log(`  collections: ${collections.join(', ')}`);

  const source = new MongoClient(sourceUri);
  const target = new MongoClient(targetUri);
  try {
    await source.connect();
    await target.connect();
    const sdb = source.db(sourceDbName);
    const tdb = target.db(); // tm_suite_dev from the target URI path

    for (const name of collections) {
      const docs = await sdb.collection(name).find({}).toArray(); // READ-ONLY on production
      await tdb.collection(name).deleteMany({});                  // refresh the local copy
      if (docs.length) await tdb.collection(name).insertMany(docs);
      console.log(`  ${name}: copied ${docs.length} document(s)`);
    }
    console.log('Done. Now run `node lib/connect.mjs` — the ping should PASS.');
  } finally {
    await source.close().catch(() => {});
    await target.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error(`Seed FAILED: ${err.message}`);
  process.exit(1);
});
