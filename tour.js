// Tour with Cosmo · 跟 Cosmo 游览 · Tour con Cosmo · Tour com o Cosmo
// Cosmo starts at the observable universe, flies DOWN the scale ladder to the Solar System, visits the planets
// one by one, lands on the Earth, flies back UP to the universe and asks where you want to start.
// 从可观测宇宙一路向下飞到太阳系，逐一拜访行星，降落在地球，再飞回宇宙并询问从哪里开始探索。
//   • Facts come only from texts that are already sourced: the level blurbs (journey.js) and the planet
//     introductions (narration-text.js). The tour's own lines are links between stops, with no facts.
//   • Pure: the step list and the runner work without the DOM or three.js, so tests run in node.
//     main.js passes the actions (fly, narrate, …) and calls tick(now) every frame.
import { LEVELS, levelById } from './journey.js';
import { NARRATION } from './narration-text.js';
import { levelSpeech, firstSentence, VOICE_LANGS } from './voice-clips.js';

const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const TOUR_UI = {
  start: L('▶ Tour with Cosmo', '▶ 跟 Cosmo 游览', '▶ Tour con Cosmo', '▶ Tour com o Cosmo'),
  title: L('Tour with Cosmo', '跟 Cosmo 游览', 'Tour con Cosmo', 'Tour com o Cosmo'),
  pause: L('⏸ Pause tour', '⏸ 暂停游览', '⏸ Pausar tour', '⏸ Pausar tour'),
  resume: L('▶ Resume tour', '▶ 继续游览', '▶ Seguir el tour', '▶ Continuar tour'),
  stop: L('✕ Stop', '✕ 结束', '✕ Terminar', '✕ Encerrar'),
  paused: L('Paused', '已暂停', 'En pausa', 'Pausado'),
  hint: L('Click or pinch 🤏 to pause · Space resumes · hold ✊, ⟵ Back or Esc stops', '点击或捏合 🤏 暂停 · 空格继续 · 保持 ✊、⟵ 返回或 Esc 结束',
    'Haz clic o pellizca 🤏 para pausar · Espacio sigue · mantén ✊, ⟵ Volver o Esc termina', 'Clique ou faça pinça 🤏 para pausar · Espaço continua · segure ✊, ⟵ Voltar ou Esc encerra'),
  vrHint: L('Pinch 🤏 to pause · hold ✊ to stop', '捏合 🤏 暂停 · 保持 ✊ 结束', 'Pellizca 🤏 para pausar · mantén ✊ para terminar', 'Faça pinça 🤏 para pausar · segure ✊ para encerrar'),
  vrPaused: L('Paused · point at ▶ Resume tour in the left menu', '已暂停 · 指向左侧菜单的 ▶ 继续游览', 'En pausa · apunta a ▶ Seguir el tour en el menú izquierdo', 'Pausado · aponte para ▶ Continuar tour no menu da esquerda'),
};
// Cosmo's link lines (no facts) · 串场词（不含事实）
export const TOUR_LINES = {
  intro: L('Hi, I’m Cosmo. Let’s begin with the biggest thing we can see, and fly all the way home.',
    '你好，我是 Cosmo。我们从能看到的最大的东西开始，一路飞回家。',
    'Hola, soy Cosmo. Empecemos por lo más grande que podemos ver y volemos hasta casa.',
    'Oi, eu sou o Cosmo. Vamos começar pela maior coisa que conseguimos ver e voar até em casa.'),
  solar: L('Here is our Solar System. Let’s visit the planets one by one, and land at home at the end.',
    '这就是我们的太阳系。我们逐一拜访行星，最后在家里降落。',
    'Este es nuestro sistema solar. Visitemos los planetas uno a uno y aterricemos en casa al final.',
    'Este é o nosso Sistema Solar. Vamos visitar os planetas um por um e pousar em casa no final.'),
  up: L('Now let’s fly all the way back out.', '现在我们一路飞回外面。', 'Ahora volemos de nuevo hacia fuera.', 'Agora vamos voar de volta lá para fora.'),
  ask: L('So, where do you want to start exploring? Pick any step on the ladder.',
    '那么，你想从哪里开始探索？在阶梯上任选一级吧。',
    'Entonces, ¿por dónde quieres empezar a explorar? Elige cualquier nivel de la escalera.',
    'Então, por onde você quer começar a explorar? Escolha qualquer degrau da escada.'),
};
// Planets in the order Cosmo visits them; the Earth comes last (the landing) · 拜访顺序，地球最后
export const TOUR_PLANETS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const firstOf = arr => Object.fromEntries(VOICE_LANGS.map((l, i) => [l, firstSentence(arr[i])]));

// Steps: { key (voice clip id), text {en,zh,es,pt}, go: level | home | select: body, title } · 步骤列表
export function tourSteps() {
  const steps = [{ key: 'tour-intro', text: TOUR_LINES.intro, go: 'universe', title: levelById('universe').names }];
  for (const lv of LEVELS) if (lv.blurb) steps.push({ key: 'level-' + lv.id, text: levelSpeech(lv.blurb), go: lv.id, title: lv.names });
  steps.push({ key: 'tour-solar', text: TOUR_LINES.solar, home: true, title: levelById('solar-system').names });
  for (const id of TOUR_PLANETS) steps.push({ key: 'tour-' + id, text: firstOf(NARRATION[id]), select: id });
  steps.push({ key: 'earth', text: Object.fromEntries(VOICE_LANGS.map((l, i) => [l, NARRATION.earth[i]])), select: 'earth' });   // the landing: the whole welcome-home text · 降落：完整介绍
  steps.push({ key: 'tour-up', text: TOUR_LINES.up, go: 'universe', title: levelById('universe').names });
  steps.push({ key: 'tour-ask', text: TOUR_LINES.ask, ask: true, title: levelById('universe').names });
  return steps;
}
// Voice clips the tour adds (voice-clips.js / api/voice.js / tools/make-voice.mjs); levels and 'earth' already exist · 新增语音
export const tourClips = () => tourSteps().filter(s => s.key.startsWith('tour-')).map(s => [s.key, s.text]);

// Reading time when there is no voice (captions only / voice off) · 无语音时的阅读时间
export const readMs = (text, lang = 'en') => Math.max(3500, String(text || '').length * (lang === 'zh' ? 230 : 62));

/* ── Runner · 运行器 ──
   actions: fly(step) (start the camera move), busy() (still flying), say(step) (start narration),
   hush() (stop narration), speaking(), voiceOn(), lang(), onChange(), onEnd(finished).
   Phases per step: fly → (camera settles) → say → (speech ends) → hold → next step. */
export const PAUSE_LIMIT = 60000;   // a tour paused this long (ms) ends by itself · 暂停超过 60 秒自动结束
// start(now, list) plays another step list on the same runner (demo.js) · 也可播放其他步骤列表（演示）
export function createTour(actions) {
  let steps = tourSteps();
  const a = { busy: () => false, speaking: () => false, voiceOn: () => true, lang: () => 'en', onChange() {}, onEnd() {}, hush() {}, ...actions };
  const s = { active: false, paused: false, i: 0, phase: 'fly', t0: 0, said: false, need: 0, since: 0, pausedAt: 0 };   // since: last start/resume (hands get a grace period) · 开始/继续时间
  const set = (phase, now) => { s.phase = phase; s.t0 = now; };
  function begin(now) { a.fly(steps[s.i]); set('fly', now); a.onChange(); }
  const api = {
    get steps() { return steps; }, state: s,
    get active() { return s.active; }, get paused() { return s.paused; }, get step() { return s.active ? steps[s.i] : null; }, get index() { return s.i; },
    start(now, list) { steps = list || tourSteps(); s.active = true; s.paused = false; s.i = 0; s.since = now; begin(now); },
    // stop: a paused tour doesn't hush (the visitor's own narration keeps playing) · 暂停时结束不打断访客的朗读
    stop(finished = false) { if (!s.active) return; const wasPaused = s.paused; s.active = false; s.paused = false; if (!finished && !wasPaused) a.hush(); a.onChange(); a.onEnd(finished); },
    pause(now = 0) { if (!s.active || s.paused) return; s.paused = true; s.pausedAt = now; a.hush(); a.onChange(); },
    // Resume: fly back to this step's place if the visitor moved away, then say its line again · 继续：回到当前站点并重说
    resume(now) { if (!s.active || !s.paused) return; s.paused = false; s.since = now; if (s.phase === 'hold') set('hold', now); else begin(now); a.onChange(); },
    toggle(now) { if (s.paused) api.resume(now); else api.pause(now); },
    tick(now) {
      if (s.active && s.paused && s.pausedAt && now - s.pausedAt > PAUSE_LIMIT) { api.stop(); return; }   // the visitor went exploring: end the tour · 暂停太久：结束游览
      if (!s.active || s.paused) return;
      const st = steps[s.i], dt = now - s.t0;
      if (s.phase === 'fly') {
        if (dt > 700 && !a.busy()) { s.said = false; s.need = readMs(st.text[a.lang()] || st.text.en, a.lang()); a.say(st); set('say', now); }
      } else if (s.phase === 'say') {
        if (a.speaking()) s.said = true;
        const spoken = a.voiceOn() && s.said ? !a.speaking() && dt > 1200 : dt >= s.need;   // voice on but nothing spoken (turned on mid-stop): reading time · 未开始朗读则按阅读时间
        if (spoken || dt > s.need * 2.5 + 6000) set('hold', now);   // never stall on a voice that doesn't end · 语音卡住时继续
      } else if (s.phase === 'hold' && dt > (st.hold ?? (st.ask ? 4000 : 900))) {
        if (++s.i >= steps.length) { s.i = steps.length - 1; api.stop(true); return; }
        begin(now);
      }
    },
  };
  return api;
}
