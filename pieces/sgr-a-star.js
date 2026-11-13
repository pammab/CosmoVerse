// Sagittarius A*, the Milky Way's central black hole · 人马座A* · Sagitario A* · Sagitário A*
// Sources opened (2026-11-13c): ESO eso2208 first-image page, ESOblog "Our quest for Sagittarius A*".
// Sits at the centre of the Milky Way piece (pieces/milky-way.js, position [0,0,0]); drawn hugely larger than life. · 远比实际大
const EHT = 'https://www.eso.org/public/images/eso2208-eht-mwa/';
const BLOG = 'https://www.eso.org/public/blog/our-quest-for-sagittarius-a/';
export default {
  id: 'sgr-a-star', level: 'galaxy',
  names: { en: 'Sagittarius A*', zh: '人马座A*', es: 'Sagitario A*', pt: 'Sagitário A*' },
  type: { en: 'Supermassive black hole', zh: '超大质量黑洞', es: 'Agujero negro supermasivo', pt: 'Buraco negro supermassivo' },
  // A glowing disk and ring round a dark shadow, like the 2022 EHT image · 暗影外的亮环，与 2022 年的图像相似
  shape: { kind: 'black-hole', count: 16000, colors: ['#ffe7b8', '#ff7a32'], params: { tilt: 0.35 }, seed: 27 },
  position: [0, 0, 0], size: 7, frame: 1.3, tilt: [-0.5, 0], spin: 0, isolate: true,   // hide the galaxy's glowing core while open · 打开时隐去银河系明亮的核心
  labelAt: [0, -16, 0],   // keep its label clear of the Milky Way's, which sits at the same centre · 标签下移，避免与银河系重叠
  facts: [
    { label: { en: 'Where', zh: '位置', es: 'Dónde', pt: 'Onde' },
      value: { en: 'At the centre of the Milky Way', zh: '银河系的中心', es: 'En el centro de la Vía Láctea', pt: 'No centro da Via Láctea' },
      source: { name: 'ESO', url: BLOG } },
    { label: { en: 'Mass', zh: '质量', es: 'Masa', pt: 'Massa' },
      value: { en: 'About 4 million Suns', zh: '约 400 万个太阳', es: 'Unos 4 millones de soles', pt: 'Cerca de 4 milhões de sóis' },
      source: { name: 'ESO', url: EHT } },
    { label: { en: 'Distance', zh: '距离', es: 'Distancia', pt: 'Distância' },
      value: { en: 'About 27,000 light-years', zh: '约 2.7 万光年', es: 'Unos 27.000 años luz', pt: 'Cerca de 27 mil anos-luz' },
      source: { name: 'ESO', url: BLOG } },
    { label: { en: 'First image', zh: '首张图像', es: 'Primera imagen', pt: 'Primeira imagem' },
      value: { en: 'May 2022 · Event Horizon Telescope', zh: '2022 年 5 月 · 事件视界望远镜', es: 'Mayo de 2022 · Telescopio del Horizonte de Sucesos', pt: 'Maio de 2022 · Telescópio do Horizonte de Eventos' },
      source: { name: 'ESO', url: EHT } },
    { label: { en: 'Star S2', zh: 'S2 恒星', es: 'Estrella S2', pt: 'Estrela S2' },
      value: { en: 'Orbits it once every 16 years', zh: '每 16 年绕它一圈', es: 'Le da una vuelta cada 16 años', pt: 'Dá uma volta em torno dele a cada 16 anos' },
      source: { name: 'ESO', url: BLOG } },
    { label: { en: 'Nobel Prize', zh: '诺贝尔奖', es: 'Premio Nobel', pt: 'Prêmio Nobel' },
      value: { en: 'Physics 2020 · Genzel and Ghez', zh: '2020 年物理学奖 · 根策尔与盖兹', es: 'Física 2020 · Genzel y Ghez', pt: 'Física 2020 · Genzel e Ghez' },
      source: { name: 'ESO', url: BLOG } },
  ],
  // Narration: constellation Sagittarius, shadow + bright ring, eight radio observatories, "Earth-sized" telescope: ESO eso2208 page · 来源 ESO
  narration: {
    en: 'At the heart of our galaxy, in the direction of the constellation Sagittarius, lies a black hole about 4 million times as massive as the Sun. In 2022 the Event Horizon Telescope linked radio observatories across the planet into one Earth-sized virtual telescope and showed its dark shadow inside a bright ring.',
    zh: '在我们星系的中心、人马座的方向上，有一个质量约为太阳 400 万倍的黑洞。2022 年，事件视界望远镜把遍布全球的射电天文台连成一台“地球大小”的虚拟望远镜，拍到了它被明亮光环包围的黑色阴影。',
    es: 'En el corazón de nuestra galaxia, en dirección a la constelación de Sagitario, hay un agujero negro unas 4 millones de veces más masivo que el Sol. En 2022, el Telescopio del Horizonte de Sucesos unió radiotelescopios de todo el planeta en un telescopio virtual del tamaño de la Tierra y mostró su sombra oscura dentro de un anillo brillante.',
    pt: 'No coração da nossa galáxia, na direção da constelação de Sagitário, há um buraco negro com cerca de 4 milhões de vezes a massa do Sol. Em 2022, o Telescópio do Horizonte de Eventos uniu radiotelescópios do planeta inteiro em um telescópio virtual do tamanho da Terra e mostrou sua sombra escura dentro de um anel brilhante.',
  },
  clue: { en: 'A dark heart, 4 million Suns heavy, photographed by a telescope as big as the Earth.', zh: '一颗黑暗的心脏，重达 400 万个太阳，被一台地球大小的望远镜拍了下来。', es: 'Un corazón oscuro de 4 millones de soles, fotografiado por un telescopio del tamaño de la Tierra.', pt: 'Um coração escuro de 4 milhões de sóis, fotografado por um telescópio do tamanho da Terra.' },
  youAreHere: null,
};
