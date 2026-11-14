// Full smoke test for run 2026-11-14c: wheel out to the Galaxy, click both centre labels, eyebrow with a piece open,
// phone: webcam point-and-hold on the moved Sgr A* label, wheel back home · 冒烟测试
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const OUT = process.argv[2] || '.';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push('pageerror: ' + e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: '/tmp/three/build/three.module.js', contentType: 'text/javascript' }));
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction(() => window.SolarAtlas?.journey, null, { timeout: 30000 });
const settle = () => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 90000 }).then(() => page.waitForTimeout(1500));
const state = () => page.evaluate(() => ({ level: SolarAtlas.journey.level, piece: SolarAtlas.journey.piece }));
const eb = () => page.evaluate(() => { const el = document.querySelector('.intro .eyebrow'); return [...el.children].find(c => getComputedStyle(c).display !== 'none')?.textContent || el.textContent; });
const log = ['vr button: ' + !!(await page.$('#vr'))];
// centre of a piece label's visible name box (follows the de-overlap shift) · 标签名字框的中心
const at = re => page.evaluate(s => { const b = [...document.querySelectorAll('.jtag.piece')].find(e => new RegExp(s).test(e.textContent) && e.style.display !== 'none'); if (!b) return null; const r = b.querySelector('.name').getBoundingClientRect(); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, top: r.top, bottom: r.bottom }; }, re);
await page.mouse.move(720, 450);
const wheelTo = async lv => { for (let i = 0; i < 160 && (await state()).level !== lv; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(150); } await settle(); };
// 1. Desktop: Galaxy, click MILKY WAY then SAGITTARIUS A* labels
await wheelTo('galaxy'); log.push('wheel out → ' + JSON.stringify(await state()) + ' · eyebrow ' + await eb());
await page.screenshot({ path: OUT + '/1-galaxy.png' });
let p = await at('Milky'); await page.mouse.click(p.x, p.y); await settle(); log.push('click MILKY WAY label → ' + JSON.stringify(await state()) + ' · eyebrow ' + await eb());
await page.evaluate(() => SolarAtlas.journey.back()); await settle();
p = await at('Sagittarius'); await page.mouse.click(p.x, p.y); await settle(); log.push('click SAGITTARIUS A* label → ' + JSON.stringify(await state()) + ' · eyebrow ' + await eb());
await page.screenshot({ path: OUT + '/2-sgr-open.png' });
await page.evaluate(() => SolarAtlas.journey.back()); await settle();
// 2. Supercluster: click M87, eyebrow EN and PT
await page.mouse.move(720, 450); await wheelTo('supercluster');
p = await at('M87'); await page.mouse.click(p.x, p.y); await settle(); log.push('click M87 → ' + JSON.stringify(await state()) + ' · eyebrow ' + await eb());
await page.selectOption('#language', 'pt'); await page.waitForTimeout(800); log.push('PT eyebrow ' + await eb());
await page.screenshot({ path: OUT + '/3-m87-open-pt.png' });
await page.selectOption('#language', 'en'); await page.evaluate(() => SolarAtlas.journey.back()); await settle();
log.push('back → eyebrow ' + await eb());
// 3. Phone: Galaxy, labels apart, webcam point-and-hold on the Sgr A* label
await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => SolarAtlas.journey.go('galaxy')); await settle();
const mw = await at('Milky'), sg = await at('Sagittarius'); log.push(`phone labels: MILKY WAY ${mw.top | 0}–${mw.bottom | 0}, SGR A* ${sg.top | 0}–${sg.bottom | 0}, overlap: ${sg.top < mw.bottom && mw.top < sg.bottom}`);
await page.screenshot({ path: OUT + '/4-phone-galaxy.png' });
for (let i = 0; i < 40; i++) { await page.evaluate(c => SolarAtlas.simulateHand({ present: true, gesture: 'point', cursor: c, openness: 1 }), { x: sg.x / 390, y: sg.y / 844 }); await page.waitForTimeout(60); }
await page.evaluate(() => SolarAtlas.simulateHand({ present: false })); await settle();
log.push('phone webcam point-and-hold on SGR A* label → ' + JSON.stringify(await state()));
await page.screenshot({ path: OUT + '/5-phone-sgr-open.png' });
await page.evaluate(() => SolarAtlas.journey.back()); await settle();
// 4. Wheel back in to the Solar System; eyebrow restored
await page.setViewportSize({ width: 1440, height: 900 }); await page.mouse.move(720, 450);
for (let i = 0; i < 200 && (await state()).level !== null; i++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(150); }
await settle(); log.push('wheel in → ' + JSON.stringify(await state()) + ' · eyebrow ' + await eb());
await page.screenshot({ path: OUT + '/6-home.png' });
log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log(log.join('\n')); await browser.close();
