// M87, the giant elliptical galaxy at the heart of the Virgo Cluster · 室女座 A（M87） · M87 · M87
// Sources opened (2026-11-14): NASA JPL "Black hole image makes history" (2019), NASA "The giant galaxy around the giant black hole",
// ESA/Hubble opo1332a (jet), NASA Hubble Messier 87, ESO eso2305.
// Sits on the Virgo Cluster inside Laniakea (pieces/laniakea.js VIRGO_AT); drawn far larger than life. · 远比实际大
import { VIRGO_AT } from './laniakea.js';
const JPL = 'https://www.jpl.nasa.gov/news/black-hole-image-makes-history/';
const GIANT = 'https://www.nasa.gov/missions/spitzer/the-giant-galaxy-around-the-giant-black-hole/';
const JET = 'https://esahubble.org/images/opo1332a/';
const M87 = 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-87/';
export default {
  id: 'm87', level: 'supercluster',
  names: { en: 'M87 · Virgo A', zh: 'M87 · 室女座 A', es: 'M87 · Virgo A', pt: 'M87 · Virgo A' },
  type: { en: 'Giant elliptical galaxy', zh: '巨椭圆星系', es: 'Galaxia elíptica gigante', pt: 'Galáxia elíptica gigante' },
  // Warm yellow-white glow, with its blue jet · 暖黄白色的光晕和蓝色喷流
  shape: { kind: 'elliptical', count: 12000, colors: ['#ffd890', '#e8b36a', '#6fb8ff'], params: { axes: [1, 0.86, 0.92], jet: 0.6, jetShare: 0.1, bright: 0.72, soft: 0.88 }, seed: 87 },
  position: VIRGO_AT, size: 3.2, frame: 0.9, tilt: [0.2, 0.35], spin: 0, isolate: true,
  labelAt: [0, -3.6, 0],   // offset from the "Virgo Cluster" label at the same spot (on screen it sits just above it) · 与“室女座星系团”标签错开
  facts: [
    { label: { en: 'Type', zh: '类型', es: 'Tipo', pt: 'Tipo' },
      value: { en: 'Giant elliptical galaxy', zh: '巨椭圆星系', es: 'Galaxia elíptica gigante', pt: 'Galáxia elíptica gigante' },
      source: { name: 'ESA/Hubble', url: JET } },
    { label: { en: 'Distance', zh: '距离', es: 'Distancia', pt: 'Distância' },
      value: { en: 'About 55 million light-years', zh: '约 5500 万光年', es: 'Unos 55 millones de años luz', pt: 'Cerca de 55 milhões de anos-luz' },
      source: { name: 'NASA', url: JPL } },
    { label: { en: 'Where', zh: '位置', es: 'Dónde', pt: 'Onde' },
      value: { en: 'Centre of the Virgo Cluster, about 2,000 galaxies', zh: '室女座星系团中心，约 2000 个星系', es: 'Centro del cúmulo de Virgo, unas 2000 galaxias', pt: 'Centro do Aglomerado de Virgem, cerca de 2.000 galáxias' },
      source: { name: 'ESA/Hubble', url: JET } },
    { label: { en: 'Central black hole', zh: '中心黑洞', es: 'Agujero negro central', pt: 'Buraco negro central' },
      value: { en: 'About 6.5 billion times the Sun’s mass', zh: '约为太阳质量的 65 亿倍', es: 'Unas 6500 millones de veces la masa del Sol', pt: 'Cerca de 6,5 bilhões de vezes a massa do Sol' },
      source: { name: 'NASA', url: JPL } },
    { label: { en: 'First black hole image', zh: '首张黑洞照片', es: 'Primera imagen de un agujero negro', pt: 'Primeira imagem de um buraco negro' },
      value: { en: 'Event Horizon Telescope, April 2019', zh: '事件视界望远镜，2019 年 4 月', es: 'Telescopio del Horizonte de Sucesos, abril de 2019', pt: 'Telescópio do Horizonte de Eventos, abril de 2019' },
      source: { name: 'NASA', url: GIANT } },
    { label: { en: 'Jet', zh: '喷流', es: 'Chorro', pt: 'Jato' },
      value: { en: 'Visible part about 5,000 light-years long', zh: '可见部分长约 5000 光年', es: 'Su parte visible mide unos 5000 años luz', pt: 'A parte visível tem cerca de 5.000 anos-luz' },
      source: { name: 'ESA/Hubble', url: JET } },
  ],
  // Narration sources: giant elliptical, centre of Virgo, 5,000 ly jet: JET; 55 million ly, 6.5 billion Suns, near light speed: JPL;
  // first image April 2019: GIANT; ~15,000 globular clusters: M87 page · 各句来源
  narration: {
    en: 'M87 is a giant elliptical galaxy about 55 million light-years away, at the centre of the Virgo Cluster, with roughly 15,000 globular star clusters. Its central black hole has about 6.5 billion times the Sun’s mass, and in April 2019 it became the first black hole ever pictured. It shoots out a jet of particles, travelling near the speed of light, whose visible part is about 5,000 light-years long.',
    zh: 'M87 是一个巨椭圆星系，距离约 5500 万光年，位于室女座星系团的中心，拥有约 15000 个球状星团。它的中心黑洞质量约为太阳的 65 亿倍，并在 2019 年 4 月成为人类第一个拍到照片的黑洞。它喷出一道接近光速的粒子喷流，可见部分长约 5000 光年。',
    es: 'M87 es una galaxia elíptica gigante a unos 55 millones de años luz, en el centro del cúmulo de Virgo, con unos 15.000 cúmulos globulares. Su agujero negro central tiene unas 6500 millones de veces la masa del Sol y, en abril de 2019, fue el primer agujero negro fotografiado. Lanza un chorro de partículas casi a la velocidad de la luz, cuya parte visible mide unos 5000 años luz.',
    pt: 'M87 é uma galáxia elíptica gigante a cerca de 55 milhões de anos-luz, no centro do Aglomerado de Virgem, com cerca de 15 mil aglomerados globulares. O buraco negro central tem cerca de 6,5 bilhões de vezes a massa do Sol e, em abril de 2019, foi o primeiro buraco negro fotografado. Ela lança um jato de partículas quase à velocidade da luz, cuja parte visível tem cerca de 5.000 anos-luz.',
  },
  clue: { en: 'A giant cosmic egg whose hidden heart was the first black hole ever pictured.', zh: '一枚巨大的宇宙“蛋”，它隐藏的心脏是人类拍到的第一个黑洞。', es: 'Un huevo cósmico gigante cuyo corazón oculto fue el primer agujero negro fotografiado.', pt: 'Um ovo cósmico gigante cujo coração escondido foi o primeiro buraco negro fotografado.' },
  youAreHere: null,
};
