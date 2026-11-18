// ─────────────────────────────────────────────────────────────────────────────
// 👏 If the Milky Way and Andromeda collide · 如果银河系与仙女座星系相撞 · Si la Vía Láctea y Andrómeda chocan · Se a Via Láctea e Andrômeda colidirem
// At the Local Group, clap your hands (VR) or press Start: the two galaxies fall together, swing past each other,
// throw out tidal tails and settle into one big galaxy. A small "restricted N-body" simulation: thousands of star
// particles feel the gravity of the two galaxy centres (which also pull on each other and slowly lose speed when they
// overlap, so they merge). It is an illustration, not a prediction: the timeline follows NASA's 2012 Hubble scenario,
// and a 2025 Hubble + Gaia study gives only about a 50-50 chance of a collision in the next 10 billion years.
// Pure (no DOM, no three.js): tested in node. 纯逻辑，可在 node 中测试。
// ─────────────────────────────────────────────────────────────────────────────
const L = (en, zh, es, pt) => ({ en, zh, es, pt });

export const MERGE_SRC = {
  scenario: 'https://science.nasa.gov/asset/hubble/crash-of-the-titans-andromeda-galaxy-and-the-milky-way-collision/',   // collide ~4 Gyr, one galaxy ~6 Gyr
  elliptical: 'https://svs.gsfc.nasa.gov/11011/',   // later clashes over 2 billion years → a combined elliptical galaxy
  odds: 'https://www.esa.int/Science_Exploration/Space_Science/Hubble_and_Gaia_revisit_fate_of_our_galaxy',   // 50-50 in 10 Gyr; LMC, M33
};

export const MERGE_UI = {
  button: L('👏 Galaxy collision', '👏 星系碰撞', '👏 Choque de galaxias', '👏 Colisão de galáxias'),
  title: L('If the Milky Way and Andromeda collide', '如果银河系与仙女座星系相撞', 'Si la Vía Láctea y Andrómeda chocan', 'Se a Via Láctea e Andrômeda colidirem'),
  intro: L('Press Start (in VR, clap your hands; with the camera, pinch) and watch our galaxy and Andromeda fall together, swing past each other and become one galaxy.',
    '按“开始”（在 VR 中拍手；用摄像头时捏合手指），看我们的星系和仙女座星系相互靠近、擦身而过，最后合二为一。',
    'Pulsa Empezar (en VR, aplaude; con la cámara, junta los dedos) y mira cómo nuestra galaxia y Andrómeda se acercan, pasan una junto a la otra y se convierten en una sola.',
    'Toque em Começar (no VR, bata palmas; com a câmera, faça pinça) e veja nossa galáxia e Andrômeda se aproximarem, passarem uma pela outra e virarem uma só.'),
  clapVR: L('👏 Clap your hands to start', '👏 拍手开始', '👏 Aplaude para empezar', '👏 Bata palmas para começar'),
  start: L('👏 Start', '👏 开始', '👏 Empezar', '👏 Começar'),
  replay: L('↺ Watch again', '↺ 再看一次', '↺ Ver otra vez', '↺ Ver de novo'),
  restart: L('↺ Start over', '↺ 重新开始', '↺ Empezar de nuevo', '↺ Recomeçar'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  vrRow: L('👏 Galaxy collision', '👏 星系碰撞', '👏 Choque de galaxias', '👏 Colisão de galáxias'),
  vrStart: L('👏 Start (or clap)', '👏 开始（或拍手）', '👏 Empezar (o aplaude)', '👏 Começar (ou bata palmas)'),
  when: L('≈ {n} billion years from now', '约 {z} 亿年后', 'dentro de unos {m} millones de años', 'daqui a ≈ {n} bilhões de anos'),   // zh counts in 亿 (100 million): {z} = 10 × {n}
  stages: [
    L('Andromeda and the Milky Way fall towards each other', '仙女座星系和银河系相互靠近', 'Andrómeda y la Vía Láctea caen una hacia la otra', 'Andrômeda e a Via Láctea caem uma em direção à outra'),
    L('First close pass: gravity stretches out long tails of stars', '第一次近距离擦过：引力拉出长长的恒星尾巴', 'Primer paso cercano: la gravedad estira largas colas de estrellas', 'Primeira passagem próxima: a gravidade estica longas caudas de estrelas'),
    L('They swing apart, then fall back together', '它们分开，然后再次靠拢', 'Se separan y vuelven a caer juntas', 'Elas se afastam e depois voltam a se juntar'),
    L('One big galaxy, its stars scattered in new orbits', '一个大星系，恒星散布在新的轨道上', 'Una gran galaxia, con sus estrellas en nuevas órbitas', 'Uma grande galáxia, com suas estrelas em novas órbitas'),
  ],
  milkyWay: L('Milky Way', '银河系', 'Vía Láctea', 'Via Láctea'),
  andromeda: L('Andromeda', '仙女座星系', 'Andrómeda', 'Andrômeda'),
  about: L('Is this going to happen?', '这真的会发生吗？', '¿Va a pasar de verdad?', 'Isso vai mesmo acontecer?'),
  scenario: L('In 2012, Hubble measurements pointed to a collision in about 4 billion years, with the two becoming a single galaxy about 6 billion years from now. This animation follows that timeline.',
    '2012 年，哈勃的测量显示两者将在约 40 亿年后相撞，并在约 60 亿年后合并成一个星系。这段动画按这个时间线播放。',
    'En 2012, las mediciones del Hubble apuntaban a un choque dentro de unos 4000 millones de años y a una sola galaxia dentro de unos 6000 millones. Esta animación sigue esa línea de tiempo.',
    'Em 2012, medições do Hubble apontavam para uma colisão em cerca de 4 bilhões de anos e uma única galáxia daqui a cerca de 6 bilhões. Esta animação segue essa linha do tempo.'),
  odds: L('A 2025 study with Hubble and Gaia data found only about a 50-50 chance that the two galaxies collide in the next 10 billion years: the Large Magellanic Cloud tugs the Milky Way away from Andromeda.',
    '2025 年一项利用哈勃和盖亚数据的研究发现，两个星系在未来 100 亿年内相撞的概率只有约 50%：大麦哲伦云会把银河系拉离仙女座星系。',
    'Un estudio de 2025 con datos del Hubble y de Gaia encontró solo un 50 % de probabilidad, más o menos, de que las dos galaxias choquen en los próximos 10.000 millones de años: la Gran Nube de Magallanes aleja un poco la Vía Láctea de Andrómeda.',
    'Um estudo de 2025 com dados do Hubble e do Gaia encontrou só cerca de 50% de chance de as duas galáxias colidirem nos próximos 10 bilhões de anos: a Grande Nuvem de Magalhães puxa a Via Láctea para longe de Andrômeda.'),
  model: L('A simple simulation, not to scale: the galaxies are drawn far larger than life.', '简单模拟，不按比例：星系画得比实际大得多。', 'Una simulación sencilla, no a escala: las galaxias se dibujan mucho más grandes de lo real.', 'Uma simulação simples, fora de escala: as galáxias aparecem muito maiores do que são.'),
  sources: L('Sources', '来源', 'Fuentes', 'Fontes'),
  vrHint: L('Clap again to replay · ✊ hold a fist to go back', '再拍手重播 · ✊ 握拳返回', 'Aplaude otra vez para repetir · ✊ puño para volver', 'Bata palmas de novo para repetir · ✊ punho para voltar'),
  goThere: L('Flying to the Local Group…', '正在飞往本星系群……', 'Volando al Grupo Local…', 'Voando até o Grupo Local…'),
};

// Simulation timeline (simulation units) → billions of years from now, following the 2012 scenario:
// first close pass ≈ 4 Gyr, one galaxy ≈ 6 Gyr. · 模拟时间 → 十亿年
export const SIM_END = 45, SIM_PASS = 15, SIM_MERGED = 35;
export function gyrAt(t) {
  if (t <= SIM_PASS) return 4 * t / SIM_PASS;
  if (t <= SIM_MERGED) return 4 + 2 * (t - SIM_PASS) / (SIM_MERGED - SIM_PASS);
  return 6 + 0.05 * (t - SIM_MERGED);
}
export const stageAt = t => t < SIM_PASS - 1.5 ? 0 : t < SIM_PASS + 3 ? 1 : t < SIM_MERGED - 4 ? 2 : 3;

// Deterministic random · 固定随机
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const EPS = 0.25, EPS_CORE = 0.35;   // softening (galaxy centres are spread out, not points) · 软化长度

// createMergerSim({ n }) → { pos, col, step(dt), t, cores, sep() }. Galaxy A = Milky Way, B = Andromeda (a bit more massive).
export function createMergerSim({ n = 3000, seed = 7 } = {}) {
  const r = rng(seed), N = n * 2, pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const A = { m: 1, x: -4, y: 0, z: 0, vx: 0.12, vy: 0, vz: 0.16 }, B = { m: 1.3, x: 4, y: 0.3, z: 0, vx: -0.12 / 1.3, vy: 0, vz: -0.16 / 1.3 };
  const disks = [
    { core: A, R: 1.4, tilt: [0.35, 0], spin: 1, arms: 4, colors: [[1, 0.9, 0.72], [0.66, 0.78, 1], [1, 0.62, 0.74]] },   // Milky Way: barred, 4 arms
    { core: B, R: 1.8, tilt: [0, -0.9], spin: -1, arms: 2, colors: [[1, 0.88, 0.74], [0.78, 0.84, 1], [1, 0.66, 0.78]] },   // Andromeda: bigger, tilted
  ];
  disks.forEach((d, g) => {
    const [ax, az] = d.tilt, cx = Math.cos(ax), sx = Math.sin(ax), cz = Math.cos(az), sz = Math.sin(az);
    const rot = (x, y, z) => { const y1 = y * cx - z * sx, z1 = y * sx + z * cx; return [x * cz - y1 * sz, x * sz + y1 * cz, z1]; };   // tilt about x, then z
    for (let k = 0; k < n; k++) {
      const i = g * n + k, u = r();
      const rr = 0.12 + d.R * Math.pow(u, 0.75);                         // denser towards the centre · 中心更密
      const arm = Math.floor(r() * d.arms), wind = Math.log(1 + rr * 3) * 2.2;
      const th = arm * 2 * Math.PI / d.arms + wind + (r() - 0.5) * (0.9 - 0.4 * Math.min(1, rr));
      const h = (r() - 0.5) * 0.06 * (1 + rr);
      const [x, y, z] = rot(rr * Math.cos(th), h, rr * Math.sin(th));
      const v = Math.sqrt(d.core.m * rr * rr / Math.pow(rr * rr + EPS * EPS, 1.5)) * d.spin;   // circular speed · 圆周速度
      const [vx, vy, vz] = rot(-Math.sin(th) * v, 0, Math.cos(th) * v);
      pos.set([d.core.x + x, d.core.y + y, d.core.z + z], i * 3); vel.set([d.core.vx + vx, d.core.vy + vy, d.core.vz + vz], i * 3);
      const c = rr < 0.35 ? d.colors[0] : r() < 0.08 ? d.colors[2] : d.colors[1], b = 0.55 + 0.45 * r();
      col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
    }
  });
  const sim = { pos, vel, col, count: N, t: 0, cores: [A, B] };
  sim.sep = () => Math.hypot(B.x - A.x, B.y - A.y, B.z - A.z);
  sim.step = dt => {
    const pos = sim.pos;   // the caller may hand the simulation another array to write into (the GPU copy) · 可替换的输出数组
    // the two centres pull on each other; when they overlap they lose speed (dynamical friction), so they merge · 两个中心互相吸引并逐渐减速合并
    const dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z, r2 = dx * dx + dy * dy + dz * dz + EPS_CORE * EPS_CORE, f = 1 / (r2 * Math.sqrt(r2)), d = Math.sqrt(r2 - EPS_CORE * EPS_CORE);
    const kf = d < 3 ? 0.12 * (1 - d / 3) : 0, rvx = B.vx - A.vx, rvy = B.vy - A.vy, rvz = B.vz - A.vz, M = A.m + B.m;
    A.vx += (dx * f * B.m + kf * rvx * B.m / M) * dt; A.vy += (dy * f * B.m + kf * rvy * B.m / M) * dt; A.vz += (dz * f * B.m + kf * rvz * B.m / M) * dt;
    B.vx += (-dx * f * A.m - kf * rvx * A.m / M) * dt; B.vy += (-dy * f * A.m - kf * rvy * A.m / M) * dt; B.vz += (-dz * f * A.m - kf * rvz * A.m / M) * dt;
    A.x += A.vx * dt; A.y += A.vy * dt; A.z += A.vz * dt; B.x += B.vx * dt; B.y += B.vy * dt; B.z += B.vz * dt;
    const e2 = EPS * EPS;
    for (let i = 0; i < N; i++) {
      const j = i * 3, px = pos[j], py = pos[j + 1], pz = pos[j + 2];
      let ax = 0, ay = 0, az = 0;
      for (const c of sim.cores) { const qx = c.x - px, qy = c.y - py, qz = c.z - pz, q2 = qx * qx + qy * qy + qz * qz + e2, g = c.m / (q2 * Math.sqrt(q2)); ax += qx * g; ay += qy * g; az += qz * g; }
      vel[j] += ax * dt; vel[j + 1] += ay * dt; vel[j + 2] += az * dt;
      pos[j] = px + vel[j] * dt; pos[j + 1] = py + vel[j + 1] * dt; pos[j + 2] = pz + vel[j + 2] * dt;
    }
    sim.t += dt;
  };
  return sim;
}

// "≈ 4.0 billion years from now" in each language (Chinese counts in 亿 = 100 million) · 各语言的时间标签
export function whenText(gyr, lang) {
  const loc = { en: 'en-US', zh: 'zh-CN', es: 'es-ES', pt: 'pt-BR' }[lang] || 'en-US';
  gyr = Math.max(0.1, gyr);   // never "0.0 billion years" · 最少 0.1
  const n = gyr.toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), z = Math.round(gyr * 10).toLocaleString(loc);
  let s = (MERGE_UI.when[lang] || MERGE_UI.when.en).replace('{n}', n).replace('{z}', z).replace('{m}', (Math.round(gyr * 10) * 100).toLocaleString(loc));
  if (lang === 'pt' && Math.round(gyr * 10) < 20) s = s.replace('bilhões', 'bilhão');   // 1,2 bilhão · singular below 2
  return s;
}
