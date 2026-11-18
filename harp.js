// ─────────────────────────────────────────────────────────────────────────────
// 🎵 Orbit harp · 轨道竖琴 · Arpa de órbitas · Harpa de órbitas
// In the Solar System overview, sweep the mouse, your hand cursor (webcam) or your fingertip (VR) across an orbit
// and it rings like a string. Each planet's note comes from how long its year is: faster orbits sing higher.
// The real periods span almost 700× (88 to 60,190 days), so the range is squeezed into three octaves and each note
// is rounded to a pentatonic scale, so any sweep sounds musical. Plus the rhythm of Jupiter's moons Io, Europa and
// Ganymede, locked in a 1:2:4 resonance.
// Pure helpers (notes, ring crossing) have no DOM or three.js and are tested in node; createHarp() needs Web Audio.
// 纯函数可在 node 中测试；createHarp() 需要 Web Audio。
// ─────────────────────────────────────────────────────────────────────────────
const L = (en, zh, es, pt) => ({ en, zh, es, pt });

// A year on each planet, in Earth days: NASA Space Place, "How Long is a Year on Other Planets?" · 各行星一年的天数
export const HARP_PERIODS_SRC = 'https://spaceplace.nasa.gov/years-on-other-planets/en/';
export const HARP_PERIODS = { mercury: 88, venus: 225, earth: 365, mars: 687, jupiter: 4333, saturn: 10756, uranus: 30687, neptune: 60190 };
// Io : Europa : Ganymede = 4 : 2 : 1 orbits (NASA Ganymede facts; ESA "The orbits of the Galilean moons") · 木卫共振
export const RESONANCE_SRC = ['https://science.nasa.gov/jupiter/jupiter-moons/ganymede/facts/', 'https://www.esa.int/ESA_Multimedia/Videos/2021/07/The_orbits_of_the_Galilean_moons'];
export const MOONS = [
  { id: 'io', every: 1, midi: 79, color: '#ffd36b', names: L('Io', '木卫一', 'Ío', 'Io') },
  { id: 'europa', every: 2, midi: 74, color: '#cfe0ff', names: L('Europa', '木卫二', 'Europa', 'Europa') },
  { id: 'ganymede', every: 4, midi: 67, color: '#c9b49a', names: L('Ganymede', '木卫三', 'Ganímedes', 'Ganimedes') },
];

export const HARP_UI = {
  button: L('🎵 Orbit harp', '🎵 轨道竖琴', '🎵 Arpa de órbitas', '🎵 Harpa de órbitas'),
  title: L('Orbit harp', '轨道竖琴', 'Arpa de órbitas', 'Harpa de órbitas'),
  hint: L('Sweep the mouse, a finger or your hand across the orbits to pluck them. Faster orbits sing higher notes.',
    '用鼠标、手指或手划过轨道来拨动它们。公转越快，音越高。',
    'Pasa el ratón, el dedo o la mano por las órbitas para tocarlas. Las órbitas más rápidas suenan más agudas.',
    'Passe o mouse, o dedo ou a mão pelas órbitas para tocá-las. Órbitas mais rápidas soam mais agudas.'),
  vrHint: L('Point and sweep your finger across the orbits to pluck them', '用手指指向并划过轨道来拨动它们', 'Apunta y pasa el dedo por las órbitas para tocarlas', 'Aponte e passe o dedo pelas órbitas para tocá-las'),
  how: L('A planet’s note comes from the length of its year: Mercury (88 days) is the highest, Neptune (60,190 days) the lowest. The real range is far too wide to hear, so it is squeezed into three octaves and rounded to a five-note scale.',
    '行星的音高来自它一年的长度：水星（88 天）最高，海王星（60,190 天）最低。真实的范围太宽，人耳听不全，所以被压缩到三个八度，并取整到五声音阶。',
    'La nota de cada planeta sale de la duración de su año: Mercurio (88 días) es la más aguda y Neptuno (60.190 días) la más grave. El rango real es demasiado amplio para oírlo, así que se comprime en tres octavas y se redondea a una escala de cinco notas.',
    'A nota de cada planeta vem da duração do seu ano: Mercúrio (88 dias) é a mais aguda e Netuno (60.190 dias) a mais grave. A faixa real é larga demais para ouvir, então é comprimida em três oitavas e arredondada para uma escala de cinco notas.'),
  howTitle: L('How the notes work', '音高是怎么来的', 'Cómo salen las notas', 'Como as notas funcionam'),
  played: L('{p} · a year of {n} days', '{p} · 一年 {n} 天', '{p} · un año de {n} días', '{p} · um ano de {n} dias'),
  all: L('▶ Play every orbit', '▶ 弹奏所有轨道', '▶ Tocar todas las órbitas', '▶ Tocar todas as órbitas'),
  moons: L('▶ Jupiter’s moons 1:2:4', '▶ 木星卫星 1:2:4', '▶ Lunas de Júpiter 1:2:4', '▶ Luas de Júpiter 1:2:4'),
  moonsText: L('Listen to Jupiter’s moons: every time Ganymede goes around Jupiter once, Europa goes around twice and Io four times. Their beats keep lining up.',
    '听听木星的卫星：木卫三绕木星转一圈时，木卫二转两圈，木卫一转四圈。它们的节拍一次又一次对齐。',
    'Escucha las lunas de Júpiter: cada vez que Ganímedes da una vuelta a Júpiter, Europa da dos e Ío cuatro. Sus pulsos coinciden una y otra vez.',
    'Ouça as luas de Júpiter: cada vez que Ganimedes dá uma volta em Júpiter, Europa dá duas e Io quatro. Os pulsos se alinham várias vezes.'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  source: L('Sources', '来源', 'Fuentes', 'Fontes'),
  year: L('Year', '一年', 'Año', 'Ano'),
  days: L('{n} days', '{n} 天', '{n} días', '{n} dias'),
  note: L('Note', '音符', 'Nota', 'Nota'),
  off: L('The harp plays in the Solar System view.', '竖琴在太阳系视图中演奏。', 'El arpa suena en la vista del sistema solar.', 'A harpa toca na vista do Sistema Solar.'),
};

const MIN = HARP_PERIODS.mercury, MAX = HARP_PERIODS.neptune;
const PENTA = [0, 2, 4, 7, 9];   // C major pentatonic · 大调五声音阶
// Period (days) → MIDI note: log scale, Mercury ≈ A5 … Neptune ≈ A2, rounded to the pentatonic scale · 周期 → 音高
export function noteForPeriod(days) {
  const t = Math.min(1, Math.max(0, Math.log(days / MIN) / Math.log(MAX / MIN)));
  const raw = 45 + 36 * (1 - t);
  let best = null;
  for (let m = 40; m <= 86; m++) if (PENTA.includes(((m % 12) + 12) % 12) && (best == null || Math.abs(m - raw) < Math.abs(best - raw))) best = m;
  return best;
}
export const midiToHz = m => 440 * Math.pow(2, (m - 69) / 12);
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const SOLFA = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];   // es / pt learn Do–Re–Mi · 西语/葡语用唱名
export const noteName = (m, lang = 'en') => ((lang === 'es' || lang === 'pt') ? SOLFA : NAMES)[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

// Which rings (radii) lie between two distances from the centre? A sweep from r0 to r1 crosses them · 扫过的轨道
export function crossed(r0, r1, radii) {
  if (r0 == null || r1 == null || r0 === r1) return [];
  const lo = Math.min(r0, r1), hi = Math.max(r0, r1), out = [];
  radii.forEach((r, i) => { if (r > lo && r <= hi) out.push(i); });
  return r1 > r0 ? out : out.reverse();   // in the order the sweep meets them · 按扫过的顺序
}
// A ray (origin, dir) meets the orbital plane y = 0: distance from the Sun, or null · 射线与轨道平面的交点
export function ringDistance(o, d) {
  if (Math.abs(d.y) < 1e-6) return null;
  const t = -o.y / d.y; if (t <= 0) return null;
  return Math.hypot(o.x + d.x * t, o.z + d.z * t);
}
// The moons' beat pattern for one Ganymede orbit (4 beats): which moons sound on each beat · 每拍发声的卫星
export const moonBeats = () => [0, 1, 2, 3].map(b => MOONS.filter(m => b % m.every === 0).map(m => m.id));

/* ── Sound · 声音 ── */
// Karplus–Strong samples for one plucked string (pure, so it is tested in node): a noise burst in a delay line of
// N samples, averaged with its neighbour and slightly damped on each pass · 拨弦采样（纯函数）
export function pluckSamples(sr, hz, n, rand = Math.random) {
  const y = new Float32Array(n), N = Math.max(2, Math.round(sr / hz - 0.5));   // the averaging adds half a sample of delay · 平均会增加半个采样的延迟
  const damp = 0.4985 + 0.0013 * Math.min(1, 220 / hz);   // high notes ring a bit shorter · 高音衰减更快
  for (let i = 0; i < Math.min(N, n); i++) y[i] = (rand() * 2 - 1) * (1 - i / N) * 0.9;
  if (N < n) y[N] = damp * 2 * y[0];
  for (let i = N + 1; i < n; i++) y[i] = damp * (y[i - N] + y[i - N - 1]);
  return y;
}
/* Browser only: Web Audio · 仅浏览器 */
// A plucked string (Karplus–Strong): a short noise burst fed through a delay line that loses a little each pass · 拨弦合成
export function createHarp() {
  let ac = null, out = null; const cache = new Map(), timers = new Set();
  const ctx = () => {
    if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); out = ac.createGain(); out.gain.value = 0.55; out.connect(ac.destination); }
    if (ac.state === 'suspended') ac.resume(); return ac;
  };
  function buffer(m) {
    if (cache.has(m)) return cache.get(m);
    const sr = ac.sampleRate, b = ac.createBuffer(1, Math.round(sr * 2.4), sr);
    const y = pluckSamples(sr, midiToHz(m), b.length), f = Math.round(sr * 0.15);
    for (let i = 0; i < f; i++) y[y.length - 1 - i] *= i / f;   // fade the last 150 ms: no click at the end · 末尾淡出，避免爆音
    b.copyToChannel(y, 0);
    cache.set(m, b); return b;
  }
  const voices = [];
  function play(m, gain = 0.8, when = 0) {
    const c = ctx(); if (!c) return;
    if (voices.length >= 24) { const o = voices.shift(); try { o.stop(); } catch {} }   // at most 24 strings at once: the oldest stops (Quest) · 最多 24 个音，最早的停止
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = buffer(m); g.gain.value = gain;
    s.connect(g).connect(out); s.start(c.currentTime + when); voices.push(s);
    s.onended = () => { const i = voices.indexOf(s); if (i >= 0) voices.splice(i, 1); s.disconnect(); g.disconnect(); };
  }
  const warm = notes => { if (ctx()) notes.forEach(buffer); };   // build the note buffers ahead of the first pluck · 预先生成
  const later = (ms, f) => { const t = setTimeout(() => { timers.delete(t); f(); }, ms); timers.add(t); };
  function stop() { timers.forEach(clearTimeout); timers.clear(); }
  return { play, later, stop, warm, ready: () => !!ctx() };
}
