// Make Cosmo's narration clips once with ElevenLabs, so the voice works on GitHub Pages (no server).
// 用 ElevenLabs 一次性生成语音片段 · Gera os clipes de voz uma vez.
//   ELEVENLABS_API_KEY=… node tools/make-voice.mjs [--langs en,pt] [--only piece-andromeda,mars] [--force] [--dry]
// Writes audio/narration/<key>-<lang>.mp3 and audio/narration/index.json (the list the app reads).
// The key is read from the environment only; it is never written or printed. No dependencies (plain fetch).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NARRATION } from '../narration-text.js';
import { LEVELS } from '../journey.js';
import { PIECES } from '../pieces/index.js';
import { tourClips } from '../tour.js';
import { introClips } from '../intros.js';
import { demoClips } from '../demo.js';
import { clipList, VOICE_LANGS } from '../voice-clips.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), dir = path.join(root, 'audio/narration');
const arg = name => { const i = process.argv.indexOf('--' + name); return i < 0 ? null : process.argv[i + 1] || ''; };
const has = name => process.argv.includes('--' + name);
const langs = (arg('langs') || VOICE_LANGS.join(',')).split(',').map(s => s.trim()).filter(l => VOICE_LANGS.includes(l));
const only = arg('only') ? new Set(arg('only').split(',').map(s => s.trim())) : null;
const key = process.env.ELEVENLABS_API_KEY, dry = has('dry');
if (!key && !dry) { console.error('Set ELEVENLABS_API_KEY in the environment (or use --dry to list the clips).'); process.exit(1); }
const voiceId = (process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL').replace(/[^\w]/g, '');   // same voice as api/voice.js
const model = process.env.ELEVENLABS_NARRATION_MODEL || 'eleven_multilingual_v2';
const API = process.env.ELEVENLABS_API_BASE || 'https://api.elevenlabs.io';

fs.mkdirSync(dir, { recursive: true });
const all = clipList({ narration: NARRATION, levels: LEVELS, pieces: PIECES, extra: [...tourClips(), ...demoClips(), ...introClips()], langs }).filter(c => !only || only.has(c.key));
const chars = all.reduce((n, c) => n + c.text.length, 0);
console.log(`${all.length} clips, ${chars} characters (${langs.join(', ')})${dry ? ' — dry run, nothing sent' : ''}`);
let made = 0, kept = 0, failed = 0;
for (const c of all) {
  const out = path.join(dir, c.file);
  if (dry) { console.log('  ', c.file, c.text.length); continue; }
  if (fs.existsSync(out) && !has('force')) { kept++; continue; }
  const r = await fetch(`${API}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text: c.text, model_id: model, ...(model !== 'eleven_multilingual_v2' ? { language_code: c.lang } : {}),
      voice_settings: { stability: 0.42, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 0.94 } }),
  });
  if (!r.ok) {
    failed++; console.error('  ✗', c.file, r.status, r.status === 401 ? '(key)' : r.status === 402 ? '(credits)' : r.status === 429 ? '(busy, try again later)' : '');
    if (r.status === 401 || r.status === 402) break;
    continue;
  }
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer())); made++; console.log('  ✓', c.file);
}
// The app only plays clips listed here (avoids 404s on GitHub Pages) · 应用只播放清单中的片段
const clips = fs.readdirSync(dir).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)).sort();
if (!dry) fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ clips }, null, 1) + '\n');
console.log(`made ${made}, kept ${kept}, failed ${failed}; index lists ${clips.length} clips`);
