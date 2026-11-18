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
    blurb: L('The stars around the Sun, in the Orion Spur, a small arm of the Milky Way. Zoom out for the whole galaxy.', '太阳周围的恒星，位于银河系的猎户座支臂中。缩小可看到整个银河系。', 'Las estrellas que rodean al Sol, en el espolón (brazo) de Orión de la Vía Láctea. Aleja el zoom para ver toda la galaxia.', 'As estrelas em volta do Sol, no esporão (braço) de Órion da Via Láctea. Afaste o zoom para ver a galáxia inteira.'),
    backdrop: { kind: 'starfield', count: 2600, colors: ['#ffffff', '#fff1d6', '#ffd29a', '#ffb07a', '#cdd9ff'], params: { flat: 0.5 }, seed: 41, size: 110 },
    sun: true,
    marker: { names: L('You are here · the Sun', '你在这里 · 太阳', 'Estás aquí · el Sol', 'Você está aqui · o Sol'), at: [0, 0, 0] } },
  { id: 'solar-system', names: L('Solar System', '太阳系', 'Sistema solar', 'Sistema Solar') },
];
export const LEVEL_IDS = LEVELS.map(l => l.id);
// Labels with onlyOpen show only in their own piece's close-up (HTML and VR) · 仅在所属天体特写时显示
export const onlyOpenHidden = (t, openPiece) => !!t.onlyOpen && openPiece !== t.owner;
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
  journey: L('Scale journey', '尺度之旅', 'Viaje de escala', 'Viagem de escala'),   // top-left eyebrow in journey mode · 左上角小标题
  out: L('Scroll or pinch out to leave the Solar System', '滚动或捏合缩小，离开太阳系', 'Desplaza o pellizca hacia fuera para salir del sistema solar', 'Role ou pince para fora para sair do Sistema Solar'),
  back: L('⟵ Back', '⟵ 返回', '⟵ Volver', '⟵ Voltar'),
  // "What is it?" + image caption words in the piece panel (explain-pieces) · 天体面板：“这是什么？”与图片说明
  whatIs: L('What is it?', '这是什么？', '¿Qué es?', 'O que é?'),
  kind: { photo: L('Photo', '照片', 'Foto', 'Foto'), illustration: L('Artist’s illustration', '艺术想象图', 'Ilustración artística', 'Ilustração artística'),
    simulation: L('Computer simulation', '计算机模拟', 'Simulación por ordenador', 'Simulação de computador'), radio: L('Radio image', '射电图像', 'Imagen de radio', 'Imagem de rádio') },
  imgOpen: L('Open the original image page', '打开原始图片页面', 'Abrir la página de la imagen original', 'Abrir a página da imagem original'),
  vrBack: L('Press ⟵ Back or hold a fist to return', '按 ⟵ 返回，或保持握拳返回', 'Pulsa ⟵ Volver o mantén el puño para regresar', 'Toque ⟵ Voltar ou feche o punho para voltar'),
  vrHint: L('Pinch and move, or use both hands, to travel', '捏合并移动，或用双手，来穿越尺度', 'Pellizca y mueve, o usa las dos manos, para viajar', 'Pince e mova, ou use as duas mãos, para viajar'),
  vrGuide: [
    [L('🤏 Pinch + down · 🤏🤏 apart', '🤏 捏住向下 · 🤏🤏 双手分开', '🤏 Pellizca y baja · 🤏🤏 separa', '🤏 Pince e desça · 🤏🤏 afaste'), L('Zoom in · towards home', '放大 · 回家方向', 'Acercar · hacia casa', 'Aproximar · rumo a casa')],
    [L('🤏 Pinch + up · 🤏🤏 together', '🤏 捏住向上 · 🤏🤏 双手合拢', '🤏 Pellizca y sube · 🤏🤏 junta', '🤏 Pince e suba · 🤏🤏 junte'), L('Zoom out · further away', '缩小 · 更远处', 'Alejar · más lejos', 'Afastar · mais longe')],
    [L('☝ Point + hold', '☝ 指向并停留', '☝ Apunta y espera', '☝ Aponte e segure'), L('Open what you point at', '打开所指的天体', 'Abre lo que apuntas', 'Abre o que você aponta')],
    [L('✊ Hold a fist', '✊ 保持握拳', '✊ Mantén el puño', '✊ Feche o punho'), L('Go back one step', '返回上一步', 'Volver un paso', 'Voltar um passo')],
  ],
  ladder: L('Biggest to smallest', '由大到小', 'De lo más grande a lo más pequeño', 'Do maior ao menor'),   // side menu title · 侧边菜单标题
  // The opening cover (universe level, no piece open): app text, no facts · 开场封面文字
  coverEyebrow: L('A planetarium in your hands', '掌中的天文馆', 'Un planetario en tus manos', 'Um planetário nas suas mãos'),
  coverText: L('Everything we can see, out to the cosmic web. Zoom in to fly home to the Solar System, point at anything to open it, or pick a place in “Go to”.',
    '我们能看到的一切，直到宇宙网。放大即可飞回太阳系，指向任何东西就能打开它，或在“前往”里选一个地方。',
    'Todo lo que podemos ver, hasta la red cósmica. Acerca el zoom para volar a casa, al sistema solar, apunta a algo para abrirlo o elige un lugar en “Ir a”.',
    'Tudo o que conseguimos ver, até a teia cósmica. Aproxime o zoom para voar para casa, até o Sistema Solar, aponte para algo para abri-lo ou escolha um lugar em “Ir para”.'),
  goTo: L('Go to', '前往', 'Ir a', 'Ir para'),   // ladder title: the ladder is the way around (no Solar System button) · 阶梯标题
  ladderShort: L('Scale', '尺度', 'Escala', 'Escala'),   // collapsed button (phones) · 折叠按钮
  ladderHint: L('Click a step to travel there', '点击一级即可前往', 'Haz clic en un nivel para viajar allí', 'Clique num nível para viajar até lá'),
  vrMenu: L('Keep pointing to travel there', '保持指向即可前往', 'Sigue apuntando para viajar allí', 'Continue apontando para viajar até lá'),
  edge: L('This is the edge of what we can see.', '这里已是我们能看到的边界。', 'Este es el límite de lo que podemos ver.', 'Este é o limite do que podemos ver.'),
};

/* ── Scale ladder · 尺度阶梯 ──
   The side menu, biggest to smallest: every level; under the current journey level its pieces; under the
   Solar System the Sun and planets (always, so Earth or Saturn is one click from anywhere). Row ids:
   'L:<level>', 'P:<piece>', 'B:<body>'. A piece named like its level (Local Group, Observable Universe) gets no
   row of its own: clicking the level row again opens it (ladderTarget). Used by the page and the VR panel. */
const sameName = (p, lv) => p.names.en === lv.names.en;
export function ladderRows({ level = 'solar-system', piece = null, body = null, pieces = [], bodies = [] } = {}) {
  const rows = [], cur = levelIndex(level);
  LEVELS.forEach((lv, i) => {
    rows.push({ id: 'L:' + lv.id, names: lv.names, depth: 0, here: i === cur, on: i === cur && !body && (!piece || pieces.some(p => p.id === piece && sameName(p, lv))), past: i > cur });
    if (lv.id === 'solar-system') for (const b of bodies) rows.push({ id: 'B:' + b.id, names: b.names, depth: 1, color: b.color, on: b.id === body });
    else if (i === cur) for (const p of pieces) if (p.level === lv.id && !sameName(p, lv)) rows.push({ id: 'P:' + p.id, names: p.names, depth: 1, color: p.shape?.colors?.[0], on: p.id === piece });
  });
  return rows;
}
// What a click on a row does: { go: level } | { open: piece } | { select: body } | { close: true } · 点击行的动作
export function ladderTarget(id, { level = 'solar-system', piece = null, pieces = [] } = {}) {
  const [k, v] = [id.slice(0, 1), id.slice(2)];
  if (k === 'B') return { select: v };
  if (k === 'P') return { open: v };
  if (k !== 'L' || !levelById(v)) return null;
  if (v !== level) return { go: v, dir: levelIndex(v) < levelIndex(level) ? 'up' : 'down' };
  const twin = pieces.find(p => p.level === v && sameName(p, levelById(v)));
  if (piece) return { close: true };   // back to the level view (also closes the open twin) · 回到层级视图
  return twin ? { open: twin.id } : null;
}

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
export const PHOTO_KINDS = ['photo', 'illustration', 'simulation', 'radio'];
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
    for (const a of f?.also || []) if (!a?.name || !ALLOWED_SOURCES.test(a?.url || '')) at(`fact ${i}: every extra source (also) needs a name and an allowed URL`);   // optional second sources · 可选的补充来源
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
  // Beginner line + real image (explain-pieces) · 初学者说明与真实图像
  if (p?.whatIs != null) {
    if (!has4(p.whatIs)) at('whatIs needs en/zh/es/pt');
    for (const s of [p.whatIs.source, ...(p.whatIs.also || [])]) if (!s?.name || !ALLOWED_SOURCES.test(s?.url || '')) at('whatIs needs a named source with an allowed URL');
  }
  if (p?.photo != null) {
    const ph = p.photo;
    if (!/^https:\/\//.test(ph.src || '')) at('photo.src must be https');
    if (!ALLOWED_SOURCES.test(ph.page || '')) at('photo.page must be an official image page');
    if (!ph.credit || !ph.license || !/^https:\/\//.test(ph.licenseUrl || '')) at('photo needs credit, license and licenseUrl');
    if (!PHOTO_KINDS.includes(ph.kind)) at('photo.kind must be one of ' + PHOTO_KINDS.join('/'));
    if (ph.note != null && !has4(ph.note)) at('photo.note needs en/zh/es/pt');
  }
  return err;
}

/* ── Text helpers · 文本 ── */
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// All four languages as spans; CSS shows the chosen one · 四种语言，CSS 只显示当前语言
export const quad = o => LANG4.map(k => `<span class="${k}" lang="${k === 'zh' ? 'zh-CN' : k}">${esc(o?.[k] ?? o?.en ?? '')}</span>`).join('');
export const tr = (o, lang) => o?.[lang] ?? o?.en ?? '';
// Top-left eyebrow: "SCALE JOURNEY · GALAXY" on a level, "SUPERCLUSTER · M87 · VIRGO A" with a piece open · 左上角小标题
export function eyebrowText(levelId, piece, lang) {
  const lv = levelById(levelId); if (!lv) return '';
  const L = tr(lv.names, lang).toUpperCase(), P = piece ? tr(piece.names, lang).toUpperCase() : '';
  // No "LOCAL GROUP · LOCAL GROUP": a piece named like its level keeps the level form; "LANIAKEA SUPERCLUSTER" stands alone · 不重复层级名
  if (!P || P === L) return `${tr(UI.journey, lang).toUpperCase()} · ${L}`;
  return P.includes(L) ? P : `${L} · ${P}`;
}
// Labels that would overlap on screen: push the lower one down until it clears (up if that is much nearer) · 屏幕标签防重叠：较低的往下推
// boxes: [{ x, y, w, h, held? }] (top-left, px; w = 0 means hidden). Returns the extra dy for each box, in input order.
// opts.obstacles: fixed rects a moved label must not land on ({ x, y, w, h, of }: \`of\` = index of the one label it blocks, e.g. its ring); opts.maxY: viewport bottom — a label
// that would be pushed past it goes up instead; box.held (it was pushed last frame) keeps it pushed until it clears by opts.hyst more px,
// so a label doesn't flicker between two spots at the overlap boundary · 圆环为障碍；超出底部则上移；滞后防止闪动
// box.side: sign of last frame's push (up/down hysteresis); box.cap: max px a label may move if the other side allows it; opts.minY: top limit for going up
// An obstacle without \`of\` (the header buttons) blocks every moved label but never moves a label at rest · 无 of 的障碍（顶部按钮）只挡移动的标签
export function spreadLabels(boxes, gap = 4, { obstacles = [], maxY = Infinity, minY = 0, hyst = 6 } = {}) {
  const dy = boxes.map(() => 0), placed = obstacles.filter(o => o.w > 0).map(o => ({ ...o, fixed: true }));
  const order = boxes.map((_, i) => i).filter(i => boxes[i].w > 0).sort((a, b) => boxes[a].y - boxes[b].y || a - b);
  const clash = (b, y, p, g) => b.x < p.x + p.w + g && p.x < b.x + b.w + g && y < p.y + p.h + g && p.y < y + b.h + g;
  for (const i of order) {
    const b = boxes[i];
    // Hysteresis (g0 > gap) only decides whether to leave the rest spot, and only against other labels · 滞后只用于是否离开原位（仅对标签）
    // A ring the label already covers at rest doesn't move it, and other pieces' rings don't block it (both cascaded the
    // neighbourhood labels far from their stars): a moved label only avoids its own ring · 只避开自己的圆环
    // An obstacle with an \`of\` index is that label's own ring and only blocks that label · 带 of 的障碍只挡自己的标签
    const hits = (y, g) => placed.filter(p => (!p.fixed || ((p.of ?? i) === i && y !== b.y)) && clash(b, y, p, p.fixed ? gap : g));
    const free = (y, g = gap) => !hits(y, g).length;
    const below = (y, g) => Math.max(y, ...hits(y, g).map(p => p.y + p.h + gap));
    const above = (y, g) => Math.min(y, ...hits(y, g).map(p => p.y - b.h - gap));
    const g0 = b.held ? gap + hyst : gap;
    let y = b.y;
    if (!free(y, g0)) {
      let d = below(y, g0), u = above(y, g0);
      for (let n = 0; !free(d) && n < 30; n++) d = below(d, gap);
      for (let n = 0; !free(u) && n < 30; n++) u = above(u, gap);
      const okD = free(d) && d + b.h <= maxY, okU = free(u) && u >= minY;
      // Down is preferred (names sit above their rings, so down stays near the object); up only when it is much nearer (×1.5),
      // or down is off the bottom; nowhere free → down · 优先下移；上移须近很多，或下方超出屏幕
      // box.side (−1 = it went up last frame): an up label stays up until down is at least as near, so a spinning rest spot
      // switches at 1.5× going up and at 1× coming back, not back and forth at one threshold. A wider band
      // (1/1.5) locked near-ties into "up" from a transient frame (phone Pleiades 80 px above its star) · 上下方向也有滞后
      const k = b.held && b.side < 0 ? 1 : 1.5, dd = d - b.y, du = b.y - u;
      let goD = okD && (!okU || dd <= k * du);
      // box.cap: a "You are here" label must stay near its marker; if only one side is within the cap, take it (the side it
      // used last frame gets 2·hyst px of slack so it doesn't flip at the cap) · 限制"你在这里"标签的偏移
      if (b.cap != null) {
        const slack = s => b.held && b.side === s ? 2 * hyst : 0, inD = okD && dd <= b.cap + slack(1), inU = okU && du <= b.cap + slack(-1);
        if (inD !== inU) goD = inD;
      }
      y = goD ? d : okU ? u : d;
    }
    dy[i] = y - b.y; placed.push({ x: b.x, y, w: b.w, h: b.h });
  }
  return dy;
}

export const HERE_CAP = 48;   // px a "You are here" label may be pushed from its marker (if the other side allows) · 偏移上限

/* ───────── The particle scenes (browser only) · 粒子场景（仅浏览器） ───────── */
// Soft round points sized in world units; xr.js does not touch ShaderMaterials, so we divide by the VR dolly scale here.
// 点大小以世界单位计算；VR 中在此除以 dolly 缩放。
const VERT = `attribute float aSize; attribute vec3 color; uniform float uSize, uOpacity, uViewH; varying vec3 vColor; varying float vA;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  float s = uSize * aSize * uViewH * 0.5 * projectionMatrix[1][1] / max(1e-4, -mv.z);
  vA = uOpacity * clamp(s / 1.6, 0.12, 1.0); gl_PointSize = clamp(s, 1.6, 24.0); vColor = color; }`;
const FRAG = `varying vec3 vColor; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard;
  float g = pow(1.0 - r, 1.7); gl_FragColor = vec4(vColor, g * vA); }`;

// inXR(): true while the headset is presenting (the HTML labels are not seen there, so their layout is skipped); hud(): the header
// buttons' rect { x, y, w, h } or null, which moved labels avoid · VR 中跳过屏幕标签布局；顶部按钮区域
export function createJourney({ T, scene, pieces = [], sizeScale = () => 1, viewHeight = () => innerHeight, onOpen = () => {}, inXR = () => false, hud = () => null }) {
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
  const otherOpen = t => !!state.piece && t.owner !== state.piece;   // level markers too
  const hiddenNow = t => onlyOpenHidden(t, state.piece);
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
    for (const lb of pc.labels || []) { const o = new T.Object3D(); o.position.fromArray(lb.at); spin.add(o); const t = tag(o, lb.names, 'sub', null, pc.level); if (lb.r != null) t.r = lb.r; t.onlyOpen = !!lb.onlyOpen; entry.extra.push(t); }
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
      const iso = pieceById[state.piece]?.p.isolate, dim = !state.piece || p.userData.pieceId === state.piece ? 1 : iso ? 0.04 : p.userData.pieceId ? 0.3 : 1;   // isolate also fades the level backdrop (M87 inside the supercluster web) · 隔离时背景也淡出
      p.material.uniforms.uSize.value = p.userData.jp.base * wp.x / ss * (p.userData.jp.beacon ? 1 + 0.35 * Math.sin(now * 3) : 1);
      p.material.uniforms.uOpacity.value = p === warp ? p.userData.jp.fade : (lv?.op ?? 0) * (p.userData.jp.beacon ? 1 : dim);
      p.material.uniforms.uViewH.value = vh;
    }
    // HTML labels · 屏幕标签
    camera.getWorldPosition(camW);
    const shown = [];
    for (const t of tags) {
      const L = levels[t.level], show = !!L && t.level === state.level && state.t > 0.7 && !(t.pieceId && state.piece === t.pieceId) && !otherOpen(t) && !hiddenNow(t);
      if (!show) { t.el.style.display = 'none'; if (t.dy) { t.dy = 0; t.nameEl.style.translate = ''; } continue; }   // hidden: forget the push · 隐藏时清除偏移
      t.obj.getWorldPosition(wp); wp.project(camera);
      if (wp.z > 1 || Math.abs(wp.x) > 1.05 || Math.abs(wp.y) > 1.05) { t.el.style.display = 'none'; if (t.dy) { t.dy = 0; t.nameEl.style.translate = ''; } continue; }
      t.sx = (wp.x + 1) / 2 * innerWidth; t.sy = (1 - wp.y) / 2 * innerHeight;
      t.el.style.display = 'block'; t.el.style.transform = `translate(${t.sx}px,${t.sy}px)`;
      t.el.classList.toggle('hover', !!t.pieceId && state.hover === t.pieceId);
      shown.push(t);
    }
    // Keep labels from stacking on top of each other (Milky Way and Sgr A* on a phone); only the name moves, the ring stays · 防止标签重叠
    // nothing to overlap, or in the headset (the page isn't seen; VR uses xr.js sprites): skip the layout read · 无需测量；VR 中跳过
    if (shown.length < 2 || inXR()) { for (const t of shown) if (t.dy) { t.dy = 0; t.nameEl.style.translate = ''; } return; }
    const names = shown.map(t => t.nameEl ||= t.el.querySelector('.name'));
    // A pushed name must not sit on its own ring; last frame's push gives hysteresis · 圆环也是障碍
    // Ring boxes are fixed-size CSS (14 px): read once per tag, not every frame (an unrendered ring reads 0, so retry until it has a size) · 圆环尺寸缓存
    const rings = shown.map((t, i) => {
      if (!t.ringBox?.w && t.pieceId) { const r = t.ringEl ||= t.el.querySelector('.ring'); t.ringBox = { x: r?.offsetLeft || 0, y: r?.offsetTop || 0, w: r?.offsetWidth || 0 }; }
      const b = t.ringBox || { x: 0, y: 0, w: 0 }; return { x: t.sx + b.x, y: t.sy + b.y, w: b.w, h: b.w, of: i };
    });
    const hb = hud(); if (hb?.w > 0) rings.push(hb);   // header buttons: no moved label goes under them (phones) · 顶部按钮
    const dy = spreadLabels(shown.map((t, i) => { const n = names[i], w = n.offsetWidth;
      // "You are here" labels may move at most HERE_CAP px when the other side allows it · "你在这里"标签偏移上限
      return { x: t.sx - w / 2, y: t.sy + n.offsetTop, w, h: n.offsetHeight, held: !!t.dy, side: Math.sign(t.dy || 0), cap: t.cls === 'here' ? HERE_CAP : null }; }), 4, { obstacles: rings, maxY: innerHeight - 8 });
    shown.forEach((t, i) => { dy[i] = Math.round(dy[i]); if (t.dy !== dy[i]) {   // whole px: a label following a moving object doesn't restart the transition every frame · 取整像素
      t.dy = dy[i]; names[i].style.translate = dy[i] ? `0 ${dy[i]}px` : ''; } });
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
    // A piece's own name label wins: pointing at "MILKY WAY" opens the Milky Way, not Sgr A* at the same centre · 指向标签就打开该天体
    for (const t of tags) {
      if (!t.pieceId || t.level !== state.level || t.el.style.display === 'none') continue;
      const r = t.el.querySelector('.name')?.getBoundingClientRect(); if (!r || !r.width) continue;
      if (x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4) return t.pieceId;
    }
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
    visible: () => t.level === state.level && state.t > 0.7 && !(t.pieceId && state.piece === t.pieceId) && !otherOpen(t) && !hiddenNow(t) }));

  return {
    root, go, leave, open, close, update, pick, target, viewRadius, xrLabels,
    get level() { return state.level; }, get piece() { return state.piece; }, get busy() { return state.t < 1; },
    pieceData: id => pieceById[id]?.p || null, levelPieces: id => (levels[id]?.pieces || []).map(e => e.p),
    setHover: id => { state.hover = id; },
  };
}
