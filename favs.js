// My favourites ★ · 我的收藏 · Mis favoritos · Meus favoritos
// Places use the ladder's ids: 'L:<level>', 'B:<planet or Sun>', 'P:<journey piece>'. Stored per browser (localStorage in
// try/catch: without it the list just lives for this visit). No accounts, nothing sent anywhere.
// 地点沿用阶梯的 id；按浏览器保存（localStorage 不可用时只在本次访问有效）。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const FAV_UI = {
  title: L('My favourites', '我的收藏', 'Mis favoritos', 'Meus favoritos'),
  save: L('Save to favourites', '收藏', 'Guardar en favoritos', 'Salvar nos favoritos'),
  saved: L('In your favourites', '已收藏', 'En tus favoritos', 'Nos seus favoritos'),
  saveHere: L('Save this place', '收藏这里', 'Guardar este lugar', 'Salvar este lugar'),
  savedHere: L('Saved · remove', '已收藏 · 移除', 'Guardado · quitar', 'Salvo · remover'),
  empty: L('Nothing saved yet: open a place and choose ☆ Save this place.', '还没有收藏：打开一个地方，选择“☆ 收藏这里”。', 'Aún no hay nada guardado: abre un lugar y elige ☆ Guardar este lugar.', 'Nada salvo ainda: abra um lugar e escolha ☆ Salvar este lugar.'),
  remove: L('Remove from favourites', '从收藏中移除', 'Quitar de favoritos', 'Remover dos favoritos'),
  added: L('★ Saved to My favourites (last row of “Go to”)', '★ 已加入“我的收藏”（“前往”的最后一行）', '★ Guardado en Mis favoritos (última fila de “Ir a”)', '★ Salvo em Meus favoritos (última linha de “Ir para”)'),
  removed: L('Removed from My favourites', '已从“我的收藏”移除', 'Quitado de Mis favoritos', 'Removido de Meus favoritos'),
  tip: L('Save your favourite places any time with the ★ star', '随时用 ★ 星标收藏你喜欢的地方', 'Guarda tus lugares favoritos cuando quieras con la estrella ★', 'Salve seus lugares favoritos quando quiser com a estrela ★'),
  demoTip: L('Like a place? Tap the ★', '喜欢这个地方？点 ★', '¿Te gusta un lugar? Toca la ★', 'Gostou de um lugar? Toque na ★'),
};
export const FAV_KEY = 'cv-favs', FAV_MAX = 24;
export const validPlace = id => typeof id === 'string' && /^[LBP]:[a-z0-9-]{1,40}$/.test(id);

// storage: anything with getItem/setItem (localStorage, or a stub in tests) · 存储：localStorage 或测试替身
export function createFavs(storage = (() => { try { return globalThis.localStorage; } catch { return null; } })()) {
  let list = [];
  try { const raw = JSON.parse(storage?.getItem(FAV_KEY) || '[]'); if (Array.isArray(raw)) list = raw.filter(validPlace).slice(0, FAV_MAX); } catch {}
  let version = 0;
  const save = () => { version++; try { storage?.setItem(FAV_KEY, JSON.stringify(list)); } catch {} };
  return {
    get list() { return list.slice(); }, get version() { return version; },
    has: id => list.includes(id),
    // newest first; a full list drops the oldest · 最新在前，满了去掉最旧的
    add(id) { if (!validPlace(id) || list.includes(id)) return false; list = [id, ...list].slice(0, FAV_MAX); save(); return true; },
    remove(id) { if (!list.includes(id)) return false; list = list.filter(x => x !== id); save(); return true; },
    toggle(id) { return list.includes(id) ? (this.remove(id), false) : this.add(id); },
  };
}
