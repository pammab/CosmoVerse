# Brief: journey-core (run 2026-11-13)

Goal: the scale journey framework from `factory/queue.md` ("journey-core spec"): zoom out past the Solar System
overview to Neighbourhood → Galaxy → Local Group → Supercluster → Observable Universe and back, with mouse wheel,
touch pinch, webcam pinch and VR one/two-hand pinch; clickable/point-and-hold pieces; level indicator; 3 starter pieces.

Files:
- new `shapes.js` (seeded particle generators, no three.js), `journey.js` (levels, edge detection, piece schema check,
  scenes via `createJourney({ T, … })`), `pieces/{milky-way,local-group,observable-universe,index}.js`,
  `tests/journey.test.mjs`
- `main.js` (mode 'journey', `zoomBy()` for every zoom input, `back()`, info panel, breadcrumb, VR panel),
  `xr.js` (per-label visibility for VR name sprites), `style.css`, `build-standalone.mjs` (bundles `pieces/*`,
  `export default`, relative sub-folder imports), regenerated `orbit-standalone.html`.

Decisions (Pamela asleep):
- Pushing past a zoom limit builds "pressure" (log units, threshold 0.6, fades in ~1 s) so one stray wheel notch
  never jumps levels; each jump locks for 1.5 s; a pinch in progress stops at a level change.
- Fist / ⟵ Back: open piece → its level view → Solar System overview (same as the old "fist = home").
- Neighbourhood and Supercluster have no pieces yet; they get an illustrative backdrop (nearby-star field / web)
  plus a "You are here" marker (Sun / Local Group), no numeric claims.
- Journey points use their own ShaderMaterial (size in world units ÷ `xr.sizeScale()` each frame) instead of
  PointsMaterial, so xr.js' automatic rescale doesn't fight the transition scaling.
- Narration: shown as text (the existing narrate() needs server audio by body id); PT text is written everywhere
  but only shows once PT joins the language menu (queue "Later").
- VR panel shows journey text in the current language.

Check: `node --test tests/*.test.mjs` (note: `node --test tests/` fails on Node 22 before and after this change:
a directory argument isn't supported), `node build-standalone.mjs`, Playwright smoke test (`smoke.mjs`) with
screenshots of each level and an open piece.
