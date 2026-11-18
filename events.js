// Coming up: sky events and mission milestones · 即将到来：天象与任务里程碑 · Próximamente · Em breve
// Every date and line comes from the NASA / ESA page in `url`, opened on 2026-11-17.
// `precision: 'month'` = the page names only the month. `fly` = where "Fly there" goes in CosmoVerse.
// Past events drop off by date (calendar.js). Refresh this list after the competition.
// 每个日期与描述都来自 url 所指的 NASA / ESA 页面；过去的事件按日期自动隐藏。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
const NASA_SHOWERS = { name: 'NASA', url: 'https://science.nasa.gov/solar-system/meteors-meteorites/meteor-showers/' };
const NASA_ECLIPSES = { name: 'NASA', url: 'https://science.nasa.gov/eclipses/future-eclipses' };
const ESA_BEPI = { name: 'ESA', url: 'https://www.esa.int/Science_Exploration/Space_Science/BepiColombo/Latest_updates_BepiColombo_s_arrival_at_Mercury' };
export const EVENTS = [
  { id: 'bepicolombo-orbit', date: '2026-11-21', precision: 'day', kind: 'mission', fly: 'mercury', source: ESA_BEPI,
    title: L('BepiColombo enters orbit around Mercury', '贝皮可伦坡号进入水星轨道', 'BepiColombo entra en órbita de Mercurio', 'BepiColombo entra em órbita de Mercúrio'),
    line: L('The joint ESA/JAXA spacecraft is set to enter orbit around Mercury.', '欧空局与日本宇宙航空研究开发机构的联合探测器将进入水星轨道。', 'La nave conjunta de la ESA y la JAXA entrará en órbita alrededor de Mercurio.', 'A nave conjunta da ESA e da JAXA vai entrar em órbita ao redor de Mercúrio.') },
  { id: 'europa-clipper-earth', date: '2026-12', precision: 'month', kind: 'mission', fly: 'earth',
    source: { name: 'NASA', url: 'https://science.nasa.gov/mission/europa-clipper/mission-timeline' },
    title: L('Europa Clipper flies past Earth', '欧罗巴快船飞掠地球', 'Europa Clipper pasa junto a la Tierra', 'Europa Clipper passa pela Terra'),
    line: L('NASA’s Europa Clipper swings back past Earth for its second gravity assist on the way to Jupiter.', 'NASA 的欧罗巴快船返回飞掠地球，进行第二次引力助推，飞往木星。', 'Europa Clipper, de la NASA, vuelve a pasar junto a la Tierra para su segunda asistencia gravitatoria rumbo a Júpiter.', 'A Europa Clipper, da NASA, volta a passar pela Terra para sua segunda assistência gravitacional a caminho de Júpiter.') },
  { id: 'bepicolombo-separation', date: '2026-12-09', end: '2026-12-10', precision: 'day', kind: 'mission', fly: 'mercury', source: ESA_BEPI,
    title: L('BepiColombo’s two orbiters separate', '贝皮可伦坡号的两个轨道器分离', 'Se separan los dos orbitadores de BepiColombo', 'Os dois orbitadores da BepiColombo se separam'),
    line: L('The two orbiters, MPO and Mio, are set to separate on 9–10 December.', '两个轨道器 MPO 和 Mio 将于 12 月 9–10 日分离。', 'Los dos orbitadores, MPO y Mio, se separarán el 9 y 10 de diciembre.', 'Os dois orbitadores, MPO e Mio, vão se separar em 9 e 10 de dezembro.') },
  { id: 'geminids-2026', date: '2026-12-13', end: '2026-12-14', precision: 'day', kind: 'sky', fly: 'earth', source: NASA_SHOWERS,
    title: L('Geminid meteor shower peak', '双子座流星雨极大', 'Máximo de las Gemínidas', 'Pico das Geminídeas'),
    line: L('Peak night: December 13–14; the shower is active from December 4 to 17.', '极大之夜：12 月 13–14 日；活跃期 12 月 4 日至 17 日。', 'Noche de máximo: 13–14 de diciembre; activa del 4 al 17 de diciembre.', 'Noite de pico: 13–14 de dezembro; ativa de 4 a 17 de dezembro.') },
  { id: 'quadrantids-2027', date: '2027-01-03', end: '2027-01-04', precision: 'day', kind: 'sky', fly: 'earth', source: NASA_SHOWERS,
    title: L('Quadrantid meteor shower peak', '象限仪座流星雨极大', 'Máximo de las Cuadrántidas', 'Pico das Quadrântidas'),
    line: L('Peak night: January 3–4, 2027.', '极大之夜：2027 年 1 月 3–4 日。', 'Noche de máximo: 3–4 de enero de 2027.', 'Noite de pico: 3–4 de janeiro de 2027.') },
  { id: 'annular-eclipse-2027', date: '2027-02-06', precision: 'day', kind: 'sky', fly: 'earth', source: NASA_ECLIPSES,
    title: L('Annular solar eclipse', '日环食', 'Eclipse solar anular', 'Eclipse solar anular'),
    line: L('Visible in parts of South America and Africa.', '南美洲和非洲部分地区可见。', 'Visible en partes de Sudamérica y África.', 'Visível em partes da América do Sul e da África.') },
  { id: 'lunar-eclipse-2027-02', date: '2027-02-20', end: '2027-02-21', precision: 'day', kind: 'sky', fly: 'earth', source: NASA_ECLIPSES,
    title: L('Penumbral lunar eclipse', '半影月食', 'Eclipse lunar penumbral', 'Eclipse lunar penumbral'),
    line: L('February 20–21, 2027 (local date); seen from the Americas, Europe, Africa, Asia, Australia and Antarctica.', '2027 年 2 月 20–21 日（当地日期）；美洲、欧洲、非洲、亚洲、澳大利亚和南极洲可见。', '20–21 de febrero de 2027 (fecha local); visible desde América, Europa, África, Asia, Australia y la Antártida.', '20–21 de fevereiro de 2027 (data local); visível das Américas, Europa, África, Ásia, Austrália e Antártida.') },
  { id: 'bepicolombo-science', date: '2027-04', precision: 'month', kind: 'mission', fly: 'mercury', source: ESA_BEPI,
    title: L('BepiColombo starts its science at Mercury', '贝皮可伦坡号开始水星科学观测', 'BepiColombo empieza su ciencia en Mercurio', 'BepiColombo começa sua ciência em Mercúrio'),
    line: L('The mission’s science phase is set to begin.', '任务的科学阶段预计开始。', 'Está previsto que comience la fase científica de la misión.', 'Está previsto o início da fase científica da missão.') },
  { id: 'lyrids-2027', date: '2027-04-22', end: '2027-04-23', precision: 'day', kind: 'sky', fly: 'earth', source: NASA_SHOWERS,
    title: L('Lyrid meteor shower peak', '天琴座流星雨极大', 'Máximo de las Líridas', 'Pico das Lirídeas'),
    line: L('Peak night: April 22–23; the shower is active from April 14 to 30.', '极大之夜：4 月 22–23 日；活跃期 4 月 14 日至 30 日。', 'Noche de máximo: 22–23 de abril; activa del 14 al 30 de abril.', 'Noite de pico: 22–23 de abril; ativa de 14 a 30 de abril.') },
  { id: 'total-eclipse-2027', date: '2027-08-02', precision: 'day', kind: 'sky', fly: 'earth', source: NASA_ECLIPSES,
    title: L('Total solar eclipse', '日全食', 'Eclipse solar total', 'Eclipse solar total'),
    line: L('Total in southern Spain, North Africa, Saudi Arabia and Yemen; partial across much of Europe, Africa and the Middle East.', '西班牙南部、北非、沙特阿拉伯和也门可见全食；欧洲、非洲和中东大部分地区可见偏食。', 'Total en el sur de España, el norte de África, Arabia Saudí y Yemen; parcial en gran parte de Europa, África y Oriente Medio.', 'Total no sul da Espanha, no norte da África, na Arábia Saudita e no Iêmen; parcial em grande parte da Europa, da África e do Oriente Médio.') },
  { id: 'lunar-eclipse-2027-08', date: '2027-08-16', end: '2027-08-17', precision: 'day', kind: 'sky', fly: 'earth', source: NASA_ECLIPSES,
    title: L('Penumbral lunar eclipse', '半影月食', 'Eclipse lunar penumbral', 'Eclipse lunar penumbral'),
    line: L('August 16–17, 2027 (local date); seen from the Americas, Antarctica, West Africa, Australia and parts of Europe and Asia.', '2027 年 8 月 16–17 日（当地日期）；美洲、南极洲、西非、澳大利亚以及欧洲和亚洲部分地区可见。', '16–17 de agosto de 2027 (fecha local); visible desde América, la Antártida, África occidental, Australia y partes de Europa y Asia.', '16–17 de agosto de 2027 (data local); visível das Américas, Antártida, África Ocidental, Austrália e partes da Europa e da Ásia.') },
];
