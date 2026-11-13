// The observable universe · 可观测宇宙 · Universo observable · Universo observável
// Sources opened: ESA Planck science highlights, NASA COBE, NASA Science (large-scale structures), NASA Hubble (galaxy count).
const PLANCK = 'https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_science_highlights';
export default {
  id: 'observable-universe', level: 'universe',
  names: { en: 'Observable Universe', zh: '可观测宇宙', es: 'Universo observable', pt: 'Universo observável' },
  type: { en: 'Everything we can see', zh: '我们能看到的一切', es: 'Todo lo que podemos ver', pt: 'Tudo o que podemos ver' },
  shape: { kind: 'web', count: 52000, colors: ['#9fb8ff', '#ffe2b0', '#6b7bb0'], params: { nodes: 90 }, seed: 23 },
  position: [0, 0, 0], size: 100,
  facts: [
    { label: { en: 'Age', zh: '年龄', es: 'Edad', pt: 'Idade' },
      value: { en: 'About 13.8 billion years', zh: '约 138 亿年', es: 'Unos 13.800 millones de años', pt: 'Cerca de 13,8 bilhões de anos' },
      source: { name: 'ESA', url: PLANCK } },
    { label: { en: 'Big Bang afterglow', zh: '大爆炸余晖', es: 'Resplandor del Big Bang', pt: 'Brilho do Big Bang' },
      value: { en: '2.725 K · about −270 °C', zh: '2.725 K · 约 −270 °C', es: '2,725 K · unos −270 °C', pt: '2,725 K · cerca de −270 °C' },
      source: { name: 'NASA', url: 'https://science.nasa.gov/mission/cobe/science/' } },
    { label: { en: 'Shape', zh: '结构', es: 'Forma', pt: 'Forma' },
      value: { en: 'A cosmic web of filaments and voids', zh: '由纤维和空洞组成的宇宙网', es: 'Una red cósmica de filamentos y vacíos', pt: 'Uma teia cósmica de filamentos e vazios' },
      source: { name: 'NASA', url: 'https://science.nasa.gov/universe/galaxies/large-scale-structures/' } },
    { label: { en: 'Ordinary matter', zh: '普通物质', es: 'Materia ordinaria', pt: 'Matéria comum' },
      value: { en: 'About 5% (4.9%)', zh: '约 5%（4.9%）', es: 'Cerca del 5 % (4,9 %)', pt: 'Cerca de 5% (4,9%)' },
      source: { name: 'ESA', url: PLANCK } },
    { label: { en: 'Dark matter · dark energy', zh: '暗物质 · 暗能量', es: 'Materia oscura · energía oscura', pt: 'Matéria escura · energia escura' },
      value: { en: 'About 27% · about 68%', zh: '约 27% · 约 68%', es: 'Cerca del 27 % · cerca del 68 %', pt: 'Cerca de 27% · cerca de 68%' },
      source: { name: 'ESA', url: PLANCK } },
    { label: { en: 'Galaxies', zh: '星系数量', es: 'Galaxias', pt: 'Galáxias' },
      value: { en: 'At least 10× the old estimate of 200 billion', zh: '至少是旧估计（2000 亿）的 10 倍', es: 'Al menos 10 veces la antigua cifra de 200.000 millones', pt: 'Pelo menos 10 vezes a antiga estimativa de 200 bilhões' },
      source: { name: 'NASA', url: 'https://science.nasa.gov/missions/hubble/hubble-reveals-observable-universe-contains-10-times-more-galaxies-than-previously-thought/' } },
  ],
  narration: {
    en: 'This is as far as we can see. Galaxies gather along threads and walls, a cosmic web around huge empty voids. The universe is about 13.8 billion years old, and ordinary matter, the stuff of stars and of us, is only about 5% of it.',
    zh: '这是我们能看到的最远处。星系沿着纤维和墙状结构聚集，围绕着巨大的空洞，构成宇宙网。宇宙大约 138 亿岁，而构成恒星和我们的普通物质只占约 5%。',
    es: 'Hasta aquí podemos ver. Las galaxias se agrupan en hilos y paredes, una red cósmica alrededor de enormes vacíos. El universo tiene unos 13.800 millones de años, y la materia ordinaria, la de las estrellas y la nuestra, es solo cerca del 5 %.',
    pt: 'Até aqui conseguimos ver. As galáxias se juntam em fios e paredes, uma teia cósmica em volta de enormes vazios. O universo tem cerca de 13,8 bilhões de anos, e a matéria comum, a das estrelas e a nossa, é só cerca de 5% dele.',
  },
  clue: { en: 'A web with no spider: every thread is made of galaxies.', zh: '一张没有蜘蛛的网：每一根丝都由星系组成。', es: 'Una telaraña sin araña: cada hilo está hecho de galaxias.', pt: 'Uma teia sem aranha: cada fio é feito de galáxias.' },
  youAreHere: { en: 'You are here · the centre of what we can see', zh: '你在这里 · 我们可见宇宙的中心', es: 'Estás aquí · el centro de lo que podemos ver', pt: 'Você está aqui · o centro do que podemos ver', at: [0, 0, 0] },
};
