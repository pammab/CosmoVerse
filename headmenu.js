// Header: the essentials stay in view, everything else goes under "☰ More" · 顶部：常用按钮常驻，其余收进“☰ 更多”
// Desktop: Language · Voice · Enable Gestures · Enter VR (· Enter MR) · ☰ More
// Phone (≤ 800 px): Enable Gestures · Enter VR · ☰ (Language and Voice move into ☰ under SETTINGS)
// Keyboard: Enter/Space opens, Esc closes, Tab stays inside while open; a click outside closes.
// 键盘：Enter/空格打开，Esc 关闭，打开时 Tab 焦点留在菜单内；点击外部关闭。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const MORE_UI = {
  more: L('More', '更多', 'Más', 'Mais'),
  menu: L('More features', '更多功能', 'Más funciones', 'Mais recursos'),
  settings: L('Settings', '设置', 'Ajustes', 'Configurações'),
  explore: L('Explore', '探索', 'Explorar', 'Explorar'),
  learn: L('Learn', '学习', 'Aprender', 'Aprender'),
  sound: L('Sound', '声音', 'Sonido', 'Som'),
  about: L('About', '关于', 'Acerca de', 'Sobre'),
};
// Element ids per group (all already in index.html; their ids and handlers stay the same) · 每组的元素 id（不改 id）
export const MENU_GROUPS = [
  { key: 'settings', ids: ['language', 'voiceToggle'], phoneOnly: true },
  { key: 'explore', ids: ['habitability', 'asteroidOpen', 'trajectory', 'lineup', 'tourMake', 'pmOpen', 'pause'] },
  { key: 'learn', ids: ['resourcesOpen', 'logOpen', 'newsOpen', 'calOpen', 'talk'] },
  { key: 'sound', ids: ['stellarMusic'] },
  { key: 'about', ids: ['refsOpen'] },   // 📚 References & licences, last and discreet (Pamela, Nov 17) · 参考资料与许可，放在最后
];
// Buttons that start something close the menu; settings and music keep it open · 启动功能的按钮会关闭菜单
export const CLOSES_MENU = ['habitability', 'asteroidOpen', 'trajectory', 'lineup', 'tourMake', 'pmOpen', 'pause', 'resourcesOpen', 'logOpen', 'newsOpen', 'calOpen', 'talk', 'refsOpen'];

export function initHeadMenu({ quad, phoneQuery = '(max-width: 800px)' }) {
  const $ = id => document.getElementById(id), bar = document.querySelector('.headbuttons');
  if (!bar) return null;
  const wrap = document.createElement('div'); wrap.className = 'hmore'; wrap.id = 'moreWrap';
  wrap.innerHTML = `<button type="button" id="moreBtn" class="primary" aria-expanded="false" aria-controls="moreMenu"><b aria-hidden="true">☰</b><span class="mlabel">${quad(MORE_UI.more)}</span></button>
    <div id="moreMenu" class="hmenu" role="group" aria-label="${['en', 'zh', 'es', 'pt'].map(l => MORE_UI.menu[l]).join(' / ')}" hidden></div>`;
  const btn = wrap.querySelector('#moreBtn'), menu = wrap.querySelector('#moreMenu'), groups = {};
  for (const g of MENU_GROUPS) {
    const sec = document.createElement('div'); sec.className = 'mgroup mg-' + g.key;
    sec.innerHTML = `<h6>${quad(MORE_UI[g.key])}</h6>`;
    if (!g.phoneOnly) g.ids.forEach(id => { const el = $(id); if (el) sec.append(el); });
    menu.append(sec); groups[g.key] = sec;
  }
  bar.append(wrap);
  // Order the bar: Language · Voice · Enable Gestures · Enter VR · Enter MR · ☰ · 顶栏顺序
  const settle = () => {
    const phone = matchMedia(phoneQuery).matches, s = groups.settings;
    const ids = MENU_GROUPS[0].ids.map($).filter(Boolean);
    if (phone) ids.forEach(el => s.append(el)); else bar.prepend(...ids);
    s.hidden = !phone;
    ['cam', 'vr', 'mr'].forEach(id => { const el = $(id); if (el) bar.insertBefore(el, wrap); });
  };
  settle(); matchMedia(phoneQuery).addEventListener?.('change', settle);

  const isOpen = () => !menu.hidden;
  const items = () => [...menu.querySelectorAll('button, select, input, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && el.offsetParent !== null);
  function setOpen(on, focusTo) {
    menu.hidden = !on; btn.setAttribute('aria-expanded', String(on)); wrap.classList.toggle('open', on);
    if (!on) { const mp = $('musicPanel'); if (mp && !mp.hidden) { mp.hidden = true; $('musicOptions')?.setAttribute('aria-expanded', 'false'); } }
    if (focusTo === 'first') items()[0]?.focus(); else if (focusTo === 'button') btn.focus();
  }
  // e.detail === 0: opened from the keyboard → focus the first item · 键盘打开时聚焦第一项
  btn.addEventListener('click', e => setOpen(!isOpen(), !isOpen() && e.detail === 0 ? 'first' : null));
  menu.addEventListener('click', e => { const b = e.target.closest('button'); if (b && CLOSES_MENU.includes(b.id)) setOpen(false); });
  addEventListener('pointerdown', e => { if (isOpen() && !wrap.contains(e.target) && !e.target.closest?.('#musicPanel')) setOpen(false); }, true);
  // Capture: runs before the page's Esc (= one step back) and music.js · 捕获阶段：先于页面的 Esc
  addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      e.stopImmediatePropagation(); e.preventDefault();
      const mp = $('musicPanel');
      if (mp && !mp.hidden) { mp.hidden = true; $('musicOptions')?.setAttribute('aria-expanded', 'false'); $('musicOptions')?.focus(); return; }
      return setOpen(false, 'button');
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {   // move between items (not inside the language list / slider) · 上下键在项目间移动
      if (e.target.closest?.('select, input')) { e.stopImmediatePropagation(); return; }
      const list = items(), i = list.indexOf(document.activeElement); e.preventDefault(); e.stopImmediatePropagation();
      return list[(i < 0 ? 0 : i + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length]?.focus();
    }
    if (e.key !== 'Tab') { e.stopImmediatePropagation(); return; }   // other keys keep their native action but don't reach the page (← → L, tour pause) · 其他键不传给页面
    if (e.key === 'Tab') {   // keep focus inside ☰ + its items · 焦点留在菜单内
      const list = [btn, ...items()];   // the open music panel's slider is inside too · 音乐面板的滑块也在其中
      const i = list.indexOf(document.activeElement);
      if (i < 0) { e.preventDefault(); list[0].focus(); return; }
      const next = e.shiftKey ? (i - 1 + list.length) % list.length : (i + 1) % list.length;
      e.preventDefault(); list[next].focus();
    }
  }, true);
  return { open: () => setOpen(true), close: () => setOpen(false), get isOpen() { return isOpen(); }, settle };
}
