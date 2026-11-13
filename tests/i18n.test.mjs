// Tests: every language is complete · 每种语言都完整 · Portuguese (pt) has the same coverage as Spanish.
// Run: node --test tests/   (no browser needed)
import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGS, ES, PT, ptText } from '../i18n.js';
import { BODIES } from '../data.js';
import { NARRATION } from '../narration-text.js';

test('Portuguese is in the language menu list', () => {
  assert.deepEqual(Object.keys(LANGS), ['en', 'zh', 'es', 'pt']);
});

test('every Spanish dictionary entry also has a Portuguese one', () => {
  const missing = Object.keys(ES).filter(k => !PT[k]);
  assert.deepEqual(missing, []);
});

test('every planet name, type, fact, description and feature has Portuguese', () => {
  for (const b of BODIES) {
    assert.ok(b.pt, `${b.id} needs a pt name`);
    const texts = [b.type[0], b.descEn, b.featureEn, ...b.facts.flatMap(f => [f[0], f[2]])];
    for (const t of texts) if (/[a-z]{2}/i.test(t)) assert.ok(PT[t], `${b.id}: no Portuguese for "${t}"`);
  }
});

test('every narration has en, zh, es and pt', () => {
  for (const [id, lines] of Object.entries(NARRATION)) {
    assert.equal(lines.length, 4, id);
    lines.forEach((l, i) => assert.ok(l && l.length > 40, `${id}[${i}]`));
  }
});

test('ptText falls back to Brazilian number format and units', () => {
  assert.equal(ptText('1,392,700 km · 0.5 AU · 3 days'), '1.392.700 km · 0,5 UA · 3 dias');
  assert.equal(ptText('Diameter'), 'Diâmetro');
});
