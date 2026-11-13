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
