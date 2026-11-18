import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createFavs, FAV_UI, FAV_KEY, FAV_MAX, validPlace } from '../favs.js';

const mem = (init) => { const m = new Map(init ? [[FAV_KEY, init]] : []); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), m }; };
test('favourites text in all four languages', () => {
  for (const [k, v] of Object.entries(FAV_UI)) for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(v[l]?.trim(), k + ' ' + l);
  for (const l of ['en', 'zh', 'es', 'pt']) assert.ok(FAV_UI.tip[l].includes('★') && FAV_UI.demoTip[l].includes('★'));
});
test('add / remove / toggle, newest first, saved per browser', () => {
  const s = mem(), f = createFavs(s);
  assert.equal(f.add('B:saturn'), true); assert.equal(f.add('P:andromeda'), true); assert.equal(f.add('B:saturn'), false);
  assert.deepEqual(f.list, ['P:andromeda', 'B:saturn']);
  assert.deepEqual(JSON.parse(s.m.get(FAV_KEY)), ['P:andromeda', 'B:saturn']);
  assert.equal(f.toggle('P:andromeda'), false); assert.deepEqual(f.list, ['B:saturn']);
  assert.deepEqual(createFavs(s).list, ['B:saturn'], 'comes back next visit');
});
test('bad or hostile stored data is ignored; the list is capped', () => {
  assert.deepEqual(createFavs(mem('not json')).list, []);
  assert.deepEqual(createFavs(mem(JSON.stringify(['B:mars', '<img onerror=x>', 42, 'L:universe']))).list, ['B:mars', 'L:universe']);
  assert.equal(validPlace('"><script>'), false); assert.equal(validPlace('X:mars'), false);
  const f = createFavs(mem()); for (let i = 0; i < FAV_MAX + 5; i++) f.add('P:p' + i); assert.equal(f.list.length, FAV_MAX);
});
test('works without storage (private mode) and when setItem throws', () => {
  const f = createFavs(null); assert.equal(f.add('B:earth'), true); assert.deepEqual(f.list, ['B:earth']);
  const g = createFavs({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }); assert.equal(g.add('B:earth'), true);
});
test('one "★ Favourites" row at the bottom of the ladder opens a drop-down (Pamela, Nov 17); VR row last too', () => {
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /if \(id === 'FAV:menu'\) \{ favOpen = !favOpen; return true; \}/);
  assert.match(src, /\}\);\n  html \+= favRowHTML\(here\);/, 'appended after the level rows');
  assert.match(src, /here: r\.here \}\)\), (\{ id: 'R:refs'[^}]*\}, )?\.\.\.favMenuRows\(l\)\]/, 'VR: after the ladder rows (only the discreet 📚 row may sit between)');
  assert.match(src, /if \(!favOpen\) return `<li class="d0 favrow">\$\{head\}<\/li>`;/, 'closed: one row only');
  assert.match(src, /levelIndex\(p\.level\) < levelIndex\(/, 'a piece above where you are flies up');
});
test('main.js wires ★ for mouse (title + panel), hands (ladder row S:fav), VR (menu rows) and says it once in tour/demo', () => {
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /if \(id === 'S:fav'\) \{ toggleFav\(\); return true; \}/);
  assert.match(src, /\.\.\.favMenuRows\(l\)/);
  assert.match(src, /favTip\(FAV_UI\.tip\)/); assert.match(src, /favTip\(FAV_UI\.demoTip, true\)/); assert.match(src, /if \(!tour\.active || document\.body/, "a stopped tour shows no tip");
  assert.match(src, /localStorage\.setItem\('cv-favtip', '1'\)/, 'the tip is shown once per browser');
  assert.match(src, /favs\.list\.slice\(0, FAV_VR_ROWS\)/, 'VR shows the newest few only');
  assert.match(src, /classList\.contains\('xr-on'\)\) return;/, 'not used up in VR');
});
