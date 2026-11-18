// ─────────────────────────────────────────────────────────────────────────────
// 🎂 Your birthday star · 你的生日星 · Tu estrella de cumpleaños · Sua estrela de aniversário
// Light takes time to travel: a star 26 light-years away is seen with light that left it 26 years ago.
// Give your birth year and CosmoVerse finds the star whose light left it about when you were born
// (its distance in light-years ≈ your age), plus the next star whose light you will "catch up with".
// Pure data + logic (no DOM, no three.js), so it is tested in node. 纯数据与逻辑，可在 node 中测试。
// Every distance comes from the page in `src` (NASA, ESA or ESO), opened 2026-11-18; `also` backs the fact line.
// ─────────────────────────────────────────────────────────────────────────────
const L = (en, zh, es, pt) => ({ en, zh, es, pt });

const HIP = 'https://www.cosmos.esa.int/web/hipparcos/brightest';   // ESA Hipparcos: the 50 brightest stars, distances in light-years
const BRIGHT = L('One of the 50 brightest stars in our night sky.', '我们夜空中最亮的 50 颗恒星之一。', 'Una de las 50 estrellas más brillantes de nuestro cielo nocturno.', 'Uma das 50 estrelas mais brilhantes do nosso céu noturno.');

// Nearest first. ly = light-years (as the source states it, rounded); planets = known planets around it.
export const BS_STARS = [
  { id: 'proxima', ly: 4.2, planets: true, color: '#ff9a6b', names: L('Proxima Centauri', '比邻星', 'Próxima Centauri', 'Próxima Centauri'),
    fact: L('The nearest star to the Sun. Its planet, Proxima b, is the closest known exoplanet.', '离太阳最近的恒星。它的行星比邻星 b 是已知最近的系外行星。', 'La estrella más cercana al Sol. Su planeta, Próxima b, es el exoplaneta conocido más cercano.', 'A estrela mais próxima do Sol. Seu planeta, Próxima b, é o exoplaneta conhecido mais próximo.'),
    src: 'https://science.nasa.gov/exoplanets/immersive/exoplanet-travel-bureau/proxima-centauri-b/' },
  { id: 'alpha-cen', ly: 4.4, planets: false, color: '#fff1c9', names: L('Alpha Centauri', '南门二（半人马座α）', 'Alfa Centauri', 'Alfa Centauri'), fact: BRIGHT, src: HIP },
  { id: 'barnard', ly: 6, planets: true, color: '#ff8a5c', names: L('Barnard’s Star', '巴纳德星', 'Estrella de Barnard', 'Estrela de Barnard'),
    fact: L('The closest single star to the Sun, with four small planets.', '离太阳最近的单颗恒星，有四颗较小的行星。', 'La estrella individual más cercana al Sol, con cuatro planetas pequeños.', 'A estrela isolada mais próxima do Sol, com quatro planetas pequenos.'),
    src: 'https://www.eso.org/public/news/eso2414/', also: 'https://science.nasa.gov/universe/exoplanets/discovery-alert-four-little-planets-one-big-step/' },
  { id: 'sirius', ly: 8.6, planets: false, color: '#cfe0ff', names: L('Sirius', '天狼星', 'Sirio', 'Sírius'),
    fact: L('The brightest star in our night sky, with a tiny white-dwarf companion.', '夜空中最亮的恒星，还有一颗小小的白矮星伴星。', 'La estrella más brillante de nuestro cielo nocturno, con una diminuta compañera enana blanca.', 'A estrela mais brilhante do nosso céu noturno, com uma minúscula companheira anã branca.'),
    src: 'https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/' },
  { id: 'eps-eri', ly: 10.5, planets: true, color: '#ffd6a0', names: L('Epsilon Eridani', '天苑四（波江座ε）', 'Épsilon Eridani', 'Épsilon Eridani'),
    fact: L('A young star, about 800 million years old, with a giant planet.', '一颗年轻的恒星，约 8 亿岁，有一颗巨行星。', 'Una estrella joven, de unos 800 millones de años, con un planeta gigante.', 'Uma estrela jovem, com cerca de 800 milhões de anos, com um planeta gigante.'),
    src: 'https://science.nasa.gov/missions/hubble/hubble-observations-confirm-that-planets-form-from-disks-around-stars/' },
  { id: 'ross128', ly: 11, planets: true, color: '#ff8f66', names: L('Ross 128', '罗斯 128', 'Ross 128', 'Ross 128'),
    fact: L('A quiet red dwarf with Ross 128 b, a temperate planet about Earth’s mass.', '一颗安静的红矮星，拥有温和的行星罗斯 128 b，质量约与地球相当。', 'Una enana roja tranquila con Ross 128 b, un planeta templado de masa parecida a la de la Tierra.', 'Uma anã vermelha tranquila com Ross 128 b, um planeta temperado com massa parecida com a da Terra.'),
    src: 'https://www.eso.org/public/news/eso1736/' },
  { id: 'procyon', ly: 11.4, planets: false, color: '#fff6dc', names: L('Procyon', '南河三', 'Proción', 'Prócion'), fact: BRIGHT, src: HIP },
  { id: 'tau-ceti', ly: 11.9, planets: false, color: '#ffe8b8', names: L('Tau Ceti', '天仓五（鲸鱼座τ）', 'Tau Ceti', 'Tau Ceti'),
    fact: L('One of the nearest Sun-like stars, and a key place in the story “Project Hail Mary”.', '离我们最近的类太阳恒星之一，也是故事《挽救计划》中的关键地点。', 'Una de las estrellas parecidas al Sol más cercanas y un lugar clave de la historia «Proyecto Hail Mary».', 'Uma das estrelas parecidas com o Sol mais próximas e um lugar-chave da história “Projeto Hail Mary”.'),
    src: 'https://science.nasa.gov/exoplanets/target-star-catalog/', also: 'https://science.nasa.gov/the-science-behind-project-hail-mary/' },
  { id: 'gj876', ly: 15, planets: true, color: '#ff8a5c', names: L('Gliese 876', '格利泽 876', 'Gliese 876', 'Gliese 876'),
    fact: L('A red dwarf with giant planets, too faint to see without a telescope.', '一颗拥有巨行星的红矮星，不用望远镜看不到。', 'Una enana roja con planetas gigantes, demasiado débil para verla sin telescopio.', 'Uma anã vermelha com planetas gigantes, fraca demais para ver sem telescópio.'),
    src: 'https://science.nasa.gov/asset/hubble/giant-world-orbiting-red-dwarf-star-gliese-876/' },
  { id: 'altair', ly: 16.8, planets: false, color: '#f2f6ff', names: L('Altair', '牛郎星（河鼓二）', 'Altair', 'Altair'),
    fact: L('It spins so fast that it is flattened into an oval.', '它自转得太快，被压成了椭圆形。', 'Gira tan rápido que está achatada en forma de óvalo.', 'Gira tão rápido que ficou achatada em forma oval.'),
    src: HIP, also: 'https://science.nasa.gov/resource/whats-up-september-2021/' },
  { id: 'gl581', ly: 20.5, planets: true, color: '#ff9468', names: L('Gliese 581', '格利泽 581', 'Gliese 581', 'Gliese 581'),
    fact: L('A red dwarf with several planets, one of the 100 closest stars to us.', '一颗有多颗行星的红矮星，是离我们最近的 100 颗恒星之一。', 'Una enana roja con varios planetas, una de las 100 estrellas más cercanas.', 'Uma anã vermelha com vários planetas, uma das 100 estrelas mais próximas.'),
    src: 'https://www.eso.org/public/news/eso0722/' },
  { id: 'hd219134', ly: 21, planets: true, color: '#ffc98a', names: L('HD 219134', 'HD 219134', 'HD 219134', 'HD 219134'),
    fact: L('Its planet HD 219134 b is rocky and passes in front of its star.', '它的行星 HD 219134 b 是岩质行星，会从恒星前方经过。', 'Su planeta HD 219134 b es rocoso y pasa por delante de su estrella.', 'Seu planeta HD 219134 b é rochoso e passa na frente da sua estrela.'),
    src: 'https://www.nasa.gov/news-release/nasas-spitzer-confirms-closest-rocky-exoplanet/' },
  { id: 'vega', ly: 25.3, planets: false, color: '#dfe9ff', names: L('Vega', '织女星', 'Vega', 'Vega'),
    fact: L('About 30 times brighter than the Sun.', '亮度约为太阳的 30 倍。', 'Unas 30 veces más brillante que el Sol.', 'Cerca de 30 vezes mais brilhante que o Sol.'),
    src: HIP, also: 'https://science.nasa.gov/image-article/apod-2015-june-27-stars-of-a-summer-triangle/' },
  { id: 'gj486', ly: 26, planets: true, color: '#ff8d63', names: L('GJ 486', 'GJ 486', 'GJ 486', 'GJ 486'),
    fact: L('Webb found hints of water vapour around its rocky planet.', '韦布望远镜在它的岩质行星周围发现了水蒸气的迹象。', 'Webb encontró indicios de vapor de agua en torno a su planeta rocoso.', 'O Webb encontrou indícios de vapor de água em torno do seu planeta rochoso.'),
    src: 'https://science.nasa.gov/missions/webb/webb-finds-water-vapor-but-from-a-rocky-planet-or-its-star/' },
  { id: 'gj357', ly: 31, planets: true, color: '#ff9a6b', names: L('GJ 357', 'GJ 357', 'GJ 357', 'GJ 357'),
    fact: L('One of its three planets orbits in the zone where liquid water could exist.', '它的三颗行星之一位于可能存在液态水的区域。', 'Uno de sus tres planetas orbita en la zona donde podría existir agua líquida.', 'Um dos seus três planetas orbita na zona onde poderia existir água líquida.'),
    src: 'https://science.nasa.gov/universe/exoplanets/confirmation-of-toasty-tess-planet-leads-to-surprising-find-of-promising-world/' },
  { id: 'aumic', ly: 32, planets: true, color: '#ff8257', names: L('AU Microscopii', '显微镜座 AU', 'AU Microscopii', 'AU Microscopii'),
    fact: L('One of the youngest planetary systems ever observed.', '已观测到的最年轻的行星系统之一。', 'Uno de los sistemas planetarios más jóvenes jamás observados.', 'Um dos sistemas planetários mais jovens já observados.'),
    src: 'https://science.nasa.gov/missions/hubble/hubble-sees-evaporating-planet-getting-the-hiccups/' },
  { id: 'pollux', ly: 34, planets: true, color: '#ffc27a', names: L('Pollux', '北河三', 'Pólux', 'Pólux'),
    fact: L('A bright star with a planet more than twice Jupiter’s mass.', '一颗明亮的恒星，有一颗质量超过木星两倍的行星。', 'Una estrella brillante con un planeta de más del doble de la masa de Júpiter.', 'Uma estrela brilhante com um planeta de mais do dobro da massa de Júpiter.'),
    src: HIP, also: 'https://science.nasa.gov/solar-system/skywatching/night-sky-network/gemini-constellation/' },
  { id: 'l9859', ly: 35, planets: true, color: '#ff9468', names: L('L 98-59', 'L 98-59', 'L 98-59', 'L 98-59'),
    fact: L('Four rocky planets; one may be an ocean world.', '四颗岩质行星，其中一颗可能是海洋世界。', 'Cuatro planetas rocosos; uno podría ser un mundo oceánico.', 'Quatro planetas rochosos; um pode ser um mundo oceânico.'),
    src: 'https://www.eso.org/public/images/eso2112b/' },
  { id: 'arcturus', ly: 37, planets: false, color: '#ffbf7a', names: L('Arcturus', '大角星', 'Arturo', 'Arcturus'),
    fact: L('The brightest star in the northern sky.', '北天最亮的恒星。', 'La estrella más brillante del cielo del norte.', 'A estrela mais brilhante do céu do norte.'),
    src: HIP, also: 'https://science.nasa.gov/resource/whats-up-september-2021/' },
  { id: 'trappist1', ly: 40, planets: true, color: '#ff7a52', names: L('TRAPPIST-1', 'TRAPPIST-1', 'TRAPPIST-1', 'TRAPPIST-1'),
    fact: L('Seven rocky planets, watched closely by the Webb telescope.', '七颗岩质行星，韦布望远镜正在仔细观测。', 'Siete planetas rocosos, observados de cerca por el telescopio Webb.', 'Sete planetas rochosos, observados de perto pelo telescópio Webb.'),
    src: 'https://science.nasa.gov/asset/webb/trappist-1-planetary-system-illustration/' },
  { id: '55cnc', ly: 41, planets: true, color: '#ffd59a', names: L('55 Cancri', '巨蟹座 55', '55 Cancri', '55 Cancri'),
    fact: L('Home of 55 Cancri e, a planet covered in an ocean of lava.', '巨蟹座 55 e 的家，那颗行星覆盖着熔岩海洋。', 'Hogar de 55 Cancri e, un planeta cubierto por un océano de lava.', 'Lar de 55 Cancri e, um planeta coberto por um oceano de lava.'),
    src: 'https://science.nasa.gov/resource/55-cancri-e-skies-sparkle-above-a-never-ending-ocean-of-lava/' },
  { id: 'capella', ly: 42, planets: false, color: '#ffe6a8', names: L('Capella', '五车二', 'Capella', 'Capela'), fact: BRIGHT, src: HIP },
  { id: 'upsand', ly: 44, planets: true, color: '#fff0cc', names: L('Upsilon Andromedae', '仙女座 υ', 'Ípsilon Andromedae', 'Ípsilon Andromedae'),
    fact: L('Three Jupiter-type planets orbit this Sun-like star.', '三颗类木行星绕着这颗类太阳恒星运行。', 'Tres planetas como Júpiter orbitan esta estrella parecida al Sol.', 'Três planetas do tipo de Júpiter orbitam esta estrela parecida com o Sol.'),
    src: 'https://science.nasa.gov/missions/hubble/out-of-whack-planetary-system-offers-clues-to-a-disturbed-past/' },
  { id: 'gj1214', ly: 48, planets: true, color: '#ff8d63', names: L('GJ 1214', 'GJ 1214', 'GJ 1214', 'GJ 1214'),
    fact: L('Its planet is a steamy “mini-Neptune” studied by Webb.', '它的行星是一颗被韦布研究的蒸汽弥漫的“迷你海王星”。', 'Su planeta es un “mini-Neptuno” lleno de vapor estudiado por Webb.', 'Seu planeta é um “mini-Netuno” cheio de vapor estudado pelo Webb.'),
    src: 'https://science.nasa.gov/missions/webb/nasas-james-webb-space-telescope-primed-to-lift-the-haze-surrounding-sub-neptunes/', also: 'https://www.jpl.nasa.gov/news/nasas-webb-takes-closest-look-yet-at-mysterious-planet/' },
  { id: '51peg', ly: 50, planets: true, color: '#fff0cc', names: L('51 Pegasi', '飞马座 51', '51 Pegasi', '51 Pegasi'),
    fact: L('The first planet found around a star like the Sun, in 1995.', '1995 年，人类在这颗类太阳恒星周围发现了第一颗行星。', 'El primer planeta descubierto alrededor de una estrella como el Sol, en 1995.', 'O primeiro planeta descoberto em volta de uma estrela como o Sol, em 1995.'),
    src: 'https://www.eso.org/public/news/eso1517/' },
  { id: 'castor', ly: 52, planets: false, color: '#e9f0ff', names: L('Castor', '北河二', 'Cástor', 'Castor'),
    fact: L('Not one star but a multiple star system.', '它不是一颗恒星，而是一个多星系统。', 'No es una estrella sino un sistema estelar múltiple.', 'Não é uma estrela, mas um sistema estelar múltiplo.'),
    src: HIP, also: 'https://apod.nasa.gov/apod/ap080510.html' },
  { id: 'betapic', ly: 63, planets: true, color: '#f4f6ff', names: L('Beta Pictoris', '绘架座 β', 'Beta Pictoris', 'Beta Pictoris'),
    fact: L('The first dust disk ever imaged around another star, with young planets.', '人类首次拍到的另一颗恒星周围的尘埃盘，还有年轻的行星。', 'El primer disco de polvo fotografiado alrededor de otra estrella, con planetas jóvenes.', 'O primeiro disco de poeira fotografado em volta de outra estrela, com planetas jovens.'),
    src: 'https://science.nasa.gov/missions/webb/nasas-webb-discovers-dusty-cats-tail-in-beta-pictoris-system/' },
  { id: 'aldebaran', ly: 65, planets: false, color: '#ffae6b', names: L('Aldebaran', '毕宿五', 'Aldebarán', 'Aldebarã'),
    fact: L('A red giant that only looks like part of the Hyades star cluster.', '一颗红巨星，只是看起来像毕星团的一员。', 'Una gigante roja que solo parece formar parte del cúmulo de las Híades.', 'Uma gigante vermelha que só parece fazer parte do aglomerado das Híades.'),
    src: HIP, also: 'https://apod.nasa.gov/rjn/apod/ap200122.html' },
  { id: 'toi270', ly: 73, planets: true, color: '#ff9468', names: L('TOI-270', 'TOI-270', 'TOI-270', 'TOI-270'),
    fact: L('Three planets found by NASA’s TESS planet hunter.', 'NASA 的 TESS 行星猎手发现了它的三颗行星。', 'Tres planetas descubiertos por el cazador de planetas TESS de la NASA.', 'Três planetas descobertos pelo caçador de planetas TESS da NASA.'),
    src: 'https://www.nasa.gov/universe/nasas-tess-mission-scores-hat-trick-with-3-new-worlds/' },
  { id: 'regulus', ly: 78, planets: false, color: '#e6eeff', names: L('Regulus', '轩辕十四', 'Régulo', 'Régulo'), fact: BRIGHT, src: HIP },
  { id: 'alioth', ly: 81, planets: false, color: '#eef3ff', names: L('Alioth', '玉衡（大熊座ε）', 'Alioth', 'Alioth'), fact: BRIGHT, src: HIP },
  { id: 'gacrux', ly: 88, planets: false, color: '#ff9f6e', names: L('Gacrux', '十字架三（南十字座γ）', 'Gacrux', 'Gacrux'), fact: BRIGHT, src: HIP },
  { id: '51eri', ly: 96, planets: true, color: '#f4f6ff', names: L('51 Eridani', '波江座 51', '51 Eridani', '51 Eridani'),
    fact: L('Webb photographed its young giant planet directly.', '韦布望远镜直接拍到了它年轻的巨行星。', 'Webb fotografió directamente su joven planeta gigante.', 'O Webb fotografou diretamente o seu jovem planeta gigante.'),
    src: 'https://esawebb.org/images/weic2504b/' },
  { id: 'toi700', ly: 100, planets: true, color: '#ff9468', names: L('TOI-700', 'TOI-700', 'TOI-700', 'TOI-700'),
    fact: L('Home of TOI-700 d, TESS’s first Earth-size planet in a habitable zone.', 'TOI-700 d 的家：TESS 发现的第一颗位于宜居带的地球大小行星。', 'Hogar de TOI-700 d, el primer planeta del tamaño de la Tierra en zona habitable hallado por TESS.', 'Lar de TOI-700 d, o primeiro planeta do tamanho da Terra em zona habitável achado pelo TESS.'),
    src: 'https://www.jpl.nasa.gov/news/nasa-planet-hunter-finds-earth-size-habitable-zone-world/' },
  { id: 'k218', ly: 120, planets: true, color: '#ff8d63', names: L('K2-18', 'K2-18', 'K2-18', 'K2-18'),
    fact: L('Webb found methane and carbon dioxide in its planet’s atmosphere.', '韦布在它的行星大气中发现了甲烷和二氧化碳。', 'Webb encontró metano y dióxido de carbono en la atmósfera de su planeta.', 'O Webb encontrou metano e dióxido de carbono na atmosfera do seu planeta.'),
    src: 'https://www.esa.int/Science_Exploration/Space_Science/Webb/Webb_discovers_methane_and_carbon_dioxide_in_atmosphere_of_K2-18_b' },
  { id: 'hr8799', ly: 129, planets: true, color: '#eef3ff', names: L('HR 8799', 'HR 8799', 'HR 8799', 'HR 8799'),
    fact: L('Its giant planets have been photographed directly.', '它的巨行星已被直接拍摄到。', 'Sus planetas gigantes han sido fotografiados directamente.', 'Seus planetas gigantes foram fotografados diretamente.'),
    src: 'https://science.nasa.gov/universe/exoplanets/a-wonderland-of-science-awaits/' },
];

export const BS_UI = {
  button: L('🎂 Your birthday star', '🎂 你的生日星', '🎂 Tu estrella de cumpleaños', '🎂 Sua estrela de aniversário'),
  vrRow: L('🎂 Birthday star', '🎂 生日星', '🎂 Estrella del cumpleaños', '🎂 Estrela do aniversário'),
  title: L('Your birthday star', '你的生日星', 'Tu estrella de cumpleaños', 'Sua estrela de aniversário'),
  intro: L('Light takes time to travel. Some of the starlight reaching Earth tonight left its star around the year you were born. Enter your birth year to find that star.',
    '光的传播需要时间。今晚到达地球的星光中，有一些是在你出生那年前后离开它的恒星的。输入你的出生年份，找到那颗星。',
    'La luz tarda en viajar. Parte de la luz estelar que llega a la Tierra esta noche salió de su estrella hacia el año en que naciste. Escribe tu año de nacimiento para encontrarla.',
    'A luz leva tempo para viajar. Parte da luz das estrelas que chega à Terra esta noite saiu da sua estrela por volta do ano em que você nasceu. Digite o ano em que nasceu para encontrá-la.'),
  year: L('Year you were born', '出生年份', 'Año en que naciste', 'Ano em que você nasceu'),
  find: L('Find my star', '找到我的星', 'Encontrar mi estrella', 'Encontrar minha estrela'),
  bad: L('Enter a year between {a} and {b}.', '请输入 {a} 到 {b} 之间的年份。', 'Escribe un año entre {a} y {b}.', 'Digite um ano entre {a} e {b}.'),
  away: L('about {d} light-years away', '约 {d} 光年远', 'a unos {d} años luz', 'a cerca de {d} anos-luz'),
  left: L('The light reaching Earth from {s} tonight left it around {y}, about when you were born ({b}). It has been travelling about as long as you have been alive.',
    '今晚从{s}到达地球的光，大约在 {y} 年离开它，差不多就在你出生的时候（{b} 年）。它旅行的时间和你的年龄差不多。',
    'La luz de {s} que llega a la Tierra esta noche salió de ella hacia {y}, más o menos cuando naciste ({b}). Lleva viajando más o menos los mismos años que tienes tú.',
    'A luz de {s} que chega à Terra esta noite saiu dela por volta de {y}, mais ou menos quando você nasceu ({b}). Ela viaja há mais ou menos os mesmos anos que você tem.'),
  young: L('No light that left another star at your birth has reached us yet. Proxima Centauri is the nearest star: its light takes about 4.2 years. Your first birthday star arrives in {y}.',
    '在你出生时离开其他恒星的光还没有到达我们。比邻星是最近的恒星，它的光大约要走 4.2 年。你的第一颗生日星将在 {y} 年到达。',
    'Todavía no nos ha llegado la luz que salió de otra estrella cuando naciste. Próxima Centauri es la estrella más cercana: su luz tarda unos 4,2 años. Tu primera estrella de cumpleaños llega en {y}.',
    'Ainda não chegou até nós a luz que saiu de outra estrela quando você nasceu. Próxima Centauri é a estrela mais próxima: sua luz leva cerca de 4,2 anos. Sua primeira estrela de aniversário chega em {y}.'),
  old: L('Your birthday light is still on its way from stars farther than our list reaches (about {d} light-years). The closest match is below.',
    '你的生日之光还在从比我们列表更远（约 {d} 光年以外）的恒星赶来。下面是最接近的一颗。',
    'Tu luz de cumpleaños aún viene de estrellas más lejanas que nuestra lista (unos {d} años luz). Abajo está la más cercana.',
    'Sua luz de aniversário ainda vem de estrelas mais distantes do que a nossa lista (cerca de {d} anos-luz). Abaixo está a mais próxima.'),
  next: L('Next birthday star: in {y} you will be as old as the light from {s} ({d} light-years).',
    '下一颗生日星：到 {y} 年，你的年龄将与{s}的光一样（{d} 光年）。',
    'Próxima estrella de cumpleaños: en {y} tendrás la edad de la luz de {s} ({d} años luz).',
    'Próxima estrela de aniversário: em {y} você terá a idade da luz de {s} ({d} anos-luz).'),
  planets: L('🪐 Has known planets', '🪐 已知有行星', '🪐 Tiene planetas conocidos', '🪐 Tem planetas conhecidos'),
  ruler: L('Your age on the light-year ruler', '你的年龄在光年标尺上', 'Tu edad en la regla de años luz', 'Sua idade na régua de anos-luz'),
  you: L('you', '你', 'tú', 'você'),
  source: L('Source', '来源', 'Fuente', 'Fonte'),
  note: L('Distances are rounded and come with small measurement uncertainties, so “around” means give or take a few years. Your birth year stays on this device only.',
    '距离已四舍五入，测量也有小的误差，所以“大约”意味着前后几年。你的出生年份只保存在这台设备上。',
    'Las distancias están redondeadas y tienen pequeñas incertidumbres de medición, así que “hacia” significa unos años arriba o abajo. Tu año de nacimiento solo se guarda en este dispositivo.',
    'As distâncias estão arredondadas e têm pequenas incertezas de medição, então “por volta de” significa alguns anos a mais ou a menos. Seu ano de nascimento fica só neste aparelho.'),
  forget: L('Forget my year', '忘记我的年份', 'Olvidar mi año', 'Esquecer meu ano'),
  fly: L('See the stars around the Sun', '看看太阳周围的恒星', 'Ver las estrellas alrededor del Sol', 'Ver as estrelas em volta do Sol'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  // VR panel · VR 面板
  born: L('Born', '出生', 'Nacimiento', 'Nascimento'),
  dist: L('Distance', '距离', 'Distancia', 'Distância'),
  leftLabel: L('Its light left', '光离开时', 'Su luz salió', 'Sua luz saiu'),
  nextLabel: L('Next star', '下一颗', 'Siguiente', 'Próxima'),
  ly: L('{d} ly', '{d} 光年', '{d} a. l.', '{d} a.-l.'),
  vrHint: L('Touch or point at a row to change the year', '触碰或指向一行来更改年份', 'Toca o apunta a una fila para cambiar el año', 'Toque ou aponte para uma linha para mudar o ano'),
  minus10: L('◀◀ 10 years earlier', '◀◀ 早 10 年', '◀◀ 10 años antes', '◀◀ 10 anos antes'),
  minus1: L('◀ 1 year earlier', '◀ 早 1 年', '◀ 1 año antes', '◀ 1 ano antes'),
  plus1: L('1 year later ▶', '晚 1 年 ▶', '1 año después ▶', '1 ano depois ▶'),
  plus10: L('10 years later ▶▶', '晚 10 年 ▶▶', '10 años después ▶▶', '10 anos depois ▶▶'),
};

export const BS_MIN_YEAR = 1925;   // older than ~100, the nearest listed star can be more than 5 years off · 更早的年份误差会超过 5 年
export const bsFill = (o, vars) => Object.fromEntries(Object.entries(o).map(([k, s]) => [k, s.replace(/\{(\w)\}/g, (_, v) => vars[v] ?? '')]));
export const validYear = (y, now = new Date()) => Number.isInteger(y) && y >= BS_MIN_YEAR && y <= now.getFullYear();
export const fmtLy = (ly, l = 'en') => (l === 'es' || l === 'pt') ? String(ly).replace('.', ',') : String(ly);

// The match for a birth year: the star whose light-years are closest to your age (ties: the nearer star).
// young: younger than the nearest star's light; old: older than the farthest star on the list (+6 years of slack).
// next: the first star farther than your age today, and the year your age reaches it.
export function birthdayStar(birthYear, now = new Date()) {
  const year = now.getFullYear(), age = year - birthYear, first = BS_STARS[0], last = BS_STARS[BS_STARS.length - 1];
  const young = age < first.ly - 0.5;
  let star = first, best = Infinity;
  for (const s of BS_STARS) { const d = Math.abs(s.ly - age); if (d < best - 1e-9) { best = d; star = s; } }
  const old = age > last.ly + 6;
  const next = BS_STARS.find(s => birthYear + Math.round(s.ly) > year && (young || s !== star)) || null;   // never the star you just got · 不重复当前的星
  return { age, star: young ? null : star, leftYear: year - Math.round(star.ly), young, old,
    next, nextYear: next ? birthYear + Math.round(next.ly) : null };
}
