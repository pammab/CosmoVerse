// Betelgeuse, the red supergiant in Orion · 参宿四 · Betelgeuse · Betelgeuse
// Sources opened (2026-11-13c): NASA Hubble "What is Betelgeuse?", ESO eso2109 (Great Dimming dust veil).
// Placed on the Orion side of the Sun (the Orion Nebula piece is further out the same way); not to scale. · 不按比例
const HUBBLE = 'https://science.nasa.gov/missions/hubble/what-is-betelgeuse-inside-the-strange-volatile-star/';
const ESO = 'https://www.eso.org/public/news/eso2109/';
export default {
  id: 'betelgeuse', level: 'neighbourhood',
  names: { en: 'Betelgeuse', zh: '参宿四', es: 'Betelgeuse', pt: 'Betelgeuse' },
  type: { en: 'Red supergiant star', zh: '红超巨星', es: 'Estrella supergigante roja', pt: 'Estrela supergigante vermelha' },
  // A huge orange-red star with a soft, dim dust cloud below it (the 2019 "Great Dimming") · 下方是 2019 年“大变暗”的尘埃云
  // bright < 1: the dense additive star stays orange-red instead of washing out to white (lesson 2026-11-13b) · 保持橙红色
  shape: { kind: 'galaxy-group', count: 2200, colors: ['#ffffff'], seed: 12, params: { dwarfs: 0, members: [
    { at: [0, 0.04, 0], kind: 'star', r: 0.62, share: 0.55, colors: ['#ff5a1f', '#d8401c'], bright: 0.32, seed: 21 },
    { at: [0.06, -0.42, 0.08], kind: 'nebula', r: 0.3, share: 0.45, colors: ['#9a5038', '#6a5a7a', '#ff9a66'], params: { blobs: 4 }, seed: 22 },
  ] } },
  position: [-30, -1, -12], size: 4.5, frame: 1.15,
  facts: [
    { label: { en: 'Type', zh: '类型', es: 'Tipo', pt: 'Tipo' },
      value: { en: 'Red supergiant', zh: '红超巨星', es: 'Supergigante roja', pt: 'Supergigante vermelha' },
      source: { name: 'ESO', url: ESO } },
    { label: { en: 'Distance', zh: '距离', es: 'Distancia', pt: 'Distância' },
      value: { en: 'About 700 light-years', zh: '约 700 光年', es: 'Unos 700 años luz', pt: 'Cerca de 700 anos-luz' },
      source: { name: 'NASA', url: HUBBLE } },
    { label: { en: 'Size', zh: '大小', es: 'Tamaño', pt: 'Tamanho' },
      value: { en: 'About 700 times the Sun', zh: '直径约为太阳的 700 倍', es: 'Unas 700 veces el Sol', pt: 'Cerca de 700 vezes o Sol' },
      source: { name: 'NASA', url: HUBBLE } },
    { label: { en: 'In the Sun’s place', zh: '如果替代太阳', es: 'En lugar del Sol', pt: 'No lugar do Sol' },
      value: { en: 'It would reach past Jupiter’s orbit', zh: '会延伸到木星轨道之外', es: 'Llegaría más allá de la órbita de Júpiter', pt: 'Passaria da órbita de Júpiter' },
      source: { name: 'NASA', url: HUBBLE } },
    { label: { en: 'Age', zh: '年龄', es: 'Edad', pt: 'Idade' },
      value: { en: 'About 10 million years', zh: '约 1000 万年', es: 'Unos 10 millones de años', pt: 'Cerca de 10 milhões de anos' },
      source: { name: 'NASA', url: HUBBLE } },
    { label: { en: 'Great Dimming', zh: '大变暗', es: 'Gran Oscurecimiento', pt: 'Grande Escurecimento' },
      value: { en: 'Late 2019–early 2020 · a dust cloud hid part of it', zh: '2019 年底至 2020 年初 · 一团尘埃遮住了它的一部分', es: 'Finales de 2019 a inicios de 2020 · una nube de polvo tapó parte de ella', pt: 'Fim de 2019 a início de 2020 · uma nuvem de poeira cobriu parte dela' },
      source: { name: 'ESO', url: ESO } },
  ],
  // Clue "came back": ESO eso2109 / NASA Hubble (normal brightness by April 2020)
  // Narration: Orion's shoulder, ~15 solar masses, supernova not for ~100,000 years: NASA Hubble page above · 来源同上
  narration: {
    en: 'Betelgeuse is the red star on Orion’s shoulder, a supergiant about 15 times more massive than the Sun. It is only about 10 million years old, yet it is already near the end of its life: one day it will explode as a supernova, though probably not for about another 100,000 years.',
    zh: '参宿四是猎户座“肩膀”上的那颗红星，一颗质量约为太阳 15 倍的超巨星。它只有大约 1000 万岁，却已接近生命的尽头：总有一天它会爆发成超新星，不过大概还要再等约 10 万年。',
    es: 'Betelgeuse es la estrella roja del hombro de Orión, una supergigante unas 15 veces más masiva que el Sol. Solo tiene unos 10 millones de años y ya está cerca del final de su vida: algún día explotará como supernova, aunque probablemente no antes de unos 100.000 años.',
    pt: 'Betelgeuse é a estrela vermelha no ombro de Órion, uma supergigante com cerca de 15 vezes a massa do Sol. Tem só uns 10 milhões de anos e já está perto do fim da vida: um dia vai explodir como supernova, mas provavelmente só daqui a uns 100 mil anos.',
  },
  clue: { en: 'A red supergiant on a hunter’s shoulder that once faded, then came back.', zh: '猎人肩上的一颗红超巨星，曾经变暗，后来又亮了回来。', es: 'Una supergigante roja en el hombro de un cazador que se oscureció y luego volvió a brillar.', pt: 'Uma supergigante vermelha no ombro de um caçador que escureceu e depois voltou.' },
  youAreHere: null,
};
