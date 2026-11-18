// Speech to text for browsers without SpeechRecognition (the Quest Browser, Firefox): POST /api/stt with a short audio clip.
// ElevenLabs Speech to Text (POST /v1/speech-to-text, multipart: model_id + file, optional language_code; reply { text }),
// docs: https://elevenlabs.io/docs/api-reference/speech-to-text/convert . The key stays on the server.
//   ELEVENLABS_API_KEY        required (the same key as the voice)
//   ELEVENLABS_STT_MODEL      optional, default scribe_v2
// 没有 SpeechRecognition 的浏览器（Quest 浏览器、Firefox）用服务器转写短音频；密钥只在服务器上。
import { rateLimited } from './chat.js';
export const STT_MAX_BYTES = 600_000;   // a voice command is at most ~8 s (~110 kB of Opus); 600 kB leaves room for other formats · 语音指令最长约 8 秒
const LANGS = { en: 'en', zh: 'zh', es: 'es', pt: 'pt' };
const TYPES = /^audio\/(webm|ogg|mp4|mpeg|wav|x-wav|aac)(;.*)?$/i;

// Returns { status, json } · 返回 { status, json }
export async function stt({ audio, type = 'audio/webm', lang = '' } = {}) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return { status: 500, json: { error: 'config' } };
  if (!audio || !audio.length || audio.length > STT_MAX_BYTES || !TYPES.test(String(type))) return { status: 400, json: { error: 'bad' } };
  const form = new FormData();
  form.append('model_id', process.env.ELEVENLABS_STT_MODEL || 'scribe_v2');
  const code = LANGS[String(lang).slice(0, 2).toLowerCase()]; if (code) form.append('language_code', code);
  form.append('file', new Blob([audio], { type: String(type).split(';')[0] }), 'voice.' + (/mp4|aac/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : /wav/.test(type) ? 'wav' : 'webm'));
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const r = await fetch(`${process.env.ELEVENLABS_API_BASE || 'https://api.elevenlabs.io'}/v1/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': key }, body: form, signal: controller.signal });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { console.error('ElevenLabs STT error', r.status, data?.detail?.status || ''); return { status: r.status === 429 ? 429 : 502, json: { error: r.status === 429 ? 'rate' : (r.status === 401 || r.status === 403) ? 'config' : 'busy' } }; }
    return { status: 200, json: { text: String(data.text || '').trim().slice(0, 500) } };
  } catch (e) {
    console.error('STT request failed:', e?.name, e?.message);
    return { status: 502, json: { error: 'busy' } };
  } finally { clearTimeout(timer); }
}

// ───────── Vercel serverless function: POST /api/stt?lang=en (body = the audio) ─────────
export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'bad' }); return; }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  if (rateLimited(ip)) { res.status(429).json({ error: 'rate' }); return; }   // shared with the chat: 10 per minute per visitor · 与聊天共用限额
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > STT_MAX_BYTES) { res.status(413).json({ error: 'bad' }); return; } chunks.push(c); }
  const lang = new URL(req.url, 'http://x').searchParams.get('lang') || '';
  const r = await stt({ audio: Buffer.concat(chunks), type: req.headers['content-type'] || '', lang });
  res.status(r.status).json(r.json);
}
