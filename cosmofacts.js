// 🔎 Cosmo answers only from CosmoVerse's own sourced facts · Cosmo 只根据应用中有来源的资料回答
// The browser builds a small "fact pack" ({ id, name, url, text }) from the app's data; the server (api/chat.js) gives it to the AI and
// asks for JSON { answer, sources: [ids] }; only ids that exist in the pack are kept, and the links come from the pack, never from the AI.
// 浏览器从应用数据生成“资料包”；服务器要求 AI 以 JSON 回答并列出用到的条目 id；链接来自资料包，而不是 AI。
// Planet pages opened 2026-11-17 (each body's facts checked against them) · 行星页面于 2026-11-17 打开核对
export const BODY_SOURCES = {
  sun: 'https://science.nasa.gov/sun/facts/',
  mercury: 'https://science.nasa.gov/mercury/facts/',
  venus: 'https://science.nasa.gov/venus/venus-facts/',
  earth: 'https://science.nasa.gov/earth/facts/',
  mars: 'https://science.nasa.gov/mars/facts/',
  jupiter: 'https://science.nasa.gov/jupiter/jupiter-facts/',
  saturn: 'https://science.nasa.gov/saturn/facts/',
  uranus: 'https://science.nasa.gov/uranus/facts/',
  neptune: 'https://science.nasa.gov/neptune/neptune-facts/',
};
// Which page supports each line of a body (checked 2026-11-17, see the run notes): 's' = the science.nasa.gov facts page above, 'n' = NASA's
// NSSDC fact sheet below. Lines not listed (not found / only roughly matching) stay out of Cosmo's pack · 每条事实对应的页面
export const NSSDC = {
 "sun": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html",
 "mercury": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
 "venus": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
 "earth": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html",
 "mars": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html",
 "jupiter": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html",
 "saturn": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html",
 "uranus": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html",
 "neptune": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html"
};
export const BODY_FACT_SRC = {"sun": {"Diameter": "n", "Mass": "n", "Surface": "s", "Core": "s", "Age": "s", "descEn": "s", "featureEn": "n"}, "mercury": {"Diameter": "n", "From the Sun": "s", "One year": "s", "One spin": "n", "Moons": "s", "Temperature": "s", "descEn": "s", "featureEn": "s"}, "venus": {"Diameter": "s", "From the Sun": "s", "One year": "s", "One spin": "s", "Moons": "s", "Surface": "s", "descEn": "s"}, "earth": {"Diameter": "n", "From the Sun": "s", "One year": "s", "One spin": "n", "Moons": "s", "Surface water": "s", "descEn": "s"}, "mars": {"Diameter": "n", "From the Sun": "n", "One year": "s", "One spin": "n", "Moons": "s", "Average": "n", "descEn": "s", "featureEn": "s"}, "jupiter": {"Diameter": "n", "From the Sun": "s", "One year": "n", "One spin": "n", "Moons": "s", "Made of": "n", "descEn": "n", "featureEn": "s"}, "saturn": {"Diameter": "n", "From the Sun": "n", "One year": "s", "One spin": "n", "Moons": "s", "Density": "n", "descEn": "s", "featureEn": "s"}, "uranus": {"Diameter": "n", "From the Sun": "n", "One year": "s", "One spin": "n", "Moons": "s", "Tilt": "s"}, "neptune": {"Diameter": "n", "From the Sun": "s", "One year": "s", "One spin": "n", "Moons": "s", "Winds": "s", "descEn": "s", "featureEn": "s"}};
// Moons, spacecraft and living features (highlights.js): the official page that supports each line (opened 2026-11-17; lines whose page
// only partly matched are left out of the pack) · 卫星、航天器与特色的来源页面
export const HIGHLIGHT_SOURCES = {
  "sun": {
   "craft": [
    "NASA",
    "https://science.nasa.gov/blogs/parker-solar-probe/2024/12/20/parker-solar-probe-begins-record-setting-closest-approach-to-the-sun/"
   ]
  },
  "mercury": {
   "craft": [
    "NASA",
    "https://science.nasa.gov/mission/messenger/"
   ]
  },
  "venus": {
   "feature": [
    "ESA",
    "https://sci.esa.int/web/venus-express/-/54065-4-super-rotation-is-speeding-up"
   ],
   "craft": [
    "NASA",
    "https://www.nasa.gov/history/30-years-ago-magellan-off-to-map-venus/"
   ]
  },
  "earth": {
   "moons": {
    "Moon": [
     "NASA",
     "https://science.nasa.gov/solar-system/moon/five-things-to-know-about-the-moon/"
    ]
   },
   "craft": [
    "NASA",
    "https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-the-international-space-station/"
   ]
  },
  "mars": {
   "feature": [
    "NASA",
    "https://science.nasa.gov/solar-system/planets/mars/10-things-massive-dust-storm-on-mars/"
   ],
   "moons": {
    "Phobos": [
     "NASA",
     "https://science.nasa.gov/mars/moons/facts/"
    ],
    "Deimos": [
     "NASA",
     "https://science.nasa.gov/photojournal/martian-moon-deimos-in-high-resolution/"
    ]
   },
   "craft": [
    "NASA",
    "https://science.nasa.gov/mission/mars-2020-perseverance/"
   ]
  },
  "jupiter": {
   "moons": {
    "Io": [
     "NASA",
     "https://science.nasa.gov/jupiter/jupiter-moons/io/facts/"
    ],
    "Europa": [
     "NASA",
     "https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/"
    ],
    "Ganymede": [
     "NASA",
     "https://science.nasa.gov/jupiter/jupiter-moons/ganymede/facts/"
    ],
    "Callisto": [
     "NASA",
     "https://science.nasa.gov/jupiter/jupiter-moons/callisto/facts/"
    ]
   },
   "craft": [
    "NASA",
    "https://science.nasa.gov/mission/juno/"
   ]
  },
  "saturn": {
   "moons": {
    "Enceladus": [
     "NASA",
     "https://science.nasa.gov/saturn/moons/facts/"
    ],
    "Rhea": [
     "NASA",
     "https://science.nasa.gov/saturn/moons/rhea/"
    ],
    "Titan": [
     "NASA",
     "https://science.nasa.gov/saturn/moons/titan/facts/"
    ]
   },
   "craft": [
    "NASA",
    "https://www.nasa.gov/news-release/nasas-cassini-spacecraft-ends-its-historic-exploration-of-saturn/"
   ]
  },
  "uranus": {
   "moons": {
    "Miranda": [
     "NASA",
     "https://science.nasa.gov/image-article/apod-2007-july-23-verona-rupes-tallest-known-cliff-in-the-solar-system/"
    ],
    "Titania": [
     "NASA",
     "https://science.nasa.gov/uranus/moons/titania/"
    ],
    "Oberon": [
     "NASA",
     "https://science.nasa.gov/uranus/moons/facts/"
    ]
   },
   "craft": [
    "NASA",
    "https://science.nasa.gov/mission/voyager/voyager-2/"
   ]
  },
  "neptune": {
   "moons": {
    "Triton": [
     "NASA",
     "https://science.nasa.gov/neptune/moons/triton/"
    ]
   },
   "craft": [
    "NASA",
    "https://science.nasa.gov/mission/voyager/voyager-2/"
   ]
  }
};
export const PACK_MAX_ITEMS = 200, PACK_MAX_CHARS = 20000, ITEM_MAX = 600;
export const ID_RE = /^[a-z0-9][a-z0-9:-]{0,47}$/;
const SAFE_URL = /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"'<>]*)?$/i;
const en = o => typeof o === 'string' ? o : o?.en ?? '';
const one = s => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
const item = (id, name, url, text) => ({ id, name: one(name).slice(0, 40), url, text: one(text).slice(0, ITEM_MAX) });

// The pack: what you are looking at first, then every body, pieces, landmarks, missions, news and sky events · 资料包（当前对象优先）
export function buildPack({ bodies = [], highlights = {}, pieces = [], landmarks = {}, missions = [], news = [], events = [], focus = null } = {}) {
  const out = [];
  for (const b of bodies) {   // one entry per page, with only the lines that page supports · 每个页面一条，只含该页支持的内容
    const src = BODY_FACT_SRC[b.id]; if (!src || !BODY_SOURCES[b.id]) continue;
    const name = b.en.charAt(0) + b.en.slice(1).toLowerCase(), lines = { s: [], n: [] };
    for (const f of b.facts || []) if (src[f[0]]) lines[src[f[0]]].push(`${f[0]}: ${f[2]}`);
    if (src.descEn) lines[src.descEn].push(b.descEn); if (src.featureEn) lines[src.featureEn].push(b.featureEn);
    const text = l => `${name}. ${l.map(x => String(x).replace(/\.$/, '')).join('. ')}.`;
    if (lines.s.length) out.push(item('b-' + b.id, 'NASA', BODY_SOURCES[b.id], text(lines.s)));
    if (lines.n.length) out.push(item('b-' + b.id + '-fs', 'NASA', NSSDC[b.id], text(lines.n)));
  }
  for (const [body, h] of Object.entries(highlights)) {   // moons, spacecraft, living features · 卫星、航天器、特色
    const src = HIGHLIGHT_SOURCES[body] || {};
    if (src.feature) out.push(item(`h-${body}`, src.feature[0], src.feature[1], `${body}: ${h.feature?.[0] || ''}`));
    for (const m of h.moons || []) { const s2 = src.moons?.[m[0]]; if (s2) out.push(item(`h-${body}-${String(m[0]).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, s2[0], s2[1], `${m[0]}, a moon of ${body}: ${m[7]}`)); }
    if (src.craft && h.craft) out.push(item(`h-${body}-craft`, src.craft[0], src.craft[1], `${h.craft.name[0]} (spacecraft at ${body}): ${h.craft.text[0]}`));
  }
  for (const p of pieces) {
    const w = p.whatIs?.source?.url ? [item('p-' + p.id, p.whatIs.source.name, p.whatIs.source.url, `${en(p.names)}: ${en(p.whatIs)}`)] : [];
    const bySrc = new Map();   // facts grouped by their page · 按页面分组
    for (const f of p.facts || []) if (f.source?.url) { const k = f.source.url; if (!bySrc.has(k)) bySrc.set(k, { name: f.source.name, lines: [] }); bySrc.get(k).lines.push(`${en(f.label)}: ${en(f.value)}`); }
    let i = 0; for (const [url, g] of bySrc) w.push(item(`p-${p.id}-${++i}`, g.name, url, `${en(p.names)}. ${g.lines.join('. ')}`));
    out.push(...w);
  }
  for (const [body, list] of Object.entries(landmarks)) for (const lm of list) if (lm.source?.url) out.push(item(`l-${lm.id}`, lm.source.name, lm.source.url, `${en(lm.names)} (on ${body}): ${en(lm.text)}`));
  for (const n of news) if (n.source?.url) out.push(item(`n-${n.id}`, n.source.name, n.source.url, `News, ${n.date}: ${en(n.title)}. ${en(n.summary)}`));
  for (const e of events) if (e.source?.url) out.push(item(`e-${e.id}`, e.source.name, e.source.url, `Coming up, ${e.date}: ${en(e.title)}. ${en(e.line)}`));
  for (const m of missions) if (m.source?.url && m.text) out.push(item(`m-${m.id}`, m.source.name, m.source.url, `Weekly mission: ${en(m.text)}`));
  // the thing on screen goes first · 当前对象放在最前
  // a journey level ('L:galaxy'): the pieces on that level go first · 旅程层级：该层的天体优先
  const lv = focus?.startsWith('L:') ? new Set(pieces.filter(p => p.level === focus.slice(2)).map(p => 'p-' + p.id)) : null;
  const key = focus ? (focus.startsWith('b-') || focus.startsWith('p-') ? focus : null) : null, hk = key?.startsWith('b-') ? 'h-' + key.slice(2) : null;
  const inLevel = x => lv && [...lv].some(k => x.id === k || (x.id.startsWith(k + '-') && /^\d+$/.test(x.id.slice(k.length + 1))));
  const first = x => key ? x.id === key || x.id.startsWith(key + '-') || (hk && (x.id === hk || x.id.startsWith(hk + '-'))) : inLevel(x);
  const ordered = key || lv?.size ? [...out.filter(first), ...out.filter(x => !first(x))] : out;
  return trimPack(ordered);
}
// Keep the pack within limits: valid ids and https links only, no duplicates · 限制大小，只保留有效 id 和 https 链接
export function trimPack(list) {
  const out = [], seen = new Set(); let chars = 0;
  for (const x of Array.isArray(list) ? list : []) {
    if (!x || typeof x !== 'object' || !ID_RE.test(String(x.id)) || seen.has(x.id) || !SAFE_URL.test(String(x.url || ''))) continue;
    const it = item(String(x.id), x.name, String(x.url), x.text); if (!it.text || !it.name) continue;
    if (out.length >= PACK_MAX_ITEMS || chars + it.text.length > PACK_MAX_CHARS) break;
    seen.add(it.id); chars += it.text.length; out.push(it);
  }
  return out;
}
// The links under an answer: only ids from our own pack, at most 4, one per page · 回答下方的链接：只用资料包里的 id
export function answerLinks(ids, pack) {
  const byId = new Map(pack.map(x => [x.id, x])), out = [], urls = new Set();
  for (const id of Array.isArray(ids) ? ids : []) { const x = byId.get(id); if (x && !urls.has(x.url)) { urls.add(x.url); out.push({ name: x.name, url: x.url }); } if (out.length >= 4) break; }
  return out;
}
// HTML for the "Sources" line (escaped; https links only) · “来源”一行的 HTML（已转义）
const escA = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const linksHTML = links => links.filter(l => SAFE_URL.test(l.url)).map(l => `<a href="${escA(l.url)}" target="_blank" rel="noopener">${escA(l.name)} ↗</a>`).join(' · ');
export const SRC_UI = {
  label: { en: 'Sources', zh: '来源', es: 'Fuentes', pt: 'Fontes' },
};
