// Demo for the video · 演示模式 · Demo para el vídeo · Demo para o vídeo
// Open the app with ?demo=1 and it plays a timed showcase (< 3 min) with voice and large captions, no mouse needed:
// title card → the universe → Pillars of Creation → Saturn from the bottom bar → Ask Cosmo → orbit harp →
// birthday star → galaxy collision → a VR clip (Meta's emulator, hands) → closing card.
// Space pauses and resumes, Esc stops. It runs on the same runner as the Tour with Cosmo (tour.js createTour).
// 打开 ?demo=1 播放定时演示（不到 3 分钟），有语音和大字幕；空格暂停/继续，Esc 结束。
//   • Facts come only from texts that are already sourced (level blurbs, planet and piece narration); the demo's own
//     lines describe the app, not the universe. Pure: runs in node for the tests.
import { levelById } from './journey.js';
import { NARRATION } from './narration-text.js';
import { PIECES } from './pieces/index.js';
import { levelSpeech, firstSentence, VOICE_LANGS } from './voice-clips.js';

const L = (en, zh, es, pt) => ({ en, zh, es, pt });
const firstOf = arr => Object.fromEntries(VOICE_LANGS.map((l, i) => [l, firstSentence(arr[i])]));
// The first n sentences of a sourced text (keeps the video under 3 minutes) · 取前 n 句
export const firstN = (text, n) => { let rest = String(text || ''), out = ''; for (let k = 0; k < n && rest; k++) { const f = firstSentence(rest); if (!f) break; out += (out ? (/[。！？]$/.test(f) ? '' : ' ') : '') + f; rest = rest.slice(rest.indexOf(f) + f.length).trim(); } return out; };
const firstNOf = (byLang, n) => Object.fromEntries(VOICE_LANGS.map((l, i) => [l, firstN(Array.isArray(byLang) ? byLang[i] : byLang[l], n)]));
export const DEMO_UI = {
  title: L('CosmoVerse demo', 'CosmoVerse 演示', 'Demo de CosmoVerse', 'Demo do CosmoVerse'),
  askName: L('Ask Cosmo', '问问 Cosmo', 'Pregunta a Cosmo', 'Pergunte ao Cosmo'),
  click: L('▶ Click anywhere to start (with sound)', '▶ 点击任意位置开始（有声音）', '▶ Haz clic en cualquier lugar para empezar (con sonido)', '▶ Clique em qualquer lugar para começar (com som)'),
};
// Cards shown full screen (title, hands, closing): heading, lines · 全屏卡片
export const DEMO_CARDS = {
  title: { head: L('CosmoVerse', 'CosmoVerse', 'CosmoVerse', 'CosmoVerse'),
    lines: [L('The universe is beyond description · explore it with your own hands', '宇宙无法形容 · 用你自己的双手去探索', 'El universo no se puede describir · explóralo con tus propias manos', 'O universo está além de qualquer descrição · explore-o com as suas próprias mãos'),
      L('From Saturn’s rings to the cosmic web · with a guide who speaks and answers', '从土星光环到宇宙网 · 有会说话、会回答的向导', 'De los anillos de Saturno a la red cósmica · con un guía que habla y responde', 'Dos anéis de Saturno à teia cósmica · com um guia que fala e responde')] },
  hands: { head: L('Hands first', '双手优先', 'Primero las manos', 'Primeiro as mãos'),
    icons: [['🤏', L('Pinch and pull to zoom', '捏合拉动来缩放', 'Pellizca y tira para hacer zoom', 'Faça pinça e puxe para dar zoom')],
      ['☝', L('Point and hold to open', '指向并停留来打开', 'Apunta y mantén para abrir', 'Aponte e segure para abrir')],
      ['✊', L('Hold a fist to come back', '保持握拳来返回', 'Mantén el puño para volver', 'Segure o punho para voltar')]],
    lines: [L('Webcam on a computer · your own hands in VR on Meta Quest · mixed reality: the universe on your table',
      '电脑上用摄像头 · Meta Quest 的 VR 里直接用双手 · 混合现实：把宇宙放在你的桌上',
      'Cámara web en el ordenador · tus propias manos en VR en Meta Quest · realidad mixta: el universo sobre tu mesa',
      'Webcam no computador · suas próprias mãos no VR do Meta Quest · realidade mista: o universo na sua mesa')] },
  // In VR: a clip recorded in Meta's Immersive Web Emulator (Meta Quest 3, hand tracking), played inside the demo · VR 片段
  vr: { head: L('In VR, with your hands', '在 VR 中，用你的双手', 'En VR, con tus manos', 'No VR, com as suas mãos'), video: 'media/vr-emulator.mp4',
    lines: [L('Recorded in Meta’s Immersive Web Emulator · Meta Quest 3 with hand tracking · sped up', '录制于 Meta 沉浸式网页模拟器 · Meta Quest 3 手部追踪 · 已加速',
      'Grabado en el Immersive Web Emulator de Meta · Meta Quest 3 con seguimiento de manos · acelerado', 'Gravado no Immersive Web Emulator da Meta · Meta Quest 3 com rastreamento de mãos · acelerado')] },
  end: { head: L('CosmoVerse', 'CosmoVerse', 'CosmoVerse', 'CosmoVerse'),
    lines: [L('From the universe to your hands', '从宇宙到你的手中', 'Del universo a tus manos', 'Do universo às suas mãos'),
      L('There is so much more to explore · ☰ More', '还有更多可以探索 · ☰ 更多', 'Hay mucho más por explorar · ☰ Más', 'Há muito mais para explorar · ☰ Mais'),
      L('Free · one link · Meta Quest, computer and phone', '免费 · 一个链接 · Meta Quest、电脑和手机', 'Gratis · un enlace · Meta Quest, ordenador y móvil', 'Grátis · um link · Meta Quest, computador e celular'),
      L('English · 中文 · Español · Português · every fact with its source', 'English · 中文 · Español · Português · 每条事实都有来源', 'English · 中文 · Español · Português · cada dato con su fuente', 'English · 中文 · Español · Português · cada fato com sua fonte'),
      L('📔 Stamps, collections and weekly missions · ✎ make and share your own tour · 📰 news from NASA, ESA, ESO and Webb', '📔 印章、收藏册和每周任务 · ✎ 制作并分享你自己的游览 · 📰 来自 NASA、欧空局、欧南台和韦布的新闻', '📔 Sellos, colecciones y misiones semanales · ✎ crea y comparte tu propio tour · 📰 noticias de la NASA, la ESA, ESO y Webb', '📔 Selos, coleções e missões semanais · ✎ crie e compartilhe seu próprio tour · 📰 notícias da NASA, ESA, ESO e Webb')] },
};
// Cosmo's demo lines (about the app, no facts) · 演示串场词（只介绍应用）
export const DEMO_LINES = {
  title: L('The universe is beyond description. But you can explore it, with your own hands. This is CosmoVerse.',
    '宇宙无法用语言形容。但你可以用自己的双手去探索它。这就是 CosmoVerse。',
    'El universo no se puede describir con palabras. Pero puedes explorarlo con tus propias manos. Esto es CosmoVerse.',
    'O universo está além de qualquer descrição. Mas você pode explorá-lo com as suas próprias mãos. Este é o CosmoVerse.'),
  solar: L('One continuous zoom brings us home to the Solar System. Every planet opens up close.',
    '一次连续的缩放把我们带回太阳系。每颗行星都可以近距离打开。',
    'Un solo zoom continuo nos trae de vuelta al sistema solar. Cada planeta se abre de cerca.',
    'Um único zoom contínuo nos traz de volta ao Sistema Solar. Cada planeta se abre de perto.'),
  harp: L('Every orbit is also a string. Sweep across them, and each planet plays a note set by the length of its year.',
    '每条轨道也是一根弦。划过它们，每颗行星都会弹出一个由它一年的长度决定的音。',
    'Cada órbita es también una cuerda. Pasa por ellas y cada planeta toca una nota que depende de la duración de su año.',
    'Cada órbita também é uma corda. Passe por elas e cada planeta toca uma nota definida pela duração do seu ano.'),
  birthday: L('Type the year you were born, and find the star whose light left it around then.',
    '输入你出生的年份，找到那颗在那时发出光的恒星。',
    'Escribe el año en que naciste y encuentra la estrella cuya luz salió de ella por entonces.',
    'Digite o ano em que você nasceu e encontre a estrela cuja luz saiu dela nessa época.'),
  merge: L('At the Local Group, clap your hands and watch the Milky Way and Andromeda collide and merge.',
    '在本星系群，拍拍手，看银河系和仙女座星系相撞并合并。',
    'En el Grupo Local, aplaude y mira cómo la Vía Láctea y Andrómeda chocan y se fusionan.',
    'No Grupo Local, bata palmas e veja a Via Láctea e Andrômeda colidirem e se fundirem.'),
  vr: L('Everything works with your hands, on Meta Quest, with a webcam, or on a phone. In VR, point to play the harp, and clap to merge the galaxies.',
    '一切都可以用双手完成：Meta Quest、摄像头或手机都行。在 VR 中，用手指弹奏竖琴，拍手让星系合并。',
    'Todo funciona con las manos: en Meta Quest, con la cámara web o en el móvil. En VR, apunta para tocar el arpa y aplaude para fusionar las galaxias.',
    'Tudo funciona com as mãos: no Meta Quest, com a webcam ou no celular. No VR, aponte para tocar a harpa e bata palmas para fundir as galáxias.'),
  ask: L('And you can ask me anything about what you see.', '你还可以问我关于眼前任何东西的问题。',
    'Y puedes preguntarme cualquier cosa sobre lo que ves.', 'E você pode me perguntar qualquer coisa sobre o que está vendo.'),
  hands: L('Everything works with your hands: pinch to zoom, point to open, a fist to come back. On a computer, on a phone, and in VR.',
    '一切都可以用双手完成：捏合缩放，指向打开，握拳返回。电脑、手机和 VR 都可以。',
    'Todo funciona con las manos: pellizca para hacer zoom, apunta para abrir y cierra el puño para volver. En el ordenador, en el móvil y en VR.',
    'Tudo funciona com as mãos: pinça para dar zoom, apontar para abrir, punho para voltar. No computador, no celular e no VR.'),
  end: L('And just like the universe, there is so much more: stamps and weekly missions, your own tours, and the latest news from NASA, ESA and Webb, all in the More menu. Get exploring. CosmoVerse: from the universe to your hands.',
    '就像宇宙一样，这里还有更多：印章和每周任务、你自己的游览，以及来自 NASA、欧空局和韦布望远镜的最新消息，都在“更多”菜单里。开始探索吧。CosmoVerse：从宇宙到你的手中。',
    'Y como el universo, hay mucho más: sellos y misiones semanales, tus propios recorridos y las últimas noticias de la NASA, la ESA y el Webb, todo en el menú Más. A explorar. CosmoVerse: del universo a tus manos.',
    'E, assim como o universo, há muito mais: selos e missões semanais, os seus próprios tours e as últimas notícias da NASA, da ESA e do Webb, tudo no menu Mais. Bora explorar. CosmoVerse: do universo às suas mãos.'),
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
export const DEMO_PLANETS = ['saturn'];   // chosen from the bar's ▾ list · 从底栏列表选择
export const DEMO_BIRTH_YEAR = 1998;

// Steps, same shape as tour.js plus card / piece / chat · 步骤（与游览相同，另加卡片、天体、问答）
export function demoSteps() {
  const piece = PIECES.find(p => p.id === DEMO_PIECE);
  const steps = [{ key: 'demo-title', text: DEMO_LINES.title, card: 'title', title: DEMO_UI.title, hold: 300 }];
  for (const id of DEMO_LEVELS) { const lv = levelById(id); steps.push({ key: 'level-' + id, text: levelSpeech(lv.blurb), go: id, title: lv.names }); }
  steps.push({ key: 'demo-pillars', text: firstNOf(piece.narration, 2), piece: DEMO_PIECE, title: piece.names });   // its first two sentences · 前两句
  // Saturn, picked from the bottom bar's Solar System ▾ list · 从底栏列表选择土星
  for (const id of DEMO_PLANETS) steps.push({ key: 'tour-' + id, text: firstOf(NARRATION[id]), select: id, act: 'nav' });
  steps.push({ key: 'demo-ask', text: DEMO_LINES.ask, select: 'saturn', chat: DEMO_QA, title: DEMO_UI.askName, hold: 4000 });   // time to read the answer · 留时间阅读回答
  steps.push({ key: 'demo-harp', text: DEMO_LINES.harp, act: 'harp', title: L('Orbit harp', '轨道竖琴', 'Arpa de órbitas', 'Harpa de órbitas'), hold: 500 });
  steps.push({ key: 'demo-birthday', text: DEMO_LINES.birthday, act: 'birthday', title: L('Your birthday star', '你的生日星', 'Tu estrella de cumpleaños', 'A estrela do seu aniversário'), hold: 1500 });
  steps.push({ key: 'demo-merge', text: DEMO_LINES.merge, act: 'merge', title: L('Galaxy collision', '星系碰撞', 'Choque de galaxias', 'Colisão de galáxias'), hold: 3000 });   // the collision plays to the end · 播完碰撞
  steps.push({ key: 'demo-vr', text: DEMO_LINES.vr, card: 'vr', title: DEMO_CARDS.vr.head, hold: 10500 });   // the clip is 19 s: show it whole · 片段 19 秒
  steps.push({ key: 'demo-end', text: DEMO_LINES.end, card: 'end', title: DEMO_UI.title, hold: 2500 });
  return steps;
}
// Voice clips the demo adds (the others already exist: levels, pieces, tour-<planet>) · 新增语音
export const demoClips = () => demoSteps().filter(s => s.key.startsWith('demo-')).map(s => [s.key, s.text]);
