// Local server for CosmoVerse: serves the app and the AI chat on http://localhost:8000
// Run with:  npm start   (or: node server.mjs)
// Needs Node.js 18 or newer and a .env file containing ANTHROPIC_API_KEY=...
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chat, rateLimited } from './api/chat.js';
import { tts, ttsRateLimited } from './api/tts.js';
import { voice, voiceRateLimited } from './api/voice.js';
import { stt, STT_MAX_BYTES } from './api/stt.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8000;

// Load .env without any extra packages
try {
  for (const line of fs.readFileSync(path.join(dir, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* no .env file: the chat will report that it is not configured */ }

// Who is asking (for the per-visitor rate limits, best effort). Behind a hosting proxy every socket address is the
// proxy's. TRUST_PROXY=N (render.yaml: 1) = N proxies each append the address they saw to X-Forwarded-For, so the
// visitor is the N-th entry from the right; entries further left are written by the visitor and can be faked.
// The first requests' headers are logged so the hop count can be checked in the host's logs.
// 代理后面：从 X-Forwarded-For 右边数第 N 个地址（左边的可以伪造）
const HOPS = /^(true|yes)$/i.test(process.env.TRUST_PROXY || '') ? 1 : Math.max(0, parseInt(process.env.TRUST_PROXY, 10) || 0);
let xffLogged = 0;
function clientIp(req) {
  if (!HOPS) return req.socket.remoteAddress || 'local';
  const raw = String(req.headers['x-forwarded-for'] || '');
  if (xffLogged < 5 && raw) { xffLogged++; console.log(`X-Forwarded-For seen: "${raw}" (socket ${req.socket.remoteAddress}); TRUST_PROXY=${HOPS}`); }
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  return list[list.length - HOPS] || req.socket.remoteAddress || 'local';
}

// Spending cap for the whole server, whoever asks (per-visitor limits can be dodged with many addresses) · 全站上限
const GLOBAL_PER_MIN = { chat: 60, tts: 60, voice: 60 };
const globalHits = { chat: [], tts: [], voice: [] };
function globalLimited(kind) {
  const now = Date.now(), list = globalHits[kind].filter(t => now - t < 60_000);
  list.push(now); globalHits[kind] = list;
  return list.length > GLOBAL_PER_MIN[kind];
}

// Narration and sound clips are fixed texts, so keep each generated clip in memory: Vercel caches them on its CDN,
// a plain Node host has no CDN, and without this every visitor would spend ElevenLabs credits on the same clip.
// 语音片段缓存在内存里（有上限），每个片段只生成一次
const VOICE_CACHE_MAX = 64 * 1024 * 1024;
const voiceCache = new Map();                       // key → { audio, headers }
const voicePending = new Map();                     // key → Promise (same clip asked twice at once)
let voiceCacheBytes = 0;
const voiceKey = q => q.kind === 'narrate' ? `n|${q.id}|${q.lang}` : q.kind === 'sfx' ? `s|${q.name}` : null;
function remember(key, r) {
  if (!key || !r.audio || voiceCache.has(key) || r.audio.length > VOICE_CACHE_MAX / 4) return;
  while (voiceCacheBytes + r.audio.length > VOICE_CACHE_MAX && voiceCache.size) {
    const [oldest, old] = voiceCache.entries().next().value;
    voiceCache.delete(oldest); voiceCacheBytes -= old.audio.length;
  }
  voiceCache.set(key, r); voiceCacheBytes += r.audio.length;
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.mp3': 'audio/mpeg'
};

const server = http.createServer(async (req, res) => {
  try { await route(req, res); }
  catch (e) {                                       // e.g. ElevenLabs/Anthropic unreachable: answer, don't crash · 不要崩溃
    console.error('request failed:', req.url, e?.message || e);
    if (!res.headersSent) send(res, 502, { error: 'upstream' }); else res.end();
  }
});

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/chat') {
    if (req.method !== 'POST') { res.writeHead(405).end(); return; }
    if (rateLimited(clientIp(req)) || globalLimited('chat')) { send(res, 429, { error: 'rate' }); return; }
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 48_000) { send(res, 413, { error: 'bad' }); return; } }
    let body = {};
    try { body = JSON.parse(raw); } catch {}
    const r = await chat(body);
    send(res, r.status, r.json);
    return;
  }

  if (url.pathname === '/api/voice') {
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    const q = Object.fromEntries(url.searchParams);
    const key = q.check ? null : voiceKey(q);
    let r = key && voiceCache.get(key);
    if (r) { voiceCache.delete(key); voiceCache.set(key, r); }              // cache hit: free, no rate limit · 命中缓存
    else {
      if (!q.check && (voiceRateLimited(clientIp(req)) || globalLimited('voice'))) { send(res, 429, { error: 'rate' }); return; }
      if (key && !voicePending.has(key)) voicePending.set(key, voice(q).finally(() => voicePending.delete(key)));
      r = key ? await voicePending.get(key) : await voice(q);
      remember(key, r);
    }
    if (r.audio) res.writeHead(200, { 'content-type': 'audio/mpeg', ...(r.headers || {}) }).end(r.audio);
    else send(res, r.status, r.json);
    return;
  }

  if (url.pathname === '/api/stt') {   // 🎙 voice commands where the browser can't listen (Quest Browser) · 浏览器无法听写时
    if (req.method !== 'POST') { res.writeHead(405).end(); return; }
    if (rateLimited(clientIp(req)) || globalLimited('chat')) { send(res, 429, { error: 'rate' }); return; }
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > STT_MAX_BYTES) { send(res, 413, { error: 'bad' }); return; } chunks.push(chunk); }
    const r = await stt({ audio: Buffer.concat(chunks), type: req.headers['content-type'] || '', lang: url.searchParams.get('lang') || '' });
    send(res, r.status, r.json);
    return;
  }

  if (url.pathname === '/api/tts') {
    if (req.method !== 'POST') { res.writeHead(405).end(); return; }
    if (ttsRateLimited(clientIp(req)) || globalLimited('tts')) { send(res, 429, { error: 'rate' }); return; }
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 20_000) { send(res, 413, { error: 'bad' }); return; } }
    let body = {};
    try { body = JSON.parse(raw); } catch {}
    const r = await tts(body);
    if (r.audio) res.writeHead(200, { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' }).end(r.audio);
    else send(res, r.status, r.json);
    return;
  }

  // Static files. Hidden files (like .env), server code, internal notes, tests/, tools/ and anything
  // outside this folder are never served.
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(dir, rel));
  if (!file.startsWith(dir + path.sep) || rel.split('/').some(p => p.startsWith('.')) || file.includes(path.sep + 'api' + path.sep) || ['tests', 'tools'].includes(path.relative(dir, file).split(path.sep)[0]) || file.endsWith('server.mjs')) {
    res.writeHead(404).end('Not found'); return;
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
}

function send(res, status, json) {
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(json));
}

server.listen(PORT, () => {
  console.log(`CosmoVerse is running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) console.log('⚠  No ANTHROPIC_API_KEY found. Create a .env file (see .env.example) to turn on the AI chat.');
});
