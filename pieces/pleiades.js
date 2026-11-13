// The Pleiades, M45 · 昴星团 · Las Pléyades · As Plêiades
// Sources opened: NASA Hubble Messier 45 page, NASA TESS Pleiades story, NOIRLab noao-m45 image page.
const M45 = 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-45/';
const TESS = 'https://science.nasa.gov/missions/tess/nasas-tess-spacecraft-triples-size-of-pleiades-star-cluster/';
const NOIR = 'https://noirlab.edu/public/images/noao-m45/';
export default {
  id: 'pleiades', level: 'neighbourhood',
  names: { en: 'Pleiades', zh: '昴星团', es: 'Pléyades', pt: 'Plêiades' },
  type: { en: 'Open star cluster · M45', zh: '疏散星团 · M45', es: 'Cúmulo abierto · M45', pt: 'Aglomerado aberto · M45' },
  // Hot blue-white stars in a blue dust haze · 蓝白色热星与蓝色尘埃反射星云
  shape: { kind: 'cluster', count: 5000, colors: ['#cfe0ff', '#ffffff', '#5d84ff'], params: { bright: 7 }, seed: 45 },
  position: [50, 9, 22], size: 9, frame: 1.4,
  facts: [
    { label: { en: 'Also called', zh: '别名', es: 'También llamadas', pt: 'Também chamadas' },
      value: { en: 'Seven Sisters · Subaru in Japan', zh: '七姐妹 · 日本称“昴”（Subaru）', es: 'Siete Hermanas · Subaru en Japón', pt: 'Sete Irmãs · Subaru no Japão' },
      source: { name: 'NOIRLab', url: NOIR } },
    { label: { en: 'Distance', zh: '距离', es: 'Distancia', pt: 'Distância' },
      value: { en: 'About 445 light-years', zh: '约 445 光年', es: 'Unos 445 años luz', pt: 'Cerca de 445 anos-luz' },
      source: { name: 'NASA', url: M45 } },
    { label: { en: 'Age', zh: '年龄', es: 'Edad', pt: 'Idade' },
      value: { en: 'About 100 million years', zh: '约 1 亿年', es: 'Unos 100 millones de años', pt: 'Cerca de 100 milhões de anos' },
      source: { name: 'NASA', url: TESS } },
    { label: { en: 'Stars', zh: '恒星数量', es: 'Estrellas', pt: 'Estrelas' },
      value: { en: 'Over a thousand, loosely held by gravity', zh: '一千多颗，由引力松散地维系', es: 'Más de mil, unidas débilmente por la gravedad', pt: 'Mais de mil, fracamente ligadas pela gravidade' },
      source: { name: 'NASA', url: M45 } },
    { label: { en: 'Naked eye?', zh: '肉眼可见？', es: '¿A simple vista?', pt: 'A olho nu?' },
      value: { en: 'About six stars · Taurus, October to April evenings', zh: '约 6 颗 · 金牛座，10 月至次年 4 月的傍晚', es: 'Unas seis estrellas · Tauro, noches de octubre a abril', pt: 'Cerca de seis estrelas · Touro, noites de outubro a abril' },
      source: { name: 'NASA', url: TESS } },
    { label: { en: 'The blue haze', zh: '蓝色的雾', es: 'La bruma azul', pt: 'A névoa azul' },
      value: { en: 'Starlight bouncing off dust', zh: '星光被尘埃散射', es: 'Luz de estrellas que rebota en el polvo', pt: 'Luz das estrelas refletida na poeira' },
      source: { name: 'NOIRLab', url: NOIR } },
  ],
  narration: {
    en: 'The Pleiades, or Seven Sisters, is a family of over a thousand stars, born about 100 million years ago. On evenings from October to April you can see about six of them with your own eyes in Taurus. The blue haze around the brightest ones is their light bouncing off dust.',
    zh: '昴星团又叫“七姐妹”，是一个由一千多颗恒星组成的大家庭，它们大约在 1 亿年前诞生。在 10 月到次年 4 月的傍晚，你用肉眼就能在金牛座看到其中大约 6 颗。最亮的星周围那层蓝色的雾，是它们的光被尘埃散射而成的。',
    es: 'Las Pléyades, o Siete Hermanas, son una familia de más de mil estrellas que nacieron hace unos 100 millones de años. En las noches de octubre a abril puedes ver unas seis a simple vista en Tauro. La bruma azul alrededor de las más brillantes es su luz rebotando en el polvo.',
    pt: 'As Plêiades, ou Sete Irmãs, são uma família de mais de mil estrelas que nasceram há cerca de 100 milhões de anos. Nas noites de outubro a abril dá para ver umas seis delas a olho nu, em Touro. A névoa azul em volta das mais brilhantes é a luz delas refletida na poeira.',
  },
  clue: { en: 'Seven sisters, though your eyes count about six.', zh: '名叫七姐妹，可你的眼睛大约只数得出六颗。', es: 'Siete hermanas, aunque tus ojos cuentan unas seis.', pt: 'Sete irmãs, mas seus olhos contam umas seis.' },
  youAreHere: null,
};
