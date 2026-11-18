// Ask Cosmo inside VR · 在 VR 中问 Cosmo · Pregunta a Cosmo en VR · Pergunte ao Cosmo no VR
// A row on the VR ladder panel opens a few suggested questions for what you are looking at (point + hold, or touch);
// ✌ asks with your voice where the browser can listen. The answer shows on the VR panel and is spoken.
// The AI answers only on the server version (/api/chat); on GitHub Pages the panel says so instead of failing silently.
// VR 阶梯面板上的一行：打开针对当前对象的几个问题（指向停留或触碰）；✌ 用语音提问。回答显示在 VR 面板并朗读。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const VRC_UI = {
  row: L('💬 Ask Cosmo', '💬 问问 Cosmo', '💬 Pregunta a Cosmo', '💬 Pergunte ao Cosmo'),
  close: L('✕ Close questions', '✕ 关闭问题', '✕ Cerrar preguntas', '✕ Fechar perguntas'),
  voice: L('🎙 Ask with your voice (✌)', '🎙 用语音提问（✌）', '🎙 Pregunta con la voz (✌)', '🎙 Pergunte com a voz (✌)'),
  eyebrow: L('ASK COSMO', '问问 COSMO', 'PREGUNTA A COSMO', 'PERGUNTE AO COSMO'),
  pick: L('Point at a question and hold, or touch it', '指向一个问题并停留，或直接触碰', 'Apunta a una pregunta y mantén, o tócala', 'Aponte para uma pergunta e segure, ou toque nela'),
  thinking: L('Cosmo is thinking…', 'Cosmo 正在思考…', 'Cosmo está pensando…', 'O Cosmo está pensando…'),
  transcribing: L('Got it, reading what you said…', '收到，正在识别…', 'Entendido, leyendo lo que dijiste…', 'Entendi, lendo o que você disse…'),
  listening: L('Listening… ask your question', '正在听…请提问', 'Escuchando… haz tu pregunta', 'Ouvindo… faça sua pergunta'),
  offline: L('The AI guide needs the online version of CosmoVerse (with its server). This copy has no server, so Cosmo can’t answer here.',
    'AI 向导需要带服务器的在线版 CosmoVerse。这个版本没有服务器，所以 Cosmo 在这里无法回答。',
    'El guía con IA necesita la versión en línea de CosmoVerse (con su servidor). Esta copia no tiene servidor, así que Cosmo no puede responder aquí.',
    'O guia com IA precisa da versão online do CosmoVerse (com o servidor). Esta cópia não tem servidor, então o Cosmo não pode responder aqui.'),
  busy: L('Cosmo couldn’t answer just now. Try again in a moment.', 'Cosmo 暂时无法回答，请稍后再试。', 'Cosmo no pudo responder ahora. Inténtalo de nuevo en un momento.', 'O Cosmo não conseguiu responder agora. Tente de novo daqui a pouco.'),
  noVoice: L('This browser can’t listen: point at a question instead.', '此浏览器无法听写：请改为指向一个问题。', 'Este navegador no puede escuchar: apunta a una pregunta.', 'Este navegador não consegue ouvir: aponte para uma pergunta.'),
  still: L('Cosmo is still answering the last question…', 'Cosmo 还在回答上一个问题…', 'Cosmo aún está respondiendo la pregunta anterior…', 'O Cosmo ainda está respondendo a pergunta anterior…'),
  noSpeech: L('I didn’t catch that. Try ✌ again, or point at a question.', '我没听清。再做一次 ✌，或指向一个问题。', 'No te entendí. Prueba ✌ otra vez o apunta a una pregunta.', 'Não entendi. Tente ✌ de novo ou aponte para uma pergunta.'),
  mic: L('The microphone isn’t available: allow it in the browser, or point at a question.', '麦克风不可用：请在浏览器中允许，或指向一个问题。', 'El micrófono no está disponible: permítelo en el navegador o apunta a una pregunta.', 'O microfone não está disponível: permita-o no navegador ou aponte para uma pergunta.'),
  hint: L('Point at another question · ✕ Close questions', '指向另一个问题 · ✕ 关闭问题', 'Apunta a otra pregunta · ✕ Cerrar preguntas', 'Aponte para outra pergunta · ✕ Fechar perguntas'),
  hintDone: L('Raise and lower your hand to close · or ✕ Close', '举起手再放下即可关闭 · 或 ✕ 关闭', 'Sube y baja la mano para cerrar · o ✕ Cerrar', 'Levante e abaixe a mão para fechar · ou ✕ Fechar'),
};
const fill = (o, name) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.replaceAll('{n}', name[k] ?? name.en)]));
// Questions for what you are looking at: a planet / the Sun, a journey piece, a journey level, or the Solar System.
// Shared by the VR panel and the chat's suggestion buttons (Pamela, Nov 18: Cosmo's suggestions follow the journey level).
// Each level / piece question is answered by a sourced fact of that level's pieces (tested) · 针对当前对象的问题（VR 与对话共用）
export const LEVEL_QUESTIONS = {
  universe: [
    L('How old is the universe?', '宇宙有多少岁了？', '¿Qué edad tiene el universo?', 'Quantos anos tem o universo?'),
    L('What is the cosmic web?', '什么是宇宙网？', '¿Qué es la red cósmica?', 'O que é a teia cósmica?'),
    L('How much of the universe is dark matter and dark energy?', '宇宙中暗物质和暗能量占多少？', '¿Qué parte del universo es materia oscura y energía oscura?', 'Quanto do universo é matéria escura e energia escura?'),
  ],
  supercluster: [
    L('How big is Laniakea?', '拉尼亚凯亚有多大？', '¿Qué tamaño tiene Laniakea?', 'Qual é o tamanho de Laniakea?'),
    L('Where are we in Laniakea?', '我们在拉尼亚凯亚的什么位置？', '¿Dónde estamos en Laniakea?', 'Onde estamos em Laniakea?'),
    L('What is special about M87?', 'M87 有什么特别之处？', '¿Qué tiene de especial M87?', 'O que M87 tem de especial?'),
  ],
  'local-group': [
    L('How many galaxies are in the Local Group?', '本星系群里有多少个星系？', '¿Cuántas galaxias hay en el Grupo Local?', 'Quantas galáxias há no Grupo Local?'),
    L('Will the Milky Way crash into Andromeda?', '银河系会和仙女座星系相撞吗？', '¿Chocará la Vía Láctea con Andrómeda?', 'A Via Láctea vai colidir com Andrômeda?'),
    L('How far away is Andromeda?', '仙女座星系离我们有多远？', '¿A qué distancia está Andrómeda?', 'A que distância está Andrômeda?'),
  ],
  galaxy: [
    L('How big is the Milky Way?', '银河系有多大？', '¿Qué tamaño tiene la Vía Láctea?', 'Qual é o tamanho da Via Láctea?'),
    L('Where is the Sun in the Milky Way?', '太阳在银河系的什么位置？', '¿Dónde está el Sol en la Vía Láctea?', 'Onde fica o Sol na Via Láctea?'),
    L('What is at the centre of our galaxy?', '我们星系的中心有什么？', '¿Qué hay en el centro de nuestra galaxia?', 'O que há no centro da nossa galáxia?'),
  ],
  neighbourhood: [
    L('Which is the nearest star to the Sun?', '离太阳最近的恒星是哪颗？', '¿Cuál es la estrella más cercana al Sol?', 'Qual é a estrela mais próxima do Sol?'),
    L('Can I see the Pleiades without a telescope?', '不用望远镜能看到昴星团吗？', '¿Puedo ver las Pléyades sin telescopio?', 'Consigo ver as Plêiades sem telescópio?'),
    L('What are the Pillars of Creation?', '创生之柱是什么？', '¿Qué son los Pilares de la Creación?', 'O que são os Pilares da Criação?'),
  ],
};
// Each piece: three hand-written questions with the right articles in every language, answered by its own sourced facts (tested)
// 每个天体三个手写问题（各语言冠词正确），答案来自它自己的有来源事实
const Q = L;
export const PIECE_QUESTIONS = {
  'milky-way': [
    Q('What is the Milky Way, in simple words?', '用简单的话说，银河系是什么？', '¿Qué es la Vía Láctea, en palabras sencillas?', 'O que é a Via Láctea, em palavras simples?'),
    Q('How big is the Milky Way?', '银河系有多大？', '¿Qué tamaño tiene la Vía Láctea?', 'Qual é o tamanho da Via Láctea?'),
    Q('How long does the Sun take to go once around it?', '太阳绕银河系转一圈要多久？', '¿Cuánto tarda el Sol en dar una vuelta a la galaxia?', 'Quanto tempo o Sol leva para dar uma volta nela?'),
  ],
  'local-group': [
    Q('What is the Local Group?', '本星系群是什么？', '¿Qué es el Grupo Local?', 'O que é o Grupo Local?'),
    Q('How many galaxies are in the Local Group?', '本星系群里有多少个星系？', '¿Cuántas galaxias hay en el Grupo Local?', 'Quantas galáxias há no Grupo Local?'),
    Q('Will the Milky Way crash into Andromeda?', '银河系会和仙女座星系相撞吗？', '¿Chocará la Vía Láctea con Andrómeda?', 'A Via Láctea vai colidir com Andrômeda?'),
  ],
  'observable-universe': [
    Q('What is the observable universe?', '什么是可观测宇宙？', '¿Qué es el universo observable?', 'O que é o universo observável?'),
    Q('How old is the universe?', '宇宙有多少岁了？', '¿Qué edad tiene el universo?', 'Quantos anos tem o universo?'),
    Q('How many galaxies are there?', '宇宙中有多少个星系？', '¿Cuántas galaxias hay?', 'Quantas galáxias existem?'),
  ],
  andromeda: [
    Q('What is the Andromeda Galaxy?', '仙女座星系是什么？', '¿Qué es la galaxia de Andrómeda?', 'O que é a Galáxia de Andrômeda?'),
    Q('How far away is Andromeda?', '仙女座星系离我们有多远？', '¿A qué distancia está Andrómeda?', 'A que distância está Andrômeda?'),
    Q('Can I see Andromeda without a telescope?', '不用望远镜能看到仙女座星系吗？', '¿Puedo ver Andrómeda sin telescopio?', 'Consigo ver Andrômeda sem telescópio?'),
  ],
  'orion-nebula': [
    Q('What is the Orion Nebula?', '猎户座大星云是什么？', '¿Qué es la Nebulosa de Orión?', 'O que é a Nebulosa de Órion?'),
    Q('How far away is the Orion Nebula?', '猎户座大星云离我们有多远？', '¿A qué distancia está la Nebulosa de Orión?', 'A que distância está a Nebulosa de Órion?'),
    Q('Where do I look for it in the sky?', '在天空中哪里能找到它？', '¿Dónde la busco en el cielo?', 'Onde eu a procuro no céu?'),
  ],
  pleiades: [
    Q('What are the Pleiades?', '昴星团是什么？', '¿Qué son las Pléyades?', 'O que são as Plêiades?'),
    Q('How old are the Pleiades?', '昴星团有多少岁了？', '¿Qué edad tienen las Pléyades?', 'Quantos anos têm as Plêiades?'),
    Q('Can I see the Pleiades without a telescope?', '不用望远镜能看到昴星团吗？', '¿Puedo ver las Pléyades sin telescopio?', 'Consigo ver as Plêiades sem telescópio?'),
  ],
  'alpha-centauri': [
    Q('What is Alpha Centauri?', '半人马座α是什么？', '¿Qué es Alfa Centauri?', 'O que é Alfa Centauri?'),
    Q('Which is the nearest star to the Sun?', '离太阳最近的恒星是哪颗？', '¿Cuál es la estrella más cercana al Sol?', 'Qual é a estrela mais próxima do Sol?'),
    Q('Does Proxima Centauri have a planet?', '比邻星有行星吗？', '¿Tiene Próxima Centauri un planeta?', 'A Próxima Centauri tem um planeta?'),
  ],
  laniakea: [
    Q('What is Laniakea?', '拉尼亚凯亚是什么？', '¿Qué es Laniakea?', 'O que é Laniakea?'),
    Q('How big is Laniakea?', '拉尼亚凯亚有多大？', '¿Qué tamaño tiene Laniakea?', 'Qual é o tamanho de Laniakea?'),
    Q('What does the name Laniakea mean?', '“拉尼亚凯亚”这个名字是什么意思？', '¿Qué significa el nombre Laniakea?', 'O que significa o nome Laniakea?'),
  ],
  betelgeuse: [
    Q('What is Betelgeuse?', '参宿四是什么？', '¿Qué es Betelgeuse?', 'O que é Betelgeuse?'),
    Q('How big is Betelgeuse?', '参宿四有多大？', '¿Qué tamaño tiene Betelgeuse?', 'Qual é o tamanho de Betelgeuse?'),
    Q('Why did Betelgeuse get dimmer?', '参宿四为什么变暗了？', '¿Por qué se oscureció Betelgeuse?', 'Por que Betelgeuse ficou mais fraca?'),
  ],
  'sgr-a-star': [
    Q('What is Sagittarius A*?', '人马座A*是什么？', '¿Qué es Sagitario A*?', 'O que é Sagitário A*?'),
    Q('How heavy is Sagittarius A*?', '人马座A*有多重？', '¿Cuánta masa tiene Sagitario A*?', 'Qual é a massa de Sagitário A*?'),
    Q('When was it first photographed?', '它第一次被拍到是什么时候？', '¿Cuándo se fotografió por primera vez?', 'Quando foi fotografado pela primeira vez?'),
  ],
  'cosmic-web': [
    Q('What is the cosmic web?', '什么是宇宙网？', '¿Qué es la red cósmica?', 'O que é a teia cósmica?'),
    Q('What is a void?', '什么是空洞？', '¿Qué es un vacío cósmico?', 'O que é um vazio cósmico?'),
    Q('Has a filament ever been photographed?', '宇宙网的纤维被拍到过吗？', '¿Se ha fotografiado alguna vez un filamento?', 'Algum filamento já foi fotografado?'),
  ],
  'pillars-of-creation': [
    Q('What are the Pillars of Creation?', '创生之柱是什么？', '¿Qué son los Pilares de la Creación?', 'O que são os Pilares da Criação?'),
    Q('How far away are the Pillars of Creation?', '创生之柱离我们有多远？', '¿A qué distancia están los Pilares de la Creación?', 'A que distância estão os Pilares da Criação?'),
    Q('What does Webb see there?', '韦布望远镜在那里看到了什么？', '¿Qué ve el Webb allí?', 'O que o Webb vê lá?'),
  ],
  m87: [
    Q('What is M87?', 'M87 是什么？', '¿Qué es M87?', 'O que é M87?'),
    Q('How far away is M87?', 'M87 离我们有多远？', '¿A qué distancia está M87?', 'A que distância está M87?'),
    Q('What is special about its black hole?', '它的黑洞有什么特别之处？', '¿Qué tiene de especial su agujero negro?', 'O que o buraco negro dela tem de especial?'),
  ],
};
// A place without its own list (a future piece): neutral questions that need no article · 无专属列表时的通用问题
const SPECIAL = L('What is special about this place?', '这个地方有什么特别之处？', '¿Qué tiene de especial este lugar?', 'O que este lugar tem de especial?');
export function pieceQuestions(id, names) {
  return PIECE_QUESTIONS[id] || [
    L('What is {n}, in simple words?', '用简单的话说，{n}是什么？', '¿Qué es «{n}», en palabras sencillas?', 'O que é «{n}», em palavras simples?'),
    SPECIAL,
    L('Tell me a fun fact about this place', '讲一个关于这个地方的有趣知识', 'Cuéntame un dato curioso de este lugar', 'Conte uma curiosidade sobre este lugar'),
  ].map(q => fill(q, names));
}
export function vrQuestions(ctx) {
  if (ctx?.kind === 'body') return [
    L('Tell me a fun fact about {n}', '讲一个关于{n}的有趣知识', 'Cuéntame un dato curioso sobre {n}', 'Conte uma curiosidade sobre {n}'),
    L('Could humans live on {n}?', '人类能在{n}上生活吗？', '¿Podrían vivir humanos en {n}?', 'Os humanos poderiam viver em {n}?'),
    L('How big is {n} compared to Earth?', '{n}和地球比有多大？', '¿Qué tamaño tiene {n} comparado con la Tierra?', 'Qual é o tamanho de {n} comparado com a Terra?'),
  ].map(q => fill(q, ctx.names));
  if (ctx?.kind === 'piece') return pieceQuestions(ctx.id, ctx.names);
  if (ctx?.kind === 'level' && LEVEL_QUESTIONS[ctx.id]) return LEVEL_QUESTIONS[ctx.id];
  if (ctx?.kind === 'level' && ctx.id !== 'solar-system') return pieceQuestions(null, ctx.names);   // a level without its own list · 无专属列表的层级
  return [
    L('Which planet is the hottest?', '哪颗行星最热？', '¿Qué planeta es el más caliente?', 'Qual planeta é o mais quente?'),
    L('Which planet has the most moons?', '哪颗行星的卫星最多？', '¿Qué planeta tiene más lunas?', 'Qual planeta tem mais luas?'),
    L('How old is the Solar System?', '太阳系有多少岁了？', '¿Qué edad tiene el sistema solar?', 'Quantos anos tem o Sistema Solar?'),
  ];
}
// Which journey place to tell the server about (it builds the English line itself from its own lists) · 发给服务器的地点 id
export function placeId(ctx) {
  if (ctx?.kind === 'piece' && ctx.id) return 'P:' + ctx.id;
  if (ctx?.kind === 'level' && ctx.id && ctx.id !== 'solar-system') return 'L:' + ctx.id;
  return null;
}
// Which panel line an error code from chat.js / voice.js shows · 错误代码对应的面板文字
export function errorLine(code) {
  if (code === 'offline') return VRC_UI.offline;
  if (code === 'unsupported') return VRC_UI.noVoice;
  if (code === 'still') return VRC_UI.still;
  if (code === 'no-speech' || code === 'nospeech' || code === 'aborted') return VRC_UI.noSpeech;
  if (code === 'not-allowed' || code === 'audio-capture' || code === 'service-not-allowed') return VRC_UI.mic;
  return VRC_UI.busy;
}
// Lower your hand to close (Pamela, Nov 17): after an answer (or a "why not" line) is on the panel, a hand that was raised and then
// lowered for `ms` closes Ask Cosmo. raisedAt / loweredAt: when a hand was last up / went down (ms) · 回答后举手再放下即关闭
// raisedAt must be a fresh raise (down → up) AFTER the answer showed, so a hand that was pointing when the answer came and is then
// lowered to read does not close it; the answer also stays at least `minRead` ms · 必须在回答后重新举手；回答至少显示 minRead 毫秒
export function shouldCloseOnLower({ shownAt, raisedAt, loweredAt, now, ms = 1500, minRead = 2500 }) {
  if (!shownAt || !loweredAt || raisedAt == null) return false;
  return raisedAt >= shownAt && loweredAt >= raisedAt && now - loweredAt >= ms && now - shownAt >= minRead;
}
// Short enough for the VR panel (whole sentences when possible) · 适合 VR 面板的长度
export function panelText(text, max = 420) {
  const t = String(text || '').trim(); if (t.length <= max) return t;
  const cut = t.slice(0, max), end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('。'), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '')) + ' …';
}
