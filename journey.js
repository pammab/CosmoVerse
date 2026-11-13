// ─────────────────────────────────────────────────────────────────────────────
// Scale journey · 尺度之旅 · Viaje de escala · Viagem de escala
// Zoom out past the Solar System to the Milky Way, the Local Group … the observable universe, and back.
// 从太阳系一路缩小到银河系、本星系群……直到可观测宇宙，再回来。
//   • Pure helpers (levels, zoom-edge detection, piece checks) work without three.js, so tests run in node.
//   • createJourney({ T, … }) builds the particle scenes; main.js passes three.js in and drives it.
// Each level has its own scale: distances are NOT to scale between levels.
// ─────────────────────────────────────────────────────────────────────────────
import { makeShape, SHAPE_KINDS } from './shapes.js';

export const LANG4 = ['en', 'zh', 'es', 'pt'];
const L = (en, zh, es, pt) => ({ en, zh, es, pt });

// Outermost first · 由外到内
export const LEVELS = [
  { id: 'universe', names: L('Observable Universe', '可观测宇宙', 'Universo observable', 'Universo observável'),
    blurb: L('Galaxies strung along a cosmic web. Point at it, or zoom in to come back home.', '星系沿宇宙网排列。指向它，或放大回家。', 'Galaxias en una red cósmica. Apúntala o acerca el zoom para volver a casa.', 'Galáxias numa teia cósmica. Aponte para ela ou aproxime o zoom para voltar para casa.') },
  { id: 'supercluster', names: L('Supercluster', '超星系团', 'Supercúmulo', 'Superaglomerado'),
    blurb: L('Groups and clusters of galaxies, joined in our home supercluster, Laniakea. Our Local Group is one small knot near its edge. Point at it to learn more.', '星系群和星系团连成我们的家园超星系团——拉尼亚凯亚。本星系群只是它边缘的一个小结。指向它了解更多。', 'Grupos y cúmulos de galaxias unidos en nuestro supercúmulo, Laniakea. Nuestro Grupo Local es un pequeño nudo cerca de su borde. Apúntalo para saber más.', 'Grupos e aglomerados de galáxias unidos no nosso superaglomerado, Laniakea. Nosso Grupo Local é um pequeno nó perto da borda. Aponte para ele para saber mais.'),
    // "You are here · Local Group" belongs to the Laniakea piece (pieces/laniakea.js), on its outer edge · 标记在拉尼亚凯亚天体里
    backdrop: { kind: 'web', count: 15000, colors: ['#8fb0ff', '#ffe0ae', '#5c6c9a'], params: { nodes: 40 }, seed: 31, size: 110 } },   // lighter, so Laniakea stands out · 背景更淡
  { id: 'local-group', names: L('Local Group', '本星系群', 'Grupo Local', 'Grupo Local'),
    blurb: L('Our galaxy’s family. Point at the group to learn about it.', '我们星系的家族。指向星系群了解更多。', 'La familia de nuestra galaxia. Apunta al grupo para saber más.', 'A família da nossa galáxia. Aponte para o grupo para saber mais.') },
  { id: 'galaxy', names: L('Galaxy', '银河系', 'Galaxia', 'Galáxia'),
    blurb: L('Our home galaxy, seen from outside. Find the Sun, then point at the galaxy to open it.', '从外面看我们的家园星系。找到太阳，再指向星系打开它。', 'Nuestra galaxia vista desde fuera. Busca el Sol y apunta a la galaxia para abrirla.', 'Nossa galáxia vista de fora. Encontre o Sol e aponte para a galáxia para abri-la.') },
  { id: 'neighbourhood', names: L('Solar Neighbourhood', '太阳邻域', 'Vecindario solar', 'Vizinhança solar'),
    blurb: L('The stars around the Sun, in a quiet arm of the Milky Way. Zoom out for the whole galaxy.', '太阳周围的恒星，位于银河系一条安静的旋臂中。缩小可看到整个银河系。', 'Las estrellas que rodean al Sol, en un brazo tranquilo de la Vía Láctea. Aleja el zoom para ver toda la galaxia.', 'As estrelas em volta do Sol, num braço tranquilo da Via Láctea. Afaste o zoom para ver a galáxia inteira.'),
    backdrop: { kind: 'starfield', count: 2600, colors: ['#ffffff', '#fff1d6', '#ffd29a', '#ffb07a', '#cdd9ff'], params: { flat: 0.5 }, seed: 41, size: 110 },
    sun: true,
    marker: { names: L('You are here · the Sun', '你在这里 · 太阳', 'Estás aquí · el Sol', 'Você está aqui · o Sol'), at: [0, 0, 0] } },
  { id: 'solar-system', names: L('Solar System', '太阳系', 'Sistema solar', 'Sistema Solar') },
];
export const LEVEL_IDS = LEVELS.map(l => l.id);
export const levelById = id => LEVELS.find(l => l.id === id) || null;
export const levelIndex = id => LEVEL_IDS.indexOf(id);
export const outerLevel = id => levelIndex(id) > 0 ? LEVEL_IDS[levelIndex(id) - 1] : null;
export const innerLevel = id => levelIndex(id) >= 0 && levelIndex(id) < LEVEL_IDS.length - 1 ? LEVEL_IDS[levelIndex(id) + 1] : null;
// "Galaxy ▸ Solar Neighbourhood ▸ Solar System": from the current level in to home · 当前层级到太阳系
export const pathFrom = id => LEVEL_IDS.slice(Math.max(0, levelIndex(id)));

export const SCALE_NOTE = L('Each level has its own scale: distances between levels are not to scale, and galaxies are drawn larger than life.',
  '每一层都有自己的比例：层与层之间的距离不按比例，星系也画得比实际大。',
  'Cada nivel tiene su propia escala: las distancias entre niveles no están a escala y las galaxias se dibujan más grandes de lo real.',
  'Cada nível tem a sua própria escala: as distâncias entre níveis não estão em escala e as galáxias aparecem maiores do que são.');
export const UI = {
  here: L('You are here', '你在这里', 'Estás aquí', 'Você está aqui'),
  out: L('Scroll or pinch out to leave the Solar System', '滚动或捏合缩小，离开太阳系', 'Desplaza o pellizca hacia fuera para salir del sistema solar', 'Role ou pince para fora para sair do Sistema Solar'),
  back: L('⟵ Back', '⟵ 返回', '⟵ Volver', '⟵ Voltar'),
  vrBack: L('Press ⟵ Back or hold a fist to return', '按 ⟵ 返回，或保持握拳返回', 'Pulsa ⟵ Volver o mantén el puño para regresar', 'Toque ⟵ Voltar ou feche o punho para voltar'),
  vrHint: L('Pinch and move, or use both hands, to travel', '捏合并移动，或用双手，来穿越尺度', 'Pellizca y mueve, o usa las dos manos, para viajar', 'Pince e mova, ou use as duas mãos, para viajar'),
  vrGuide: [
    [L('🤏 Pinch + down · 🤏🤏 apart', '🤏 捏住向下 · 🤏🤏 双手分开', '🤏 Pellizca y baja · 🤏🤏 separa', '🤏 Pince e desça · 🤏🤏 afaste'), L('Zoom in · towards home', '放大 · 回家方向', 'Acercar · hacia casa', 'Aproximar · rumo a casa')],
    [L('🤏 Pinch + up · 🤏🤏 together', '🤏 捏住向上 · 🤏🤏 双手合拢', '🤏 Pellizca y sube · 🤏🤏 junta', '🤏 Pince e suba · 🤏🤏 junte'), L('Zoom out · further away', '缩小 · 更远处', 'Alejar · más lejos', 'Afastar · mais longe')],
    [L('☝ Point + hold', '☝ 指向并停留', '☝ Apunta y espera', '☝ Aponte e segure'), L('Open what you point at', '打开所指的天体', 'Abre lo que apuntas', 'Abre o que você aponta')],
    [L('✊ Hold a fist', '✊ 保持握拳', '✊ Mantén el puño', '✊ Feche o punho'), L('Back to the Solar System', '返回太阳系', 'Volver al sistema solar', 'Voltar ao Sistema Solar')],
  ],
  edge: L('This is the edge of what we can see.', '这里已是我们能看到的边界。', 'Este es el límite de lo que podemos ver.', 'Este é o limite do que podemos ver.'),
};

/* ── Zoom past the edge · 越过缩放边界 ──
   Every zoom input calls edgeStep with a zoom factor f (wheel notch, pinch step, two-hand ratio step).
   Zoom is clamped to [min, max] as before; whatever is asked beyond the limit builds up "pressure"
   (log units). When it passes `threshold` we move a level: 'up' (zoomed out past min) or 'down'.
   Turning back clears the pressure; main.js lets it fade over time. */
export const EDGE_THRESHOLD = 0.6;
export function edgeStep(edge, z, f, [min, max], threshold = EDGE_THRESHOLD) {
  const raw = z * f, clamped = Math.min(max, Math.max(min, raw));
  if (f < 1) edge.in = 0; else if (f > 1) edge.out = 0;
  if (raw < min) edge.out = (edge.out || 0) + Math.log(min / raw);
  if (raw > max) edge.in = (edge.in || 0) + Math.log(raw / max);
  let action = null;
  if ((edge.out || 0) > threshold) action = 'up'; else if ((edge.in || 0) > threshold) action = 'down';
  if (action) { edge.out = 0; edge.in = 0; }
  return { z: clamped, action };
}
export function decayEdge(edge, dt) { const k = Math.exp(-dt * 1.2); edge.out = (edge.out || 0) * k; edge.in = (edge.in || 0) * k; }

/* ── Piece schema check (used by the tests) · 检查天体数据格式 ── */
const ALLOWED_SOURCES = /^https:\/\/([\w-]+\.)*(nasa\.gov|esa\.int|iau\.org|eso\.org|noirlab\.edu|stsci\.edu|hubblesite\.org|esahubble\.org|esawebb\.org|webbtelescope\.org|doi\.org|nature\.com|iopscience\.iop\.org|aanda\.org|academic\.oup\.com|arxiv\.org)\//;
const has4 = o => !!o && LANG4.every(k => typeof o[k] === 'string' && o[k].trim().length > 0);
export function validatePiece(p) {
  const err = [], at = what => err.push((p?.id || '?') + ': ' + what);
  if (!p || typeof p.id !== 'string' || !/^[a-z0-9-]+$/.test(p.id)) at('bad id');
  if (!LEVEL_IDS.includes(p?.level) || p?.level === 'solar-system') at('bad level ' + p?.level);
  if (!has4(p?.names)) at('names need en/zh/es/pt');
  if (!has4(p?.type)) at('type needs en/zh/es/pt');
  if (!p?.shape || !SHAPE_KINDS.includes(p.shape.kind)) at('unknown shape kind');
  if (!(p?.shape?.count > 0 && p.shape.count <= 120000)) at('shape.count out of range');
  if (!Array.isArray(p?.shape?.colors) || !p.shape.colors.every(c => /^#[0-9a-f]{6}$/i.test(c))) at('shape.colors must be #rrggbb');
  if (!Array.isArray(p?.position) || p.position.length !== 3 || !p.position.every(Number.isFinite)) at('bad position');
  if (!(p?.size > 0)) at('bad size');
  if (!Array.isArray(p?.facts) || p.facts.length < 5 || p.facts.length > 6) at('needs 5–6 facts');
  (p?.facts || []).forEach((f, i) => {
    if (!has4(f?.label) || !has4(f?.value)) at(`fact ${i} needs en/zh/es/pt label and value`);
    if (!f?.source?.name || !ALLOWED_SOURCES.test(f?.source?.url || '')) at(`fact ${i} needs a NASA/JPL/ESA/IAU/ESO/NOIRLab/STScI or journal URL`);
  });
  if (!has4(p?.narration)) at('narration needs en/zh/es/pt');
  if (!has4(p?.clue)) at('clue needs en/zh/es/pt');
  if (p?.youAreHere != null && (!has4(p.youAreHere) || !Array.isArray(p.youAreHere.at) || p.youAreHere.at.length !== 3)) at('youAreHere needs en/zh/es/pt and at:[x,y,z]');
  if (p?.frame != null && !(p.frame > 0)) at('frame must be > 0');
  if (p?.spin != null && !Number.isFinite(p.spin)) at('spin must be a number (rad/s)');
  if (p?.isolate != null && typeof p.isolate !== 'boolean') at('isolate must be true/false');
  if (p?.labelAt != null && !(Array.isArray(p.labelAt) && p.labelAt.length === 3 && p.labelAt.every(Number.isFinite))) at('labelAt must be [x, y, z]');
  if (p?.tilt != null && !(Array.isArray(p.tilt) && p.tilt.length === 2 && p.tilt.every(Number.isFinite))) at('tilt must be [rx, rz]');
  for (const lb of p?.labels || []) if (!has4(lb.names) || !Array.isArray(lb.at)) at('labels need names (4 languages) and at');
  return err;
}

/* ── Text helpers · 文本 ── */
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// All four languages as spans; CSS shows the chosen one · 四种语言，CSS 只显示当前语言
export const quad = o => LANG4.map(k => `<span class="${k}" lang="${k === 'zh' ? 'zh-CN' : k}">${esc(o?.[k] ?? o?.en ?? '')}</span>`).join('');
export const tr = (o, lang) => o?.[lang] ?? o?.en ?? '';

/* ───────── The particle scenes (browser only) · 粒子场景（仅浏览器） ───────── */
// Soft round points sized in world units; xr.js does not touch ShaderMaterials, so we divide by the VR dolly scale here.
// 点大小以世界单位计算；VR 中在此除以 dolly 缩放。
const VERT = `attribute float aSize; attribute vec3 color; uniform float uSize, uOpacity, uViewH; varying vec3 vColor; varying float vA;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  float s = uSize * aSize * uViewH * 0.5 * projectionMatrix[1][1] / max(1e-4, -mv.z);
  vA = uOpacity * clamp(s / 1.6, 0.12, 1.0); gl_PointSize = clamp(s, 1.6, 24.0); vColor = color; }`;
const FRAG = `varying vec3 vColor; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard;
  float g = pow(1.0 - r, 1.7); gl_FragColor = vec4(vColor, g * vA); }`;

export function createJourney({ T, scene, pieces = [], sizeScale = () => 1, viewHeight = () => innerHeight, onOpen = () => {} }) {
  const root = new T.Group(); root.name = 'journey'; scene.add(root);
  const mats = [];
  function points(spec, size) {
    const s = makeShape(spec.kind, spec.count, spec.colors, spec.params || {}, spec.seed);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(s.positions, 3)); g.setAttribute('color', new T.BufferAttribute(s.colors, 3)); g.setAttribute('aSize', new T.BufferAttribute(s.sizes, 1));
    const m = new T.ShaderMaterial({ uniforms: { uSize: { value: 1 }, uOpacity: { value: 1 }, uViewH: { value: 900 } }, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    const p = new T.Points(g, m); p.scale.setScalar(size); p.frustumCulled = false; p.userData.jp = { base: 0.7, fade: 1 }; mats.push(p);
    return p;
  }
  // "You are here" beacon: one soft cyan point that breathes · “你在这里”信标
  function beacon(at) {
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(at), 3));
    g.setAttribute('color', new T.BufferAttribute(new Float32Array([0.55, 0.85, 1]), 3)); g.setAttribute('aSize', new T.BufferAttribute(new Float32Array([1]), 1));
    const m = new T.ShaderMaterial({ uniforms: { uSize: { value: 1 }, uOpacity: { value: 1 }, uViewH: { value: 900 } }, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    const p = new T.Points(g, m); p.frustumCulled = false; p.userData.jp = { base: 2.4, fade: 1, beacon: true }; mats.push(p); return p;
  }
  const tags = [];   // HTML labels for pieces and markers · 屏幕标签
  // While a piece is open, hide the other pieces' labels (they slid over the title) · 打开天体时隐藏其他天体的标签
  const otherOpen = t => !!state.piece && t.owner !== state.piece;   // level markers too (judge 2026-11-13b)
  function tag(obj, names, cls, pieceId, level) {
    const el = document.createElement(pieceId ? 'button' : 'div'); el.className = 'jtag ' + cls;
    if (pieceId) { el.type = 'button'; el.innerHTML = `<span class="ring"></span><span class="name">${quad(names)}</span>`; el.onclick = () => onOpen(pieceId); }
    else el.innerHTML = `<span class="dot"></span><span class="name">${quad(names)}</span>`;
    el.style.display = 'none'; document.body.append(el);
    const t = { el, obj, names, cls, pieceId, level }; tags.push(t); return t;
  }

  const levels = {}, pieceById = {};
  for (const lv of LEVELS) {
    if (lv.id === 'solar-system') continue;
    const group = new T.Group(); group.visible = false; root.add(group);
    const L = levels[lv.id] = { def: lv, group, pieces: [], spin: [] };
    if (lv.backdrop) { const p = points(lv.backdrop, lv.backdrop.size); const sp = new T.Group(); sp.add(p); group.add(sp); L.spin.push([sp, 0.004]); }
    if (lv.sun) {   // the Sun as a warm star with a soft corona · 太阳
      const p = points({ kind: 'star', count: 700, colors: ['#fff4dc', '#ffc56e'], seed: 5 }, 6); group.add(p);
    }
    if (lv.marker) { const o = new T.Object3D(); o.position.fromArray(lv.marker.at); group.add(o, beacon(lv.marker.at)); tag(o, lv.marker.names, 'here', null, lv.id); }
  }
  for (const pc of pieces) {
    const L = levels[pc.level]; if (!L) continue;
    const holder = new T.Group(); holder.position.fromArray(pc.position); L.group.add(holder);
    if (pc.tilt) holder.rotation.set(pc.tilt[0], 0, pc.tilt[1]);   // optional [rx, rz] tilt · 可选倾角
    const spin = new T.Group(); holder.add(spin);
    const pts = points({ ...pc.shape, seed: pc.shape.seed }, pc.size); spin.add(pts);
    const speed = pc.spin ?? (/spiral/.test(pc.shape.kind) ? 0.012 : pc.shape.kind === 'web' ? 0.005 : 0.003);   // optional spin (rad/s) · 可选自转速度
    L.spin.push([spin, speed]);
    const centre = new T.Object3D(); holder.add(centre); if (pc.labelAt) centre.position.fromArray(pc.labelAt);   // optional label offset · 可选标签偏移
    const entry = { p: pc, holder, spin, pts, centre, extra: [] };
    entry.tag = tag(centre, pc.names, 'piece', pc.id, pc.level);
    if (pc.youAreHere) { const o = new T.Object3D(); o.position.fromArray(pc.youAreHere.at); spin.add(o, beacon(pc.youAreHere.at)); entry.here = tag(o, pc.youAreHere, 'here', null, pc.level); }
    for (const lb of pc.labels || []) { const o = new T.Object3D(); o.position.fromArray(lb.at); spin.add(o); const t = tag(o, lb.names, 'sub', null, pc.level); if (lb.r != null) t.r = lb.r; entry.extra.push(t); }
    for (const t of [entry.tag, entry.here, ...entry.extra]) if (t) t.owner = pc.id;   // whose label is this · 标签归属
    L.pieces.push(entry); pieceById[pc.id] = entry;
  }
  // Streaks that rush past during a level change · 切换层级时掠过的光点
  const warp = points({ kind: 'starfield', count: 1800, colors: ['#cfe0ff', '#ffffff', '#ffe2b8'], params: { flat: 1 }, seed: 77 }, 260);
  warp.visible = false; warp.userData.jp.base = 0.35; root.add(warp);

  const state = { level: null, piece: null, prev: null, t: 1, dir: 'up', hover: null };
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Change level with a fade-and-stream transition. dir 'up' = zooming out · 切换层级
  function go(id, dir) {
    if (id === state.level && !state.piece) return;
    state.prev = state.level; state.level = id === 'solar-system' ? null : id; state.piece = null; state.t = 0; state.dir = dir;
  }
  const leave = () => { if (state.level || state.piece) go('solar-system', 'down'); };
  function open(id) { const e = pieceById[id]; if (!e) return false; if (e.p.level !== state.level) go(e.p.level, 'down'); state.piece = id; return true; }
  const close = () => { state.piece = null; };

  const wp = new T.Vector3(), camW = new T.Vector3();
  function target(out) { const e = state.piece && pieceById[state.piece]; return e ? e.holder.getWorldPosition(out) : out.set(0, 0, 0); }
  function viewRadius() {
    const e = state.piece && pieceById[state.piece]; if (e) return e.p.size * (e.p.frame || 1);   // frame: optional close-up zoom-out · 可选取景系数
    const L = levels[state.level]; if (!L) return 110;
    return Math.max(L.def.backdrop?.size || 0, ...L.pieces.map(e => e.p.size + Math.hypot(...e.p.position)), 60);
  }

  function update(dt, camera, active) {
    if (!active && (state.level || state.piece) && state.t >= 1) leave();
    state.t = Math.min(1, state.t + dt / 1.6);
    const e = ease(state.t), up = state.dir === 'up';
    for (const id in levels) {
      const L = levels[id]; let sc = 1, op = 0;
      if (id === state.level) { sc = up ? 4 - 3 * e : 0.25 + 0.75 * e; op = e; }
      else if (id === state.prev && state.t < 1) { sc = up ? 1 - 0.75 * e : 1 + 3 * e; op = 1 - e; }
      L.group.visible = op > 0.01; L.group.scale.setScalar(sc); L.op = op;
      if (L.group.visible) for (const [g, s] of L.spin) g.rotation.y += dt * s;
    }
    const wt = state.t < 1 ? Math.sin(Math.PI * state.t) : 0;
    warp.visible = wt > 0.01; warp.scale.setScalar(260 * (up ? 3 - 2.6 * e : 0.4 + 2.6 * e)); warp.userData.jp.fade = wt * 0.8;
    // Point sizes: world size → divide by the VR dolly scale · 点大小（VR 修正）
    const vh = viewHeight(), ss = sizeScale(), now = performance.now() / 1000;
    for (const p of mats) {
      if (!p.visible) continue; let o = p; let vis = true; while (o) { if (!o.visible) { vis = false; break; } o = o.parent; } if (!vis) continue;
      p.getWorldScale(wp); const lv = levelOf(p);
      // Other pieces dim while one is open; almost vanish if the open piece asks to be isolated (Sgr A* inside the galaxy's bright core) · 其他天体变暗
      const dim = state.piece && p.userData.pieceId && p.userData.pieceId !== state.piece ? (pieceById[state.piece]?.p.isolate ? 0.04 : 0.3) : 1;
      p.material.uniforms.uSize.value = p.userData.jp.base * wp.x / ss * (p.userData.jp.beacon ? 1 + 0.35 * Math.sin(now * 3) : 1);
      p.material.uniforms.uOpacity.value = p === warp ? p.userData.jp.fade : (lv?.op ?? 0) * (p.userData.jp.beacon ? 1 : dim);
      p.material.uniforms.uViewH.value = vh;
    }
    // HTML labels · 屏幕标签
    camera.getWorldPosition(camW);
    for (const t of tags) {
      const L = levels[t.level], show = !!L && t.level === state.level && state.t > 0.7 && !(t.pieceId && state.piece === t.pieceId) && !otherOpen(t);
      if (!show) { t.el.style.display = 'none'; continue; }
      t.obj.getWorldPosition(wp); wp.project(camera);
      if (wp.z > 1 || Math.abs(wp.x) > 1.05 || Math.abs(wp.y) > 1.05) { t.el.style.display = 'none'; continue; }
      t.el.style.display = 'block'; t.el.style.transform = `translate(${(wp.x + 1) / 2 * innerWidth}px,${(1 - wp.y) / 2 * innerHeight}px)`;
      t.el.classList.toggle('hover', !!t.pieceId && state.hover === t.pieceId);
    }
  }
  // Tag each piece's Points with its id (for dimming) and find a Points' level · 记录归属
  for (const id in pieceById) pieceById[id].pts.userData.pieceId = id;
  const levelOfCache = new Map();
  function levelOf(p) {
    if (levelOfCache.has(p)) return levelOfCache.get(p);
    let o = p, res = null; while (o) { for (const id in levels) if (levels[id].group === o) res = levels[id]; o = o.parent; }
    levelOfCache.set(p, res); return res;
  }

  // Which piece is under the cursor? (screen px) · 拾取
  function pick(camera, x, y, minPx = 22) {
    const L = levels[state.level]; if (!L || state.t < 0.6) return null;
    camera.getWorldPosition(camW);
    const tanHalf = Math.tan(camera.fov * Math.PI / 360);
    let best = null, score = Infinity;
    for (const e of L.pieces) {
      e.holder.getWorldPosition(wp); const dist = camW.distanceTo(wp); wp.project(camera); if (wp.z > 1) continue;
      const px = (wp.x + 1) / 2 * innerWidth, py = (1 - wp.y) / 2 * innerHeight;
      const r = e.p.size * L.group.scale.x / (dist * tanHalf) * innerHeight / 2, reach = Math.max(minPx, r * 0.85), d = Math.hypot(px - x, py - y);
      // Smallest target under the cursor wins (Andromeda inside the Local Group) · 光标下最小的目标优先
      if (d <= reach && reach + d * 0.01 < score) { score = reach + d * 0.01; best = e.p.id; }
    }
    return best;
  }
  // Labels for the VR headset (xr.js sprites) · VR 标签
  const xrLabels = (lang = 'en') => tags.map(t => ({ obj: t.obj, text: tr(t.names, lang), color: t.cls === 'here' ? '#8bd6ff' : t.cls === 'sub' ? '#c9d3e6' : '#ffffff', r: t.r ?? (t.cls === 'piece' ? 6 : 2),
    visible: () => t.level === state.level && state.t > 0.7 && !(t.pieceId && state.piece === t.pieceId) && !otherOpen(t) }));

  return {
    root, go, leave, open, close, update, pick, target, viewRadius, xrLabels,
    get level() { return state.level; }, get piece() { return state.piece; }, get busy() { return state.t < 1; },
    pieceData: id => pieceById[id]?.p || null, levelPieces: id => (levels[id]?.pieces || []).map(e => e.p),
    setHover: id => { state.hover = id; },
  };
}
