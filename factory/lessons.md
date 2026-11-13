# Lessons (shared memory; every run reads this and adds to it)

- three.js r170 + scaled XR dolly: the VR culling camera mixes metres and world units, so `xr.js` turns off
  frustum culling while in VR. Point sizes (PointsMaterial with sizeAttenuation) and Sprite scales are in world
  units but applied in view space (metres): `xr.js` divides them by the dolly scale. Code that sets
  `material.size` every frame must divide by `xr.sizeScale()`.
- In the sandbox, the jsdelivr CDN is blocked for the browser: route
  `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js` to a local three r170 build (see RUNBOOK).
  Don't block the other CDNs (MediaPipe) in the smoke test: a failed static import can stop main.js silently.
- Playwright lives at `/opt/npm-tools/node_modules/playwright/index.mjs` (import it by that path).
- The GitHub Pages API is blocked by the session proxy; Pamela turns Pages settings on by hand.
- Emulator (Meta Immersive Web Emulator) resets to controllers on reload; Pamela tests with emulated hands.
- `node --test tests/` (directory argument) fails on Node 22 ("Cannot find module …/tests"), even on an untouched
  branch. Use `node --test tests/*.test.mjs`.
- Smoke tests in swiftshader are slow (a few fps): wait for `SolarAtlas.journey.busy === false` instead of fixed
  sleeps before screenshots, and run the Playwright script in the background (tool calls time out at 2 min).
- The planet tags' rings (`.tag .ring`, up to 400 px) sit over the Sun and used to swallow wheel events; the wheel
  listener is now on `window`, filtered to canvas/tags.
- Journey pieces use their own ShaderMaterial (not PointsMaterial), so `xr.js` doesn't rescale them; journey.js
  divides by `xr.sizeScale()` itself every frame. New piece = `pieces/<slug>.js` + one line in `pieces/index.js`;
  build-standalone picks up `pieces/*` automatically.
- In journey mode a pinch must always zoom (never open the hovered piece): the centred piece fills the screen, so
  "pinch opens what you hover" made leaving a level impossible with hands (judge round 1).
- Every user-visible string, including VR panel rows and notices, needs EN/zh/ES/PT: put them in `journey.js` `UI`.
- Picking in the journey: the smallest target under the cursor wins, so a piece inside a bigger piece (Andromeda in the
  Local Group) stays reachable. While a piece is open, point-and-hold doesn't open others (the camera move slides a
  new target under the still hand and re-opened the big background piece).
- Pieces may set `tilt: [rx, rz]` (orientation) and `frame` (close-up distance multiplier, default 1).
- Research agents sometimes return a claim in only one language version (e.g. the EN clue); re-read every string of a
  piece against the dropped-facts list before judging.
