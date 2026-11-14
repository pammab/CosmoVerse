// Full smoke test for run 2026-11-14: Pillars (click), M87 (click), Cosmic Web (webcam point-and-hold), PT/zh, phone · 冒烟测试
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const OUT = process.argv[2] || '.';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: '/tmp/three/build/three.module.js', contentType: 'text/javascript' }));
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction(() => window.SolarAtlas?.journey, null, { timeout: 30000 });
const settle = () => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 90000 }).then(() => page.waitForTimeout(1500));
const state = () => page.evaluate(() => ({ level: SolarAtlas.journey.level, piece: SolarAtlas.journey.piece }));
const log = ['vr button: ' + !!(await page.$('#vr'))];
const at = re => page.evaluate(s => { const b = [...document.querySelectorAll('.jtag.piece')].find(e => new RegExp(s).test(e.textContent)); const m = b?.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m && b.style.display !== 'none' ? { x: +m[1], y: +m[2] } : null; }, re);
const info = async () => (await page.$eval('#info h2', e => e.innerText)) + ' · ' + (await page.$$eval('#info a[href]', a => a.length)) + ' links';
await page.mouse.move(720, 450);
const wheelTo = async lv => { for (let i = 0; i < 160 && (await state()).level !== lv; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(150); } await settle(); };
// 1. Neighbourhood → click Pillars of Creation
await wheelTo('neighbourhood'); log.push('wheel out → ' + JSON.stringify(await state()));
await page.screenshot({ path: OUT + '/pillars-of-creation/1-neighbourhood.png' });
let p = await at('Pillars'); log.push('Pillars tag at ' + JSON.stringify(p));
await page.mouse.click(p.x, p.y); await settle(); log.push('click → ' + JSON.stringify(await state()) + ' · ' + await info());
await page.screenshot({ path: OUT + '/pillars-of-creation/2-open.png' });
await page.selectOption('#language', 'pt'); await page.waitForTimeout(800);
log.push('pt: ' + await page.$eval('#info', e => e.innerText.slice(0, 200).replace(/\n/g, ' ')));
await page.screenshot({ path: OUT + '/pillars-of-creation/3-open-pt.png' });
await page.selectOption('#language', 'en'); await page.evaluate(() => SolarAtlas.journey.back()); await settle();
// 2. Supercluster → click M87
await page.mouse.move(720, 450); await wheelTo('supercluster'); log.push('wheel out → ' + JSON.stringify(await state()));
await page.screenshot({ path: OUT + '/m87/1-supercluster.png' });
log.push('labels: ' + JSON.stringify(await page.$$eval('.jtag', es => es.filter(e => e.style.display !== 'none').map(e => e.innerText.trim()))));
p = await at('M87'); log.push('M87 tag at ' + JSON.stringify(p));
await page.mouse.click(p.x, p.y); await settle(); log.push('click → ' + JSON.stringify(await state()) + ' · ' + await info());
await page.screenshot({ path: OUT + '/m87/2-open.png' });
await page.selectOption('#language', 'zh'); await page.waitForTimeout(800);
log.push('zh: ' + await page.$eval('#info', e => e.innerText.slice(0, 120).replace(/\n/g, ' ')));
await page.screenshot({ path: OUT + '/m87/3-open-zh.png' });
await page.selectOption('#language', 'en'); await page.evaluate(() => SolarAtlas.journey.back()); await settle();
// 3. Universe → webcam point-and-hold on the Cosmic Web Filament label
await page.mouse.move(720, 450); await wheelTo('universe'); log.push('wheel out → ' + JSON.stringify(await state()));
await page.screenshot({ path: OUT + '/cosmic-web/1-universe.png' });
const q = await at('Filament'); log.push('Filament tag at ' + JSON.stringify(q));
for (let i = 0; i < 40; i++) { await page.evaluate(c => SolarAtlas.simulateHand({ present: true, gesture: 'point', cursor: c, openness: 1 }), { x: q.x / 1440, y: q.y / 900 }); await page.waitForTimeout(60); }
await page.evaluate(() => SolarAtlas.simulateHand({ present: false })); await settle();
log.push('webcam point-and-hold → ' + JSON.stringify(await state()) + ' · ' + await info());
await page.screenshot({ path: OUT + '/cosmic-web/2-open.png' });
await page.selectOption('#language', 'es'); await page.waitForTimeout(800);
log.push('es: ' + await page.$eval('#info', e => e.innerText.slice(0, 120).replace(/\n/g, ' ')));
await page.selectOption('#language', 'en');
// 4. Phone
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(2500);
await page.screenshot({ path: OUT + '/cosmic-web/3-phone-open.png' });
await page.evaluate(() => SolarAtlas.journey.open('pillars-of-creation')); await settle();
await page.screenshot({ path: OUT + '/pillars-of-creation/4-phone-open.png' });
await page.evaluate(() => SolarAtlas.journey.open('m87')); await settle();
await page.screenshot({ path: OUT + '/m87/4-phone-open.png' });
log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log(log.join('\n')); await browser.close();
