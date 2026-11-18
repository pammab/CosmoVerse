// Scale readout: how big each level's view is, a "× 100" counter between levels, and "Why not to scale?" (in 📚 References, Pamela Nov 18)
// 尺度读数：每一层的视野有多大、层间的“×100”计数，以及“为什么不按比例？”
// Pure (runs in node for tests). Every number comes from a page we opened; the piece facts are reused. · 纯数据，数字均有来源
import { PIECES } from './pieces/index.js';
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
const factOf = (piece, label) => PIECES.find(p => p.id === piece)?.facts.find(f => f.label.en === label);

// Sources opened for this feature (2026-11-16) · 本功能打开的来源
export const SRC = {
  universe: { name: 'NASA', url: 'https://www.nasa.gov/science-research/astrophysics/how-big-is-space-we-asked-a-nasa-expert-episode-61/' },   // "about 92 billion light-years across"
  earth: { name: 'NASA · Earth facts', url: 'https://science.nasa.gov/earth/facts/' },          // equatorial diameter 12,756 km; 150 million km from the Sun
  lightYear: { name: 'NASA · light-year', url: 'https://science.nasa.gov/exoplanets/what-is-a-light-year/' },   // 9.46 trillion km; Proxima "4.25 years at light speed"
  neptune: { name: 'NASA', url: 'https://science.nasa.gov/neptune/' },            // "More than 30 times as far from the Sun as is Earth"
};
const KM = { earth: 12756, au: 150e6, ly: 9.46e12 }, PROXIMA_LY = 4.25;

// across: rough width of the view in light-years, only for the "× N" counter between levels · 视野宽度（光年），仅用于层间倍数
export const SCALES = {
  universe: { across: 92e9, source: SRC.universe,
    text: L('Observable universe: about 92 billion light-years across', '可观测宇宙：跨度约 920 亿光年', 'Universo observable: unos 92.000 millones de años luz de diámetro', 'Universo observável: cerca de 92 bilhões de anos-luz de diâmetro') },
  supercluster: { across: 500e6, source: factOf('laniakea', 'Size')?.source,
    text: L('Laniakea: about 500 million light-years across', '拉尼亚凯亚：跨度约 5 亿光年', 'Laniakea: unos 500 millones de años luz de diámetro', 'Laniakea: cerca de 500 milhões de anos-luz de diâmetro') },
  'local-group': { across: 10e6, source: factOf('local-group', 'Size')?.source,
    text: L('Local Group: nearly 10 million light-years across', '本星系群：直径接近 1000 万光年', 'Grupo Local: casi 10 millones de años luz de diámetro', 'Grupo Local: quase 10 milhões de anos-luz de diâmetro') },
  galaxy: { across: 100e3, source: factOf('milky-way', 'Diameter')?.source,
    text: L('Milky Way: about 100,000 light-years across', '银河系：直径约 10 万光年', 'Vía Láctea: unos 100.000 años luz de diámetro', 'Via Láctea: cerca de 100 mil anos-luz de diâmetro') },
  // the farthest piece here, the Pillars, ~6,500 ly away → the view is ~13,000 ly wide · 最远的天体约 6500 光年
  neighbourhood: { across: 2 * 6500, source: factOf('pillars-of-creation', 'Distance')?.source,
    text: L('Stars out to about 6,500 light-years away (the Pillars of Creation)', '恒星远至约 6500 光年外（创生之柱）', 'Estrellas hasta unos 6.500 años luz de distancia (los Pilares de la Creación)', 'Estrelas até cerca de 6.500 anos-luz (os Pilares da Criação)') },
  // Neptune > 30 AU → the planets' orbits span ~60 AU · 海王星超过 30 天文单位
  'solar-system': { across: 2 * 30 * KM.au / KM.ly, source: SRC.neptune,
    text: L('Neptune: more than 30 times as far from the Sun as Earth', '海王星：离太阳的距离是地球的 30 多倍', 'Neptuno: más de 30 veces más lejos del Sol que la Tierra', 'Netuno: mais de 30 vezes mais longe do Sol do que a Terra') },
};

export const UI = {
  view: L('This view', '当前视野', 'Esta vista', 'Esta vista'),
  out: L('zooming out', '正在缩小', 'alejando', 'afastando'),
  in: L('zooming in', '正在放大', 'acercando', 'aproximando'),
  why: L('Why not to scale?', '为什么不按比例？', '¿Por qué no está a escala?', 'Por que não está em escala?'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
};

const LOCALE = { en: 'en-US', zh: 'zh-CN', es: 'es-ES', pt: 'pt-BR' };
// One significant figure, in words for millions · 保留一位有效数字
const sig1 = n => { const p = 10 ** Math.floor(Math.log10(n)); return Math.round(n / p) * p; };
export function fmtFactor(n, lang = 'en') {
  const v = sig1(Math.max(1, n));
  if (v >= 1e6) { const m = v / 1e6; return { en: `${m} million`, zh: `${m * 100}万`, es: `${m} millones`, pt: `${m} milhões` }[lang] || `${m} million`; }
  return v.toLocaleString(LOCALE[lang] || 'en-US');
}
// How many times bigger/smaller the next level's view is · 两层视野的倍数
export function factorBetween(from, to) {
  const a = SCALES[from]?.across, b = SCALES[to]?.across;
  if (!a || !b || a === b) return null;
  return { times: Math.max(a, b) / Math.min(a, b), out: b > a };
}

// "If Earth were a 1 mm grain…": computed from the NASA values above · 由 NASA 数值计算
export const TRUE_SCALE = (() => {
  const sunM = KM.au / KM.earth / 1000;                       // mm → m
  const proximaKm = PROXIMA_LY * KM.ly / KM.earth / 1e6;      // mm → km
  return { sunM: Math.round(sunM), proximaKm: Math.round(proximaKm / 50) * 50 };
})();
export function whyText(lang = 'en') {
  const s = TRUE_SCALE.sunM, p = TRUE_SCALE.proximaKm.toLocaleString(LOCALE[lang] || 'en-US');
  return {
    en: `In the Solar System view, the Sun and planets keep their true sizes compared with each other, but the distances between them are squeezed so everything fits on the screen. Space is mostly empty: if Earth were a grain of sand 1 mm wide, the Sun would be about ${s} m away and the nearest star, Proxima Centauri, about ${p} km away. Further out, each level of the journey has its own scale, and stars, nebulae and galaxies are drawn bigger.`,
    zh: `在太阳系视图中，太阳和行星之间的大小比例是真实的，但它们之间的距离被压缩了，这样才能放进屏幕。太空几乎是空的：如果地球是一粒 1 毫米的沙子，太阳大约在 ${s} 米外，而最近的恒星比邻星大约在 ${p} 公里外。再往外，旅程的每一层都有自己的比例，恒星、星云和星系也画得更大。`,
    es: `En la vista del Sistema Solar, el Sol y los planetas mantienen su tamaño real entre sí, pero las distancias entre ellos están comprimidas para que todo quepa en la pantalla. El espacio está casi vacío: si la Tierra fuera un grano de arena de 1 mm, el Sol estaría a unos ${s} m y la estrella más cercana, Próxima Centauri, a unos ${p} km. Más lejos, cada nivel del viaje tiene su propia escala, y las estrellas, nebulosas y galaxias se dibujan más grandes.`,
    pt: `Na vista do Sistema Solar, o Sol e os planetas mantêm o tamanho real entre si, mas as distâncias entre eles estão encolhidas para tudo caber na tela. O espaço é quase vazio: se a Terra fosse um grão de areia de 1 mm, o Sol estaria a cerca de ${s} m e a estrela mais próxima, Próxima Centauri, a cerca de ${p} km. Mais longe, cada nível da viagem tem a sua própria escala, e as estrelas, nebulosas e galáxias são desenhadas maiores.`,
  }[lang];
}
export const WHY_SOURCES = [SRC.earth, SRC.lightYear];
