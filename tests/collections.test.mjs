import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COLL_UI, COLLECTIONS, GALAXY_PIECES, NEBULA_PIECES, MISSIONS, MISSIONS_PER_WEEK, collectionProgress, newlyComplete, weekKey, weekMissions, completeMissions } from '../collections.js';
import { LANDMARKS } from '../landmarks.js';
import { PIECES } from '../pieces/index.js';
import { PLANETS } from '../data.js';

const L4 = ['en', 'zh', 'es', 'pt'];
const SOURCES = /^https:\/\/([a-z0-9-]+\.)*(nasa\.gov|esa\.int|eso\.org|esahubble\.org|esawebb\.org|noirlab\.edu|stsci\.edu|iau\.org)\//;
test('collections and missions: every string in four languages', () => {
  for (const [k, v] of Object.entries(COLL_UI)) for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
  for (const c of COLLECTIONS) for (const l of L4) assert.ok(c.names[l]?.trim(), c.id + ' ' + l);
  for (const m of MISSIONS) for (const l of L4) assert.ok(m.text[l]?.trim(), m.id + ' ' + l);
});
test('every mission targets something that exists and cites an allowed source', () => {
  const spots = new Set(Object.values(LANDMARKS).flat().map(x => 'spot-' + x.id)), pieces = new Set(PIECES.map(p => 'P:' + p.id)), planets = new Set(PLANETS.map(p => 'B:' + p.id));
  const ids = new Set();
  for (const m of MISSIONS) {
    assert.ok(!ids.has(m.id), 'unique id ' + m.id); ids.add(m.id);
    assert.ok(spots.has(m.target) || pieces.has(m.target), m.id + ' target ' + m.target);
    if (m.target.startsWith('spot-')) assert.ok(planets.has(m.fly), m.id + ' flies to the planet');
    assert.match(m.source.url, SOURCES, m.id); assert.ok(m.source.name);
    // a landmark mission cites the same page as the landmark's own text · 地标任务与地标本身引用同一页面
    if (m.target.startsWith('spot-')) assert.equal(Object.values(LANDMARKS).flat().find(x => 'spot-' + x.id === m.target).source.url, m.source.url, m.id);
  }
  for (const id of [...GALAXY_PIECES, ...NEBULA_PIECES]) assert.ok(pieces.has(id), id);
});
test('mission numbers match the cited piece fact', () => {
  const fact = (piece, re) => PIECES.find(p => p.id === piece).facts.find(f => re.test(f.value.en));
  assert.ok(fact('andromeda', /2\.5 million/)); assert.ok(fact('sgr-a-star', /4 million/)); assert.ok(fact('m87', /2,000 galaxies/)); assert.ok(fact('pleiades', /100 million/));
  for (const m of MISSIONS) for (const l of ['en', 'es', 'pt']) { const n = m.text.en.match(/\d[\d.,]*/g) || []; assert.equal((m.text[l].match(/\d/g) || []).length > 0, n.length > 0, m.id + ' ' + l + ' keeps its number'); }
});
test('ISO week keys (Monday start, week 1 holds the first Thursday)', () => {
  assert.equal(weekKey(new Date(2026, 10, 17)), '2026-W47');
  assert.equal(weekKey(new Date(2026, 10, 16)), '2026-W47');   // Monday
  assert.equal(weekKey(new Date(2026, 10, 15)), '2026-W46');   // Sunday
  assert.equal(weekKey(new Date(2021, 0, 1)), '2020-W53');
  assert.equal(weekKey(new Date(2024, 11, 30)), '2025-W01');
});
test('weekly missions: deterministic, distinct, and the whole pool comes round', () => {
  assert.deepEqual(weekMissions('2026-W47'), weekMissions('2026-W47'));
  const seen = new Set();
  for (let w = 1; w <= 52; w++) { const list = weekMissions(`2026-W${String(w).padStart(2, '0')}`); assert.equal(list.length, MISSIONS_PER_WEEK); assert.equal(new Set(list.map(m => m.id)).size, list.length); list.forEach(m => seen.add(m.id)); }
  assert.equal(seen.size, MISSIONS.length);
  assert.deepEqual(weekMissions('nonsense'), []);
});
test('completing missions: only this week\'s targets, once; a new week starts empty', () => {
  const week = '2026-W47', [a, b] = weekMissions(week), st = { week: null, done: [] };
  assert.deepEqual(completeMissions(st, 'P:nowhere', week), []);
  assert.deepEqual(completeMissions(st, a.target, week).map(m => m.id), [a.id]);
  assert.deepEqual(completeMissions(st, a.target, week), []);
  completeMissions(st, b.target, week); assert.equal(st.done.length, 2);
  completeMissions(st, 'P:nowhere', '2026-W48'); assert.deepEqual(st, { week: '2026-W48', done: [] });
});
test('collection progress and newly completed collections', () => {
  const items = { planets: [{ key: 'B:mars' }, { key: 'B:venus' }], moons: [{ key: 'moon-io' }], galaxies: [] };
  const before = collectionProgress(items, k => k === 'B:mars'), after = collectionProgress(items, k => k === 'B:mars' || k === 'B:venus');
  assert.equal(before.find(c => c.id === 'planets').n, 1); assert.equal(after.find(c => c.id === 'planets').done, true);
  assert.equal(after.find(c => c.id === 'galaxies').done, false, 'an empty collection is never complete');
  assert.deepEqual(newlyComplete(before, after).map(c => c.id), ['planets']); assert.deepEqual(newlyComplete(after, after), []);
});
test('main.js wires collections into the logbook, What is this? and VR', () => {
  const src = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /if \(speak\) seenTick\(it\.key\)/); assert.match(src, /missionsHTML\(\)/); assert.match(src, /collectionsHTML\(\)/);
  assert.match(src, /\/\^O:m\\d\$\/\.test\(id\)/); assert.match(src, /progressTick\(here, collBefore\)/);
  // user-visible mission text goes through quad/tr, source URLs through the escaper · 文字经 quad/tr，链接经转义
  assert.match(src, /href="\$\{logEsc\(m\.source\.url\)\}"/);
});
test('done count ignores ids that are not this week\'s missions (stored data is untrusted)', async () => {
  const { doneCount } = await import('../collections.js');
  const week = '2026-W47', ids = weekMissions(week).map(m => m.id);
  assert.equal(doneCount({ week, done: ['x', 'y', 'z'] }, week), 0);
  assert.equal(doneCount({ week, done: [ids[0], 'x'] }, week), 1);
  assert.equal(doneCount({ week: '2026-W46', done: ids }, week), 0);
  for (const l of L4) assert.match(COLL_UI.vrRow[l], /\{n\}/);
});
