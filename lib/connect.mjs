// lib/connect.mjs — the SINGLE database access point for the cockpit.
//
// Connects only to local databases: read access to the tm_suite_dev sandbox
// (SANDBOX_URI) and read/write to the local tm_chronicle reference DB (CHRONICLE_URI).
// A locality guard (assertLocalUri) rejects any non-loopback host BEFORE connecting —
// this is the structural enforcement of connection isolation: even if a production URI
// were pasted into .env, the tool refuses to run. The cockpit holds no production
// write credentials and cannot reach live data.
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { pathToFileURL } from 'node:url';

// The only hosts the cockpit may ever talk to.
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

// Hide any credentials before putting a URI in an error/log message.
function redact(uri) {
  return String(uri).replace(/\/\/[^@/]+@/, '//***@');
}

// Extract the database name from a mongodb:// URI path (e.g. .../tm_suite_dev -> tm_suite_dev).
function dbNameOf(uri) {
  const m = /^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i.exec(uri);
  return m ? decodeURIComponent(m[1]) : '(URI default)';
}

// Every host in a mongodb:// URI, lower-cased. Handles a comma-separated replica-set
// host list and an optional "user:pass@" prefix. Throws on the mongodb+srv scheme,
// which is a DNS seed-list (Atlas) and therefore always remote.
function hostsOf(uri) {
  if (typeof uri !== 'string' || !uri.trim()) {
    throw new Error('Missing or empty MongoDB URI.');
  }
  if (/^mongodb\+srv:\/\//i.test(uri)) {
    throw new Error(`Refusing mongodb+srv:// (Atlas/remote) URI: ${redact(uri)}`);
  }
  const m = /^mongodb:\/\/([^/?]+)/i.exec(uri);
  if (!m) throw new Error(`Unrecognised MongoDB URI: ${redact(uri)}`);
  const authority = m[1].includes('@') ? m[1].slice(m[1].lastIndexOf('@') + 1) : m[1];
  return authority.split(',').map((hp) => {
    let host = hp.trim();
    if (host.startsWith('[')) {            // [::1]:27017 — IPv6 literal in brackets
      host = host.slice(1, host.indexOf(']'));
    } else if (host.includes(':')) {
      host = host.slice(0, host.lastIndexOf(':'));  // strip :port
    }
    return host.toLowerCase();
  });
}

// Throws unless EVERY host in the URI is loopback-local. The cockpit's safety line.
// Returns the parsed hosts on success.
export function assertLocalUri(uri, label = 'URI') {
  const hosts = hostsOf(uri);
  for (const h of hosts) {
    if (!LOOPBACK_HOSTS.has(h)) {
      throw new Error(
        `${label} points at a non-local host "${h}" — refused. ` +
        `The cockpit may only reach local databases (127.0.0.1 / localhost / ::1).`,
      );
    }
  }
  return hosts;
}

function requireUri(name) {
  const uri = process.env[name];
  if (!uri || !uri.trim()) {
    throw new Error(`${name} is not set. Copy .env.example to .env and set local URIs.`);
  }
  return uri;
}

// An aggregate pipeline can WRITE via a $out or $merge stage. The sandbox is read-only,
// so reject those — otherwise the "read-only" surface would have a write hole.
export function assertNoWriteStages(pipeline) {
  if (Array.isArray(pipeline)
      && pipeline.some((s) => s && (s.$out !== undefined || s.$merge !== undefined))) {
    throw new Error('Sandbox is read-only: $out / $merge stages are not permitted.');
  }
}

// Expose ONLY read operations for the sandbox — the tool must never write to tm_suite_dev.
function readOnlyCollection(coll) {
  return {
    find: (...a) => coll.find(...a),
    findOne: (...a) => coll.findOne(...a),
    aggregate: (pipeline, ...rest) => {
      assertNoWriteStages(pipeline);
      return coll.aggregate(pipeline, ...rest);
    },
    distinct: (...a) => coll.distinct(...a),
    countDocuments: (...a) => coll.countDocuments(...a),
    estimatedDocumentCount: (...a) => coll.estimatedDocumentCount(...a),
  };
}

// Connect both clients after asserting locality. Returns helpers + a close().
//   sandboxCollection(name)   -> READ-ONLY collection on tm_suite_dev
//   chronicleCollection(name) -> read/write collection on tm_chronicle
//   chronicleDb               -> read/write Db handle on tm_chronicle (for seed/list ops)
//   ping()                    -> pings both databases
//   close()                   -> closes both clients
export async function connect() {
  const sandboxUri = requireUri('SANDBOX_URI');
  const chronicleUri = requireUri('CHRONICLE_URI');
  assertLocalUri(sandboxUri, 'SANDBOX_URI');
  assertLocalUri(chronicleUri, 'CHRONICLE_URI');

  const sandboxClient = new MongoClient(sandboxUri);
  const chronicleClient = new MongoClient(chronicleUri);
  try {
    await sandboxClient.connect();
    await chronicleClient.connect();
  } catch (err) {
    // A partial failure must not leak the client that did open.
    await sandboxClient.close().catch(() => {});
    await chronicleClient.close().catch(() => {});
    throw err;
  }

  const sandboxDb = sandboxClient.db();      // DB from the URI path (tm_suite_dev)
  const chronicleDb = chronicleClient.db();  // DB from the URI path (tm_chronicle)

  return {
    sandboxCollection: (name) => readOnlyCollection(sandboxDb.collection(name)),
    chronicleCollection: (name) => chronicleDb.collection(name),
    chronicleDb,
    async ping() {
      await sandboxDb.command({ ping: 1 });
      await chronicleDb.command({ ping: 1 });
    },
    async close() {
      await sandboxClient.close();
      await chronicleClient.close();
    },
  };
}

// Print a best-effort host/DB line for one URI (flags an unparseable/remote URI rather
// than throwing, so the report is shown for every configured URI before the hard guard).
function reportUri(label, uri, mode) {
  let hostStr;
  try {
    hostStr = hostsOf(uri).join(', ');
  } catch {
    hostStr = `(remote / unparseable) ${redact(uri)}`;
  }
  console.log(`  ${label}  host(s): ${hostStr}   db: ${dbNameOf(uri)}   (${mode})`);
}

// Report the configured hosts/DBs, run the locality guard, and ping both databases.
// Report runs first so a rejected URI is still shown; the guard then refuses before any
// connection; the ping needs a running local Mongo.
export async function verify() {
  const sandboxUri = requireUri('SANDBOX_URI');
  const chronicleUri = requireUri('CHRONICLE_URI');

  console.log('Cockpit connection check');
  reportUri('SANDBOX_URI  ', sandboxUri, 'read-only');
  reportUri('CHRONICLE_URI', chronicleUri, 'read/write');

  assertLocalUri(sandboxUri, 'SANDBOX_URI');
  assertLocalUri(chronicleUri, 'CHRONICLE_URI');
  console.log('  Locality guard: PASS — all hosts are local.');

  const conn = await connect();
  try {
    await conn.ping();
    console.log('  Connection ping: PASS — both databases reachable.');
  } finally {
    await conn.close();
  }
}

// Direct run (`node lib/connect.mjs`) executes verify; importing the module does not.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  verify()
    .then(() => {
      console.log('Verify: OK');
      process.exit(0);
    })
    .catch((err) => {
      console.error(`Verify FAILED: ${err.message}`);
      process.exit(1);
    });
}
