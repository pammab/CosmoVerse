// Scale journey: level order, zoom-edge transitions, piece data · 尺度之旅测试
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL_IDS, outerLevel, innerLevel, pathFrom, edgeStep, decayEdge, EDGE_THRESHOLD, validatePiece, quad, LEVELS } from '../journey.js';
import { makeShape, SHAPE_KINDS } from '../shapes.js';
import { PIECES } from '../pieces/index.js';

test('levels go from the universe down to the Solar System', () => {
  assert.deepEqual(LEVEL_IDS, ['universe', 'supercluster', 'local-group', 'galaxy', 'neighbourhood', 'solar-system']);
  assert.equal(outerLevel('solar-system'), 'neighbourhood');
  assert.equal(outerLevel('galaxy'), 'local-group');
  assert.equal(outerLevel('universe'), null);
  assert.equal(innerLevel('neighbourhood'), 'solar-system');
  assert.equal(innerLevel('solar-system'), null);
  assert.deepEqual(pathFrom('galaxy'), ['galaxy', 'neighbourhood', 'solar-system']);
  for (const l of LEVELS) for (const k of ['en', 'zh', 'es', 'pt']) assert.ok(l.names[k], `${l.id} name ${k}`);
});

test('zooming out past the minimum moves up only after enough push', () => {
  const edge = {}, lim = [0.45, 3];
  let z = 0.5, action = null, steps = 0;
  // one wheel notch ≈ factor exp(-0.12)
  while (!action && steps < 50) { ({ z, action } = edgeStep(edge, z, Math.exp(-0.12), lim)); steps++; }
  assert.equal(action, 'up');
  assert.equal(z, 0.45, 'zoom stays clamped');
  assert.ok(steps >= 4, 'a single notch past the edge does not jump levels: ' + steps);
});

test('zooming in past the maximum moves down; turning back clears the push', () => {
  const edge = {}, lim = [0.5, 2.4];
  let r = edgeStep(edge, 2.4, 1.4, lim); assert.equal(r.action, null); assert.equal(r.z, 2.4);
  r = edgeStep(edge, r.z, 0.9, lim); assert.equal(edge.in, 0, 'zooming the other way resets');
  r = edgeStep(edge, 2.4, Math.exp(EDGE_THRESHOLD + 0.05), lim); assert.equal(r.action, 'down');
  assert.equal(edge.in, 0); assert.equal(edge.out, 0);
});

test('zooming inside the limits never changes level', () => {
  const edge = {}; let z = 1;
  for (let i = 0; i < 200; i++) { const f = i % 2 ? 1.1 : 0.92; const r = edgeStep(edge, z, f, [0.45, 3]); z = r.z; assert.equal(r.action, null); }
});

test('the push fades if you stop', () => {
  const edge = { out: 0.5, in: 0 }; decayEdge(edge, 3); assert.ok(edge.out < 0.05);
});

test('three starter pieces cover the outer levels', () => {
  const ids = PIECES.map(p => p.id);
  for (const id of ['milky-way', 'local-group', 'observable-universe']) assert.ok(ids.includes(id), id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
});

test('every piece matches the schema (4 languages, 5–6 sourced facts)', () => {
  for (const p of PIECES) assert.deepEqual(validatePiece(p), [], p.id);
});

test('validatePiece catches a missing translation and an unsourced fact', () => {
  const bad = structuredClone(PIECES[0]); delete bad.names.pt; bad.facts[0].source.url = 'https://example.com/x';
  const err = validatePiece(bad);
  assert.ok(err.some(e => /names/.test(e)));
  assert.ok(err.some(e => /fact 0/.test(e)));
});

test('optional tilt and frame are checked; Andromeda sits on the Local Group\'s M31 spot', () => {
  const a = PIECES.find(p => p.id === 'andromeda');
  assert.ok(a, 'andromeda piece exists'); assert.equal(a.level, 'local-group');
  assert.deepEqual(a.position.map(v => Math.round(v * 10) / 10), [45, 4.5, -10.5]);
  const bad = structuredClone(a); bad.tilt = [1]; bad.frame = -1;
  const err = validatePiece(bad);
  assert.ok(err.some(e => /tilt/.test(e)) && err.some(e => /frame/.test(e)));
});

test('shapes are deterministic and finite for every kind', () => {
  for (const kind of SHAPE_KINDS) {
    const params = kind === 'galaxy-group' ? { members: [{ at: [0, 0, 0], kind: 'spiral-galaxy', r: 0.1, share: 0.5 }], dwarfs: 5 } : {};
    const a = makeShape(kind, 3000, [], params, 9), b = makeShape(kind, 3000, [], params, 9);
    assert.ok(a.count > 100, kind + ' makes points');
    assert.deepEqual(a.positions, b.positions, kind + ' is deterministic');
    assert.ok(a.positions.every(Number.isFinite) && a.colors.every(c => c >= 0 && c <= 1) && a.sizes.every(s => s > 0), kind + ' values');
  }
});

test('piece shapes fit their counts', () => {
  for (const p of PIECES) { const s = makeShape(p.shape.kind, p.shape.count, p.shape.colors, p.shape.params, p.shape.seed); assert.ok(s.count <= p.shape.count && s.count > p.shape.count * 0.5, p.id); }
});

test('quad writes all four languages and escapes text', () => {
  const h = quad({ en: 'A<b', zh: '甲', es: 'B', pt: 'C' });
  assert.match(h, /class="en"[^>]*>A&lt;b</); assert.match(h, /class="pt"/); assert.match(h, /lang="zh-CN">甲/);
});
