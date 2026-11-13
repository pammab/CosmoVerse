// ─────────────────────────────────────────────────────────────────────────────
// VR hands → the same gestures as the webcam · 头显手部追踪 → 与摄像头相同的手势
// A Meta Quest tracks 25 joints per hand (WebXR Hand Input). The webcam tracker
// (MediaPipe) uses 21 landmarks. This file maps one onto the other, so the
// existing classify() in gestures.js recognises ☝ 🤏 ✋ ✊ ✌ in VR unchanged.
// No three.js here: it's plain math, so it can be tested anywhere.
// ─────────────────────────────────────────────────────────────────────────────
import { classify } from './gestures.js';

// WebXR joint names in MediaPipe's landmark order (index = MediaPipe landmark number).
export const MEDIAPIPE_ORDER = [
  'wrist',
  'thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip',
  'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip',
  'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip',
  'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip',
  'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip',
];

// getPos(name) → {x, y, z} in metres, or null if that joint isn't tracked.
// Returns the 21 landmarks, or null when the hand isn't fully tracked.
export function toLandmarks(getPos) {
  const out = [];
  for (const name of MEDIAPIPE_ORDER) { const p = getPos(name); if (!p) return null; out.push({ x: p.x, y: p.y, z: p.z }); }
  return out;
}

// Same stabilising vote as the webcam tracker: a gesture must win 3 of the last
// 5 frames (a pinch only 2, so it feels instant). Headsets track at 60–90 Hz,
// so we vote over a few more frames to match the webcam's ~30 Hz timing.
export class GestureFilter {
  constructor(window = 7, need = 4, pinchNeed = 2) { this.window = window; this.need = need; this.pinchNeed = pinchNeed; this.reset(); }
  reset() { this.votes = []; this.stable = 'none'; }
  push(landmarks) {
    if (!landmarks) { this.reset(); return null; }
    const f = classify(landmarks, landmarks, this.stable);
    this.votes.push(f.gesture); if (this.votes.length > this.window) this.votes.shift();
    const tally = {}; for (const v of this.votes) tally[v] = (tally[v] || 0) + 1;
    const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    if (best[1] >= this.need) this.stable = best[0];
    else if (f.gesture === 'pinch' && tally.pinch >= this.pinchNeed) this.stable = 'pinch';
    else if (this.stable === 'pinch' && f.gesture !== 'pinch' && (tally[f.gesture] || 0) >= this.pinchNeed) this.stable = f.gesture;
    return { ...f, gesture: this.stable, raw: f.gesture };
  }
}

// Where the cursor should sit: index fingertip for ☝ 🤏, palm centre for ✋ ✊.
export function anchorJoints(gesture) {
  return gesture === 'open' || gesture === 'fist'
    ? ['wrist', 'index-finger-phalanx-proximal', 'middle-finger-phalanx-proximal', 'ring-finger-phalanx-proximal', 'pinky-finger-phalanx-proximal']
    : ['index-finger-tip'];
}
