// ─────────────────────────────────────────────────────────────────────────────
// Mixed reality "universe on your table" · 混合现实"桌上的宇宙"
// Pure helpers (no three.js, no DOM) so they can be unit-tested in node:
// • where to put the model: a detected table/desk, else another horizontal surface
//   at a sensible height, else the floor, else a fixed spot in front of you;
// • the texts shown in MR (EN, 中文, ES, PT).
// All positions are in the XR reference space (metres), relative to the head pose
// at the start of the session (`head`), so they work whether the space's origin
// is at the eyes (Quest 'local') or on the floor (emulators).
// ─────────────────────────────────────────────────────────────────────────────

export const TABLE_SPAN_M = 0.6;      // the Solar System overview is about this wide on the table · 太阳系约 0.6 米宽
export const M_PER_DIST = 0.42;       // metres of table per unit of camera distance (overview d≈170 → 224 units ≈ 0.55 m)
export const LIFT_M = 0.16;           // the model floats this far above the surface · 模型悬浮于桌面上方
export const AHEAD_M = 0.8;           // preferred spot: this far in front of you · 首选位置：前方 0.8 米
export const FALLBACK_DROP_M = 0.45;  // no surface found: waist/table height below the eyes · 未检测到平面：眼睛下方 0.45 米
const TABLE_LABELS = new Set(['table', 'desk', 'coffee table']);

// A spot `AHEAD_M` in front of the head, on the horizontal plane through y · 头部前方的点
export function aheadOf(head, yaw, y = head.y - FALLBACK_DROP_M, ahead = AHEAD_M) {
  return { x: head.x - Math.sin(yaw) * ahead, y, z: head.z - Math.cos(yaw) * ahead };
}

// Point-in-polygon on the horizontal (x, z) plane · 水平面上的点是否在多边形内
export function insideXZ(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.z > p.z) !== (b.z > p.z) && p.x < (b.x - a.x) * (p.z - a.z) / (b.z - a.z) + a.x) inside = !inside;
  }
  return inside;
}

// The point of a polygon (x, z) nearest to p, pulled `inset` metres toward the centre so the model isn't on the edge
// 多边形上离 p 最近的点，并向中心收进一点
export function nearestInXZ(p, poly, inset = 0.12) {
  if (!poly?.length) return { x: p.x, z: p.z };
  if (poly.length > 2 && insideXZ(p, poly)) return { x: p.x, z: p.z };
  let best = null, bd = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], ex = b.x - a.x, ez = b.z - a.z, L2 = ex * ex + ez * ez;
    const t = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * ex + (p.z - a.z) * ez) / L2)) : 0;
    const q = { x: a.x + ex * t, z: a.z + ez * t }, d = (q.x - p.x) ** 2 + (q.z - p.z) ** 2;
    if (d < bd) { bd = d; best = q; }
  }
  const c = poly.reduce((s, v) => ({ x: s.x + v.x / poly.length, z: s.z + v.z / poly.length }), { x: 0, z: 0 });
  const dx = c.x - best.x, dz = c.z - best.z, dl = Math.hypot(dx, dz), k = dl ? Math.min(inset, dl) / dl : 0;
  return { x: best.x + dx * k, z: best.z + dz * k };
}

// Choose where the model goes from the detected planes.
// planes: [{ orientation: 'horizontal'|'vertical', y, polygon: [{x,z}] (reference space), label? }]
// Returns { x, y, z, kind: 'table'|'surface'|'floor' } or null (then use `aheadOf`).
// 从检测到的平面中选择放置位置：桌子 > 合适高度的水平面 > 地板
export function choosePlane(planes, head, yaw) {
  const want = aheadOf(head, yaw, head.y);
  let best = null;
  for (const p of planes || []) {
    if (p.orientation !== 'horizontal' || !p.polygon?.length) continue;
    const drop = head.y - p.y;                     // how far below the eyes · 低于眼睛多少
    if (drop < 0.1) continue;                      // at or above eye level: a shelf or the ceiling · 高于视线：架子或天花板
    const spot = nearestInXZ(want, p.polygon), reach = Math.hypot(spot.x - head.x, spot.z - head.z);
    if (reach > 2.5) continue;                     // out of reach · 太远
    const label = String(p.label || '').toLowerCase();
    const kind = TABLE_LABELS.has(label) ? 'table' : drop <= 1.0 ? 'surface' : 'floor';
    // tables first, then surfaces at table height, then the floor; nearer to the wanted spot wins ties
    const score = { table: 0, surface: 10, floor: 20 }[kind] + Math.hypot(spot.x - want.x, spot.z - want.z);
    if (!best || score < best.score) best = { x: spot.x, y: p.y, z: spot.z, kind, score };
  }
  if (!best) return null;
  const { score, ...out } = best; return out;
}

// A hit-test result is usable when the surface faces up (its +Y axis is near vertical) · 命中点表面朝上才可用
// q = orientation quaternion {x,y,z,w}
export function facesUp(q, min = 0.8) { return 1 - 2 * (q.x * q.x + q.z * q.z) >= min; }

// World units per metre so the current view fits on the table · 当前视图在桌面上的缩放
export const tableScale = distance => Math.max(1e-4, distance / M_PER_DIST);

const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const MR_UI = {
  button: L('🪐 Universe on your table', '🪐 桌上的宇宙', '🪐 El universo en tu mesa', '🪐 O universo na sua mesa'),
  title: L('Universe on your table · mixed reality', '桌上的宇宙 · 混合现实', 'El universo en tu mesa · realidad mixta', 'O universo na sua mesa · realidade mista'),
  eyebrow: L('Mixed reality', '混合现实', 'Realidad mixta', 'Realidade mista'),
  placeTitle: L('Place the Solar System', '放置太阳系', 'Coloca el sistema solar', 'Coloque o Sistema Solar'),
  placeText: L('Point at your table (or the floor) and pinch to put it there. Walk around it, lean in, use both hands to resize and turn it.',
    '用手指向桌子（或地面），捏合即可放在那里。可以绕着它走、凑近看，用双手缩放和旋转。',
    'Apunta a tu mesa (o al suelo) y pellizca para dejarlo ahí. Camina a su alrededor, acércate y usa las dos manos para cambiar su tamaño y girarlo.',
    'Aponte para a sua mesa (ou o chão) e faça pinça para colocá-lo lá. Ande ao redor, chegue perto e use as duas mãos para mudar o tamanho e girar.'),
  found: {
    table: L('Table found', '已找到桌子', 'Mesa encontrada', 'Mesa encontrada'),
    surface: L('Surface found', '已找到平面', 'Superficie encontrada', 'Superfície encontrada'),
    floor: L('Floor found', '已找到地面', 'Suelo encontrado', 'Chão encontrado'),
    hit: L('Aim found a surface', '已瞄准平面', 'Superficie apuntada', 'Superfície na mira'),
    none: L('No surface yet: it floats in front of you', '尚未找到平面：悬浮在你面前', 'Aún sin superficie: flota delante de ti', 'Nenhuma superfície ainda: flutua à sua frente'),
  },
  placeHint: L('🤏 Pinch to place it here', '🤏 捏合放在这里', '🤏 Pellizca para dejarlo aquí', '🤏 Faça pinça para colocar aqui'),
  menuRow: L('📍 Move it on the table', '📍 在桌上移动', '📍 Moverlo en la mesa', '📍 Mover na mesa'),
  placed: L('Placed. It stays on your table.', '已放置，它会留在你的桌上。', 'Colocado. Se queda en tu mesa.', 'Colocado. Ele fica na sua mesa.'),
  noAR: L('Mixed reality needs a headset browser with passthrough (e.g. Meta Quest 3) or the Immersive Web Emulator.',
    '混合现实需要支持透视的头显浏览器（如 Meta Quest 3）或 Immersive Web Emulator。',
    'La realidad mixta necesita el navegador de un visor con passthrough (p. ej., Meta Quest 3) o el Immersive Web Emulator.',
    'A realidade mista precisa do navegador de um headset com passthrough (ex.: Meta Quest 3) ou do Immersive Web Emulator.'),
};
