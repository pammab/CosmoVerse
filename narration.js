// Narration & transition sounds · 语音介绍与转场音效 · Narración y efectos
//   • narrate(id): Cosmo introduces each planet in 2–3 sentences (ElevenLabs voice, with captions)
//   • sfx(name): whooshes and chimes for transitions (ElevenLabs Sound Effects)
// Both fall back to the browser (built-in voice, synthesized whoosh) when ElevenLabs isn't available,
// for example with no key or when the page is opened as a file.
import { NARRATION } from './narration-text.js';
import { getLanguage } from './i18n.js';
import { stopSpeaking } from './voice.js';

const LANG_INDEX = { en: 0, zh: 1, es: 2, pt: 3 }, VOICE_LANG = { en: 'en-US', zh: 'zh-CN', es: 'es-ES', pt: 'pt-BR' };
let enabled = true; try { enabled = localStorage.getItem('stellar-voice') !== 'off'; } catch {}
let online = location.protocol !== 'file:';         // set false after the server says "no key"
let ctx = null, audio = null, narrationId = 0;
const buffers = new Map(), pending = new Map();
const button = document.getElementById('voiceToggle'), caption = document.getElementById('caption');

/* ───────── Shared audio context · 音频上下文 ───────── */
function ac() {
  if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/* ───────── Sound effects · 音效 ───────── */
async function loadSfx(name) {
  if (buffers.has(name)) return buffers.get(name);
  if (!online) return null;
  if (!pending.has(name)) pending.set(name, (async () => {
    try {
      const r = await fetch(`/api/voice?kind=sfx&name=${name}`);
      if (r.status === 503 || r.status === 404 || r.status === 405) { online = false; window.__stellarVoiceFallback(fallbackReason(r.status)); return null; }
      if (!r.ok) return null;
      const buf = await ac().decodeAudioData(await r.arrayBuffer());
      buffers.set(name, buf); return buf;
    } catch { return null; } finally { pending.delete(name); }
  })());
  return pending.get(name);
}
// Synthesized fallback: filtered noise sweeping up or down · 合成的“嗖”声
function synthWhoosh(name) {
  const c = ac(); if (!c) return;
  const dur = name === 'warp' ? 1.8 : name === 'chime' ? 0.6 : 1.1, t = c.currentTime;
  if (name === 'chime') {
    for (const [f, d] of [[1318.5, 0], [1975.5, 0.06]]) {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(0.08, t + d + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d + dur);
      o.connect(g).connect(c.destination); o.start(t + d); o.stop(t + d + dur);
    }
    return;
  }
  const n = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  src.buffer = n; f.type = 'bandpass'; f.Q.value = 1.4;
  const [a, b] = name === 'whoosh-out' ? [2400, 300] : name === 'warp' ? [200, 3200] : [300, 2200];
  f.frequency.setValueAtTime(a, t); f.frequency.exponentialRampToValueAtTime(b, t + dur * 0.8);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination); src.start(t); src.stop(t + dur);
}
export async function sfx(name) {
  const c = ac(); if (!c) return;
  const buf = buffers.get(name) || (online ? await Promise.race([loadSfx(name), new Promise(r => setTimeout(() => r(null), 350))]) : null);
  if (!buf) { synthWhoosh(name); return; }                     // not ready in time: play the synthesized one
  const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; g.gain.value = name === 'chime' ? 0.5 : 0.7;
  s.connect(g).connect(c.destination); s.start();
}
// Fetch the sounds after the first click, so they are ready for the next transitions.
addEventListener('pointerdown', async () => {
  if (!online) return;
  await loadSfx('whoosh-in');                               // one probe first: no key means no more requests
  if (online) ['whoosh-out', 'warp', 'chime'].forEach(loadSfx);
}, { once: true });

/* ───────── Narration · 语音介绍 ───────── */
function showCaption(text) {
  if (!caption) return;
  caption.textContent = text; caption.classList.toggle('show', !!text);
}
function done(id) { if (id !== narrationId) return; audio = null; clearTimeout(captionTimer); window.__stellarSpeaking = false; showCaption(''); }
// Split into sentences; each gets a share of the time proportional to its length · 按句显示字幕
// A Latin stop ends a sentence only before a space or the end (keeps "2.5 million", "6.500") · 数字中的点不分句
const sentences = text => text.match(/.+?(?:[.!?]["”’)]?(?=\s|$)|[。！？]["”’]?|$)\s*/g)?.map(s => s.trim()).filter(Boolean) || [text];
function syncCaptions(parts, progress) {          // progress 0..1 → show the sentence being spoken
  const total = parts.reduce((n, s) => n + s.length, 0); let acc = 0;
  for (const s of parts) { acc += s.length; if (progress <= acc / total) { if (caption?.textContent !== s) showCaption(s); return; } }
}
// Last resort (no clip, no server, no browser voice): captions only · 最后手段：仅字幕
let captionTimer = 0;
function captionsOnly(text, lang, id) {
  const parts = sentences(text), perChar = lang === 'zh' ? 200 : 52; let i = 0;
  const next = () => { if (id !== narrationId) return; if (i >= parts.length) return done(id); showCaption(parts[i]); captionTimer = setTimeout(next, Math.max(1500, parts[i++].length * perChar)); };
  next();
}
// A soft, spacious reverb around the narrator · 空间混响
let reverbIn = null;
function reverbBus() {
  const c = ac(); if (!c) return null; if (reverbIn) return reverbIn;
  const len = c.sampleRate * 2.6, ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  const conv = c.createConvolver(), wet = c.createGain(), dry = c.createGain(), lp = c.createBiquadFilter();
  conv.buffer = ir; wet.gain.value = 0.2; dry.gain.value = 1; lp.type = 'lowpass'; lp.frequency.value = 5200;
  reverbIn = c.createGain(); reverbIn.connect(dry).connect(c.destination); reverbIn.connect(lp).connect(conv).connect(wet).connect(c.destination);
  return reverbIn;
}
// Pre-generated clips (tools/make-voice.mjs) listed in audio/narration/index.json; works on GitHub Pages (no server).
// 预先生成的语音片段（无服务器也可用）
let clips = null;
const clipSet = () => clips || (clips = fetch('audio/narration/index.json').then(r => r.ok ? r.json() : null)
  .then(j => new Set(j?.clips || [])).catch(() => new Set()));
// Built-in browser voice, one sentence at a time so the caption follows it · 浏览器语音，逐句朗读并同步字幕
let synthOn = false, utter = null;
const hasSynth = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
function voicesReady() {
  const v = speechSynthesis.getVoices(); if (v.length) return Promise.resolve(v);
  return new Promise(res => { const t = setTimeout(() => res(speechSynthesis.getVoices()), 700);
    speechSynthesis.addEventListener('voiceschanged', () => { clearTimeout(t); res(speechSynthesis.getVoices()); }, { once: true }); });
}
function bestVoice(voices, lang) {
  const base = lang.slice(0, 2).toLowerCase(), same = voices.filter(v => v.lang?.toLowerCase().replace('_', '-').startsWith(base));
  const exact = same.filter(v => v.lang?.replace('_', '-') === lang);
  // voices on the device first: Chrome's online voices can stay silent and only end after ~10 s · 优先本机语音
  const local = list => list.filter(v => v.localService !== false), nice = list => list.find(v => /natural|neural|premium|enhanced|google/i.test(v.name));
  return nice(local(exact)) || nice(local(same)) || local(exact)[0] || local(same)[0] || nice(exact) || nice(same) || exact[0] || same[0] || null;
}
async function browserVoice(text, lang, id) {
  const voice = bestVoice(await voicesReady(), VOICE_LANG[lang] || 'en-US');
  if (id !== narrationId) return true;
  if (!voice) return false;                                   // no voice for this language: captions only
  const parts = sentences(text); let i = 0; synthOn = true;
  const next = () => {
    if (id !== narrationId) return;
    if (i >= parts.length) { synthOn = false; return done(id); }
    const u = new SpeechSynthesisUtterance(parts[i]); showCaption(parts[i++]);
    u.voice = voice; u.lang = voice.lang; u.rate = 1; u.pitch = 1;
    // A voice that never starts (blocked or silent) would hold each caption for ~10 s: after 1.5 s with no sound,
    // stop it and show the captions at reading speed instead · 语音未开始：改为按阅读速度显示字幕
    let started = false; u.onstart = () => { started = true; };
    const guard = setTimeout(() => { if (started || id !== narrationId || utter !== u) return; synthOn = false; u.onend = u.onerror = null;
      try { speechSynthesis.cancel(); } catch {} captionsOnly(parts.slice(i - 1).join(' '), lang, id); }, 1500);
    u.onend = () => { clearTimeout(guard); next(); }; u.onerror = e => { if (id !== narrationId) return; if (e.error === 'interrupted' || e.error === 'canceled') { synthOn = false; done(id); } else next(); };
    utter = u; speechSynthesis.speak(u);            // keep a reference: Chrome can drop it before 'end' · 保持引用
  };
  speechSynthesis.cancel(); next(); return true;
}
function playClip(url, parts, id, revoke) {
  return new Promise(res => {
    audio = new Audio(url);
    try { const bus = reverbBus(); if (bus && ctx.state === 'running') ctx.createMediaElementSource(audio).connect(bus); } catch {}   // only when audio is unlocked
    audio.ontimeupdate = () => { if (id === narrationId && audio?.duration) syncCaptions(parts, audio.currentTime / audio.duration); };
    audio.onended = () => { if (revoke) URL.revokeObjectURL(url); done(id); };
    audio.onerror = () => { if (revoke) URL.revokeObjectURL(url); res(false); };
    audio.play().then(() => res(true), () => res(false));
  });
}
const pick = (texts, lang) => Array.isArray(texts) ? texts[LANG_INDEX[lang] ?? 0] : texts?.[lang] || texts?.en;
// Cosmo speaks: a planet ('mars'), a level ('level-galaxy') or a journey piece ('piece-andromeda').
// texts = { en, zh, es, pt } (or [en, zh, es, pt]); planets default to narration-text.js.
// Voice order: static clip → ElevenLabs server (planets) → built-in browser voice → captions only.
// 语音顺序：静态片段 → ElevenLabs 服务器（行星）→ 浏览器语音 → 仅字幕
let lastKey = '';
// What Cosmo is saying now (a narration key) or null · 当前朗读的键
export const speakingKey = () => window.__stellarSpeaking ? lastKey : null;
export async function narrate(key, texts = NARRATION[key]) {
  stopNarration(); lastKey = key;
  if (!enabled || !texts) return;
  stopSpeaking();                                  // before taking a new id: stopSpeaking ends any narration too · 先停止
  const lang = getLanguage(), text = pick(texts, lang), id = ++narrationId;
  if (!text) return;
  const parts = sentences(text);
  window.__stellarSpeaking = true; showCaption(parts[0]);
  if (location.protocol !== 'file:' && (await clipSet()).has(`${key}-${lang}`)) {
    if (id !== narrationId) return;
    if (await playClip(`audio/narration/${key}-${lang}.mp3`, parts, id, false)) return;
    if (id !== narrationId) return;
  }
  // 'ut-…' = a line someone wrote in their own tour: no clip, the server can't voice it, so straight to the browser voice
  // （用户自己写的台词：直接用浏览器语音，不询问服务器）
  if (online && !key.startsWith('ut-')) {   // the server knows every planet, level and piece text (voice-clips.js) · 服务器只接受已知文本
    try {
      const r = await fetch(`/api/voice?kind=narrate&id=${key}&lang=${lang}`);
      if (id !== narrationId) return;
      if (r.ok) {
        const url = URL.createObjectURL(await r.blob());
        if (id !== narrationId) { URL.revokeObjectURL(url); return; }
        if (await playClip(url, parts, id, true)) return;
        if (id !== narrationId) return;
      } else {
        if (r.status === 503 || r.status === 404 || r.status === 405) online = false;
        window.__stellarVoiceFallback(fallbackReason(r.status));
      }
    } catch { if (id !== narrationId) return; window.__stellarVoiceFallback('error'); }
  }
  if (hasSynth() && await browserVoice(text, lang, id)) return;
  if (id !== narrationId) return;
  captionsOnly(text, lang, id);
}
export function stopNarration() {
  narrationId++;
  if (synthOn) { synthOn = false; try { speechSynthesis.cancel(); } catch {} }
  if (audio) { try { audio.pause(); } catch {} audio = null; }
  clearTimeout(captionTimer);
  window.__stellarSpeaking = false; showCaption('');
}
// When Cosmo answers in the chat, stop the narration · 对话朗读时停止介绍
addEventListener('stellar-speak', () => { narrationId++; synthOn = false; clearTimeout(captionTimer); if (audio) { try { audio.pause(); } catch {} audio = null; } showCaption(''); });

/* ───────── On/off button · 开关 ───────── */
// Turns off only the spoken introductions (planets, levels, pieces); Ask Cosmo still answers aloud · 只关闭介绍语音，AI 不受影响
export const NARRATION_UI = {
  on: { en: '🗣 Narration on', zh: '🗣 讲解已开启', es: '🗣 Narración activada', pt: '🗣 Narração ligada' },
  off: { en: '🔇 Narration off', zh: '🔇 讲解已关闭', es: '🔇 Narración desactivada', pt: '🔇 Narração desligada' },
  title: { en: 'Turn the spoken introductions on or off (Ask Cosmo still answers aloud)', zh: '开启或关闭语音介绍（问 Cosmo 仍会朗读回答）', es: 'Activa o desactiva las presentaciones habladas (Pregunta a Cosmo sigue respondiendo en voz alta)', pt: 'Liga ou desliga as apresentações faladas (Pergunte ao Cosmo continua respondendo em voz alta)' },
};
function render() {
  if (!button) return;
  const t = enabled ? NARRATION_UI.on : NARRATION_UI.off;
  button.classList.toggle('active', enabled); button.setAttribute('aria-pressed', String(enabled));
  button.title = NARRATION_UI.title[getLanguage()] || NARRATION_UI.title.en;
  button.innerHTML = window.bi(t.en, t.zh, t.es, t.pt);
}
export function setNarration(on) {
  enabled = !!on; try { localStorage.setItem('stellar-voice', enabled ? 'on' : 'off'); } catch {}
  if (!enabled) stopNarration(); else sfx('chime');
  render(); return true;
}
if (button) button.onclick = () => setNarration(!enabled);
render();

// Chimes for the team's panels · 面板提示音
for (const id of ['habitability', 'asteroidOpen', 'resourcesOpen']) document.getElementById(id)?.addEventListener('click', () => sfx('chime'));

export const voiceStatus = () => ({ enabled, online });

// Say clearly when the ElevenLabs voice can't be used, instead of switching silently · 明确提示
let warned = false;
window.__stellarVoiceFallback = reason => {
  if (warned) return; warned = true;
  const s = document.getElementById('status'); if (!s) return;
  const why = {
    file: ['Opened as a file, so the ElevenLabs voice is off. Use the website or npm start.', '以文件方式打开，ElevenLabs 语音不可用。请使用网站或 npm start。', 'Abierto como archivo: la voz de ElevenLabs no está disponible. Usa la web o npm start.'],
    config: ['ElevenLabs voice not connected: add ELEVENLABS_API_KEY on the server and redeploy. Using the browser voice for now.', 'ElevenLabs 语音未连接：请在服务器添加 ELEVENLABS_API_KEY 并重新部署。暂时使用浏览器语音。', 'Voz de ElevenLabs no conectada: añade ELEVENLABS_API_KEY en el servidor y vuelve a desplegar. Por ahora, la voz del navegador.'],
    missing: ['ElevenLabs voice not found on the server: upload api/voice.js and api/tts.js, then redeploy.', '服务器上没有 ElevenLabs 语音接口：请上传 api/voice.js 和 api/tts.js 并重新部署。', 'Falta la voz de ElevenLabs en el servidor: sube api/voice.js y api/tts.js y vuelve a desplegar.'],
    error: ['ElevenLabs did not answer (key, credits or limit). Using the browser voice for now.', 'ElevenLabs 没有响应（密钥、额度或限制）。暂时使用浏览器语音。', 'ElevenLabs no respondió (clave, créditos o límite). Por ahora, la voz del navegador.'],
  }[reason] || null;
  console.warn('[Cosmo voice] ElevenLabs not used:', reason);
  // Visitors still hear the clips or the browser voice, so the setup hint is only shown to the developer · 仅开发者可见
  if (!why || !/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && reason !== 'error') return;
  s.innerHTML = window.bi(...why); s.style.display = 'block';
  clearTimeout(s.__t); s.__t = setTimeout(() => s.style.display = 'none', 9000);
};
const fallbackReason = status => status === 503 ? 'config' : status === 404 || status === 405 ? 'missing' : 'error';
