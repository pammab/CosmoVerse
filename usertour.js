// Make your own tour: pick stops, write a line for each, share a link · 制作你自己的游览 · Crea tu propio tour · Crie seu próprio tour
// The tour lives in the link itself (#tour=…, base64url JSON): no server, no accounts. Opening the link plays it with the tour runner.
// User text is untrusted: limited in length, stored as plain strings, and only ever shown through textContent / escaping (quad).
// 游览保存在链接里（#tour=…），无需服务器或账号；用户文字不可信：限制长度，只作为纯文本显示。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const UT_MAX_STOPS = 12, UT_MAX_TEXT = 160, UT_MAX_TITLE = 60;
export const UT_UI = {
  button: L('✎ Make your own tour', '✎ 制作你的游览', '✎ Crea tu propio tour', '✎ Crie seu próprio tour'),
  title: L('Make your own tour', '制作你的游览', 'Crea tu propio tour', 'Crie seu próprio tour'),
  intro: L('Pick the stops, write one line for each (or keep Cosmo’s), then share the link. Anyone who opens it gets your tour.', '选择站点，为每一站写一句话（或保留 Cosmo 的），然后分享链接。打开链接的人就能看到你的游览。', 'Elige las paradas, escribe una frase para cada una (o deja la de Cosmo) y comparte el enlace. Quien lo abra verá tu tour.', 'Escolha as paradas, escreva uma frase para cada uma (ou mantenha a do Cosmo) e compartilhe o link. Quem abrir verá o seu tour.'),
  name: L('Tour name', '游览名称', 'Nombre del tour', 'Nome do tour'),
  namePh: L('My trip through the universe', '我的宇宙之旅', 'Mi viaje por el universo', 'Minha viagem pelo universo'),
  add: L('Add a stop', '添加站点', 'Añadir parada', 'Adicionar parada'),
  addHere: L('Add where I am now', '添加当前位置', 'Añadir donde estoy', 'Adicionar onde estou'),
  line: L('What you say here (empty = Cosmo’s line)', '你在这里说的话（留空 = Cosmo 的话）', 'Lo que dices aquí (vacío = la frase de Cosmo)', 'O que você diz aqui (vazio = a frase do Cosmo)'),
  up: L('Move up', '上移', 'Subir', 'Subir'), down: L('Move down', '下移', 'Bajar', 'Descer'), remove: L('Remove', '移除', 'Quitar', 'Remover'),
  play: L('▶ Play', '▶ 播放', '▶ Reproducir', '▶ Tocar'),
  copy: L('🔗 Copy share link', '🔗 复制分享链接', '🔗 Copiar enlace', '🔗 Copiar link'),
  copied: L('Link copied: send it to anyone', '链接已复制：发给任何人', 'Enlace copiado: envíalo a quien quieras', 'Link copiado: envie para quem quiser'),
  empty: L('No stops yet: add one below.', '还没有站点：在下面添加。', 'Aún no hay paradas: añade una abajo.', 'Ainda não há paradas: adicione uma abaixo.'),
  full: L('12 stops is the most a tour can have.', '一个游览最多 12 站。', 'Un tour puede tener como máximo 12 paradas.', 'Um tour pode ter no máximo 12 paradas.'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  shared: L('A tour made by a CosmoVerse explorer', '一位 CosmoVerse 探索者制作的游览', 'Un tour hecho por alguien que explora CosmoVerse', 'Um tour feito por alguém que explora o CosmoVerse'),
  start: L('▶ Start the tour', '▶ 开始游览', '▶ Empezar el tour', '▶ Começar o tour'),
  stops: L('{n} stops', '{n} 站', '{n} paradas', '{n} paradas'),
  bad: L('This tour link is damaged or too long, so it can’t be played.', '这个游览链接已损坏或太长，无法播放。', 'Este enlace de tour está dañado o es demasiado largo y no se puede reproducir.', 'Este link de tour está danificado ou longo demais e não pode ser tocado.'),
  userNote: L('Words by the person who made this tour', '文字来自制作此游览的人', 'Texto de quien hizo este tour', 'Texto de quem fez este tour'),
};
const PLACE = /^(L|B|P):[a-z0-9-]{1,40}$/;
// Keep only safe, short strings · 只保留安全的短字符串
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
export function sanitizeTour(t, validPlace = () => true) {
  if (!t || typeof t !== 'object' || !Array.isArray(t.s)) return null;
  const stops = t.s.slice(0, UT_MAX_STOPS).map(x => Array.isArray(x) ? [String(x[0] || ''), clean(x[1], UT_MAX_TEXT)] : null)
    .filter(x => x && PLACE.test(x[0]) && validPlace(x[0]));
  return stops.length ? { t: clean(t.t, UT_MAX_TITLE), s: stops } : null;
}
// base64url of UTF-8 JSON (works in node and the browser) · UTF-8 JSON 的 base64url
const b64e = s => { const b = new TextEncoder().encode(s); let bin = ''; for (const c of b) bin += String.fromCharCode(c); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const b64d = s => { const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/')); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); };
export const encodeTour = t => b64e(JSON.stringify({ v: 1, t: t.t || '', s: t.s }));
export function decodeTour(code, validPlace) {
  if (typeof code !== 'string' || code.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try { return sanitizeTour(JSON.parse(b64d(code)), validPlace); } catch { return null; }
}
export const tourFromHash = (hash, validPlace) => { const m = /(?:^#|&)tour=([^&]+)/.exec(hash || ''); return m ? (decodeTour(m[1], validPlace) || false) : null; };   // null = no tour, false = damaged · null 无，false 损坏
