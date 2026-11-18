// Ask Cosmo AI endpoint (Vercel) + shared chat logic, also used by server.mjs locally.
// The Anthropic API key is read from the environment on the server. It never reaches the browser.

const LANGS = { en: 'English', zh: 'Chinese (Simplified)', es: 'Spanish', pt: 'Brazilian Portuguese' };
const BODIES = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'solar'];
const NAMES = {
  sun: 'the Sun', mercury: 'Mercury', venus: 'Venus', earth: 'Earth', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', solar: 'the Solar System'
};

const MAX_TURNS = 8;          // only the last 8 messages are sent to the AI
const MAX_CHARS = 500;        // longest question accepted
const MAX_FACTS = 2000;       // longest "facts on screen" text accepted
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;          // questions per minute per visitor (best effort)

const hits = new Map();
export function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
}

import { trimPack } from '../cosmofacts.js';
import { LEVELS } from '../journey.js';
import { PIECES } from '../pieces/index.js';
// A journey place id from the browser ('L:galaxy', 'P:pleiades') → the line the AI reads; unknown ids are ignored · 旅程地点 id → 提示中的一行
export function placeLine(id) {
  const s = String(id ?? ''), lv = s.startsWith('L:') && s !== 'L:solar-system' ? LEVELS.find(l => l.id === s.slice(2)) : null;
  if (lv) return `the ${lv.names.en} level of the scale journey`;
  const p = s.startsWith('P:') ? PIECES.find(x => x.id === s.slice(2)) : null, plv = p && LEVELS.find(l => l.id === p.level);
  return p ? `${p.names.en}, a place on the ${plv ? plv.names.en + ' level of the ' : ''}scale journey` : '';
}
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000b-\u001f]/g, ' ').trim().slice(0, max);

// Grounded mode (cosmo-sources): the AI may use ONLY the numbered sourced facts, and answers as JSON { answer, sources } · 有来源模式
export function groundedPrompt(planet, language, pack, voice, place = '') {
  return [
    'You are Cosmo, the friendly space guide inside CosmoVerse, an interactive 3D atlas from the Solar System out to the observable universe.',
    'In this app the Sun and planets are shown at their true relative sizes, while distances between them are compressed.',
    `The visitor is currently looking at: ${place || NAMES[planet]}.`,
    place ? 'Questions with "it", "here" or "this" are about that place; its facts come first below.' : '',
    'SOURCED FACTS. Each line is one fact entry: [id] (source) text. These come from NASA, JPL, ESA, ESO and other official pages.',
    ...pack.map(x => `[${x.id}] (${x.name}) ${x.text}`),
    'RULES:',
    '- Answer ONLY with information found in the sourced facts above. Do not add numbers, names, dates or claims that are not in them, even if you know them.',
    '- If the facts do not contain the answer, say briefly that you do not have a sourced answer for that yet, and if one fact is close, offer it instead.',
    '- Simple explanations that only restate or connect the facts are fine (for example comparing two numbers from the facts).',
    '- You may say "according to NASA" (or the source name) when it fits naturally. Never include URLs or ids in the answer text.',
    language ? `- Always write the answer in ${language}.` : '- Write the answer in the same language the visitor used in their latest message.',
    voice ? '- The answer will be read aloud: natural spoken sentences, spell out symbols and units, no emojis.' : '',
    '- Keep the answer to 2-4 short sentences in plain text (no markdown, no lists), friendly for a general audience.',
    '- If the question is unrelated to space, politely steer back to space in one sentence (sources: []).',
    'OUTPUT: reply with ONLY a JSON object, nothing before or after it: {"answer": "<your answer>", "sources": ["<id of each fact you used>"]}',
  ].filter(Boolean).join('\n');
}
// Parse the model's JSON; keep only ids that exist in the pack (unknown ids are dropped) · 只保留资料包中存在的 id
export function parseGrounded(text, pack) {
  const ids = new Set(pack.map(x => x.id)), raw = String(text || '').trim();
  let answer = null, list = [];
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (typeof j.answer === 'string') answer = j.answer; if (Array.isArray(j.sources)) list = j.sources; } catch {} }
  if (answer === null && /"answer"\s*:/.test(raw)) {   // broken JSON (an unescaped quote…): take what is between "answer": " and ", "sources" · JSON 损坏时容错
    const a = raw.match(/"answer"\s*:\s*"([\s\S]*?)"\s*(?:,\s*"sources"|\}\s*$)/) || raw.match(/"answer"\s*:\s*"([\s\S]*)$/);
    answer = a ? a[1].replace(/"\s*\}?\s*$/, '').replace(/\\n/g, ' ').replace(/\\"/g, '"').replace(/\\\\/g, '\\') : '';
    const sm = raw.match(/"sources"\s*:\s*\[([^\]]*)\]/); list = sm ? [...sm[1].matchAll(/"([^"]{1,48})"/g)].map(x => x[1]) : [];
  }
  if (answer === null) answer = raw.startsWith('{') ? '' : raw;   // plain text: show it, no links · 纯文本：显示，无链接
  return { answer: answer.trim(), sources: [...new Set(list.filter(id => typeof id === 'string' && ids.has(id)))].slice(0, 6) };
}

function systemPrompt(planet, language, facts, voice, place = '') {
  return [
    'You are Cosmo, the friendly space guide inside CosmoVerse, an interactive 3D model of the Solar System, built by students for a hackathon.',
    'In this app the Sun and planets are shown at their true relative sizes, while distances between them are compressed.',
    `The visitor is currently looking at: ${place || NAMES[planet]}.`,
    facts ? `These facts are shown on screen; keep your numbers consistent with them:\n${facts}` : '',
    place ? 'Answer questions about this place, space and astronomy.' : 'Answer questions about this body, the rest of the Solar System, space and astronomy.',
    'If a question is unrelated to space, politely steer back to space in one sentence.',
    language ? `Always reply in ${language}.` : 'Reply in the same language the visitor used in their latest message.',
    voice ? 'The visitor is talking to you by voice and will hear your answer read aloud: write natural spoken sentences, spell out symbols and units (say "degrees Celsius", not "°C"), and avoid emojis.' : '',
    'Keep answers to 2-4 short sentences in plain text (no markdown, no lists), friendly for a general audience.',
    'If you are not sure about a fact, say so instead of guessing.'
  ].filter(Boolean).join('\n');
}

// Returns { status, json } so each server can send it however it likes.
export async function chat(body) {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.CLAUDE_MODEL || 'claude-haiku-5-5';
  if (!key) return { status: 500, json: { error: 'config' } };

  const planet = BODIES.includes(body?.planet) ? body.planet : 'solar';
  const language = LANGS[String(body?.lang || '').slice(0, 2).toLowerCase()] || null; // null = same language as the visitor
  const voice = body?.voice === true;
  const facts = clean(body?.facts, MAX_FACTS);
  const place = planet === 'solar' ? placeLine(body?.place) : '';   // a journey level / piece id, turned into a line by the server · 旅程中的地点
  const pack = trimPack(body?.pack);   // sourced facts from the app (grounded mode when present) · 应用中有来源的资料

  let messages = Array.isArray(body?.messages) ? body.messages : [];
  messages = messages
    .filter(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map(m => ({ role: m.role, content: clean(m.content, MAX_CHARS) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') return { status: 400, json: { error: 'bad' } };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: pack.length ? 450 : 350, temperature: 0, system: pack.length ? groundedPrompt(planet, language, pack, voice, place) : systemPrompt(planet, language, facts, voice, place), messages })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('Anthropic API error', r.status, data?.error?.type, data?.error?.message);
      const code = r.status === 429 ? 'rate' : (r.status === 401 || r.status === 403) ? 'config' : 'busy';
      return { status: r.status === 429 ? 429 : 502, json: { error: code } };
    }
    const reply = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
    if (pack.length) { const g = parseGrounded(reply, pack); return { status: 200, json: { reply: g.answer || '…', sources: g.answer ? g.sources : [] } }; }
    return { status: 200, json: { reply: reply || '…' } };
  } catch (e) {
    console.error('Chat request failed:', e?.name, e?.message);
    return { status: 502, json: { error: 'busy' } };
  } finally {
    clearTimeout(timer);
  }
}

// ───────── Vercel serverless function: POST /api/chat ─────────
// Set ANTHROPIC_API_KEY in Vercel → Project → Settings → Environment Variables.
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'bad' }); return; }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  if (rateLimited(ip)) { res.status(429).json({ error: 'rate' }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const r = await chat(body || {});
  res.status(r.status).json(r.json);
}
