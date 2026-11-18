// 📚 References & licences: where every fact and image comes from, the licences, how often it is updated, and what reuse means
// 参考资料与许可 · Referencias y licencias · Referências e licenças
// Licence pages opened 2026-11-17. Plain data + one small UI (a card from ☰ More, a VR panel).
// This is a plain-language summary, not legal advice.
import { whyText, WHY_SOURCES, UI as SCALE_UI } from './scale.js';
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const DATA_CHECKED = '2026-11-17';   // the last full check of facts, news and sky events · 最近一次全面核对
export const REF_UI = {
  button: L('📚 References & licences', '📚 参考资料与许可', '📚 Referencias y licencias', '📚 Referências e licenças'),
  title: L('References & licences', '参考资料与许可', 'Referencias y licencias', 'Referências e licenças'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  checked: L('Last full check: {d}', '最近一次全面核对：{d}', 'Última revisión completa: {d}', 'Última revisão completa: {d}'),
  vrRow: L('📚 Sources & licences', '📚 来源与许可', '📚 Fuentes y licencias', '📚 Fontes e licenças'),
  vrText: L('Only public information from space agencies and observatories; every fact shows its source. Full list: ☰ More → 📚 on a computer or phone.',
    '只使用航天机构和天文台公开的信息；每条事实都标明来源。完整列表：在电脑或手机上打开 ☰ 更多 → 📚。',
    'Solo información pública de agencias espaciales y observatorios; cada dato muestra su fuente. Lista completa: ☰ Más → 📚 en un ordenador o móvil.',
    'Só informação pública de agências espaciais e observatórios; cada fato mostra a sua fonte. Lista completa: ☰ Mais → 📚 num computador ou celular.'),
};
// The short promises at the top · 顶部的简短说明
export const REF_POINTS = [
  { icon: '🔭', head: L('Only public, official information', '只用公开的官方信息', 'Solo información pública y oficial', 'Só informação pública e oficial'),
    text: L('Every fact comes from NASA, JPL, ESA, ESA/Hubble, ESA/Webb, ESO, NOIRLab, the IAU or a peer-reviewed paper. We open each page before we use it, and the link is shown next to the fact: tap “NASA ↗”, “ESO ↗”… to read the original.',
      '每条事实都来自 NASA、JPL、欧空局、欧空局/哈勃、欧空局/韦布、欧南台、NOIRLab、国际天文学联合会或同行评审论文。使用前我们都会打开该页面核对，链接就显示在事实旁边：点击“NASA ↗”“ESO ↗”等即可阅读原文。',
      'Cada dato viene de la NASA, el JPL, la ESA, ESA/Hubble, ESA/Webb, ESO, NOIRLab, la UAI o un artículo revisado por pares. Abrimos cada página antes de usarla y el enlace aparece junto al dato: toca “NASA ↗”, “ESO ↗”… para leer el original.',
      'Cada fato vem da NASA, do JPL, da ESA, ESA/Hubble, ESA/Webb, ESO, NOIRLab, da UAI ou de um artigo revisado por pares. Abrimos cada página antes de usá-la e o link aparece ao lado do fato: toque em “NASA ↗”, “ESO ↗”… para ler o original.') },
  { icon: '✍', head: L('Our own words, real numbers', '我们自己的文字，真实的数字', 'Nuestras palabras, números reales', 'Palavras nossas, números reais'),
    text: L('Facts and figures are free for everyone to use; the descriptions are written by the team from those pages, rounded and marked “about”. If we can’t check a fact, we leave it out.',
      '事实和数字人人都可以使用；描述是团队根据这些页面自己撰写的，数字经过取整并标注“约”。无法核实的事实我们不会使用。',
      'Los datos y cifras son de libre uso; las descripciones las escribe el equipo a partir de esas páginas, redondeadas y marcadas con “unos”. Si no podemos comprobar un dato, no lo usamos.',
      'Fatos e números são de uso livre; as descrições são escritas pela equipe a partir dessas páginas, arredondadas e marcadas com “cerca de”. Se não conseguimos verificar um fato, ele fica de fora.') },
  { icon: '🔄', head: L('Kept up to date', '持续更新', 'Siempre al día', 'Sempre atualizado'),
    text: L('Our plan: check the 📰 News and 📅 Coming up lists against the agencies’ pages about once a week, and the facts at least once a month or when a discovery changes them (moon counts, for example). Past sky events drop off by themselves, and the date of the last full check is at the bottom.',
      '我们的计划：大约每周对照各机构页面核对一次 📰 新闻和 📅 即将到来的列表，事实至少每月核对一次，或在新发现改变它们时（例如卫星数量）及时更新。已过去的天象会自动消失，最近一次全面核对的日期写在底部。',
      'Nuestro plan: revisar las listas 📰 Noticias y 📅 Próximamente con las páginas de las agencias más o menos una vez por semana, y los datos al menos una vez al mes o cuando un descubrimiento los cambia (por ejemplo, el número de lunas). Los eventos pasados desaparecen solos, y la fecha de la última revisión completa está al final.',
      'Nosso plano: revisar as listas 📰 Notícias e 📅 Em breve com as páginas das agências mais ou menos uma vez por semana, e os fatos pelo menos uma vez por mês ou quando uma descoberta os muda (por exemplo, o número de luas). Os eventos que já passaram somem sozinhos, e a data da última revisão completa está no fim.') },
  { icon: '🤖', head: L('Cosmo, the AI guide', 'AI 向导 Cosmo', 'Cosmo, el guía con IA', 'Cosmo, o guia com IA'),
    text: L('Cosmo’s answers are written by an AI (Claude, by Anthropic). It is instructed to answer only from the app’s own sourced facts (pages from the agencies listed here) and to show their links under each answer; if they don’t cover a question, it should say it has no sourced answer yet; AI answers can still be wrong, so the sourced facts in the panels come first. AI text is never presented as coming from NASA or any agency.',
      'Cosmo 的回答由 AI（Anthropic 的 Claude）生成。它被要求只根据应用中有来源的事实（来自这里列出的机构的页面）回答，并在每个回答下方显示链接；如果这些资料没有涵盖某个问题，它应说明暂时没有有来源的答案；AI 的回答仍可能出错，因此以面板中有来源的事实为准。AI 文字从不冒充来自 NASA 或任何机构。',
      'Las respuestas de Cosmo las escribe una IA (Claude, de Anthropic). Tiene la instrucción de responder solo con los datos con fuente de la app (páginas de las agencias de esta lista) y de mostrar sus enlaces bajo cada respuesta; si no cubren una pregunta, debe decir que aún no tiene una respuesta con fuente; aun así puede equivocarse, así que mandan los datos con fuente de los paneles. El texto de la IA nunca se presenta como si viniera de la NASA ni de ninguna agencia.',
      'As respostas do Cosmo são escritas por uma IA (Claude, da Anthropic). Ele é instruído a responder só com os fatos com fonte do app (páginas das agências desta lista) e a mostrar os links abaixo de cada resposta; se eles não cobrem uma pergunta, deve dizer que ainda não tem uma resposta com fonte; mesmo assim pode errar, por isso valem os fatos com fonte dos painéis. O texto da IA nunca é apresentado como vindo da NASA ou de qualquer agência.') },
  { icon: '🛡', head: L('Not affiliated · no logos', '无隶属关系 · 不使用标志', 'Sin afiliación · sin logotipos', 'Sem afiliação · sem logotipos'),
    text: L('CosmoVerse is an independent, free educational project. It is not affiliated with or endorsed by NASA, ESA, ESO, NOIRLab, STScI or any agency, and it uses none of their logos.',
      'CosmoVerse 是一个独立、免费的教育项目，与 NASA、欧空局、欧南台、NOIRLab、STScI 或任何机构均无隶属关系，也未获其背书，并且不使用它们的任何标志。',
      'CosmoVerse es un proyecto educativo independiente y gratuito. No está afiliado a la NASA, la ESA, ESO, NOIRLab, STScI ni a ninguna agencia, ni cuenta con su respaldo, y no usa ninguno de sus logotipos.',
      'O CosmoVerse é um projeto educativo independente e gratuito. Não é afiliado à NASA, ESA, ESO, NOIRLab, STScI nem a nenhuma agência, nem tem o seu endosso, e não usa nenhum dos seus logotipos.') },
  { icon: '🔒', head: L('Your privacy', '你的隐私', 'Tu privacidad', 'Sua privacidade'),
    text: L('Hand tracking runs inside your browser: the camera video is never uploaded. No accounts; your logbook, favourites and tours stay in this browser. Questions to Cosmo go to the AI through our server; spoken replies send only the reply text to the voice service. 🎙 Talk uses your browser’s own speech recognition when it has one (in Chrome the audio is processed by Google); where it doesn’t (for example the Quest Browser), a short voice clip goes through our server to ElevenLabs to be turned into text, and we don’t keep it.',
      '手部追踪在你的浏览器内运行：摄像头画面从不上传。无需账号；你的日志、收藏和游览只保存在这个浏览器里。向 Cosmo 提的问题经由我们的服务器发送给 AI；语音回答只把回答文字发送给语音服务。🎙 语音提问在浏览器有语音识别时使用浏览器自带的功能（在 Chrome 中音频由 Google 处理）；没有时（例如 Quest 浏览器），一小段语音会经由我们的服务器发送给 ElevenLabs 转成文字，我们不会保存它。',
      'El seguimiento de manos funciona dentro de tu navegador: el vídeo de la cámara nunca se sube. Sin cuentas; tu bitácora, favoritos y tours se quedan en este navegador. Las preguntas a Cosmo van a la IA a través de nuestro servidor; las respuestas habladas solo envían el texto de la respuesta al servicio de voz. 🎙 Hablar usa el reconocimiento de voz de tu navegador cuando lo tiene (en Chrome, el audio lo procesa Google); si no lo tiene (por ejemplo el navegador de Quest), un clip corto de voz pasa por nuestro servidor a ElevenLabs para convertirlo en texto, y no lo guardamos.',
      'O rastreamento das mãos roda dentro do seu navegador: o vídeo da câmera nunca é enviado. Sem contas; seu diário de bordo, favoritos e tours ficam neste navegador. As perguntas ao Cosmo vão para a IA pelo nosso servidor; as respostas faladas enviam só o texto da resposta ao serviço de voz. 🎙 Falar usa o reconhecimento de voz do seu navegador quando ele tem um (no Chrome, o áudio é processado pelo Google); quando não tem (por exemplo o navegador do Quest), um clipe curto de voz passa pelo nosso servidor até a ElevenLabs para virar texto, e nós não o guardamos.') },
];
// Licences of what we show, with the page that states each rule (opened 2026-11-17) · 我们所用内容的许可
export const REF_LICENCES = [
  { who: 'NASA · JPL · NASA/STScI (Hubble)', licence: L('Public domain in the US · credit “NASA”, “NASA/JPL-Caltech”', '在美国属公有领域 · 署名“NASA”“NASA/JPL-Caltech”', 'Dominio público en EE. UU. · crédito “NASA”, “NASA/JPL-Caltech”', 'Domínio público nos EUA · crédito “NASA”, “NASA/JPL-Caltech”'),
    what: L('Facts, mission pages, Hubble and Milky Way images, asteroid risk list (Sentry)', '事实、任务页面、哈勃与银河系图像、小行星风险列表（Sentry）', 'Datos, páginas de misiones, imágenes del Hubble y de la Vía Láctea, lista de riesgo de asteroides (Sentry)', 'Fatos, páginas de missões, imagens do Hubble e da Via Láctea, lista de risco de asteroides (Sentry)'),
    links: [['NASA', 'https://www.nasa.gov/nasa-brand-center/images-and-media/'], ['JPL', 'https://www.jpl.nasa.gov/jpl-image-use-policy'], ['STScI', 'https://www.stsci.edu/copyright']] },
  { who: 'ESA/Hubble · ESA/Webb · ESO', licence: L('CC BY 4.0 · full credit line shown with each image', 'CC BY 4.0 · 每张图都显示完整署名', 'CC BY 4.0 · crédito completo junto a cada imagen', 'CC BY 4.0 · crédito completo junto a cada imagem'),
    what: L('Photos of nebulae, galaxies, Betelgeuse, the cosmic web, the black hole image (EHT, via ESO)', '星云、星系、参宿四、宇宙网的照片，黑洞图像（EHT，经欧南台发布）', 'Fotos de nebulosas, galaxias, Betelgeuse, la red cósmica y la imagen del agujero negro (EHT, vía ESO)', 'Fotos de nebulosas, galáxias, Betelgeuse, da teia cósmica e a imagem do buraco negro (EHT, via ESO)'),
    links: [['ESA/Hubble', 'https://esahubble.org/copyright/'], ['ESA/Webb', 'https://esawebb.org/copyright'], ['ESO', 'https://www.eso.org/public/copyright/'], ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/']] },
  { who: 'Solar System Scope', licence: L('CC BY 4.0', 'CC BY 4.0', 'CC BY 4.0', 'CC BY 4.0'),
    what: L('Planet surface maps and Saturn’s ring (based on NASA data)', '行星表面贴图和土星环（基于 NASA 数据）', 'Mapas de superficie de los planetas y el anillo de Saturno (basados en datos de la NASA)', 'Mapas de superfície dos planetas e o anel de Saturno (baseados em dados da NASA)'),
    links: [['solarsystemscope.com/textures', 'https://www.solarsystemscope.com/textures/']] },
  { who: 'Lowell Observatory · astorb', licence: L('Free to use with credit to its funders: NASA grants NAG5-4741 and NNX16AG52G and the Lowell Observatory endowment', '可免费使用，需注明资助方：NASA 资助 NAG5-4741 与 NNX16AG52G 及洛厄尔天文台基金', 'Uso libre citando a sus financiadores: subvenciones de la NASA NAG5-4741 y NNX16AG52G y el fondo del Observatorio Lowell', 'Uso livre com crédito aos financiadores: bolsas da NASA NAG5-4741 e NNX16AG52G e o fundo do Observatório Lowell'),
    what: L('Asteroid orbits in the Asteroid Analyzer', '小行星分析中的小行星轨道', 'Órbitas de asteroides en el Analizador de asteroides', 'Órbitas de asteroides no Analisador de asteroides'),
    links: [['asteroid.lowell.edu/astorb', 'https://asteroid.lowell.edu/astorb/']] },
  { who: 'three.js · MediaPipe', licence: L('MIT · Apache 2.0 (open source)', 'MIT · Apache 2.0（开源）', 'MIT · Apache 2.0 (código abierto)', 'MIT · Apache 2.0 (código aberto)'),
    what: L('3D engine · hand tracking', '3D 引擎 · 手部追踪', 'Motor 3D · seguimiento de manos', 'Motor 3D · rastreamento das mãos'),
    links: [['three.js', 'https://github.com/mrdoob/three.js/'], ['MediaPipe', 'https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE']] },
  { who: 'Claude (Anthropic)', licence: L('AI answers: the user of the service owns them (Anthropic commercial terms)', 'AI 回答：归服务使用者所有（Anthropic 商业条款）', 'Respuestas de IA: pertenecen a quien usa el servicio (términos comerciales de Anthropic)', 'Respostas da IA: pertencem a quem usa o serviço (termos comerciais da Anthropic)'),
    what: L('Cosmo’s written answers', 'Cosmo 的文字回答', 'Respuestas escritas de Cosmo', 'Respostas escritas do Cosmo'),
    links: [['Anthropic', 'https://www.anthropic.com/legal/commercial-terms']] },
  { who: 'ElevenLabs', licence: L('Used under ElevenLabs’ terms · commercial use needs a paid plan', '按 ElevenLabs 条款使用 · 商业用途需付费方案', 'Según los términos de ElevenLabs · el uso comercial requiere un plan de pago', 'Conforme os termos da ElevenLabs · uso comercial exige um plano pago'),
    what: L('Cosmo’s voice, the narration clips and the sound effects (the browser’s own voice and sounds when the service is off)', 'Cosmo 的声音、解说片段和音效（服务关闭时使用浏览器自带语音和声音）', 'La voz de Cosmo, los clips de narración y los efectos de sonido (la voz y los sonidos del navegador cuando el servicio está apagado)', 'A voz do Cosmo, os clipes de narração e os efeitos sonoros (a voz e os sons do navegador quando o serviço está desligado)'),
    links: [['ElevenLabs', 'https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform.md']] },
  { who: L('Music · Earth maps', '音乐 · 地球贴图', 'Música · mapas de la Tierra', 'Música · mapas da Terra'), licence: L('Origin being confirmed by the team', '来源正由团队确认', 'Origen en confirmación por el equipo', 'Origem em confirmação pela equipe'),
    what: L('The ambient music tracks · the Earth colour, cloud and relief maps (from the three.js examples)', '环境音乐曲目 · 地球颜色、云层和地形贴图（来自 three.js 示例）', 'Las pistas de música ambiental · los mapas de color, nubes y relieve de la Tierra (de los ejemplos de three.js)', 'As faixas de música ambiente · os mapas de cor, nuvens e relevo da Terra (dos exemplos do three.js)'),
    links: [['three.js examples', 'https://github.com/mrdoob/three.js/']] },
];
// Reuse, museums and the competition · 再利用、博物馆与比赛
export const REF_REUSE = {
  head: L('Reuse, museums and the competition', '再利用、博物馆与比赛', 'Reutilización, museos y el concurso', 'Reutilização, museus e o concurso'),
  points: [
    L('The facts and the agency and observatory material we show may be reused, also commercially, as long as the credits stay visible: NASA material is public domain in the US and the ESA/Hubble, ESA/Webb, ESO and Solar System Scope images are CC BY 4.0. A museum or classroom version, or Meta showing the project, fits these licences.',
      '我们展示的事实以及航天机构和天文台的材料都可以再利用（包括商业用途），只要保留署名：NASA 的材料在美国属公有领域，欧空局/哈勃、欧空局/韦布、欧南台和 Solar System Scope 的图像采用 CC BY 4.0。博物馆或课堂版本，或 Meta 展示本项目，都符合这些许可。',
      'Los datos y el material de agencias y observatorios que mostramos pueden reutilizarse, también con fines comerciales, siempre que los créditos sigan visibles: el material de la NASA es de dominio público en EE. UU. y las imágenes de ESA/Hubble, ESA/Webb, ESO y Solar System Scope son CC BY 4.0. Una versión para museos o aulas, o que Meta muestre el proyecto, encaja en estas licencias.',
      'Os fatos e o material de agências e observatórios que mostramos podem ser reutilizados, inclusive comercialmente, desde que os créditos continuem visíveis: o material da NASA é de domínio público nos EUA e as imagens de ESA/Hubble, ESA/Webb, ESO e Solar System Scope são CC BY 4.0. Uma versão para museus ou escolas, ou a Meta mostrando o projeto, cabe nessas licenças.'),
    L('Before any paid version we will confirm the licences of the music, the voice clips (a paid ElevenLabs plan) and the Earth maps, or replace them.',
      '在推出任何付费版本之前，我们会确认音乐、语音片段（ElevenLabs 付费方案）和地球贴图的许可，或将其替换。',
      'Antes de cualquier versión de pago confirmaremos las licencias de la música, los clips de voz (un plan de pago de ElevenLabs) y los mapas de la Tierra, o los sustituiremos.',
      'Antes de qualquer versão paga vamos confirmar as licenças da música, dos clipes de voz (um plano pago da ElevenLabs) e dos mapas da Terra, ou substituí-los.'),
    L('What reuse may never do: use agency logos, suggest that NASA, ESA or ESO endorse a product, or remove a credit line.',
      '再利用绝不能：使用机构标志、暗示 NASA、欧空局或欧南台为某产品背书，或删除署名。',
      'Lo que la reutilización nunca puede hacer: usar logotipos de las agencias, sugerir que la NASA, la ESA o ESO respaldan un producto, o quitar un crédito.',
      'O que a reutilização nunca pode fazer: usar logotipos das agências, sugerir que a NASA, a ESA ou o ESO endossam um produto, ou remover um crédito.'),
    L('Competition (Meta Start Developer Competition 2026): the project stays the team’s own work and property, and it is free for everyone, at least until the winners are announced. Under the contest rules, Meta has a perpetual, worldwide, non-exclusive licence to show and use the entry for judging and promotion; a future museum partner would be told, and any paid version would keep the same credits.',
      '比赛（Meta Start 开发者大赛 2026）：本项目仍是团队自己的作品和财产，至少在公布获奖者之前对所有人免费。按照比赛规则，Meta 拥有永久、全球、非独占的许可，可为评审和宣传展示并使用参赛作品；将来若与博物馆合作会告知对方，任何付费版本都会保留同样的署名。',
      'Concurso (Meta Start Developer Competition 2026): el proyecto sigue siendo obra y propiedad del equipo, y es gratis para todos, al menos hasta que se anuncien los ganadores. Según las bases, Meta tiene una licencia perpetua, mundial y no exclusiva para mostrar y usar la participación en la evaluación y la promoción; a un futuro museo socio se le informaría, y cualquier versión de pago mantendría los mismos créditos.',
      'Concurso (Meta Start Developer Competition 2026): o projeto continua sendo obra e propriedade da equipe, e é grátis para todos, pelo menos até o anúncio dos vencedores. Pelas regras, a Meta tem uma licença perpétua, mundial e não exclusiva para mostrar e usar a participação na avaliação e na divulgação; um futuro museu parceiro seria informado, e qualquer versão paga manteria os mesmos créditos.'),
  ],
  rules: 'https://start-developer-competition-26.devpost.com/rules',
  note: L('A plain-language summary, not legal advice.', '以上为通俗摘要，并非法律意见。', 'Resumen en lenguaje sencillo, no es asesoramiento jurídico.', 'Resumo em linguagem simples, não é aconselhamento jurídico.'),
};
// Every link we print must be one of these hosts (tested) · 链接只允许这些域名
export const REF_HOSTS = /^https:\/\/(www\.)?(nasa\.gov|jpl\.nasa\.gov|stsci\.edu|esahubble\.org|esawebb\.org|eso\.org|creativecommons\.org|solarsystemscope\.com|asteroid\.lowell\.edu|github\.com|anthropic\.com|elevenlabs\.io|start-developer-competition-26\.devpost\.com)\//;
// "Why isn't it to scale?" (moved here from the readout, Pamela Nov 18: discreet) · “为什么不按比例？”放在这里
const WHY = { head: SCALE_UI.why, text: { en: whyText('en'), zh: whyText('zh'), es: whyText('es'), pt: whyText('pt') } };
// The card's HTML (quad = the app's 4-language span helper; esc for URLs) · 卡片 HTML
export function refsHTML(quad, fill, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))) {
  const a = ([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a>`;
  return `<div class="jtop"><div class="eyebrow" id="refsTitle">${quad(REF_UI.title)}</div><button type="button" class="jback" id="refsClose">✕ ${quad(REF_UI.close)}</button></div>
    <ul class="rpoints">${REF_POINTS.map(p => `<li><b aria-hidden="true">${p.icon}</b><div><h4>${quad(p.head)}</h4><p>${quad(p.text)}</p></div></li>`).join('')}</ul>
    <div class="dhead" id="refsScale">📏 ${quad(WHY.head)}</div>
    <p class="rscale">${quad(WHY.text)} <span class="rlinks">${WHY_SOURCES.map(x => a([x.name, x.url])).join(' ')}</span></p>
    <div class="dhead">${quad(L('Licences', '许可', 'Licencias', 'Licenças'))}</div>
    <ol class="rlic">${REF_LICENCES.map(r => `<li><b>${typeof r.who === 'string' ? esc(r.who) : quad(r.who)}</b><span>${quad(r.licence)}</span><small>${quad(r.what)}</small><span class="rlinks">${r.links.map(a).join(' ')}</span></li>`).join('')}</ol>
    <div class="dhead">${quad(REF_REUSE.head)}</div>
    <ul class="rreuse">${REF_REUSE.points.map(p => `<li>${quad(p)}</li>`).join('')}</ul>
    <p class="rnote">${a(['Devpost rules', REF_REUSE.rules])} · ${quad(REF_REUSE.note)} · ${quad(fill(REF_UI.checked, { d: DATA_CHECKED }))}</p>`;
}
