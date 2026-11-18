// ─────────────────────────────────────────────────────────────────────────────
// Voice · 语音 — speech-to-text (Web Speech API) and spoken replies.
// Speech recognition works in Chrome and Edge (and Safari 14.1+). In Chrome the
// audio is processed by Google's speech service. Replies are spoken with ElevenLabs when the
// server has a key, otherwise with the browser's built-in voice.
// ─────────────────────────────────────────────────────────────────────────────
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// No SpeechRecognition (the Quest Browser, Firefox): record a short clip and let our server transcribe it (/api/stt, ElevenLabs).
// 没有 SpeechRecognition（Quest 浏览器、Firefox）：录一小段音频，由我们的服务器转写
const canRecord = !SR && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined' && location.protocol !== 'file:';
export const canListen = !!SR || canRecord;
export const listenMode = SR ? 'browser' : canRecord ? 'server' : null;
export const canSpeak = 'speechSynthesis' in window;

export const VOICE_LANGS = [
  { code: 'en-US', label: 'English' },
  { code: 'zh-CN', label: '中文' },
  { code: 'es-ES', label: 'Español' },
  { code: 'pt-BR', label: 'Português' },
];
export function defaultLang() {
  const l = (navigator.language || 'en').toLowerCase();
  return (VOICE_LANGS.find(v => l.startsWith(v.code.slice(0, 2))) || VOICE_LANGS[0]).code;
}

let current = null;
// Listen once; resolves with the final transcript ('' if nothing was heard).
export function listen(lang, onInterim = () => {}, onState = () => {}) {
  if (!SR && canRecord) return recordOnce(lang, onState);
  if (!SR) return Promise.reject(Object.assign(new Error('unsupported'), { code: 'unsupported' }));
  stopListening();
  return new Promise((resolve, reject) => {
    const r = new SR(); current = r;
    r.lang = lang; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    let finalText = '', latest = '';
    r.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      latest = (finalText + interim).trim(); onInterim(latest);
    };
    r.onerror = e => { current = null; if (e.error === 'no-speech' || e.error === 'aborted') resolve(''); else reject(Object.assign(new Error(e.error), { code: e.error })); };
    r.onend = () => { current = null; resolve((finalText || latest).trim()); };
    r.start();
  });
}
const fail = code => Object.assign(new Error(code), { code });
// Record until you stop talking (1.2 s of quiet after speech), at most 8 s; nothing heard in 5 s = '' · 说完后静音 1.2 秒停止，最多 8 秒
// A static copy (GitHub Pages) has no /api/stt: say so before asking for the microphone · 静态副本没有服务器：先说明，不请求麦克风
const staticCopy = () => /\.github\.io$/i.test(location.hostname);
async function recordOnce(lang, onState = () => {}) {
  stopListening();
  if (staticCopy()) throw fail('offline');
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch (e) { throw fail(e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? 'not-allowed' : 'audio-capture'); }
  const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported?.(t)) || '';
  const rec = new MediaRecorder(stream, type ? { mimeType: type } : {}), chunks = [];
  let ac = null, heard = false, aborted = false;
  const blob = await new Promise(resolve => {
    rec.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
    rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || type || 'audio/webm' }));
    const finish = () => { if (rec.state !== 'inactive') rec.stop(); };
    current = { stop: () => { aborted = true; finish(); }, finish };   // stopListening() cancels (nothing is sent) · 取消则不发送
    rec.start(250); setTimeout(finish, 8000);   // hard limit, whatever happens to the loudness check · 硬性上限
    const t0 = performance.now(); let quietSince = t0;
    try {   // a simple loudness check (the browser's own audio graph, nothing sent) · 简单的音量检测
      ac = new (window.AudioContext || window.webkitAudioContext)(); ac.resume?.().catch?.(() => {}); const an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(stream).connect(an);
      const buf = new Float32Array(an.fftSize);
      const tick = () => {
        if (rec.state === 'inactive') return;
        an.getFloatTimeDomainData(buf); let sum = 0; for (const v of buf) sum += v * v; const loud = Math.sqrt(sum / buf.length) > 0.02, now = performance.now();
        if (loud) { heard = true; quietSince = now; }
        if ((heard && now - quietSince > 1200) || (!heard && now - t0 > 5000)) finish(); else setTimeout(tick, 100);
      };
      tick();
    } catch { heard = true; setTimeout(finish, 5000); }
  });
  stream.getTracks().forEach(t => t.stop()); ac?.close?.().catch?.(() => {}); current = null;
  if (aborted || !heard || blob.size < 1200) return '';
  onState('transcribing');   // the clip is on its way to the server · 正在转写
  let r;
  try { r = await fetch('/api/stt?lang=' + encodeURIComponent(String(lang).slice(0, 2)), { method: 'POST', headers: { 'content-type': blob.type }, body: blob }); }
  catch { throw fail('offline'); }
  if (r.status === 404 || r.status === 405 || r.status === 501) throw fail('offline');   // no server (GitHub Pages) · 没有服务器
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw fail(data.error === 'rate' ? 'rate' : data.error === 'config' ? 'config' : 'network');   // config: the server has no voice key · 服务器没有语音密钥
  return String(data.text || '').trim();
}
export function stopListening() { try { current?.stop(); } catch {} current = null; }
export const isListening = () => !!current;

function pickVoice(lang) {
  const voices = speechSynthesis.getVoices(), base = lang.slice(0, 2).toLowerCase();
  const same = voices.filter(v => v.lang?.toLowerCase().startsWith(base));
  return same.find(v => /natural|google|neural|premium|enhanced/i.test(v.name)) || same.find(v => v.lang === lang) || same[0] || null;
}
// Spoken replies: ElevenLabs voice through our server (/api/tts), falling back to the
// browser's built-in voice if the server has no key or the request fails.
// 回答朗读：优先使用 ElevenLabs，失败时改用浏览器自带语音。
let premium = true, audio = null, speakId = 0;
const setSpeaking = on => { window.__stellarSpeaking = on; };
// Without ElevenLabs the reply stays as text on screen: no robotic browser voice.
// Set window.STELLAR_BROWSER_VOICE = true to allow the built-in voice as a fallback.
function browserSpeak(text, lang, onEnd) {
  if (!canSpeak || !window.STELLAR_BROWSER_VOICE) { setSpeaking(false); return onEnd(); }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; const v = pickVoice(lang); if (v) u.voice = v;
  u.rate = 1.02; u.pitch = 1; u.onend = u.onerror = () => { setSpeaking(false); onEnd(); };
  speechSynthesis.speak(u);
}
export async function speak(text, lang, onEnd = () => {}) {
  if (!text) return onEnd();
  stopSpeaking(); dispatchEvent(new Event('stellar-speak')); const id = ++speakId; setSpeaking(true);
  if (premium && location.protocol !== 'file:') {
    try {
      const r = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, lang: lang.slice(0, 2).toLowerCase() }) });
      if (id !== speakId) return;                                   // a newer reply started meanwhile
      if (r.ok && (r.headers.get('content-type') || '').includes('audio')) {
        const url = URL.createObjectURL(await r.blob());
        if (id !== speakId) { URL.revokeObjectURL(url); return; }
        audio = new Audio(url);
        const done = () => { URL.revokeObjectURL(url); if (id === speakId) { audio = null; setSpeaking(false); onEnd(); } };
        audio.onended = done;
        audio.onerror = () => { URL.revokeObjectURL(url); if (id === speakId) { audio = null; browserSpeak(text, lang, onEnd); } };
        await audio.play();
        return;
      }
      if (r.status === 503 || r.status === 404 || r.status === 405) premium = false;   // no key / no server: stop asking
      window.__stellarVoiceFallback?.(r.status === 503 ? 'config' : r.status === 404 || r.status === 405 ? 'missing' : 'error');
    } catch { if (id !== speakId) return; window.__stellarVoiceFallback?.('error'); }
  } else window.__stellarVoiceFallback?.(location.protocol === 'file:' ? 'file' : 'config');
  browserSpeak(text, lang, onEnd);
}
export function stopSpeaking() {
  speakId++; dispatchEvent(new Event('stellar-speak'));   // narration.js stops too (chat mic / close) · 旁白同时停止
  if (audio) { try { audio.pause(); } catch {} audio = null; }
  if (canSpeak) speechSynthesis.cancel();
  setSpeaking(false);
}
if (canSpeak) speechSynthesis.getVoices(); // warm up the voice list
