// Feature intros: every feature, 4 languages, short, once per visit, voice whitelist · 功能介绍测试
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INTROS, INTRO_KEYS, introClips, createIntros } from '../intros.js';
import { clipList } from '../voice-clips.js';
import { readFileSync } from 'node:fs';

test('every top feature has a short intro in EN/zh/ES/PT', () => {
  assert.deepEqual(INTRO_KEYS.sort(), ['asteroids', 'compare', 'cosmo', 'gestures', 'habitability', 'resources', 'talk', 'trails', 'vr']);
  for (const k of INTRO_KEYS) for (const l of ['en', 'zh', 'es', 'pt']) {
    const t = INTROS[k].text[l]; assert.ok(t && t.trim(), `${k} ${l}`);
    assert.ok((t.match(/[.!?。！？](\s|$)/g) || []).length <= 3, `${k} ${l}: 1–3 sentences`);
    assert.ok(t.length < (l === 'zh' ? 90 : 270), `${k} ${l} is short`);
  }
});

test('once per visit', () => {
  const g = createIntros();
  assert.ok(g.take('habitability')); assert.equal(g.take('habitability'), null); assert.ok(g.take('compare'));
  assert.equal(g.take('nope'), null);
  assert.ok(createIntros().take('habitability'), 'a new visit starts fresh');
});

test('spoken intros are in the voice whitelist; Talk is caption only (the mic is listening)', () => {
  const keys = new Set(clipList({ extra: introClips() }).map(c => c.key + '|' + c.lang));
  for (const k of INTRO_KEYS.filter(k => k !== 'talk')) for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(keys.has(`intro-${k}|${l}`), k + l);
  assert.ok(![...keys].some(k => k.startsWith('intro-talk')));
  assert.match(readFileSync(new URL('../api/voice.js', import.meta.url), 'utf8'), /introClips\(\)/);
});

test('main.js wires every intro to its button and only on real clicks', () => {
  const src = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  for (const k of INTRO_KEYS) assert.match(src, new RegExp(`'${k}'`), k);
  assert.match(src, /e\.isTrusted/);
});
