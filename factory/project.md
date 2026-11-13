# CosmoVerse factory: project rules (every builder and judge reads this)

## The product
CosmoVerse is a three.js (r170, from the jsdelivr CDN via an importmap) web app: an interactive 3D
Solar System controlled with the mouse, webcam hand gestures (MediaPipe) and, in VR (WebXR on Meta
Quest), the headset's hand tracking. Live at https://pammab.github.io/CosmoVerse/ (GitHub Pages, `main`).
Entry for the **Meta VR Start Developer Competition 2026**, deadline **Nov 18, 2026, 12:00 PM PT**.
Hands only in VR, no controllers.

## Hard rules
- Work only on branch **`fabrica`** of `pammab/cosmoverse` (real name `pammab/CosmoVerse`). **Never push to `main`.** Pamela reviews and merges.
- **Never touch `pammab/stellar10`.**
- Plain ES modules, no build step, no new npm dependencies, no frameworks. Same style as the existing code
  (short helpers, comments in English + 中文 where the file already does that).
- Keep the desktop, webcam-hands and VR paths all working. Never break `node --test tests/`.
- In VR the camera sits in a scaled "dolly" (see `xr.js`). Anything sized in world units that is added in view
  space (PointsMaterial sizes, Sprites) must go through the existing scale handling: `xr.js` already rescales
  every PointsMaterial with `sizeAttenuation` and every Sprite it finds in the scene; per-frame size code in
  main.js must divide by `xr.sizeScale()` (see the focus particles in main.js).
- After changing any module that `build-standalone.mjs` bundles, run `node build-standalone.mjs` and commit
  the regenerated `orbit-standalone.html`. If you add a new module, add it to `ORDER` in build-standalone.mjs.
- Text the user sees exists in **EN, 中文 (zh), ES and PT**.
- **Every fact needs a source** from NASA, JPL, ESA, IAU, ESO, NOIRLab, STScI/Hubble/Webb or a peer-reviewed
  paper, with a URL you actually opened (WebFetch) and that states the number. If you can't verify a fact,
  leave it out. Round numbers sensibly and say "about".

## Definition of done (the judge checks all of this)
1. `node --test tests/` passes (all old tests plus any new ones).
2. Headless Chrome smoke test: the page loads with **no page errors**, the Enter VR button exists, and the new
   feature can be reached and screenshotted (see RUNBOOK.md for the script).
3. The feature works with mouse, webcam-gesture code path (`onHand`) and VR (`xr.js`) — reason about VR from
   the code, since there is no headset in the sandbox.
4. Facts are sourced and correct; all four languages present.
5. It looks good in the screenshot (judge compares with `factory/examples.md`).

## Look and feel
Dark space (`#02050b`), particles with additive blending, soft glows, thin orbit lines, Manrope-like UI.
Things should feel like the existing planet "particle garden": real colours, gentle motion.
