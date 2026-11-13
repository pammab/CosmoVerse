// The Orion Nebula, M42 · 猎户座大星云 · Nebulosa de Orión · Nebulosa de Órion
// Narration's naked-eye line: NASA M42 page · 肉眼可见出自 NASA M42 页面
// Sources opened: NASA Hubble Messier 42 page, ESA Webb NIRCam image (2023), ESO eso1723, ESA/Hubble heic0601a.
const M42 = 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/';
const ESA_WEBB = 'https://esa.int/ESA_Multimedia/Images/2023/09/Orion_Nebula_in_NIRCam_long-wavelength_channel';
export default {
  id: 'orion-nebula', level: 'neighbourhood',
  names: { en: 'Orion Nebula', zh: '猎户座大星云', es: 'Nebulosa de Orión', pt: 'Nebulosa de Órion' },
  type: { en: 'Star-forming nebula · M42', zh: '恒星形成星云 · M42', es: 'Nebulosa de formación estelar · M42', pt: 'Nebulosa de formação estelar · M42' },
  // Hubble's colours: orange/red = hydrogen, teal/green = oxygen · 红橙色为氢，青绿色为氧
  shape: { kind: 'nebula', count: 16000, colors: ['#ff7a6e', '#5fd0c0', '#eaf2ff'], params: { blobs: 14 }, seed: 42 },
  position: [-60, 6, -28], size: 16, frame: 1.3,
  facts: [
    { label: { en: 'Distance', zh: '距离', es: 'Distancia', pt: 'Distância' },
      value: { en: 'About 1,350 light-years', zh: '约 1350 光年', es: 'Unos 1350 años luz', pt: 'Cerca de 1.350 anos-luz' },
      source: { name: 'ESO', url: 'https://eso.org/public/news/eso1723/' } },
    { label: { en: 'Rank', zh: '地位', es: 'Rango', pt: 'Posição' },
      value: { en: 'Closest large star-forming region to Earth', zh: '离地球最近的大型恒星形成区', es: 'La región grande de formación estelar más cercana a la Tierra', pt: 'A grande região de formação de estrelas mais próxima da Terra' },
      source: { name: 'NASA', url: M42 } },
    { label: { en: 'Age', zh: '年龄', es: 'Edad', pt: 'Idade' },
      value: { en: 'Only about 1 million years', zh: '只有约 100 万年', es: 'Solo un millón de años, más o menos', pt: 'Só cerca de 1 milhão de anos' },
      source: { name: 'ESA', url: ESA_WEBB } },
    { label: { en: 'Where to look', zh: '在哪里看', es: 'Dónde mirar', pt: 'Onde olhar' },
      value: { en: 'The “sword” of the constellation Orion', zh: '猎户座的“佩剑”', es: 'La “espada” de la constelación de Orión', pt: 'A “espada” da constelação de Órion' },
      source: { name: 'ESA', url: ESA_WEBB } },
    { label: { en: 'Trapezium', zh: '猎户四边形', es: 'Trapecio', pt: 'Trapézio' },
      value: { en: 'Four massive young stars that shape the nebula', zh: '四颗年轻的大质量恒星塑造了星云', es: 'Cuatro estrellas jóvenes y masivas que dan forma a la nebulosa', pt: 'Quatro estrelas jovens e massivas que moldam a nebulosa' },
      source: { name: 'NASA', url: M42 } },
    { label: { en: 'Stars in one Hubble picture', zh: '哈勃一张照片中的恒星', es: 'Estrellas en una foto del Hubble', pt: 'Estrelas numa foto do Hubble' },
      value: { en: 'More than 3,000', zh: '超过 3000 颗', es: 'Más de 3000', pt: 'Mais de 3.000' },
      source: { name: 'ESA/Hubble', url: 'https://esahubble.org/images/heic0601a/' } },
  ],
  narration: {
    en: 'The Orion Nebula is a nursery where new stars are being born, the closest large one to Earth. Its light left about 1,350 years ago, and from a dark place you can see it with your own eyes in the sword of Orion. Four massive young stars, the Trapezium, shape it.',
    zh: '猎户座大星云是一个正在诞生新恒星的“育婴室”，也是离地球最近的大型恒星形成区。我们看到的光大约在 1350 年前出发，在黑暗的地方，你用肉眼就能在猎户座的“佩剑”里看到它。四颗年轻的大质量恒星——猎户四边形——塑造了它的模样。',
    es: 'La Nebulosa de Orión es una guardería donde nacen estrellas nuevas, la más cercana a la Tierra de las grandes. Su luz salió hace unos 1350 años y, desde un lugar oscuro, puedes verla a simple vista en la espada de Orión. Cuatro estrellas jóvenes y masivas, el Trapecio, le dan forma.',
    pt: 'A Nebulosa de Órion é um berçário onde estrelas novas estão nascendo, o grande berçário mais próximo da Terra. A luz dela saiu há cerca de 1.350 anos e, de um lugar escuro, dá para vê-la a olho nu na espada de Órion. Quatro estrelas jovens e massivas, o Trapézio, lhe dão forma.',
  },
  clue: { en: 'A glowing star nursery hanging from a hunter’s belt.', zh: '挂在猎人腰带下、正在发光的恒星育婴室。', es: 'Una guardería de estrellas que brilla colgada del cinturón de un cazador.', pt: 'Um berçário de estrelas brilhando pendurado no cinturão de um caçador.' },
  youAreHere: null,
};
