// Probe the Galaxy level: label rects, pick results, desktop + phone screenshots · 探测银河层级的标签与拾取
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const OUT = process.argv[2] || '.';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', r => r.fulfill({ path: '/tmp/three/build/three.module.js', contentType: 'text/javascript' }));
  await page.goto('http://localhost:8765/index.html');
  await page.waitForFunction(() => window.SolarAtlas?.journey, null, { timeout: 30000 });
  await page.evaluate(() => SolarAtlas.journey.go('galaxy'));
  await page.waitForFunction(() => !SolarAtlas.journey.busy, null, { timeout: 90000 }); await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/galaxy-${name}.png` });
  const info = await page.evaluate(() => {
    const out = {};
    for (const el of document.querySelectorAll('.jtag')) if (el.style.display !== 'none') { const r = el.querySelector('.name').getBoundingClientRect(); out[el.textContent.slice(0, 40)] = [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }
    const W = innerWidth, H = innerHeight, picks = {};
    for (const [k, [x, y]] of Object.entries({ centre: [W / 2, H / 2] })) picks[k] = SolarAtlas.journey.pick(x, y, 54);
    for (const el of document.querySelectorAll('.jtag.piece')) if (el.style.display !== 'none') { const r = el.querySelector('.name').getBoundingClientRect(); picks['label:' + el.textContent.slice(0, 20)] = SolarAtlas.journey.pick((r.left + r.right) / 2, (r.top + r.bottom) / 2, 54); }
    // Same probes without the DOM labels (as if a label were hidden) · 不用 DOM 标签
    for (const el of document.querySelectorAll('.jtag.piece')) el.dataset.d = el.style.display;
    return { tags: out, picks };
  });
  console.log(name, JSON.stringify(info), 'errors:', errors.length ? errors : 'none');
  await page.close();
}
await browser.close();
