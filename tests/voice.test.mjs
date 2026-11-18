import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { clipList, VOICE_LANGS } from '../voice-clips.js';
import { NARRATION } from '../narration-text.js';
import { LEVELS } from '../journey.js';
import { PIECES } from '../pieces/index.js';

const all = clipList({ narration: NARRATION, levels: LEVELS, pieces: PIECES });

test('every planet, level blurb and piece has a clip in all 4 languages', () => {
  const keys = [...Object.keys(NARRATION), ...LEVELS.filter(l => l.blurb).map(l => 'level-' + l.id), ...PIECES.map(p => 'piece-' + p.id)];
  for (const k of keys) for (const lang of VOICE_LANGS) assert.ok(all.find(c => c.key === k && c.lang === lang && c.text.trim()), `${k}-${lang}`);
  assert.equal(all.length, keys.length * 4);
});
test('clip file names are unique and safe', () => {
  assert.equal(new Set(all.map(c => c.file)).size, all.length);
  for (const c of all) assert.match(c.file, /^[a-z0-9-]+-(en|zh|es|pt)\.mp3$/);
});
test('main.js narrates with the same keys', () => {
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /narrate\('level-' \+ id/); assert.match(src, /narrate\('piece-' \+ id/);
});
test('the clip index ships (no 404 on GitHub Pages) and only lists files that exist', () => {
  const j = JSON.parse(fs.readFileSync(new URL('../audio/narration/index.json', import.meta.url), 'utf8'));
  assert.ok(Array.isArray(j.clips));
  for (const c of j.clips) assert.ok(fs.existsSync(new URL(`../audio/narration/${c}.mp3`, import.meta.url)), c);
});
test('make-voice never prints or writes the key', () => {
  const src = fs.readFileSync(new URL('../tools/make-voice.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /console\.\w+\([^)]*\bkey\b(?!\s*\))/);
  assert.doesNotMatch(src, /writeFileSync\([^)]*\bkey\b/);
});
import { firstSentence, levelSpeech } from '../voice-clips.js';
test('levels speak only their first, descriptive sentence', () => {
  assert.equal(firstSentence('Our home galaxy, seen from outside. Find the Sun, then point at it.'), 'Our home galaxy, seen from outside.');
  assert.equal(firstSentence('about 2.5 million years away. Next'), 'about 2.5 million years away.');
  assert.equal(firstSentence('我们星系的家族。指向星系群了解更多。'), '我们星系的家族。');
  for (const l of LEVELS.filter(l => l.blurb)) for (const [lang, t] of Object.entries(levelSpeech(l.blurb))) {
    assert.ok(t.length > 5, `${l.id}.${lang}`); assert.doesNotMatch(t, /\b(point|zoom|apunta|aponte)\b|指向/i, `${l.id}.${lang}: ${t}`);
  }
});
test('the server only voices known texts, for planets, levels and pieces', async () => {
  const { voice } = await import('../api/voice.js');
  const saved = process.env.ELEVENLABS_API_KEY; process.env.ELEVENLABS_API_KEY = 'test';
  try {
    assert.equal((await voice({ kind: 'narrate', id: 'level-nowhere', lang: 'en' })).status, 400);
    assert.equal((await voice({ kind: 'narrate', id: 'piece-andromeda', lang: 'xx' })).status, 400);
  } finally { if (saved === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = saved; }
});
test('stopping speech from the chat also stops the narration', () => {
  const v = fs.readFileSync(new URL('../voice.js', import.meta.url), 'utf8');
  assert.match(v, /export function stopSpeaking\(\) \{\s*speakId\+\+; dispatchEvent\(new Event\('stellar-speak'\)\)/);
});
