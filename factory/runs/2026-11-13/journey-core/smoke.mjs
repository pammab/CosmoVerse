// Smoke test for the scale journey. Run from the repo root with the static server on :8765.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const OUT = process.argv[2] || '.';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('response', r => { if (r.status() >= 400) errors.push('http ' + r.status() + ' ' + r.url()); });
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: '/tmp/three/build/three.module.js', contentType: 'text/javascript' }));
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction(() => window.SolarAtlas?.journey, null, { timeout: 30000 });
await page.waitForTimeout(2500);
const log = [];
log.push('vr button: ' + !!(await page.$('#vr')));
await page.screenshot({ path: OUT + '/0-overview.png' });
const settle = () => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 60000 }).then(() => page.waitForTimeout(800));
const state = () => page.evaluate(() => ({ level: SolarAtlas.journey.level, piece: SolarAtlas.journey.piece, mode: document.body.className.match(/mode-\w+/)?.[0] }));
// Wheel out past the overview: should go up one level at a time · 滚轮缩小
await page.mouse.move(720, 450);
const shots = ['1-neighbourhood', '2-galaxy', '3-local-group', '4-supercluster', '5-universe'];
for (const name of shots) {
  for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(40); const s = await state(); if (s.level && name.includes(s.level)) break; }
  await settle();
  const s = await state(); log.push(name + ' → ' + JSON.stringify(s));
  await page.screenshot({ path: `${OUT}/${name}.png` });
}
// Open the observable universe with a click on its centre · 点击打开
const c = await page.evaluate(() => { const v = new SolarAtlas.scene.children[0].position.constructor(0, 0, 0).project(SolarAtlas.camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; });
await page.mouse.click(c.x, c.y); await settle();
log.push('click centre → ' + JSON.stringify(await state()) + ' info visible: ' + await page.$eval('#info', e => !e.classList.contains('hidden')));
await page.screenshot({ path: OUT + '/6-universe-open.png' });
// Back (fist path) then zoom in, down to the galaxy · 返回并放大
await page.evaluate(() => SolarAtlas.journey.back()); await page.waitForTimeout(1500);
log.push('back → ' + JSON.stringify(await state()));
for (let k = 0; k < 3; k++) { for (let i = 0; i < 40; i++) { const before = (await state()).level; await page.mouse.wheel(0, -120); await page.waitForTimeout(40); if ((await state()).level !== before) break; } await settle(); log.push('wheel in → ' + JSON.stringify(await state())); await page.screenshot({ path: `${OUT}/wheel-in-${k}.png` }); }
// Webcam path: simulate a pointing hand held on the Milky Way · 模拟手势指向停留
const mw = await page.evaluate(() => { const v = new SolarAtlas.camera.position.constructor(0, 0, 0).project(SolarAtlas.camera); return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 }; });
for (let i = 0; i < 40; i++) { await page.evaluate(m => SolarAtlas.simulateHand({ present: true, gesture: 'point', cursor: m, openness: 1 }), mw); await page.waitForTimeout(60); }
await settle();
log.push('hand dwell on galaxy → ' + JSON.stringify(await state()));
await page.screenshot({ path: OUT + '/7-milky-way-open.png' });
// Fist held: back to level view, then to the Solar System · 握拳返回
for (const step of ['fist1', 'fist2']) {
  for (let i = 0; i < 25; i++) { await page.evaluate(() => SolarAtlas.simulateHand({ present: true, gesture: 'fist', cursor: { x: .5, y: .5 }, openness: 0.5 })); await page.waitForTimeout(60); }
  await page.evaluate(() => SolarAtlas.simulateHand({ present: true, gesture: 'other', cursor: { x: .5, y: .5 }, openness: 1 })); await page.waitForTimeout(1800);
  log.push(step + ' → ' + JSON.stringify(await state()));
}
await page.evaluate(() => SolarAtlas.simulateHand({ present: false }));
// Local Group via the breadcrumb, opened · 面包屑
await page.evaluate(() => SolarAtlas.journey.open('local-group')); await settle();
log.push('open local-group → ' + JSON.stringify(await state()));
await page.screenshot({ path: OUT + '/8-local-group-open.png' });
// Webcam pinch-drag at the Galaxy level must zoom out (not open the galaxy) and move up a level · 捏合拖动缩小
await page.evaluate(() => SolarAtlas.journey.back()); await settle();
await page.evaluate(() => SolarAtlas.journey.go('galaxy')); await settle();
const hand = (g, y) => page.evaluate(([g, y]) => SolarAtlas.simulateHand({ present: true, gesture: g, cursor: { x: .5, y }, openness: 1 }), [g, y]);
for (let rep = 0; rep < 8 && (await state()).level === 'galaxy'; rep++) {
  await hand('other', .3); await page.waitForTimeout(80);
  for (let i = 0; i <= 14; i++) { await hand('pinch', .3 + i * .045); await page.waitForTimeout(50); }
  await hand('other', .95); await page.waitForTimeout(150);
}
await page.evaluate(() => SolarAtlas.simulateHand({ present: false })); await settle();
log.push('webcam pinch-drag at galaxy → ' + JSON.stringify(await state()));
await page.evaluate(() => SolarAtlas.journey.go('galaxy')); await settle();
await page.screenshot({ path: OUT + '/2b-galaxy-final.png' });
await page.evaluate(() => SolarAtlas.journey.open('local-group')); await settle();
await page.screenshot({ path: OUT + '/8b-local-group-open-final.png' });
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1500);
await page.screenshot({ path: OUT + '/9-phone-local-group.png' });
log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log(log.join('\n'));
await browser.close();
