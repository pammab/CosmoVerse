// 🧭 How to move: one guide per way of exploring, always one tap away (Pamela, Nov 17) · 怎么操作 · Cómo moverse · Como mexer
// Out of VR: mouse / touch, or webcam hands. In VR: your own hands, or the Immersive Web Emulator (mouse + keyboard on a computer).
// The button shows the guide for the input in use right now (guideMode) and switches by itself. App text only, no facts.
// VR 外：鼠标/触摸或摄像头手势；VR 内：双手或模拟器。按钮显示当前输入方式的指南并自动切换。
import { VOICE_GUIDE } from './voicecmd.js';
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const GUIDE_UI = {
  button: L('🧭 How to move', '🧭 怎么操作', '🧭 Cómo moverse', '🧭 Como mexer'),
  title: L('How to move', '怎么操作', 'Cómo moverse', 'Como mexer'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  using: L('You are using', '当前方式', 'Estás usando', 'Você está usando'),
  others: L('Other ways', '其他方式', 'Otras formas', 'Outras formas'),
};
export const GUIDE_MODES = ['mouse', 'touch', 'webcam', 'vrHands', 'emulator', 'voice'];
export const GUIDES = {
  mouse: { name: L('Mouse', '鼠标', 'Ratón', 'Mouse'), steps: [
    [L('Drag', '拖动', 'Arrastra', 'Arraste'), L('turn the view', '旋转视角', 'gira la vista', 'gira a vista')],
    [L('Scroll the wheel', '滚动滚轮', 'Gira la rueda', 'Gire a rodinha'), L('zoom; keep scrolling down to fly out to bigger scales, up to come back in', '缩放；一直向下滚动飞向更大的尺度，向上滚动飞回', 'zoom; sigue hacia abajo para salir a escalas mayores, hacia arriba para volver', 'zoom; continue para baixo para sair para escalas maiores, para cima para voltar')],
    [L('Click', '点击', 'Haz clic', 'Clique'), L('open a planet, a galaxy or a label', '打开行星、星系或标签', 'abre un planeta, una galaxia o una etiqueta', 'abre um planeta, uma galáxia ou um rótulo')],
    [L('“Go to” on the left', '左侧“前往”', '“Ir a” a la izquierda', '“Ir para” à esquerda'), L('jump to any level', '跳到任意层级', 'salta a cualquier nivel', 'salta para qualquer nível')],
    [L('Esc', 'Esc', 'Esc', 'Esc'), L('one step back', '后退一步', 'un paso atrás', 'um passo atrás')],
    [L('← →', '← →', '← →', '← →'), L('previous / next planet', '上一颗 / 下一颗行星', 'planeta anterior / siguiente', 'planeta anterior / próximo')],
  ] },
  touch: { name: L('Touch', '触摸', 'Táctil', 'Toque'), steps: [
    [L('Drag one finger', '单指拖动', 'Arrastra un dedo', 'Arraste um dedo'), L('turn the view', '旋转视角', 'gira la vista', 'gira a vista')],
    [L('Pinch two fingers', '双指捏合', 'Pellizca con dos dedos', 'Faça pinça com dois dedos'), L('zoom; keep going to change level', '缩放；继续可切换层级', 'zoom; sigue para cambiar de nivel', 'zoom; continue para mudar de nível')],
    [L('Tap', '轻点', 'Toca', 'Toque'), L('open a planet, a galaxy or a label', '打开行星、星系或标签', 'abre un planeta, una galaxia o una etiqueta', 'abre um planeta, uma galáxia ou um rótulo')],
    [L('⇕ “Go to”', '⇕“前往”', '⇕ “Ir a”', '⇕ “Ir para”'), L('jump to any level', '跳到任意层级', 'salta a cualquier nivel', 'salta para qualquer nível')],
  ] },
  webcam: { name: L('Webcam hands', '摄像头手势', 'Manos con la cámara', 'Mãos pela câmera'), steps: [
    [L('☝ Point + hold', '☝ 指向并停留', '☝ Apunta y mantén', '☝ Aponte e segure'), L('open a planet, a label or a “Go to” row', '打开行星、标签或“前往”中的一行', 'abre un planeta, una etiqueta o una fila de “Ir a”', 'abre um planeta, um rótulo ou uma linha de “Ir para”')],
    [L('🤏 Pinch + move up/down', '🤏 捏合并上下移动', '🤏 Pellizca y sube/baja', '🤏 Pinça e mova para cima/baixo'), L('zoom; keep going to change level', '缩放；继续可切换层级', 'zoom; sigue para cambiar de nivel', 'zoom; continue para mudar de nível')],
    [L('✋ Open palm + move', '✋ 张开手掌并移动', '✋ Palma abierta y mueve', '✋ Palma aberta e mova'), L('turn the view (on a planet: scatter its particles; ☝ point + move turns it)', '旋转视角（行星特写中：散开粒子；☝ 指向并移动来旋转）', 'gira la vista (en un planeta: dispersa sus partículas; ☝ apunta y mueve para girar)', 'gira a vista (num planeta: espalha as partículas; ☝ aponte e mova para girar)')],
    [L('✊ Hold a fist', '✊ 保持握拳', '✊ Mantén el puño', '✊ Segure o punho'), L('one step back', '后退一步', 'un paso atrás', 'um passo atrás')],
    [L('✌ Victory', '✌ 剪刀手', '✌ Victoria', '✌ Vitória'), L('talk to Cosmo', '和 Cosmo 说话', 'habla con Cosmo', 'fale com o Cosmo')],
  ] },
  vrHands: { name: L('Your hands in VR', 'VR 中的双手', 'Tus manos en VR', 'Suas mãos no VR'), steps: [
    [L('☝ Point + hold, or touch', '☝ 指向停留或触碰', '☝ Apunta y mantén, o toca', '☝ Aponte e segure, ou toque'), L('open; panel rows; ⟵ Back', '打开；面板行；⟵ 返回', 'abrir; filas; ⟵ Volver', 'abrir; linhas; ⟵ Voltar')],
    [L('🤏 Pinch + up/down', '🤏 捏合上下移动', '🤏 Pellizca y sube/baja', '🤏 Pinça e sobe/desce'), L('zoom', '缩放', 'zoom', 'zoom')],
    [L('🤏🤏 Both hands', '🤏🤏 双手', '🤏🤏 Dos manos', '🤏🤏 Duas mãos'), L('zoom, turn, change level', '缩放、旋转、换层级', 'zoom, girar, nivel', 'zoom, girar, nível')],
    [L('✋ Open palm', '✋ 张开手掌', '✋ Palma abierta', '✋ Palma aberta'), L('turn (planet: scatter)', '旋转（行星：散开）', 'girar (planeta: dispersar)', 'girar (planeta: espalhar)')],
    [L('✊ Hold a fist', '✊ 保持握拳', '✊ Mantén el puño', '✊ Segure o punho'), L('one step back', '后退一步', 'un paso atrás', 'um passo atrás')],
    [L('✌ Victory', '✌ 剪刀手', '✌ Victoria', '✌ Vitória'), L('speak: a command or a question', '说话：指令或问题', 'habla: una orden o una pregunta', 'fale: um comando ou uma pergunta')],
  ] },
  // Controls from Meta's IWSDK emulator guide (opened 2026-11-17): https://developers.meta.com/vr/documentation/iwsdk/guides/02-testing-experience/
  // 控件来自 Meta 的模拟器指南
  emulator: { name: L('VR emulator (mouse + keyboard)', 'VR 模拟器（鼠标 + 键盘）', 'Emulador de VR (ratón + teclado)', 'Emulador de VR (mouse + teclado)'), steps: [
    [L('Toggle input mode → hands', '切换输入模式 → 手', 'Cambia el modo de entrada → manos', 'Alterne o modo de entrada → mãos'), L('CosmoVerse is hands-only in VR', 'CosmoVerse 在 VR 中只用双手', 'CosmoVerse en VR es solo con las manos', 'O CosmoVerse no VR é só com as mãos')],
    [L('Hold the left mouse button', '按住鼠标左键', 'Mantén el botón izquierdo', 'Segure o botão esquerdo'), L('pinch; drag to move the hand', '捏合；拖动以移动手', 'pellizca; arrastra para mover la mano', 'pinça; arraste para mover a mão')],
    [L('Mouse wheel while pinching', '捏合时滚动滚轮', 'Rueda mientras pellizcas', 'Rodinha enquanto faz pinça'), L('move the hand nearer / farther', '让手前后移动', 'acerca / aleja la mano', 'aproxima / afasta a mão')],
    [L('Left Shift + W A S D', '左 Shift + W A S D', 'Mayús izq. + W A S D', 'Shift esq. + W A S D'), L('move the headset', '移动头显', 'mueve el visor', 'move o headset')],
    [L('Space', '空格', 'Espacio', 'Espaço'), L('reset the hand', '重置手的位置', 'reinicia la mano', 'reinicia a mão')],
  ] },
  // 🎙 Your voice (vr-voice): every hand action has a spoken equivalent · 语音：每个手势都有对应说法
  voice: { name: L('Your voice (✌ or 🎙)', '你的声音（✌ 或 🎙）', 'Tu voz (✌ o 🎙)', 'Sua voz (✌ ou 🎙)'), steps: VOICE_GUIDE },
};
// Which guide fits the input in use · 当前输入方式对应的指南
export function guideMode({ xr = false, handsSeen = false, webcam = false, touch = false } = {}) {
  if (xr) return 'vrHands';   // the emulator is listed under "Other ways" (it can't be told apart reliably) · 模拟器列在其他方式中
  if (webcam) return 'webcam';
  return touch ? 'touch' : 'mouse';
}
