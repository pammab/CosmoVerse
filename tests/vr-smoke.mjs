// VR smoke test without a headset: Meta's Immersive Web Emulation Runtime (IWER) emulates a Quest 3 with hand tracking,
// scripted hands drive the app, a screenshot per step. Not run by `node --test` (needs Chromium + IWER).
// 无头显的 VR 冒烟测试：IWER 模拟 Quest 3 与手部追踪，脚本化的手驱动应用，每步截图。
//
// IWER is loaded ONLY here (never in the app): build it once into /tmp/iwer.module.js, e.g.
//   git clone --depth 1 https://github.com/meta-quest/immersive-web-emulation-runtime /tmp/iwer-src
//   git clone --depth 1 --branch v3.4.4 https://github.com/toji/gl-matrix /tmp/iwer-deps/gl-matrix
//   git clone --depth 1 https://github.com/immersive-web/webxr-layers-polyfill /tmp/iwer-deps/layers
//   echo "export const VERSION = '2.8.0';" > /tmp/iwer-src/packages/iwer/src/version.ts
//   esbuild /tmp/iwer-src/packages/iwer/src/index.ts --bundle --format=esm --outfile=/tmp/iwer.module.js \
//     --alias:gl-matrix=/tmp/iwer-deps/gl-matrix/src/index.js --alias:webxr-layers-polyfill=/tmp/iwer-deps/layers/build/webxr-layers-polyfill.module.js
// (or `npm pack iwer` into /tmp where the npm registry is reachable). Serve the repo on :8765, then:
//   node tests/vr-smoke.mjs <out-dir>
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';

const OUT = process.argv[2] || '.';
const IWER = process.env.IWER || '/tmp/iwer.module.js';
const THREE = process.env.THREE || '/tmp/three/build/three.module.js';
const W = 1280, H = 720;
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
    `<script type="module">import { XRDevice, metaQuest3 } from 'https://iwer.test/iwer.js';
     const d = new XRDevice(metaQuest3); d.installRuntime({ forceInstall: true }); d.primaryInputMode = 'hand'; window.__xrd = d;</script>
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

log.push('vr button: ' + !!(await page.$('#vr')));
await step('1-enter-vr', async () => {
  await page.click('#vr');
  await page.waitForFunction(() => document.body.classList.contains('xr-on'), null, { timeout: 30000 });
  await remote('set_device_state', {});   // headset 1.6 m, hands 1.3 m (resets input to controllers) · 默认姿态
  await remote('set_input_mode', { mode: 'hand' });
  await page.waitForTimeout(1500);
});
// The app opens on the universe cover: travel to the Solar System with the VR ladder menu · 从宇宙封面经 VR 阶梯菜单回到太阳系
await step('1b-menu-point-solar-system', async () => { await pointAt({ menuRow: 'L:solar-system', rows: await ladderIds() }, 2000); await restRight(); await settle(); });
await step('2-point-hold-saturn', async () => { await pointAt({ body: 'saturn' }); await settle(); });
// ℹ What is this? in a close-up: open the row, point at Saturn's hexagon (a landmark row), then close the list · “这是什么？”
const whatState = () => page.evaluate(() => JSON.stringify({ rows: SolarAtlas.vrMenuIds().filter(i => i.startsWith('W:')) }));
await step('2b-what-is-this-open', async () => { await pointAt({ menuRow: 'W:open', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); log.push('  ' + await whatState()); });
await step('2c-what-is-the-hexagon', async () => {
  const idx = await page.evaluate(() => SolarAtlas.bodies.saturn.hl.items.findIndex(it => it.key === 'spot-saturn-hexagon'));
  await pointAt({ menuRow: 'W:' + idx, rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(800);
  log.push('  what: ' + await page.evaluate(() => document.getElementById('whatName')?.innerText || '-'));
});
await step('2d-what-close', async () => { await pointAt({ menuRow: 'W:open', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); });
await step('3-fist-back', async () => {
  await remote('set_hand_pose', { device: 'hand-right', poseId: 'fist', duration: 0.2 });
  await remote('set_transform', { device: 'hand-right', anchor: 'wrist', position: { x: 0.12, y: 1.3, z: -0.35 }, orientation: { fingers: 'forward', palm: 'left' } });
  await page.waitForTimeout(2500); await settle();
});
// One-hand pinch, then move the hand up/down: zoom (repeat strokes to pass the overview's edge) · 单手捏合上下移动缩放
for (const [dir, dy] of [['up', 0.22], ['down', -0.22]]) {
  await step(`4-pinch-${dir}`, async () => {
    for (let k = 0; k < 5; k++) {
      await remote('set_hand_pose', { device: 'hand-right', poseId: 'default', duration: 0.1 });
      await remote('set_transform', { device: 'hand-right', anchor: 'grasp', position: { x: 0.12, y: 1.25 - dy / 2, z: -0.4 }, orientation: 'auto' });
      await page.waitForTimeout(300);
      await remote('set_select_value', { device: 'hand-right', value: 1, duration: 0.15 });
      await page.waitForTimeout(400);
      await remote('animate_to', { device: 'hand-right', anchor: 'grasp', position: { x: 0.12, y: 1.25 + dy / 2, z: -0.4 }, duration: 0.6 });
      await page.waitForTimeout(300);
      await remote('set_select_value', { device: 'hand-right', value: 0, duration: 0.1 });
      await page.waitForTimeout(400);
    }
    await settle();
  });
}
// Both hands pinch and pull apart / push together · 双手捏合拉开/合拢
for (const [name, from, to] of [['5-two-hand-apart', 0.12, 0.34], ['5-two-hand-together', 0.34, 0.08]]) {
  await step(name, async () => {
    for (let k = 0; k < 3; k++) {
      for (const [hand, s] of [['hand-left', -1], ['hand-right', 1]]) await remote('set_transform', { device: hand, anchor: 'grasp', position: { x: s * from, y: 1.25, z: -0.4 }, orientation: 'auto' });
      await page.waitForTimeout(300);
      await Promise.all(['hand-left', 'hand-right'].map(hand => remote('set_select_value', { device: hand, value: 1, duration: 0.15 })));
      await page.waitForTimeout(500);
      await Promise.all([['hand-left', -1], ['hand-right', 1]].map(([hand, s]) => remote('animate_to', { device: hand, anchor: 'grasp', position: { x: s * to, y: 1.25, z: -0.4 }, duration: 0.7 })));
      await page.waitForTimeout(400);
      await Promise.all(['hand-left', 'hand-right'].map(hand => remote('set_select_value', { device: hand, value: 0, duration: 0.1 })));
      await page.waitForTimeout(400);
    }
    await remote('set_transform', { device: 'hand-left', anchor: 'wrist', position: { x: -0.25, y: 0.9, z: -0.1 }, orientation: { fingers: 'down', palm: 'right' } });
    await settle();
  });
}
// Left VR ladder menu: point + hold "Galaxy", then touch "Solar System" with the fingertip · 左侧菜单：指向停留 / 指尖触碰
await step('6-menu-point-galaxy', async () => { await pointAt({ menuRow: 'L:galaxy', rows: await ladderIds() }, 2000); await restRight(); await settle(); });
await step('7-menu-touch-solar-system', async () => {
  const p = await tipToward({ menuRow: 'L:solar-system', rows: await ladderIds(), touch: true });
  await remote('set_hand_pose', { device: 'hand-right', poseId: 'point', duration: 0.2 });
  await remote('set_transform', { device: 'hand-right', anchor: 'index-tip', position: { ...p, z: p.z + 0.08 }, orientation: 'auto' });
  await remote('animate_to', { device: 'hand-right', anchor: 'index-tip', position: p, duration: 0.4 });
  await page.waitForTimeout(800); await restRight(); await settle();
});
// ⟵ Back: open Earth by pointing, then touch the Back button · 返回按钮
await step('8-point-earth', async () => { await pointAt({ body: 'earth' }); await restRight(); await settle(); });
await step('9-back-button', async () => {
  const p = await page.evaluate(() => {
    const cam = SolarAtlas.camera, dolly = cam.parent, V = cam.position.constructor;
    let btn = null; dolly.traverse(o => { if (o.visible && o.geometry?.parameters?.width === 0.24 && o.geometry.parameters.height === 0.075) btn = o; });   // xr.js BTN_W × BTN_H
    if (!btn) return null; const w = btn.getWorldPosition(new V()); dolly.worldToLocal(w); return { x: w.x, y: w.y, z: w.z };
  });
  if (!p) throw new Error('no Back button found');
  await remote('set_hand_pose', { device: 'hand-right', poseId: 'point', duration: 0.2 });
  await remote('set_transform', { device: 'hand-right', anchor: 'index-tip', position: { ...p, z: p.z + 0.08 }, orientation: 'auto' });
  await remote('animate_to', { device: 'hand-right', anchor: 'index-tip', position: p, duration: 0.4 });
  await page.waitForTimeout(800); await restRight(); await settle();
});
// ★ Favourites (last menu row): open it, save this place, go elsewhere, fly back from the list · 收藏：打开、保存、飞回
const favState = () => page.evaluate(() => JSON.stringify({ open: !!document.querySelector('#favMenu'), favs: JSON.parse(localStorage.getItem('cv-favs') || '[]') }));
await step('10-menu-open-favourites', async () => { await pointAt({ menuRow: 'FAV:menu', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); log.push('  ' + await favState()); });
await step('11-menu-save-this-place', async () => { await pointAt({ menuRow: 'S:fav', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); log.push('  ' + await favState()); });
await step('12-menu-galaxy', async () => { await pointAt({ menuRow: 'L:galaxy', rows: await ladderIds() }, 2000); await restRight(); await settle(); });
await step('13-favourite-fly-back', async () => {
  if (!(await page.evaluate(() => !!document.querySelector('#favMenu')))) { await pointAt({ menuRow: 'FAV:menu', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); }
  await pointAt({ menuRow: 'F:L:solar-system', rows: await ladderIds() }, 2000); await restRight(); await settle(); log.push('  ' + await favState());
});
// 💬 Ask Cosmo in VR: open the questions, point at the first one; with no server the panel must say the AI needs the online version
// VR 中问 Cosmo：打开问题，指向第一个；没有服务器时面板应说明需要在线版
const askState = () => page.evaluate(() => JSON.stringify(SolarAtlas.vrAsk));
await step('14-menu-ask-cosmo', async () => { await pointAt({ menuRow: 'C:ask', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); log.push('  ' + await askState() + ' rows ' + (await ladderIds()).filter(i => i.startsWith('C:')).join(',')); });
await step('15-ask-first-question', async () => { await pointAt({ menuRow: 'C:q0', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(2500); log.push('  ' + await askState()); });
// with a (mocked) AI server the answer shows on the VR panel · 有（模拟的）AI 服务器时回答显示在 VR 面板
await step('15b-ask-with-server', async () => {
  await page.route('**/api/chat', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'TEST ANSWER (mocked server, not a fact).' }) }));
  await pointAt({ menuRow: 'C:q1', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(2500); log.push('  ' + await askState());
  await page.unroute('**/api/chat');
});
// lower your hand after the answer: Ask Cosmo closes by itself (Pamela, Nov 17) · 回答后放下手，问答面板自动关闭
await step('15c-lower-hand-closes', async () => {
  await page.route('**/api/chat', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'TEST ANSWER (mocked server, not a fact).' }) }));
  await pointAt({ menuRow: 'C:q2', rows: await ladderIds() }, 2000); await page.waitForTimeout(1500);   // answer arrives with the hand still up · 手仍举着时回答到达
  log.push('  before: ' + await askState());
  // both hands down at your sides (IWER keeps the left hand up at 1.3 m otherwise) · 双手放到身侧
  await remote('set_transform', { device: 'hand-right', anchor: 'wrist', position: { x: 0.25, y: 0.75, z: 0.05 }, orientation: { fingers: 'down', palm: 'left' } });
  await remote('set_transform', { device: 'hand-left', anchor: 'wrist', position: { x: -0.25, y: 0.75, z: 0.05 }, orientation: { fingers: 'down', palm: 'right' } });
  await page.waitForTimeout(3000); log.push('  lowered to read (must stay open): ' + await askState());
  // two-hand zoom after the answer must not close it · 回答后双手缩放不应关闭
  for (const [hd, x] of [['hand-left', -0.15], ['hand-right', 0.15]]) await remote('set_transform', { device: hd, anchor: 'grasp', position: { x, y: 1.25, z: -0.4 }, orientation: 'auto' });
  await Promise.all(['hand-left', 'hand-right'].map(hd => remote('set_select_value', { device: hd, value: 1, duration: 0.15 }))); await page.waitForTimeout(2500);
  await Promise.all(['hand-left', 'hand-right'].map(hd => remote('set_select_value', { device: hd, value: 0, duration: 0.1 }))); await page.waitForTimeout(300);
  log.push('  after a two-hand pinch (must stay open): ' + await askState());
  // raise the hand again, then lower it: now it closes · 再举手后放下：关闭
  await remote('set_transform', { device: 'hand-right', anchor: 'wrist', position: { x: 0.15, y: 1.35, z: -0.4 }, orientation: { fingers: 'forward', palm: 'left' } }); await page.waitForTimeout(800);
  await remote('set_transform', { device: 'hand-right', anchor: 'wrist', position: { x: 0.25, y: 0.75, z: 0.05 }, orientation: { fingers: 'down', palm: 'left' } });
  await remote('set_transform', { device: 'hand-left', anchor: 'wrist', position: { x: -0.25, y: 0.75, z: 0.05 }, orientation: { fingers: 'down', palm: 'right' } });
  await page.waitForTimeout(2600); log.push('  raised again, then lowered (closes): ' + await askState());
  await page.unroute('**/api/chat');
  await restRight(); await page.waitForTimeout(500);
  await pointAt({ menuRow: 'C:ask', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600);   // open the questions again (point + hold) for step 16 · 指向停留重新打开
});
await step('16-close-questions', async () => { await pointAt({ menuRow: 'C:close', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); log.push('  ' + await askState()); });
// 📅 Coming up in VR: open the row, point at the first event, it flies there · VR 中的“即将到来”
await step('17-menu-coming-up', async () => { await pointAt({ menuRow: 'K:cal', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); log.push('  rows ' + (await ladderIds()).filter(i => i.startsWith('K:')).join(',')); });
await step('18-fly-to-first-event', async () => { await pointAt({ menuRow: 'K:f0', rows: await ladderIds() }, 2000); await restRight(); await settle(); });
// 📰 News in VR: open the row, point at the first story, it flies there · VR 中的新闻
await step('19-menu-news', async () => { await pointAt({ menuRow: 'N:news', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600); log.push('  rows ' + (await ladderIds()).filter(i => i.startsWith('N:')).join(',')); });
await step('20-fly-to-a-story', async () => { await pointAt({ menuRow: 'N:f0', rows: await ladderIds() }, 2000); await restRight(); await settle(); });
// 🧭 How to move in VR: the top row opens the hand-gesture guide on the panel · VR 中的“怎么操作”
await step('21-menu-how-to-move', async () => { await pointAt({ menuRow: 'G:guide', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(800); log.push('  guide open: ' + await page.evaluate(() => SolarAtlas.vrGuide)); });
// 📔 Logbook in VR: the row shows rank and count; open, the panel shows today's place and the streak · VR 中的日志
await step('22-menu-logbook', async () => { await pointAt({ menuRow: 'O:log', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(800); log.push('  rows ' + (await ladderIds()).filter(i => i.startsWith('O:')).join(',') + ' stamps ' + await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('cv-logbook') || '{"stamps":{}}').stamps).length)); });
// 🎯 Weekly missions in VR: with the logbook open, the first mission row flies to its place and ticks it · VR 中的每周任务
await step('23-menu-mission', async () => { const rows = await ladderIds(); log.push('  mission rows ' + rows.filter(i => /^O:m/.test(i)).join(',')); await pointAt({ menuRow: rows.find(i => /^O:m/.test(i)) || 'O:log', rows }, 2000); await restRight(); await settle(); log.push('  missions done ' + await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('cv-logbook') || '{}').mission))); });
await step('24-menu-logbook-after-mission', async () => { await pointAt({ menuRow: 'O:log', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(800); });
// 📚 Sources & licences in VR: the row opens a short panel (agencies, licences) · VR 中的来源与许可
await step('25-menu-sources-licences', async () => { await pointAt({ menuRow: 'R:refs', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(800); log.push('  refs rows ' + (await ladderIds()).filter(i => i.startsWith('R:')).join(',')); });
// 🪐 Your planet in VR: open the row, point at a preset; the panel shows the imaginary planet's results · VR 中的“你的行星”
await step('26-menu-your-planet', async () => { await pointAt({ menuRow: 'Y:pm', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(600);
  log.push('  rows ' + (await ladderIds()).filter(i => i.startsWith('Y:')).join(','));
  await pointAt({ menuRow: 'Y:ocean', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(1500);
  log.push('  planet ' + JSON.stringify(await page.evaluate(() => SolarAtlas.myPlanet)) + ' panel ' + JSON.stringify(await page.evaluate(() => SolarAtlas.vrPanel?.()?.facts?.map(f => f.join(': ')) ?? null))); });
// 🎙 Voice commands in VR (the same runner the ✌ / 🎙 row uses after speech-to-text): go to a level, then open the voice guide · VR 语音指令
await step('27-voice-go-to-galaxy', async () => { log.push('  voice row: ' + (await ladderIds()).includes('C:voice')); await page.evaluate(() => SolarAtlas.ask('go to the galaxy')); await settle(); await page.waitForTimeout(600);
  log.push('  panel: ' + JSON.stringify(await page.evaluate(() => { const a = SolarAtlas.vrAsk; return { open: a.open, q: a.q, a: a.a }; }))); });
await step('28-voice-how-to-move', async () => { await page.evaluate(() => SolarAtlas.ask('how do I move?')); await page.waitForTimeout(800); log.push('  guide ' + await page.evaluate(() => SolarAtlas.vrGuide)); });
log.push('errors: ' + JSON.stringify(errors));
console.log(log.join('\n'));
await browser.close();
