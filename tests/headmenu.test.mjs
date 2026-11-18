import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MORE_UI, MENU_GROUPS, CLOSES_MENU } from '../headmenu.js';
import { UI } from '../journey.js';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const LANG4 = ['en', 'zh', 'es', 'pt'];
test('☰ More labels exist in all four languages', () => {
  for (const [k, v] of Object.entries(MORE_UI)) for (const l of LANG4) assert.ok(v[l]?.trim(), k + ' ' + l);
  for (const g of MENU_GROUPS) assert.ok(MORE_UI[g.key], 'heading for ' + g.key);
  for (const l of LANG4) assert.ok(UI.goTo[l]?.trim(), 'ladder "Go to" ' + l);
  assert.deepEqual([UI.goTo.en, UI.goTo.zh, UI.goTo.es, UI.goTo.pt], ['Go to', '前往', 'Ir a', 'Ir para']);
});
test('option A groups: every element exists in index.html and none is lost', () => {
  const ids = MENU_GROUPS.flatMap(g => g.ids);
  for (const id of ids) assert.match(html, new RegExp(`id="${id}"`), id);
  assert.equal(new Set(ids).size, ids.length, 'no element in two groups');
  assert.deepEqual(MENU_GROUPS.map(g => g.key), ['settings', 'explore', 'learn', 'sound', 'about']);
  assert.deepEqual(MENU_GROUPS[1].ids, ['habitability', 'asteroidOpen', 'trajectory', 'lineup', 'tourMake', 'pmOpen', 'pause']);
  assert.deepEqual(MENU_GROUPS[2].ids, ['resourcesOpen', 'logOpen', 'newsOpen', 'calOpen', 'talk']);
  for (const id of CLOSES_MENU) assert.ok(ids.includes(id), id);
  // essentials stay in the bar · 常用按钮留在顶栏
  for (const id of ['cam', 'language', 'voiceToggle', 'talk']) assert.match(html, new RegExp(`id="${id}"`));
  for (const g of MENU_GROUPS.slice(1)) assert.ok(!g.ids.includes('cam'), 'Enable Gestures stays in the bar');
});
test('the "↖ Solar System" header button is gone (the side ladder goes everywhere)', () => {
  assert.doesNotMatch(html, /id="home"/);
  assert.doesNotMatch(fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8'), /\$\('#home'\)/);
});
