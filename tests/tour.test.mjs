import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tourSteps, tourClips, createTour, TOUR_UI, TOUR_LINES, TOUR_PLANETS, readMs, PAUSE_LIMIT } from '../tour.js';
import { LEVELS } from '../journey.js';
import { NARRATION } from '../narration-text.js';
import { clipList } from '../voice-clips.js';
import { WELCOME } from '../welcome.js';

const LANGS = ['en', 'zh', 'es', 'pt'];
const all4 = (o, what) => { for (const l of LANGS) assert.ok(typeof o?.[l] === 'string' && o[l].trim(), `${what}.${l}`); };

test('the tour flies down the ladder, visits the planets, lands on Earth, goes back up and asks', () => {
  const s = tourSteps(), places = s.map(x => x.go ? 'L:' + x.go : x.home ? 'home' : x.select ? 'B:' + x.select : x.ask ? 'ask' : '?');
  const levels = LEVELS.filter(l => l.blurb).map(l => 'L:' + l.id);
  assert.deepEqual(places, ['L:universe', ...levels, 'home', ...TOUR_PLANETS.map(p => 'B:' + p), 'B:earth', 'L:universe', 'ask']);
  assert.equal(levels[0], 'L:universe'); assert.equal(levels.at(-1), 'L:neighbourhood');
  assert.equal(new Set(TOUR_PLANETS).size, 7); assert.ok(!TOUR_PLANETS.includes('earth'));
});
test('every line, title and button exists in all four languages', () => {
  for (const st of tourSteps()) { all4(st.text, st.key); if (st.title) all4(st.title, st.key + '.title'); }
  for (const [k, v] of Object.entries(TOUR_UI)) all4(v, 'TOUR_UI.' + k);
  for (const [k, v] of Object.entries(TOUR_LINES)) all4(v, 'TOUR_LINES.' + k);
  all4(WELCOME.tour, 'WELCOME.tour'); all4(WELCOME.tourHow, 'WELCOME.tourHow');
});
test('planet lines are the first sentence of the already-sourced planet narration (no new facts)', () => {
  for (const st of tourSteps().filter(x => x.select)) LANGS.forEach((l, i) => assert.ok(NARRATION[st.select][i].startsWith(st.text[l]), `${st.key}.${l}`));
  for (const st of tourSteps().filter(x => x.select && x.select !== 'earth')) assert.ok(st.text.en.length < NARRATION[st.select][0].length);
  // Cosmo's own link lines carry no numbers · 串场词不含数字
  for (const v of Object.values(TOUR_LINES)) for (const l of LANGS) assert.doesNotMatch(v[l], /\d/);
});
test('the server and the clip maker know the tour lines (ElevenLabs voice works for them)', async () => {
  const keys = clipList({ extra: tourClips() }).map(c => c.key + '|' + c.lang);
  for (const st of tourSteps().filter(x => x.key.startsWith('tour-'))) for (const l of LANGS) assert.ok(keys.includes(st.key + '|' + l), st.key + l);
  const { voice } = await import('../api/voice.js');
  const saved = process.env.ELEVENLABS_API_KEY; process.env.ELEVENLABS_API_KEY = 'test';
  try { assert.equal((await voice({ kind: 'narrate', id: 'tour-nowhere', lang: 'en' })).status, 400); }
  finally { if (saved === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = saved; }
  assert.match(fs.readFileSync(new URL('../api/voice.js', import.meta.url), 'utf8'), /extra: \[\.\.\.tourClips\(\)/);
  assert.match(fs.readFileSync(new URL('../tools/make-voice.mjs', import.meta.url), 'utf8'), /extra: \[\.\.\.tourClips\(\)/);
});

// A fake world: flights take 1.6 s, speech lasts as long as its text · 模拟环境
function world({ voice = true, stuck = false } = {}) {
  const w = { t: 0, flyUntil: 0, speakUntil: 0, flown: [], said: [], hushed: 0, ended: null };
  w.tour = createTour({
    fly: st => { w.flown.push(st.key); w.flyUntil = w.t + 1600; },
    busy: () => w.t < w.flyUntil,
    say: st => { w.said.push(st.key); if (voice) w.speakUntil = w.t + (stuck ? 1e9 : 3000); },
    speaking: () => w.t < w.speakUntil,
    hush: () => { w.hushed++; w.speakUntil = 0; },
    voiceOn: () => voice,
    onEnd: f => { w.ended = f; },
  });
  w.run = ms => { for (let end = w.t + ms; w.t < end; w.t += 50) w.tour.tick(w.t); };
  return w;
}
test('the runner plays every step in order and ends by itself', () => {
  const w = world(); w.tour.start(0); w.run(10 * 60 * 1000);
  const keys = tourSteps().map(s => s.key);
  assert.deepEqual(w.said, keys); assert.equal(w.ended, true); assert.equal(w.tour.active, false);
});
test('it waits for the camera before speaking, and for the speech before moving on', () => {
  const w = world(); w.tour.start(0); w.run(1500);
  assert.equal(w.said.length, 0, 'still flying');
  w.run(400); assert.deepEqual(w.said, ['tour-intro']);
  w.run(2000); assert.equal(w.flown.length, 1, 'still speaking');
});
test('pause stops the voice; resume flies back and repeats the line; stop ends it', () => {
  const w = world(); w.tour.start(0); w.run(2000);
  w.tour.pause(); assert.equal(w.tour.paused, true); assert.ok(w.hushed >= 1);
  const n = w.said.length; w.run(20000); assert.equal(w.said.length, n, 'nothing happens while paused');
  w.tour.resume(w.t); assert.equal(w.flown.at(-1), 'tour-intro'); w.run(2500); assert.equal(w.said.at(-1), 'tour-intro');
  w.tour.stop(); assert.equal(w.tour.active, false); assert.equal(w.ended, false);
});
test('voice off: each line stays up for its reading time; a voice that never ends does not stall the tour', () => {
  const q = world({ voice: false }); q.tour.start(0); q.run(2400 + readMs(TOUR_LINES.intro.en) - 200); assert.equal(q.said.length, 1);
  q.run(5000); assert.ok(q.said.length >= 2);
  const s = world({ stuck: true }); s.tour.start(0); s.run(60000); assert.ok(s.said.length >= 2, 'moved on after the timeout');
});
test('main.js wires the tour: own narration, back/Esc stop, pause on input, ladder row, VR panel and menu', () => {
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  // the tour's own narration replaces the auto one only while it plays; paused = normal narration · 暂停时恢复普通朗读
  assert.match(src, /focus === b && !\(tour\?\.active && !tour\.paused\)\) narrate\(id\)/);
  assert.match(src, /journey\.piece \|\| \(tour\?\.active && !tour\.paused\)\) return;/);
  assert.match(src, /if \(tour\?\.active && !tour\.paused\) return tourPanel/);
  assert.match(src, /hand\.offLadder = now/); assert.doesNotMatch(src, /tour\??\.pause\(\)/);
  assert.match(src, /function back\(\) \{\s*if \(tour\?\.active\) \{ tour\.stop\(\); return; \}/);
  assert.match(src, /tour\?\.pause\(performance\.now\(\)\); zoomBy/);                              // wheel pauses
  assert.match(src, /data-go="T:tour"/); assert.match(src, /id: 'T:tour'/);    // page ladder + VR menu
  assert.match(src, /tour\.tick\(performance\.now\(\)\)/);
  assert.match(fs.readFileSync(new URL('../build-standalone.mjs', import.meta.url), 'utf8'), /'tour', ('demo', )?'welcome', 'main'/);
});
test('a tour left paused ends by itself; turning the voice on mid-stop does not stall it; the fist hint says stop', () => {
  const w = world(); w.tour.start(0); w.run(2000); w.tour.pause(w.t);
  w.run(PAUSE_LIMIT - 1000); assert.equal(w.tour.active, true);
  const h = w.hushed; w.run(2000); assert.equal(w.tour.active, false); assert.equal(w.ended, false);
  assert.equal(w.hushed, h, 'auto-stop of a paused tour does not cut the narration the visitor started');
  let on = false; const v = { t: 0 }; const said = [];
  const t = createTour({ fly() {}, say: st => said.push(st.key), voiceOn: () => on, speaking: () => false });
  t.start(0); for (; v.t < 1000; v.t += 50) t.tick(v.t); on = true;
  for (; v.t < 1000 + readMs(TOUR_LINES.intro.en) + 1500; v.t += 50) t.tick(v.t);
  assert.ok(said.length >= 2, 'moved on after the reading time');
  for (const l of LANGS) assert.match(TOUR_UI.hint[l], /✊/);
  assert.match(TOUR_UI.hint.en, /hold ✊.*stops/);
});
