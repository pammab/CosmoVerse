// The Andromeda galaxy, M31 · 仙女座星系 · Galaxia de Andrómeda · Galáxia de Andrômeda
// Sources opened: NASA Hubble Messier 31 page, NASA Imagine (M31), NASA Hubble halo story.
// Position matches M31 in pieces/local-group.js (unit coords × 150) · 位置与本星系群中的 M31 一致
const M31 = 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/';
const IMAGINE_M31 = 'https://imagine.gsfc.nasa.gov/features/yba/M31_velocity/M31_more.html';
export default {
  id: 'andromeda', level: 'local-group',
  names: { en: 'Andromeda Galaxy', zh: '仙女座星系', es: 'Galaxia de Andrómeda', pt: 'Galáxia de Andrômeda' },
  type: { en: 'Spiral galaxy · M31', zh: '旋涡星系 · M31', es: 'Galaxia espiral · M31', pt: 'Galáxia espiral · M31' },
  shape: { kind: 'spiral-galaxy', count: 26000, colors: ['#ffe6c4', '#a8c2ff', '#ff8fb0'], params: { arms: 2, pitch: 9, thickness: 0.02 }, seed: 31 },
  position: [45, 4.5, -10.5], size: 14, tilt: [1.05, 0.5], frame: 1.7,   // seen steeply tilted, so step back a little · 倾斜较大，镜头拉远
  facts: [
    { label: { en: 'Type', zh: '类型', es: 'Tipo', pt: 'Tipo' },
      value: { en: 'Spiral galaxy', zh: '旋涡星系', es: 'Galaxia espiral', pt: 'Galáxia espiral' },
      source: { name: 'NASA', url: M31 } },
    { label: { en: 'Distance', zh: '距离', es: 'Distancia', pt: 'Distância' },
      value: { en: 'About 2.5 million light-years', zh: '约 250 万光年', es: 'Unos 2,5 millones de años luz', pt: 'Cerca de 2,5 milhões de anos-luz' },
      source: { name: 'NASA', url: M31 } },
    { label: { en: 'Stars', zh: '恒星数量', es: 'Estrellas', pt: 'Estrelas' },
      value: { en: 'Perhaps as many as 1 trillion', zh: '可能多达 1 万亿颗', es: 'Quizá hasta un billón (10¹²)', pt: 'Talvez até 1 trilhão' },
      source: { name: 'NASA', url: 'https://science.nasa.gov/missions/hubble/hubble-maps-giant-halo-around-andromeda-galaxy/' } },
    { label: { en: 'Rank', zh: '地位', es: 'Rango', pt: 'Posição' },
      value: { en: 'Largest galaxy in the Local Group', zh: '本星系群中最大的星系', es: 'La mayor galaxia del Grupo Local', pt: 'A maior galáxia do Grupo Local' },
      source: { name: 'NASA', url: IMAGINE_M31 } },
    { label: { en: 'Naked eye?', zh: '肉眼可见？', es: '¿A simple vista?', pt: 'A olho nu?' },
      value: { en: 'Yes · in the constellation Andromeda', zh: '可以 · 位于仙女座', es: 'Sí · en la constelación de Andrómeda', pt: 'Sim · na constelação de Andrômeda' },
      source: { name: 'NASA', url: M31 } },
    { label: { en: 'Size in our sky', zh: '在天空中的大小', es: 'Tamaño en el cielo', pt: 'Tamanho no céu' },
      value: { en: 'About 6 full Moons across', zh: '约 6 个满月宽', es: 'Unas 6 lunas llenas de ancho', pt: 'Cerca de 6 luas cheias de largura' },
      source: { name: 'NASA', url: M31 } },
  ],
  narration: {
    en: 'Andromeda is the largest galaxy in our Local Group, a spiral of perhaps as many as a trillion stars. Its light travels about 2.5 million years to reach us, yet on a dark night you can see it with your own eyes, in the constellation Andromeda.',
    zh: '仙女座星系是本星系群中最大的星系，这个旋涡里可能有多达 1 万亿颗恒星。它的光要走大约 250 万年才能到达我们这里，但在黑暗的夜晚，你用肉眼就能在仙女座看到它。',
    es: 'Andrómeda es la mayor galaxia de nuestro Grupo Local, una espiral de quizá hasta un billón de estrellas. Su luz viaja unos 2,5 millones de años hasta nosotros y, aun así, en una noche oscura puedes verla a simple vista en la constelación de Andrómeda.',
    pt: 'Andrômeda é a maior galáxia do nosso Grupo Local, uma espiral de talvez até 1 trilhão de estrelas. A luz dela viaja cerca de 2,5 milhões de anos até nós e, mesmo assim, numa noite escura dá para vê-la a olho nu na constelação de Andrômeda.',
  },
  clue: { en: 'Our big neighbour: a giant galaxy you can spot without a telescope.', zh: '我们的大邻居：不用望远镜就能看到的遥远巨人。', es: 'Nuestra gran vecina: una gigante lejana que puedes ver sin telescopio.', pt: 'Nossa grande vizinha: uma gigante distante que dá para ver sem telescópio.' },
  youAreHere: null,
};
