// The Local Group of galaxies · 本星系群 · Grupo Local
// Sources opened: NASA Imagine (Local Group), NASA Science (large-scale structures), NASA Hubble Messier pages, ESA (Hubble & Gaia 2025).
// Positions are in a unit radius (scaled by `size`): Milky Way–Andromeda and Milky Way–Triangulum gaps roughly follow
// 2.5 and 3 million light-years; galaxies themselves are drawn far larger than true scale. · 星系画得比实际大得多
const IMAGINE_LG = 'https://imagine.gsfc.nasa.gov/features/cosmic/local_group_info.html';
const MW = [-0.2, 0, 0.07], M31 = [0.3, 0.03, -0.07], M33 = [0.38, -0.08, -0.22];
const at = (c, s = 150) => c.map(v => v * s), below = (c, d) => [c[0], c[1] - d, c[2]];   // labels sit just under each galaxy · 标签在星系下方
export default {
  id: 'local-group', level: 'local-group',
  names: { en: 'Local Group', zh: '本星系群', es: 'Grupo Local', pt: 'Grupo Local' },
  type: { en: 'Group of galaxies', zh: '星系群', es: 'Grupo de galaxias', pt: 'Grupo de galáxias' },
  shape: { kind: 'galaxy-group', count: 42000, colors: ['#c9d6ff', '#ffe6bd', '#a9c4ff', '#ff8fb0'], seed: 11, params: { dwarfs: 46, members: [
    { at: MW, kind: 'barred-spiral', r: 0.07, share: 0.3, tilt: [0.15, 0.1], params: { arms: 4, bar: 0.22 } },
    { at: M31, kind: 'spiral-galaxy', r: 0.095, share: 0.36, tilt: [1.05, 0.5], params: { arms: 2, pitch: 9 } },
    { at: M33, kind: 'spiral-galaxy', r: 0.045, share: 0.12, tilt: [0.6, -0.3], params: { arms: 2, pitch: 18 }, colors: ['#ffe9c8', '#9fc0ff', '#ff7fa6'] },
    { at: [MW[0] + 0.05, MW[1] - 0.035, MW[2] + 0.04], kind: 'dwarf', r: 0.016, share: 0.02 },
    { at: [MW[0] + 0.03, MW[1] - 0.05, MW[2] + 0.07], kind: 'dwarf', r: 0.011, share: 0.012 },
    { at: [M31[0] - 0.03, M31[1] + 0.03, M31[2] + 0.02], kind: 'elliptical', r: 0.012, share: 0.012 },
  ] } },
  position: [0, 0, 0], size: 150,
  labels: [
    { at: at(below(M31, 0.1)), names: { en: 'Andromeda (M31)', zh: '仙女座星系 (M31)', es: 'Andrómeda (M31)', pt: 'Andrômeda (M31)' } },
    { at: at([M33[0] + 0.07, M33[1] + 0.05, M33[2]]), names: { en: 'Triangulum (M33)', zh: '三角座星系 (M33)', es: 'Triángulo (M33)', pt: 'Triângulo (M33)' } },
    { at: at([MW[0] + 0.05, MW[1] - 0.06, MW[2] + 0.04]), names: { en: 'Magellanic Clouds', zh: '麦哲伦云', es: 'Nubes de Magallanes', pt: 'Nuvens de Magalhães' } },
  ],
  facts: [
    { label: { en: 'Biggest members', zh: '最大的成员', es: 'Miembros mayores', pt: 'Maiores membros' },
      value: { en: 'Andromeda, Milky Way, Triangulum', zh: '仙女座星系、银河系、三角座星系', es: 'Andrómeda, Vía Láctea, Triángulo', pt: 'Andrômeda, Via Láctea, Triângulo' },
      source: { name: 'NASA', url: IMAGINE_LG } },
    { label: { en: 'Size', zh: '大小', es: 'Tamaño', pt: 'Tamanho' },
      value: { en: 'Nearly 10 million light-years across', zh: '直径接近 1000 万光年', es: 'Casi 10 millones de años luz', pt: 'Quase 10 milhões de anos-luz' },
      source: { name: 'NASA', url: IMAGINE_LG } },
    { label: { en: 'Galaxies', zh: '星系数量', es: 'Galaxias', pt: 'Galáxias' },
      value: { en: 'More than 50', zh: '50 多个', es: 'Más de 50', pt: 'Mais de 50' },
      source: { name: 'NASA', url: 'https://science.nasa.gov/universe/galaxies/large-scale-structures/' } },
    { label: { en: 'To Andromeda', zh: '到仙女座星系', es: 'Hasta Andrómeda', pt: 'Até Andrômeda' },
      value: { en: 'About 2.5 million light-years', zh: '约 250 万光年', es: 'Unos 2,5 millones de años luz', pt: 'Cerca de 2,5 milhões de anos-luz' },
      source: { name: 'NASA', url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/' } },
    { label: { en: 'To Triangulum', zh: '到三角座星系', es: 'Hasta Triángulo', pt: 'Até o Triângulo' },
      value: { en: 'About 3 million light-years', zh: '约 300 万光年', es: 'Unos 3 millones de años luz', pt: 'Cerca de 3 milhões de anos-luz' },
      source: { name: 'NASA', url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-33/' } },
    { label: { en: 'Crash with Andromeda?', zh: '会与仙女座相撞吗？', es: '¿Choque con Andrómeda?', pt: 'Colisão com Andrômeda?' },
      value: { en: 'About a 50-50 chance in 10 billion years', zh: '100 亿年内约五五开', es: 'Cerca de 50 % en 10.000 millones de años', pt: 'Cerca de 50% em 10 bilhões de anos' },
      source: { name: 'ESA', url: 'https://www.esa.int/Science_Exploration/Space_Science/Hubble_and_Gaia_revisit_fate_of_our_galaxy' } },
  ],
  narration: {
    en: 'The Milky Way is not alone. With Andromeda and Triangulum it leads the Local Group, more than 50 galaxies spread over nearly 10 million light-years. Andromeda is about 2.5 million light-years away; a 2025 Hubble and Gaia study gives about a 50-50 chance that the two collide within 10 billion years.',
    zh: '银河系并不孤单。它和仙女座星系、三角座星系一起，是本星系群的主要成员；这个星系群有 50 多个星系，分布在直径接近 1000 万光年的范围里。仙女座星系距离我们约 250 万光年；2025 年哈勃与盖亚的研究认为，两者在 100 亿年内相撞的可能性大约是五五开。',
    es: 'La Vía Láctea no está sola. Con Andrómeda y Triángulo encabeza el Grupo Local, más de 50 galaxias repartidas en casi 10 millones de años luz. Andrómeda está a unos 2,5 millones de años luz; un estudio de 2025 con Hubble y Gaia da cerca de un 50 % de probabilidad de que choquen en 10.000 millones de años.',
    pt: 'A Via Láctea não está sozinha. Com Andrômeda e Triângulo, ela lidera o Grupo Local, mais de 50 galáxias espalhadas por quase 10 milhões de anos-luz. Andrômeda está a cerca de 2,5 milhões de anos-luz; um estudo de 2025 com o Hubble e o Gaia dá cerca de 50% de chance de as duas colidirem em 10 bilhões de anos.',
  },
  clue: { en: 'A small family of galaxies. Your galaxy is one of the two biggest siblings.', zh: '一个小小的星系家族，你的星系是最大的两个之一。', es: 'Una pequeña familia de galaxias. Tu galaxia es una de las dos hermanas mayores.', pt: 'Uma pequena família de galáxias. A sua galáxia é uma das duas irmãs maiores.' },
  youAreHere: { en: 'You are here · Milky Way', zh: '你在这里 · 银河系', es: 'Estás aquí · Vía Láctea', pt: 'Você está aqui · Via Láctea', at: at(MW) },
};
