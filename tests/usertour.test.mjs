import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { UT_UI, UT_MAX_STOPS, UT_MAX_TEXT, encodeTour, decodeTour, tourFromHash, sanitizeTour } from '../usertour.js';

const L4 = ['en', 'zh', 'es', 'pt'];
test('editor and player text in four languages', () => {
  for (const [k, v] of Object.entries(UT_UI)) for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
});
test('a tour round-trips through the link, including any language and emoji', () => {
  const t = { t: 'Minha viagem 🚀 太空', s: [['L:universe', ''], ['B:mars', 'Olha o Monte Olimpo!'], ['P:pillars-of-creation', '柱子']] };
  const code = encodeTour(t); assert.match(code, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeTour(code), t);
  assert.deepEqual(tourFromHash('#tour=' + code), t);
  assert.equal(tourFromHash('#other=1'), null, 'no tour in the link');
  assert.equal(tourFromHash('#tour=@@@'), false, 'a damaged link says so');
});
test('untrusted input is cleaned: unknown places, long text, control characters, too many stops', () => {
  const evil = { t: '<img src=x onerror=alert(1)>'.repeat(5), s: [['B:mars', 'x'.repeat(999)], ['X:mars', 'bad'], ['B:<script>', 'bad'], ['B:pluto', 'not a place'], ...Array.from({ length: 20 }, () => ['B:earth', 'a\u0000b\nc'])] };
  const t = sanitizeTour(evil, id => id !== 'B:pluto');
  assert.ok(t.t.length <= 60);
  assert.equal(t.s[0][1].length, UT_MAX_TEXT);
  assert.ok(t.s.every(([id]) => /^(L|B|P):[a-z0-9-]+$/.test(id) && id !== 'B:pluto'));
  assert.ok(t.s.length <= UT_MAX_STOPS);
  assert.equal(t.s[1][1], 'a b c');
  assert.equal(sanitizeTour({ s: [] }), null); assert.equal(sanitizeTour('nope'), null);
  assert.equal(decodeTour('A'.repeat(7000)), null, 'oversized links are refused');
});
test('main.js: user text never reaches innerHTML (value / textContent only)', () => {
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /ta\.value = text;/); assert.match(src, /\$\('#utName'\)\.value = utDraft\.t;/);
  assert.match(src, /querySelector\('#utStartTitle'\)\.textContent = shared\.t/);
  assert.doesNotMatch(src, /\$\{(?:text|utDraft\.t|shared\.t)\}/, 'no template interpolation of user text');
});
