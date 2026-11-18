// Scale journey: level order, zoom-edge transitions, piece data · 尺度之旅测试
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL_IDS, outerLevel, innerLevel, pathFrom, edgeStep, decayEdge, EDGE_THRESHOLD, validatePiece, quad, LEVELS, onlyOpenHidden, UI, eyebrowText, spreadLabels, HERE_CAP } from '../journey.js';
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

test('onlyOpen labels hide unless their own piece is open', () => {
  const t = { onlyOpen: true, owner: 'cosmic-web' };
  assert.equal(onlyOpenHidden(t, null), true);
  assert.equal(onlyOpenHidden(t, 'observable-universe'), true);
  assert.equal(onlyOpenHidden(t, 'cosmic-web'), false);
  assert.equal(onlyOpenHidden({ owner: 'cosmic-web' }, null), false);
});

test('elliptical bright < 1 dims the body but not the jet', () => {
  const lum = s => { let a = 0; for (let i = 0; i < s.count; i++) a += s.colors[i * 3] + s.colors[i * 3 + 1] + s.colors[i * 3 + 2]; return a; };
  const p = { axes: [1, 0.86, 0.92], jet: 0.6, jetShare: 0.09 };
  const full = makeShape('elliptical', 4000, ['#fff4d6', '#e8b36a', '#6fb8ff'], p, 87);
  const dim = makeShape('elliptical', 4000, ['#fff4d6', '#e8b36a', '#6fb8ff'], { ...p, bright: 0.6 }, 87);
  assert.ok(lum(dim) < lum(full) * 0.8);
  const jet = (s, n) => { let a = 0; for (let i = s.count - n; i < s.count; i++) a += s.colors[i * 3] + s.colors[i * 3 + 1] + s.colors[i * 3 + 2]; return a; };
  const nJet = Math.floor(4000 * 0.09);
  assert.ok(Math.abs(jet(dim, nJet) - jet(full, nJet)) < 1e-6, 'jet colours unchanged');
  const m87 = PIECES.find(x => x.id === 'm87');
  assert.ok(m87.shape.params.jet <= 0.7, 'M87 jet kept shorter than the galaxy radius');
});

test('every journey UI string exists in EN, zh, ES and PT', () => {
  const walk = (o, path) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, path + '[' + i + ']'));
    if (o && typeof o === 'object' && 'en' in o) { for (const k of ['en', 'zh', 'es', 'pt']) assert.ok(o[k], path + ' ' + k); return; }
    if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, path + '.' + k);
  };
  walk(UI, 'UI');
  assert.ok(UI.journey.pt);
});

test('eyebrow names the level, and the open piece too, in all four languages', () => {
  const m87 = PIECES.find(x => x.id === 'm87');
  assert.equal(eyebrowText('galaxy', null, 'en'), 'SCALE JOURNEY · GALAXY');
  assert.equal(eyebrowText('supercluster', m87, 'en'), ('Supercluster · ' + m87.names.en).toUpperCase());
  for (const k of ['en', 'zh', 'es', 'pt']) {
    assert.ok(eyebrowText('supercluster', m87, k).includes(m87.names[k].toUpperCase()), k);
    assert.ok(!eyebrowText('supercluster', m87, k).includes(UI.journey[k].toUpperCase()), k + ': no journey prefix with a piece open');
  }
  assert.equal(eyebrowText('nope', null, 'en'), '');
});

test('spreadLabels pushes an overlapping lower label below the upper one and leaves others alone', () => {
  // Phone probe 2026-11-14c: MILKY WAY 147–243 × 382–407, SAGITTARIUS A* 126–254 × 401–425 · 手机上两个标签重叠
  const dy = spreadLabels([{ x: 126, y: 401, w: 128, h: 24 }, { x: 147, y: 382, w: 96, h: 25 }, { x: 600, y: 401, w: 80, h: 20 }, { x: 140, y: 390, w: 0, h: 20 }]);
  assert.equal(dy[1], 0, 'upper label stays');
  assert.equal(401 + dy[0], 382 + 25 + 4, 'lower label clears the upper one with a 4 px gap');
  assert.equal(dy[2], 0, 'a label elsewhere does not move');
  assert.equal(dy[3], 0, 'hidden (w = 0) labels are ignored');
  // Three in a stack end up in a column · 三个叠在一起的标签排成一列
  const d3 = spreadLabels([{ x: 0, y: 0, w: 50, h: 10 }, { x: 0, y: 2, w: 50, h: 10 }, { x: 0, y: 4, w: 50, h: 10 }], 2);
  assert.deepEqual(d3.map((d, i) => [0, 2, 4][i] + d), [0, 12, 24]);
});

test('spreadLabels keeps names off rings, holds a push (hysteresis) and goes up at the bottom edge', () => {
  // Galaxy on a phone: Sgr A* pushed below MILKY WAY (to 411–435) used to sit on its own ring (183–197 × 434–448) · 推开的标签曾压在自己的圆环上
  const rings = [{ x: 183, y: 434, w: 14, h: 14, of: 0 }, { x: 188, y: 415, w: 14, h: 14, of: 1 }];
  const dy = spreadLabels([{ x: 126, y: 401, w: 128, h: 24 }, { x: 147, y: 382, w: 96, h: 25 }], 4, { obstacles: rings });
  assert.equal(dy[1], 0, 'upper label stays');
  assert.equal(401 + dy[0], 434 + 14 + 4, 'pushed label clears its own ring');
  // Another label's ring doesn't block it (that cascaded the crowded neighbourhood labels away from their stars) · 别人的圆环不挡
  assert.equal(spreadLabels([{ x: 126, y: 401, w: 128, h: 24 }, { x: 147, y: 382, w: 96, h: 25 }], 4, { obstacles: [{ ...rings[0], of: 1 }] })[0], 10);
  // A label resting near a ring stays (moving every such label cascaded the neighbourhood labels far from their stars) · 静止的标签不因圆环移动
  assert.equal(spreadLabels([{ x: 0, y: 0, w: 60, h: 20 }], 4, { obstacles: [{ x: 20, y: 10, w: 14, h: 14 }] })[0], 0);
  // Down by default; up only when it is much nearer (a stack of rings below) · 默认下移；上方近很多才上移
  assert.equal(spreadLabels([{ x: 0, y: 100, w: 50, h: 20 }, { x: 0, y: 115, w: 50, h: 20 }])[1], 9);
  const stack = [0, 1, 2, 3].map(k => ({ x: 10, y: 130 + 18 * k, w: 14, h: 14 }));
  assert.equal(spreadLabels([{ x: 0, y: 100, w: 50, h: 20 }, { x: 0, y: 110, w: 50, h: 20 }], 4, { obstacles: stack })[1], -34, 'rings below: goes above');
  assert.equal(spreadLabels([{ x: 0, y: 100, w: 50, h: 20, }, { x: 0, y: 100, w: 50, h: 20 }])[1], 24, 'tie goes down');
  // Hysteresis: 8 px apart sideways is clear, unless the label was pushed last frame (then it needs 4 + 6 px) · 滞后
  const pair = held => [{ x: 0, y: 0, w: 50, h: 10 }, { x: 58, y: 2, w: 50, h: 10, held }];
  assert.equal(spreadLabels(pair(false))[1], 0, 'not held: stays at rest');
  assert.equal(spreadLabels(pair(true))[1], 12, 'held: stays pushed');
  assert.equal(spreadLabels([{ x: 0, y: 0, w: 50, h: 10 }, { x: 62, y: 2, w: 50, h: 10, held: true }])[1], 0, 'held but clear by the margin: released');
  // Vertical: hysteresis never pulls a label up toward the other one · 不会往上拉
  assert.equal(spreadLabels([{ x: 0, y: 0, w: 50, h: 10 }, { x: 0, y: 17, w: 50, h: 10, held: true }])[1], 0);
  // Bottom of the screen: a label that would be pushed off it goes above instead · 底部放不下就放上方
  const up = spreadLabels([{ x: 0, y: 90, w: 50, h: 10 }, { x: 0, y: 92, w: 50, h: 10 }], 4, { maxY: 105 });
  assert.deepEqual(up, [0, -16]);
  // No room above either (top of the screen): it stays pushed down rather than leaving the screen top · 上方也放不下就保持下推
  assert.equal(spreadLabels([{ x: 0, y: 2, w: 50, h: 10 }, { x: 0, y: 4, w: 50, h: 10 }], 4, { maxY: 15 })[1], 12);
});

test('spreadLabels: up/down hysteresis, a cap for "You are here" labels and the header buttons (2026-11-15b)', () => {
  // A ring stack below: up is 34 away, down 56 → 56 > 1.5·34 goes up · 下方 56、上方 34：上移
  const stack = [0, 1].map(k => ({ x: 10, y: 130 + 18 * k, w: 14, h: 14 }));
  const pair = (y, held, side) => [{ x: 0, y: 100, w: 50, h: 20 }, { x: 0, y, w: 50, h: 20, held, side }];
  assert.equal(spreadLabels(pair(110, false), 4, { obstacles: stack })[1], -34);
  // Rest spot slides 6 px down: down is now 50 vs up 40 (< 1.5×) → a fresh label goes down, but one that was up stays up · 方向滞后
  assert.equal(spreadLabels(pair(116, false), 4, { obstacles: stack })[1], 50, 'fresh: down');
  assert.equal(spreadLabels(pair(116, true, -1), 4, { obstacles: stack })[1], -40, 'was up: stays up');
  // ...until down is at least as near as up · 直到下方不比上方远
  const far = [{ x: 0, y: 100, w: 50, h: 20 }, { x: 0, y: 118, w: 50, h: 20, held: true, side: -1 }];
  assert.equal(spreadLabels(far)[1], 6, 'was up, but up is 42 vs down 6: goes down');
  // Switch-back at 1×: held up with down 30 vs up 40 (ratio 0.75) comes back down (the old 1/1.5 band kept it up) · 1 倍回切
  const ring1 = [{ x: 10, y: 128, w: 14, h: 14 }];
  assert.equal(spreadLabels(pair(116, true, -1), 4, { obstacles: ring1 })[1], 30);
  // minY: no going up above the top limit · 上方限制
  assert.equal(spreadLabels([{ x: 0, y: 90, w: 50, h: 10 }, { x: 0, y: 92, w: 50, h: 10 }], 4, { maxY: 105, minY: 80 })[1], 12);
  // Cap: a "here" label that would be pushed 52 px down goes up 40 px instead (both free, down preferred without the cap) · 上限
  const tower = [{ x: 10, y: 124, w: 20, h: 20 }];
  const here = cap => [{ x: 0, y: 80, w: 50, h: 20 }, { x: 0, y: 96, w: 50, h: 20, cap }];
  const dNo = spreadLabels(here(null), 4, { obstacles: tower })[1], dCap = spreadLabels(here(HERE_CAP), 4, { obstacles: tower })[1];
  assert.equal(dNo, 52, 'without the cap it goes down 52 px');
  assert.equal(dCap, -40, 'with the cap (48) it goes up 40 px');
  // Both sides beyond the cap: the normal rule decides (down) · 两边都超过上限：照常
  assert.equal(spreadLabels([{ x: 0, y: 0, w: 50, h: 20 }, { x: 0, y: 2, w: 50, h: 20, cap: 10 }])[1], 22);
  // Header buttons: a label going up must not land under them; it goes down instead · 不移到顶部按钮下
  const btn = { x: 0, y: 0, w: 200, h: 80 };
  assert.equal(spreadLabels([{ x: 0, y: 90, w: 50, h: 10 }, { x: 0, y: 92, w: 50, h: 10 }], 4, { maxY: 105 })[1], -16, 'no buttons: up');
  assert.equal(spreadLabels([{ x: 0, y: 90, w: 50, h: 10 }, { x: 0, y: 92, w: 50, h: 10 }], 4, { maxY: 105, obstacles: [btn] })[1], 12, 'buttons above: stays down');
  // ...and a label resting under the buttons is not moved by them · 静止在按钮下的标签不动
  assert.equal(spreadLabels([{ x: 10, y: 20, w: 50, h: 10 }], 4, { obstacles: [btn] })[0], 0);
});

test('eyebrow never repeats the level name, for every piece and language', () => {
  for (const p of PIECES) for (const k of ['en', 'zh', 'es', 'pt']) {
    const s = eyebrowText(p.level, p, k), lv = LEVELS.find(l => l.id === p.level).names[k].toUpperCase();
    assert.ok(s.split(lv).length - 1 <= 1, `${p.id} ${k}: "${s}"`);
    assert.ok(s.includes(lv), `${p.id} ${k}: level named`);
  }
  const lg = PIECES.find(x => x.id === 'local-group');
  assert.equal(eyebrowText('local-group', lg, 'en'), 'SCALE JOURNEY · LOCAL GROUP');
});

test('explain-pieces: every piece has a sourced "What is it?" in 4 languages; images carry credit + licence', () => {
  const textOnly = ['laniakea', 'local-group'];   // no freely licensed official image found (Pamela, Nov 16) · 未找到可自由使用的官方图像
  for (const p of PIECES) {
    assert.ok(p.whatIs, p.id + ' whatIs');
    for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(p.whatIs[l].length < 200, `${p.id} ${l} whatIs stays short`);
    if (textOnly.includes(p.id)) assert.equal(p.photo, undefined, p.id);
    else assert.ok(p.photo && p.photo.credit && p.photo.license, p.id + ' photo');
  }
  for (const k of ['photo', 'illustration', 'simulation', 'radio']) assert.ok(UI.kind[k], k);
  assert.ok(UI.whatIs.pt && UI.imgOpen.zh);
});

test('validatePiece rejects an unsourced whatIs and an image without a licence', () => {
  const p = PIECES.find(x => x.photo);
  const a = structuredClone(p); a.whatIs.source.url = 'https://example.com/x'; assert.ok(validatePiece(a).some(e => /whatIs/.test(e)));
  const b = structuredClone(p); delete b.whatIs.pt; assert.ok(validatePiece(b).some(e => /whatIs/.test(e)));
  const c = structuredClone(p); delete c.photo.license; assert.ok(validatePiece(c).some(e => /licen/.test(e)));
  const d = structuredClone(p); d.photo.kind = 'painting'; assert.ok(validatePiece(d).some(e => /kind/.test(e)));
  const e = structuredClone(p); e.photo.page = 'https://example.com/img'; assert.ok(validatePiece(e).some(x => /page/.test(x)));
});
