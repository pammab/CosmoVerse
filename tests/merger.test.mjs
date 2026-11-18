import test from 'node:test';
import assert from 'node:assert/strict';
import { whenText, createMergerSim, gyrAt, stageAt, SIM_END, SIM_PASS, SIM_MERGED, MERGE_UI, MERGE_SRC } from '../merger.js';

test('timeline follows the scenario: close pass at 4 billion years, one galaxy by 6', () => {
  assert.equal(gyrAt(0), 0); assert.equal(gyrAt(SIM_PASS), 4); assert.equal(gyrAt(SIM_MERGED), 6);
  for (let t = 0; t < SIM_END; t += 0.5) assert.ok(gyrAt(t + 0.5) > gyrAt(t), 'time only moves forward');
  assert.deepEqual([0, SIM_PASS, 25, SIM_END].map(stageAt), [0, 1, 2, 3]);
});

test('the two galaxies pass, swing back and merge', () => {
  const s = createMergerSim({ n: 200 }), dt = 0.02; let minFirst = 99, tFirst = 0;
  while (s.t < SIM_PASS + 4) { s.step(dt); const d = s.sep(); if (d < minFirst) { minFirst = d; tFirst = s.t; } }
  assert.ok(Math.abs(tFirst - SIM_PASS) < 2.5, 'first close pass near the 4-billion-year mark, got t=' + tFirst.toFixed(1));
  let maxAfter = 0; while (s.t < 21) { s.step(dt); maxAfter = Math.max(maxAfter, s.sep()); }
  assert.ok(maxAfter > minFirst * 1.5, 'they swing apart again after the first pass');
  while (s.t < SIM_END) s.step(dt);
  assert.ok(s.sep() < 0.6, 'one galaxy at the end, sep ' + s.sep().toFixed(2));
  assert.ok(s.pos.every(Number.isFinite) && s.vel.every(Number.isFinite), 'no NaN');
});

test('it is deterministic and every text is in four languages with sources', () => {
  const a = createMergerSim({ n: 50, seed: 3 }), b = createMergerSim({ n: 50, seed: 3 });
  for (let i = 0; i < 100; i++) { a.step(0.02); b.step(0.02); }
  assert.deepEqual([...a.pos.slice(0, 30)], [...b.pos.slice(0, 30)]);
  const walk = o => { if (o && typeof o === 'object' && 'en' in o) { for (const k of ['en', 'zh', 'es', 'pt']) assert.ok(typeof o[k] === 'string' || typeof o[k] === 'function', k); return; } if (o && typeof o === 'object') Object.values(o).forEach(walk); };
  walk(MERGE_UI);
  for (const u of Object.values(MERGE_SRC)) assert.match(u, /^https:\/\/(.*nasa\.gov|.*esa\.int|esahubble\.org)/);
});

test('time label reads right in every language', () => {
  assert.equal(whenText(4, 'en'), '≈ 4.0 billion years from now');
  assert.equal(whenText(4, 'zh'), '约 40 亿年后');
  assert.equal(whenText(5.5, 'es'), 'dentro de unos 5500 millones de años');
  assert.equal(whenText(1.2, 'pt'), 'daqui a ≈ 1,2 bilhão de anos');
  assert.equal(whenText(0, 'en'), '≈ 0.1 billion years from now');
  assert.equal(whenText(6, 'pt'), 'daqui a ≈ 6,0 bilhões de anos');
});

test('the simulation writes into an array handed to it (the drawn copy moves)', () => {
  const s = createMergerSim({ n: 100 }), drawn = new Float32Array(s.pos); s.pos = drawn;
  const before = drawn.slice(); for (let i = 0; i < 200; i++) s.step(0.02);
  let moved = 0; for (let i = 0; i < drawn.length; i++) if (Math.abs(drawn[i] - before[i]) > 1e-3) moved++;
  assert.ok(moved > drawn.length * 0.9, 'moved ' + moved);
});
