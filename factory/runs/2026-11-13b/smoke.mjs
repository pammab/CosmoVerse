import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const OUT = process.argv[2] || '.';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('response', r => { if (r.status() >= 400) errors.push('http ' + r.status() + ' ' + r.url()); });
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: '/tmp/three/build/three.module.js', contentType: 'text/javascript' }));
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction(() => window.SolarAtlas?.journey, null, { timeout: 30000 });
const settle = () => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 60000 }).then(() => page.waitForTimeout(1200));
const state = () => page.evaluate(() => ({ level: SolarAtlas.journey.level, piece: SolarAtlas.journey.piece }));
const log = ['vr button: ' + !!(await page.$('#vr'))];
// Reach the neighbourhood by wheel from the overview · 用滚轮从概览进入
await page.mouse.move(720, 450);
for (let i = 0; i < 40 && !(await state()).level; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(120); }
await settle(); log.push('wheel out → ' + JSON.stringify(await state()));
await page.screenshot({ path: OUT + '/1-neighbourhood.png' });
const at = re => page.evaluate(s => { const b = [...document.querySelectorAll('.jtag.piece')].find(e => new RegExp(s).test(e.textContent)); const m = b?.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m && b.style.display !== 'none' ? { x: +m[1], y: +m[2] } : null; }, re);
let n = 2;
for (const [re, file] of [['Orion', 'orion'], ['Pleiades', 'pleiades'], ['Alpha', 'alpha-centauri']]) {
  const p = await at(re); log.push(re + ' tag at ' + JSON.stringify(p)); if (!p) continue;
  await page.mouse.click(p.x, p.y); await settle();
  log.push('click ' + re + ' → ' + JSON.stringify(await state()) + ' title: ' + await page.$eval('#info h2', e => e.innerText) + ' · facts: ' + await page.$$eval('#info a[href]', a => a.length) + ' links');
  await page.screenshot({ path: OUT + `/${n++}-${file}-open.png` });
  await page.evaluate(() => SolarAtlas.journey.back()); await settle();
}
// Webcam point-and-hold on the Pleiades · 摄像头指向并保持
const q = await at('Pleiades');
for (let i = 0; i < 40; i++) { await page.evaluate(c => SolarAtlas.simulateHand({ present: true, gesture: 'point', cursor: c, openness: 1 }), { x: q.x / 1440, y: q.y / 900 }); await page.waitForTimeout(60); }
await page.evaluate(() => SolarAtlas.simulateHand({ present: false })); await settle();
log.push('webcam point-and-hold → ' + JSON.stringify(await state()));
await page.evaluate(() => SolarAtlas.journey.back()); await settle();
await page.evaluate(() => SolarAtlas.journey.go('neighbourhood')); await settle();
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1500);
await page.screenshot({ path: OUT + '/6-phone-neighbourhood.png' });
await page.evaluate(() => SolarAtlas.journey.open('orion-nebula')); await settle();
await page.screenshot({ path: OUT + '/7-phone-orion.png' });
log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log(log.join('\n')); await browser.close();
