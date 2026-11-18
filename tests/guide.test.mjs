import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GUIDE_UI, GUIDES, GUIDE_MODES, guideMode } from '../guide.js';

const L4 = ['en', 'zh', 'es', 'pt'];
test('a guide for every way of exploring, in four languages', () => {
  assert.deepEqual(GUIDE_MODES, ['mouse', 'touch', 'webcam', 'vrHands', 'emulator', 'voice']);
  for (const [k, v] of Object.entries(GUIDE_UI)) for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
  for (const m of GUIDE_MODES) {
    for (const l of L4) assert.ok(GUIDES[m].name[l]?.trim(), m + ' name ' + l);
    assert.ok(GUIDES[m].steps.length >= 3, m);
    for (const [a, b] of GUIDES[m].steps) for (const l of L4) assert.ok(a[l]?.trim() && b[l]?.trim(), m + ' ' + a.en + ' ' + l);
  }
});
test('the button shows the guide for the input in use', () => {
  assert.equal(guideMode({}), 'mouse');
  assert.equal(guideMode({ touch: true }), 'touch');
  assert.equal(guideMode({ webcam: true, touch: true }), 'webcam');
  assert.equal(guideMode({ xr: true, webcam: true }), 'vrHands');
});
test('every gesture the app uses is in its guide', () => {
  const txt = m => GUIDES[m].steps.map(([a]) => a.en).join(' ');
  for (const g of ['☝', '🤏', '✋', '✊', '✌']) assert.ok(txt('webcam').includes(g), 'webcam ' + g);
  for (const g of ['☝', '🤏', '🤏🤏', '✋', '✊', '✌']) assert.ok(txt('vrHands').includes(g), 'vr ' + g);
  assert.match(txt('emulator'), /Shift \+ W A S D/); assert.match(txt('emulator'), /left mouse/i);
  assert.match(txt('mouse'), /Esc/);
});
