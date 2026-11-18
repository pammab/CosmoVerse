// Demo for the video · 演示模式 · Demo para el vídeo · Demo para o vídeo
// Open the app with ?demo=1 and it plays a timed showcase (< 3 min) with voice and large captions, no mouse needed:
// title card over the universe cover → the universe → Pillars of Creation → Saturn, Mars (rover), "What is this?" on Olympus Mons, Earth → Ask Cosmo → hands → closing card.
// Space pauses and resumes, Esc stops. It runs on the same runner as the Tour with Cosmo (tour.js createTour).
// 打开 ?demo=1 播放定时演示（不到 3 分钟），有语音和大字幕；空格暂停/继续，Esc 结束。
//   • Facts come only from texts that are already sourced (level blurbs, planet and piece narration); the demo's own
//     lines describe the app, not the universe. Pure: runs in node for the tests.
import { levelById } from './journey.js';
import { NARRATION } from './narration-text.js';
import { PIECES } from './pieces/index.js';
import { levelSpeech, firstSentence, VOICE_LANGS } from './voice-clips.js';
import { LANDMARKS } from './landmarks.js';

const L = (en, zh, es, pt) => ({ en, zh, es, pt });
const firstOf = arr => Object.fromEntries(VOICE_LANGS.map((l, i) => [l, firstSentence(arr[i])]));
// The first n sentences of a sourced text (keeps the video under 3 minutes) · 取前 n 句
export const firstN = (text, n) => { let rest = String(text || ''), out = ''; for (let k = 0; k < n && rest; k++) { const f = firstSentence(rest); if (!f) break; out += (out ? (/[。！？]$/.test(f) ? '' : ' ') : '') + f; rest = rest.slice(rest.indexOf(f) + f.length).trim(); } return out; };
const firstNOf = (byLang, n) => Object.fromEntries(VOICE_LANGS.map((l, i) => [l, firstN(Array.isArray(byLang) ? byLang[i] : byLang[l], n)]));
export const DEMO_UI = {
  title: L('CosmoVerse demo', 'CosmoVerse 演示', 'Demo de CosmoVerse', 'Demo do CosmoVerse'),
  askName: L('Ask Cosmo', '问问 Cosmo', 'Pregunta a Cosmo', 'Pergunte ao Cosmo'),
};
// Cards shown full screen (title, hands, closing): heading, lines · 全屏卡片
export const DEMO_CARDS = {
  title: { head: L('CosmoVerse', 'CosmoVerse', 'CosmoVerse', 'CosmoVerse'),
    lines: [L('A planetarium you hold in your hands', '握在手中的天文馆', 'Un planetario en tus manos', 'Um planetário nas suas mãos'),
      L('From Saturn’s rings to the cosmic web · with a guide who speaks and answers', '从土星光环到宇宙网 · 有会说话、会回答的向导', 'De los anillos de Saturno a la red cósmica · con un guía que habla y responde', 'Dos anéis de Saturno à teia cósmica · com um guia que fala e responde')] },
  hands: { head: L('Hands first', '双手优先', 'Primero las manos', 'Primeiro as mãos'),
    icons: [['🤏', L('Pinch and pull to zoom', '捏合拉动来缩放', 'Pellizca y tira para hacer zoom', 'Faça pinça e puxe para dar zoom')],
      ['☝', L('Point and hold to open', '指向并停留来打开', 'Apunta y mantén para abrir', 'Aponte e segure para abrir')],
      ['✊', L('Hold a fist to come back', '保持握拳来返回', 'Mantén el puño para volver', 'Segure o punho para voltar')]],
    lines: [L('Webcam on a computer · your own hands in VR on Meta Quest · mixed reality: the universe on your table',
      '电脑上用摄像头 · Meta Quest 的 VR 里直接用双手 · 混合现实：把宇宙放在你的桌上',
      'Cámara web en el ordenador · tus propias manos en VR en Meta Quest · realidad mixta: el universo sobre tu mesa',
      'Webcam no computador · suas próprias mãos no VR do Meta Quest · realidade mista: o universo na sua mesa')] },
  end: { head: L('CosmoVerse', 'CosmoVerse', 'CosmoVerse', 'CosmoVerse'),
    lines: [L('Free · one link · Meta Quest, computer and phone', '免费 · 一个链接 · Meta Quest、电脑和手机', 'Gratis · un enlace · Meta Quest, ordenador y móvil', 'Grátis · um link · Meta Quest, computador e celular'),
      L('English · 中文 · Español · Português · every fact with its source', 'English · 中文 · Español · Português · 每条事实都有来源', 'English · 中文 · Español · Português · cada dato con su fuente', 'English · 中文 · Español · Português · cada fato com sua fonte'),
      L('📔 Stamps, collections and weekly missions · ✎ make and share your own tour · 📰 news from NASA, ESA, ESO and Webb', '📔 印章、收藏册和每周任务 · ✎ 制作并分享你自己的游览 · 📰 来自 NASA、欧空局、欧南台和韦布的新闻', '📔 Sellos, colecciones y misiones semanales · ✎ crea y comparte tu propio tour · 📰 noticias de la NASA, la ESA, ESO y Webb', '📔 Selos, coleções e missões semanais · ✎ crie e compartilhe seu próprio tour · 📰 notícias da NASA, ESA, ESO e Webb')] },
};
// Cosmo's demo lines (about the app, no facts) · 演示串场词（只介绍应用）
export const DEMO_LINES = {
  title: L('This is CosmoVerse: a planetarium you hold in your hands. Let me show you around.',
    '这是 CosmoVerse：一座握在手中的天文馆。我带你看看。',
    'Esto es CosmoVerse: un planetario en tus manos. Déjame enseñártelo.',
    'Este é o CosmoVerse: um planetário nas suas mãos. Deixe eu te mostrar.'),
  solar: L('One continuous zoom brings us home to the Solar System. Every planet opens up close.',
    '一次连续的缩放把我们带回太阳系。每颗行星都可以近距离打开。',
    'Un solo zoom continuo nos trae de vuelta al sistema solar. Cada planeta se abre de cerca.',
    'Um único zoom contínuo nos traz de volta ao Sistema Solar. Cada planeta se abre de perto.'),
  ask: L('And you can ask me anything about what you see.', '你还可以问我关于眼前任何东西的问题。',
    'Y puedes preguntarme cualquier cosa sobre lo que ves.', 'E você pode me perguntar qualquer coisa sobre o que está vendo.'),
  hands: L('Everything works with your hands: pinch to zoom, point to open, a fist to come back. On a computer, on a phone, and in VR.',
    '一切都可以用双手完成：捏合缩放，指向打开，握拳返回。电脑、手机和 VR 都可以。',
    'Todo funciona con las manos: pellizca para hacer zoom, apunta para abrir y cierra el puño para volver. En el ordenador, en el móvil y en VR.',
    'Tudo funciona com as mãos: pinça para dar zoom, apontar para abrir, punho para voltar. No computador, no celular e no VR.'),
  end: L('CosmoVerse is free, in four languages, one link away. Come and explore.',
    'CosmoVerse 免费，支持四种语言，一个链接就能打开。来探索吧。',
    'CosmoVerse es gratis, en cuatro idiomas, a un enlace de distancia. Ven a explorar.',
    'O CosmoVerse é grátis, em quatro idiomas, a um link de distância. Venha explorar.'),
};
// Ask Cosmo: the question, and the answer shown when the AI server is offline (Saturn's sourced narration) · 问答
// (the second sentence of Saturn's narration, which the Saturn beat doesn't say) · 土星介绍的第二句
const secondOf = arr => Object.fromEntries(VOICE_LANGS.map((l, i) => [l, firstN(arr[i], 2).slice(firstSentence(arr[i]).length).trim()]));
export const DEMO_QA = {
  q: L('Could Saturn float in water?', '土星能浮在水上吗？', '¿Podría Saturno flotar en el agua?', 'Saturno flutuaria na água?'),
  a: secondOf(NARRATION.saturn),
};
export const DEMO_LEVELS = ['universe'];        // the ladder jump (one level keeps the video under 3 min) · 阶梯跳跃
export const DEMO_PIECE = 'pillars-of-creation';
export const DEMO_PLANETS = ['saturn', 'mars', 'earth'];

// Steps, same shape as tour.js plus card / piece / chat · 步骤（与游览相同，另加卡片、天体、问答）
export function demoSteps() {
  const piece = PIECES.find(p => p.id === DEMO_PIECE);
  const steps = [{ key: 'demo-title', text: DEMO_LINES.title, card: 'title', title: DEMO_UI.title, hold: 1500 }];
  for (const id of DEMO_LEVELS) { const lv = levelById(id); steps.push({ key: 'level-' + id, text: levelSpeech(lv.blurb), go: id, title: lv.names }); }
  steps.push({ key: 'demo-pillars', text: firstNOf(piece.narration, 2), piece: DEMO_PIECE, title: piece.names });   // its first two sentences · 前两句
  steps.push({ key: 'demo-solar', text: DEMO_LINES.solar, home: true, title: levelById('solar-system').names });
  // "What is this?" on Mars (point-and-ask): the Olympus Mons card, its sourced JPL line · 火星上的“这是什么？”
  const om = LANDMARKS.mars.find(l => l.id === 'olympus-mons');
  for (const id of DEMO_PLANETS) { if (id === 'earth') steps.push({ key: 'demo-what', text: om.text, select: 'mars', what: 'spot-olympus-mons', title: L('What is this? · Olympus Mons', '这是什么？· 奥林帕斯山', '¿Qué es esto? · Monte Olimpo', 'O que é isto? · Monte Olimpo') });
    steps.push(id === 'earth' ? { key: 'demo-earth', text: firstNOf(NARRATION.earth, 2), select: 'earth' }   // "Welcome home." + one more sentence · 地球取前两句
    : { key: 'tour-' + id, text: firstOf(NARRATION[id]), select: id }); }
  steps.push({ key: 'demo-ask', text: DEMO_LINES.ask, select: 'saturn', chat: DEMO_QA, title: DEMO_UI.askName, hold: 5000 });   // time to read the answer · 留时间阅读回答
  steps.push({ key: 'demo-hands', text: DEMO_LINES.hands, card: 'hands', title: DEMO_CARDS.hands.head, hold: 1500 });
  steps.push({ key: 'demo-end', text: DEMO_LINES.end, card: 'end', title: DEMO_UI.title, hold: 2500 });
  return steps;
}
// Voice clips the demo adds (the others already exist: levels, pieces, tour-<planet>) · 新增语音
export const demoClips = () => demoSteps().filter(s => s.key.startsWith('demo-')).map(s => [s.key, s.text]);
