// The Pillars of Creation, in the Eagle Nebula (M16) · 创生之柱 · Pilares de la Creación · Pilares da Criação
// Sources opened (2026-11-14): ESA/Webb weic2216, NASA Hubble+Webb Pillars visualization, NASA Hubble Messier 16, ESO eso0926.
// About 6,500–7,000 light-years away (beyond the stars drawn here), towards Serpens; placed on the far side from Orion.
// Not to scale. · 不按比例
const WEBB = 'https://esawebb.org/news/weic2216/';
const VIS = 'https://science.nasa.gov/missions/hubble/new-hubble-webb-pillars-of-creation-visualization/';
const M16 = 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-16/';
const ESO = 'https://eso.org/public/unitedkingdom/news/eso0926/?lang=';
export default {
  id: 'pillars-of-creation', level: 'neighbourhood',
  names: { en: 'Pillars of Creation', zh: '创生之柱', es: 'Pilares de la Creación', pt: 'Pilares da Criação' },
  type: { en: 'Columns of gas and dust · Eagle Nebula, M16', zh: '气体与尘埃之柱 · 鹰状星云 M16', es: 'Columnas de gas y polvo · Nebulosa del Águila, M16', pt: 'Colunas de gás e poeira · Nebulosa da Águia, M16' },
  // Webb's colours: orange-brown dust, crimson glowing edges, light-blue gas · 韦布的颜色：橙棕色尘埃、深红色边缘、淡蓝色气体
  shape: { kind: 'pillars', count: 22000, colors: ['#b8662f', '#e8384a', '#8ec9e8', '#fff4e0'], seed: 16 },
  position: [46, -4, -50], size: 11, frame: 1.35, spin: 0, isolate: true,   // the bright nearby stars fade while it is open · 打开时附近亮星淡出
  facts: [
    { label: { en: 'Distance', zh: '距离', es: 'Distancia', pt: 'Distância' },
      value: { en: 'About 6,500 to 7,000 light-years', zh: '约 6500 至 7000 光年', es: 'Unos 6500 a 7000 años luz', pt: 'Cerca de 6.500 a 7.000 anos-luz' },
      source: { name: 'ESA/Webb', url: WEBB }, also: [{ name: 'NASA', url: M16 }] },
    { label: { en: 'Constellation', zh: '星座', es: 'Constelación', pt: 'Constelação' },
      value: { en: 'Serpens, the Snake', zh: '巨蛇座', es: 'Serpens, la Serpiente', pt: 'Serpente (Serpens)' },
      source: { name: 'ESO', url: ESO } },
    { label: { en: 'Made of', zh: '组成', es: 'Hechos de', pt: 'Feitos de' },
      value: { en: 'Cool gas and dust, mostly molecular hydrogen', zh: '冷的气体和尘埃，主要是分子氢', es: 'Gas y polvo fríos, sobre todo hidrógeno molecular', pt: 'Gás e poeira frios, principalmente hidrogênio molecular' },
      source: { name: 'NASA', url: VIS } },
    { label: { en: 'Being eroded by', zh: '正被侵蚀', es: 'Erosionados por', pt: 'Desgastados por' },
      value: { en: 'Winds and ultraviolet light from hot young stars', zh: '炽热年轻恒星的星风和紫外线', es: 'Vientos y luz ultravioleta de estrellas jóvenes y calientes', pt: 'Ventos e luz ultravioleta de estrelas jovens e quentes' },
      source: { name: 'NASA', url: VIS } },
    { label: { en: 'First Hubble picture', zh: '哈勃首次拍摄', es: 'Primera foto del Hubble', pt: 'Primeira foto do Hubble' },
      value: { en: '1995', zh: '1995 年', es: '1995', pt: '1995' },
      source: { name: 'ESA/Webb', url: WEBB } },
    { label: { en: 'Webb sees', zh: '韦布看到', es: 'Webb ve', pt: 'O Webb vê' },
      value: { en: 'Newborn stars, and a crimson glow from young stars’ jets and shocks', zh: '新生恒星，以及年轻恒星喷流和激波产生的深红色辉光', es: 'Estrellas recién nacidas y un brillo carmesí de los chorros y choques de estrellas jóvenes', pt: 'Estrelas recém-nascidas e um brilho carmesim de jatos e choques de estrelas jovens' },
      source: { name: 'ESA/Webb', url: WEBB } },
  ],
  // Narration sources: Eagle Nebula + 6,500 ly + cool gas and dust: WEBB; erosion by winds and UV: VIS; Hubble 1995, Webb protostars, knots collapsing: WEBB · 各句来源
  narration: {
    en: 'The Pillars of Creation stand inside the Eagle Nebula, about 6,500 light-years away: towers of cool gas and dust. Winds and ultraviolet light from hot young stars are slowly wearing them away. Hubble first photographed them in 1995, and Webb’s infrared view shows newborn stars, and dense knots inside the pillars collapse to form more.',
    zh: '创生之柱位于约 6500 光年外的鹰状星云中，是由冷的气体和尘埃构成的高塔。炽热年轻恒星的星风和紫外线正在慢慢侵蚀它们。哈勃望远镜在 1995 年首次拍下它们，而韦布望远镜的红外视野显示了新生恒星，柱内致密的气团还在坍缩，形成更多恒星。',
    es: 'Los Pilares de la Creación están dentro de la Nebulosa del Águila, a unos 6500 años luz: torres de gas y polvo fríos. Los vientos y la luz ultravioleta de estrellas jóvenes y calientes los van desgastando poco a poco. El Hubble los fotografió por primera vez en 1995, y la visión infrarroja del Webb muestra estrellas recién nacidas, y nudos densos dentro de los pilares colapsan para formar más.',
    pt: 'Os Pilares da Criação ficam dentro da Nebulosa da Águia, a cerca de 6.500 anos-luz: torres de gás e poeira frios. Ventos e luz ultravioleta de estrelas jovens e quentes os desgastam devagar. O Hubble os fotografou pela primeira vez em 1995, e a visão infravermelha do Webb mostra estrelas recém-nascidas, e nós densos dentro dos pilares colapsam para formar outras.',
  },
  clue: { en: 'In the Snake’s constellation, towers of cold dust are carved by young stars’ light.', zh: '在巨蛇座里，冷尘之塔被年轻恒星的光芒雕刻。', es: 'En la constelación de la Serpiente, torres de polvo frío talladas por la luz de estrellas jóvenes.', pt: 'Na constelação da Serpente, torres de poeira fria esculpidas pela luz de estrelas jovens.' },
  youAreHere: null,
};
