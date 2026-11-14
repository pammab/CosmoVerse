// Quick look: open each polished piece, one screenshot each · 快速查看
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const OUT = process.argv[2] || '.', LANG = process.argv[3];
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: '/tmp/three/build/three.module.js', contentType: 'text/javascript' }));
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction(() => window.SolarAtlas?.journey, null, { timeout: 30000 });
if (LANG) await page.selectOption('#language', LANG);
const settle = () => page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 90000 }).then(() => page.waitForTimeout(2500));
for (const id of (process.argv[4] || 'm87,pillars-of-creation,alpha-centauri,milky-way').split(',')) {
  await page.evaluate(i => SolarAtlas.journey.open(i), id); await settle();
  await page.screenshot({ path: `${OUT}/${id}${LANG ? '-' + LANG : ''}.png` });
  await page.evaluate(() => SolarAtlas.journey.back()); await settle();
}
console.log('errors:', errors.length ? errors : 'none'); await browser.close();
