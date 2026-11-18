// 🪐 Create your planet: an imaginary planet, bound by real science · 创造你的行星 · Crea tu planeta · Crie seu planeta
// Always labelled "Imaginary planet · made by you"; never part of the facts, the tours or the game. Stored per browser (one at a time).
// Every number comes from a formula below or from a NASA fact sheet value (sources in PM_SRC, opened 2026-11-17). Results say "about".
// 想象中的行星，但遵守真实科学；始终标注“想象的行星 · 由你创造”。所有数字来自下列公式或 NASA 资料（PM_SRC）。
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const PM_SRC = {
  factsheet: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',                    // distances, densities, gravity (planet table)
  earth: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html?level=1', // Bond albedo 0.294, black-body 254.0 K, average 288 K
  notes: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/fact_notes.html',        // black-body temperature = radiative equilibrium, no atmosphere, same albedo
  venus: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html',         // Bond albedo 0.77, black-body 226.6 K, average 737 K
  mars: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',           // Bond albedo 0.250, black-body 209.8 K, average ~214 K
  mercury: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html',     // Bond albedo 0.068
  jupiter: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html',     // Bond albedo 0.343
  neptune: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html',     // Bond albedo 0.290
  hz: 'https://ui.adsabs.harvard.edu/abs/2013ApJ...765..131K/abstract',            // Kopparapu et al. 2013: Solar System HZ 0.99–1.70 AU
  hzNasa: 'https://science.nasa.gov/exoplanets/what-is-the-habitable-zone-or-goldilocks-zone',
  kepler: 'https://science.nasa.gov/solar-system/orbits-and-keplers-laws',         // p² = a³
  giant: 'https://science.nasa.gov/exoplanets/gas-giant/',                          // hot Jupiters; giants may form past the snow line
  types: 'https://science.nasa.gov/exoplanets/planet-types/',
  superEarth: 'https://science.nasa.gov/exoplanets/super-earth',                    // "up to 10 times its mass"
  marsFacts: 'https://science.nasa.gov/mars/facts/',                                // "too thin for liquid water to exist for long on the surface"
  mainBelt: 'https://pdssbn.astro.umd.edu/data_other/objclass.shtml',              // NASA PDS Small Bodies Node (JPL SSD classes): main belt 2.0 < a < 3.2 AU
  snow: 'https://ar5iv.labs.arxiv.org/html/astro-ph/0602217',                       // Lecar et al. 2006: asteroid belt suggests the snow line near 2.7 AU
  asteroids: 'https://science.nasa.gov/solar-system/asteroids/facts',               // most asteroids orbit between Mars and Jupiter
  kuiper: 'https://science.nasa.gov/solar-system/kuiper-belt/facts/',               // ~30 AU (Neptune) to ~50 AU
  milkyway: 'https://science.nasa.gov/resource/the-milky-way-galaxy/',              // the Sun lies near the Orion Arm (Orion Spur)
};
// NASA fact sheet values · NASA 资料数值
const EARTH_BB = 254.0, EARTH_ALBEDO = 0.294, EARTH_DENSITY = 5514, EARTH_G = 9.8;
const MERCURY_AU = 57.9 / 149.6;
export const MAIN_BELT = [2.0, 3.2];
export const HZ = [0.99, 1.70], SNOW_AU = 2.7, KUIPER = [30, 50];
// Planet families: density (kg/m³) and radius range (Earth radii) · 行星类型
export const KINDS = {
  rocky: { density: 5514, min: 0.3, max: 2, def: 1, like: ['mercury', 'venus', 'earth', 'mars'] },     // Earth's density
  ice: { density: 1638, min: 3, max: 5, def: 3.9, like: ['uranus', 'neptune'], albedo: 0.29 },         // Neptune's density and albedo
  gas: { density: 1326, min: 6, max: 12, def: 11, like: ['jupiter', 'saturn'], albedo: 0.343 },       // Jupiter's density and albedo
};
// Air on a rocky planet: Bond albedo and greenhouse factor (average ÷ black-body temperature of the real planet with that air).
// A factor (not a fixed number of degrees) keeps the same greenhouse strength at any distance, so far from the Sun it stays cold.
// 大气：反照率与温室系数（真实行星平均温度 ÷ 黑体温度），按比例而非固定度数
export const ATMOS = {
  none: { albedo: 0.068, warm: 1 },               // like Mercury: bare rock
  thin: { albedo: 0.25, warm: 214 / 209.8 },      // like Mars: ~214 K / 209.8 K
  earth: { albedo: 0.294, warm: 288 / 254.0 },    // like Earth: 288 K / 254.0 K
  thick: { albedo: 0.77, warm: 737 / 226.6 },     // like Venus: 737 K / 226.6 K
};
export const PM_COLORS = ['#c9a27a', '#7fb2e6', '#d98a5b', '#9fd3a8', '#c7b7ef', '#e8d38a'];
export const PM_MAX_NAME = 30;

export const PM_UI = {
  button: L('🪐 Create your planet', '🪐 创造你的行星', '🪐 Crea tu planeta', '🪐 Crie seu planeta'),
  title: L('Create your planet', '创造你的行星', 'Crea tu planeta', 'Crie seu planeta'),
  badge: L('Imaginary planet · made by you', '想象的行星 · 由你创造', 'Planeta imaginario · hecho por ti', 'Planeta imaginário · feito por você'),
  intro: L('Make up a planet for our Solar System. Your choices are free, but the results follow real science.', '为太阳系想象一颗行星。选择由你决定，但结果遵循真实科学。', 'Inventa un planeta para nuestro sistema solar. Eliges libremente, pero los resultados siguen la ciencia real.', 'Invente um planeta para o nosso Sistema Solar. Você escolhe à vontade, mas os resultados seguem a ciência real.'),
  steps: [L('Where', '位置', 'Dónde', 'Onde'), L('What', '类型', 'Qué', 'O quê'), L('Air', '大气', 'Aire', 'Ar'), L('Look', '外观', 'Aspecto', 'Visual')],
  dist: L('Distance from the Sun', '离太阳的距离', 'Distancia al Sol', 'Distância do Sol'),
  au: L('{n} AU (Earth = 1)', '{n} 天文单位（地球 = 1）', '{n} UA (Tierra = 1)', '{n} UA (Terra = 1)'),
  kind: L('Kind of planet', '行星类型', 'Tipo de planeta', 'Tipo de planeta'),
  kinds: { rocky: L('Rocky', '岩石行星', 'Rocoso', 'Rochoso'), ice: L('Ice giant', '冰巨星', 'Gigante de hielo', 'Gigante de gelo'), gas: L('Gas giant', '气态巨行星', 'Gigante gaseoso', 'Gigante gasoso') },
  size: L('Size', '大小', 'Tamaño', 'Tamanho'),
  radius: L('{n} × Earth’s width', '地球宽度的 {n} 倍', '{n} × el ancho de la Tierra', '{n} × a largura da Terra'),
  air: L('Atmosphere', '大气', 'Atmósfera', 'Atmosfera'),
  airs: { none: L('None (like Mercury)', '没有（像水星）', 'Ninguna (como Mercurio)', 'Nenhuma (como Mercúrio)'), thin: L('Thin (like Mars)', '稀薄（像火星）', 'Fina (como Marte)', 'Fina (como Marte)'), earth: L('Like Earth’s', '像地球', 'Como la de la Tierra', 'Como a da Terra'), thick: L('Thick CO₂ (like Venus)', '浓厚二氧化碳（像金星）', 'Densa de CO₂ (como Venus)', 'Densa de CO₂ (como Vênus)') },
  airGiant: L('Giants are wrapped in deep hydrogen and helium: there is no solid ground.', '巨行星被厚厚的氢和氦包裹：没有固体地面。', 'Los gigantes están envueltos en hidrógeno y helio: no hay suelo sólido.', 'Os gigantes são envoltos em hidrogênio e hélio: não há chão sólido.'),
  moons: L('Moons', '卫星', 'Lunas', 'Luas'), rings: L('Rings', '光环', 'Anillos', 'Anéis'), color: L('Colour', '颜色', 'Color', 'Cor'),
  name: L('Name (optional)', '名称（可选）', 'Nombre (opcional)', 'Nome (opcional)'),
  namePh: L('My planet', '我的行星', 'Mi planeta', 'Meu planeta'),
  back: L('‹ Back', '‹ 上一步', '‹ Atrás', '‹ Voltar'), next: L('Next ›', '下一步 ›', 'Siguiente ›', 'Próximo ›'),
  add: L('✓ Add to the Solar System', '✓ 加入太阳系', '✓ Añadir al sistema solar', '✓ Adicionar ao Sistema Solar'),
  update: L('✓ Update my planet', '✓ 更新我的行星', '✓ Actualizar mi planeta', '✓ Atualizar meu planeta'),
  edit: L('✎ Change it', '✎ 修改', '✎ Cambiarlo', '✎ Mudar'), remove: L('🗑 Remove it', '🗑 移除', '🗑 Quitarlo', '🗑 Remover'),
  show: L('👁 Show it', '👁 查看', '👁 Verlo', '👁 Ver'), close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  added: L('Your planet now orbits the Sun (dashed orbit)', '你的行星正在绕太阳运行（虚线轨道）', 'Tu planeta ya gira alrededor del Sol (órbita discontinua)', 'Seu planeta já gira em torno do Sol (órbita tracejada)'),
  removed: L('Your planet was removed', '你的行星已移除', 'Tu planeta se quitó', 'Seu planeta foi removido'),
  result: L('What your planet would be like', '你的行星会是什么样', 'Cómo sería tu planeta', 'Como seria o seu planeta'),
  temp: L('Temperature', '温度', 'Temperatura', 'Temperatura'),
  tempSurf: L('about {t} °C on the surface', '地表约 {t} °C', 'unos {t} °C en la superficie', 'cerca de {t} °C na superfície'),
  tempGiant: L('about {t} °C from sunlight alone', '仅靠阳光约 {t} °C', 'unos {t} °C solo por la luz del Sol', 'cerca de {t} °C só com a luz do Sol'),
  gravity: L('Gravity', '重力', 'Gravedad', 'Gravidade'),
  gEarth: L('about {g} × Earth’s', '约为地球的 {g} 倍', 'unas {g} × la de la Tierra', 'cerca de {g} × a da Terra'),
  gCloud: L('about {g} × Earth’s (at the cloud tops)', '约为地球的 {g} 倍（云顶）', 'unas {g} × la de la Tierra (en las nubes)', 'cerca de {g} × a da Terra (no topo das nuvens)'),
  year: L('One year', '一年', 'Un año', 'Um ano'),
  days: L('about {n} Earth days', '约 {n} 个地球日', 'unos {n} días terrestres', 'cerca de {n} dias terrestres'),
  years: L('about {n} Earth years', '约 {n} 个地球年', 'unos {n} años terrestres', 'cerca de {n} anos terrestres'),
  water: L('Liquid water?', '液态水？', '¿Agua líquida?', 'Água líquida?'),
  wYes: L('Possible: the surface is between 0 and 100 °C', '有可能：地表温度在 0 到 100 °C 之间', 'Posible: la superficie está entre 0 y 100 °C', 'Possível: a superfície está entre 0 e 100 °C'),
  wFrozen: L('No: it would be frozen', '不会：水会结冰', 'No: estaría congelada', 'Não: estaria congelada'),
  wBoil: L('No: it would boil away', '不会：水会沸腾蒸发', 'No: se evaporaría', 'Não: ferveria e sumiria'),
  wThin: L('No: air this thin can’t keep water liquid for long (like on Mars)', '不会：这么稀薄的大气无法让水长期保持液态（像火星一样）', 'No: un aire tan fino no mantiene el agua líquida por mucho tiempo (como en Marte)', 'Não: um ar tão fino não mantém a água líquida por muito tempo (como em Marte)'),
  wNoAir: L('No: without air, water can’t stay liquid on the surface', '不会：没有大气，地表无法保持液态水', 'No: sin aire, el agua no puede seguir líquida en la superficie', 'Não: sem ar, a água não fica líquida na superfície'),
  wGiant: L('No surface to hold it', '没有可以承载水的地表', 'No hay superficie que la sostenga', 'Não há superfície para segurá-la'),
  like: L('Most like', '最像', 'Se parece más a', 'Mais parecido com'),
  sources: L('Sources', '来源', 'Fuentes', 'Fontes'),
  how: L('How we work it out', '计算方法', 'Cómo lo calculamos', 'Como calculamos'),
  howText: L('Temperature: NASA’s black-body temperature for Earth (254 K), scaled by distance and how much light the planet reflects, times the greenhouse warming of a real planet with that air (Mars, Earth or Venus). Year: Kepler’s third law (p² = a³). Gravity: density × size (density of the most similar real planet).',
    '温度：以 NASA 给出的地球黑体温度（254 K）为基准，按距离和反射率换算，再乘以具有类似大气的真实行星（火星、地球或金星）的温室增温系数。一年：开普勒第三定律（p² = a³）。重力：密度 × 大小（采用最相似真实行星的密度）。',
    'Temperatura: la temperatura de cuerpo negro de la Tierra según la NASA (254 K), ajustada por la distancia y la luz que refleja el planeta, multiplicada por el efecto invernadero de un planeta real con ese aire (Marte, la Tierra o Venus). Año: tercera ley de Kepler (p² = a³). Gravedad: densidad × tamaño (densidad del planeta real más parecido).',
    'Temperatura: a temperatura de corpo negro da Terra segundo a NASA (254 K), ajustada pela distância e pela luz que o planeta reflete, multiplicada pelo efeito estufa de um planeta real com esse ar (Marte, Terra ou Vênus). Ano: terceira lei de Kepler (p² = a³). Gravidade: densidade × tamanho (densidade do planeta real mais parecido).'),
  quiz: L('Quick question', '小问题', 'Pregunta rápida', 'Pergunta rápida'),
  right: L('Right!', '答对了！', '¡Correcto!', 'Isso mesmo!'), wrong: L('Not quite.', '不太对。', 'No exactamente.', 'Não exatamente.'),
  age: L('Its calendar', '它的日历', 'Su calendario', 'O calendário dele'),
  ageDay: L('day {d} of its {y}-day year', '它 {y} 天一年中的第 {d} 天', 'día {d} de su año de {y} días', 'dia {d} do seu ano de {y} dias'),
  ageYears: L('{n} of its years old', '已经 {n} 岁（按它的年）', '{n} años suyos', '{n} anos dele'),
  ageFast: L('Sped up: one of its years passes every 7 of your days.', '加速显示：你的每 7 天，它过完一年。', 'Acelerado: cada 7 de tus días pasa uno de sus años.', 'Acelerado: a cada 7 dias seus passa um ano dele.'),
  ageReal: L('Real time: its year really is this short.', '真实时间：它的一年确实这么短。', 'Tiempo real: su año de verdad es así de corto.', 'Tempo real: o ano dele é mesmo curto assim.'),
  ageNext: L('Next birthday in {n} of your days', '{n} 天后过下一个生日', 'Próximo cumpleaños en {n} de tus días', 'Próximo aniversário em {n} dias seus'),
  birthday: L('🎂 Your planet just finished year {n}!', '🎂 你的行星刚过完第 {n} 年！', '🎂 ¡Tu planeta acaba de cumplir su año {n}!', '🎂 Seu planeta acaba de completar o ano {n}!'),
  vrRow: L('🪐 Your planet', '🪐 你的行星', '🪐 Tu planeta', '🪐 Seu planeta'),
  vrPick: L('Pick a planet to add', '选择要加入的行星', 'Elige un planeta para añadir', 'Escolha um planeta para adicionar'),
  presets: {
    ocean: L('Ocean world at 1.1 AU', '1.1 天文单位处的海洋世界', 'Mundo oceánico a 1,1 UA', 'Mundo oceânico a 1,1 UA'),
    hot: L('Hot giant at 0.2 AU', '0.2 天文单位处的炽热巨行星', 'Gigante caliente a 0,2 UA', 'Gigante quente a 0,2 UA'),
    ice: L('Icy world at 40 AU', '40 天文单位处的冰冻世界', 'Mundo helado a 40 UA', 'Mundo gelado a 40 UA'),
  },
};
// Plain-words notes for a choice · 选择对应的提示
export const PM_NOTES = {
  hzIn: [L('Inside the Sun’s habitable zone (about 0.99–1.70 AU), where liquid water is possible. Near the outer edge it needs a very strong CO₂ greenhouse to stay liquid.', '位于太阳的宜居带内（约 0.99–1.70 天文单位），液态水有可能存在。靠近外缘时，需要非常强的二氧化碳温室效应才能保持液态。', 'Dentro de la zona habitable del Sol (unas 0,99–1,70 UA), donde el agua líquida es posible. Cerca del borde exterior necesita un efecto invernadero de CO₂ muy fuerte para seguir líquida.', 'Dentro da zona habitável do Sol (cerca de 0,99–1,70 UA), onde a água líquida é possível. Perto da borda externa ela precisa de um efeito estufa de CO₂ muito forte para ficar líquida.'), 'hz'],
  hzEdge: [L('With this air your planet is still too cold: here, only a much stronger greenhouse would keep water liquid.', '有这样的大气，你的行星仍然太冷：在这里，只有强得多的温室效应才能让水保持液态。', 'Con este aire tu planeta sigue demasiado frío: aquí solo un efecto invernadero mucho más fuerte mantendría el agua líquida.', 'Com esse ar seu planeta continua frio demais: aqui só um efeito estufa muito mais forte manteria a água líquida.'), 'hz'],
  hzHot: [L('Closer than the habitable zone (starts about 0.99 AU): too hot for oceans to last.', '比宜居带更近（约从 0.99 天文单位开始）：太热，海洋无法长期存在。', 'Más cerca que la zona habitable (empieza en unas 0,99 UA): demasiado calor para que duren los océanos.', 'Mais perto que a zona habitável (começa em cerca de 0,99 UA): quente demais para oceanos durarem.'), 'hz'],
  hzCold: [L('Farther than the habitable zone (ends about 1.70 AU): too cold for surface oceans.', '比宜居带更远（约在 1.70 天文单位结束）：太冷，地表难有海洋。', 'Más lejos que la zona habitable (termina en unas 1,70 UA): demasiado frío para océanos en la superficie.', 'Mais longe que a zona habitável (termina em cerca de 1,70 UA): frio demais para oceanos na superfície.'), 'hz'],
  inMercury: [L('Closer to the Sun than Mercury.', '比水星离太阳更近。', 'Más cerca del Sol que Mercurio.', 'Mais perto do Sol que Mercúrio.'), 'factsheet'],
  hotJupiter: [L('A giant this close is like the “hot Jupiters” found around other stars; the closest of them orbit so near that they reach thousands of degrees.', '这么近的巨行星就像在其他恒星周围发现的“热木星”；其中离得最近的温度可达数千度。', 'Un gigante tan cerca se parece a los “Júpiter calientes” de otras estrellas; los más cercanos alcanzan miles de grados.', 'Um gigante tão perto lembra os “Júpiteres quentes” de outras estrelas; os mais próximos chegam a milhares de graus.'), 'giant'],
  giantInside: [L('Giant planets are thought to form beyond the snow line (near 2.7 AU in the young Solar System), so yours may have formed farther out and moved in.', '巨行星被认为形成于雪线之外（太阳系早期约 2.7 天文单位），所以你的行星可能是在更远处形成后移进来的。', 'Se cree que los gigantes se forman más allá de la línea de nieve (cerca de 2,7 UA en el sistema solar joven); el tuyo pudo formarse más lejos y acercarse.', 'Acredita-se que gigantes se formam além da linha de neve (perto de 2,7 UA no Sistema Solar jovem); o seu pode ter se formado mais longe e se aproximado.'), 'snow'],
  icyRock: [L('Beyond the snow line (near 2.7 AU), water froze into ice: a small planet here would be rich in ice.', '在雪线之外（约 2.7 天文单位），水会冻成冰：这里的小行星会富含冰。', 'Más allá de la línea de nieve (cerca de 2,7 UA) el agua se congelaba: un planeta pequeño aquí tendría mucho hielo.', 'Além da linha de neve (perto de 2,7 UA) a água congelava: um planeta pequeno aqui teria muito gelo.'), 'snow'],
  belt: [L('In the main asteroid belt (about 2.0–3.2 AU, between Mars and Jupiter), where most asteroids orbit.', '位于主小行星带（约 2.0–3.2 天文单位，火星和木星之间），大多数小行星在这里运行。', 'En el cinturón principal de asteroides (unas 2,0–3,2 UA, entre Marte y Júpiter), donde orbita la mayoría de los asteroides.', 'No cinturão principal de asteroides (cerca de 2,0–3,2 UA, entre Marte e Júpiter), onde orbita a maioria dos asteroides.'), 'mainBelt'],
  kuiper: [L('In the Kuiper Belt (about 30–50 AU), a ring of icy bodies beyond Neptune.', '位于柯伊伯带（约 30–50 天文单位），海王星外的冰质天体环带。', 'En el cinturón de Kuiper (unas 30–50 UA), un anillo de cuerpos helados más allá de Neptuno.', 'No Cinturão de Kuiper (cerca de 30–50 UA), um anel de corpos gelados além de Netuno.'), 'kuiper'],
  superEarth: [L('A “super-Earth”: heavier than Earth, up to about 10 times its mass. A kind of planet found around other stars.', '“超级地球”：比地球重，质量最多约为地球的 10 倍。这是在其他恒星周围发现的一类行星。', 'Una “supertierra”: más pesada que la Tierra, hasta unas 10 veces su masa. Un tipo de planeta hallado en otras estrellas.', 'Uma “superterra”: mais pesada que a Terra, até cerca de 10 vezes sua massa. Um tipo de planeta encontrado em outras estrelas.'), 'superEarth'],
  venusLike: [L('Thick CO₂ traps heat: that is why Venus, with this kind of air, is hotter than Mercury.', '浓厚的二氧化碳会锁住热量：所以拥有这种大气的金星比水星还热。', 'El CO₂ denso atrapa el calor: por eso Venus, con este aire, es más caliente que Mercurio.', 'O CO₂ denso retém calor: por isso Vênus, com esse ar, é mais quente que Mercúrio.'), 'venus'],
};
// Small science questions on the way (answer explained, with the source) · 途中的小问题
export const PM_QUIZ = [
  { q: L('Which galaxy is the Solar System in?', '太阳系在哪个星系里？', '¿En qué galaxia está el sistema solar?', 'Em qual galáxia está o Sistema Solar?'),
    a: [L('The Milky Way', '银河系', 'La Vía Láctea', 'A Via Láctea'), L('Andromeda', '仙女座星系', 'Andrómeda', 'Andrômeda'), L('The Large Magellanic Cloud', '大麦哲伦云', 'La Gran Nube de Magallanes', 'A Grande Nuvem de Magalhães')], ok: 0,
    why: L('The Milky Way. The Sun lies near a small, partial arm called the Orion Arm (or Orion Spur), between the Sagittarius and Perseus arms.', '银河系。太阳位于一条较小的不完整旋臂——猎户臂（猎户支臂）附近，介于人马臂和英仙臂之间。', 'La Vía Láctea. El Sol está cerca de un brazo pequeño y parcial llamado brazo de Orión, entre los brazos de Sagitario y Perseo.', 'A Via Láctea. O Sol fica perto de um braço pequeno e parcial chamado Braço de Órion, entre os braços de Sagitário e Perseu.'), src: 'milkyway' },
  { q: L('What is the habitable zone?', '什么是宜居带？', '¿Qué es la zona habitable?', 'O que é a zona habitável?'),
    a: [L('Where it is not too hot and not too cold for liquid water', '对液态水来说不太热也不太冷的区域', 'Donde no hace ni demasiado calor ni demasiado frío para el agua líquida', 'Onde não é quente nem frio demais para água líquida'), L('Where the air is breathable', '空气可以呼吸的区域', 'Donde el aire se puede respirar', 'Onde o ar é respirável'), L('Where planets spin the fastest', '行星自转最快的区域', 'Donde los planetas giran más rápido', 'Onde os planetas giram mais rápido')], ok: 0,
    why: L('It is the area around a star where it is not too hot and not too cold for liquid water on a planet’s surface. For the Sun: about 0.99 to 1.70 AU.', '它是恒星周围对行星表面的液态水来说不太热也不太冷的区域。太阳的宜居带约为 0.99 到 1.70 天文单位。', 'Es la zona alrededor de una estrella donde no hace ni demasiado calor ni demasiado frío para el agua líquida en la superficie. Para el Sol: unas 0,99 a 1,70 UA.', 'É a região ao redor de uma estrela onde não é quente nem frio demais para água líquida na superfície. Para o Sol: cerca de 0,99 a 1,70 UA.'), src: 'hzNasa' },
  { q: L('Why are the inner planets rocky and the outer ones giants?', '为什么内行星是岩石行星，外行星是巨行星？', '¿Por qué los planetas interiores son rocosos y los exteriores gigantes?', 'Por que os planetas internos são rochosos e os externos gigantes?'),
    a: [L('Giants are thought to grow beyond the “snow line”, where ice could form', '巨行星被认为在可以结冰的“雪线”之外长大', 'Se cree que los gigantes crecen más allá de la “línea de nieve”, donde se forma hielo', 'Acredita-se que gigantes crescem além da “linha de neve”, onde se forma gelo'), L('The Sun pushed all the gas inwards', '太阳把所有气体推向内侧', 'El Sol empujó todo el gas hacia dentro', 'O Sol empurrou todo o gás para dentro'), L('The outer planets are much younger', '外行星年轻得多', 'Los planetas exteriores son mucho más jóvenes', 'Os planetas externos são muito mais jovens')], ok: 0,
    why: L('One idea: gas giants develop farther from their star, past a boundary called the snow line. In the young Solar System it was near 2.7 AU, inside Jupiter’s orbit.', '一种观点：气态巨行星在离恒星更远、越过“雪线”的地方形成。太阳系早期的雪线约在 2.7 天文单位，位于木星轨道以内。', 'Una idea: los gigantes gaseosos se forman más lejos de su estrella, pasada una frontera llamada línea de nieve. En el sistema solar joven estaba cerca de 2,7 UA, dentro de la órbita de Júpiter.', 'Uma ideia: gigantes gasosos se formam mais longe da estrela, além de uma fronteira chamada linha de neve. No Sistema Solar jovem ela ficava perto de 2,7 UA, dentro da órbita de Júpiter.'), src: 'giant' },
];

const num = (x, lo, hi, d) => { const n = Number(x); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
const clean = s => String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, PM_MAX_NAME);
// Stored planets are untrusted: keep only the expected shape · 存储数据不可信
export function sanitizePlanet(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const kind = Object.hasOwn(KINDS, v.kind) ? v.kind : 'rocky', K = KINDS[kind];
  return { name: clean(v.name), au: num(v.au, 0.1, 60, 1.3), kind, r: num(v.r, K.min, K.max, K.def),
    atmo: Object.hasOwn(ATMOS, v.atmo) ? v.atmo : 'earth', moons: Math.round(num(v.moons, 0, 4, 1)), rings: !!v.rings,
    color: PM_COLORS.includes(v.color) ? v.color : PM_COLORS[1],
    ...(Number.isFinite(v.born) && v.born > BORN_MIN && v.born <= Date.now() + 6e4 ? { born: Math.round(v.born), seen: Math.round(num(v.seen, 0, 1e5, 0)) } : {}) };
}
// 🎂 Your planet ages (come-back-2): its own calendar runs from the day you made it. A year longer than 30 days is sped up so that one of
// its years passes every 7 of your days (said on screen); shorter years run in real time. Its year length is Kepler's (yearDays).
// 你的行星会长大：从创建之日起计时；超过 30 天的“年”会加速为每 7 天一年（会在屏幕上说明）
const BORN_MIN = Date.UTC(2026, 0, 1), DAY_MS = 864e5;
export const AGE_FAST_DAYS = 7, AGE_REAL_MAX = 30;   // years up to 30 days run in real time · 30 天以内的年按真实时间
export function planetAge(p, now = Date.now()) {
  if (!p?.born) return null;
  const yearLen = yearDays(p.au), fast = yearLen > AGE_REAL_MAX, realYear = fast ? AGE_FAST_DAYS : yearLen;   // real days per one of its years
  const elapsed = Math.max(0, now - p.born) / DAY_MS, years = Math.floor(elapsed / realYear), frac = elapsed / realYear - years;
  return { years, day: Math.min(Math.round(yearLen), Math.floor(frac * yearLen) + 1), yearLen: Math.round(yearLen), fast, nextIn: Math.max(1, Math.ceil((1 - frac) * realYear)) };
}
export const PM_PRESETS = {
  ocean: { kind: 'rocky', au: 1.1, r: 1.2, atmo: 'earth', moons: 1, rings: false, color: '#7fb2e6' },
  hot: { kind: 'gas', au: 0.2, r: 11, atmo: 'earth', moons: 0, rings: false, color: '#d98a5b' },
  ice: { kind: 'rocky', au: 40, r: 0.5, atmo: 'none', moons: 2, rings: false, color: '#c7b7ef' },
};
// Temperature from sunlight alone (K): NASA's 254 K for Earth scaled by 1/√distance and (1 − albedo)^¼ · 仅靠阳光的平衡温度
export const blackBody = (au, albedo) => EARTH_BB * Math.pow((1 - albedo) / (1 - EARTH_ALBEDO), 0.25) / Math.sqrt(au);
// Kepler's third law: p² = a³ (years, AU) · 开普勒第三定律
export const yearDays = au => 365.25 * Math.pow(au, 1.5);
// Surface gravity vs Earth = (density / Earth's) × (radius / Earth's) · 重力
// Giants: density between the two real planets of that kind, by size (NASA fact sheet: Saturn 687 at 9.45, Jupiter 1326 at 10.97;
// Neptune 1638 at 3.88, Uranus 1270 at 4.01 Earth radii) · 巨行星密度按大小在两颗真实行星之间插值
const lerpDensity = (r, r0, d0, r1, d1) => r <= r0 ? d0 : r >= r1 ? d1 : d0 + (d1 - d0) * (r - r0) / (r1 - r0);
export const densityOf = (kind, r) => kind === 'gas' ? lerpDensity(r, 9.45, 687, 10.97, 1326) : kind === 'ice' ? lerpDensity(r, 3.88, 1638, 4.01, 1270) : KINDS.rocky.density;
export const gravityVsEarth = (kind, r) => densityOf(kind, r) / EARTH_DENSITY * r;
export const massVsEarth = (kind, r) => densityOf(kind, r) / EARTH_DENSITY * r ** 3;
const round = (x, d = 0) => { const k = 10 ** d; return Math.round(x * k) / k; };
// Everything the result card and the notes need · 结果卡所需的全部内容
export function planetResult(p, real = []) {
  const K = KINDS[p.kind], giant = p.kind !== 'rocky', A = giant ? K.albedo : ATMOS[p.atmo].albedo;
  const tBB = blackBody(p.au, A), tK = tBB * (giant ? 1 : ATMOS[p.atmo].warm), tC = Math.round(tK - 273.15);
  const water = giant ? 'giant' : p.atmo === 'none' ? 'noAir' : p.atmo === 'thin' ? 'thin' : tC < 0 ? 'frozen' : tC > 100 ? 'boil' : 'yes';
  const notes = [];
  if (p.au < HZ[0]) notes.push('hzHot'); else if (p.au <= HZ[1]) notes.push('hzIn'); else notes.push('hzCold');
  if (p.au < MERCURY_AU) notes.push(giant ? 'hotJupiter' : 'inMercury');
  if (giant && p.au < SNOW_AU) notes.push('giantInside');
  if (!giant && p.au > SNOW_AU && p.r < 1.5) notes.push('icyRock');
  if (p.au > MAIN_BELT[0] && p.au < MAIN_BELT[1]) notes.push('belt');
  if (p.au >= KUIPER[0] && p.au <= KUIPER[1]) notes.push('kuiper');
  if (!giant && massVsEarth(p.kind, p.r) >= 2) notes.push('superEarth');
  if (p.au >= HZ[0] && p.au <= HZ[1] && !giant && water === 'frozen') notes.push('hzEdge');
  if (!giant && p.atmo === 'thick') notes.push('venusLike');
  // the most similar real planet: same family, closest in distance and size (log scale) · 最相似的真实行星
  let like = null, best = Infinity;
  for (const q of real) if (K.like.includes(q.id)) { const s = Math.abs(Math.log(p.au / q.au)) + Math.abs(Math.log(p.r / q.r)); if (s < best) { best = s; like = q.id; } }
  const days = yearDays(p.au);
  return { tC, giant, water, notes, like, gravity: round(gravityVsEarth(p.kind, p.r), 2), gravityMs: round(gravityVsEarth(p.kind, p.r) * EARTH_G, 1), mass: round(massVsEarth(p.kind, p.r), 1),
    days: Math.round(days), years: round(days / 365.25, days > 3650 ? 0 : 1), useDays: days < 730 };
}
