// Explorer's logbook + Cosmic daily: stamps for places you visit, ranks, a place of the day and a streak (per browser)
// 探险日志与每日宇宙：到访地点的印章、等级、每日地点与连续天数（按浏览器保存）
// Pure helpers (run in node for the tests); main.js does the UI and storage (localStorage in try/catch, works without it).
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const RANKS = [
  { at: 0, name: L('Cadet', '见习生', 'Cadete', 'Cadete') },
  { at: 6, name: L('Navigator', '领航员', 'Navegante', 'Navegador') },
  { at: 14, name: L('Voyager', '远航者', 'Viajero', 'Viajante') },
  { at: 24, name: L('Cosmic Explorer', '宇宙探险家', 'Explorador cósmico', 'Explorador cósmico') },
];
export const LOG_UI = {
  button: L('📔 Logbook', '📔 探险日志', '📔 Bitácora', '📔 Diário de bordo'),
  title: L('Explorer’s logbook', '探险日志', 'Bitácora del explorador', 'Diário de bordo do explorador'),
  explored: L('{n} / {t} explored', '已探索 {n} / {t}', '{n} / {t} explorados', '{n} / {t} explorados'),
  rank: L('Rank', '等级', 'Rango', 'Patente'),
  next: L('{k} more places to become {r}', '再探索 {k} 个地方即可成为{r}', '{k} lugares más para ser {r}', 'mais {k} lugares para virar {r}'),
  top: L('The highest rank: well done!', '已达最高等级：太棒了！', '¡El rango más alto: bien hecho!', 'A patente mais alta: muito bem!'),
  stamps: L('Stamps', '印章', 'Sellos', 'Selos'),
  none: L('No stamps yet: open any place to get your first one.', '还没有印章：打开任意地方即可获得第一枚。', 'Aún no hay sellos: abre cualquier lugar para conseguir el primero.', 'Ainda não há selos: abra qualquer lugar para ganhar o primeiro.'),
  rankUp: L('New rank: {r}!', '新等级：{r}！', '¡Nuevo rango: {r}!', 'Nova patente: {r}!'),
  stamp: L('New stamp: {p}', '新印章：{p}', 'Nuevo sello: {p}', 'Novo selo: {p}'),
  today: L('Today in the universe', '今日宇宙', 'Hoy en el universo', 'Hoje no universo'),
  todayAsk: L('Fly there to collect today’s stamp', '飞过去领取今天的印章', 'Vuela allí para conseguir el sello de hoy', 'Voe até lá para ganhar o selo de hoje'),
  todayDone: L('Today’s stamp collected', '今日印章已领取', 'Sello de hoy conseguido', 'Selo de hoje ganho'),
  streak: L('{n} days in a row', '连续 {n} 天', '{n} días seguidos', '{n} dias seguidos'),
  streak1: L('Day 1 of your streak', '连续第 1 天', 'Día 1 de tu racha', 'Dia 1 da sua sequência'),
  streak0: L('Start a streak today', '今天开始连续打卡', 'Empieza una racha hoy', 'Comece uma sequência hoje'),
  tomorrow: L('Tomorrow: {p}', '明天：{p}', 'Mañana: {p}', 'Amanhã: {p}'),
  fly: L('✈ Fly there', '✈ 飞过去', '✈ Volar allí', '✈ Voar até lá'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  myTour: L('Your tour', '你的游览', 'Tu tour', 'Seu tour'),
  vrRow: L('📔 Logbook', '📔 探险日志', '📔 Bitácora', '📔 Diário de bordo'),
};
export const fill = (o, vars) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Object.entries(vars).reduce((s, [a, b]) => s.replaceAll('{' + a + '}', typeof b === 'object' ? b[k] : b), v)]));
// "3 days in a row" / "Day 1 of your streak" / "Start a streak today" · 连续天数文字
export const streakText = n => n > 1 ? fill(LOG_UI.streak, { n }) : n === 1 ? LOG_UI.streak1 : LOG_UI.streak0;
export function rankOf(n) { let r = RANKS[0]; for (const x of RANKS) if (n >= x.at) r = x; return r; }
export function nextRank(n) { return RANKS.find(x => x.at > n) || null; }
// Local calendar day 'YYYY-MM-DD' · 本地日期
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayNum = k => { const [y, m, d] = k.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
// Place of the day: deterministic by date, walks through every place before repeating · 每日地点：按日期确定，轮流出现
export function placeOfDay(places, key = dayKey()) {
  if (!places.length) return null;
  const n = dayNum(key), k = ((n * 7) % places.length + places.length) % places.length;   // 7 is coprime with small lists → visits all · 互质步长
  return places[gcd(7, places.length) === 1 ? k : n % places.length];
}
const gcd = (a, b) => b ? gcd(b, a % b) : a;
export const tomorrowKey = (key = dayKey()) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + 1)); };
// Streak after collecting today's stamp: +1 if yesterday was collected, else 1; same day = unchanged · 连续天数
export function nextStreak({ last = null, streak = 0 } = {}, today = dayKey()) {
  if (last === today) return { last, streak };
  const gap = last ? dayNum(today) - dayNum(last) : null;
  return { last: today, streak: gap === 1 ? streak + 1 : 1 };
}
// Visible streak today (0 if a day was missed) · 今天显示的连续天数（断了则为 0）
export const liveStreak = ({ last = null, streak = 0 } = {}, today = dayKey()) => !last ? 0 : dayNum(today) - dayNum(last) <= 1 ? streak : 0;
// The stamp book: { id: firstVisitDay }, only known places · 印章簿
export function addStamp(book, id, day = dayKey(), valid = () => true) {
  if (!valid(id) || book[id]) return false; book[id] = day; return true;
}
