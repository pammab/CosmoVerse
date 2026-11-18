import { test } from 'node:test';
import { LANDMARKS } from '../landmarks.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { firstN, demoSteps, demoClips, DEMO_CARDS, DEMO_LINES, DEMO_QA, DEMO_UI, DEMO_PLANETS, DEMO_PIECE } from '../demo.js';
import { createTour, readMs } from '../tour.js';
import { NARRATION } from '../narration-text.js';
import { PIECES } from '../pieces/index.js';
import { LEVELS } from '../journey.js';
import { clipList, VOICE_LANGS } from '../voice-clips.js';

const L4 = ['en', 'zh', 'es', 'pt'];
const full = o => L4.every(l => typeof o?.[l] === 'string' && o[l].trim());

test('every demo text exists in all four languages', () => {
  for (const o of [DEMO_UI.title, DEMO_UI.askName, ...Object.values(DEMO_LINES), DEMO_QA.q, DEMO_QA.a]) assert.ok(full(o), JSON.stringify(o).slice(0, 60));
  for (const c of Object.values(DEMO_CARDS)) {
    assert.ok(full(c.head)); c.lines.forEach(t => assert.ok(full(t)));
    (c.icons || []).forEach(([i, t]) => { assert.ok(i); assert.ok(full(t)); });
  }
  for (const s of demoSteps()) assert.ok(full(s.text), s.key);
});

test('the showcase order: title → ladder → a piece → Saturn from the bar → Ask → harp → birthday → collision → VR clip → closing', () => {
  const s = demoSteps(), k = s.map(x => x.key);
  assert.equal(s[0].card, 'title'); assert.equal(s.at(-3).card, 'vr'); assert.equal(s.at(-2).act, 'more'); assert.equal(s.at(-1).card, 'end');
  assert.ok(DEMO_CARDS.vr.video && fs.existsSync(new URL('../' + DEMO_CARDS.vr.video, import.meta.url)), 'the VR clip is in the repo');
  assert.ok(s.some(x => x.go === 'universe'));
  assert.ok(s.findIndex(x => x.piece === DEMO_PIECE) > s.findIndex(x => x.go === 'universe'));
  assert.deepEqual(s.filter(x => x.select && !x.chat && !x.what).map(x => x.select), DEMO_PLANETS);
  assert.equal(s.find(x => x.select === 'saturn' && !x.chat).act, 'nav');
  assert.deepEqual(s.filter(x => x.act && x.act !== 'nav').map(x => x.act), ['harp', 'birthday', 'merge', 'more']);
  assert.ok(k.indexOf('demo-merge') < k.indexOf('demo-vr'));
  const ask = s.find(x => x.chat); assert.ok(ask && ask.hold >= 4000, 'time to read the answer');
  assert.equal(new Set(k).size, k.length, 'one clip per step');
});

test('facts only come from sourced texts: planet narration, level blurbs, piece narration', () => {
  const piece = PIECES.find(p => p.id === DEMO_PIECE);
  const s = demoSteps();
  for (const l of L4) assert.ok(piece.narration[l].startsWith(s.find(x => x.piece).text[l]), 'piece ' + l);
  for (const x of s.filter(x => x.select && !x.chat && !x.what)) for (const [i, l] of L4.entries()) assert.ok(NARRATION[x.select][i].startsWith(x.text[l]), x.key + l);
  for (const [i, l] of L4.entries()) { assert.ok(DEMO_QA.a[l].length > 10 && NARRATION.saturn[i].includes(DEMO_QA.a[l]), 'the offline answer is a sourced Saturn sentence');
    assert.ok(!s.find(x => x.select === 'saturn' && !x.chat).text[l].includes(DEMO_QA.a[l]), 'and not the one the Saturn beat already said'); }
  for (const x of s.filter(x => x.go)) assert.equal(x.key, 'level-' + x.go);
});

test('firstN keeps whole sentences (also Chinese) and never adds words', () => {
  assert.equal(firstN('One. Two is 2.5 km. Three.', 2), 'One. Two is 2.5 km.');
  assert.equal(firstN('一。二。三。', 2), '一。二。');
  assert.equal(firstN('Only one.', 3), 'Only one.');
});

test('lasts under 3 minutes when read without voice, plus flights', () => {
  const ms = demoSteps().reduce((t, x) => t + readMs(x.text.en) + 3000 + (x.hold ?? 900), 0);
  assert.ok(ms < 150000, `${Math.round(ms / 1000)} s`);   // ≤ 2:30, 30 s under the limit
});

test('demo clips can be voiced on the server and by make-voice; clip keys are unique', () => {
  const all = clipList({ extra: demoClips() });
  assert.equal(all.length, demoClips().length * VOICE_LANGS.length);
  const known = new Set(clipList({ levels: LEVELS, pieces: PIECES, narration: NARRATION }).map(c => c.key));
  for (const s of demoSteps()) if (!s.key.startsWith('demo-') && !s.key.startsWith('tour-')) assert.ok(known.has(s.key), s.key);
  // a shortened sourced text gets its own demo- clip, so the voice never says more than the caption · 缩短的文本用自己的片段
  for (const s of demoSteps().filter(x => x.piece || x.select === 'earth')) assert.match(s.key, /^demo-/);
  for (const f of ['../api/voice.js', '../tools/make-voice.mjs']) assert.match(fs.readFileSync(new URL(f, import.meta.url), 'utf8'), /\.\.\.demoClips\(\)/);
});

test('the tour runner plays the demo list, then the tour again', () => {
  const flown = [];
  const t = createTour({ fly: s => flown.push(s.key), say() {}, voiceOn: () => false });
  t.start(0, demoSteps());
  assert.equal(t.steps.length, demoSteps().length); assert.equal(flown[0], 'demo-title');
  let now = 0; while (t.active && now < 600000) { now += 250; t.tick(now); }
  assert.ok(!t.active && now < 400000); assert.equal(flown.at(-1), 'demo-end');
  t.start(now); assert.equal(t.steps[0].key, 'tour-intro');
});

test('main.js: ?demo=1 starts it, the standalone bundles demo.js', () => {
  const main = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(main, /demo=1/); assert.match(main, /demoSteps\(vr\)/); assert.match(main, /demo=2/);
  assert.match(fs.readFileSync(new URL('../build-standalone.mjs', import.meta.url), 'utf8'), /'demo'/);
});

test('the demo opens "What is this?" without pausing itself (a user click still pauses a tour)', () => {
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /if \(speak\) tour\?\.pause\(performance\.now\(\)\)/);
  assert.match(src, /openWhat\(focus, it, false\)/);
});
