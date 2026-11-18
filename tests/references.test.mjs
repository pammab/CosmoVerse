import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REF_UI, REF_POINTS, REF_LICENCES, REF_REUSE, REF_HOSTS, DATA_CHECKED, refsHTML } from '../references.js';

const L4 = ['en', 'zh', 'es', 'pt'];
const quad = o => L4.map(k => `<span class="${k}">${String(o[k]).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`).join('');
const fill = (o, v) => Object.fromEntries(Object.entries(o).map(([k, s]) => [k, Object.entries(v).reduce((t, [a, b]) => t.replaceAll('{' + a + '}', b), s)]));
test('every references string exists in four languages', () => {
  const all = [...Object.values(REF_UI), ...REF_LICENCES.filter(r => typeof r.who !== 'string').map(r => r.who), ...REF_POINTS.flatMap(p => [p.head, p.text]), ...REF_LICENCES.flatMap(r => [r.licence, r.what]), REF_REUSE.head, REF_REUSE.note, ...REF_REUSE.points];
  for (const o of all) for (const l of L4) assert.ok(o[l]?.trim(), JSON.stringify(o).slice(0, 60) + ' ' + l);
});
test('the panel says what Pamela asked: public info, sources, updates, AI, no endorsement, privacy, reuse and Meta', () => {
  const en = [...REF_POINTS.flatMap(p => [p.head.en, p.text.en]), ...REF_REUSE.points.map(p => p.en)].join(' ');
  for (const re of [/public/i, /source/i, /Our plan: check/, /once a week/, /once a month/, /microphone|speech recognition/, /Before any paid version/, /non-exclusive/, /AI/, /not affiliated/i, /logos/, /camera video is never uploaded/, /commercially/, /museum/, /Meta/]) assert.match(en, re);
  assert.match(DATA_CHECKED, /^\d{4}-\d{2}-\d{2}$/);
});
test('every link is an official licence page on an allowed host', () => {
  const urls = [...REF_LICENCES.flatMap(r => r.links.map(x => x[1])), REF_REUSE.rules];
  for (const u of urls) assert.match(u, REF_HOSTS, u);
  for (const r of REF_LICENCES) assert.ok(r.links.length > 0, r.who);
});
test('the card HTML escapes text and has the close button, the licences and the rules link', () => {
  const h = refsHTML(quad, fill);
  assert.match(h, /id="refsClose"/); assert.match(h, /id="refsTitle"/);
  assert.equal((h.match(/<li><b>/g) || []).length, REF_LICENCES.length);
  assert.match(h, /devpost\.com\/rules/); assert.match(h, /Last full check: 20\d\d-/);
  assert.doesNotMatch(h, /<script/i);
});
test('main.js: ☰ More button opens the card; VR row R:refs shows a panel', () => {
  const src = readFileSync(new URL('../main.js', import.meta.url), 'utf8'), html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="refsOpen"/); assert.match(src, /\$\('#refsOpen'\)\.onclick/); assert.match(src, /id: 'R:refs'/); assert.match(src, /if \(refsVR\) return refsPanel\(\)/);
});
