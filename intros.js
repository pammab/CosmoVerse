// Feature intros: the first time someone opens a top feature in a visit, Cosmo says what it is and what to try
// 功能介绍：每次访问中第一次打开某个功能时，Cosmo 用一两句话说明它是什么、可以试什么
// Pure data + a tiny once-per-visit gate, so it runs in node (tests, voice clip list) · 纯数据，可在 node 中运行
const L = (en, zh, es, pt) => ({ en, zh, es, pt });

// voice: false → written in the chat, not spoken (the microphone is listening, Cosmo must not talk over it) · 麦克风在听时写在对话里，不朗读
export const INTROS = {
  habitability: { text: L(
    'This is the Habitability Lab. Pick up to four planets and compare their temperature, sunlight, surface pressure and water conditions with Earth.',
    '这是宜居条件实验室。最多选四颗行星，把它们的温度、阳光、表面气压和水环境与地球比较。',
    'Este es el Laboratorio de habitabilidad. Elige hasta cuatro planetas y compara su temperatura, luz solar, presión superficial y condiciones del agua con la Tierra.',
    'Este é o Laboratório de habitabilidade. Escolha até quatro planetas e compare a temperatura, a luz solar, a pressão na superfície e as condições para água com as da Terra.') },
  asteroids: { text: L(
    'The Asteroid Analyzer reads a saved list of possible impacts from the Sentry monitoring system, and a catalog of asteroid orbits to explore. Read what the Torino and Palermo scales mean.',
    '小行星分析读取一份保存的 Sentry 监测系统可能撞击记录，还有一份可以探索的小行星轨道目录。了解一下都灵等级和巴勒莫等级的含义。',
    'El Analizador de asteroides lee una lista guardada de posibles impactos del sistema de vigilancia Sentry y un catálogo de órbitas de asteroides para explorar. Lee qué significan las escalas de Turín y Palermo.',
    'O Analisador de asteroides lê uma lista salva de possíveis impactos do sistema de monitoramento Sentry e um catálogo de órbitas de asteroides para explorar. Leia o que significam as escalas de Turim e de Palermo.') },
  trails: { text: L(
    'Motion Trails: the Sun travels through space, so its planets draw long spiral trails as they follow it. It is an illustration, not to scale. Try the time-speed slider or Change angle.',
    '运动轨迹：太阳在太空中穿行，行星跟着它，画出长长的螺旋轨迹。这是示意图，不按比例。试试时间速度滑块或“切换机位”。',
    'Trayectorias: el Sol viaja por el espacio, así que sus planetas dibujan largas estelas en espiral al seguirlo. Es una ilustración, no a escala. Prueba el control de velocidad o Cambiar ángulo.',
    'Trajetórias: o Sol viaja pelo espaço, então os planetas desenham longos rastros em espiral ao segui-lo. É uma ilustração, fora de escala. Experimente o controle de velocidade ou Mudar ângulo.') },
  compare: { text: L(
    'Compare Sizes lines up the Sun and the planets side by side, with their sizes to scale. Press Compare Sizes again to go back.',
    '大小对比把太阳和行星并排排列，大小按真实比例。再按一次“大小对比”即可返回。',
    'Comparar tamaños pone el Sol y los planetas uno al lado del otro, con sus tamaños a escala. Pulsa Comparar tamaños otra vez para volver.',
    'Comparar tamanhos coloca o Sol e os planetas lado a lado, com os tamanhos em escala. Toque em Comparar tamanhos de novo para voltar.') },
  resources: { text: L(
    'Astronomy Resources gathers free places to keep learning: courses, sky explorers, scientific data and news. Use the filters at the top.',
    '天文学资源汇集了继续学习的免费去处：课程、星空探索工具、科学数据和新闻。用顶部的筛选按钮。',
    'Recursos de astronomía reúne lugares gratuitos para seguir aprendiendo: cursos, exploradores del cielo, datos científicos y noticias. Usa los filtros de arriba.',
    'Recursos de astronomia reúne lugares gratuitos para continuar aprendendo: cursos, exploradores do céu, dados científicos e notícias. Use os filtros no topo.') },
  gestures: { text: L(
    'Gestures are on: your webcam follows your hand. Point and hold to open a planet, pinch and move up or down to zoom, hold a fist to go back, and show a victory sign to talk to me.',
    '手势已开启：摄像头会跟随你的手。指向并停留可打开行星，捏合后上下移动可缩放，保持握拳可返回，比出 ✌ 就能和我说话。',
    'Los gestos están activados: tu cámara sigue tu mano. Apunta y mantén para abrir un planeta, pellizca y mueve arriba o abajo para hacer zoom, mantén el puño para volver y haz la señal de victoria para hablar conmigo.',
    'Os gestos estão ativados: sua câmera acompanha sua mão. Aponte e segure para abrir um planeta, faça pinça e mova para cima ou para baixo para dar zoom, mantenha o punho fechado para voltar e faça o sinal de vitória para falar comigo.') },
  vr: { text: L(
    'Welcome to VR, hands only. Point and hold to open a planet; pinch and move up or down to zoom, or pinch with both hands to zoom and turn. Hold a fist to come back, and make a victory sign to talk to me.',
    '欢迎来到 VR，只用双手。指向并停留可打开行星；捏合后上下移动可缩放，双手捏合可缩放和旋转。保持握拳返回，比出 ✌ 就能和我说话。',
    'Bienvenido a la RV, solo con las manos. Apunta y mantén para abrir un planeta; pellizca y mueve arriba o abajo para hacer zoom, o pellizca con las dos manos para acercar y girar. Mantén el puño para volver y haz la señal de victoria para hablar conmigo.',
    'Bem-vindo à RV, só com as mãos. Aponte e segure para abrir um planeta; faça pinça e mova para cima ou para baixo para dar zoom, ou faça pinça com as duas mãos para aproximar e girar. Mantenha o punho fechado para voltar e faça o sinal de vitória para falar comigo.') },
  cosmo: { text: L(
    'I am Cosmo, your space guide. Ask me anything about what you are looking at, or tap one of the suggested questions.',
    '我是 Cosmo，你的太空向导。关于你正在看的东西，尽管问我，或者点一个推荐问题。',
    'Soy Cosmo, tu guía espacial. Pregúntame lo que quieras sobre lo que estás viendo, o toca una de las preguntas sugeridas.',
    'Eu sou o Cosmo, seu guia espacial. Pergunte o que quiser sobre o que você está vendo, ou toque numa das perguntas sugeridas.') },
  talk: { voice: false, text: L(
    'Talk: ask your question out loud, I am listening. You can also type it.',
    '语音提问：大声说出你的问题，我在听。你也可以打字。',
    'Hablar: haz tu pregunta en voz alta, te escucho. También puedes escribirla.',
    'Falar: faça sua pergunta em voz alta, estou ouvindo. Você também pode digitá-la.') },
};
export const INTRO_KEYS = Object.keys(INTROS);

// Voice clip list entries for the spoken intros (server whitelist, tools/make-voice.mjs) · 语音片段清单
export const introClips = () => INTRO_KEYS.filter(k => INTROS[k].voice !== false).map(k => ['intro-' + k, INTROS[k].text]);

// Once per visit (per page load): returns the intro the first time, then null · 每次访问只介绍一次
export function createIntros() {
  const seen = new Set();
  return { take(key) { if (!INTROS[key] || seen.has(key)) return null; seen.add(key); return INTROS[key]; }, seen: key => seen.has(key),
    release(key) { seen.delete(key); } };   // not said after all (something else was speaking): try again next time · 未播出则下次再试
}
