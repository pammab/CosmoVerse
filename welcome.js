// First-visit welcome · 首次欢迎 · Bienvenida · Boas-vindas
// One line on what CosmoVerse is + 3 things to try. Shown once per browser (reopen with the "?" button);
// closes with a click, Esc, a pinch 🤏 or point ☝ + hold. In VR the first panel shows the same welcome.
// 一句话说明 + 三件可以尝试的事；每个浏览器显示一次，可用“?”按钮重新打开。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const WELCOME = {
  title: L('Welcome to CosmoVerse', '欢迎来到 CosmoVerse', 'Bienvenido a CosmoVerse', 'Bem-vindo ao CosmoVerse'),
  line: L('A planetarium in your hands: fly from Saturn’s rings to the edge of the observable universe.',
    '掌中的天文馆：从土星光环一路飞到可观测宇宙的边缘。',
    'Un planetario en tus manos: vuela desde los anillos de Saturno hasta el borde del universo observable.',
    'Um planetário nas suas mãos: voe dos anéis de Saturno até a borda do universo observável.'),
  tryThese: L('Try these', '试试这些', 'Prueba esto', 'Experimente'),
  tries: [
    { act: 'solar', icon: '🤏', text: L('Fly home to the Solar System', '飞回太阳系', 'Vuela a casa, al sistema solar', 'Voe para casa, até o Sistema Solar'),
      how: L('Scroll the wheel up · pinch 🤏 and push up · or “Go to” on the left', '向上滚动滚轮 · 捏合 🤏 向上推 · 或左侧“前往”', 'Gira la rueda hacia arriba · pellizca 🤏 y sube · o “Ir a” a la izquierda', 'Gire a rodinha para cima · faça pinça 🤏 e empurre para cima · ou “Ir para” à esquerda') },
    { act: 'planet', icon: '☝', text: L('Open a planet', '打开一颗行星', 'Abre un planeta', 'Abra um planeta'),
      how: L('Click it · or point ☝ at it and hold', '点击它 · 或用 ☝ 指向并停留', 'Haz clic · o apunta ☝ y mantén', 'Clique nele · ou aponte ☝ e segure') },
    { act: 'cosmo', icon: '💬', text: L('Ask Cosmo, your guide', '问问向导 Cosmo', 'Pregunta a Cosmo, tu guía', 'Pergunte ao Cosmo, seu guia'),
      how: L('The 💬 Ask Cosmo button · or ✌ to talk', '点 💬 问问 Cosmo 按钮 · 或 ✌ 说话', 'El botón 💬 Pregunta a Cosmo · o ✌ para hablar', 'O botão 💬 Pergunte ao Cosmo · ou ✌ para falar') },
  ],
  tour: L('▶ Take the tour with Cosmo', '▶ 跟 Cosmo 游览一圈', '▶ Haz el tour con Cosmo', '▶ Faça o tour com o Cosmo'),
  tourHow: L('About 3 minutes, with voice: from the universe down to the Earth', '约 3 分钟，有语音：从宇宙一路到地球', 'Unos 3 minutos, con voz: del universo hasta la Tierra', 'Cerca de 3 minutos, com voz: do universo até a Terra'),
  start: L('Start exploring', '开始探索', 'Empezar a explorar', 'Começar a explorar'),
  close: L('Click, pinch 🤏 or point ☝ and hold to close', '点击、捏合 🤏 或用 ☝ 指向停留即可关闭', 'Haz clic, pellizca 🤏 o apunta ☝ y mantén para cerrar', 'Clique, faça pinça 🤏 ou aponte ☝ e segure para fechar'),
  help: L('What can I do here?', '这里可以做什么？', '¿Qué puedo hacer aquí?', 'O que posso fazer aqui?'),
  // VR: hands only, no Cosmo panel yet · VR：仅手势
  vr: [
    [L('🤏🤏 Pinch with both hands, pull apart', '🤏🤏 双手捏合并分开', '🤏🤏 Pellizca con las dos manos y sepáralas', '🤏🤏 Faça pinça com as duas mãos e afaste-as'), L('Zoom in, towards the Solar System', '放大，飞向太阳系', 'Acerca el zoom, hacia el sistema solar', 'Aproxime o zoom, rumo ao Sistema Solar')],
    [L('☝ Point + hold', '☝ 指向并停留', '☝ Apunta y mantén', '☝ Aponte e segure'), L('Open a planet', '打开行星', 'Abre un planeta', 'Abra um planeta')],
    [L('✊ Hold a fist', '✊ 保持握拳', '✊ Mantén el puño', '✊ Mantenha o punho'), L('Come back', '返回', 'Volver', 'Voltar')],
    [L('☝ Left menu', '☝ 左侧菜单', '☝ Menú izquierdo', '☝ Menu da esquerda'), L('Biggest to smallest', '从大到小', 'De lo más grande a lo más pequeño', 'Do maior ao menor')],
  ],
  vrHint: L('Do any of these to begin', '做任意一个动作开始', 'Haz cualquiera para empezar', 'Faça qualquer um para começar'),
};
const KEY = 'cv-welcome', VR_KEY = 'cv-welcome-vr';
const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
const set = k => { try { localStorage.setItem(k, '1'); } catch {} };

export function initWelcome({ actions = {}, quad = o => o.en }) {
  let shown = false, vrSeen = !!get(VR_KEY);
  const card = document.createElement('section');
  card.id = 'welcome'; card.className = 'welcome'; card.hidden = true;
  card.setAttribute('role', 'dialog'); card.setAttribute('aria-labelledby', 'welcomeTitle');
  const CLOSE = L('Close', '关闭', 'Cerrar', 'Fechar');
  card.innerHTML = `<button type="button" class="wclose" aria-label="Close">×</button>
    <div class="eyebrow">◎ COSMOVERSE</div><h2 id="welcomeTitle">${quad(WELCOME.title)}</h2><p class="wline">${quad(WELCOME.line)}</p>
    <div class="wtry">${quad(WELCOME.tryThese)}</div>
    <ol>${WELCOME.tries.map(t => `<li><button type="button" data-act="${t.act}"><i aria-hidden="true">${t.icon}</i><b>${quad(t.text)}</b><small>${quad(t.how)}</small></button></li>`).join('')}</ol>
    <button type="button" class="wtour" data-act="tour"><b>${quad(WELCOME.tour)}</b><small>${quad(WELCOME.tourHow)}</small></button>
    <button type="button" class="wstart">${quad(WELCOME.start)}</button><small class="wnote">${quad(WELCOME.close)}</small>`;
  const help = document.createElement('button');
  help.type = 'button'; help.id = 'helpBtn'; help.className = 'helpbtn'; help.textContent = '?';
  help.title = WELCOME.help.en; help.setAttribute('aria-label', WELCOME.help.en);
  document.body.append(card, help);
  const lang = () => document.documentElement.dataset.lang || 'en';
  const relabel = () => { help.title = WELCOME.help[lang()] || WELCOME.help.en; help.setAttribute('aria-label', help.title); card.querySelector('.wclose').setAttribute('aria-label', CLOSE[lang()] || CLOSE.en); };
  relabel(); new MutationObserver(relabel)
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  function open() { card.hidden = false; shown = true; requestAnimationFrame(() => card.classList.add('show')); card.querySelector('.wstart').focus({ preventScroll: true }); }
  function close() {
    if (card.hidden) return;
    set(KEY); card.classList.remove('show'); shown = false;
    setTimeout(() => { if (!shown) card.hidden = true; }, 300);
  }
  card.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const act = b.dataset.act; close();
    if (act) actions[act]?.();
  });
  help.onclick = () => (shown ? close() : open());
  // Any click outside, or Esc, closes it · 点击外部或 Esc 关闭
  addEventListener('pointerdown', e => { if (shown && !card.contains(e.target) && e.target !== help) close(); }, true);
  addEventListener('keydown', e => { if (shown && e.key === 'Escape') close(); });
  if (!get(KEY)) setTimeout(() => { if (!document.body.classList.contains('xr-on')) open(); }, 900);

  return {
    open, close, isOpen: () => shown,
    // Hands (webcam and VR): pinch onset or point held ~0.9 s closes it; returns the point progress 0..1 · 手势关闭
    hand(g, held, onset) {
      if (!shown) return 0;
      const p = g === 'point' ? Math.min(1, held / 900) : 0;
      if ((g === 'pinch' && onset) || p >= 1) close();
      return p;
    },
    // VR hands: a pinch or point + hold also ends the VR welcome · VR：捏合或指向停留结束欢迎面板
    vrHand(g, held, onset) { if (!vrSeen && ((g === 'pinch' && onset) || (g === 'point' && held > 900))) { vrSeen = true; set(VR_KEY); } },
    // VR: the first panel is the welcome until the visitor does something (or ~25 s pass) · VR 首个面板
    vrPanel(l, busy) {
      if (vrSeen) return null;
      if (busy) { vrSeen = true; set(VR_KEY); return null; }
      return { eyebrow: 'CosmoVerse', title: WELCOME.title[l] || WELCOME.title.en, accent: '#8bd6ff',
        text: (WELCOME.line[l] || WELCOME.line.en) + ' ' + (WELCOME.tryThese[l] || WELCOME.tryThese.en) + ':',
        facts: WELCOME.vr.map(([a, b]) => [a[l] || a.en, b[l] || b.en]), hint: WELCOME.vrHint[l] || WELCOME.vrHint.en, hintColor: '#8bd6ff' };
    },
  };
}
