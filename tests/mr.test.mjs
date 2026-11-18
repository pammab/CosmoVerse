// Mixed reality placement helpers (mr.js) · 混合现实放置
import test from 'node:test';
import assert from 'node:assert/strict';
import { choosePlane, aheadOf, nearestInXZ, insideXZ, facesUp, tableScale, MR_UI, TABLE_SPAN_M, M_PER_DIST } from '../mr.js';

const head = { x: 0, y: 1.2, z: 0 };   // seated, eyes 1.2 m above the floor · 坐姿
const rect = (x0, z0, x1, z1) => [{ x: x0, z: z0 }, { x: x1, z: z0 }, { x: x1, z: z1 }, { x: x0, z: z1 }];
const floor = { orientation: 'horizontal', y: 0, polygon: rect(-3, -3, 3, 3), label: 'floor' };
const table = { orientation: 'horizontal', y: 0.74, polygon: rect(-0.6, -1.4, 0.6, -0.5), label: 'table' };
const wall = { orientation: 'vertical', y: 1.2, polygon: rect(-3, -3, 3, -2.9), label: 'wall' };
const ceiling = { orientation: 'horizontal', y: 2.5, polygon: rect(-3, -3, 3, 3), label: 'ceiling' };

test('aheadOf: 0.8 m in front along the head yaw', () => {
  const p = aheadOf(head, 0); assert.ok(Math.abs(p.z + 0.8) < 1e-9 && Math.abs(p.x) < 1e-9 && Math.abs(p.y - 0.75) < 1e-9);
  const q = aheadOf(head, Math.PI / 2); assert.ok(Math.abs(q.x + 0.8) < 1e-9);   // turned left: -x · 左转
});
test('choosePlane prefers the table over the floor, ignores walls and ceiling', () => {
  const c = choosePlane([floor, wall, ceiling, table], head, 0);
  assert.equal(c.kind, 'table'); assert.equal(c.y, 0.74);
  assert.ok(insideXZ(c, table.polygon));
});
test('choosePlane: an unlabelled surface at table height beats the floor; the floor is the last resort', () => {
  const desk = { ...table, label: undefined };
  assert.equal(choosePlane([floor, desk], head, 0).kind, 'surface');
  assert.equal(choosePlane([floor, wall], head, 0).kind, 'floor');
  assert.equal(choosePlane([wall, ceiling], head, 0), null);
  assert.equal(choosePlane([], head, 0), null);
});
test('choosePlane: a table behind you is still used, at its nearest point pulled inside', () => {
  const back = { ...table, polygon: rect(-0.5, 0.6, 0.5, 1.2) };
  const c = choosePlane([back], head, 0);
  assert.equal(c.kind, 'table'); assert.ok(insideXZ(c, back.polygon)); assert.ok(c.z > 0.6 && c.z < 0.8);
});
test('choosePlane ignores far-away surfaces', () => {
  const far = { ...table, polygon: rect(-0.5, -6, 0.5, -5) };
  assert.equal(choosePlane([far], head, 0), null);
});
test('nearestInXZ keeps inside points and clamps outside ones', () => {
  assert.deepEqual(nearestInXZ({ x: 0, z: -1 }, table.polygon), { x: 0, z: -1 });
  const n = nearestInXZ({ x: 2, z: -1 }, table.polygon); assert.ok(insideXZ(n, table.polygon) && n.x < 0.6);
});
test('facesUp: level surfaces yes, walls no', () => {
  assert.ok(facesUp({ x: 0, y: 0, z: 0, w: 1 }));
  const s = Math.SQRT1_2; assert.ok(!facesUp({ x: s, y: 0, z: 0, w: s }));
});
test('tableScale: the Solar System overview (~224 units wide, camera ~170) fits the table', () => {
  const widthM = 224 / tableScale(170); assert.ok(Math.abs(widthM - TABLE_SPAN_M) < 0.08, widthM);
  assert.ok(M_PER_DIST > 0);
});
test('MR texts exist in EN, zh, ES and PT', () => {
  const walk = o => { if (o.en !== undefined) { for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(typeof o[l] === 'string' && o[l].length > 1, l + ' ' + o.en); return; } Object.values(o).forEach(walk); };
  walk(MR_UI);
});
