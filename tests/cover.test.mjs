import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { UI } from '../journey.js';
import { WELCOME } from '../welcome.js';

const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
const L4 = ['en', 'zh', 'es', 'pt'];
test('universe cover text exists in all four languages and states no numbers (app text, not facts)', () => {
  for (const k of ['coverEyebrow', 'coverText']) for (const l of L4) assert.ok(UI[k][l]?.trim(), k + ' ' + l);
  for (const l of L4) assert.doesNotMatch(UI.coverText[l], /\d/, 'no figures in the cover line ' + l);
  // it names the ladder title the user sees · 提到阶梯标题
  for (const l of L4) assert.ok(UI.coverText[l].includes(UI.goTo[l]), 'mentions "' + UI.goTo[l] + '"');
});
test('the app opens on the universe; ?start=solar (or a planet / level) starts elsewhere', () => {
  assert.match(src, /get\('start'\)/);
  assert.match(src, /cover\(true\)/, 'quiet cover at load (no whoosh, no voice before a click)');
  assert.match(src, /solar\(-system\)\?/);
});
test('back / Esc / fist step toward the cover; the VR Back button hides only there', () => {
  assert.match(src, /const atCover = \(\) => mode === 'journey' && journey\.level === 'universe' && !journey\.piece/);
  assert.match(src, /mode === 'journey' \|\| mode === 'overview'\) cover\(\); else home\(\)/);
  assert.match(src, /e\.key === 'Escape'\) back\(\)/);
  assert.match(src, /backVisible: \(\) => !atCover\(\)/);
});
test('welcome: the first thing to try is flying home to the Solar System, wired to an action', () => {
  assert.equal(WELCOME.tries[0].act, 'solar');
  assert.match(src, /actions: \{ solar: \(\) => ladderGo\('L:solar-system'\)/);
});
test('fist texts say "go back" (the chain now ends at the universe, not the Solar System)', () => {
  assert.deepEqual(UI.vrGuide.find(r => r[0].en.includes('fist'))[1], { en: 'Go back one step', zh: '返回上一步', es: 'Volver un paso', pt: 'Voltar um passo' });
  assert.match(src, /Hold fist · go back/); assert.doesNotMatch(src, /back to overview/);
  assert.match(src, /now - hand\.since > 300\) hand\.fistDone = false/, 'a fist re-arms only after 0.3 s of another gesture');
});
