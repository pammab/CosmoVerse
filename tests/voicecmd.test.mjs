import test from 'node:test'; import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseVoiceCommand, buildNames, VC_SAY, VOICE_GUIDE } from '../voicecmd.js';
import { LEVELS } from '../journey.js';
import { PIECES } from '../pieces/index.js';
const names = buildNames({ levels: LEVELS, pieces: PIECES });
const p = t => parseVoiceCommand(t, names);
test('places in 4 languages, with a verb or the name alone', () => {
  assert.deepEqual(p('go to the galaxy'), { type: 'go', id: 'L:galaxy' });
  assert.deepEqual(p('Open Andromeda'), { type: 'go', id: 'P:andromeda' });
  assert.deepEqual(p('Local Group'), { type: 'go', id: 'L:local-group' });
  assert.deepEqual(p('ve a la Vía Láctea'), { type: 'go', id: 'P:milky-way' }); assert.deepEqual(p('the milky way'), { type: 'go', id: 'P:milky-way' }); assert.deepEqual(p('cosmic web'), { type: 'go', id: 'P:cosmic-web' });
  assert.deepEqual(p('vai para o universo observável'), { type: 'go', id: 'L:universe' });
  assert.deepEqual(p('去仙女座星系'), { type: 'go', id: 'P:andromeda' });
  assert.deepEqual(p('abre los Pilares de la Creación'), { type: 'go', id: 'P:pillars-of-creation' });
  assert.equal(p('Mars'), null);   // planets stay with chat.js's own parser · 行星由 chat.js 处理
  assert.equal(p('How far is the galaxy from the Sun and why is it so big?'), null);   // a question, not a command · 问题而非指令
});
test('back, tour, save, panels, ask', () => {
  for (const t of ['back', 'Go back', 'atrás', 'voltar', '返回']) assert.deepEqual(p(t), { type: 'back' }, t);
  assert.deepEqual(p('start the tour'), { type: 'tour', op: 'start' }); assert.deepEqual(p('empieza el tour'), { type: 'tour', op: 'start' });
  assert.deepEqual(p('stop the tour'), { type: 'tour', op: 'stop' }); assert.deepEqual(p('pausa o tour'), { type: 'tour', op: 'pause' }); assert.deepEqual(p('继续游览'), { type: 'tour', op: 'resume' });
  for (const t of ['save this place', 'guarda este lugar', 'salve este lugar', '收藏这里']) assert.deepEqual(p(t), { type: 'save' }, t);
  assert.deepEqual(p('how do I move?'), { type: 'guide' }); assert.deepEqual(p('como mexer'), { type: 'guide' });
  assert.deepEqual(p('open my logbook'), { type: 'logbook' }); assert.deepEqual(p('notícias'), { type: 'news' }); assert.deepEqual(p('meu planeta'), { type: 'planet' });
  assert.deepEqual(p('Ask: how big is Saturn?'), { type: 'ask', q: 'how big is Saturn?' }); assert.deepEqual(p('pergunta: o que é M87?'), { type: 'ask', q: 'o que é M87?' });
});
test('every confirmation and guide line in 4 languages', () => {
  for (const o of [...Object.values(VC_SAY), ...VOICE_GUIDE.flat()]) for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(o[l], JSON.stringify(o));
});
test('questions are never taken as commands (they go to Cosmo), in 4 languages', () => {
  for (const t of ['What controls the tides?', 'How does the moon help Earth?', 'Is my planet habitable?', 'what is a logbook in space?', 'How do I stop the tour?', 'What is the Local Group?', 'Tell me about Andromeda', 'how big is the universe', 'Why is the galaxy spiral?',
    '¿Me ayudas con Júpiter?', '¿Hay noticias sobre Marte?', 'Quais as novidades sobre Júpiter?', 'O que é o Grupo Local?', '帮助我了解黑洞', '有什么关于火星的新闻？', '仙女座星系有多远？'])
    assert.equal(p(t), null, t);
  assert.deepEqual(p('问：黑洞是什么'), { type: 'ask', q: '黑洞是什么' });
});

test('vr-voice-plus: zoom and turn by voice, a bare "ask"/"问" verb is not a prefix', () => {
  for (const t of ['zoom in', 'Acercar', 'aproximar', '放大']) assert.deepEqual(p(t), { type: 'zoom', dir: 'in' }, t);
  for (const t of ['zoom out', 'alejar', 'Afastar', '缩小']) assert.deepEqual(p(t), { type: 'zoom', dir: 'out' }, t);
  assert.deepEqual(p('turn left'), { type: 'turn', dir: 1 }); assert.deepEqual(p('Gira a la derecha'), { type: 'turn', dir: -1 });
  assert.deepEqual(p('vira para a esquerda'), { type: 'turn', dir: 1 }); assert.deepEqual(p('左转'), { type: 'turn', dir: 1 });
  assert.deepEqual(p('Ask Cosmo why is Mars red'), { type: 'ask', q: 'why is Mars red' });
  assert.deepEqual(p('ask Cosmos about stars'), { type: 'ask', q: 'about stars' });   // speech-to-text often writes "Cosmos" · 转写常写成 Cosmos
  assert.deepEqual(p('Vire à esquerda'), { type: 'turn', dir: 1 }); assert.deepEqual(p('Gire à direita'), { type: 'turn', dir: -1 }); assert.equal(p('turn'), null);
  for (const t of ['问题是什么', 'ask about Mars', 'Pergunta sobre a lua', 'ask cosmonauts what', 'ask cosmology', 'askcosmo hi']) assert.notEqual(p(t)?.type, 'ask', t);
  const main = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8'), voice = fs.readFileSync(new URL('../voice.js', import.meta.url), 'utf8');
  assert.match(main, /c\.type === 'zoom'/); assert.match(main, /c\.type === 'turn'/);
  assert.match(voice, /if \(staticCopy\(\)\) throw fail\('offline'\)/, 'no microphone prompt on GitHub Pages');
  assert.match(voice, /onState\('transcribing'\)/);
});

test('voice zoom says when nothing more can move (4 languages)', () => {
  for (const k of ['zoomIn', 'zoomOut', 'zoomMax', 'zoomMin']) for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(VC_SAY[k][l], k + l);
  const main = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(main, /VC_SAY\.zoomMax : VC_SAY\.zoomMin/); assert.match(main, /const atEdge = mode === 'journey' && !journey\.piece && !outerLevel\(journey\.level\)/);
});
