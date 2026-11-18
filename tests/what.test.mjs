import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LANDMARKS, uvToUnit } from '../landmarks.js';
import { WHAT_UI, whatQuestion } from '../what.js';
import fs from 'node:fs';

const L4 = ['en', 'zh', 'es', 'pt'];
test('landmarks: 4 languages, a JPL source, a map position', () => {
  const ids = Object.values(LANDMARKS).flat().map(l => l.id);
  assert.deepEqual(ids.sort(), ['great-red-spot', 'olympus-mons', 'saturn-hexagon', 'valles-marineris']);
  for (const lm of Object.values(LANDMARKS).flat()) {
    for (const k of ['names', 'text']) for (const l of L4) assert.ok(lm[k][l]?.trim(), `${lm.id}.${k}.${l}`);
    assert.match(lm.source.url, /^https:\/\/www\.jpl\.nasa\.gov\//);
    for (const c of lm.uv) assert.ok(c >= 0 && c <= 1, lm.id + ' uv');
  }
  for (const l of L4) assert.match(LANDMARKS.mars[0].text[l], /27/);   // numbers survive translation · 数字在翻译中保留
});
test('map position → sphere point (three.js SphereGeometry layout)', () => {
  const close = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
  assert.ok(close(uvToUnit([0.5, 0]), [0, 1, 0]));        // top of the map = north pole · 北极
  assert.ok(close(uvToUnit([0, 0.5]), [-1, 0, 0]));       // u 0 on the equator
  assert.ok(close(uvToUnit([0.25, 0.5]), [0, 0, 1]));
  const om = uvToUnit(LANDMARKS.mars[0].uv); assert.ok(om[1] > 0.25 && om[1] < 0.35, 'Olympus Mons ~18°N');
});
test('card text: 4 languages; every moon and spacecraft already has a fact to show', () => {
  for (const [k, v] of Object.entries(WHAT_UI)) for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
  const q = whatQuestion({ en: 'Phobos', zh: '火卫一', es: 'Fobos', pt: 'Fobos' }, { en: 'Mars', zh: '火星', es: 'Marte', pt: 'Marte' });
  for (const l of L4) assert.ok(q[l].includes({ en: 'Phobos', zh: '火卫一', es: 'Fobos', pt: 'Fobos' }[l]));
  // highlights.js imports three (not in node): check the wiring in its source · 检查源码中的连接
  const hl = fs.readFileSync(new URL('../highlights.js', import.meta.url), 'utf8');
  assert.match(hl, /type: 'moon', [^\n]*text: \[m\[7\], m\[8\], m\[9\], moonPT\(m\)\[1\]\]/); assert.match(hl, /type: 'craft', [^\n]*text: C\.text/); assert.match(hl, /type: 'spot'/);
});
