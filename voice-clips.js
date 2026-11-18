// Which narration clips exist and what they say · 语音片段清单 · Clips de narración · Clipes de narração
// Keys: planets 'mars', levels 'level-galaxy', journey pieces 'piece-andromeda' (main.js uses the same keys).
// Used by tools/make-voice.mjs (writes audio/narration/<key>-<lang>.mp3) and by the tests. Pure: runs in node.
export const VOICE_LANGS = ['en', 'zh', 'es', 'pt'];
const pick = (t, lang, i) => Array.isArray(t) ? t[i] : t?.[lang];
// Levels speak only the first, descriptive sentence of their blurb (the rest is UI help) · 层级只朗读第一句
export const firstSentence = text => String(text || '').match(/.+?(?:[.!?](?=\s|$)|[。！？]|$)/)?.[0].trim() || '';
export const levelSpeech = blurb => blurb && Object.fromEntries(VOICE_LANGS.map(l => [l, firstSentence(blurb[l])]));
export function clipList({ narration = {}, levels = [], pieces = [], extra = [], langs = VOICE_LANGS } = {}) {
  const items = [
    ...Object.entries(narration).map(([id, t]) => [id, t]),
    ...levels.filter(l => l.blurb).map(l => ['level-' + l.id, levelSpeech(l.blurb)]),
    ...pieces.map(p => ['piece-' + p.id, p.narration]),
    ...extra,                                         // [key, texts]: the tour's lines (tour.js tourClips) · 游览串场词
  ];
  const out = [];
  for (const [key, t] of items) langs.forEach(lang => {
    const text = pick(t, lang, VOICE_LANGS.indexOf(lang));
    if (text) out.push({ key, lang, file: `${key}-${lang}.mp3`, text });
  });
  return out;
}
