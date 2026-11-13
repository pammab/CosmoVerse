// The Laniakea supercluster · 拉尼亚凯亚超星系团 · Supercúmulo Laniakea · Superaglomerado Laniakea
// Sources opened (2026-11-13c): NASA APOD 2014-09-10, Tully et al. 2014 (Nature 513, 71), NASA Science (large-scale structures).
// Drawn as galaxies streaming along branches into a basin; one branch ends at the Local Group, near the outer edge
// (NASA), passing the Virgo Cluster (inside Laniakea per APOD). Not to scale. · 不按比例
const APOD = 'https://apod.nasa.gov/apod/ap140910.html';
const NATURE = 'https://www.nature.com/articles/nature13674';
const LSS = 'https://science.nasa.gov/universe/galaxies/large-scale-structures/';
const S = 58;                                         // size in the level's units · 本层单位中的大小
const HOME = [0.62, 0.05, 0.5], VIRGO = [0.48, 0.04, 0.34];   // unit coords · 单位坐标
const at = c => c.map(v => v * S);
// Tilt the flat basin towards the camera; three.js Euler XYZ applies Rz, then Rx · 让盆地面向镜头
const TILT = [1.05, 0.2];
const turn = ([x, y, z], [rx, rz] = TILT) => { [x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)]; [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)]; return [x, y, z]; };
export default {
  id: 'laniakea', level: 'supercluster',
  names: { en: 'Laniakea Supercluster', zh: '拉尼亚凯亚超星系团', es: 'Supercúmulo Laniakea', pt: 'Superaglomerado Laniakea' },
  type: { en: 'Our home supercluster', zh: '我们的家园超星系团', es: 'Nuestro supercúmulo', pt: 'Nosso superaglomerado' },
  shape: { kind: 'supercluster', count: 34000, colors: ['#9db8ff', '#ffe2b4', '#fff2dc'], seed: 7,
    params: { branches: 10, home: HOME, via: [VIRGO, [0.22, 0.02, 0.2]] } },
  // The Local Group (HOME) sits at the level's origin, where the camera looks · 本星系群位于本层原点
  position: turn(HOME).map(v => -v * S), size: S, tilt: TILT, spin: 0, frame: 1.1,   // still, so the marker stays on its branch · 不自转，标记不偏移
  labels: [{ at: at(VIRGO), names: { en: 'Virgo Cluster', zh: '室女座星系团', es: 'Cúmulo de Virgo', pt: 'Aglomerado de Virgem' } }],
  facts: [
    { label: { en: 'Type', zh: '类型', es: 'Tipo', pt: 'Tipo' },
      value: { en: 'Supercluster of galaxies', zh: '超星系团', es: 'Supercúmulo de galaxias', pt: 'Superaglomerado de galáxias' },
      source: { name: 'NASA', url: LSS } },
    { label: { en: 'Size', zh: '大小', es: 'Tamaño', pt: 'Tamanho' },
      value: { en: 'About 500 million light-years across', zh: '跨度约 5 亿光年', es: 'Unos 500 millones de años luz de diámetro', pt: 'Cerca de 500 milhões de anos-luz de diâmetro' },
      source: { name: 'NASA', url: APOD } },
    { label: { en: 'Galaxies', zh: '星系数量', es: 'Galaxias', pt: 'Galáxias' },
      value: { en: 'About 100,000 large galaxies', zh: '约 10 万个大星系', es: 'Unas 100.000 galaxias grandes', pt: 'Cerca de 100 mil galáxias grandes' },
      source: { name: 'Nature (Tully et al. 2014)', url: NATURE } },
    { label: { en: 'Mass', zh: '质量', es: 'Masa', pt: 'Massa' },
      value: { en: 'About 100,000 times the Milky Way', zh: '约为银河系的 10 万倍', es: 'Unas 100.000 veces la Vía Láctea', pt: 'Cerca de 100 mil vezes a Via Láctea' },
      source: { name: 'NASA', url: APOD } },
    { label: { en: 'Name', zh: '名字', es: 'Nombre', pt: 'Nome' },
      value: { en: 'Hawaiian for “immense heaven”', zh: '夏威夷语，意为“无垠的天空”', es: 'En hawaiano, «cielo inmenso»', pt: 'Em havaiano, “céu imenso”' },
      source: { name: 'NASA', url: APOD } },
    { label: { en: 'Our place', zh: '我们的位置', es: 'Nuestro lugar', pt: 'Nosso lugar' },
      value: { en: 'The Local Group, on its outer edge', zh: '本星系群，位于它的外缘', es: 'El Grupo Local, en su borde exterior', pt: 'O Grupo Local, na borda externa' },
      source: { name: 'NASA', url: LSS } },
  ],
  // Narration sources: ~100,000 large galaxies: Nature (Tully et al. 2014); ~500 million ly, whole Virgo Cluster, galaxies beyond flowing
  // to other concentrations: APOD; Local Group near the outer edge: NASA large-scale structures · 各句来源
  narration: {
    en: 'Laniakea is our home supercluster: about 100,000 large galaxies spread across about 500 million light-years, including the whole Virgo Cluster. Our Local Group sits near its outer edge. Beyond its border, galaxies flow towards other great concentrations of galaxies.',
    zh: '拉尼亚凯亚是我们的家园超星系团：约 10 万个大星系分布在约 5 亿光年的范围内，其中包括整个室女座星系团。我们的本星系群位于它的外缘附近。在它的边界之外，星系流向其他巨大的星系聚集区。',
    es: 'Laniakea es nuestro supercúmulo: unas 100.000 galaxias grandes repartidas en unos 500 millones de años luz, incluido todo el cúmulo de Virgo. Nuestro Grupo Local está cerca de su borde exterior. Más allá de su frontera, las galaxias fluyen hacia otras grandes concentraciones de galaxias.',
    pt: 'Laniakea é o nosso superaglomerado: cerca de 100 mil galáxias grandes espalhadas por cerca de 500 milhões de anos-luz, incluindo todo o Aglomerado de Virgem. Nosso Grupo Local fica perto da borda externa. Além da fronteira dele, as galáxias fluem para outras grandes concentrações de galáxias.',
  },
  clue: { en: 'A Hawaiian name for our cosmic home among about 100,000 large galaxies.', zh: '一个夏威夷语名字，是我们在约 10 万个大星系中的宇宙家园。', es: 'Un nombre hawaiano para nuestro hogar cósmico entre unas 100.000 galaxias grandes.', pt: 'Um nome havaiano para o nosso lar cósmico entre cerca de 100 mil galáxias grandes.' },
  youAreHere: { en: 'You are here · Local Group', zh: '你在这里 · 本星系群', es: 'Estás aquí · Grupo Local', pt: 'Você está aqui · Grupo Local', at: at(HOME) },
};
