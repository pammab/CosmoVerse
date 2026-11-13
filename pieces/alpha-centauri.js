// Alpha Centauri and Proxima, the nearest stars · 半人马座α与比邻星 · Alfa Centauri y Próxima · Alfa Centauri e Próxima
// Sources opened: NASA "Our nearest celestial neighbor" (3-star system), nasa.gov Alpha Centauri image article,
// NASA Imagine "nearest star", ESO eso1629 (Proxima b).
const NASA3 = 'https://science.nasa.gov/exoplanets/other-stars-other-worlds/our-nearest-celestial-neighbor-an-exotic-3-star-system/';
const NASA_IMG = 'https://www.nasa.gov/image-article/alpha-centauri-triple-star-system-about-4-light-years-from-earth/';
const IMAGINE = 'https://imagine.gsfc.nasa.gov/features/cosmic/nearest_star_info.html';
const S = 5;   // piece size (scene units) · 尺寸
const PROXIMA = [0.78, 0.3, 0.32];   // in the piece's unit space · 单位坐标
export default {
  id: 'alpha-centauri', level: 'neighbourhood',
  names: { en: 'Alpha Centauri', zh: '半人马座α', es: 'Alfa Centauri', pt: 'Alfa Centauri' },
  type: { en: 'Triple star system · our nearest stars', zh: '三合星系统 · 离我们最近的恒星', es: 'Sistema de tres estrellas · las más cercanas', pt: 'Sistema de três estrelas · as mais próximas' },
  // A (Sun-like) and B (a bit smaller) close together, Proxima (a small red dwarf) off to the side · A、B 相伴，比邻星在一旁
  shape: { kind: 'galaxy-group', count: 1500, colors: ['#ffffff'], seed: 4, params: { dwarfs: 0, members: [
    { at: [-0.16, 0, 0], kind: 'star', r: 0.42, share: 0.45, colors: ['#ffd9a0', '#ffb45c'] },
    { at: [0.16, -0.03, 0.02], kind: 'star', r: 0.32, share: 0.35, colors: ['#ffc287', '#ff9248'] },
    { at: PROXIMA, kind: 'star', r: 0.13, share: 0.2, colors: ['#ff9a72', '#ff5a3c'] },
  ] } },
  position: [-34, -4, 16], size: S, frame: 1.6,
  labels: [{ at: PROXIMA.map(v => v * S), names: { en: 'Proxima', zh: '比邻星', es: 'Próxima', pt: 'Próxima' }, r: 0.6 }],
  facts: [
    { label: { en: 'Stars', zh: '恒星', es: 'Estrellas', pt: 'Estrelas' },
      value: { en: 'Three: A, B and Proxima', zh: '三颗：A、B 和比邻星', es: 'Tres: A, B y Próxima', pt: 'Três: A, B e Próxima' },
      source: { name: 'NASA', url: NASA3 } },
    { label: { en: 'Nearest star to the Sun', zh: '离太阳最近的恒星', es: 'La más cercana al Sol', pt: 'A mais próxima do Sol' },
      value: { en: 'Proxima · about 4.25 light-years', zh: '比邻星 · 约 4.25 光年', es: 'Próxima · unos 4,25 años luz', pt: 'Próxima · cerca de 4,25 anos-luz' },
      source: { name: 'NASA', url: IMAGINE } },
    { label: { en: 'Alpha Centauri A', zh: '半人马座α A', es: 'Alfa Centauri A', pt: 'Alfa Centauri A' },
      value: { en: 'A near twin of our Sun', zh: '几乎是太阳的双胞胎', es: 'Casi gemela de nuestro Sol', pt: 'Quase gêmea do nosso Sol' },
      source: { name: 'NASA', url: NASA_IMG } },
    { label: { en: 'A and B dance', zh: 'A 与 B 互绕', es: 'El baile de A y B', pt: 'A dança de A e B' },
      value: { en: 'One orbit around each other every 80 years', zh: '每 80 年互相绕转一圈', es: 'Una vuelta una alrededor de la otra cada 80 años', pt: 'Uma volta uma em torno da outra a cada 80 anos' },
      source: { name: 'NASA', url: NASA3 } },
    { label: { en: 'Proxima', zh: '比邻星', es: 'Próxima', pt: 'Próxima' },
      value: { en: 'A small red dwarf that often flares', zh: '一颗经常爆发耀斑的小红矮星', es: 'Una pequeña enana roja con frecuentes fulguraciones', pt: 'Uma pequena anã vermelha com erupções frequentes' },
      source: { name: 'NASA', url: NASA3 } },
    { label: { en: 'Planet Proxima b', zh: '行星比邻星 b', es: 'Planeta Próxima b', pt: 'Planeta Próxima b' },
      value: { en: 'In the habitable zone · a year of 11.2 days', zh: '位于宜居带 · 一年只有 11.2 天', es: 'En la zona habitable · un año de 11,2 días', pt: 'Na zona habitável · um ano de 11,2 dias' },
      source: { name: 'ESO', url: 'https://www.eso.org/public/news/eso1629/' } },
  ],
  narration: {
    en: 'Alpha Centauri is our nearest neighbour: three stars just over four light-years away. Two of them, A and B, circle each other every 80 years, and A is almost a twin of our Sun. The third, Proxima, is a small red dwarf and the closest star to the Sun, with a planet in its habitable zone.',
    zh: '半人马座α是我们最近的邻居：三颗恒星，距离只有四光年多一点。其中 A 和 B 每 80 年互相绕转一圈，A 几乎是太阳的双胞胎。第三颗比邻星是一颗小红矮星，也是离太阳最近的恒星，它的宜居带里有一颗行星。',
    es: 'Alfa Centauri es nuestra vecina más cercana: tres estrellas a poco más de cuatro años luz. Dos de ellas, A y B, giran una alrededor de la otra cada 80 años, y A es casi gemela de nuestro Sol. La tercera, Próxima, es una pequeña enana roja y la estrella más cercana al Sol, con un planeta en su zona habitable.',
    pt: 'Alfa Centauri é nossa vizinha mais próxima: três estrelas a pouco mais de quatro anos-luz. Duas delas, A e B, giram uma em torno da outra a cada 80 anos, e A é quase gêmea do nosso Sol. A terceira, Próxima, é uma pequena anã vermelha e a estrela mais próxima do Sol, com um planeta na zona habitável.',
  },
  clue: { en: 'Three stars next door: one is a near twin of the Sun.', zh: '隔壁的三颗星：其中一颗几乎是太阳的双胞胎。', es: 'Tres estrellas en la puerta de al lado: una es casi gemela del Sol.', pt: 'Três estrelas na casa ao lado: uma é quase gêmea do Sol.' },
  youAreHere: null,
};
