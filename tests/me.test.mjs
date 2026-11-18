import test from 'node:test';
import assert from 'node:assert/strict';
import { roundPlace, namesFrom, placeLine, spherePoint, spinToFace, ME_UI, ME_LEVELS } from '../me.js';

test('the place is rounded to about 2 km; names never include a street', () => {
  assert.deepEqual(roundPlace(34.05223, -118.24368), { lat: 34.06, lon: -118.24 });
  const n = namesFrom({ road: 'Spring St', house_number: '200', city: 'Los Angeles', state: 'California', country: 'United States' });
  assert.equal(placeLine(n), 'Los Angeles, California, United States');
  assert.ok(!JSON.stringify(n).includes('Spring') && !JSON.stringify(n).includes('200'));
  assert.equal(placeLine({ city: 'Maputo', region: 'Maputo', country: 'Moçambique' }), 'Maputo, Moçambique');
});
test('the globe turns so the place faces the viewer', () => {
  for (const [lat, lon] of [[34.06, -118.24], [-25.96, 32.58], [51.5, 0], [35.7, 139.7]]) {
    const p = spherePoint(lat, lon), v = { x: 0.3, y: 0.1, z: -0.9 }, a = spinToFace(p, v);
    const x = p.x * Math.cos(a) + p.z * Math.sin(a), z = -p.x * Math.sin(a) + p.z * Math.cos(a);   // rotation about y · 绕 y 轴
    assert.ok(Math.abs(Math.atan2(x, z) - Math.atan2(v.x, v.z)) % (2 * Math.PI) < 1e-9 || Math.abs(Math.abs(Math.atan2(x, z) - Math.atan2(v.x, v.z)) - 2 * Math.PI) < 1e-9, lat + ',' + lon);
    assert.ok(Math.abs(Math.hypot(p.x, p.y, p.z) - 1) < 1e-12);
  }
  assert.ok(spherePoint(90, 0).y > 0.999);
});
test('four languages; the levels go largest first', () => {
  for (const o of Object.values(ME_UI)) for (const k of ['en', 'zh', 'es', 'pt']) assert.ok(o[k], k);
  assert.equal(ME_LEVELS[0], 'universe'); assert.equal(ME_LEVELS.at(-1), 'solar-system');
});
