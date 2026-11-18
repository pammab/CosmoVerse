import test from 'node:test'; import assert from 'node:assert/strict';
import { blackBody, yearDays, gravityVsEarth, planetResult, sanitizePlanet, PM_UI, PM_NOTES, PM_QUIZ, PM_SRC, PM_PRESETS } from '../planetmaker.js';
const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);
test('black-body temperature matches NASA fact sheets for real planets', () => {
  near(blackBody(1, 0.294), 254.0, 0.1);              // Earth
  near(blackBody(228.0 / 149.6, 0.25), 209.8, 2);     // Mars
  near(blackBody(108.2 / 149.6, 0.77), 226.6, 2);     // Venus
  near(blackBody(778.5 / 149.6, 0.343), 109.9, 2);    // Jupiter
  near(blackBody(4515 / 149.6, 0.29), 46.6, 1);       // Neptune
  near(blackBody(57.9 / 149.6, 0.068), 439.6, 4);     // Mercury
});
test('Kepler year and gravity', () => {
  near(yearDays(1), 365.25, 0.01); near(yearDays(228.0 / 149.6), 687.0, 3); near(yearDays(778.5 / 149.6), 4331, 15);
  near(gravityVsEarth('rocky', 1), 1, 0.001); near(gravityVsEarth('gas', 69911 / 6371) * 9.8, 25.4, 2);   // Jupiter ~24.8 (equatorial 23.1)
});
test('an Earth twin at 1 AU is about 15 °C with possible liquid water, inside the habitable zone', () => {
  const r = planetResult({ kind: 'rocky', au: 1, r: 1, atmo: 'earth' }, [{ id: 'earth', au: 1, r: 1 }, { id: 'mars', au: 1.52, r: 0.53 }]);
  near(r.tC, 15, 1); assert.equal(r.water, 'yes'); assert.ok(r.notes.includes('hzIn')); assert.equal(r.like, 'earth'); assert.equal(r.useDays, true);
});
test('warnings: hot Jupiter, giant inside the snow line, belt, Kuiper, Venus-like, no air', () => {
  assert.ok(planetResult({ kind: 'gas', au: 0.2, r: 11, atmo: 'earth' }).notes.includes('hotJupiter'));
  assert.ok(planetResult({ kind: 'gas', au: 2, r: 11, atmo: 'earth' }).notes.includes('giantInside'));
  assert.ok(planetResult({ kind: 'rocky', au: 2.5, r: 1, atmo: 'thin' }).notes.includes('belt'));
  const k = planetResult({ kind: 'rocky', au: 40, r: 0.5, atmo: 'none' }); assert.ok(k.notes.includes('kuiper') && k.notes.includes('icyRock')); assert.equal(k.water, 'noAir');
  const v = planetResult({ kind: 'rocky', au: 0.7, r: 1, atmo: 'thick' }); assert.ok(v.notes.includes('venusLike')); assert.equal(v.water, 'boil');
  assert.equal(planetResult({ kind: 'ice', au: 20, r: 4, atmo: 'none' }).water, 'giant');
  assert.ok(!planetResult({ kind: 'rocky', au: 1.6, r: 1, atmo: 'earth' }).notes.includes('belt'));
  assert.ok(!planetResult({ kind: 'rocky', au: 5, r: 1, atmo: 'earth' }).notes.includes('belt'));
});
test('greenhouse scales with sunlight: Venus-like air far out stays frozen; real planets come back', () => {
  assert.equal(planetResult({ kind: 'rocky', au: 40, r: 1, atmo: 'thick' }).water, 'frozen');
  assert.equal(planetResult({ kind: 'rocky', au: 10, r: 1, atmo: 'thick' }).water, 'frozen');
  near(planetResult({ kind: 'rocky', au: 108.2 / 149.6, r: 0.95, atmo: 'thick' }).tC, 464, 10);   // Venus ~464 °C
  near(planetResult({ kind: 'rocky', au: 228 / 149.6, r: 0.53, atmo: 'thin' }).tC, -59, 4);      // Mars ~-59 °C
  assert.equal(planetResult({ kind: 'rocky', au: 0.9, r: 1, atmo: 'thin' }).water, 'thin');
  const edge = planetResult({ kind: 'rocky', au: 1.5, r: 1, atmo: 'earth' }); assert.equal(edge.water, 'frozen'); assert.ok(edge.notes.includes('hzIn') && edge.notes.includes('hzEdge'));
});
test('super-Earth by mass (NASA: up to 10 Earth masses); giant gravity near the real planets', () => {
  assert.ok(planetResult({ kind: 'rocky', au: 1, r: 1.3, atmo: 'earth' }).notes.includes('superEarth'));
  assert.ok(!planetResult({ kind: 'rocky', au: 1, r: 1.1, atmo: 'earth' }).notes.includes('superEarth'));
  near(gravityVsEarth('gas', 9.45), 9.0 / 9.8, 0.3); near(gravityVsEarth('gas', 10.97), 24.8 / 9.8, 0.3); near(gravityVsEarth('ice', 3.88), 11.0 / 9.8, 0.05);
});
test('sanitize: bad stored data is clamped or dropped', () => {
  assert.equal(sanitizePlanet(null), null); assert.equal(sanitizePlanet([1]), null);
  const s = sanitizePlanet({ kind: 'x', au: 'a', r: 99, atmo: '<b>', moons: 9, color: 'red', name: '<img src=x onerror=1>Hi\u0000' });
  assert.equal(s.kind, 'rocky'); assert.equal(s.au, 1.3); assert.equal(s.r, 2); assert.equal(s.atmo, 'earth'); assert.equal(s.moons, 4); assert.ok(!/[<>]/.test(s.name));
  for (const p of Object.values(PM_PRESETS)) assert.deepEqual(sanitizePlanet(p), { name: '', ...p });
});
test('every text in 4 languages, every note and question has a source', () => {
  const walk = o => { if (o && typeof o === 'object' && 'en' in o) { for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(o[l], JSON.stringify(o)); return; } if (o && typeof o === 'object') Object.values(o).forEach(walk); };
  walk(PM_UI); walk(PM_NOTES); walk(PM_QUIZ);
  for (const [, src] of Object.values(PM_NOTES)) assert.ok(PM_SRC[src]); for (const q of PM_QUIZ) assert.ok(PM_SRC[q.src]);
});
import { planetAge } from '../planetmaker.js';
test('your planet ages: Kepler year, sped up past 30 days (one of its years per 7 of your days), real time below', () => {
  const day = 864e5, born = Date.UTC(2026, 10, 1);
  const earthish = planetAge({ au: 1, born }, born + 15.5 * day);
  assert.equal(earthish.fast, true); assert.equal(earthish.years, 2); assert.equal(earthish.yearLen, 365); near(earthish.day, Math.floor(1.5 / 7 * 365.25) + 1, 1); assert.equal(earthish.nextIn, 6);
  const hot = planetAge({ au: 0.1, born }, born + 25 * day);   // 0.1 AU: ~11.5-day year, real time
  assert.equal(hot.fast, false); assert.equal(hot.years, 2); assert.equal(hot.yearLen, 12);
  assert.equal(planetAge({ au: 1 }), null);
  assert.equal(sanitizePlanet({ au: 1, born: 'x' }).born, undefined); assert.equal(sanitizePlanet({ au: 1, born: 5 }).born, undefined);
  assert.equal(sanitizePlanet({ au: 1, born, seen: 3 }).seen, 3);
});
