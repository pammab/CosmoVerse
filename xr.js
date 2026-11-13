// ─────────────────────────────────────────────────────────────────────────────
// VR mode (WebXR) · VR 模式 · Modo VR
// • "Enter VR" opens an immersive session on Meta Quest (or the Immersive Web Emulator).
// • The headset's hand tracking feeds the SAME gesture handler as the webcam.
// • The camera rig from main.js moves a "dolly" that carries the headset, so every
//   view (overview, line-up, close-up) works in VR. The dolly is scaled so the
//   object you look at always sits about 1.4 m in front of you.
// • HTML panels don't show inside a headset, so a floating 3D panel shows the info.
// ─────────────────────────────────────────────────────────────────────────────
import * as T from 'three';
import { GESTURE_COLORS } from './gestures.js';
import { toLandmarks, GestureFilter, anchorJoints } from './xr-hands.js';

const VIEW_DISTANCE_M = 1.4;     // how far (in metres) the object in view should appear
const PANEL_W = 0.56, PANEL_H = 0.42, PX = 1024;

export function initXR({ renderer, scene, camera, onHand, onEnter, onExit, panelContent }) {
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');

  // The dolly carries the headset (camera) and the hands · 承载头显与双手
  const dolly = new T.Group(); dolly.name = 'xr-dolly';
  scene.add(dolly); dolly.add(camera);

  // Hands: draw each tracked joint as a small glowing sphere · 手部关节
  const jointGeo = new T.SphereGeometry(1, 10, 8);
  const hands = [0, 1].map(i => {
    const hand = renderer.xr.getHand(i); dolly.add(hand);
    const mesh = new T.InstancedMesh(jointGeo, new T.MeshBasicMaterial({ color: '#cfe2ff', transparent: true, opacity: 0.85, toneMapped: false }), 25);
    mesh.frustumCulled = false; mesh.visible = false; dolly.add(mesh);
    const h = { hand, mesh, handedness: null };
    hand.addEventListener('connected', e => { h.handedness = e.data?.handedness || null; });
    hand.addEventListener('disconnected', () => { h.handedness = null; mesh.visible = false; });
    return h;
  });

  // Cursor at the fingertip · 指尖光标
  const cursor = new T.Mesh(new T.SphereGeometry(0.009, 16, 12), new T.MeshBasicMaterial({ color: '#8bd6ff', toneMapped: false, depthTest: false, transparent: true }));
  cursor.renderOrder = 1000; cursor.visible = false; dolly.add(cursor);

  // Floating info panel · 浮动信息面板
  const canvas = document.createElement('canvas'); canvas.width = PX; canvas.height = Math.round(PX * PANEL_H / PANEL_W);
  const tex = new T.CanvasTexture(canvas); tex.colorSpace = T.SRGBColorSpace;
  const panel = new T.Mesh(new T.PlaneGeometry(PANEL_W, PANEL_H), new T.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthTest: false }));
  panel.renderOrder = 999; panel.position.set(0.52, -0.08, -0.95); panel.rotation.y = -0.42; panel.visible = false; dolly.add(panel);
  let panelKey = '';

  const filter = new GestureFilter();
  const m4 = new T.Matrix4(), v = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3(), ndc = new T.Vector3();
  const smooth = { x: 0.5, y: 0.5, ok: false };
  let present = false, lastGesture = 'none';

  const active = () => renderer.xr.isPresenting;

  // three.js builds its VR culling camera from the eye distance in WORLD units but its
  // near plane in METRES. With the dolly scaled up, that pushes the culling near plane
  // past everything within reach (planets, Sun, panel), so they vanish. The scene is
  // small, so in VR we simply skip frustum culling, and restore it on exit.
  // 缩放后 three.js 的 VR 裁剪相机会误裁近处物体，VR 中关闭视锥裁剪。
  const unculled = new Set(); let cullTick = 0;
  // Same unit mix-up for particles: a PointsMaterial size is in world units, but with the
  // scaled dolly the view space is in metres, so points come out `scale` times too big.
  // We divide their size by the dolly scale while in VR. · 粒子尺寸按缩放修正
  const pointMats = new Map(); let pointScale = 1;
  function disableCulling() {
    scene.traverse(o => {
      if (o.frustumCulled) { o.frustumCulled = false; unculled.add(o); }
      if (o.isPoints) for (const m of [].concat(o.material)) if (m.isPointsMaterial && m.sizeAttenuation && !pointMats.has(m)) { pointMats.set(m, m.size); m.size /= pointScale; }
    });
  }
  function scalePoints(sc) {
    if (Math.abs(sc - pointScale) / pointScale < 1e-3) return;
    pointScale = sc; pointMats.forEach((base, m) => m.size = base / sc);
  }

  renderer.xr.addEventListener('sessionstart', () => { panel.visible = true; panelKey = ''; disableCulling(); onEnter?.(); });
  renderer.xr.addEventListener('sessionend', () => {
    unculled.forEach(o => o.frustumCulled = true); unculled.clear();
    pointMats.forEach((base, m) => m.size = base); pointMats.clear(); pointScale = 1;
    dolly.position.set(0, 0, 0); dolly.quaternion.identity(); dolly.scale.setScalar(1);
    panel.visible = false; cursor.visible = false; hands.forEach(h => h.mesh.visible = false);
    filter.reset(); smooth.ok = false; if (present) { present = false; onHand({ present: false, gesture: 'none' }); }
    onExit?.();
  });

  async function enter() {
    if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-vr').catch(() => false))) return false;
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'hand-tracking'] });
    await renderer.xr.setSession(session);
    return true;
  }
  const supported = async () => !!navigator.xr && navigator.xr.isSessionSupported('immersive-vr').catch(() => false);

  // Put the headset where the desktop camera would be, looking at the target · 放置头显
  function placeRig(position, target, up, distance) {
    dolly.position.copy(position);
    m4.lookAt(position, target, up); dolly.quaternion.setFromRotationMatrix(m4);
    const sc = Math.max(1e-4, distance / VIEW_DISTANCE_M);
    dolly.scale.setScalar(sc); scalePoints(sc);
    camera.near = 0.01; camera.far = 50000;   // metres, in the headset's own space
  }

  // Pick the hand to use: the right hand if it's tracked, else the left · 选择用哪只手
  function trackedHand() {
    const ok = h => h.hand.joints?.['wrist']?.visible && h.hand.joints?.['index-finger-tip']?.visible;
    return hands.find(h => h.handedness === 'right' && ok(h)) || hands.find(h => ok(h)) || null;
  }

  function drawHands() {
    for (const h of hands) {
      const joints = h.hand.joints; let n = 0;
      if (joints) for (const name in joints) {
        const j = joints[name]; if (!j.visible) continue;
        s.setScalar(Math.max(0.004, (j.jointRadius || 0.008) * 0.8));
        h.mesh.setMatrixAt(n++, m4.compose(j.position, j.quaternion, s));
      }
      h.mesh.count = n; h.mesh.visible = n > 0; h.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  // Called every frame by main.js while in VR · 每帧调用
  function update(progress = 0) {
    if (!active()) return;
    if (++cullTick % 30 === 0) disableCulling();   // objects added while in VR (e.g. trajectories)
    drawHands();
    const h = trackedHand();
    const lm = h ? toLandmarks(name => { const j = h.hand.joints[name]; return j && j.visible ? j.position : null; }) : null;
    const f = filter.push(lm);
    if (!f) {
      cursor.visible = false;
      if (present) { present = false; smooth.ok = false; onHand({ present: false, gesture: 'none' }); }
    } else {
      // Cursor: project the fingertip (or palm) onto the view, like aiming with your finger · 指尖投影到视野
      const names = anchorJoints(f.gesture); v.set(0, 0, 0);
      for (const n of names) v.add(h.hand.joints[n].position); v.divideScalar(names.length);
      cursor.position.copy(v);
      ndc.copy(v).applyMatrix4(dolly.matrixWorld).project(camera);
      const x = (ndc.x + 1) / 2, y = (1 - ndc.y) / 2;
      if (!smooth.ok) { smooth.x = x; smooth.y = y; smooth.ok = true; } else { smooth.x += (x - smooth.x) * 0.5; smooth.y += (y - smooth.y) * 0.5; }
      present = true; lastGesture = f.gesture;
      onHand({ present: true, gesture: f.gesture, raw: f.raw, cursor: { x: Math.min(1, Math.max(0, smooth.x)), y: Math.min(1, Math.max(0, smooth.y)) }, openness: f.openness, pinch: f.pinch, gain: 1 });
      cursor.visible = true; cursor.material.color.set(GESTURE_COLORS[f.gesture] || '#ffffff');
      cursor.scale.setScalar(1 + progress * 1.6);
    }
    drawPanel(panelContent(present ? lastGesture : 'none'));
  }

  // ── Panel drawing · 面板绘制 ──
  function drawPanel(c) {
    const key = JSON.stringify(c); if (key === panelKey) return; panelKey = key;
    const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height, pad = 44;
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(8,12,24,0.86)'; roundRect(g, 0, 0, W, H, 36); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 3; roundRect(g, 1.5, 1.5, W - 3, H - 3, 35); g.stroke();
    let y = pad + 8;
    g.fillStyle = '#8f9bb5'; g.font = '500 24px Manrope, system-ui, sans-serif'; g.fillText((c.eyebrow || '').toUpperCase(), pad, y); y += 54;
    g.fillStyle = c.accent || '#ffffff'; g.font = '700 52px Manrope, system-ui, sans-serif'; g.fillText(c.title || '', pad, y); y += 22;
    g.font = '400 27px Manrope, system-ui, sans-serif'; g.fillStyle = '#d8deea';
    for (const line of wrap(g, c.text || '', W - pad * 2).slice(0, 4)) { y += 38; g.fillText(line, pad, y); }
    y += 26;
    const facts = (c.facts || []).slice(0, 6), colW = (W - pad * 2) / 2;
    facts.forEach((f, i) => {
      const fx = pad + (i % 2) * colW, fy = y + Math.floor(i / 2) * 70;
      g.fillStyle = '#8f9bb5'; g.font = '500 21px Manrope, system-ui, sans-serif'; g.fillText(f[0], fx, fy + 24);
      g.fillStyle = '#ffffff'; g.font = '600 25px Manrope, system-ui, sans-serif'; g.fillText(clip(g, f[1], colW - 16), fx, fy + 54);
    });
    if (c.hint) {
      g.fillStyle = c.hintColor || '#9fb2c4'; g.font = '600 25px Manrope, system-ui, sans-serif';
      g.fillText(clip(g, c.hint, W - pad * 2), pad, H - pad + 4);
    }
    tex.needsUpdate = true;
  }

  return { dolly, active, enter, supported, placeRig, update };
}

function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function wrap(g, text, max) {
  const words = String(text).split(/\s+/), lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
function clip(g, text, max) { let t = String(text); if (g.measureText(t).width <= max) return t; while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; }
