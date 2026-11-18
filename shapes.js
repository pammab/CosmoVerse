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

/* ── Elliptical galaxy · 椭圆星系 ── colors: [core, edge, jet]
   params.jet (optional): length of a thin jet shooting from the centre along +x, e.g. M87's · 可选喷流（沿 +x）
   params.bright (optional, 0–1): dims the body; params.soft (optional, 0–1): smaller points near the centre,
   so a dense core doesn't saturate to white (M87) · 可选：降低亮度、缩小中心粒子，防止核心过曝 */
function elliptical(b, n, colors, p, r) {
  const core = hexRGB(colors[0] || '#fff1d6'), edge = hexRGB(colors[1] || '#ffc98f'), ax = p.axes || [1, 0.8, 0.9];
  const nJet = p.jet ? Math.floor(n * (p.jetShare ?? 0.07)) : 0, jetC = hexRGB(colors[2] || '#7fbfff');
  while (b.n < n - nJet) {
    const rad = Math.min(1.2, Math.pow(-Math.log(1 - r() * 0.999), 2.2) * 0.07), u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const soft = 1 - (p.soft ?? 0) * Math.exp(-rad / 0.1);
    b.add(Math.cos(th) * s * rad * ax[0], u * rad * ax[1], Math.sin(th) * s * rad * ax[2], mix(core, edge, Math.min(1, rad)), (0.005 + r() * 0.006) * soft, (1 - Math.min(0.7, rad * 0.6)) * (p.bright ?? 1) * (0.5 + 0.5 * soft));
  }
  // The jet: narrow, slightly widening, with a few brighter knots · 喷流：细长、略微张开，带几个亮结
  const knots = [0.25, 0.45, 0.62, 0.85];
  while (b.n < n) {
    let t = Math.pow(r(), 0.8); if (r() < 0.35) t = knots[Math.floor(r() * knots.length)] + gauss(r) * 0.015;
    t = Math.min(1, Math.max(0.02, t));
    const w = 0.006 + 0.028 * t, x = t * p.jet;
    b.add(x, gauss(r) * w, gauss(r) * w, mix(jetC, WHITE, 0.2 + r() * 0.3), 0.005 + r() * 0.005, 1 - 0.35 * t);
  }
}

/* ── Pillars: towers of cool dust carved by young stars' light (Eagle Nebula) · 创生之柱 ──
   colors: [dust (dim orange-brown), glowing edges (crimson/gold), haze (light blue), stars]
   params.pillars: [{ x, z, h, w, lean }] in unit coords; bases sit at y = −0.75 · 柱底在 y = −0.75 */
function pillars(b, n, colors, p, r) {
  const dust = hexRGB(colors[0] || '#b86a35'), rim = hexRGB(colors[1] || '#ff5a4a'), haze = hexRGB(colors[2] || '#7fc4e6'), starC = hexRGB(colors[3] || '#fff6e6');
  const cols = p.pillars || [{ x: -0.4, z: 0, h: 1.5, w: 0.15, lean: 0.12 }, { x: 0.08, z: -0.05, h: 1.05, w: 0.12, lean: -0.05 }, { x: 0.45, z: 0.05, h: 0.75, w: 0.1, lean: 0.06 }];
  for (let i = 0; i < n * 0.012; i++) b.add((r() * 2 - 1) * 0.95, (r() * 2 - 1) * 0.8, gauss(r) * 0.15, mix(starC, WHITE, r() * 0.5), 0.012 + r() * 0.03, 0.7 + r() * 0.3);   // young stars · 年轻恒星
  for (let i = 0; i < n * 0.22; i++) {   // the glowing blue haze behind the towers · 背后发蓝光的电离气体
    const x = (r() * 2 - 1) * 1.0, y = -0.2 + gauss(r) * 0.45, z = -0.25 + gauss(r) * 0.12;
    b.add(x, y, z, mix(haze, WHITE, r() * 0.1), 0.016 + r() * 0.02, 0.11 + r() * 0.09);   // kept faint so the towers lead · 保持淡，突出柱子
  }
  const base = -0.75, total = cols.reduce((s, c) => s + c.h * c.w, 0);
  while (b.n < n) {
    let k = cols[0], pick = r() * total; for (const c of cols) { pick -= c.h * c.w; if (pick <= 0) { k = c; break; } }
    const t = Math.pow(r(), 0.9), y = base + t * k.h;
    // Tapering column with lumpy sides and a rounded head · 逐渐变细、边缘起伏、顶端圆
    const lump = 1 + 0.22 * Math.sin(t * 17 + k.x * 11) + 0.12 * Math.sin(t * 41 + k.x * 5);
    const w = k.w * (1.25 - 0.75 * t) * lump * (1 + 0.6 * Math.exp(-((t - 0.95) ** 2) / 0.002));
    const a = r() * Math.PI * 2, d = Math.sqrt(r()), dx = Math.cos(a) * d * w, dz = Math.sin(a) * d * w * 0.7;
    const cx = k.x + k.lean * t + Math.sin(t * 9 + k.x * 7) * 0.03, x = cx + dx, z = (k.z || 0) + dz;
    // The skin facing the stars' light glows (crimson to gold); the dust inside stays dim · 表面被照亮，内部暗
    const edge = d > 0.86 && r() < 0.75, cap = t > 0.9 && d > 0.5 && r() < 0.7;
    if (edge || cap) b.add(x, y, z, mix(rim, [1, 0.8, 0.45], cap ? 0.3 + r() * 0.5 : r() * 0.35), 0.006 + r() * 0.006, 0.9 + r() * 0.1);
    else b.add(x, y, z, mix(dust, [0.3, 0.17, 0.1], r() * 0.6), 0.008 + r() * 0.008, 0.3 + r() * 0.2);
  }
}

/* ── One cosmic-web filament full of galaxies, with an empty void beside it · 宇宙网中的一条纤维与旁边的空洞 ──
   colors: [galaxies along the thread, cluster at its end, hot gas haze, galaxies on the void's rim]
   params.void: [x, y, z, radius] of the empty bubble · 空洞的位置与半径 */
function filament(b, n, colors, p, r) {
  const gal = hexRGB(colors[0] || '#b4c8ff'), clus = hexRGB(colors[1] || '#ffe2b0'), gas = hexRGB(colors[2] || '#6f7fc4'), rimC = hexRGB(colors[3] || '#8fa0d0');
  const [vx, vy, vz, vr] = p.void || [0.15, 0.55, -0.1, 0.5];
  // The thread: a gentle S-curve from (−1, −0.35) to a cluster at (0.95, 0.15) · 主丝：平缓的 S 形曲线
  const curve = t => [-1 + 1.95 * t, -0.35 + 0.5 * t + Math.sin(t * Math.PI * 1.6) * 0.14, Math.sin(t * Math.PI) * 0.18 - 0.05];
  const side = [[0.42, [0.2, -0.85, 0.25]], [0.7, [0.75, -0.7, -0.2]], [0.18, [-0.75, 0.25, 0.3]]];   // thinner branches · 支丝
  const at = (t, sp) => { const c = curve(t); return [c[0] + gauss(r) * sp, c[1] + gauss(r) * sp, c[2] + gauss(r) * sp]; };
  // A tiny galaxy: a small flattened clump of points · 小星系：一小团扁平的点
  const galaxy = (c, col, k, s) => { const a = r() * Math.PI; for (let i = 0; i < k && b.n < n; i++) { const u = gauss(r) * s, v = gauss(r) * s * 0.35; b.add(c[0] + u * Math.cos(a), c[1] + u * Math.sin(a) + v, c[2] + gauss(r) * s * 0.5, mix(col, WHITE, r() * 0.3), 0.004 + r() * 0.004, 0.55 + r() * 0.35); } };
  for (let i = 0; i < n * 0.1; i++) { const s = 0.04 + 0.06 * r(), c = curve(1); b.add(c[0] + gauss(r) * s, c[1] + gauss(r) * s, c[2] + gauss(r) * s, mix(clus, WHITE, r() * 0.3), 0.004 + r() * 0.005, 0.5 + r() * 0.35); }   // the cluster it feeds · 它注入的星系团
  for (let i = 0; i < n * 0.25; i++) { const c = at(r(), 0.05); b.add(c[0], c[1], c[2], gas, 0.014 + r() * 0.014, 0.07 + r() * 0.06); }   // faint hot gas along it · 沿丝的暗弱热气体
  for (let i = 0; i < n * 0.08; i++) {   // galaxies thinly lining the void's rim; nothing inside · 空洞边缘稀疏的星系，内部空无一物
    const u = r() * 2 - 1, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), rad = vr * (1 + Math.abs(gauss(r)) * 0.08);
    b.add(vx + q * Math.cos(th) * rad, vy + u * rad, vz + q * Math.sin(th) * rad, rimC, 0.005 + r() * 0.004, 0.5 + r() * 0.3);
  }
  while (b.n < n) {   // galaxies strung along the thread and its branches, denser towards the cluster · 沿丝排列的星系，越靠近星系团越密
    let c;
    if (r() < 0.22) { const [t0, end] = side[Math.floor(r() * side.length)], s = curve(t0), t = r(); c = [s[0] + (end[0] - s[0]) * t + gauss(r) * 0.03, s[1] + (end[1] - s[1]) * t + gauss(r) * 0.03, s[2] + (end[2] - s[2]) * t + gauss(r) * 0.03]; }
    else c = at(Math.pow(r(), 0.7), 0.035);
    if (Math.hypot(c[0] - vx, c[1] - vy, c[2] - vz) < vr) continue;   // keep the void empty · 保持空洞
    galaxy(c, gal, 6 + Math.floor(r() * 14), 0.006 + r() * 0.008);
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

/* ── Supercluster: galaxies streaming along branching filaments into a bright basin · 超星系团 ──
   colors: [filaments, clusters (knots), core]. params.branches: how many main branches;
   params.home + params.via: one branch runs home → via… → centre (e.g. ends at the Local Group) · 指定一条经过 home 的分支 */
function supercluster(b, n, colors, p, r) {
  const fil = hexRGB(colors[0] || '#9fb8ff'), knot = hexRGB(colors[1] || '#ffe2b0'), core = hexRGB(colors[2] || '#fff1d6');
  const paths = [];
  if (p.home) paths.push([p.home, ...(p.via || []), [0, 0, 0]]);
  const B = p.branches ?? 9, flat = p.flat ?? 0.4;
  for (let k = paths.length; k < B; k++) {   // tips spread round the basin, each bending on its way in · 分支弯曲汇入
    const th = (k / B) * Math.PI * 2 + gauss(r) * 0.25, rad = 0.78 + r() * 0.22, y = gauss(r) * flat * 0.5;
    const tip = [Math.cos(th) * rad, y, Math.sin(th) * rad], bend = (r() - 0.5) * 0.7;
    const mid = [tip[0] * 0.5 - Math.sin(th) * bend * 0.4, y * 0.4 + gauss(r) * 0.06, tip[2] * 0.5 + Math.cos(th) * bend * 0.4];
    paths.push([tip, mid, [0, 0, 0]]);
    if (r() < 0.75) {                        // a side branch joining halfway · 支流
      const t2 = th + (r() < 0.5 ? -1 : 1) * (0.35 + r() * 0.3), r2 = 0.55 + r() * 0.3;
      paths.push([[Math.cos(t2) * r2, gauss(r) * flat * 0.4, Math.sin(t2) * r2], mid]);
    }
  }
  // A point a fraction t along a polyline · 折线上的点
  const along = (pts, t) => { const s = t * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(s)), f = s - i, a = pts[i], c = pts[i + 1]; return [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, a[2] + (c[2] - a[2]) * f]; };
  for (let i = 0; i < n * 0.1; i++) {       // the basin's dense, warm heart · 核心
    const s = 0.05 + 0.07 * r(); b.add(gauss(r) * s, gauss(r) * s * 0.6, gauss(r) * s, mix(core, WHITE, r() * 0.3), 0.004 + r() * 0.005, 0.45 + r() * 0.3);
  }
  const knots = paths.flatMap(pts => [0.3, 0.62].map(t => along(pts, t + (r() - 0.5) * 0.08)));
  for (let i = 0; i < n * 0.16; i++) {      // galaxy clusters along the branches · 沿途的星系团
    const a = knots[Math.floor(r() * knots.length)], s = 0.022 * Math.abs(gauss(r));
    b.add(a[0] + gauss(r) * s, a[1] + gauss(r) * s, a[2] + gauss(r) * s, mix(knot, WHITE, r() * 0.3), 0.004 + r() * 0.005, 0.5 + r() * 0.3);
  }
  while (b.n < n) {                          // the streams: thin far out, brighter as they flow in · 流向核心，越近越亮
    const pts = paths[Math.floor(r() * paths.length)], t = Math.pow(r(), 0.8), c = along(pts, t), s = 0.012 + 0.03 * (1 - t) * r();
    b.add(c[0] + gauss(r) * s, c[1] + gauss(r) * s * 0.7, c[2] + gauss(r) * s, mix(fil, knot, t * 0.45), 0.0035 + r() * 0.0045, 0.35 + 0.45 * t);
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
   params.members: [{ at:[x,y,z], kind:'barred-spiral'|'spiral-galaxy'|'elliptical'|'dwarf'|…, r, share, tilt:[rx,rz], colors, bright }]
   params.dwarfs: how many small anonymous dwarf galaxies to scatter · 散布的矮星系数量 */
function galaxyGroup(b, n, colors, p, r) {
  const members = p.members || [], dwarfC = hexRGB(colors[0] || '#cdd8ff');
  for (const m of members) {
    const k = Math.max(50, Math.floor(n * (m.share ?? 0.1))), sub = makeShape(m.kind === 'dwarf' ? 'elliptical' : m.kind, k, m.colors || colors.slice(1), m.params || {}, m.seed ?? seedOf(m.kind + m.at));
    const [rx, rz] = m.tilt || [0, 0], cx = Math.cos(rx), sx = Math.sin(rx), cz = Math.cos(rz), sz = Math.sin(rz);
    for (let i = 0; i < sub.count; i++) {
      let x = sub.positions[i * 3] * m.r, y = sub.positions[i * 3 + 1] * m.r, z = sub.positions[i * 3 + 2] * m.r;
      [y, z] = [y * cx - z * sx, y * sx + z * cx]; [x, y] = [x * cz - y * sz, x * sz + y * cz];
      b.add(m.at[0] + x, m.at[1] + y, m.at[2] + z, [sub.colors[i * 3], sub.colors[i * 3 + 1], sub.colors[i * 3 + 2]], sub.sizes[i] * Math.max(0.35, m.r * 2.2), m.bright ?? 1);   // bright < 1 keeps dense stars from saturating to white · 防止过曝成白色
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
  elliptical, cluster, nebula, web, supercluster, 'galaxy-group': galaxyGroup, star, 'black-hole': blackHole, starfield, pillars, filament };
export const SHAPE_KINDS = Object.keys(KINDS);

// makeShape('barred-spiral', 60000, ['#ffe9c4', '#8fb7ff'], { arms: 2 }, seed) → { positions, colors, sizes, count }
export function makeShape(kind, count, colors = [], params = {}, seed = seedOf(kind)) {
  const gen = KINDS[kind]; if (!gen) throw new Error('Unknown shape kind: ' + kind);
  const b = buffer(Math.max(1, Math.floor(count))); gen(b, Math.max(1, Math.floor(count)), colors, params, seeded(seed));
  return b.done();
}
