// ─────────────────────────────────────────────────────────────────────────────
// "Ask Cosmo" — AI space guide with voice · AI 太空向导（支持语音）
// The browser only talks to /api/chat on our own server; the API key stays on
// the server (.env locally, environment variable on Vercel).
// Simple navigation ("go to Mars", "去火星", "line up the planets") is handled
// right here without calling the AI.
// ─────────────────────────────────────────────────────────────────────────────
import { byId, NAMES, factsText } from './data.js';
import { highlightsText } from './highlights.js';
import { answerLinks, linksHTML, SRC_UI } from './cosmofacts.js';
import { canListen, canSpeak, listen, stopListening, isListening, speak, stopSpeaking, VOICE_LANGS, defaultLang } from './voice.js';

const $ = s => document.querySelector(s);
const LOCAL = { // planet names for confirmations · 确认语中的名称
  es: { sun: 'el Sol', mercury: 'Mercurio', venus: 'Venus', earth: 'la Tierra', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Neptuno' },
  pt: { sun: 'o Sol', mercury: 'Mercúrio', venus: 'Vênus', earth: 'a Terra', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno' },
};
const SAY = {
  en: { go: n => `Flying to ${n}.`, home: 'Back to the whole Solar System.', lineup: 'Here are the planets side by side, at their true sizes.', pause: 'Orbits paused.', resume: 'Orbits running again.' },
  zh: { go: n => `正在前往${n}。`, home: '返回太阳系总览。', lineup: '这是按真实比例并排的行星。', pause: '公转已暂停。', resume: '公转已恢复。' },
  es: { go: n => `Volando hacia ${n}.`, home: 'De vuelta al Sistema Solar completo.', lineup: 'Aquí están los planetas lado a lado, a su tamaño real.', pause: 'Órbitas en pausa.', resume: 'Órbitas en marcha.' },
  pt: { go: n => `Voando para ${n}.`, home: 'De volta ao Sistema Solar inteiro.', lineup: 'Aqui estão os planetas lado a lado, no tamanho real.', pause: 'Órbitas pausadas.', resume: 'As órbitas voltaram a girar.' },
};
const ERR = {
  rate: ['Too many questions at once. Wait a few seconds and try again.', '提问太频繁，请稍等几秒再试。'],
  config: ['The AI guide is not set up yet: the server has no API key.', 'AI 向导尚未配置：服务器缺少 API 密钥。'],
  offline: ['The AI guide needs the CosmoVerse server. Run "npm start", or open the online version.', 'AI 向导需要 CosmoVerse 服务器：请运行 "npm start" 或打开在线版本。'],
  busy: ['The AI is busy right now. Please try again.', 'AI 暂时繁忙，请重试。'],
  bad: ['Something went wrong with that message. Please try again.', '消息出错，请重试。'],
  'not-allowed': ['Microphone access is blocked. Allow it in the address bar, then try again.', '麦克风权限被拒绝，请在地址栏允许后重试。'],
  unsupported: ['Voice input needs Chrome or Edge. You can still type.', '语音输入需要 Chrome 或 Edge 浏览器，仍可打字提问。'],
  network: ['The speech service could not be reached. Check the connection.', '无法连接语音服务，请检查网络。'],
  'audio-capture': ['No microphone was found.', '未找到麦克风。'],
};

const READING = { en: 'Got it, reading what you said…', zh: '收到，正在识别…', es: 'Entendido, leyendo lo que dijiste…', pt: 'Entendi, lendo o que você disse…' };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const CJK = /[㐀-鿿]/;
export function findBody(text) {
  const t = text.toLowerCase();
  for (const [id, names] of Object.entries(NAMES)) for (const n of names) {
    if (CJK.test(n) ? t.includes(n) : new RegExp(`(^|[^a-zà-ÿ])${esc(n)}([^a-zà-ÿ]|$)`, 'i').test(t)) return id;
  }
  return null;
}
const NAV = /(go to|show( me)?|open|take me to|fly to|zoom (in )?(on|to)|visit|select|let'?s see|去|打开|看看|显示|飞到|前往|ir a|ve a|ve al|vamos a|muestra|muéstrame|enséñame|mostrar|llévame|vai para|vá para|va para|ir para|vamos para|mostra|mostre|me leva|leva-me|abre|abrir)/i;
const HOME = /^(back|go back|overview|home|(the |show (me )?the )?(whole )?solar system|总览|返回|太阳系|太阳系总览|vista general|volver|el sistema solar|sistema solar|visão geral|voltar|o sistema solar)[\s.!。！]*$/i;
const LINEUP = /(line ?up|compare (the )?(planet )?sizes|size comparison|side by side|对比大小|大小对比|比较大小|并排|comparar (los |os )?tamaños|comparar (os )?tamanhos|lado a lado|alinea( los planetas)?)/i;
const PAUSE = /^(pause|stop (the )?orbits|暂停|pausa|pausar)/i, RESUME = /^(resume|play|continue|继续|reanudar|continuar|retomar)/i;
// Returns an action name, or null if this should go to the AI.
export function parseCommand(text) {
  const t = text.trim(); if (!t || t.length > 60) return null;
  if (LINEUP.test(t)) return { type: 'lineup' };
  const body = findBody(t);
  if (!body && HOME.test(t)) return { type: 'home' };
  if (PAUSE.test(t)) return { type: 'pause' };
  if (RESUME.test(t)) return { type: 'resume' };
  const bare = body && NAMES[body].some(n => t.toLowerCase().replace(/[\s.!?。！？]/g, '') === n.replace(/\s/g, ''));
  if (body && (NAV.test(t) || bare)) return { type: 'go', id: body };
  return null;
}

// onExchange({ q, a, err, state }): each question / answer / error, so the VR panel can show it (chat.js stays DOM-only)
// onExchange：每次提问、回答或错误时通知（供 VR 面板显示）
export function initChat({ bi, getContext, getPlace = () => null, getAsk = () => null, getPlaceId = () => null, actions, onExchange = () => {}, getPack = () => [], onCommand = () => null }) {
  const panel = $('#chatPanel'), log = $('#chatLog'), input = $('#chatInput'), send = $('#chatSend'), mic = $('#chatMic'), spk = $('#chatSpeak'), langSel = $('#chatLang');
  let userStopped = false, history = [], busy = false, speakReplies = false, lastCtx = null, quiet = false;
  VOICE_LANGS.forEach(v => { const o = document.createElement('option'); o.value = v.code; o.textContent = v.label; langSel.append(o); });
  langSel.value = defaultLang();
  const setVoiceLang = code => { langSel.value = code; };
  const lang2 = () => langSel.value.slice(0, 2);
  if (!canListen) { mic.disabled = true; mic.title = ERR.unsupported[0]; }
  if (!canSpeak) spk.style.display = 'none';

  const nameOf = id => id === 'solar' ? null : byId[id];
  const add = (cls, html, isHtml = false) => { const el = document.createElement('div'); el.className = 'msg ' + cls; isHtml ? el.innerHTML = html : el.textContent = html; log.append(el); log.scrollTop = log.scrollHeight; return el; };
  const error = code => add('err', bi(...(ERR[code] || ERR.busy)), true); // Spanish and Portuguese come from i18n.js

  function renderContext() {
    const id = getContext(), b = nameOf(id);
    // Away from the Solar System (a journey level or piece), name the place on screen, not the Solar System · 旅程中显示当前地点
    const pl = b ? null : getPlace(), at = b || pl;
    $('#chatCtx').innerHTML = at ? bi('Talking about · ' + at.en, '当前话题 · ' + at.zh, 'Hablando de · ' + at.es, 'Falando sobre · ' + at.pt) : bi('Talking about · the Solar System', '当前话题 · 太阳系');
    const sugg = b ? [['Tell me a fun fact', '讲一个有趣的知识'], ['Could humans live there?', '人类能在那里生活吗？'], ['How big is it compared to Earth?', '它和地球比有多大？']]
      : [['Which planet is the hottest?', '哪颗行星最热？'], ['Which planet has the most moons?', '哪颗行星的卫星最多？'], ['Line up the planets', '把行星并排比较大小']];
    const box = $('#chatSugg'); box.innerHTML = '';
    // A journey level or piece brings its own questions, in 4 languages (shared with VR) · 旅程层级/天体有自己的问题
    let placeQ = null; try { placeQ = b ? null : getAsk(); } catch {}
    if (placeQ?.length) placeQ.forEach(q => { const b2 = document.createElement('button'); b2.type = 'button'; b2.innerHTML = bi(q.en, q.zh, q.es, q.pt); b2.onclick = () => ask(q[document.documentElement.dataset.lang] || q.en, false); box.append(b2); });
    // Send the suggestion in the language on screen · 以当前语言发送
    else sugg.forEach(([en, zh]) => { const b2 = document.createElement('button'); b2.type = 'button'; b2.innerHTML = bi(en, zh); b2.onclick = () => { const l = document.documentElement.dataset.lang; ask(l === 'zh' ? zh : l === 'es' ? window.esText(en) : l === 'pt' ? window.ptText(en) : en, false); }; box.append(b2); });
    // A quiet divider when the topic changes (a planet, a journey place, the Solar System); consecutive changes reuse the same line.
    const key = b ? id : pl ? 'place:' + pl.en : id;
    if (lastCtx !== null && lastCtx !== key && history.length && !quiet) {
      const html = at ? bi(at.en, at.zh, at.es, at.pt) : bi('SOLAR SYSTEM', '太阳系', 'SISTEMA SOLAR', 'SISTEMA SOLAR'), lastEl = log.lastElementChild;
      if (lastEl?.classList.contains('note')) lastEl.innerHTML = html; else add('note', html, true);
    }
    lastCtx = key;
  }

  function open({ focus = true } = {}) {
    panel.classList.add('show'); document.body.classList.add('chat-open'); renderContext();
    if (!log.childElementCount) add('bot', bi("Hi! I'm Cosmo, your space guide. Ask me anything, type or press the mic and talk. Try “Go to Saturn”.", '你好！我是太空向导 Cosmo。可以打字或点麦克风说话提问，试试说“去土星”。'), true);
    if (focus) setTimeout(() => input.focus(), 60);   // the demo opens it without focus, so Space/Esc still pause/stop · 演示时不聚焦
  }
  function close() { panel.classList.remove('show'); document.body.classList.remove('chat-open'); stopListening(); stopSpeaking(); setMic(false); }

  function reply(text, fromVoice) {
    const el = add('bot', text);
    if (fromVoice || speakReplies) speak(text, CJK.test(text) ? 'zh-CN' : langSel.value);
    return el;
  }

  // fallback: the reply shown when the AI server can't answer (the demo's scripted, sourced answer) · 服务器不可用时的备用回答
  async function ask(raw, fromVoice, fallback) {
    let text = String(raw || '').trim().slice(0, 500); if (!text) return;
    if (busy) { onExchange({ q: text, err: 'still' }); return; }   // one question at a time: say so instead of dropping it · 一次一个问题
    input.value = ''; add('me', text); onExchange({ q: text, state: 'thinking' });
    const L2 = CJK.test(text) ? 'zh' : document.documentElement.dataset.lang === 'zh' ? 'zh' : lang2();
    // 🎙 Voice / typed commands for the hand actions (places, back, tour, save, panels); "ask: …" goes to Cosmo · 语音指令
    if (!fallback) { let vc = null; try { vc = onCommand(text, L2); } catch {} 
      if (vc?.said) { quiet = true; reply(vc.said, fromVoice); quiet = false; onExchange({ q: text, a: vc.said, cmd: true }); renderContext(); return; }
      if (vc?.ask) text = vc.ask; }
    const cmd = parseCommand(text);
    if (cmd) {
      const L = SAY[L2] || SAY.en, b = cmd.id && byId[cmd.id];
      const name = b ? (L2 === 'zh' ? b.zh : LOCAL[L2]?.[cmd.id] || b.en.charAt(0) + b.en.slice(1).toLowerCase()) : '';
      quiet = true; if (cmd.type === 'go') actions.select(cmd.id); else actions[cmd.type]?.(); quiet = false;
      const said = cmd.type === 'go' ? L.go(name) : L[cmd.type]; reply(said, fromVoice); onExchange({ q: text, a: said, cmd: true });
      renderContext(); return;
    }
    busy = true; send.disabled = true; history.push({ role: 'user', content: text });
    const wait = add('bot', '<span class="typing"><i></i><i></i><i></i></span>', true);
    const planet = findBody(text) || getContext();
    let pack = []; try { pack = getPack(planet) || []; } catch {}   // the app's sourced facts (Cosmo answers only from these) · 有来源的资料
    let err = null;
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ planet, place: planet === 'solar' ? (getPlaceId() || undefined) : undefined, pack, facts: [factsText(planet), highlightsText(planet)].filter(Boolean).join('\n'), lang: fromVoice ? langSel.value : 'auto', voice: !!fromVoice, messages: history.slice(-8) }) });
      let data = {}; try { data = await r.json(); } catch { err = r.status === 404 || r.status === 405 || r.status === 501 ? 'offline' : 'busy'; }
      if (!err && r.ok && data.reply) { wait.remove(); const el = reply(data.reply, fromVoice), links = answerLinks(data.sources, pack); if (links.length) { const s2 = document.createElement('div'); s2.className = 'srcs'; s2.innerHTML = `${bi(SRC_UI.label.en + ':', SRC_UI.label.zh + '：', SRC_UI.label.es + ':', SRC_UI.label.pt + ':')} ${linksHTML(links)}`; el.append(s2); log.scrollTop = log.scrollHeight; } history.push({ role: 'assistant', content: data.reply }); onExchange({ q: text, a: data.reply, links }); }   // the Sources line is shown, not read aloud · 来源只显示，不朗读
      else err = err || data.error || 'busy';
    } catch { err = 'offline'; }
    // with a fallback (the demo) any error shows the scripted answer: check /api/chat works before recording with the real AI · 演示用备用回答
    if (err) { wait.remove(); history.pop(); if (fallback) { reply(fallback, fromVoice); onExchange({ q: text, a: fallback }); } else { error(err); onExchange({ q: text, err }); } }
    busy = false; send.disabled = false;
  }

  function setMic(on) { mic.classList.toggle('live', on); mic.setAttribute('aria-pressed', on); }
  async function startVoice() {
    if (!canListen) { open(); error('unsupported'); onExchange({ err: 'unsupported' }); return; }
    if (isListening()) { userStopped = true; stopListening(); onExchange({ state: null }); return; }
    open(); stopSpeaking(); setMic(true); input.placeholder = '…'; userStopped = false; onExchange({ state: 'listening' });
    try {
      const text = await listen(langSel.value, t => { input.value = t; onExchange({ state: 'listening', q: t }); }, st => { input.placeholder = (READING[document.documentElement.dataset.lang] || READING.en); onExchange({ state: st }); });   // live transcript / 'transcribing' (server speech-to-text) · 实时文字 / 转写中
      setMic(false); input.placeholder = ph();
      if (text) ask(text, true); else if (!userStopped) onExchange({ err: 'nospeech' });   // nothing heard (not when you stopped it) · 没听到
    } catch (e) { setMic(false); input.placeholder = ph(); error(e.code || 'network'); onExchange({ err: e.code || 'network' }); }
  }

  $('#chatBtn').onclick = () => panel.classList.contains('show') ? close() : open();
  $('#chatClose').onclick = close;
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); ask(input.value, false); });
  mic.onclick = startVoice;
  spk.onclick = () => { speakReplies = !speakReplies; spk.classList.toggle('on', speakReplies); spk.setAttribute('aria-pressed', speakReplies); if (!speakReplies) stopSpeaking(); };
  const PH = { en: 'Ask a question', zh: '输入问题', es: 'Haz una pregunta', pt: 'Faça uma pergunta' };
  const ph = () => PH[document.documentElement.dataset.lang] || PH.en;
  input.placeholder = ph(); new MutationObserver(() => { if (!isListening()) input.placeholder = ph(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
  return { open, close, startVoice, refresh: renderContext, ask, setVoiceLang, isOpen: () => panel.classList.contains('show'),
    say: text => add('bot', text) };   // a Cosmo line in the chat, without asking the AI (feature intros) · 在对话中显示 Cosmo 的一句话
}
