import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BS_STARS, BS_UI, birthdayStar, validYear, bsFill, fmtLy } from '../birthday.js';

const L4 = ['en', 'zh', 'es', 'pt'];
const SOURCES = /^https:\/\/((science|www|apod)\.nasa\.gov|www\.jpl\.nasa\.gov|www\.cosmos\.esa\.int|www\.esa\.int|esawebb\.org|www\.eso\.org)\//;

test('every star: unique id, 4-language name and fact, a NASA/ESA/ESO source, sorted by distance', () => {
  const ids = new Set();
  BS_STARS.forEach((s, i) => {
    assert.ok(!ids.has(s.id), 'unique ' + s.id); ids.add(s.id);
    for (const k of ['names', 'fact']) for (const l of L4) assert.ok(s[k][l]?.trim(), `${s.id}.${k}.${l}`);
    assert.match(s.src, SOURCES, s.id); if (s.also) assert.match(s.also, SOURCES, s.id + ' also');
    assert.ok(s.ly > 4 && s.ly < 140, s.id); assert.equal(typeof s.planets, 'boolean');
    assert.match(s.color, /^#[0-9a-f]{6}$/i);
    if (i) assert.ok(BS_STARS[i - 1].ly < s.ly, 'sorted at ' + s.id);
  });
  // No age between 5 and 100 is more than 5 years from a star (the match always feels close) · 5–100 岁之间都有接近的星
  for (let age = 5; age <= 100; age++) assert.ok(Math.min(...BS_STARS.map(s => Math.abs(s.ly - age))) <= 5, 'gap at age ' + age);
});

test('UI strings: all four languages, same placeholders', () => {
  for (const [k, v] of Object.entries(BS_UI)) {
    for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
    const ph = s => (s.match(/\{\w\}/g) || []).sort().join();
    for (const l of L4) assert.equal(ph(v[l]), ph(v.en), `${k} ${l} placeholders`);
  }
});

test('matching: closest star to your age, the year its light left, and the next star', () => {
  const now = new Date(2026, 10, 18);
  const r = birthdayStar(2000, now);   // 26 → GJ 486 (26 ly)
  assert.equal(r.age, 26); assert.equal(r.star.id, 'gj486'); assert.equal(r.leftYear, 2000);
  assert.equal(r.next.id, 'gj357'); assert.equal(r.nextYear, 2031);
  const r2 = birthdayStar(1986, now);   // 40 → TRAPPIST-1
  assert.equal(r2.star.id, 'trappist1'); assert.equal(r2.leftYear, 1986); assert.equal(r2.next.id, '55cnc'); assert.equal(r2.nextYear, 2027);
  const r3 = birthdayStar(2015, now);   // 11 → Ross 128 (11)
  assert.equal(r3.star.id, 'ross128');
});

test('edge cases: babies, very old, and the year rules', () => {
  const now = new Date(2026, 10, 18);
  const baby = birthdayStar(2025, now);
  assert.ok(baby.young); assert.equal(baby.star, null); assert.equal(baby.next.id, 'proxima'); assert.equal(baby.nextYear, 2029);
  const elder = birthdayStar(1880, now);   // only reachable past the form's limits; the logic still copes · 超出表单范围时逻辑仍可用
  const oldest = birthdayStar(1900, now); assert.ok(!oldest.old); assert.equal(oldest.star.id, 'hr8799'); assert.equal(oldest.next, null);
  assert.ok(elder.old); assert.equal(elder.star.id, 'hr8799'); assert.equal(elder.next, null);
  assert.ok(validYear(1990, now)); assert.ok(validYear(1925, now)); assert.ok(!validYear(1924, now)); assert.ok(!validYear(2027, now)); assert.ok(!validYear(1990.5, now));
  assert.equal(bsFill(BS_UI.bad, { a: 1925, b: 2026 }).en, 'Enter a year between 1925 and 2026.');
  assert.equal(fmtLy(4.2, 'pt'), '4,2'); assert.equal(fmtLy(4.2, 'en'), '4.2');
});
