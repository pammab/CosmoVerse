// server.mjs as deployed on Render: static files, voice clip cache, per-visitor rate limits behind a proxy.
// Runs server.mjs in a child process against a fake ElevenLabs (ELEVENLABS_API_BASE), so no key or network is used.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let fake, app, base, calls = 0, failNext = 0;
const listen = srv => new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv.address().port)));

before(async () => {
  fake = http.createServer((req, res) => {                          // fake ElevenLabs: counts generated clips
    req.resume();
    req.on('end', () => {
      calls++;
      if (req.url.startsWith('/v1/user/subscription')) return res.writeHead(200, { 'content-type': 'application/json' }).end('{"tier":"fake"}');
      if (failNext > 0) { failNext--; return res.writeHead(500).end('boom'); }
      setTimeout(() => res.writeHead(200, { 'content-type': 'audio/mpeg' }).end(Buffer.alloc(1000, 7)), 50);
    });
  });
  const fakePort = await listen(fake);
  const probe = http.createServer();                                // pick a free port for the app
  const port = await listen(probe); await new Promise(ok => probe.close(ok));
  app = spawn(process.execPath, ['server.mjs'], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port), TRUST_PROXY: '1', ELEVENLABS_API_KEY: 'test',
      ELEVENLABS_API_BASE: `http://127.0.0.1:${fakePort}`, ANTHROPIC_API_KEY: '' },
  });
  app.on('error', () => fake.close());
  await new Promise((ok, fail) => {
    app.stdout.on('data', d => String(d).includes('running') && ok());
    app.on('exit', code => fail(new Error('server exited ' + code)));
  });
  base = `http://127.0.0.1:${port}`;
});
after(() => { app?.kill(); fake?.close(); });

test('serves the app, hides secrets and server code', async () => {
  const page = await fetch(base + '/');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<html/i);
  for (const p of ['/.env', '/.env.example', '/server.mjs', '/api/chat.js', '/%2e%2e/%2e%2e/etc/passwd', '/tests/server.test.mjs', '/tools/make-voice.mjs']) assert.equal((await fetch(base + p)).status, 404, p);
});

test('each narration clip is generated once, then served from memory (also when asked twice at once)', async () => {
  const url = base + '/api/voice?kind=narrate&id=mars&lang=en';
  const first = await Promise.all([fetch(url), fetch(url)]);
  for (const r of first) { assert.equal(r.status, 200); assert.equal((await r.arrayBuffer()).byteLength, 1000); }
  assert.equal(calls, 1);
  for (let i = 0; i < 3; i++) assert.equal((await fetch(url)).status, 200);
  assert.equal(calls, 1);
  assert.equal((await fetch(base + '/api/voice?kind=narrate&id=nope&lang=en')).status, 400);   // unknown text: never generated
  assert.equal(calls, 1);
});

test('upstream errors and key checks are never cached; a bad URL does not crash the server', async () => {
  const url = base + '/api/voice?kind=narrate&id=venus&lang=pt';
  failNext = 1; const before = calls;
  assert.notEqual((await fetch(url)).status, 200);
  assert.equal((await fetch(url)).status, 200);
  assert.equal((await fetch(url)).status, 200);
  assert.equal(calls - before, 2, 'failed once, generated once, then cached');
  const c = calls; await fetch(base + '/api/voice?check=1'); await fetch(base + '/api/voice?check=1');
  assert.equal(calls - c, 2);
  assert.ok((await fetch(base + '/%E0%A4%A')).status >= 400);
  assert.equal((await fetch(base + '/')).status, 200, 'still running');
});

test('rate limits use the address the proxy appended (TRUST_PROXY=1), so faked entries on the left do not help', async () => {
  const ask = (fake, ip) => fetch(base + '/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': `${fake}, ${ip}` }, body: '{}' });
  const a = []; for (let i = 0; i < 11; i++) a.push((await ask('10.9.9.' + i, '203.0.113.5')).status);
  assert.equal(a.at(-1), 429, 'the 11th question in a minute from one visitor is refused, whatever it writes in the header');
  assert.notEqual((await ask('10.9.9.1', '198.51.100.9')).status, 429, 'another visitor behind the same proxy still gets through');
});
