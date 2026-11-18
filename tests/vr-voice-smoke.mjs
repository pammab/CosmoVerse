// VR voice-command smoke test (vr-voice): an emulated Quest 3 (IWER, hands) in a browser WITHOUT SpeechRecognition, like the
// Quest Browser: the 🎙 row records from a fake microphone, /api/stt is mocked, and the spoken command runs; then the other
// commands through the same path (SolarAtlas.voiceSay = what happens after speech-to-text). Setup as in tests/vr-smoke.mjs.
// 无语音识别的模拟 Quest：🎙 行录音（假麦克风），/api/stt 被模拟，命令执行。准备工作同 tests/vr-smoke.mjs。
//   node tests/vr-voice-smoke.mjs <out-dir>
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';

const OUT = process.argv[2] || '.';
const IWER = process.env.IWER || '/tmp/iwer.module.js';
const THREE = process.env.THREE || '/tmp/three/build/three.module.js';
const W = 1280, H = 720;
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, permissions: ['microphone'] });
const page = await ctx.newPage();
// Quest Browser has no SpeechRecognition · Quest 浏览器没有语音识别
await page.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
let stt = null;
await page.route('http://localhost:8765/api/stt**', r => { stt = { url: r.request().url(), type: r.request().headers()['content-type'], bytes: (r.request().postDataBuffer() || []).length }; r.fulfill({ status: 200, contentType: 'application/json', body: '{"text":"Andromeda"}' }); });
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


const askState = () => page.evaluate(() => { const a = SolarAtlas.vrAsk; return JSON.stringify({ open: a.open, q: a.q, a: a.a, err: a.err, state: a.state }); });
log.push('vr button: ' + !!(await page.$('#vr')));
await step('v1-enter-vr', async () => {
  await page.click('#vr');
  await page.waitForFunction(() => document.body.classList.contains('xr-on'), null, { timeout: 30000 });
  await remote('set_device_state', {}); await remote('set_input_mode', { mode: 'hand' });
  await page.waitForTimeout(1500);
  log.push('  menu rows with C: ' + (await ladderIds()).filter(i => i.startsWith('C:')).join(','));
});
await step('v2-point-voice-row-listening', async () => {
  await pointAt({ menuRow: 'C:voice', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(700);
  log.push('  ' + await askState());
});
await step('v3-spoken-andromeda', async () => {
  await page.waitForFunction(() => /Andromeda/.test(SolarAtlas.vrAsk.a || ''), null, { timeout: 25000 }); await settle();
  log.push('  /api/stt: ' + JSON.stringify(stt)); log.push('  ' + await askState());
});
for (const [name, said] of [['v4-say-back', 'back'], ['v5-say-galaxy', 'Ir para a Galáxia'], ['v6-say-help', 'what can I say?'], ['v7-say-save', 'save this place'], ['v8-say-zoom-in', 'zoom in'], ['v8b-say-turn-left', 'turn left'], ['v8c-say-what-can-i-say', 'what can I say?'], ['v9-say-saturn', 'go to Saturn'], ['v10-say-zh-andromeda', '去仙女座星系'], ['v11-say-es-back', 'volver']]) {
  await step(name, async () => { await page.evaluate(t => SolarAtlas.ask(t), said); await page.waitForTimeout(500); await settle(); log.push('  "' + said + '" ' + await askState()); });
}
await step('v12-guide-with-voice', async () => { await pointAt({ menuRow: 'G:guide', rows: await ladderIds() }, 2000); await restRight(); await page.waitForTimeout(800); log.push('  guide open: ' + await page.evaluate(() => SolarAtlas.vrGuide)); });
console.log(log.join('\n'));
console.log('ERRORS:', errors.filter(e => !/api\/(voice|tts|chat)|ERR_TUNNEL|501/.test(e)).join('\n') || 'none');
await browser.close();
