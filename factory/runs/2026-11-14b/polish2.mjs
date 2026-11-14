// polish-2/3 check: eyebrow per level (EN, PT), back to overview restores it, M87 nucleus · 小标题与 M87 核心检查
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const OUT = process.argv[2];
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: '/tmp/three/build/three.module.js', contentType: 'text/javascript' }));
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction(() => window.SolarAtlas?.journey, null, { timeout: 30000 });
const settle = () => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 90000 }).then(() => page.waitForTimeout(2000));
const eb = () => page.$eval('.intro .eyebrow', e => e.innerText.trim());
const log = ['overview eyebrow: ' + await eb()];
await page.mouse.move(720, 450);
for (let i = 0; i < 160 && (await page.evaluate(() => SolarAtlas.journey.level)) !== 'galaxy'; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(150); }
await settle(); log.push('galaxy eyebrow: ' + await eb());
await page.screenshot({ path: OUT + '/1-galaxy-eyebrow.png' });
await page.selectOption('#language', 'pt'); await page.waitForTimeout(600); log.push('galaxy eyebrow pt: ' + await eb());
await page.selectOption('#language', 'en');
await page.evaluate(() => SolarAtlas.journey.open('m87')); await settle(); log.push('m87 eyebrow: ' + await eb());
await page.screenshot({ path: OUT + '/2-m87.png' });
await page.evaluate(() => SolarAtlas.journey.back()); await settle();
for (let i = 0; i < 200 && (await page.evaluate(() => SolarAtlas.journey.level)) !== 'solar-system'; i++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(150); }
await settle(); log.push('back in Solar System: level=' + await page.evaluate(() => SolarAtlas.journey.level) + ' eyebrow: ' + await eb());
await page.screenshot({ path: OUT + '/3-back-overview.png' });
log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'));
console.log(log.join('\n')); await browser.close();
