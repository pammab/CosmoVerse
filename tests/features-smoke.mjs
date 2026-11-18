// Smoke test for 🎂 Birthday star, 🎵 Orbit harp and 👏 Galaxy merger, desktop and VR (IWER Quest 3 with hands).
// Not run by `node --test` (needs Chromium + IWER, see tests/vr-smoke.mjs for building /tmp/iwer.module.js).
// Serve the repo on :8765, then:  node tests/features-smoke.mjs <out-dir> [birthday,harp,clap]
// 生日星、轨道竖琴、星系合并的冒烟测试（桌面与 VR）。
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';

const OUT = process.argv[2] || '.', ONLY = (process.argv[3] || 'birthday,harp,clap').split(',');
const IWER = process.env.IWER || '/tmp/iwer.module.js', THREE = process.env.THREE || '/tmp/three/build/three.module.js';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [], log = [];
async function newPage(vr) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: THREE, contentType: 'text/javascript' }));
  if (vr) {
    await page.route('https://iwer.test/iwer.js', r => r.fulfill({ path: IWER, contentType: 'text/javascript' }));
    await page.route('http://localhost:8765/index.html*', async r => {
      const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace('<script type="module" src="main.js"></script>',
        `<script type="module">import { XRDevice, metaQuest3 } from 'https://iwer.test/iwer.js';
         const d = new XRDevice(metaQuest3); d.installRuntime({ forceInstall: true }); d.primaryInputMode = 'hand'; window.__xrd = d;</script>
         <script type="module" src="main.js"></script>`);
      r.fulfill({ body: html, contentType: 'text/html' });
    });
  }
  return page;
}
const shot = async (page, name) => { await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 90000 }).catch(e => log.push(`${name} screenshot failed: ${e.message.split('\n')[0]}`)); };
const step = async (page, name, fn) => {
  const t = Date.now();
  try { const r = await fn(); log.push(`${name} ok (${((Date.now() - t) / 1000).toFixed(1)} s)${r ? ' · ' + r : ''}`); }
  catch (e) { log.push(`${name} FAILED: ${e.message.split('\n')[0]}`); }
  console.error(log[log.length - 1]);
  await shot(page, name);
};

/* ── VR helpers (same approach as tests/vr-smoke.mjs) ── */
function vr(page) {
  const remote = (cmd, args) => page.evaluate(([c, a]) => window.__xrd.remote.dispatch(c, a), [cmd, args]);
  const ids = () => page.evaluate(() => SolarAtlas.vrMenuIds());
  const tipToward = (what, dist = 0.42) => page.evaluate(([what, dist]) => {
    const cam = SolarAtlas.camera, dolly = cam.parent, V = cam.position.constructor, head = cam.getWorldPosition(new V()), target = new V();
    const menu = dolly.children.find(o => o.geometry?.parameters?.width === 0.3 && o.geometry?.parameters?.height === 0.62);
    const img = menu.material.map.image, i = what.rows.indexOf(what.menuRow); if (i < 0) return null;
    const rh = Math.min(64, (img.height - 70 - 20) / what.rows.length), v = (70 + (i + 0.5) * rh) / img.height;
    target.set(-0.05, 0.62 * (0.5 - v), 0); menu.localToWorld(target);
    const dir = target.sub(head).normalize(), tip = head.add(dir.multiplyScalar(dist * dolly.scale.x)); dolly.worldToLocal(tip); return { x: tip.x, y: tip.y, z: tip.z };
  }, [what, dist]);
  // fingertip on the ray from the eyes to a body, ~0.42 m out (reference space = dolly space) · 指尖位于眼睛到天体的射线上
  const tipAt = (body, dist = 0.42) => page.evaluate(([body, dist]) => {
    const cam = SolarAtlas.camera, dolly = cam.parent, V = cam.position.constructor, head = cam.getWorldPosition(new V()), t = SolarAtlas.bodies[body].anchor.getWorldPosition(new V());
    const tip = head.add(t.sub(head).normalize().multiplyScalar(dist * dolly.scale.x)); dolly.worldToLocal(tip); return { x: tip.x, y: tip.y, z: tip.z };
  }, [body, dist]);
  const rest = () => remote('set_transform', { device: 'hand-right', anchor: 'wrist', position: { x: 0.25, y: 0.9, z: -0.1 }, orientation: { fingers: 'down', palm: 'left' } });
  const pointRow = async (id, holdMs = 2000) => {
    await remote('set_hand_pose', { device: 'hand-right', poseId: 'point', duration: 0.2 });
    const rows = await ids(), p = await tipToward({ menuRow: id, rows }); if (!p) throw new Error('no row ' + id + ' in ' + rows.join(','));
    await remote('animate_to', { device: 'hand-right', anchor: 'index-tip', position: p, orientation: 'auto', duration: 0.4 });
    for (let t = 0; t < holdMs; t += 300) { const q = await tipToward({ menuRow: id, rows: await ids() }); if (q) await remote('set_transform', { device: 'hand-right', anchor: 'index-tip', position: q, orientation: 'auto' }); await page.waitForTimeout(300); }
    await rest(); await page.waitForTimeout(500);
  };
  const enter = async () => {
    await page.click('#vr'); await page.waitForFunction(() => document.body.classList.contains('xr-on'), null, { timeout: 30000 });
    await remote('set_device_state', {}); await remote('set_input_mode', { mode: 'hand' }); await page.waitForTimeout(1500);
  };
  return { remote, ids, pointRow, rest, enter, tipAt };
}
const ready = page => page.waitForFunction(() => window.SolarAtlas?.journey, null, { timeout: 60000 }).then(() => page.waitForTimeout(3000));
const settle = page => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 90000 }).then(() => page.waitForTimeout(800));

/* ── 🎂 Birthday star ── */
if (ONLY.includes('birthday')) {
  const page = await newPage(false);
  await page.goto('http://localhost:8765/index.html?start=solar'); await ready(page);
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await step(page, 'b1-more-menu', async () => { await page.click('#moreBtn'); return 'bsOpen visible: ' + await page.isVisible('#bsOpen'); });
  await step(page, 'b2-card-open', async () => { await page.click('#bsOpen'); await page.waitForSelector('#bsCard:not([hidden])'); });
  await step(page, 'b3-year-1998', async () => { await page.fill('#bsYear', '1998'); await page.click('#bsForm button[type=submit]'); await page.waitForSelector('.bsstar');
    return await page.evaluate(() => document.querySelector('.bsstar b .en').textContent + ' | ' + document.querySelector('.bsleft .en').textContent); });
  await step(page, 'b4-portuguese', async () => { await page.selectOption('#language', 'pt').catch(async () => { await page.click('#moreBtn'); await page.selectOption('#language', 'pt'); }); await page.waitForTimeout(600);
    return await page.evaluate(() => document.querySelector('.bsleft .pt')?.textContent); });
  await step(page, 'b5-bad-year', async () => { await page.selectOption('#language', 'en').catch(() => {}); await page.fill('#bsYear', '1850'); await page.click('#bsForm button[type=submit]'); return await page.evaluate(() => document.querySelector('.bserr .en')?.textContent); });
  await step(page, 'b6-young', async () => { await page.fill('#bsYear', String(new Date().getFullYear() - 1)); await page.click('#bsForm button[type=submit]'); return await page.evaluate(() => document.querySelector('.bsleft .en')?.textContent.slice(0, 90)); });
  await step(page, 'b7-phone', async () => { await page.setViewportSize({ width: 390, height: 844 }); await page.fill('#bsYear', '1975'); await page.click('#bsForm button[type=submit]'); });
  await page.close();
  const v = await newPage(true); const X = vr(v);
  await v.goto('http://localhost:8765/index.html?start=solar'); await v.waitForFunction(() => window.SolarAtlas?.journey && window.__xrd, null, { timeout: 60000 }); await v.waitForTimeout(3000);
  await step(v, 'b8-vr-enter', () => X.enter());
  await step(v, 'b9-vr-row-open', async () => { await X.pointRow('Z:bs'); return JSON.stringify({ vr: await v.evaluate(() => SolarAtlas.birthday.vr), year: await v.evaluate(() => SolarAtlas.birthday.year), rows: (await X.ids()).filter(i => i.startsWith('Z:')) }); });
  await step(v, 'b10-vr-minus10', async () => { await X.pointRow('Z:-10'); return 'year ' + await v.evaluate(() => SolarAtlas.birthday.year); });
  await step(v, 'b11-vr-plus1', async () => { await X.pointRow('Z:+1'); return 'year ' + await v.evaluate(() => SolarAtlas.birthday.year); });
  await v.close();
}
/* ── 🎵 Orbit harp ── */
if (ONLY.includes('harp')) {
  const page = await newPage(false);
  await page.goto('http://localhost:8765/index.html?start=solar'); await ready(page);
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const st = () => page.evaluate(() => JSON.stringify({ on: SolarAtlas.harp.on, last: SolarAtlas.harp.last, plucks: SolarAtlas.harp.plucks, mode: SolarAtlas.mode }));
  await step(page, 'h1-open', async () => { await page.click('#moreBtn'); await page.click('#harpOpen'); await page.waitForTimeout(2500); return await st(); });
  // sweep the mouse from the Sun outward, past every orbit · 鼠标从太阳向外扫过所有轨道
  await step(page, 'h2-mouse-sweep', async () => {
    const sun = await page.evaluate(() => SolarAtlas.screenOf('sun'));
    for (let k = 0; k <= 40; k++) { await page.mouse.move(sun.x + k * 15, sun.y + k * 4); await page.waitForTimeout(25); }
    await page.waitForTimeout(150); return await st();
  });
  // webcam hand path: the same onHand the camera tracker feeds · 摄像头手势路径
  await step(page, 'h3-hand-sweep', async () => {
    const sun = await page.evaluate(() => SolarAtlas.screenOf('sun')), before = await page.evaluate(() => SolarAtlas.harp.plucks);
    for (let k = 0; k <= 30; k++) await page.evaluate(([x, y]) => SolarAtlas.simulateHand({ present: true, gesture: 'point', cursor: { x: x / innerWidth, y: y / innerHeight }, openness: 0.5, gain: 1 }), [sun.x - k * 18, sun.y - k * 2]);
    await page.evaluate(() => SolarAtlas.simulateHand({ present: false, gesture: 'none' }));
    return 'new plucks ' + ((await page.evaluate(() => SolarAtlas.harp.plucks)) - before) + ' · ' + await st();
  });
  await step(page, 'h4-play-all', async () => { await page.click('#harpAll'); await page.waitForTimeout(1300); return await st(); });
  await step(page, 'h5-moons', async () => { await page.click('#harpMoonsBtn'); await page.waitForTimeout(900); return 'moons shown: ' + await page.isVisible('#harpMoons'); });
  await step(page, 'h6-spanish', async () => { await page.selectOption('#language', 'es').catch(() => {}); await page.waitForTimeout(500); return await page.evaluate(() => document.querySelector('#harpLast .es')?.textContent); });
  await step(page, 'h7-close', async () => { await page.selectOption('#language', 'en').catch(() => {}); await page.click('#harpClose'); await page.waitForTimeout(400); return await st(); });
  await page.close();
  const v = await newPage(true); const X = vr(v);
  await v.goto('http://localhost:8765/index.html?start=solar'); await v.waitForFunction(() => window.SolarAtlas?.journey && window.__xrd, null, { timeout: 60000 }); await v.waitForTimeout(3000);
  const vst = () => v.evaluate(() => JSON.stringify({ on: SolarAtlas.harp.on, last: SolarAtlas.harp.last, plucks: SolarAtlas.harp.plucks, mode: SolarAtlas.mode }));
  await step(v, 'h8-vr-enter', () => X.enter());
  await step(v, 'h9-vr-row', async () => { await X.pointRow('H:harp'); await v.waitForTimeout(2000); return await vst() + ' rows ' + (await X.ids()).filter(i => i.startsWith('H:')).join(','); });
  // sweep the pointing fingertip across the view: the aim crosses the orbits · 指尖横扫视野
  await step(v, 'h10-vr-finger-sweep', async () => {
    await X.remote('set_hand_pose', { device: 'hand-right', poseId: 'point', duration: 0.2 });
    const before = await v.evaluate(() => SolarAtlas.harp.plucks), a = await X.tipAt('sun'), b = await X.tipAt('neptune');
    const far = { x: a.x + (b.x - a.x) * 1.3, y: a.y + (b.y - a.y) * 1.3, z: a.z + (b.z - a.z) * 1.3 };   // a little past Neptune's orbit · 略过海王星轨道
    await X.remote('set_transform', { device: 'hand-right', anchor: 'index-tip', position: a, orientation: 'auto' }); await v.waitForTimeout(700);
    await X.remote('animate_to', { device: 'hand-right', anchor: 'index-tip', position: far, duration: 2 }); await v.waitForTimeout(2300);
    return 'new plucks ' + ((await v.evaluate(() => SolarAtlas.harp.plucks)) - before) + ' · ' + await vst();
  });
  await step(v, 'h11-vr-play-all', async () => { await X.rest(); await X.pointRow('H:all'); await v.waitForTimeout(900); return await vst(); });
  await step(v, 'h12-vr-moons', async () => { await X.pointRow('H:moons'); await v.waitForTimeout(600); return await vst(); });
  await v.close();
}
/* ── 👏 Galaxy collision ── */
if (ONLY.includes('clap')) {
  const page = await newPage(false);
  await page.goto('http://localhost:8765/index.html?start=solar'); await ready(page);
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const st = p => p.evaluate(() => JSON.stringify(SolarAtlas.merge.state()));   // drawn: spread of the drawn dots' x (they must move) · 绘制点的范围
  await step(page, 'c1-open-flies', async () => { await page.click('#moreBtn'); await page.click('#mergeOpen'); await settle(page); await page.waitForTimeout(1500); return await st(page); });
  await step(page, 'c2-start', async () => { await page.click('#mergePlay'); await page.waitForTimeout(3000); return await st(page) + ' | ' + await page.textContent('#mergeTime'); });
  await step(page, 'c3-first-pass', async () => { await page.waitForFunction(() => SolarAtlas.merge.state().t > 15.5, null, { timeout: 60000 }); return await st(page); });
  await step(page, 'c4-swing', async () => { await page.waitForFunction(() => SolarAtlas.merge.state().t > 24, null, { timeout: 60000 }); return await st(page); });
  await step(page, 'c5-merged', async () => { await page.waitForFunction(() => SolarAtlas.merge.state().done, null, { timeout: 60000 }); await page.click('#mergeBar summary'); return await st(page); });
  await step(page, 'c6-chinese', async () => { await page.selectOption('#language', 'zh').catch(() => {}); await page.waitForTimeout(500); return await page.evaluate(() => document.querySelector('#mergeTime .zh')?.textContent); });
  // webcam: a pinch replays · 摄像头：捏合重播
  await step(page, 'c7-hand-pinch', async () => {
    await page.selectOption('#language', 'en').catch(() => {});
    await page.evaluate(() => { const h = g => SolarAtlas.simulateHand({ present: true, gesture: g, cursor: { x: 0.5, y: 0.5 }, openness: 0.5, gain: 1 }); h('open'); h('pinch'); SolarAtlas.simulateHand({ present: false, gesture: 'none' }); });
    await page.waitForTimeout(1500); return await st(page);
  });
  await step(page, 'c8-phone', async () => { await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1500); });
  await step(page, 'c9-close', async () => { await page.setViewportSize({ width: 1280, height: 800 }); await page.click('#mergeClose'); await page.waitForTimeout(500); return await st(page) + ' labels back: ' + await page.evaluate(() => !document.body.classList.contains('merging')); });
  await page.close();
  const v = await newPage(true); const X = vr(v);
  await v.goto('http://localhost:8765/index.html?start=solar'); await v.waitForFunction(() => window.SolarAtlas?.journey && window.__xrd, null, { timeout: 60000 }); await v.waitForTimeout(3000);
  await step(v, 'c10-vr-enter', () => X.enter());
  await step(v, 'c11-vr-row', async () => { await X.pointRow('X:merge'); await settle(v); await v.waitForTimeout(1500); return await st(v) + ' rows ' + (await X.ids()).filter(i => i.startsWith('X:')).join(','); });
  // clap: both palms from 40 cm apart to touching in ~0.15 s · 拍手：双掌 0.15 秒内从 40 厘米合拢
  await step(v, 'c12-vr-clap', async () => {
    const pose = (dev, x) => X.remote('set_transform', { device: dev, anchor: 'wrist', position: { x, y: -0.25, z: -0.35 }, orientation: { fingers: 'forward', palm: dev === 'hand-right' ? 'left' : 'right' } });
    await X.remote('set_hand_pose', { device: 'hand-right', poseId: 'relaxed', duration: 0.1 }).catch(() => {});
    await pose('hand-left', -0.22); await pose('hand-right', 0.22); await v.waitForTimeout(600);
    await X.remote('animate_to', { device: 'hand-left', anchor: 'wrist', position: { x: -0.02, y: -0.25, z: -0.35 }, duration: 0.15 });
    await X.remote('animate_to', { device: 'hand-right', anchor: 'wrist', position: { x: 0.02, y: -0.25, z: -0.35 }, duration: 0.15 });
    await v.waitForTimeout(2500); return await st(v);
  });
  await step(v, 'c13-vr-later', async () => { await X.rest(); await X.remote('set_transform', { device: 'hand-left', anchor: 'wrist', position: { x: -0.25, y: -0.6, z: -0.1 }, orientation: { fingers: 'down', palm: 'right' } }); await v.waitForTimeout(9000); return await st(v); });
  await v.close();
}
log.push('errors: ' + (errors.filter(e => !/\/api\//.test(e)).join(' | ') || 'none') + ` (+${errors.filter(e => /\/api\//.test(e)).length} expected /api errors without a server)`);
console.log(log.join('\n'));
await browser.close();
