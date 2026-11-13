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
const settle = () => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 90000 }).then(() => page.waitForTimeout(1500));
const state = () => page.evaluate(() => ({ level: SolarAtlas.journey.level, piece: SolarAtlas.journey.piece }));
const log = ['vr button: ' + !!(await page.$('#vr'))];
// Wheel out level by level until the Supercluster · 用滚轮一层层缩小
await page.mouse.move(720, 450);
for (let i = 0; i < 200 && (await state()).level !== 'supercluster'; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(150); }
await settle(); log.push('wheel out → ' + JSON.stringify(await state()));
await page.screenshot({ path: OUT + '/1-supercluster.png' });
const tags = await page.$$eval('.jtag', es => es.filter(e => e.style.display !== 'none').map(e => e.className + ': ' + e.innerText.trim()));
log.push('visible labels: ' + JSON.stringify(tags));
const at = re => page.evaluate(s => { const b = [...document.querySelectorAll('.jtag.piece')].find(e => new RegExp(s).test(e.textContent)); const m = b?.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m && b.style.display !== 'none' ? { x: +m[1], y: +m[2] } : null; }, re);
const p = await at('Laniakea'); log.push('Laniakea tag at ' + JSON.stringify(p));
await page.mouse.click(p.x, p.y); await settle();
log.push('click → ' + JSON.stringify(await state()) + ' title: ' + await page.$eval('#info h2', e => e.innerText) + ' · facts: ' + await page.$$eval('#info a[href]', a => a.length) + ' links');
await page.screenshot({ path: OUT + '/2-laniakea-open.png' });
await page.evaluate(() => SolarAtlas.journey.back()); await settle();
log.push('back → ' + JSON.stringify(await state()));
// Webcam point-and-hold · 摄像头指向并保持
const q = await at('Laniakea');
for (let i = 0; i < 40; i++) { await page.evaluate(c => SolarAtlas.simulateHand({ present: true, gesture: 'point', cursor: c, openness: 1 }), { x: q.x / 1440, y: q.y / 900 }); await page.waitForTimeout(60); }
await page.evaluate(() => SolarAtlas.simulateHand({ present: false })); await settle();
log.push('webcam point-and-hold → ' + JSON.stringify(await state()));
await page.evaluate(() => SolarAtlas.journey.back()); await settle();
// Zoom back in by wheel: should go down to the Local Group · 滚轮放大回到本星系群
for (let i = 0; i < 60 && (await state()).level === 'supercluster'; i++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(150); }
await settle(); log.push('wheel in → ' + JSON.stringify(await state()));
await page.evaluate(() => SolarAtlas.journey.go('supercluster')); await settle();
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(2000);
await page.screenshot({ path: OUT + '/3-phone-supercluster.png' });
await page.evaluate(() => SolarAtlas.journey.open('laniakea')); await settle();
await page.screenshot({ path: OUT + '/4-phone-laniakea.png' });
log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log(log.join('\n')); await browser.close();
