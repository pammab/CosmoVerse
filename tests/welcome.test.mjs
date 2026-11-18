import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WELCOME } from '../welcome.js';

const all4 = (o, where) => { for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(typeof o?.[l] === 'string' && o[l].trim(), `${where}.${l}`); };
test('welcome text exists in all four languages', () => {
  for (const k of ['title', 'line', 'tryThese', 'start', 'close', 'help', 'vrHint']) all4(WELCOME[k], k);
  WELCOME.tries.forEach((t, i) => { all4(t.text, `tries[${i}].text`); all4(t.how, `tries[${i}].how`); });
  WELCOME.vr.forEach(([a, b], i) => { all4(a, `vr[${i}][0]`); all4(b, `vr[${i}][1]`); });
});
test('three things to try: fly home to the Solar System, open a planet, ask Cosmo', () => {
  assert.deepEqual(WELCOME.tries.map(t => t.act), ['solar', 'planet', 'cosmo']);
});
test('the one-line pitch says what it is', () => {
  assert.match(WELCOME.line.en, /planetarium in your hands/i);
});
