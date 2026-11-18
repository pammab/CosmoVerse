// Coming up: helpers for events.js (pure, runs in node for the tests) · 即将到来：辅助函数
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const CAL_UI = {
  button: L('📅 Coming up', '📅 即将到来', '📅 Próximamente', '📅 Em breve'),
  title: L('Coming up in the sky', '即将到来的天象', 'Próximamente en el cielo', 'Em breve no céu'),
  intro: L('Sky events and mission milestones, with the page each date comes from.', '天象与任务里程碑，附每个日期的来源页面。', 'Eventos del cielo e hitos de misiones, con la página de donde sale cada fecha.', 'Eventos do céu e marcos de missões, com a página de onde vem cada data.'),
  fly: L('Fly there', '飞过去', 'Volar allí', 'Voar até lá'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  today: L('today', '今天', 'hoy', 'hoje'),
  tomorrow: L('tomorrow', '明天', 'mañana', 'amanhã'),
  inDays: L('in {n} days', '{n} 天后', 'en {n} días', 'em {n} dias'),
  thisMonth: L('this month', '本月', 'este mes', 'este mês'),
  inMonths: L('in {n} months', '{n} 个月后', 'en {n} meses', 'em {n} meses'),
  inMonth1: L('next month', '下个月', 'el próximo mes', 'no próximo mês'),
  sky: L('Sky', '天象', 'Cielo', 'Céu'),
  mission: L('Mission', '任务', 'Misión', 'Missão'),
  vrRow: L('📅 Coming up', '📅 即将到来', '📅 Próximamente', '📅 Em breve'),
  vrHint: L('Point at an event to fly there', '指向一个事件即可飞过去', 'Apunta a un evento para volar allí', 'Aponte para um evento para voar até lá'),
  none: L('Nothing in the list right now.', '目前列表为空。', 'No hay nada en la lista ahora.', 'Nada na lista agora.'),
};
// Local calendar day as a number (YYYYMMDD → days), so "today" follows the visitor's own date · 以本地日期计算
const dayNum = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 864e5);
const todayNum = now => dayNum(now.getFullYear(), now.getMonth() + 1, now.getDate());
function parts(ev) { const [y, m, d] = ev.date.split('-').map(Number); return { y, m, d: d || 1 }; }
// An event stays listed through its day (or through its month for month-precision dates) · 当天（或当月）内仍显示
export function isUpcoming(ev, now = new Date()) {
  const { y, m, d } = parts(ev);
  if (ev.precision === 'month') return y * 12 + m >= now.getFullYear() * 12 + now.getMonth() + 1;
  const e = ev.end ? parts({ date: ev.end }) : { y, m, d };   // two-night events stay through their last day · 跨两天的事件保留到最后一天
  return dayNum(e.y, e.m, e.d) >= todayNum(now);
}
export const upcoming = (events, now = new Date(), n = Infinity) =>
  events.filter(e => isUpcoming(e, now)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, n);
const fill = (o, n) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.replace('{n}', n)]));
// "in 4 days" / "tomorrow" / "this month" … · 倒计时
export function countdown(ev, now = new Date()) {
  const { y, m, d } = parts(ev);
  if (ev.precision === 'month') {
    const k = y * 12 + m - (now.getFullYear() * 12 + now.getMonth() + 1);
    return k <= 0 ? CAL_UI.thisMonth : k === 1 ? CAL_UI.inMonth1 : fill(CAL_UI.inMonths, k);
  }
  const n = dayNum(y, m, d) - todayNum(now);
  return n <= 0 ? CAL_UI.today : n === 1 ? CAL_UI.tomorrow : fill(CAL_UI.inDays, n);
}
const LOCALE = { en: 'en-GB', zh: 'zh-CN', es: 'es-ES', pt: 'pt-BR' };
// The date in the visitor's language (no time zone shift: the date is a calendar date) · 以访客语言显示日期
export function fmtDate(ev, lang = 'en') {
  const { y, m, d } = parts(ev), opt = ev.precision === 'month' ? { month: 'long', year: 'numeric', timeZone: 'UTC' } : { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(LOCALE[lang] || 'en-GB', opt).format(new Date(Date.UTC(y, m - 1, d)));
}
