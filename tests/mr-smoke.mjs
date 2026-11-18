// Mixed reality ("universe on your table") smoke test without a headset: IWER emulates a Quest 3 in immersive-ar with
// hand tracking, a tiny synthetic room gives a floor and a table (plane detection + hit test). Not run by `node --test`.
// Build IWER as described in tests/vr-smoke.mjs, serve the repo on :8765, then:  node tests/mr-smoke.mjs <out-dir>
// 混合现实冒烟测试：IWER 模拟 Quest 3 的 immersive-ar 与手部追踪，合成房间提供地板和桌子。
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';

const OUT = process.argv[2] || '.';
const IWER = process.env.IWER || '/tmp/iwer.module.js';
const THREE = process.env.THREE || '/tmp/three/build/three.module.js';
const W = 1280, H = 720, TABLE_Y = +(process.env.TABLE_Y || 0.75);
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [], log = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: THREE, contentType: 'text/javascript' }));
await page.route('https://iwer.test/iwer.js', r => r.fulfill({ path: IWER, contentType: 'text/javascript' }));
// Install the emulated Quest 3 before main.js runs (module scripts run in document order) · 在 main.js 之前安装模拟设备
await page.route('http://localhost:8765/index.html', async r => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace('<script type="module" src="main.js"></script>',
    `<script type="module">import { XRDevice, metaQuest3, NativePlane } from 'https://iwer.test/iwer.js';
     const d = new XRDevice(metaQuest3); d.installRuntime({ forceInstall: true }); d.primaryInputMode = 'hand'; window.__xrd = d;
     // A tiny synthetic room instead of @iwer/sem: floor + a table (planes + hit test) and a painted "passthrough" picture
     // 简易合成房间：地板 + 桌子（平面与命中测试）以及模拟透视画面
     const R = XRRigidTransform, P = (x, z) => new DOMPointReadOnly(x, 0, z, 1);
     const TABLE_Y = ${TABLE_Y};
     const planes = [
       new NativePlane(new R({ x: 0, y: 0, z: 0 }), [P(-3, -3), P(3, -3), P(3, 3), P(-3, 3)], 'floor'),
       new NativePlane(new R({ x: 0, y: TABLE_Y, z: -0.95 }), [P(-0.6, -0.45), P(0.6, -0.45), P(0.6, 0.45), P(-0.6, 0.45)], 'table'),
     ];
     class FakeSEM {
       constructor() { this.version = 'test'; this.planesVisible = false; this.boundingBoxesVisible = false; this.meshesVisible = false;
         this.c = document.createElement('canvas'); this.c.width = 1280; this.c.height = 720; Object.assign(this.c.style, { position: 'absolute', inset: 0, width: '100%', height: '100%' });
         const g = this.c.getContext('2d'), wall = g.createLinearGradient(0, 0, 0, 720); wall.addColorStop(0, '#b9b2a6'); wall.addColorStop(0.55, '#8f877b'); wall.addColorStop(0.56, '#6d5a45'); wall.addColorStop(1, '#4e3f30');
         g.fillStyle = wall; g.fillRect(0, 0, 1280, 720); g.fillStyle = '#7a5a3a'; g.beginPath(); g.moveTo(300, 470); g.lineTo(980, 470); g.lineTo(1180, 720); g.lineTo(100, 720); g.fill();
         g.fillStyle = '#c9c1b3'; g.fillRect(860, 120, 220, 160); g.fillStyle = '#9fb7c9'; g.fillRect(872, 132, 196, 136); }
       get environmentCanvas() { return this.c; } get trackedPlanes() { return new Set(planes); } get trackedMeshes() { return new Set(); }
       render() {} loadEnvironment() {} async loadDefaultEnvironment() {} deleteAll() {} computeDepthBuffer() { return null; }
       computeHitTestResults(m) {   // ray = -Z of the matrix · 射线沿矩阵的 -Z
         const o = [m[12], m[13], m[14]], dir = [-m[8], -m[9], -m[10]], out = [];
         for (const [y, x0, x1, z0, z1] of [[TABLE_Y, -0.6, 0.6, -1.4, -0.5], [0, -3, 3, -3, 3]]) {
           if (Math.abs(dir[1]) < 1e-6) continue; const t = (y - o[1]) / dir[1]; if (t <= 0) continue;
           const x = o[0] + dir[0] * t, z = o[2] + dir[2] * t; if (x < x0 || x > x1 || z < z0 || z > z1) continue;
           out.push({ t, mat: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]) });
         }
         return out.sort((a, b) => a.t - b.t).map(h => h.mat);
       }
     }
     d.installSEM(FakeSEM);</script>
     <script type="module" src="main.js"></script>`);
  r.fulfill({ body: html, contentType: 'text/html' });
});
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction(() => window.SolarAtlas?.journey && window.__xrd, null, { timeout: 60000 });
await page.waitForTimeout(3000);

const remote = (cmd, args) => page.evaluate(([c, a]) => window.__xrd.remote.dispatch(c, a), [cmd, args]);
const state = () => page.evaluate(() => JSON.stringify({ mode: SolarAtlas.mode, level: SolarAtlas.journey.level, piece: SolarAtlas.journey.piece, focus: SolarAtlas.focusId, xr: document.body.classList.contains('xr-on') }));
const shot = async name => { await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/${name}.png` }); };
const settle = () => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 90000 }).then(() => page.waitForTimeout(800));
const step = async (name, fn) => {
  const t = Date.now();
  try { await fn(); log.push(`${name} → ${await state()} (${((Date.now() - t) / 1000).toFixed(1)} s)`); }
  catch (e) { log.push(`${name} FAILED: ${e.message.split('\n')[0]}`); }
  await shot(name);
};
// Where to put the right index fingertip so it lies on the ray from the eyes to a world point (reference space = dolly space)
// 让指尖位于从眼睛到目标的射线上（参考空间 = dolly 空间）
const tipToward = (what, dist = 0.42) => page.evaluate(([what, dist]) => {
  const cam = SolarAtlas.camera, dolly = cam.parent, V = cam.position.constructor;
  const head = cam.getWorldPosition(new V()), target = new V();
  if (what.body) SolarAtlas.bodies[what.body].anchor.getWorldPosition(target);
  else if (what.menuRow) {   // a row on the left VR ladder menu · 左侧 VR 阶梯菜单的一行
    const menu = dolly.children.find(o => o.geometry?.parameters?.width === 0.3 && o.geometry?.parameters?.height === 0.62);
    const img = menu.material.map.image, rows = what.rows, i = rows.indexOf(what.menuRow);
    if (i < 0) return null;
    const rh = Math.min(64, (img.height - 70 - 20) / rows.length), v = (70 + (i + 0.5) * rh) / img.height;
    target.set(-0.05, 0.62 * (0.5 - v), 0); menu.localToWorld(target);
    if (what.touch) { dolly.worldToLocal(target); return { x: target.x, y: target.y, z: target.z }; }
  }
  const dir = target.sub(head).normalize(), tip = head.add(dir.multiplyScalar(dist * dolly.scale.x));
  dolly.worldToLocal(tip); return { x: tip.x, y: tip.y, z: tip.z };
}, [what, dist]);
// the VR panel's own rows (it has VR-only rows such as Ask Cosmo) · VR 面板自己的行
const ladderIds = () => page.evaluate(() => SolarAtlas.vrMenuIds?.() || [...document.querySelectorAll('#ladder button[data-go]')].map(b => b.dataset.go).filter(id => id !== 'toggle'));
const pointAt = async (what, holdMs = 2200) => {
  await remote('set_hand_pose', { device: 'hand-right', poseId: 'point', duration: 0.2 });
  const p = await tipToward(what); if (!p) throw new Error('no target ' + JSON.stringify(what));
  await remote('animate_to', { device: 'hand-right', anchor: 'index-tip', position: p, orientation: 'auto', duration: 0.4 });
  for (let t = 0; t < holdMs; t += 300) {   // keep the tip on target while the view moves · 视角变化时保持指向
    const q = await tipToward(what); if (q) await remote('set_transform', { device: 'hand-right', anchor: 'index-tip', position: q, orientation: 'auto' });
    await page.waitForTimeout(300);
  }
};
const restRight = () => remote('set_transform', { device: 'hand-right', anchor: 'wrist', position: { x: 0.25, y: 0.9, z: -0.1 }, orientation: { fingers: 'down', palm: 'left' } });


const mr = () => page.evaluate(() => JSON.stringify({ ...SolarAtlas.mr, ring: (() => { let r = null; SolarAtlas.camera.parent.traverse(o => { if (o.geometry?.type === 'RingGeometry') r = o; }); return r && r.visible ? [r.position.x, r.position.y, r.position.z].map(v => +v.toFixed(2)) : null; })(), dollyScale: +SolarAtlas.camera.parent.scale.x.toFixed(1) }));
log.push('vr button: ' + !!(await page.$('#vr')) + ', mr button visible: ' + await page.$eval('#mr', b => getComputedStyle(b).display !== 'none').catch(() => false));
await page.screenshot({ path: `${OUT}/0-desktop-buttons.png` });
await step('1-enter-mr-placing', async () => {
  await page.click('#mr');
  await page.waitForFunction(() => document.body.classList.contains('xr-on'), null, { timeout: 30000 });
  await remote('set_device_state', {});
  await remote('set_input_mode', { mode: 'hand' });
  await page.waitForTimeout(2500);
  log.push('  mr state: ' + await mr());
});
await step('2-aim-and-pinch-to-place', async () => {
  // aim the right hand down at the table, then pinch · 右手瞄准桌面并捏合
  await remote('set_hand_pose', { device: 'hand-right', poseId: 'default', duration: 0.1 });
  await remote('set_transform', { device: 'hand-right', anchor: 'grasp', position: { x: 0.15, y: 1.25, z: -0.35 }, orientation: { fingers: 'forward', palm: 'down' } });
  await page.waitForTimeout(1500);
  log.push('  aiming: ' + await mr());
  await remote('set_select_value', { device: 'hand-right', value: 1, duration: 0.15 });
  await page.waitForTimeout(500);
  await remote('set_select_value', { device: 'hand-right', value: 0, duration: 0.1 });
  await restRight(); await page.waitForTimeout(1500);
  log.push('  placed: ' + await mr());
});
// The app opens on the universe cover (it stands on the table too); go to the Solar System · 封面也立在桌上；回到太阳系
await step('2b-solar-system', async () => { await page.evaluate(() => SolarAtlas.home()); await settle(); });
await step('3-point-hold-saturn', async () => { await pointAt({ body: 'saturn' }); await restRight(); await settle(); log.push('  ' + await mr()); });
await step('4-fist-back', async () => {
  await remote('set_hand_pose', { device: 'hand-right', poseId: 'fist', duration: 0.2 });
  await remote('set_transform', { device: 'hand-right', anchor: 'wrist', position: { x: 0.12, y: 1.3, z: -0.35 }, orientation: { fingers: 'forward', palm: 'left' } });
  await page.waitForTimeout(2500);
  // open the hand (the emulated hand otherwise stays a fist through step 5, and a held fist at the Solar System goes on to the cover)
  // 松开拳头（否则模拟手在第 5 步仍是拳头，在太阳系握拳会回到宇宙封面）
  await remote('set_hand_pose', { device: 'hand-right', poseId: 'default', duration: 0.1 }); await restRight(); await settle();
});
await step('5-two-hand-apart', async () => {
  for (let k = 0; k < 2; k++) {
    for (const [hand, s] of [['hand-left', -1], ['hand-right', 1]]) await remote('set_transform', { device: hand, anchor: 'grasp', position: { x: s * 0.1, y: 1.25, z: -0.4 }, orientation: 'auto' });
    await page.waitForTimeout(300);
    await Promise.all(['hand-left', 'hand-right'].map(hand => remote('set_select_value', { device: hand, value: 1, duration: 0.15 })));
    await page.waitForTimeout(500);
    await Promise.all([['hand-left', -1], ['hand-right', 1]].map(([hand, s]) => remote('animate_to', { device: hand, anchor: 'grasp', position: { x: s * 0.3, y: 1.25, z: -0.4 }, duration: 0.7 })));
    await page.waitForTimeout(400);
    await Promise.all(['hand-left', 'hand-right'].map(hand => remote('set_select_value', { device: hand, value: 0, duration: 0.1 })));
    await page.waitForTimeout(400);
  }
  await remote('set_transform', { device: 'hand-left', anchor: 'wrist', position: { x: -0.25, y: 0.9, z: -0.1 }, orientation: { fingers: 'down', palm: 'right' } });
  await settle(); log.push('  ' + await mr());
});
await step('6-menu-galaxy-on-table', async () => { await pointAt({ menuRow: 'L:galaxy', rows: await ladderIds() }, 2000); await restRight(); await settle(); log.push('  ' + await mr()); });
await step('7-menu-move-it', async () => { await pointAt({ menuRow: 'M:place', rows: await ladderIds() }, 1500); await restRight(); await page.waitForTimeout(1000); log.push('  ' + await mr()); });
await step('7b-aim-right-of-table-and-pinch', async () => {
  // aim the right hand's ray at the far right corner of the table (global coords: table top at TABLE_Y) · 瞄准桌子右侧
  const hand = { x: 0.2, y: 1.25, z: -0.35 }, target = { x: 0.35, y: TABLE_Y, z: -1.15 };
  await remote('set_hand_pose', { device: 'hand-right', poseId: 'default', duration: 0.1 });
  // IWER reads a 'target-ray' position relative to the 1.6 m headset height (seen in the ray matrices), hence y - 1.6
  // the target ray looks down its -Z: rotate (0,0,-1) onto the direction · 目标射线沿 -Z
  const d = [target.x - hand.x, target.y - hand.y, target.z - hand.z], n = Math.hypot(...d), u = d.map(c => c / n);
  const ax = [0 * u[2] - (-1) * u[1], (-1) * u[0] - 0 * u[2], 0], w = 1 + -u[2], qn = Math.hypot(...ax, w);
  await remote('set_transform', { device: 'hand-right', anchor: 'target-ray', position: { ...hand, y: hand.y - 1.6 }, orientation: { x: ax[0] / qn, y: ax[1] / qn, z: ax[2] / qn, w: w / qn } });
  await page.waitForTimeout(1500); log.push('  aiming: ' + await mr());
  await remote('set_select_value', { device: 'hand-right', value: 1, duration: 0.15 }); await page.waitForTimeout(500);
  await remote('set_select_value', { device: 'hand-right', value: 0, duration: 0.1 });
  await restRight(); await page.waitForTimeout(1500); log.push('  placed: ' + await mr());
});
await page.evaluate(() => SolarAtlas.ladderGo('L:solar-system'));
await page.waitForTimeout(4000); await shot('8-back-to-solar-system');
log.push('errors: ' + JSON.stringify(errors));
console.log(log.join('\n'));
await browser.close();
