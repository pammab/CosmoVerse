// ─────────────────────────────────────────────────────────────────────────────
// Languages · 语言 · Idiomas · Idiomas — English, 中文, Español, Português (Brasil)
// Every piece of text is written as bi(en, zh, es, pt). When the Spanish or Portuguese
// is not given, it is looked up here by its English text. To fix a translation, edit ES or PT below.
// 西班牙语和葡萄牙语未给出时，按英文原文在下方 ES / PT 词典中查找。
// ─────────────────────────────────────────────────────────────────────────────
export const LANGS = { en: 'English', zh: '中文', es: 'Español', pt: 'Português' };
const VOICE = { en: 'en-US', zh: 'zh-CN', es: 'es-ES', pt: 'pt-BR' };
const HTML_LANG = { en: 'en', zh: 'zh-CN', es: 'es', pt: 'pt-BR' };

export const ES = {
  // Header, intro, panels
  'Resume Orbits': 'Reanudar órbitas', 'Pause Orbits': 'Pausar órbitas', 'Enable Gestures': 'Activar gestos', 'Disable Gestures': 'Desactivar gestos',
  'Loading…': 'Cargando…', 'Starting camera…': 'Iniciando cámara…',
  'True sizes, side by side.': 'Tamaños reales, uno al lado del otro.',
  'The Sun is 109 times wider than Earth. Jupiter is 11 times wider. Mercury is smaller than some moons.': 'El Sol es 109 veces más ancho que la Tierra. Júpiter es 11 veces más ancho. Mercurio es más pequeño que algunas lunas.',
  'Among the worlds.': 'Entre los mundos.',
  'Eight worlds and their star, shown at their true sizes. Select a planet, use your hands, or just ask.': 'Ocho mundos y su estrella, a su tamaño real. Elige un planeta, usa tus manos o simplemente pregunta.',
  'Tint · keeps surface detail': 'Tono · conserva el detalle', 'Particle glow': 'Brillo de partículas', 'Particle spread': 'Dispersión de partículas', 'Open palm / fist': 'Palma abierta / puño',
  'View': 'Vista', 'Show clouds': 'Ver nubes', 'Radar surface': 'Superficie por radar', 'Pause spin': 'Pausar rotación', 'Resume spin': 'Reanudar rotación', 'Reset look': 'Restaurar aspecto',
  'Show one hand to the camera': 'Muestra una mano a la cámara',
  // Body types and fact labels
  'Star · G-type': 'Estrella · tipo G', 'Terrestrial': 'Planeta rocoso', 'Gas giant': 'Gigante gaseoso', 'Ice giant': 'Gigante de hielo',
  'Diameter': 'Diámetro', 'Mass': 'Masa', 'Surface': 'Superficie', 'Core': 'Núcleo', 'Age': 'Edad', 'Light to Earth': 'Luz hasta la Tierra',
  'From the Sun': 'Distancia al Sol', 'One year': 'Un año', 'One spin': 'Una rotación', 'Moons': 'Lunas', 'Temperature': 'Temperatura',
  'Surface water': 'Agua en superficie', 'Average': 'Media', 'Made of': 'Composición', 'Density': 'Densidad', 'Tilt': 'Inclinación', 'Winds': 'Vientos',
  // Fact values
  '1,392,700 km · 109 Earths': '1.392.700 km · 109 Tierras', '333,000 Earths': '333.000 Tierras', '~5,500 °C': '~5.500 °C', '~15 million °C': '~15 millones de °C', '~4.6 billion years': '~4.600 millones de años',
  '4,879 km · 0.38 Earth': '4.879 km · 0,38 Tierras', '58 million km · 0.39 AU': '58 millones de km · 0,39 UA', '88 days': '88 días', '58.6 Earth days': '58,6 días terrestres', '−180 to 430 °C': '−180 a 430 °C',
  '12,104 km · 0.95 Earth': '12.104 km · 0,95 Tierras', '108 million km · 0.72 AU': '108 millones de km · 0,72 UA', '225 days': '225 días', '243 days (backwards)': '243 días (al revés)',
  '12,742 km': '12.742 km', '150 million km · 1 AU': '150 millones de km · 1 UA', '365.25 days': '365,25 días',
  '6,779 km · 0.53 Earth': '6.779 km · 0,53 Tierras', '228 million km · 1.52 AU': '228 millones de km · 1,52 UA', '687 days': '687 días', '2 · Phobos, Deimos': '2 · Fobos, Deimos',
  '139,820 km · 11 Earths': '139.820 km · 11 Tierras', '778 million km · 5.2 AU': '778 millones de km · 5,2 UA', '11.9 years': '11,9 años', '101 (as of 2026)': '101 (en 2026)', '~90% hydrogen · 10% helium': '~90 % hidrógeno · 10 % helio',
  '116,460 km · 9.1 Earths': '116.460 km · 9,1 Tierras', '1.43 billion km · 9.5 AU': '1.430 millones de km · 9,5 UA', '29.4 years': '29,4 años', '274 (confirmed 2025)': '274 (confirmadas en 2025)', '0.69 g/cm³ · less than water': '0,69 g/cm³ · menos que el agua',
  '50,724 km · 4 Earths': '50.724 km · 4 Tierras', '2.9 billion km · 19.2 AU': '2.900 millones de km · 19,2 UA', '84 years': '84 años', '17 h 14 min (backwards)': '17 h 14 min (al revés)', '28 (+1 pending)': '28 (+1 por confirmar)',
  '49,244 km · 3.9 Earths': '49.244 km · 3,9 Tierras', '4.5 billion km · 30 AU': '4.500 millones de km · 30 UA', '165 years': '165 años', 'up to ~2,000 km/h': 'hasta ~2.000 km/h',
  // Descriptions
  'Our star holds about 99.8% of all the mass in the Solar System. It shines by fusing hydrogen into helium in its core.': 'Nuestra estrella reúne cerca del 99,8 % de toda la masa del sistema solar. Brilla fusionando hidrógeno en helio en su núcleo.',
  'Shown at true size: about 109 Earths would fit across its face.': 'A tamaño real: cabrían unas 109 Tierras a lo ancho de su disco.',
  'The smallest planet and the closest to the Sun. Its surface is covered in impact craters, and with almost no atmosphere its days are scorching and its nights freezing.': 'El planeta más pequeño y el más cercano al Sol. Su superficie está cubierta de cráteres y, casi sin atmósfera, sus días son abrasadores y sus noches heladas.',
  'Look for overlapping craters and bright ray systems.': 'Busca cráteres superpuestos y brillantes sistemas de rayos.',
  'Wrapped in thick carbon-dioxide air and sulfuric-acid clouds, Venus traps heat so well that it is the hottest planet, even hotter than Mercury.': 'Envuelto en un aire denso de dióxido de carbono y nubes de ácido sulfúrico, Venus atrapa tanto calor que es el planeta más caliente, incluso más que Mercurio.',
  'Look for the swirling, cream-coloured cloud deck and its thick glowing haze.': 'Busca su capa de nubes color crema en remolinos y su espesa neblina brillante.',
  'Our home is the only world known to host life. Liquid oceans cover about 71% of its surface; continents, clouds and a thin blue atmosphere complete it.': 'Nuestro hogar es el único mundo conocido con vida. Los océanos cubren cerca del 71 % de su superficie; continentes, nubes y una fina atmósfera azul lo completan.',
  'Look for oceans that shine in sunlight, green and desert continents, clouds and polar ice.': 'Busca océanos que brillan al sol, continentes verdes y desérticos, nubes y hielo polar.',
  'Iron oxide (rust) gives Mars its red colour. It has a thin atmosphere, polar ice caps, the giant canyon Valles Marineris and Olympus Mons, the tallest volcano in the Solar System.': 'El óxido de hierro (herrumbre) da a Marte su color rojo. Tiene una atmósfera fina, casquetes polares, el enorme cañón Valles Marineris y el Monte Olimpo, el volcán más alto del sistema solar.',
  'Look for the dark canyon near the equator, the volcano Olympus Mons and the white polar caps.': 'Busca el cañón oscuro cerca del ecuador, el volcán Monte Olimpo y los casquetes polares blancos.',
  'The largest planet: more than 1,300 Earths would fit inside it. Its striped clouds of ammonia race around in alternating belts and zones.': 'El planeta más grande: dentro cabrían más de 1.300 Tierras. Sus nubes de amoníaco forman franjas que giran en cinturones y zonas alternas.',
  'Look for the Great Red Spot, a storm wider than Earth that has raged for centuries.': 'Busca la Gran Mancha Roja, una tormenta más ancha que la Tierra que dura desde hace siglos.',
  'Saturn’s rings stretch about 280,000 km across yet are mostly only about 10 m thick, made of ice and rock. It is the only planet less dense than water.': 'Los anillos de Saturno miden unos 280.000 km de ancho, pero casi todos tienen solo unos 10 m de grosor y son de hielo y roca. Es el único planeta menos denso que el agua.',
  'Look for the dark Cassini Division in the rings and the hexagon-shaped storm at the north pole.': 'Busca la oscura División de Cassini en los anillos y la tormenta hexagonal del polo norte.',
  'Methane gives Uranus its pale cyan colour. Tipped over by about 98°, it rolls around the Sun on its side, so each pole gets about 42 years of sunlight and then 42 years of night.': 'El metano da a Urano su color cian pálido. Inclinado unos 98°, gira alrededor del Sol de costado: cada polo tiene unos 42 años de luz y luego 42 de noche.',
  'Look for its faint, almost vertical rings.': 'Busca sus tenues anillos, casi verticales.',
  'The farthest and windiest planet. It was predicted with mathematics and then found in 1846. Its largest moon, Triton, orbits backwards.': 'El planeta más lejano y con más viento. Se predijo con matemáticas y se descubrió en 1846. Su luna mayor, Tritón, gira al revés.',
  'Look for the deep-blue bands, a dark storm spot and bright high-altitude clouds.': 'Busca sus franjas azul intenso, una mancha oscura de tormenta y nubes altas brillantes.',
  // Chat
  'Too many questions at once. Wait a few seconds and try again.': 'Demasiadas preguntas seguidas. Espera unos segundos y vuelve a intentarlo.',
  'The AI guide is not set up yet: the server has no API key.': 'El guía de IA aún no está configurado: falta la clave de la API en el servidor.',
  'The AI guide needs the CosmoVerse server. Run "npm start", or open the online version.': 'El guía de IA necesita el servidor de CosmoVerse. Ejecuta "npm start" o abre la versión en línea.',
  'The AI is busy right now. Please try again.': 'La IA está ocupada. Inténtalo de nuevo.',
  'Something went wrong with that message. Please try again.': 'Algo falló con ese mensaje. Inténtalo de nuevo.',
  'Microphone access is blocked. Allow it in the address bar, then try again.': 'El micrófono está bloqueado. Permítelo en la barra de direcciones y vuelve a intentarlo.',
  'Voice input needs Chrome or Edge. You can still type.': 'La voz necesita Chrome o Edge. Puedes seguir escribiendo.',
  'The speech service could not be reached. Check the connection.': 'No se pudo conectar con el servicio de voz. Revisa la conexión.',
  'No microphone was found.': 'No se encontró ningún micrófono.',
  'Tell me a fun fact': 'Cuéntame un dato curioso', 'Could humans live there?': '¿Podrían vivir personas allí?', 'How big is it compared to Earth?': '¿Qué tamaño tiene comparado con la Tierra?',
  'Which planet is the hottest?': '¿Qué planeta es el más caliente?', 'Why do planets orbit the Sun?': '¿Por qué los planetas giran alrededor del Sol?', 'Line up the planets': 'Alinea los planetas',
  'Talking about · the Solar System': 'Hablando de · el sistema solar',
  "Hi! I'm Cosmo, your space guide. Ask me anything, type or press the mic and talk. Try “Go to Saturn”.": '¡Hola! Soy Cosmo, tu guía espacial. Pregúntame lo que quieras: escribe o pulsa el micrófono y habla. Prueba «Ve a Saturno».',
};

// Fallback for text not in the dictionary: translate common units, keep the rest.
export function esText(en) {
  en = String(en);
  if (ES[en]) return ES[en];
  return en.replace(/(\d)\.(\d)/g, '$1,$2').replace(/ Earths?\b/g, ' Tierras').replace(/\bdays\b/g, 'días').replace(/\byears\b/g, 'años');
}

// Portuguese (Brazil) · 葡萄牙语（巴西）· Português do Brasil — same keys as ES, plus the text that has its Spanish inline.
export const PT = {
  // Header, intro, panels
  'Resume Orbits': 'Retomar órbitas', 'Pause Orbits': 'Pausar órbitas', 'Enable Gestures': 'Ativar gestos', 'Disable Gestures': 'Desativar gestos',
  'Loading…': 'Carregando…', 'Starting camera…': 'Iniciando a câmera…',
  'True sizes, side by side.': 'Tamanhos reais, lado a lado.',
  'The Sun is 109 times wider than Earth. Jupiter is 11 times wider. Mercury is smaller than some moons.': 'O Sol é 109 vezes mais largo que a Terra. Júpiter é 11 vezes mais largo. Mercúrio é menor que algumas luas.',
  'Among the worlds.': 'Entre os mundos.',
  'Eight worlds and their star, shown at their true sizes. Select a planet, use your hands, or just ask.': 'Oito mundos e sua estrela, no tamanho real. Escolha um planeta, use as mãos ou simplesmente pergunte.',
  'Tint · keeps surface detail': 'Tom · mantém os detalhes', 'Particle glow': 'Brilho das partículas', 'Particle spread': 'Dispersão das partículas', 'Open palm / fist': 'Mão aberta / punho',
  'View': 'Visão', 'Show clouds': 'Mostrar nuvens', 'Radar surface': 'Superfície por radar', 'Pause spin': 'Pausar rotação', 'Resume spin': 'Retomar rotação', 'Reset look': 'Restaurar aparência',
  'Show one hand to the camera': 'Mostre uma mão para a câmera',
  'Worlds in motion.': 'Mundos em movimento.',
  'Our star moves. Eight worlds travel with it. Explore their luminous paths through a moving reference frame.': 'Nossa estrela se move, e oito mundos viajam com ela. Explore seus rastros luminosos num referencial em movimento.',
  'TRAJECTORY CONTROL': 'CONTROLE DE TRAJETÓRIAS', 'Time speed': 'Velocidade do tempo', 'Restart': 'Reiniciar', 'Change angle ↗': 'Mudar ângulo ↗',
  'Drag for 360° · Scroll to zoom · Click a planet to explore': 'Arraste para girar 360° · Role para dar zoom · Clique num planeta para explorar',
  'JPL J2000 eccentricities and inclinations, fixed Keplerian ellipses and relative periods. Earth uses the Earth–Moon barycenter approximation. Sizes/distances compressed. Straight solar travel and its direction are illustrative; not a live ephemeris or full Galactic model.': 'Excentricidades e inclinações J2000 do JPL, elipses keplerianas fixas e períodos relativos. A Terra usa a aproximação do baricentro Terra–Lua. Tamanhos e distâncias comprimidos. O avanço do Sol em linha reta e sua direção são ilustrativos; não é uma efeméride em tempo real nem um modelo galáctico completo.',
  'No moons.': 'Sem luas.', '✦ Living feature': '✦ Fenômeno vivo', '◐ Moons': '◐ Luas', '🛰 Spacecraft moment': '🛰 Momento espacial',
  'Moon sizes are true to scale; very small moons are drawn larger, and orbit distances are shortened. Spacecraft are enlarged to be visible.': 'As luas estão em escala real; as muito pequenas aparecem maiores e as distâncias das órbitas foram encurtadas. As naves foram ampliadas para ficarem visíveis.',
  // Hand gestures, VR, camera
  'Point · hold on a planet to open it': 'Aponte · pare sobre um planeta para abri-lo', 'Point · move to look around': 'Aponte · mova para olhar ao redor',
  'Pinch · open · pinch + move up/down to zoom': 'Pinça · abrir · faça a pinça e mova para cima/baixo para dar zoom', 'Pinch + move up/down · zoom': 'Pinça + cima/baixo · zoom',
  'Open palm · move to turn the system': 'Mão aberta · mova para girar o sistema', 'Open palm · spread fingers to scatter particles': 'Mão aberta · abra os dedos para espalhar as partículas',
  'Hold fist · back to overview': 'Segure o punho · voltar à visão geral', 'Hold fist · gather, then go back': 'Segure o punho · juntar e voltar',
  'Victory ✌ · hold to talk to Cosmo': 'Vitória ✌ · segure para falar com o Cosmo', 'Hand found · try ☝ 🤏 ✋ ✊ ✌': 'Mão detectada · experimente ☝ 🤏 ✋ ✊ ✌',
  '🥽 Enter VR': '🥽 Entrar em RV', 'VR needs a VR headset browser (e.g. Meta Quest) or the Immersive Web Emulator.': 'A RV precisa do navegador de um headset (por exemplo, Meta Quest) ou do Immersive Web Emulator.',
  'Gestures on: point ☝ at a planet and hold, or pinch 🤏, to open it. ✌ to talk.': 'Gestos ativados: aponte ☝ para um planeta e espere, ou faça a pinça 🤏, para abri-lo. ✌ para falar.',
  'Camera permission denied. Mouse and voice still work.': 'Permissão da câmera negada. O mouse e a voz continuam funcionando.',
  'Open the page over https or http://localhost to use the camera.': 'Abra a página por https ou http://localhost para usar a câmera.',
  'Could not start hand tracking. Check the camera and the internet connection.': 'Não foi possível iniciar o rastreamento da mão. Verifique a câmera e a conexão com a internet.',
  // Body types and fact labels
  'Star · G-type': 'Estrela · tipo G', 'Terrestrial': 'Planeta rochoso', 'Gas giant': 'Gigante gasoso', 'Ice giant': 'Gigante de gelo',
  'Diameter': 'Diâmetro', 'Mass': 'Massa', 'Surface': 'Superfície', 'Core': 'Núcleo', 'Age': 'Idade', 'Light to Earth': 'Luz até a Terra',
  'From the Sun': 'Distância do Sol', 'One year': 'Um ano', 'One spin': 'Uma rotação', 'Moons': 'Luas', 'Temperature': 'Temperatura',
  'Surface water': 'Água na superfície', 'Average': 'Média', 'Made of': 'Composição', 'Density': 'Densidade', 'Tilt': 'Inclinação', 'Winds': 'Ventos',
  // Fact values
  '1,392,700 km · 109 Earths': '1.392.700 km · 109 Terras', '333,000 Earths': '333.000 Terras', '~5,500 °C': '~5.500 °C', '~15 million °C': '~15 milhões de °C', '~4.6 billion years': '~4,6 bilhões de anos', '8 min 20 s': '8 min 20 s',
  '4,879 km · 0.38 Earth': '4.879 km · 0,38 Terra', '58 million km · 0.39 AU': '58 milhões de km · 0,39 UA', '88 days': '88 dias', '58.6 Earth days': '58,6 dias terrestres', '−180 to 430 °C': '−180 a 430 °C',
  '12,104 km · 0.95 Earth': '12.104 km · 0,95 Terra', '108 million km · 0.72 AU': '108 milhões de km · 0,72 UA', '225 days': '225 dias', '243 days (backwards)': '243 dias (ao contrário)', '~465 °C': '~465 °C',
  '12,742 km': '12.742 km', '150 million km · 1 AU': '150 milhões de km · 1 UA', '365.25 days': '365,25 dias', '23 h 56 min': '23 h 56 min', '~71%': '~71%',
  '6,779 km · 0.53 Earth': '6.779 km · 0,53 Terra', '228 million km · 1.52 AU': '228 milhões de km · 1,52 UA', '687 days': '687 dias', '24 h 37 min': '24 h 37 min', '2 · Phobos, Deimos': '2 · Fobos, Deimos', '~−60 °C': '~−60 °C',
  '139,820 km · 11 Earths': '139.820 km · 11 Terras', '778 million km · 5.2 AU': '778 milhões de km · 5,2 UA', '11.9 years': '11,9 anos', '9 h 56 min': '9 h 56 min', '101 (as of 2026)': '101 (em 2026)', '~90% hydrogen · 10% helium': '~90% hidrogênio · 10% hélio',
  '116,460 km · 9.1 Earths': '116.460 km · 9,1 Terras', '1.43 billion km · 9.5 AU': '1,43 bilhão de km · 9,5 UA', '29.4 years': '29,4 anos', '10 h 33 min': '10 h 33 min', '274 (confirmed 2025)': '274 (confirmadas em 2025)', '0.69 g/cm³ · less than water': '0,69 g/cm³ · menos que a água',
  '50,724 km · 4 Earths': '50.724 km · 4 Terras', '2.9 billion km · 19.2 AU': '2,9 bilhões de km · 19,2 UA', '84 years': '84 anos', '17 h 14 min (backwards)': '17 h 14 min (ao contrário)', '28 (+1 pending)': '28 (+1 a confirmar)', '~98°': '~98°',
  '49,244 km · 3.9 Earths': '49.244 km · 3,9 Terras', '4.5 billion km · 30 AU': '4,5 bilhões de km · 30 UA', '165 years': '165 anos', '16 h 6 min': '16 h 6 min', 'up to ~2,000 km/h': 'até ~2.000 km/h',
  // Descriptions
  'Our star holds about 99.8% of all the mass in the Solar System. It shines by fusing hydrogen into helium in its core.': 'Nossa estrela concentra cerca de 99,8% de toda a massa do Sistema Solar. Ela brilha fundindo hidrogênio em hélio no seu núcleo.',
  'Shown at true size: about 109 Earths would fit across its face.': 'No tamanho real: cerca de 109 Terras caberiam lado a lado no seu disco.',
  'The smallest planet and the closest to the Sun. Its surface is covered in impact craters, and with almost no atmosphere its days are scorching and its nights freezing.': 'O menor planeta e o mais próximo do Sol. Sua superfície é coberta de crateras e, quase sem atmosfera, os dias são escaldantes e as noites, congelantes.',
  'Look for overlapping craters and bright ray systems.': 'Repare nas crateras sobrepostas e nos raios brilhantes ao redor delas.',
  'Wrapped in thick carbon-dioxide air and sulfuric-acid clouds, Venus traps heat so well that it is the hottest planet, even hotter than Mercury.': 'Envolta num ar denso de dióxido de carbono e em nuvens de ácido sulfúrico, Vênus retém tanto calor que é o planeta mais quente, mais até que Mercúrio.',
  'Look for the swirling, cream-coloured cloud deck and its thick glowing haze.': 'Repare na camada de nuvens cor de creme em redemoinhos e na sua névoa espessa e brilhante.',
  'Our home is the only world known to host life. Liquid oceans cover about 71% of its surface; continents, clouds and a thin blue atmosphere complete it.': 'Nosso lar é o único mundo conhecido que abriga vida. Oceanos cobrem cerca de 71% da sua superfície; continentes, nuvens e uma fina atmosfera azul completam o quadro.',
  'Look for oceans that shine in sunlight, green and desert continents, clouds and polar ice.': 'Repare nos oceanos que brilham ao sol, nos continentes verdes e desérticos, nas nuvens e no gelo polar.',
  'Iron oxide (rust) gives Mars its red colour. It has a thin atmosphere, polar ice caps, the giant canyon Valles Marineris and Olympus Mons, the tallest volcano in the Solar System.': 'O óxido de ferro (ferrugem) dá a Marte sua cor vermelha. Ele tem uma atmosfera fina, calotas polares, o gigantesco cânion Valles Marineris e o Monte Olimpo, o vulcão mais alto do Sistema Solar.',
  'Look for the dark canyon near the equator, the volcano Olympus Mons and the white polar caps.': 'Repare no cânion escuro perto do equador, no vulcão Monte Olimpo e nas calotas polares brancas.',
  'The largest planet: more than 1,300 Earths would fit inside it. Its striped clouds of ammonia race around in alternating belts and zones.': 'O maior planeta: mais de 1.300 Terras caberiam dentro dele. Suas nuvens listradas de amônia correm em cinturões e zonas alternados.',
  'Look for the Great Red Spot, a storm wider than Earth that has raged for centuries.': 'Repare na Grande Mancha Vermelha, uma tempestade mais larga que a Terra que dura há séculos.',
  'Saturn’s rings stretch about 280,000 km across yet are mostly only about 10 m thick, made of ice and rock. It is the only planet less dense than water.': 'Os anéis de Saturno têm cerca de 280.000 km de diâmetro, mas a maior parte tem só uns 10 m de espessura, feitos de gelo e rocha. É o único planeta menos denso que a água.',
  'Look for the dark Cassini Division in the rings and the hexagon-shaped storm at the north pole.': 'Repare na escura Divisão de Cassini nos anéis e na tempestade em forma de hexágono no polo norte.',
  'Methane gives Uranus its pale cyan colour. Tipped over by about 98°, it rolls around the Sun on its side, so each pole gets about 42 years of sunlight and then 42 years of night.': 'O metano dá a Urano sua cor ciano-clara. Inclinado cerca de 98°, ele gira em torno do Sol deitado de lado: cada polo tem uns 42 anos de luz e depois 42 anos de noite.',
  'Look for its faint, almost vertical rings.': 'Repare nos seus anéis tênues, quase verticais.',
  'The farthest and windiest planet. It was predicted with mathematics and then found in 1846. Its largest moon, Triton, orbits backwards.': 'O planeta mais distante e com mais vento. Foi previsto pela matemática e depois encontrado em 1846. Sua maior lua, Tritão, gira ao contrário.',
  'Look for the deep-blue bands, a dark storm spot and bright high-altitude clouds.': 'Repare nas faixas azul-escuras, numa mancha escura de tempestade e em nuvens altas e brilhantes.',
  // Habitability Lab
  'HIGHEST MATCH IN THIS SELECTION': 'MAIOR SEMELHANÇA NESTA SELEÇÃO', 'Earth similarity': 'de semelhança com a Terra', 'HOW THE SCORE WORKS': 'COMO A PONTUAÇÃO FUNCIONA',
  'Weighted comparison of four environmental factors. Earth is the 100-point reference.': 'Comparação ponderada de quatro fatores ambientais. A Terra é a referência de 100 pontos.',
  'Mean temperature': 'Temperatura média', 'Sunlight vs Earth': 'Luz solar em relação à Terra', 'Surface pressure': 'Pressão na superfície', 'No solid surface': 'Sem superfície sólida', 'Near vacuum': 'Quase vácuo', 'Atmosphere': 'Atmosfera',
  'Temperature match': 'Temperatura', 'Sunlight match': 'Luz solar', 'Surface pressure match': 'Pressão na superfície', 'Liquid-water conditions': 'Água líquida',
  'Trace exosphere': 'Exosfera tênue', 'Dense CO₂': 'CO₂ denso', 'N₂–O₂': 'N₂–O₂', 'Thin CO₂': 'CO₂ rarefeito', 'H₂–He · no solid surface': 'H₂–He · sem superfície sólida',
  'No stable surface liquid water': 'Não há água líquida estável na superfície', 'Stable surface oceans': 'Oceanos estáveis na superfície',
  'Past water evidence; liquid water is not stable at the surface': 'Há sinais de água no passado; a água líquida não é estável na superfície',
  // Voice, narration, music
  '🗣 Voice On': '🗣 Voz ativada', '🔇 Voice Off': '🔇 Voz desativada',
  'Opened as a file, so the ElevenLabs voice is off. Use the website or npm start.': 'Aberto como arquivo: a voz da ElevenLabs está desligada. Use o site ou npm start.',
  'ElevenLabs voice not connected: add ELEVENLABS_API_KEY on the server and redeploy. Showing captions for now.': 'Voz da ElevenLabs não conectada: adicione ELEVENLABS_API_KEY no servidor e publique de novo. Por enquanto, só legendas.',
  'ElevenLabs voice not found on the server: upload api/voice.js and api/tts.js, then redeploy.': 'A voz da ElevenLabs não está no servidor: envie api/voice.js e api/tts.js e publique de novo.',
  'ElevenLabs did not answer (key, credits or limit). Showing captions for now.': 'A ElevenLabs não respondeu (chave, créditos ou limite). Por enquanto, só legendas.',
  '♫ Music On': '♫ Música ativada', '♪ Music Off': '♪ Música desativada', 'Music settings': 'Ajustes de música', 'AMBIENT SOUNDTRACK': 'TRILHA SONORA AMBIENTE',
  'Audio unavailable in this browser': 'Áudio indisponível neste navegador', 'Preparing soundtrack…': 'Preparando a trilha…', 'Playing · Smooth transitions': 'Tocando · Transições suaves', 'Off · Turn on to listen': 'Desligada · Ative para ouvir', 'Volume': 'Volume',
  'Composed planetary themes: piano, harp, flute, glass and warm strings. Soft musical atmospheres, with matched listening levels.': 'Temas compostos para cada planeta: piano, harpa, flauta, vidro e cordas suaves. Atmosferas musicais delicadas, com volumes equilibrados.',
  // Chat
  'Too many questions at once. Wait a few seconds and try again.': 'Muitas perguntas de uma vez. Espere alguns segundos e tente de novo.',
  'The AI guide is not set up yet: the server has no API key.': 'O guia de IA ainda não está configurado: falta a chave da API no servidor.',
  'The AI guide needs the CosmoVerse server. Run "npm start", or open the online version.': 'O guia de IA precisa do servidor do CosmoVerse. Rode "npm start" ou abra a versão on-line.',
  'The AI is busy right now. Please try again.': 'A IA está ocupada agora. Tente de novo.',
  'Something went wrong with that message. Please try again.': 'Algo deu errado com essa mensagem. Tente de novo.',
  'Microphone access is blocked. Allow it in the address bar, then try again.': 'O microfone está bloqueado. Permita o acesso na barra de endereço e tente de novo.',
  'Voice input needs Chrome or Edge. You can still type.': 'A entrada por voz precisa do Chrome ou do Edge. Você ainda pode digitar.',
  'The speech service could not be reached. Check the connection.': 'Não foi possível acessar o serviço de voz. Verifique a conexão.',
  'No microphone was found.': 'Nenhum microfone foi encontrado.',
  'Tell me a fun fact': 'Me conte uma curiosidade', 'Could humans live there?': 'Daria para pessoas morarem lá?', 'How big is it compared to Earth?': 'Qual é o tamanho comparado com a Terra?',
  'Which planet is the hottest?': 'Qual é o planeta mais quente?', 'Why do planets orbit the Sun?': 'Por que os planetas giram em torno do Sol?', 'Line up the planets': 'Coloque os planetas lado a lado',
  'Talking about · the Solar System': 'Falando sobre · o Sistema Solar', 'SOLAR SYSTEM': 'SISTEMA SOLAR',
  "Hi! I'm Cosmo, your space guide. Ask me anything, type or press the mic and talk. Try “Go to Saturn”.": 'Oi! Eu sou o Cosmo, seu guia espacial. Pergunte o que quiser: digite ou toque no microfone e fale. Experimente “Vá para Saturno”.',
  // Page start-up errors (index.html)
  'This page was opened as a file, so the browser blocked its code. Either open orbit-standalone.html instead (double-click works), or run "npm start" in this folder and go to http://localhost:8000.': 'Esta página foi aberta como arquivo, então o navegador bloqueou o código. Abra o orbit-standalone.html (funciona com clique duplo) ou rode "npm start" nesta pasta e acesse http://localhost:8000.',
  'The 3D engine has not loaded. Open the page through a local server (npm start or Live Server) and check access to cdn.jsdelivr.net.': 'O motor 3D não carregou. Abra a página por um servidor local (npm start ou Live Server) e verifique o acesso a cdn.jsdelivr.net.',
};

// Fallback for text not in the dictionary: Brazilian number format (1.392,7) and common units, keep the rest.
export function ptText(en) {
  en = String(en);
  if (PT[en]) return PT[en];
  return en.replace(/(\d),(?=\d{3})/g, '$1⁣').replace(/(\d)\.(\d)/g, '$1,$2').replace(/⁣/g, '.')
    .replace(/ Earths?\b/g, ' Terras').replace(/\bdays\b/g, 'dias').replace(/\byears\b/g, 'anos').replace(/\bAU\b/g, 'UA');
}
if (typeof window !== 'undefined') Object.assign(window, { ES, esText, PT, ptText });

const listeners = new Set();
export const onLanguage = fn => { listeners.add(fn); return fn; };
export const getLanguage = () => document.documentElement.dataset.lang || 'en';
export const voiceCode = (l = getLanguage()) => VOICE[l] || 'en-US';
export function setLanguage(l) {
  if (!LANGS[l]) l = 'en';
  const root = document.documentElement; root.dataset.lang = l; root.lang = HTML_LANG[l];
  document.title = { en: 'COSMOVERSE · Solar System Explorer', zh: 'COSMOVERSE · 太阳系交互探索', es: 'COSMOVERSE · Explorador del sistema solar', pt: 'COSMOVERSE · Explorador do Sistema Solar' }[l];
  try { localStorage.setItem('orbit-lang', l); } catch {}
  const sel = document.querySelector('#language'); if (sel) sel.value = l;
  listeners.forEach(fn => fn(l));
}
export function initialLanguage() {
  let saved = null; try { saved = localStorage.getItem('orbit-lang'); } catch {}
  if (LANGS[saved]) return saved;
  const n = (navigator.language || 'en').toLowerCase();
  return n.startsWith('zh') ? 'zh' : n.startsWith('es') ? 'es' : n.startsWith('pt') ? 'pt' : 'en';
}
