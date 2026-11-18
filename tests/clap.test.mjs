import test from 'node:test';
import assert from 'node:assert/strict';
import { ClapDetector, palmCentre } from '../xr-hands.js';

const P = x => ({ x, y: 1.2, z: -0.4 });
function run(c, frames) { let n = 0; for (const [d, t] of frames) if (c.push(P(-d / 2), P(d / 2), t)) n++; return n; }

test('a quick clap fires once', () => {
  const c = new ClapDetector(), f = []; for (let i = 0; i <= 10; i++) f.push([0.4 - i * 0.035, i / 72]);
  assert.equal(run(c, f), 1);
});
test('hands drifting slowly together do not fire', () => {
  const c = new ClapDetector(), f = []; for (let i = 0; i <= 300; i++) f.push([0.4 - i * 0.0012, i / 72]);
  assert.equal(run(c, f), 0);
});
test('hands that were never far apart do not fire; a second clap waits for the cooldown', () => {
  const c = new ClapDetector(); assert.equal(run(c, [[0.15, 0], [0.05, 0.05]]), 0);
  const d = new ClapDetector(), clap = t0 => Array.from({ length: 11 }, (_, i) => [0.4 - i * 0.035, t0 + i / 72]);
  assert.equal(run(d, [...clap(0), ...clap(0.6), ...clap(2.5)]), 2);
});
test('losing a hand resets; palm centre is between wrist and middle knuckle', () => {
  const c = new ClapDetector(); c.push(P(-0.2), P(0.2), 0); c.push(null, P(0), 0.1); assert.equal(c.push(P(-0.02), P(0.02), 0.15), false);
  assert.deepEqual(palmCentre({ x: 0, y: 0, z: 0 }, { x: 0.1, y: 0.2, z: 0 }), { x: 0.05, y: 0.1, z: 0 });
  assert.equal(palmCentre(null, { x: 0, y: 0, z: 0 }), null);
});

test('jittery hands closing slowly never fire; a hold then a real clap fires once', () => {
  let seed = 9; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647, j = () => (rand() - 0.5) * 0.008;
  let fires = 0;
  for (let trial = 0; trial < 30; trial++) {
    const c = new ClapDetector();
    for (let i = 0, d = 0.30; d > 0.04; i++, d -= 0.25 / 72) if (c.push({ x: -d / 2 + j(), y: 1.2 + j(), z: -0.4 + j() }, { x: d / 2 + j(), y: 1.2 + j(), z: -0.4 + j() }, i / 72)) fires++;
  }
  assert.equal(fires, 0);
  const c = new ClapDetector(), f = [];
  for (let i = 0; i < 65; i++) f.push([0.40, i / 72]);
  for (let i = 1; i <= 11; i++) f.push([0.40 - i * 0.033, (64 + i) / 72]);
  assert.equal(run(c, f), 1);
});
