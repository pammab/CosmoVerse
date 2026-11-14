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

test('Laniakea: the Local Group marker sits on a filament at the level origin, and the piece does not spin', () => {
  const p = PIECES.find(x => x.id === 'laniakea');
  assert.ok(p, 'laniakea piece exists'); assert.equal(p.level, 'supercluster'); assert.equal(p.spin, 0);
  // youAreHere (holder coords) + position = level origin · 标记位于本层原点
  const [rx, rz] = p.tilt || [0, 0]; let [x, y, z] = p.youAreHere.at;   // three.js Euler XYZ: Rz, then Rx
  [x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)]; [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
  [x, y, z].forEach((v, i) => assert.ok(Math.abs(v + p.position[i]) < 1e-9, 'marker at origin'));
  const s = makeShape(p.shape.kind, p.shape.count, p.shape.colors, p.shape.params, p.shape.seed), h = p.shape.params.home;
  let near = 0; for (let i = 0; i < s.count; i++) if (Math.hypot(s.positions[i * 3] - h[0], s.positions[i * 3 + 1] - h[1], s.positions[i * 3 + 2] - h[2]) < 0.06) near++;
  assert.ok(near > 20, 'particles around home: ' + near);
  // no duplicate "You are here" on the supercluster level · 本层没有重复的标记
  assert.equal(LEVELS.find(l => l.id === 'supercluster').marker, undefined);
  const bad = structuredClone(p); bad.spin = 'fast'; assert.ok(validatePiece(bad).some(e => /spin/.test(e)));
});

test('Sagittarius A* sits at the Milky Way centre with its label moved aside; labelAt is checked', () => {
  const s = PIECES.find(x => x.id === 'sgr-a-star'), mw = PIECES.find(x => x.id === 'milky-way');
  assert.ok(s && mw); assert.equal(s.level, mw.level); assert.deepEqual(s.position, mw.position);
  assert.ok(s.size < mw.size / 10, 'smaller than the galaxy, so picking prefers it at the centre');
  assert.ok(Math.hypot(...s.labelAt) > 3, 'label offset from the shared centre');
  const bad = structuredClone(s); bad.labelAt = [1, 2]; assert.ok(validatePiece(bad).some(e => /labelAt/.test(e)));
});

test('extra sources (also) are checked; Betelgeuse distance cites both NASA pages', () => {
  const b = PIECES.find(x => x.id === 'betelgeuse'), d = b.facts.find(f => /Distance/.test(f.label.en));
  assert.equal(d.also?.length, 1); assert.match(d.value.en, /550 to 700/);
  const bad = structuredClone(b); bad.facts[0].also = [{ name: 'Blog', url: 'https://example.com/x' }];
  assert.ok(validatePiece(bad).some(e => /also/.test(e)));
});

test('cosmic-web filament keeps its void empty; Pillars and M87 sit on their levels', async () => {
  const w = PIECES.find(x => x.id === 'cosmic-web'), pl = PIECES.find(x => x.id === 'pillars-of-creation'), m = PIECES.find(x => x.id === 'm87');
  assert.ok(w && pl && m); assert.equal(w.level, 'universe'); assert.equal(pl.level, 'neighbourhood'); assert.equal(m.level, 'supercluster');
  const s = makeShape(w.shape.kind, w.shape.count, w.shape.colors, w.shape.params, w.shape.seed), [vx, vy, vz, vr] = w.shape.params.void;
  let inside = 0; for (let i = 0; i < s.count; i++) if (Math.hypot(s.positions[i * 3] - vx, s.positions[i * 3 + 1] - vy, s.positions[i * 3 + 2] - vz) < vr * 0.9) inside++;
  assert.ok(inside < s.count * 0.01, 'void is nearly empty: ' + inside);
  // M87 sits on the Virgo Cluster label inside Laniakea · M87 位于室女座星系团
  const { VIRGO_AT } = await import('../pieces/laniakea.js');
  assert.deepEqual(m.position, VIRGO_AT); assert.ok(m.isolate && m.size < 10 && Math.hypot(...m.labelAt) > 2);
  // the jet is optional: an elliptical without it is unchanged · 无喷流时椭圆星系不变
  const a = makeShape('elliptical', 2000, [], {}, 3), j = makeShape('elliptical', 2000, [], { jet: 1 }, 3);
  assert.equal(a.count, 2000); assert.equal(j.count, 2000);
  let far = 0; for (let i = 0; i < j.count; i++) if (j.positions[i * 3] > 0.5 && Math.abs(j.positions[i * 3 + 1]) < 0.08) far++;
  assert.ok(far > 40, 'jet points along +x: ' + far);
});

test('observable-universe cites the re-checked pages; the Void label waits for the close-up', () => {
  const u = PIECES.find(x => x.id === 'observable-universe'), w = PIECES.find(x => x.id === 'cosmic-web');
  assert.ok(!/of us|la nuestra|a nossa/.test(u.narration.en + u.narration.es + u.narration.pt), 'pages say stars and galaxies, not us');
  assert.ok(u.facts.some(f => /heic1620/.test(f.source.url)) && u.facts.some(f => /planck-new-cosmic-recipe/.test(f.source.url)));
  assert.ok(u.facts.some(f => /100–200 billion/.test(f.value.en)), 'old estimate quoted as the page range');
  assert.equal(w.labels[0].onlyOpen, true);
});
