// A filament of the cosmic web, with a void beside it · 宇宙网纤维 · Filamento de la red cósmica · Filamento da teia cósmica
// Pamela chose option B (2026-11-13): a close-up of one filament, separate from the whole-web "Observable Universe" piece.
// Sources opened (2026-11-14): NASA "Mapping the Cosmic Web", NASA "Lonely galaxy lost in space" (Local Void),
// ESA XMM-Newton "missing matter" (2025), ESO potw2504a (MUSE filament), NASA "Webb identifies the earliest strands".
// Drawn as one thread of small galaxies feeding a cluster, with an empty bubble beside it; not to scale. · 不按比例
const MAP = 'https://science.nasa.gov/mission/hubble/science/science-highlights/mapping-the-cosmic-web/';
const VOID = 'https://science.nasa.gov/missions/hubble/lonely-galaxy-lost-in-space/';
const XMM = 'https://www.esa.int/Science_Exploration/Space_Science/XMM-Newton/The_models_were_right_astronomers_find_missing_matter';
const MUSE = 'https://www.eso.org/public/images/potw2504a/';
const WEBB = 'https://science.nasa.gov/missions/webb/nasas-webb-identifies-the-earliest-strands-of-the-cosmic-web/';
export default {
  id: 'cosmic-web', level: 'universe',
  names: { en: 'Cosmic Web Filament', zh: '宇宙网纤维', es: 'Filamento de la red cósmica', pt: 'Filamento da teia cósmica' },
  type: { en: 'A thread of galaxies beside a void', zh: '空洞旁的一条星系之丝', es: 'Un hilo de galaxias junto a un vacío', pt: 'Um fio de galáxias ao lado de um vazio' },
  shape: { kind: 'filament', count: 26000, colors: ['#b4c8ff', '#ffe2b0', '#6f7fc4', '#8fa0d0'], params: { void: [0.15, 0.58, -0.1, 0.5] }, seed: 61 },
  // Inside the big web, off to one side; the whole web fades while it is open · 位于大宇宙网一侧，打开时其余部分淡出
  position: [60, 12, 34], size: 24, frame: 1.25, spin: 0.002, isolate: true,
  facts: [
    { label: { en: 'Made of', zh: '组成', es: 'Hecho de', pt: 'Feito de' },
      value: { en: 'Filaments and sheets, mostly dark matter', zh: '纤维和片状结构，主要是暗物质', es: 'Filamentos y láminas, sobre todo materia oscura', pt: 'Filamentos e lâminas, principalmente matéria escura' },
      source: { name: 'NASA', url: MAP } },
    { label: { en: 'Feeding a cluster', zh: '注入星系团', es: 'Alimenta un cúmulo', pt: 'Alimentando um aglomerado' },
      value: { en: 'One filament about 13 million light-years long streams into a galaxy cluster', zh: '一条长约 1300 万光年的纤维正涌入一个星系团', es: 'Un filamento de unos 13 millones de años luz fluye hacia un cúmulo de galaxias', pt: 'Um filamento de cerca de 13 milhões de anos-luz flui para um aglomerado de galáxias' },
      source: { name: 'NASA', url: MAP } },
    { label: { en: 'A void', zh: '空洞', es: 'Un vacío', pt: 'Um vazio' },
      value: { en: 'The Local Void: at least 150 million light-years across, mostly empty of galaxies', zh: '本地空洞：直径至少 1.5 亿光年，几乎没有星系', es: 'El Vacío Local: al menos 150 millones de años luz, casi sin galaxias', pt: 'O Vazio Local: pelo menos 150 milhões de anos-luz, quase sem galáxias' },
      source: { name: 'NASA', url: VOID } },
    { label: { en: 'Hot “missing” matter', zh: '炽热的“失踪”物质', es: 'Materia “perdida” caliente', pt: 'Matéria “desaparecida” quente' },
      value: { en: 'One filament of gas: over 10 million degrees, about 23 million light-years long', zh: '一条气体纤维：超过 1000 万度，长约 2300 万光年', es: 'Un filamento de gas: más de 10 millones de grados, unos 23 millones de años luz', pt: 'Um filamento de gás: mais de 10 milhões de graus, cerca de 23 milhões de anos-luz' },
      source: { name: 'ESA', url: XMM } },
    { label: { en: 'Photographed', zh: '拍摄到', es: 'Fotografiado', pt: 'Fotografado' },
      value: { en: 'A 3-million-light-year filament, after about 150 hours with ESO’s VLT', zh: '一条 300 万光年长的纤维，用 ESO 甚大望远镜观测约 150 小时', es: 'Un filamento de 3 millones de años luz, tras unas 150 horas con el VLT de ESO', pt: 'Um filamento de 3 milhões de anos-luz, após cerca de 150 horas com o VLT do ESO' },
      source: { name: 'ESO', url: MUSE } },
    { label: { en: 'One of the earliest strands', zh: '最早的丝之一', es: 'Uno de los hilos más antiguos', pt: 'Um dos fios mais antigos' },
      value: { en: '10 galaxies in a line, 830 million years after the Big Bang', zh: '10 个星系排成一线，在大爆炸后 8.3 亿年', es: '10 galaxias en fila, 830 millones de años después del Big Bang', pt: '10 galáxias em fila, 830 milhões de anos após o Big Bang' },
      source: { name: 'NASA', url: WEBB } },
  ],
  // Narration sources: dark matter web + 13-million-ly filament: NASA MAP; Local Void: NASA VOID; >10 million degrees gas, "missing" matter: ESA XMM · 各句来源
  narration: {
    en: 'Up close, the cosmic web is threads of galaxies, held together mostly by dark matter. One filament about 13 million light-years long is streaming into a galaxy cluster. Beside the threads lie voids like the Local Void, at least 150 million light-years across and almost empty, and some filaments hide hot gas above 10 million degrees, part of the ordinary matter astronomers had been missing.',
    zh: '近看，宇宙网是一根根星系之丝，主要由暗物质维系在一起。一条长约 1300 万光年的纤维正涌入一个星系团。丝的旁边是像本地空洞这样的空洞，直径至少 1.5 亿光年，几乎空无一物；有些纤维里藏着超过 1000 万度的热气体，是天文学家一直没找到的部分普通物质。',
    es: 'De cerca, la red cósmica son hilos de galaxias, unidos sobre todo por materia oscura. Un filamento de unos 13 millones de años luz fluye hacia un cúmulo de galaxias. Junto a los hilos hay vacíos como el Vacío Local, de al menos 150 millones de años luz y casi vacío, y algunos filamentos esconden gas a más de 10 millones de grados, parte de la materia ordinaria que los astrónomos no encontraban.',
    pt: 'De perto, a teia cósmica é feita de fios de galáxias, unidos principalmente pela matéria escura. Um filamento de cerca de 13 milhões de anos-luz flui para um aglomerado de galáxias. Ao lado dos fios ficam vazios como o Vazio Local, com pelo menos 150 milhões de anos-luz e quase vazio, e alguns filamentos escondem gás a mais de 10 milhões de graus, parte da matéria comum que os astrônomos não encontravam.',
  },
  clue: { en: 'A thread of dark matter strung with galaxies, with emptiness at its side.', zh: '一根串满星系的暗物质之线，身旁是一片空旷。', es: 'Un hilo de materia oscura ensartado de galaxias, con el vacío a su lado.', pt: 'Um fio de matéria escura cheio de galáxias, com o vazio ao lado.' },
  labels: [{ at: [0.15, 0.58, -0.1].map(v => v * 24), names: { en: 'Void', zh: '空洞', es: 'Vacío', pt: 'Vazio' }, onlyOpen: true }],   // shown only in the close-up · 仅在特写中显示
  youAreHere: null,
};
