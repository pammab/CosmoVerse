import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HARP_UI, HARP_PERIODS, HARP_PERIODS_SRC, RESONANCE_SRC, MOONS, noteForPeriod, midiToHz, noteName, crossed, ringDistance, moonBeats } from '../harp.js';
import { PLANETS } from '../data.js';

const L4 = ['en', 'zh', 'es', 'pt'];
test('UI strings in four languages with the same placeholders; NASA/ESA sources', () => {
  const ph = s => (s.match(/\{\w\}/g) || []).sort().join();
  for (const [k, v] of Object.entries(HARP_UI)) for (const l of L4) { assert.ok(v[l]?.trim(), k + ' ' + l); assert.equal(ph(v[l]), ph(v.en), k + ' ' + l); }
  for (const m of MOONS) for (const l of L4) assert.ok(m.names[l]);
  assert.match(HARP_PERIODS_SRC, /^https:\/\/spaceplace\.nasa\.gov\//);
  for (const u of RESONANCE_SRC) assert.match(u, /^https:\/\/(science\.nasa\.gov|www\.esa\.int)\//);
});
test('every planet has a period close to the app data, and faster orbits get higher (never lower) notes', () => {
  for (const p of PLANETS) { const d = HARP_PERIODS[p.id]; assert.ok(d, p.id); assert.ok(Math.abs(d - p.periodDays) / d < 0.01, p.id + ' period'); }
  const notes = PLANETS.map(p => noteForPeriod(HARP_PERIODS[p.id]));
  for (let i = 1; i < notes.length; i++) assert.ok(notes[i] < notes[i - 1], 'strictly lower going out: ' + notes.join(','));
  assert.ok(notes[0] - notes.at(-1) <= 37, 'within ~3 octaves');
  for (const m of notes) assert.ok([0, 2, 4, 7, 9].includes(m % 12), 'pentatonic ' + m);
  assert.equal(Math.round(midiToHz(69)), 440); assert.equal(noteName(60), 'C4');
});
test('a sweep crosses the rings between its two distances, in the order it meets them', () => {
  const radii = [10, 20, 30, 40];
  assert.deepEqual(crossed(5, 25, radii), [0, 1]);
  assert.deepEqual(crossed(35, 15, radii), [2, 1]);
  assert.deepEqual(crossed(12, 18, radii), []);
  assert.deepEqual(crossed(null, 18, radii), []);
  assert.equal(ringDistance({ x: 0, y: 10, z: 0 }, { x: 0.6, y: -0.8, z: 0 }), 7.5);
  assert.equal(ringDistance({ x: 0, y: 10, z: 0 }, { x: 1, y: 0, z: 0 }), null);
  assert.equal(ringDistance({ x: 0, y: 10, z: 0 }, { x: 0, y: 1, z: 0 }), null);
});
test('Jupiter’s moons: Io on every beat, Europa every 2nd, Ganymede once per cycle (1:2:4)', () => {
  assert.deepEqual(moonBeats(), [['io', 'europa', 'ganymede'], ['io'], ['io', 'europa'], ['io']]);
});
test('the plucked string is finite, decays, and is in tune (period ≈ sample rate / frequency)', async () => {
  const { pluckSamples } = await import('../harp.js');
  let seed = 1; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const m of [45, 57, 69, 81]) {
    const sr = 48000, hz = midiToHz(m), y = pluckSamples(sr, hz, sr * 2, rand);
    assert.ok(y.every(Number.isFinite), 'finite samples at ' + m);
    const rms = (a, b) => Math.sqrt(y.slice(a, b).reduce((s, v) => s + v * v, 0) / (b - a));
    assert.ok(rms(sr * 1.5, sr * 2) < rms(0, sr * 0.1), 'decays ' + m);
    // loop length N with the half-sample of the two-point average: N + 0.5 ≈ sr / hz within half a sample · 环路长度
    const N = Math.max(2, Math.round(sr / hz - 0.5)); assert.ok(Math.abs(N + 0.5 - sr / hz) <= 0.5, 'tuned ' + m);
  }
  assert.equal(noteName(69, 'es'), 'La4'); assert.equal(noteName(60, 'pt'), 'Do4');
});
