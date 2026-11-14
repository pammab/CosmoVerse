# Verdict 1 — run 2026-11-14b

**Score: 7 / 10 — FAIL** (no hard rule broken; fails on look: Alpha Centauri got worse, and the M87 core goal was not met)

## Checks
- **Tests:** I re-ran `node --test tests/*.test.mjs` and all 36 pass. That includes the new tests for `onlyOpenHidden` and the elliptical `bright` param.
- **Smoke:** no page errors, the VR button exists, and every step was reached (webcam point-and-hold opens Alpha Cen; the PT text shows "Esporão").
- **Hard rules:** none broken. The work stays on `fabrica`, unpushed, with no new dependencies and no change to `package.json`. I rebuilt `orbit-standalone.html` in a scratch copy and it is byte-identical to the committed one, so the standalone is fresh.
- **Code and VR:** `hiddenNow` now calls `onlyOpenHidden(t, state.piece)`. It behaves the same as before, because `t.onlyOpen` is already a boolean. The xr.js labels use journey's `visible()` (journey.js:276), which includes `hiddenNow`, so the VR labels are unchanged. `bright` only scales vertex colours, so it has no effect on the sizes that xr.js rescales for VR. Mouse, `onHand` and VR are all fine.
- **Facts:** I accept the quotes in the re-check. "Orion Spur" matches the NASA page. "Espolón" is a real Spanish term for this (Spanish press uses "espolón de Cefeo"), and "Esporão" is a sensible PT rendering. The common names are still "Brazo de Orión" and "Braço de Órion", though.

## Look (before vs after)
- **M87:** the shorter jet is better. The core is still a saturated white blob, so `bright: 0.62` had almost no visible effect.
- **Pillars:** the haze is slightly fainter. It is a small improvement.
- **Alpha Centauri (after2):** this is a regression. A and B are now dim, muddy grey-tan clumps, fainter than the background field stars. The system no longer has a clear focal object, and A doesn't read as a "near twin of our Sun".

## Fixes
**Required**
1. Alpha Cen: raise member `bright` to about 0.5–0.6, or keep it and cut the particle count or size, so that A and B are warm yellow-orange and clearly brighter than the field stars without turning white. Re-screenshot.
2. M87: fix the white core by thinning the dense core or making its points smaller (e.g. lower centre density or `bright` about 0.4 only for rad < 0.15), not just by dimming the colour. Show a before/after where the core reads warm yellow-white.

**Nice-to-have**
- Use the same capitalisation in ES and PT ("espolón" is lower-case, "Esporão" is capitalised).
- Consider "el espolón (brazo) de Orión" so the familiar name stays recognisable.
- Pillars: the towers could use slightly more contrast.
