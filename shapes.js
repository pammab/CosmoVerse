// ─────────────────────────────────────────────────────────────────────────────
// Particle shapes for the scale journey · 尺度之旅的粒子形状
// Each generator returns plain arrays (no three.js here, so tests can run in node):
//   { positions, colors, sizes }  — positions in a unit radius (≈ −1…1), colors in sRGB 0–1,
//   sizes are relative point sizes (≈ 0.004–0.02 of the radius).
// Deterministic: a seeded random keeps screenshots stable · 固定随机种子，截图稳定
// ─────────────────────────────────────────────────────────────────────────────

export function seeded(seed = 1) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function hexRGB(hex) {
  const h = String(hex).replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
const seedOf = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

// A small buffer that grows as points are added · 点缓冲
function buffer(n) {
  const b = { positions: new Float32Array(n * 3), colors: new Float32Array(n * 3), sizes: new Float32Array(n), n: 0 };
  b.add = (x, y, z, rgb, size, bright = 1) => {
    if (b.n >= n) return; const i = b.n++;
    b.positions[i * 3] = x; b.positions[i * 3 + 1] = y; b.positions[i * 3 + 2] = z;
    b.colors[i * 3] = Math.min(1, rgb[0] * bright); b.colors[i * 3 + 1] = Math.min(1, rgb[1] * bright); b.colors[i * 3 + 2] = Math.min(1, rgb[2] * bright);
    b.sizes[i] = size;
  };
  b.done = () => ({ positions: b.positions.subarray(0, b.n * 3), colors: b.colors.subarray(0, b.n * 3), sizes: b.sizes.subarray(0, b.n), count: b.n });
  return b;
}
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const gauss = r => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
const WHITE = [1, 1, 1];

/* ── Spiral and barred spiral galaxies · 旋涡星系与棒旋星系 ──
   colors: [core, arms, HII regions (pink), dust lanes (dim)] */
function spiral(b, n, colors, p, r, barred) {
  const core = hexRGB(colors[0] || '#ffe9c4'), arm = hexRGB(colors[1] || '#9fc0ff'), hii = hexRGB(colors[2] || '#ff8fb4');
  const arms = p.arms ?? 2, pitch = (p.pitch ?? 13) * Math.PI / 180, bar = barred ? (p.bar ?? 0.2) : 0.06, barAngle = p.barAngle ?? 0.45;
  const thick = p.thickness ?? 0.018, wind = 1 / Math.tan(pitch);
  const nBulge = n * (barred ? 0.16 : 0.2), nBar = barred ? n * 0.12 : 0, nArms = n * 0.5;
  for (let i = 0; i < nBulge; i++) {   // warm, round centre
    const s = 0.05 + 0.06 * r(), x = gauss(r) * s, y = gauss(r) * s * 0.65, z = gauss(r) * s;
    b.add(x, y, z, mix(core, WHITE, r() * 0.25), 0.0045 + r() * 0.004, 0.28 + r() * 0.22);
  }
  const cb = Math.cos(barAngle), sb = Math.sin(barAngle);
  for (let i = 0; i < nBar; i++) {     // the bar · 棒
    const u = gauss(r) * bar * 0.55, v = gauss(r) * bar * 0.16, y = gauss(r) * thick * 1.4;
    b.add(u * cb - v * sb, y, u * sb + v * cb, mix(core, WHITE, 0.2 + r() * 0.2), 0.005 + r() * 0.004, 0.45 + r() * 0.25);
  }
  for (let i = 0; i < nArms; i++) {    // logarithmic arms, starting at the bar ends · 对数螺旋臂
    const k = i % arms, t = Math.pow(r(), 0.85), rad = bar * 0.9 + (1 - bar * 0.9) * t;
    const th = barAngle + k * 2 * Math.PI / arms + Math.log(rad / (bar * 0.9 + 1e-3) + 1) * wind * 0.55;
    const spread = 0.025 + 0.06 * rad, dx = gauss(r) * spread, dz = gauss(r) * spread;
    const x = Math.cos(th) * rad + dx, z = Math.sin(th) * rad + dz, y = gauss(r) * thick;
    const pink = r() < 0.07;
    b.add(x, y, z, pink ? hii : mix(arm, WHITE, r() * 0.45), pink ? 0.012 + r() * 0.01 : 0.004 + r() * 0.006, pink ? 0.9 : 0.55 + r() * 0.45);
  }
  while (b.n < n) {                    // faint disc between the arms · 盘面
    const rad = -Math.log(1 - r() * 0.95) * 0.33, th = r() * Math.PI * 2;
    if (rad > 1.1) continue;
    b.add(Math.cos(th) * rad, gauss(r) * thick * 1.2, Math.sin(th) * rad, mix(core, arm, Math.min(1, rad * 1.3)), 0.0035 + r() * 0.004, 0.3 + r() * 0.3);
  }
}

/* ── Elliptical galaxy · 椭圆星系 ── colors: [core, edge] */
function elliptical(b, n, colors, p, r) {
  const core = hexRGB(colors[0] || '#fff1d6'), edge = hexRGB(colors[1] || '#ffc98f'), ax = p.axes || [1, 0.8, 0.9];
  while (b.n < n) {
    const rad = Math.min(1.2, Math.pow(-Math.log(1 - r() * 0.999), 2.2) * 0.07), u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    b.add(Math.cos(th) * s * rad * ax[0], u * rad * ax[1], Math.sin(th) * s * rad * ax[2], mix(core, edge, Math.min(1, rad)), 0.005 + r() * 0.006, 1 - Math.min(0.7, rad * 0.6));
  }
}

/* ── Star cluster · 星团 ── colors: [main stars, bright stars, haze] */
function cluster(b, n, colors, p, r) {
  const main = hexRGB(colors[0] || '#cfe0ff'), bright = hexRGB(colors[1] || '#ffffff'), haze = colors[2] ? hexRGB(colors[2]) : null;
  const nb = p.bright ?? 9;
  for (let i = 0; i < nb; i++) b.add(gauss(r) * 0.35, gauss(r) * 0.25, gauss(r) * 0.35, bright, 0.05 + r() * 0.04, 1);
  const nh = haze ? n * 0.35 : 0;
  for (let i = 0; i < nh; i++) b.add(gauss(r) * 0.45, gauss(r) * 0.3, gauss(r) * 0.45, haze, 0.02 + r() * 0.02, 0.18);
  while (b.n < n) { const s = 0.25 + r() * 0.35; b.add(gauss(r) * s, gauss(r) * s * 0.8, gauss(r) * s, mix(main, WHITE, r() * 0.5), 0.006 + r() * 0.012, 0.5 + r() * 0.5); }
}

/* ── Nebula · 星云 ── colors: [glow, second glow, stars] · a few soft clouds plus wisps */
function nebula(b, n, colors, p, r) {
  const c0 = hexRGB(colors[0] || '#ff6f7d'), c1 = hexRGB(colors[1] || '#5fd3c6'), cs = hexRGB(colors[2] || '#ffffff');
  const blobs = Array.from({ length: p.blobs ?? 7 }, () => ({ x: gauss(r) * 0.35, y: gauss(r) * 0.25, z: gauss(r) * 0.2, s: 0.12 + r() * 0.22, t: r() }));
  for (let i = 0; i < n * 0.04; i++) b.add(gauss(r) * 0.5, gauss(r) * 0.4, gauss(r) * 0.3, cs, 0.008 + r() * 0.012, 0.9);
  while (b.n < n) {
    const k = blobs[Math.floor(r() * blobs.length)], d = Math.abs(gauss(r)), th = r() * Math.PI * 2, ph = Math.acos(r() * 2 - 1);
    const rad = k.s * d * (0.7 + 0.3 * Math.sin(th * 3 + k.t * 9));
    const x = k.x + rad * Math.sin(ph) * Math.cos(th), y = k.y + rad * Math.sin(ph) * Math.sin(th), z = k.z + rad * Math.cos(ph) * 0.6;
    b.add(x, y, z, mix(c0, c1, Math.min(1, Math.max(0, k.t + (x - k.x) * 2))), 0.01 + r() * 0.016, 0.22 + 0.3 * Math.exp(-d));
  }
}

/* ── Cosmic web · 宇宙网 ── colors: [filaments, nodes (clusters), voids] */
function web(b, n, colors, p, r) {
  const fil = hexRGB(colors[0] || '#9fb8ff'), node = hexRGB(colors[1] || '#ffe2b0'), voidC = hexRGB(colors[2] || '#5c6c9a');
  const N = p.nodes ?? 70, nodes = [];
  while (nodes.length < N) { const x = r() * 2 - 1, y = r() * 2 - 1, z = r() * 2 - 1; if (x * x + y * y + z * z < 1) nodes.push([x, y, z]); }
  const edges = [];
  nodes.forEach((a, i) => {
    const near = nodes.map((c, j) => [j, (a[0] - c[0]) ** 2 + (a[1] - c[1]) ** 2 + (a[2] - c[2]) ** 2]).filter(e => e[0] !== i).sort((u, v) => u[1] - v[1]).slice(0, 3);
    near.forEach(([j]) => { if (j > i || !edges.some(e => e[0] === j && e[1] === i)) edges.push([i, j]); });
  });
  for (let i = 0; i < n * 0.22; i++) {     // clusters where filaments meet · 节点
    const a = nodes[Math.floor(r() * N)], s = 0.025 * Math.abs(gauss(r));
    b.add(a[0] + gauss(r) * s, a[1] + gauss(r) * s, a[2] + gauss(r) * s, mix(node, WHITE, r() * 0.3), 0.004 + r() * 0.005, 0.5 + r() * 0.3);
  }
  for (let i = 0; i < n * 0.05; i++) {     // a few galaxies in the voids · 空洞
    const x = r() * 2 - 1, y = r() * 2 - 1, z = r() * 2 - 1; if (x * x + y * y + z * z < 1) b.add(x, y, z, voidC, 0.004 + r() * 0.004, 0.5);
  }
  while (b.n < n) {                        // filaments · 纤维
    const [i, j] = edges[Math.floor(r() * edges.length)], a = nodes[i], c = nodes[j], t = r(), s = 0.012 + 0.02 * Math.sin(Math.PI * t) * r();
    b.add(a[0] + (c[0] - a[0]) * t + gauss(r) * s, a[1] + (c[1] - a[1]) * t + gauss(r) * s, a[2] + (c[2] - a[2]) * t + gauss(r) * s, mix(fil, node, r() * 0.3), 0.004 + r() * 0.005, 0.45 + r() * 0.35);
  }
}

/* ── Star with corona · 恒星 ── colors: [surface, corona] */
function star(b, n, colors, p, r) {
  const s0 = hexRGB(colors[0] || '#fff3d6'), s1 = hexRGB(colors[1] || colors[0] || '#ffb860');
  for (let i = 0; i < n * 0.35; i++) { const u = r() * 2 - 1, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), rad = 0.25 * Math.cbrt(r()); b.add(q * Math.cos(th) * rad, u * rad, q * Math.sin(th) * rad, mix(s0, WHITE, 0.4), 0.03 + r() * 0.02, 1); }
  while (b.n < n) { const u = r() * 2 - 1, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), rad = 0.25 + Math.abs(gauss(r)) * 0.3; b.add(q * Math.cos(th) * rad, u * rad, q * Math.sin(th) * rad, s1, 0.02 + r() * 0.02, 0.6 * Math.exp(-(rad - 0.25) * 3)); }
}

/* ── Black hole: accretion disk + photon ring · 黑洞：吸积盘与光子环 ── colors: [hot inner, outer] */
function blackHole(b, n, colors, p, r) {
  const hot = hexRGB(colors[0] || '#fff0c8'), outer = hexRGB(colors[1] || '#ff8a3d'), tilt = p.tilt ?? 0.25, ct = Math.cos(tilt), st = Math.sin(tilt);
  for (let i = 0; i < n * 0.15; i++) { const th = r() * Math.PI * 2, rad = 0.3 + gauss(r) * 0.008; b.add(Math.cos(th) * rad, Math.sin(th) * rad, 0, hot, 0.008, 1); }   // ring seen face-on
  while (b.n < n) {
    const rad = 0.38 + Math.pow(r(), 1.6) * 0.62, th = r() * Math.PI * 2, x = Math.cos(th) * rad, z = Math.sin(th) * rad, y = gauss(r) * 0.01;
    const dop = 0.55 + 0.45 * Math.cos(th);   // one side brighter (Doppler beaming) · 多普勒增亮
    b.add(x, y * ct - z * st, y * st + z * ct, mix(hot, outer, (rad - 0.38) / 0.62), 0.005 + r() * 0.006, dop);
  }
}

/* ── A group of galaxies · 星系群 ──
   params.members: [{ at:[x,y,z], kind:'barred-spiral'|'spiral-galaxy'|'elliptical'|'dwarf', r, share, tilt:[rx,rz], colors }]
   params.dwarfs: how many small anonymous dwarf galaxies to scatter · 散布的矮星系数量 */
function galaxyGroup(b, n, colors, p, r) {
  const members = p.members || [], dwarfC = hexRGB(colors[0] || '#cdd8ff');
  for (const m of members) {
    const k = Math.max(50, Math.floor(n * (m.share ?? 0.1))), sub = makeShape(m.kind === 'dwarf' ? 'elliptical' : m.kind, k, m.colors || colors.slice(1), m.params || {}, m.seed ?? seedOf(m.kind + m.at));
    const [rx, rz] = m.tilt || [0, 0], cx = Math.cos(rx), sx = Math.sin(rx), cz = Math.cos(rz), sz = Math.sin(rz);
    for (let i = 0; i < sub.count; i++) {
      let x = sub.positions[i * 3] * m.r, y = sub.positions[i * 3 + 1] * m.r, z = sub.positions[i * 3 + 2] * m.r;
      [y, z] = [y * cx - z * sx, y * sx + z * cx]; [x, y] = [x * cz - y * sz, x * sz + y * cz];
      b.add(m.at[0] + x, m.at[1] + y, m.at[2] + z, [sub.colors[i * 3], sub.colors[i * 3 + 1], sub.colors[i * 3 + 2]], sub.sizes[i] * Math.max(0.35, m.r * 2.2));
    }
  }
  const nd = p.dwarfs ?? 40;
  for (let d = 0; d < nd && b.n < n; d++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), rad = 0.15 + Math.pow(r(), 0.7) * 0.85, cx = q * Math.cos(th) * rad, cy = u * rad * 0.6, cz = q * Math.sin(th) * rad;
    const k = 40 + Math.floor(r() * 80), s = 0.006 + r() * 0.012;
    for (let i = 0; i < k; i++) b.add(cx + gauss(r) * s, cy + gauss(r) * s, cz + gauss(r) * s, mix(dwarfC, WHITE, r() * 0.3), 0.003 + r() * 0.003, 0.5 + r() * 0.3);
  }
}

/* ── Field of nearby stars · 近邻恒星背景 ── colors: star colours to pick from */
function starfield(b, n, colors, p, r) {
  const cs = (colors.length ? colors : ['#ffffff', '#ffe8c0', '#ffc78a', '#cfdcff']).map(hexRGB);
  while (b.n < n) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), rad = 0.2 + Math.cbrt(r()) * 0.8;
    b.add(q * Math.cos(th) * rad, u * rad * (p.flat ?? 0.45), q * Math.sin(th) * rad, cs[Math.floor(r() * cs.length)], 0.006 + Math.pow(r(), 4) * 0.03, 0.45 + r() * 0.55);
  }
}

const KINDS = { 'spiral-galaxy': (b, n, c, p, r) => spiral(b, n, c, p, r, false), 'barred-spiral': (b, n, c, p, r) => spiral(b, n, c, p, r, true),
  elliptical, cluster, nebula, web, 'galaxy-group': galaxyGroup, star, 'black-hole': blackHole, starfield };
export const SHAPE_KINDS = Object.keys(KINDS);

// makeShape('barred-spiral', 60000, ['#ffe9c4', '#8fb7ff'], { arms: 2 }, seed) → { positions, colors, sizes, count }
export function makeShape(kind, count, colors = [], params = {}, seed = seedOf(kind)) {
  const gen = KINDS[kind]; if (!gen) throw new Error('Unknown shape kind: ' + kind);
  const b = buffer(Math.max(1, Math.floor(count))); gen(b, Math.max(1, Math.floor(count)), colors, params, seeded(seed));
  return b.done();
}
