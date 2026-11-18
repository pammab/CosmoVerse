// "What is this?" card for moons, spacecraft and surface landmarks · “这是什么？” · ¿Qué es esto? · O que é isto?
const L = (en, zh, es, pt) => ({ en, zh, es, pt });
export const WHAT_UI = {
  title: L('What is this?', '这是什么？', '¿Qué es esto?', 'O que é isto?'),
  moon: L('Moon', '卫星', 'Luna', 'Lua'),
  craft: L('Spacecraft', '航天器', 'Nave espacial', 'Nave espacial'),
  spot: L('Landmark', '地标', 'Lugar destacado', 'Marco'),
  ask: L('Ask Cosmo about it', '问问 Cosmo', 'Pregunta a Cosmo sobre esto', 'Pergunte ao Cosmo sobre isto'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  vrRow: L('ℹ What is this?', 'ℹ 这是什么？', 'ℹ ¿Qué es esto?', 'ℹ O que é isto?'),
  vrAsk: L('💬 Ask Cosmo about it', '💬 问问 Cosmo', '💬 Pregunta a Cosmo sobre esto', '💬 Pergunte ao Cosmo sobre isto'),
  vrHint: L('Point at another one · 💬 Ask Cosmo about it', '指向另一个 · 💬 问问 Cosmo', 'Apunta a otro · 💬 Pregunta a Cosmo', 'Aponte para outro · 💬 Pergunte ao Cosmo'),
  hint: L('Click a label (or point ☝ and hold) to ask “What is this?”', '点击标签（或用 ☝ 指向停留）问“这是什么？”', 'Haz clic en una etiqueta (o apunta ☝ y mantén) para preguntar “¿Qué es esto?”', 'Clique num rótulo (ou aponte ☝ e segure) para perguntar “O que é isto?”'),
};
// The question sent to Cosmo, naming the thing and its planet in each language · 发给 Cosmo 的问题
export const whatQuestion = (name, planet) => ({
  en: `Tell me about ${name.en} (at ${planet.en}).`, zh: `给我讲讲${planet.zh}的${name.zh}。`,
  es: `Háblame de ${name.es} (en ${planet.es}).`, pt: `Fale-me sobre ${name.pt} (em ${planet.pt}).`,
});
