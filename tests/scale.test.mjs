// Scale readout: every level, sourced, 4 languages; level factors; the true-scale explainer numbers · 尺度读数测试
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refsHTML } from '../references.js';
import { SCALES, UI, factorBetween, fmtFactor, TRUE_SCALE, whyText, WHY_SOURCES } from '../scale.js';
import { LEVEL_IDS } from '../journey.js';
import { readFileSync } from 'node:fs';
const OK = /^https:\/\/([\w-]+\.)*(nasa\.gov|esa\.int|eso\.org|esahubble\.org|esawebb\.org|stsci\.edu)\//;

test('every level has a sourced readout in EN/zh/ES/PT', () => {
  for (const id of LEVEL_IDS) {
    const s = SCALES[id]; assert.ok(s, id);
    for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(s.text[l]?.trim(), id + l);
    assert.match(s.source?.url || '', OK, id + ' source');
    assert.ok(s.across > 0);
  }
  for (const k of Object.keys(UI)) for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(UI[k][l], k + l);
});

test('factors between neighbouring levels (one significant figure)', () => {
  const f = (a, b) => { const r = factorBetween(a, b); return [fmtFactor(r.times, 'en'), r.out]; };
  assert.deepEqual(f('universe', 'supercluster'), ['200', false]);      // 92 billion / 500 million ≈ 184
  assert.deepEqual(f('supercluster', 'local-group'), ['50', false]);
  assert.deepEqual(f('local-group', 'galaxy'), ['100', false]);
  assert.deepEqual(f('galaxy', 'neighbourhood'), ['8', false]);         // 100,000 / 13,000
  assert.deepEqual(f('solar-system', 'neighbourhood'), ['10 million', true]);
  assert.equal(fmtFactor(1.37e7, 'zh'), '1000万'); assert.equal(fmtFactor(1.37e7, 'pt'), '10 milhões');
  assert.equal(factorBetween('galaxy', 'galaxy'), null);
});

test('"Why not to scale?": Earth = 1 mm → Sun ~12 m, Proxima ~3,150 km (NASA values)', () => {
  // 150e6 km / 12,756 km = 11,759 mm; 4.25 ly × 9.46e12 km / 12,756 km = 3.15e9 mm
  assert.deepEqual(TRUE_SCALE, { sunM: 12, proximaKm: 3150 });
  for (const l of ['en', 'zh', 'es', 'pt']) { const t = whyText(l); assert.match(t, /12/); assert.match(t, /3[.,]?150/); }
  for (const s of WHY_SOURCES) assert.match(s.url, OK);
});

test('main.js shows the readout, the counter and the VR panel line', () => {
  const src = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /scaleTick\(now\)/); assert.match(src, /SCALES\[lv\.id\]\.text/);
  // "Why not to scale?" moved from the readout to 📚 References (Pamela, Nov 18: discreet) · 说明移到参考资料
  assert.doesNotMatch(src, /swhy|openWhy/);
  const refs = refsHTML(o => o.en, (o, v) => o);
  assert.match(refs, /id="refsScale"/); assert.ok(refs.includes(whyText('en'))); for (const s of WHY_SOURCES) assert.ok(refs.includes(s.url));
  assert.match(whyText('en'), /true sizes compared with each other.*distances between them are squeezed/);
  assert.match(readFileSync(new URL('../index.html', import.meta.url), 'utf8'), /id="scaleRead"/);
});
