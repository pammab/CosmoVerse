import test from 'node:test'; import assert from 'node:assert/strict';
import { buildPack, trimPack, answerLinks, linksHTML, BODY_SOURCES, PACK_MAX_CHARS } from '../cosmofacts.js';
import { groundedPrompt, parseGrounded, chat } from '../api/chat.js';
import { SUN, PLANETS } from '../data.js';
import { PIECES } from '../pieces/index.js';
import { LANDMARKS } from '../landmarks.js';
import { NEWS } from '../news.js';
import { EVENTS } from '../events.js';
import { MISSIONS } from '../collections.js';
const full = focus => buildPack({ bodies: [SUN, ...PLANETS], pieces: PIECES, landmarks: LANDMARKS, missions: MISSIONS, news: NEWS, events: EVENTS, focus });
test('the pack carries every body with its NASA page, pieces, landmarks, news, events; within limits; focus first', () => {
  const p = full('b-mars');
  assert.equal(p[0].id, 'b-mars'); assert.equal(p[0].url, BODY_SOURCES.mars);
  for (const id of ['b-sun', 'b-earth', 'b-neptune', 'l-olympus-mons']) assert.ok(p.find(x => x.id === id), id);
  assert.ok(p.some(x => x.id.startsWith('p-m87'))); assert.ok(p.some(x => x.id.startsWith('n-'))); assert.ok(p.some(x => x.id.startsWith('e-')));
  assert.ok(p.reduce((a, x) => a + x.text.length, 0) <= PACK_MAX_CHARS);
  for (const x of p) assert.match(x.url, /^https:\/\//);
  assert.ok(/115/.test(p.find(x => x.id === 'b-jupiter').text));   // NASA: 115 moons
  assert.ok(JSON.stringify({ pack: p }).length < 46000, 'fits the server body limit');
  const q = full('p-m87'); assert.ok(q[0].id.startsWith('p-m87'));
});
test('the prompt carries the facts with ids and the grounding rules; JSON output asked', () => {
  const p = full('b-mars'), s = groundedPrompt('mars', 'Spanish', p, false);
  assert.ok(s.includes('[b-mars] (NASA)')); assert.ok(s.includes('Olympus Mons')); assert.ok(/ONLY with information found in the sourced facts/.test(s));
  assert.ok(/do not have a sourced answer/.test(s)); assert.ok(/"sources"/.test(s)); assert.ok(/Spanish/.test(s));
});
test('parse: unknown ids dropped, text fallback, links only from the pack, escaped', () => {
  const p = full('b-mars');
  const g = parseGrounded('Sure! {"answer": "Olympus Mons is about 27 km high.", "sources": ["l-olympus-mons", "made-up", "b-mars", 5]}', p);
  assert.equal(g.answer, 'Olympus Mons is about 27 km high.'); assert.deepEqual(g.sources, ['l-olympus-mons', 'b-mars']);
  assert.equal(parseGrounded('Just text, no JSON.', p).answer, 'Just text, no JSON.'); assert.deepEqual(parseGrounded('Just text', p).sources, []);
  const links = answerLinks(['l-olympus-mons', 'nope', 'b-mars'], p); assert.equal(links.length, 2); assert.equal(links[0].url, 'https://www.jpl.nasa.gov/images/pia00300-olympus-mons/');
  const h = linksHTML([{ name: '<b>x</b>', url: 'https://example.org/a?b=1&c=2' }, { name: 'bad', url: 'javascript:alert(1)' }]);
  assert.ok(!h.includes('<b>') && !h.includes('javascript:') && h.includes('&lt;b&gt;') && h.includes('&amp;c=2'));
});
test('the server pack is re-validated: bad ids, non-https links and oversize are dropped', () => {
  const t = trimPack([{ id: 'ok-1', name: 'NASA', url: 'https://science.nasa.gov/x', text: 'a' }, { id: 'BAD ID', name: 'x', url: 'https://a.org', text: 'b' }, { id: 'js', name: 'x', url: 'javascript:1', text: 'c' }, { id: 'ok-1', name: 'dup', url: 'https://a.org', text: 'd' }, 'x', null]);
  assert.deepEqual(t.map(x => x.id), ['ok-1']);
});
test('with no API key the endpoint still answers config (GitHub Pages / no server fallback unchanged)', async () => {
  const k = process.env.ANTHROPIC_API_KEY; delete process.env.ANTHROPIC_API_KEY;
  const r = await chat({ messages: [{ role: 'user', content: 'hi' }], pack: full(null) }); assert.equal(r.status, 500); assert.equal(r.json.error, 'config');
  if (k) process.env.ANTHROPIC_API_KEY = k;
});
test('temperature 0 and the pack are sent to the API', async () => {
  process.env.ANTHROPIC_API_KEY = 'test'; let sent = null; const f = globalThis.fetch;
  globalThis.fetch = async (u, o) => { sent = JSON.parse(o.body); return { ok: true, json: async () => ({ content: [{ type: 'text', text: '{"answer":"Mars has two moons.","sources":["b-mars","zz"]}' }] }) }; };
  try { const r = await chat({ planet: 'mars', messages: [{ role: 'user', content: 'How many moons?' }], pack: full('b-mars') });
    assert.equal(sent.temperature, 0); assert.ok(sent.system.includes('[b-mars]')); assert.deepEqual(r.json, { reply: 'Mars has two moons.', sources: ['b-mars'] }); }
  finally { globalThis.fetch = f; delete process.env.ANTHROPIC_API_KEY; }
});
test('moons and spacecraft join the pack only with a checked page; the focused planet brings its own first', () => {
  const hl = { mars: { feature: ['Dust storms grow to cover the planet.'], moons: [['Phobos', '', '', 0, 0, 0, '', 'Slowly spiralling inwards.'], ['Nopemoon', '', '', 0, 0, 0, '', 'x']], craft: { name: ['Perseverance rover'], text: ['Landed in Jezero Crater in 2021.'] } } };
  const p = buildPack({ bodies: [SUN, ...PLANETS], highlights: hl, focus: 'b-mars' });
  const ids = p.map(x => x.id);
  assert.deepEqual(ids.slice(0, 5), ['b-mars', 'b-mars-fs', 'h-mars', 'h-mars-phobos', 'h-mars-craft']);
  assert.ok(!ids.includes('h-mars-nopemoon')); assert.equal(p[3].url, 'https://science.nasa.gov/mars/moons/facts/');
});
test('the full pack (with every highlight) still fits: nothing important dropped, body under the server limit', () => {
  const p = full('b-mars'); const ids = p.map(x => x.id);
  assert.ok(ids.some(i => i.startsWith('m-')) && ids.some(i => i.startsWith('e-')), 'missions and events kept');
  assert.ok(JSON.stringify({ planet: 'mars', pack: p, facts: 'x'.repeat(2000), messages: [{ role: 'user', content: 'x'.repeat(500) }] }).length < 48000);
});
test('broken JSON from the model never shows raw JSON to the visitor', () => {
  const p = full('b-mars');
  const a = parseGrounded('{"answer": "Mars is called the "Red Planet" by many.", "sources": ["b-mars", "x"]}', p);
  assert.equal(a.answer, 'Mars is called the "Red Planet" by many.'); assert.deepEqual(a.sources, ['b-mars']);
  const b = parseGrounded('{"answer": "", "sources": ["b-mars"]}', p); assert.equal(b.answer, ''); assert.ok(!/sources/.test(b.answer));
  const c = parseGrounded('{"answer": "Cut off mid-sent', p); assert.equal(c.answer, 'Cut off mid-sent'); assert.deepEqual(c.sources, []);
  const d = parseGrounded('{ broken', p); assert.equal(d.answer, '');
  for (const r of [a, b, c, d]) assert.ok(!/[{}]|"sources"/.test(r.answer));
});
test('each body splits by page: NASA facts page vs the NSSDC fact sheet; unchecked lines left out', () => {
  const p = buildPack({ bodies: [SUN, ...PLANETS] }), j = p.find(x => x.id === 'b-jupiter'), jf = p.find(x => x.id === 'b-jupiter-fs'), u = p.find(x => x.id === 'b-uranus');
  assert.ok(/Moons: 115/.test(j.text) && !/1,300/.test(j.text)); assert.ok(/1,300/.test(jf.text) && /nssdc/.test(jf.url));
  assert.ok(!/42 years/.test(JSON.stringify(p))); assert.ok(!/8 min 20/.test(JSON.stringify(p)));
});
