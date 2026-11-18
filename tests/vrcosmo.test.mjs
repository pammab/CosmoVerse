import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { VRC_UI, vrQuestions, panelText, errorLine, shouldCloseOnLower } from '../vrcosmo.js';

const L4 = ['en', 'zh', 'es', 'pt'];
test('Ask Cosmo in VR: every line in four languages', () => {
  for (const [k, v] of Object.entries(VRC_UI)) for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
  assert.match(VRC_UI.offline.en, /online version/);
});
test('three questions for a planet, a piece, a level and the Solar System, naming the thing in each language', () => {
  const saturn = { en: 'Saturn', zh: '土星', es: 'Saturno', pt: 'Saturno' };
  for (const kind of ['body', 'piece', 'level']) {
    const qs = vrQuestions({ kind, names: saturn }); assert.equal(qs.length, 3);
    // planets name it in every question; a place without its own list names it in the first (journey places have hand-written lists, cosmo-levels.test) · 无专属列表的地点在第一个问题中命名
    for (const q of kind === 'body' ? qs : qs.slice(0, 1)) for (const l of L4) assert.ok(q[l].includes(saturn[l]), kind + ' ' + l + ': ' + q[l]);
    for (const q of qs) for (const l of L4) assert.doesNotMatch(q[l], /\{n\}/);
  }
  const solar = vrQuestions({ kind: 'solar' }); assert.equal(solar.length, 3); for (const q of solar) for (const l of L4) assert.ok(q[l]);
});
test('the VR panel text stays short, cutting at a sentence when it can', () => {
  assert.equal(panelText('Short.'), 'Short.');
  const long = 'One sentence here. '.repeat(40), out = panelText(long, 100);
  assert.ok(out.length <= 102 && out.endsWith('…') && out.includes('here.'));
  assert.equal(panelText(null), '');
});
test('main.js: VR menu rows, panel, offline message, ✌ voice row only where the browser can listen', () => {
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /\.\.\.cosmoRows\(l\)/);
  assert.match(src, /if \(vrAsk\.open && \(vrAsk\.q \|\| vrAsk\.state \|\| vrAsk\.err\)\) return cosmoPanel\(\);/);
  assert.match(src, /const text = e \? errorLine\(e\)/);
  assert.match(src, /onExit: .*stopListening\(\); stopSpeaking\(\);/, 'leaving VR resets Ask Cosmo');
  assert.match(src, /\.\.\.\(canListen \? \[\{ id: 'C:voice'/);
  assert.match(src, /chat\.ask\(tr\(q, l\), true\)/, 'asked as voice: spoken reply');
  const chat = fs.readFileSync(new URL('../chat.js', import.meta.url), 'utf8');
  assert.match(chat, /onExchange\(\{ q: text, err \}\)/, 'errors reach the VR panel');
});
test('never silent: every failure has its own panel line', () => {
  assert.equal(errorLine('offline'), VRC_UI.offline); assert.equal(errorLine('still'), VRC_UI.still);
  assert.equal(errorLine('nospeech'), VRC_UI.noSpeech); assert.equal(errorLine('no-speech'), VRC_UI.noSpeech);
  assert.equal(errorLine('not-allowed'), VRC_UI.mic); assert.equal(errorLine('audio-capture'), VRC_UI.mic);
  assert.equal(errorLine('unsupported'), VRC_UI.noVoice); assert.equal(errorLine('anything-else'), VRC_UI.busy);
  const chat = fs.readFileSync(new URL('../chat.js', import.meta.url), 'utf8');
  assert.match(chat, /if \(busy\) \{ onExchange\(\{ q: text, err: 'still' \}\); return; \}/, 'a question during an answer is not dropped silently');
  assert.match(chat, /else if \(!userStopped\) onExchange\(\{ err: 'nospeech' \}\)/, 'an empty transcript says so (unless you stopped it)');
  assert.match(chat, /userStopped = true; stopListening\(\); onExchange\(\{ state: null \}\)/, 'stopping the mic clears "Listening…"');
});
test('lower your hand to close: only a fresh raise after the answer, then down for 1.5 s, and after a short read', () => {
  const t = { shownAt: 1000 };
  assert.equal(shouldCloseOnLower({ ...t, raisedAt: 1200, loweredAt: 1300, now: 3600 }), true);
  assert.equal(shouldCloseOnLower({ ...t, raisedAt: 1200, loweredAt: 1300, now: 2500 }), false, 'not before 1.5 s down');
  assert.equal(shouldCloseOnLower({ ...t, raisedAt: 900, loweredAt: 1100, now: 9000 }), false, 'pointing when the answer came, then lowered to read: stays');
  assert.equal(shouldCloseOnLower({ ...t, raisedAt: 1500, loweredAt: 0, now: 5000 }), false, 'hand still up');
  assert.equal(shouldCloseOnLower({ ...t, raisedAt: 1010, loweredAt: 1020, now: 2600 }), false, 'the answer stays at least 2.5 s');
  assert.equal(shouldCloseOnLower({ ...t, raisedAt: 1200, loweredAt: 1300, now: 3600, ms: 3000 }), false, 'a lost hand needs 3 s');
  assert.equal(shouldCloseOnLower({ shownAt: 0, raisedAt: 1, loweredAt: 2, now: 9999 }), false, 'nothing shown yet');
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(src, /if \(g === 'two'\) \{ hand\.downAt = 0;/, 'a two-hand zoom never closes it');
  for (const l of ['en', 'zh', 'es', 'pt']) { assert.ok(VRC_UI.hint[l].length > 10); assert.ok(VRC_UI.hintDone[l].includes('✕')); }
});
test('VR panel hints, the overview guide, the planet panel and the ⟵ Back button follow the page language', () => {
  const src = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8'), xr = fs.readFileSync(new URL('../xr.js', import.meta.url), 'utf8');
  const block = src.slice(src.indexOf('const VR_HINTS4 = {'), src.indexOf('const VR_HINTS = new Proxy'));
  for (const k of ['point', 'pinch', 'open', 'fist', 'victory', 'other', 'none', 'back', 'two', 'ret']) assert.match(block, new RegExp(`\\b${k}: Q4\\('[^']+', '[^']+', '[^']+', '[^']+'\\)`), k);
  assert.match(src, /text: vrTx\(p\.descEn, p\.descZh\)/); assert.doesNotMatch(src, /text: 'The universe in the palm of your hand/);
  assert.match(xr, /BACK_LABEL = \{ en: 'Back', zh: '返回', es: 'Volver', pt: 'Voltar' \}/);
});
