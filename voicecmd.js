// 🎙 Voice commands: a spoken (or typed) equivalent for every hand action · 语音指令 · Comandos de voz · Comandos de voz
// "go to the galaxy", "open Andromeda", "back", "start the tour", "save this place", "how to move", "ask: …" in EN/中文/ES/PT.
// Pure parser (tested in node); main.js runs the action and Cosmo confirms it. Planet names, "line up" and orbit pause stay in chat.js.
// 纯解析器；main.js 执行动作。行星名称、并排对比和暂停公转仍由 chat.js 处理。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
// Lower-case, no accents, no punctuation · 小写、去重音、去标点
export const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.,!?;:¡¿。！？，；：“”"']/g, ' ').replace(/\s+/g, ' ').trim();
const CJK = /[㐀-鿿]/;
const has = (t, n) => n && (CJK.test(n) ? t.includes(n) : new RegExp(`(^| )${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`).test(t));
const RX = {
  // a bare verb needs ":" or "Cosmo" ("ask about Mars", "Pergunta sobre a lua" stay whole questions) · 需要冒号或 Cosmo
  ask: /^(ask|question|pregunta|preguntar|pergunta|perguntar|问|提问)(?:\s*[:：]\s*|\s*(?:\s|(?<=[问问]))(?:a |ao )?cosmos?(?![a-z])\s*[:：,，]?\s*)(.+)$/i,
  zoomIn: /^(please )?(zoom in|closer|get closer|come closer|acercar|acerca(r)?( el)? zoom|mas cerca|aproximar|aproxima|aproxime|mais perto|放大|拉近|靠近)( please| por favor)?$/,
  zoomOut: /^(please )?(zoom out|further|farther|go further|move away|alejar|aleja(r)?( el)? zoom|mas lejos|afastar|afasta|afaste|mais longe|缩小|拉远)( please| por favor)?$/,
  turn: /^(please )?(turn|rotate|spin|gira|girar|vira|virar|gire|vire)( (to )?the)?( (left|right)| a la (izquierda|derecha)|( para)? a (esquerda|direita)| (izquierda|derecha|esquerda|direita))( please| por favor)?$|^(向)?(左|右)(转|旋转)?$/,
  back: /^(back|go back|step back|one step back|atras|volver|vuelve|regresa|voltar|volta|para tras|返回|后退|回去)( please| por favor| por favor)?$/,
  tourStart: /^(please )?((start|begin|play)( the)? tour|tour with cosmo|(empieza|comienza|inicia|empezar)( el)? tour|(comeca|comecar|comece|inicia|iniciar)( o)? tour|开始(游览|导览))( please| por favor)?$/,
  tourStop: /^(please )?((stop|end|exit|quit)( the)? tour|(para|deten|termina|sal del)( el)? tour|(parar|pare|termina|terminar|sair do)( o)? tour|(停止|结束|退出)(游览|导览))( please| por favor)?$/,
  tourPause: /^(please )?(pause( the)? tour|(pausa|pausar)( el| o)? tour|暂停(游览|导览))( please| por favor)?$/,
  tourResume: /^(please )?((resume|continue)( the)? tour|(reanuda|continua|continuar|retomar|retoma)( el| o)? tour|继续(游览|导览))( please| por favor)?$/,
  save: /^(please )?((save|bookmark)( this)?( place)?|(add|save) (it|this|here)( to (my )?favou?rites)?|guarda(r)?( este lugar)?|(salva|salve|salvar)( este lugar)?|(收藏|保存)(这里|这个地方)?)( please| por favor)?$/,
  guide: /^(what can i say|voice commands|what can i ask|que puedo decir|comandos de voz|o que (eu )?posso dizer|我可以说什么|语音命令|how (do i|to) move( around)?|how to (use|explore)( this| it| the app)?|controls|help|show (me )?the controls|como (me )?muevo|como moverse|ayuda|como mexer|como (eu )?me movo|ajuda|怎么操作|帮助)$/,
  logbook: /^((open|show)( me)?( my| the)? )?(log ?book|my stamps|stamps)$|^((abre|abrir|mostra|muestra)( me)? )?((mi|la|o|meu) )?(bitacora|diario( de bordo)?)$|^(打开)?(我的)?(探险)?日志$/,
  news: /^((open|show)( me)?( the)? )?news$|^((abre|abrir|mostra|muestra|ver)( me)? )?((las|as) )?(noticias|novidades)$|^(打开)?新闻$/,
  planet: /^((open|show)( me)? )?my planet$|^create (a|my) planet$|^((abre|abrir|muestra|mostra) )?(mi|meu|o meu) planeta$|^crea(r)? (un|mi) planeta$|^cri(a|e|ar) (um|meu) planeta$|^(打开)?我的行星$|^创造(一颗)?行星$/,
};
const NAV = /^(go to|go|fly to|take me to|show( me)?|open|visit|zoom (in )?(to|on)|ve a|ir a|vamos a|vuela a|llevame a|muestra(me)?|abre|visita|vai para|va para|ir para|vamos para|voa para|leva me para|me leva para|mostra|mostre|abra|abre|visite|去|飞到|前往|打开|看看|显示)\s*/;
// Names to match: levels ("L:id"), journey pieces ("P:id"); each with its 4-language names · 名称表
export function buildNames({ levels = [], pieces = [] } = {}) {
  const out = [];
  for (const lv of levels) for (const n of Object.values(lv.names || {})) out.push({ id: 'L:' + lv.id, n: norm(n), names: lv.names });
  for (const p of pieces) for (const n of Object.values(p.names || {})) out.push({ id: 'P:' + p.id, n: norm(n), names: p.names });
  // short extras people say · 常见说法
  const extra = { 'L:universe': ['universe', 'the universe', 'universo', 'el universo', 'o universo', '宇宙'], 'L:galaxy': ['our galaxy', 'the galaxy', 'la galaxia', 'a galaxia'], 'P:cosmic-web': ['cosmic web', 'the cosmic web', 'red cosmica', 'teia cosmica', '宇宙网'],
    'L:solar-system': ['solar system', 'the solar system', 'sistema solar', 'el sistema solar', 'o sistema solar', '太阳系'], 'L:neighbourhood': ['solar neighborhood', 'neighbourhood', 'neighborhood', 'vecindario', 'vizinhanca'],
    'P:andromeda': ['andromeda', 'andromeda galaxy', '仙女座'], 'P:orion-nebula': ['orion nebula', 'orion', 'nebulosa de orion', '猎户座星云'], 'P:m87': ['m87', 'virgo a', 'm 87'],
    'P:sgr-a-star': ['sagittarius a star', 'sgr a star', 'sagitario a', 'sagitario a estrela', 'the black hole', 'el agujero negro', 'o buraco negro', '黑洞'], 'P:pillars-of-creation': ['pillars', 'the pillars', 'pilares', 'os pilares', '创生之柱'],
    'P:pleiades': ['pleiades', 'seven sisters', 'pleyades', 'as pleiades', '七姐妹'], 'P:alpha-centauri': ['alpha centauri', 'alfa centauro', 'alfa centauri'], 'P:laniakea': ['laniakea'], 'P:betelgeuse': ['betelgeuse'] };
  for (const [id, list] of Object.entries(extra)) for (const n of list) out.push({ id, n: norm(n) });
  return out.sort((a, b) => b.n.length - a.n.length);   // longest first ("local group" before "group") · 最长优先
}
// Returns an action, or null (then chat.js tries its own commands, then Cosmo) · 返回动作或 null
export function parseVoiceCommand(text, names = []) {
  const raw = String(text || '').trim(); if (!raw || raw.length > 160) return null;
  const a = RX.ask.exec(raw); if (a) return { type: 'ask', q: a[2].trim() };
  const t = norm(raw); if (!t) return null;
  const question = /[?？]/.test(raw) || /^(what|why|how|when|where|who|which|is|are|can|could|do|does|did|tell|que|qual|quais|quem|como|cual|cuales|cuando|donde|por que|porque|hay|me|o que|什么|为什么|怎么|哪|是不是)( |$)/.test(t) || /吗$/.test(raw);
  if (RX.back.test(t)) return { type: 'back' };
  if (RX.guide.test(t)) return { type: 'guide' };   // exact phrases only ("how do I move?" too) · 仅精确短语
  if (question) return null;   // a question goes to Cosmo · 问题交给 Cosmo
  if (RX.tourStop.test(t)) return { type: 'tour', op: 'stop' };
  if (RX.tourPause.test(t)) return { type: 'tour', op: 'pause' };
  if (RX.tourResume.test(t)) return { type: 'tour', op: 'resume' };
  if (RX.tourStart.test(t)) return { type: 'tour', op: 'start' };
  if (RX.planet.test(t)) return { type: 'planet' };
  if (RX.logbook.test(t)) return { type: 'logbook' };
  if (RX.news.test(t)) return { type: 'news' };
  if (RX.save.test(t)) return { type: 'save' };
  if (RX.zoomIn.test(t)) return { type: 'zoom', dir: 'in' };
  if (RX.zoomOut.test(t)) return { type: 'zoom', dir: 'out' };
  if (RX.turn.test(t)) return { type: 'turn', dir: /left|izquierda|esquerda|左/.test(t) ? 1 : -1 };
  // places: with a "go to" verb, or the name alone (a short phrase) · 地点：带“去”或只说名称
  const rest = t.replace(NAV, ''), verb = rest !== t || /^(去|飞到|前往|打开|看看|显示)/.test(raw);
  for (const x of names) if (has(rest, x.n) && (verb || rest === x.n || rest.replace(/^(the|el|la|los|las|o|a|os|as) /, '') === x.n)) return { type: 'go', id: x.id };
  return null;
}
export const VC_UI = { row: L('🎙 Say a command or ask (✌)', '🎙 说出指令或提问（✌）', '🎙 Di una orden o pregunta (✌)', '🎙 Diga um comando ou pergunte (✌)') };
// What Cosmo says back (app text, no facts) · Cosmo 的确认语
export const VC_SAY = {
  go: L('Flying to {n}.', '正在前往{n}。', 'Volando a {n}.', 'Voando para {n}.'),
  back: L('One step back.', '后退一步。', 'Un paso atrás.', 'Um passo atrás.'),
  tourStart: L('Starting the tour with Cosmo.', '开始和 Cosmo 一起游览。', 'Empieza el tour con Cosmo.', 'Começando o tour com o Cosmo.'),
  tourStop: L('Tour stopped.', '游览已停止。', 'Tour detenido.', 'Tour parado.'),
  tourPause: L('Tour paused.', '游览已暂停。', 'Tour en pausa.', 'Tour pausado.'),
  tourResume: L('Tour continues.', '继续游览。', 'El tour continúa.', 'O tour continua.'),
  noTour: L('No tour is playing.', '目前没有在游览。', 'No hay ningún tour en curso.', 'Nenhum tour está tocando.'),
  saved: L('Saved to your favourites.', '已加入你的收藏。', 'Guardado en tus favoritos.', 'Salvo nos seus favoritos.'),
  already: L('This place is already in your favourites.', '这个地方已经在你的收藏里了。', 'Este lugar ya está en tus favoritos.', 'Este lugar já está nos seus favoritos.'),
  nothing: L('Open a place first, then say “save this place”.', '先打开一个地方，再说“收藏这里”。', 'Abre primero un lugar y luego di “guarda este lugar”.', 'Abra um lugar primeiro e depois diga “salve este lugar”.'),
  guide: L('Here is how to move.', '这是操作方法。', 'Así es como te mueves.', 'É assim que você se move.'),
  logbook: L('Here is your logbook.', '这是你的探险日志。', 'Aquí está tu bitácora.', 'Aqui está o seu diário de bordo.'),
  news: L('Here is the latest news.', '这是最新新闻。', 'Aquí están las últimas noticias.', 'Aqui estão as últimas notícias.'),
  zoomIn: L('Zooming in.', '放大。', 'Acercando.', 'Aproximando.'),
  zoomOut: L('Zooming out.', '缩小。', 'Alejando.', 'Afastando.'),
  zoomMax: L('That’s as close as it goes here.', '这里已经放到最大了。', 'Más cerca no se puede aquí.', 'Mais perto que isso não dá aqui.'),
  zoomMin: L('That’s as far as it goes: this is the edge of what we can see.', '已经到最远了：这是我们能看到的边界。', 'Más lejos no se puede: este es el límite de lo que podemos ver.', 'Mais longe que isso não dá: este é o limite do que podemos ver.'),
  turn: L('Turning the view.', '旋转视角。', 'Girando la vista.', 'Girando a vista.'),
  planet: L('Here is your planet.', '这是你的行星。', 'Aquí está tu planeta.', 'Aqui está o seu planeta.'),
};
// The voice equivalents of the hand actions (shown in the 🧭 guide) · 手势对应的语音说法
export const VOICE_GUIDE = [
  [L('“Go to the galaxy” · “Open Andromeda” · “Mars”', '“去银河系” · “打开仙女座星系” · “火星”', '“Ve a la galaxia” · “Abre Andrómeda” · “Marte”', '“Vai para a galáxia” · “Abre Andrômeda” · “Marte”'), L('jump to any place', '跳到任意地方', 'salta a cualquier lugar', 'salta para qualquer lugar')],
  [L('“Zoom in” · “Zoom out”', '“放大” · “缩小”', '“Acercar” · “Alejar”', '“Aproximar” · “Afastar”'), L('zoom; at the edge, on to the next level (like 🤏 or 🤏🤏)', '缩放；到边界后进入下一层（同 🤏 或 🤏🤏）', 'zoom; en el borde, al siguiente nivel (como 🤏 o 🤏🤏)', 'zoom; na borda, vai ao próximo nível (como 🤏 ou 🤏🤏)')],
  [L('“Turn left” · “Turn right”', '“向左转” · “向右转”', '“Gira a la izquierda” · “a la derecha”', '“Vira para a esquerda” · “para a direita”'), L('turn the view (like ✋ palm)', '旋转视角（同 ✋ 手掌）', 'gira la vista (como ✋ palma)', 'gira a vista (como ✋ palma)')],
  [L('“Back”', '“返回”', '“Atrás”', '“Voltar”'), L('one step back (like ✊)', '后退一步（同 ✊）', 'un paso atrás (como ✊)', 'um passo atrás (como ✊)')],
  [L('“Start the tour” · “Pause / stop the tour”', '“开始游览” · “暂停 / 停止游览”', '“Empieza el tour” · “Pausa / para el tour”', '“Comece o tour” · “Pause / pare o tour”'), L('the tour with Cosmo', '和 Cosmo 一起游览', 'el tour con Cosmo', 'o tour com o Cosmo')],
  [L('“Save this place”', '“收藏这里”', '“Guarda este lugar”', '“Salve este lugar”'), L('add it to ★ favourites', '加入 ★ 收藏', 'añádelo a ★ favoritos', 'adicione aos ★ favoritos')],
  [L('“Line up the planets” · “Pause”', '“把行星并排” · “暂停”', '“Alinea los planetas” · “Pausa”', '“Planetas lado a lado” · “Pausar”'), L('compare sizes · pause the orbits', '对比大小 · 暂停公转', 'comparar tamaños · pausar órbitas', 'comparar tamanhos · pausar órbitas')],
  [L('“Logbook” · “News” · “My planet” · “How to move”', '“日志” · “新闻” · “我的行星” · “怎么操作”', '“Bitácora” · “Noticias” · “Mi planeta” · “Cómo moverse”', '“Diário de bordo” · “Notícias” · “Meu planeta” · “Como mexer”'), L('open that panel', '打开对应面板', 'abre ese panel', 'abre esse painel')],
  [L('Any question · “Ask: …”', '任何问题 · “问：…”', 'Cualquier pregunta · “Pregunta: …”', 'Qualquer pergunta · “Pergunta: …”'), L('Cosmo answers from the app’s sources', 'Cosmo 根据应用中的来源回答', 'Cosmo responde con las fuentes de la app', 'o Cosmo responde com as fontes do app')],
];
