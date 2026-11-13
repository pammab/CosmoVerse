// Tests: WebXR hand joints → MediaPipe landmarks → the app's real gesture classifier.
// Run: node --test tests/   (no headset or browser needed)
import test from 'node:test';
import assert from 'node:assert/strict';
import { MEDIAPIPE_ORDER, toLandmarks, GestureFilter, anchorJoints } from '../xr-hands.js';

// Build a synthetic Quest hand (metres; wrist at origin, fingers pointing up +y).
const FINGERS = { index: -0.03, middle: -0.01, ring: 0.01, pinky: 0.03 };
function finger(name, x, pose) {
  const P = (y, z) => ({ x, y, z });
  const j = {
    straight: [P(0.09, 0), P(0.13, 0), P(0.155, 0), P(0.175, 0)],
    curled:   [P(0.09, 0), P(0.11, 0.03), P(0.09, 0.05), P(0.07, 0.035)],
    half:     [P(0.09, 0), P(0.125, 0.01), P(0.14, 0.03), P(0.145, 0.05)],
  }[pose];
  const f = name === 'pinky' || name === 'index' || name === 'middle' || name === 'ring' ? `${name}-finger` : name;
  return { [`${f}-phalanx-proximal`]: j[0], [`${f}-phalanx-intermediate`]: j[1], [`${f}-phalanx-distal`]: j[2], [`${f}-tip`]: j[3] };
}
function hand(poses, thumb = 'out') {
  const joints = { wrist: { x: 0, y: 0, z: 0 } };
  for (const [n, x] of Object.entries(FINGERS)) Object.assign(joints, finger(n, x, poses[n]));
  const T = thumb === 'out'
    ? [[-0.02, 0.02, 0.01], [-0.045, 0.04, 0.02], [-0.065, 0.06, 0.025], [-0.08, 0.075, 0.03]]
    : thumb === 'tucked'
      ? [[-0.02, 0.02, 0.01], [-0.035, 0.04, 0.03], [-0.025, 0.06, 0.05], [-0.01, 0.07, 0.055]]
      : null;
  if (T) ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'].forEach((n, i) => joints[n] = { x: T[i][0], y: T[i][1], z: T[i][2] });
  return joints;
}
const pinchHand = () => {
  const j = hand({ index: 'half', middle: 'curled', ring: 'curled', pinky: 'curled' });
  const t = j['index-finger-tip'];
  j['thumb-tip'] = { x: t.x - 0.006, y: t.y - 0.004, z: t.z };
  j['thumb-phalanx-distal'] = { x: -0.05, y: 0.11, z: 0.04 };
  return j;
};
const POSES = {
  open: hand({ index: 'straight', middle: 'straight', ring: 'straight', pinky: 'straight' }),
  point: hand({ index: 'straight', middle: 'curled', ring: 'curled', pinky: 'curled' }, 'tucked'),
  victory: hand({ index: 'straight', middle: 'straight', ring: 'curled', pinky: 'curled' }, 'tucked'),
  fist: hand({ index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled' }, 'tucked'),
  pinch: pinchHand(),
};
const lms = j => toLandmarks(n => j[n] || null);

test('maps all 21 MediaPipe landmarks from WebXR joint names', () => {
  assert.equal(MEDIAPIPE_ORDER.length, 21);
  assert.equal(new Set(MEDIAPIPE_ORDER).size, 21);
  const l = lms(POSES.open);
  assert.equal(l.length, 21);
  assert.deepEqual(l[8], POSES.open['index-finger-tip']);   // MediaPipe 8 = index tip
  assert.deepEqual(l[4], POSES.open['thumb-tip']);          // MediaPipe 4 = thumb tip
});

test('returns null when any joint is not tracked', () => {
  const j = { ...POSES.open }; delete j['ring-finger-tip'];
  assert.equal(lms(j), null);
});

for (const g of ['open', 'point', 'victory', 'fist', 'pinch']) {
  test(`recognises ${g} after the stabilising vote`, () => {
    const f = new GestureFilter(); let out;
    for (let i = 0; i < 8; i++) out = f.push(lms(POSES[g]));
    assert.equal(out.gesture, g);
  });
}

test('one stray frame does not flip a stable gesture', () => {
  const f = new GestureFilter();
  for (let i = 0; i < 8; i++) f.push(lms(POSES.open));
  assert.equal(f.push(lms(POSES.fist)).gesture, 'open');
});

test('losing the hand resets the gesture', () => {
  const f = new GestureFilter();
  for (let i = 0; i < 8; i++) f.push(lms(POSES.point));
  assert.equal(f.push(null), null);
  assert.equal(f.stable, 'none');
});

test('cursor anchors: fingertip for point/pinch, palm for open/fist', () => {
  assert.deepEqual(anchorJoints('point'), ['index-finger-tip']);
  assert.deepEqual(anchorJoints('pinch'), ['index-finger-tip']);
  assert.ok(anchorJoints('open').includes('wrist') && anchorJoints('fist').length === 5);
});
