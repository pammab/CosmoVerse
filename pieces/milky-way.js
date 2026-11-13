// The Milky Way, our home galaxy · 银河系 · Vía Láctea · Via Láctea
// Sources opened: ESA Gaia guide, NASA Imagine the Universe, NASA "Milky Way: our location".
const ESA_GAIA = 'https://www.esa.int/Science_Exploration/Space_Science/Gaia/Guide_to_our_galaxy';
const NASA_IMAGINE = 'https://imagine.gsfc.nasa.gov/science/featured_science/milkyway/';
export default {
  id: 'milky-way', level: 'galaxy',
  names: { en: 'Milky Way', zh: '银河系', es: 'Vía Láctea', pt: 'Via Láctea' },
  type: { en: 'Barred spiral galaxy', zh: '棒旋星系', es: 'Galaxia espiral barrada', pt: 'Galáxia espiral barrada' },
  shape: { kind: 'barred-spiral', count: 60000, colors: ['#ffe6bd', '#a9c4ff', '#ff8fb0'], params: { arms: 4, bar: 0.22, pitch: 12, barAngle: 0.5 }, seed: 7 },
  position: [0, 0, 0], size: 100,
  facts: [
    { label: { en: 'Shape', zh: '形状', es: 'Forma', pt: 'Forma' },
      value: { en: 'Barred spiral · bar half-length about 10,000 ly', zh: '棒旋 · 中央棒半长约 1 万光年', es: 'Espiral barrada · semibarra de unos 10.000 años luz', pt: 'Espiral barrada · meia-barra de uns 10 mil anos-luz' },
      source: { name: 'ESA', url: ESA_GAIA } },
    { label: { en: 'Diameter', zh: '直径', es: 'Diámetro', pt: 'Diâmetro' },
      value: { en: 'About 100,000 light-years', zh: '约 10 万光年', es: 'Unos 100.000 años luz', pt: 'Cerca de 100 mil anos-luz' },
      source: { name: 'NASA', url: NASA_IMAGINE } },
    { label: { en: 'Sun to centre', zh: '太阳到银心', es: 'Del Sol al centro', pt: 'Do Sol ao centro' },
      value: { en: 'About 26,000 light-years', zh: '约 2.6 万光年', es: 'Unos 26.000 años luz', pt: 'Cerca de 26 mil anos-luz' },
      source: { name: 'ESA', url: ESA_GAIA } },
    { label: { en: 'Our address', zh: '我们的位置', es: 'Nuestra dirección', pt: 'Nosso endereço' },
      value: { en: 'The Orion Spur', zh: '猎户座支臂', es: 'El brazo de Orión', pt: 'O Braço de Órion' },
      source: { name: 'NASA', url: 'https://www.nasa.gov/image-article/milky-way-our-location/' } },
    { label: { en: 'One lap of the Sun', zh: '太阳绕银心一圈', es: 'Una vuelta del Sol', pt: 'Uma volta do Sol' },
      value: { en: 'About 250 million years', zh: '约 2.5 亿年', es: 'Unos 250 millones de años', pt: 'Cerca de 250 milhões de anos' },
      source: { name: 'NASA', url: NASA_IMAGINE } },
    { label: { en: 'Central black hole', zh: '中心黑洞', es: 'Agujero negro central', pt: 'Buraco negro central' },
      value: { en: 'Sagittarius A* · about 4 million Suns', zh: '人马座 A* · 约 400 万个太阳质量', es: 'Sagitario A* · unos 4 millones de soles', pt: 'Sagitário A* · cerca de 4 milhões de sóis' },
      source: { name: 'ESA', url: ESA_GAIA } },
  ],
  narration: {
    en: 'This is our home galaxy, seen from outside. It is a barred spiral about 100,000 light-years across. The Sun sits about 26,000 light-years from the centre, in the Orion Spur, and takes about 250 million years to go around once.',
    zh: '这是从外面看到的我们的家园星系。它是一个棒旋星系，直径约 10 万光年。太阳位于距银心约 2.6 万光年的猎户座支臂上，绕银心一圈大约需要 2.5 亿年。',
    es: 'Esta es nuestra galaxia, vista desde fuera. Es una espiral barrada de unos 100.000 años luz de diámetro. El Sol está a unos 26.000 años luz del centro, en el brazo de Orión, y tarda unos 250 millones de años en dar una vuelta.',
    pt: 'Esta é a nossa galáxia, vista de fora. É uma espiral barrada com cerca de 100 mil anos-luz de diâmetro. O Sol fica a uns 26 mil anos-luz do centro, no Braço de Órion, e leva cerca de 250 milhões de anos para dar uma volta.',
  },
  clue: { en: 'A spinning city of stars with a bar at its heart. Your star lives in one of its quiet side streets.', zh: '一座旋转的恒星之城，中心有一根“棒”。你的恒星住在它安静的小巷里。', es: 'Una ciudad de estrellas que gira, con una barra en el corazón. Tu estrella vive en una de sus calles tranquilas.', pt: 'Uma cidade de estrelas que gira, com uma barra no coração. A sua estrela mora numa das suas ruas tranquilas.' },
  youAreHere: { en: 'You are here · the Sun', zh: '你在这里 · 太阳', es: 'Estás aquí · el Sol', pt: 'Você está aqui · o Sol', at: [-30, 0, 42.5] },
};
