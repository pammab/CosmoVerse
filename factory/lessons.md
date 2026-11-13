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
- The fact validator's allow-list lives in `journey.js` (`ALLOWED_SOURCES`); ESA's Hubble/Webb sites are `esahubble.org` /
  `esawebb.org` (added 2026-11-13b).
- While a piece is open, every label not owned by that piece is hidden (level markers too): the close-up camera slides other
  labels over the title. Piece `labels` may set `r` (VR sprite offset; default 2) so a small star's label sits close to it.
- Judges catch "the closest star of all" (the Sun is closer) and cite-the-wrong-page errors: when a value merges two claims,
  each part must be on the cited page; put the other part in the narration with a comment naming its source.
- Additive `star` shapes with share > ~0.3 of a piece saturate to white; Alpha Cen A/B still look whitish (open nice-to-have).
- A piece can carry its level's "You are here" (`youAreHere`) instead of the level `marker`, so the marker sits on the piece's
  own structure; then set `spin: 0` (new optional field) or the marker drifts off it. With `tilt`, the piece position must be
  `-(Rx·Rz·home)·size` to keep home at the level origin (see pieces/laniakea.js `turn`, tested).
- Dense additive stars: galaxy-group members take `bright` (0–1, colour multiplier at build time); Betelgeuse uses 0.32 to stay
  orange-red. The same would fix the whitish Alpha Cen A/B.
- A level backdrop with as many points as the piece drowns the piece: the Supercluster web went 26000 → 15000 points.
- Playwright: select the language with `page.selectOption('#language', …)` (several <select>s on the page; there is no 'pt' option yet).
- Two NASA pages disagree on Betelgeuse's distance (≈548 ly in a 2024 blog, ≈700 ly on the Hubble page): use one page's number
  and cite that page.
- Nested pieces (Sgr A* in the Milky Way's core): `labelAt` moves only the label, not the pick target, so pointing at the parent's
  label at the same centre opens the small piece (judge note, open). `isolate: true` fades the other pieces to 0.04 while it is
  open, otherwise the parent's world-sized core points swamp the close-up.
- Swiftshader smoke runs take ~3 min each; for look tweaks, a quick script that calls `SolarAtlas.journey.open(id)` and takes one
  screenshot (~40 s) is enough, then run the full smoke once at the end.
- Hand picking in the journey: a piece's own name label wins over the "smallest target" rule (journey.js `pick` checks the `.name`
  rect first), so pointing at "MILKY WAY" opens the Milky Way even with Sgr A* at the same centre.
- A fact may list extra sources in `also: [{ name, url }]` (validated, rendered as extra links): use it when the value merges
  two pages (Betelgeuse distance 550–700 ly from two NASA pages).
- App-wide PT: `PT` dictionary keyed by English in i18n.js plus `ptText()`; `bi(en, zh, es, pt)` in index.html; arrays get a 4th
  entry. New user-visible text must be added in all four languages.
