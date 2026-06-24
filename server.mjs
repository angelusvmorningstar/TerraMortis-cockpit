// server.mjs — minimal localhost cockpit (Epic 4, Story 4.1). Node built-in http only.
// Serves the read-only browser UI and one data endpoint over the shared composition path
// (lib/build-pack-data.mjs). Read-only: no write routes; binds to loopback only.
//
//   npm start            → http://127.0.0.1:4317
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildPackData } from './lib/build-pack-data.mjs';

const HOST = '127.0.0.1';
const PORT = Number(process.env.COCKPIT_PORT) || 8731;
const ROOT = dirname(fileURLToPath(import.meta.url));
const UI_PATH = join(ROOT, 'public', 'cockpit.html');

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    // Read-only: only GET is served. Anything else is refused (no write surface).
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'method not allowed (cockpit is read-only)' });
      return;
    }
    const url = new URL(req.url, `http://${HOST}:${PORT}`);

    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = await readFile(UI_PATH, 'utf8');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (url.pathname === '/api/pack-data') {
      const label = url.searchParams.get('label') || 'DT5';
      const data = await buildPackData(label);
      sendJson(res, 200, data);
      return;
    }

    sendJson(res, 404, { error: 'not found' });
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Set a free one: COCKPIT_PORT=<port> npm start`);
  } else {
    console.error(`Server error: ${err.message}`);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`ST Cockpit (read-only) → http://${HOST}:${PORT}`);
  console.log('Reads tm_suite_dev + tm_chronicle via connect.mjs. Ctrl+C to stop.');
});
