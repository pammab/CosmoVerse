// Collections (a sticker book in the logbook) + Weekly missions: more reasons to come back (per browser)
// 收藏册（日志里的贴纸簿）与每周任务：回来的更多理由（按浏览器保存）
// Pure helpers (run in node for the tests); main.js builds the item lists, the UI and the storage.
// Mission facts: every line names its source page (opened 2026-11-17).
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const COLL_UI = {
  collections: L('Collections', '收藏册', 'Colecciones', 'Coleções'),
  done: L('Complete', '已集齐', 'Completa', 'Completa'),
  complete: L('Collection complete: {c}!', '收藏册集齐：{c}！', '¡Colección completa: {c}!', 'Coleção completa: {c}!'),
  found: L('{n} / {t} found', '已找到 {n} / {t}', '{n} / {t} encontrados', '{n} / {t} encontrados'),
  howMoons: L('Open a planet, then click a moon or spacecraft (or point ☝ and hold): “What is this?” adds it here.', '打开一颗行星，再点击卫星或航天器（或用 ☝ 指向停留）：“这是什么？”会把它加到这里。', 'Abre un planeta y haz clic en una luna o nave (o apunta ☝ y mantén): “¿Qué es esto?” la añade aquí.', 'Abra um planeta e clique numa lua ou nave (ou aponte ☝ e segure): “O que é isto?” a adiciona aqui.'),
  missions: L('This week’s missions', '本周任务', 'Misiones de esta semana', 'Missões desta semana'),
  missionsDone: L('{n} / {t} done', '已完成 {n} / {t}', '{n} / {t} hechas', '{n} / {t} feitas'),
  missionNew: L('Mission done: {m}', '任务完成：{m}', 'Misión cumplida: {m}', 'Missão cumprida: {m}'),
  weekDone: L('All of this week’s missions done!', '本周任务全部完成！', '¡Todas las misiones de la semana hechas!', 'Todas as missões da semana feitas!'),
  weeks: L('Weeks completed: {n}', '已完成的周数：{n}', 'Semanas completadas: {n}', 'Semanas completas: {n}'),
  newWeek: L('New missions every Monday', '每周一有新任务', 'Misiones nuevas cada lunes', 'Missões novas toda segunda-feira'),
  go: L('✈ Go', '✈ 前往', '✈ Ir', '✈ Ir'),
  source: L('Source', '来源', 'Fuente', 'Fonte'),
  vrMissions: L('🎯 Missions', '🎯 任务', '🎯 Misiones', '🎯 Missões'),
  vrRow: L('🎯 Mission {n} · ✈ Go', '🎯 任务 {n} · ✈ 前往', '🎯 Misión {n} · ✈ Ir', '🎯 Missão {n} · ✈ Ir'),
  vrColl: L('🏅 Collections', '🏅 收藏册', '🏅 Colecciones', '🏅 Coleções'),
};
// The five collections; main.js fills `items` ({ key, names, color }) · 五个收藏册
export const COLLECTIONS = [
  { id: 'planets', icon: '🪐', names: L('Planets', '行星', 'Planetas', 'Planetas') },
  { id: 'moons', icon: '🌙', names: L('Moons', '卫星', 'Lunas', 'Luas') },
  { id: 'craft', icon: '🛰', names: L('Spacecraft', '航天器', 'Naves espaciales', 'Naves espaciais') },
  { id: 'galaxies', icon: '🌀', names: L('Galaxies', '星系', 'Galaxias', 'Galáxias') },
  { id: 'nebulae', icon: '☁', names: L('Nebulae', '星云', 'Nebulosas', 'Nebulosas') },
];
// Journey pieces in the galaxy / nebula collections (place ids, stamped by the logbook) · 星系与星云收藏册中的旅程片段
export const GALAXY_PIECES = ['P:milky-way', 'P:andromeda', 'P:m87'];
export const NEBULA_PIECES = ['P:orion-nebula', 'P:pillars-of-creation'];
// Progress of every collection: has(key) → found? · 每个收藏册的进度
export function collectionProgress(items, has) {
  return COLLECTIONS.map(c => { const list = (items[c.id] || []).map(it => ({ ...it, got: !!has(it.key) }));
    const n = list.filter(x => x.got).length; return { ...c, items: list, n, t: list.length, done: list.length > 0 && n === list.length }; });
}
// Collections that became complete between two progress lists · 新集齐的收藏册
export const newlyComplete = (before, after) => after.filter(c => c.done && !before.find(b => b.id === c.id)?.done);

// Weekly missions: target = the place id (L:/B:/P:) or "What is this?" key (moon-/craft-/spot-) that completes it; fly = where ✈ goes
// 每周任务：target 为完成任务的地点或“这是什么？”对象；fly 为 ✈ 的目的地
const JPL = 'JPL', NASA = 'NASA', ESO = 'ESO', ESA = 'ESA/Hubble';
export const MISSIONS = [
  { id: 'volcano', target: 'spot-olympus-mons', fly: 'B:mars', source: { name: JPL, url: 'https://www.jpl.nasa.gov/images/pia00300-olympus-mons/' },
    text: L('Find the largest known volcano in the Solar System', '找到太阳系已知最大的火山', 'Encuentra el volcán más grande conocido del sistema solar', 'Encontre o maior vulcão conhecido do Sistema Solar') },
  { id: 'canyon', target: 'spot-valles-marineris', fly: 'B:mars', source: { name: JPL, url: 'https://www.jpl.nasa.gov/images/pia02891-mars-canyon-with-los-angeles-for-scale/' },
    text: L('Find a canyon 10 times longer and deeper than the Grand Canyon', '找到一条比大峡谷长 10 倍、深 10 倍的峡谷', 'Encuentra un cañón 10 veces más largo y profundo que el Gran Cañón', 'Encontre um cânion 10 vezes mais longo e mais fundo que o Grand Canyon') },
  { id: 'storm', target: 'spot-great-red-spot', fly: 'B:jupiter', source: { name: JPL, url: 'https://www.jpl.nasa.gov/news/nasas-juno-probes-the-depths-of-jupiters-great-red-spot/' },
    text: L('Find a storm about 1.3 times as wide as the Earth', '找到一场宽度约为地球 1.3 倍的风暴', 'Encuentra una tormenta unas 1,3 veces más ancha que la Tierra', 'Encontre uma tempestade cerca de 1,3 vez mais larga que a Terra') },
  { id: 'hexagon', target: 'spot-saturn-hexagon', fly: 'B:saturn', source: { name: JPL, url: 'https://www.jpl.nasa.gov/news/nasas-cassini-spacecraft-obtains-best-views-of-saturn-hexagon/' },
    text: L('Find a six-sided jet stream around a planet’s north pole', '找到环绕一颗行星北极的六边形急流', 'Encuentra una corriente en chorro de seis lados en el polo norte de un planeta', 'Encontre uma corrente de jato de seis lados no polo norte de um planeta') },
  { id: 'andromeda', target: 'P:andromeda', source: { name: NASA, url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/' },
    text: L('Open a galaxy about 2.5 million light-years away', '打开一个距离约 250 万光年的星系', 'Abre una galaxia a unos 2,5 millones de años luz', 'Abra uma galáxia a cerca de 2,5 milhões de anos-luz') },
  { id: 'nearest', target: 'P:alpha-centauri', source: { name: NASA, url: 'https://imagine.gsfc.nasa.gov/features/cosmic/nearest_star_info.html' },
    text: L('Find the system with the nearest star to the Sun', '找到拥有离太阳最近恒星的星系统', 'Encuentra el sistema con la estrella más cercana al Sol', 'Encontre o sistema com a estrela mais próxima do Sol') },
  { id: 'giant-star', target: 'P:betelgeuse', source: { name: NASA, url: 'https://science.nasa.gov/universe/what-is-betelgeuse-inside-the-strange-volatile-star' },
    text: L('Find a star that, in the Sun’s place, would stretch past Jupiter’s orbit', '找到一颗若放在太阳的位置、会延伸到木星轨道之外的恒星', 'Encuentra una estrella que, en lugar del Sol, llegaría más allá de la órbita de Júpiter', 'Encontre uma estrela que, no lugar do Sol, passaria da órbita de Júpiter') },
  { id: 'black-hole', target: 'P:sgr-a-star', source: { name: ESO, url: 'https://www.eso.org/public/images/eso2208-eht-mwa/' },
    text: L('Find a black hole about 4 million times as massive as the Sun', '找到一个质量约为太阳 400 万倍的黑洞', 'Encuentra un agujero negro unos 4 millones de veces más masivo que el Sol', 'Encontre um buraco negro cerca de 4 milhões de vezes mais massivo que o Sol') },
  { id: 'cluster-heart', target: 'P:m87', source: { name: ESA, url: 'https://esahubble.org/images/opo1332a/' },
    text: L('Find the giant galaxy at the centre of a cluster of about 2,000 galaxies', '找到位于约 2000 个星系组成的星系团中心的巨大星系', 'Encuentra la galaxia gigante en el centro de un cúmulo de unas 2000 galaxias', 'Encontre a galáxia gigante no centro de um aglomerado de cerca de 2.000 galáxias') },
  { id: 'nursery', target: 'P:orion-nebula', source: { name: NASA, url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/' },
    text: L('Find the closest large star-forming region to Earth', '找到离地球最近的大型恒星形成区', 'Encuentra la región grande de formación de estrellas más cercana a la Tierra', 'Encontre a grande região de formação de estrelas mais próxima da Terra') },
  { id: 'young-cluster', target: 'P:pleiades', source: { name: NASA, url: 'https://science.nasa.gov/missions/tess/nasas-tess-spacecraft-triples-size-of-pleiades-star-cluster/' },
    text: L('Find a star cluster born about 100 million years ago', '找到一个约 1 亿年前诞生的星团', 'Encuentra un cúmulo de estrellas nacido hace unos 100 millones de años', 'Encontre um aglomerado de estrelas nascido há cerca de 100 milhões de anos') },
  { id: 'pillars', target: 'P:pillars-of-creation', source: { name: NASA, url: 'https://science.nasa.gov/missions/hubble/new-hubble-webb-pillars-of-creation-visualization/' },
    text: L('Find towers made mostly of cool molecular hydrogen and dust', '找到主要由低温分子氢和尘埃构成的高塔', 'Encuentra torres hechas sobre todo de hidrógeno molecular frío y polvo', 'Encontre torres feitas sobretudo de hidrogênio molecular frio e poeira') },
  { id: 'heaven', target: 'P:laniakea', source: { name: NASA, url: 'https://apod.nasa.gov/apod/ap140910.html' },
    text: L('Find the supercluster whose name means “immense heaven” in Hawaiian', '找到名字在夏威夷语里意为“无边天堂”的超星系团', 'Encuentra el supercúmulo cuyo nombre significa “cielo inmenso” en hawaiano', 'Encontre o superaglomerado cujo nome significa “céu imenso” em havaiano') },
];
export const MISSIONS_PER_WEEK = 3;
// ISO week 'YYYY-Www' (weeks start on Monday) for a local date · ISO 周（周一开始）
export function weekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear();
  return `${y}-W${String(Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7)).padStart(2, '0')}`;
}
// The week's missions: deterministic, consecutive weeks walk through the whole pool · 每周任务：确定性，相邻周轮流
export function weekMissions(key = weekKey(), pool = MISSIONS, n = MISSIONS_PER_WEEK) {
  const m = /^(\d{4})-W(\d{2})$/.exec(key); if (!m || !pool.length) return [];
  const i = ((+m[1]) * 53 + (+m[2])) * n;
  return Array.from({ length: Math.min(n, pool.length) }, (_, k) => pool[(i + k) % pool.length]);
}
// How many of the week's missions are done (only ids of this week count: stored data is untrusted) · 本周已完成数
export const doneCount = (state, week = weekKey(), pool = MISSIONS) => state.week !== week ? 0 : weekMissions(week, pool).filter(m => state.done.includes(m.id)).length;
// Mark the week's missions that `key` completes; returns the newly done ones · 标记完成的任务
export function completeMissions(state, key, week = weekKey(), pool = MISSIONS) {
  if (state.week !== week) { state.week = week; state.done = []; }
  const fresh = weekMissions(week, pool).filter(m => m.target === key && !state.done.includes(m.id));
  for (const m of fresh) state.done.push(m.id); return fresh;
}
