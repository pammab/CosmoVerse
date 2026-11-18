// Surface landmarks you can point at and ask "What is this?" · 可以指向并提问的地表地标 · Lugares de la superficie · Marcos da superfície
// Text only from the JPL page in `source` (opened 2026-11-17).
// `uv`: where the feature sits on our surface map (u = 0.5 + longitude°E/360 with 0° at the centre, v = (90 − latitude)/180).
// Mars and Saturn from the published coordinates; the Great Red Spot from where it is painted on jupiter.jpg (it drifts in longitude).
// 文字只来自 source 页面；uv 是该地标在贴图上的位置。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const LANDMARKS = {
  mars: [
    { id: 'olympus-mons', uv: [0.5 + (226.78 - 360) / 360, (90 - 17.66) / 180],
      names: L('Olympus Mons', '奥林帕斯山', 'Monte Olimpo', 'Monte Olimpo'),
      text: L('The largest known volcano in the Solar System: about 27 km high and more than 600 km wide at its base.',
        '太阳系已知最大的火山：高约 27 千米，底部宽超过 600 千米。',
        'El volcán más grande conocido del sistema solar: unos 27 km de altura y más de 600 km de ancho en su base.',
        'O maior vulcão conhecido do Sistema Solar: cerca de 27 km de altura e mais de 600 km de largura na base.'),
      source: { name: 'JPL', url: 'https://www.jpl.nasa.gov/images/pia00300-olympus-mons/' } },
    { id: 'valles-marineris', uv: [0.5 + (282 - 360) / 360, (90 + 8) / 180],
      names: L('Valles Marineris', '水手号峡谷', 'Valles Marineris', 'Valles Marineris'),
      text: L('A huge canyon system near the equator, 10 times longer and deeper than Arizona’s Grand Canyon: long enough to cross the United States from coast to coast.',
        '赤道附近的巨大峡谷系统，长度和深度都是亚利桑那州大峡谷的 10 倍，长得足以横跨美国东西海岸。',
        'Un enorme sistema de cañones cerca del ecuador, 10 veces más largo y profundo que el Gran Cañón de Arizona: tan largo que cruzaría Estados Unidos de costa a costa.',
        'Um enorme sistema de cânions perto do equador, 10 vezes mais longo e mais profundo que o Grand Canyon do Arizona: longo o bastante para cruzar os Estados Unidos de costa a costa.'),
      source: { name: 'JPL', url: 'https://www.jpl.nasa.gov/images/pia02891-mars-canyon-with-los-angeles-for-scale/' } },
  ],
  jupiter: [
    { id: 'great-red-spot', uv: [0.364, 0.6],
      names: L('Great Red Spot', '大红斑', 'Gran Mancha Roja', 'Grande Mancha Vermelha'),
      text: L('A giant storm in the southern hemisphere, about 16,000 km wide in 2017 (1.3 times Earth’s width), with winds faster than any storm on Earth.',
        '南半球的一场巨型风暴，2017 年宽约 16,000 千米（地球宽度的 1.3 倍），风速超过地球上任何风暴。',
        'Una tormenta gigante en el hemisferio sur, de unos 16.000 km de ancho en 2017 (1,3 veces el ancho de la Tierra), con vientos más rápidos que cualquier tormenta de la Tierra.',
        'Uma tempestade gigante no hemisfério sul, com cerca de 16.000 km de largura em 2017 (1,3 vez a largura da Terra), com ventos mais rápidos que qualquer tempestade da Terra.'),
      source: { name: 'JPL', url: 'https://www.jpl.nasa.gov/news/nasas-juno-probes-the-depths-of-jupiters-great-red-spot/' } },
  ],
  saturn: [
    { id: 'saturn-hexagon', uv: [0.5, 0.02],
      names: L('The hexagon', '六边形风暴', 'El hexágono', 'O hexágono'),
      text: L('A six-sided jet stream around Saturn’s north pole, about 30,000 km across, with winds of about 322 km/h.',
        '环绕土星北极的六边形急流，宽约 30,000 千米，风速约每小时 322 千米。',
        'Una corriente en chorro de seis lados alrededor del polo norte de Saturno, de unos 30.000 km de ancho, con vientos de unos 322 km/h.',
        'Uma corrente de jato de seis lados ao redor do polo norte de Saturno, com cerca de 30.000 km de largura e ventos de cerca de 322 km/h.'),
      source: { name: 'JPL', url: 'https://www.jpl.nasa.gov/news/nasas-cassini-spacecraft-obtains-best-views-of-saturn-hexagon/' } },
  ],
};
// A point on the unit sphere for a map position (three.js SphereGeometry layout) · 贴图坐标 → 单位球面上的点
export function uvToUnit([u, v]) {
  const phi = u * Math.PI * 2, th = v * Math.PI;
  return [-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th)];
}
