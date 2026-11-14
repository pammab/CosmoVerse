# Brief — run 2026-11-14b

The only unchecked queue items (milky-way, local-group) say "waiting: Pamela tests the standalone file first".
She has not answered yet (no commits or notes since the last run). Decision: don't change their look; re-verify
every fact against the page (refine), and spend the rest of the run on the judges' open nice-to-haves.

## Goals
1. **milky-way / local-group fact re-check**: open every source URL, confirm each number is on the cited page.
   Fix anything off. Found: NASA says "Orion **Spur**"; ES/PT said "brazo/Braço" (= arm) → "espolón/Esporão".
2. **M87 polish** (judge nice-to-have): jet shorter (0.95 → 0.6 of the radius), core less white (new optional
   `params.bright` on the `elliptical` shape, M87 uses 0.62).
3. **Pillars polish**: blue haze fainter (opacity 0.2–0.35 → 0.11–0.2, less white mix).
4. **Alpha Centauri A/B** less white (member `bright` 0.3 / 0.34, as Betelgeuse).
5. **Test** for `onlyOpen` labels (pure `onlyOpenHidden` exported from journey.js, used by HTML and VR `visible()`),
   and for the elliptical `bright` param.

## Files
shapes.js, journey.js, pieces/{milky-way,m87,alpha-centauri}.js, tests/journey.test.mjs, orbit-standalone.html.

## Check
node --test tests/*.test.mjs; node build-standalone.mjs; before/after look screenshots; full smoke (wheel to
neighbourhood, webcam point-and-hold Alpha Cen, click Pillars, click Milky Way + PT text, Local Group, click M87, phone).
