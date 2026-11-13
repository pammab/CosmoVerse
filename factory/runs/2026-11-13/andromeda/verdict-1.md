# Verdict 1: piece andromeda (2026-11-13)

**Score: 8/10, PASS** (no hard rule broken; minor fixes below)

## Definition of done
1. Tests: re-ran `node --test tests/*.test.mjs`, 23/23 pass. Schema test covers the new piece. No test exercises `tilt`/`frame` validation or the new pick order.
2. Smoke: page loads, the VR button is there, click and webcam point-and-hold both open `andromeda`. The only error is the known `/api/voice` 404. Re-running `build-standalone.mjs` gives a byte-identical `orbit-standalone.html`, so it is in sync. The `pieces/` folder is picked up automatically.
3. Input paths:
   - Mouse and webcam go through the same `pickAt` → `journey.pick`.
   - VR feeds the same `onHand`, so it uses the same path.
   - VR labels come from the generic `xrLabels(tags)`, so Andromeda gets a sprite.
   - The panel uses generic `pieceData`.
   - Point sizes divide by `sizeScale()` in the shared journey loop.
   - Smallest-target pick: correct for nested targets (Andromeda inside the Local Group's 150-unit disc). The other levels have only one piece each, so it can't break them.
   - Dwell guard: sound. It only applies in journey mode while a piece is open, and fist/Back still works.
4. Facts: I opened all 3 URLs and every one of the 6 facts is there:
   - spiral, 2.5 Mly, naked eye, in Andromeda, 6× Moon diameter: Hubble M31 page
   - largest in the Local Group: Imagine page
   - "perhaps as many as 1 trillion": halo story
   
   Translations are right: 1 万亿 / un billón (10¹²) / 1 trilhão; 250 万光年; 2,5 millones.
5. Look: the Local Group view is clean and Andromeda reads as a steep tilted spiral, matching the examples. The open view is well framed. The phone view is fine but the galaxy sits mostly behind the panel; other pieces do the same.

## Hard rules
- Branch fabrica only / never main: OK (uncommitted)
- stellar10 untouched: OK
- ES modules, no deps, EN+中文 comments: OK
- Desktop/webcam/VR kept: OK
- VR size scaling: OK (shared loop)
- Standalone regenerated: OK
- 4 languages: OK
- Sourced facts: OK, with one caveat (fix 1)

## Fixes
1. **The EN clue makes an unsourced claim.** "the farthest-away giant you can spot without a telescope" brings back the "farthest naked-eye object" claim that the brief dropped as unverifiable. Change it to something like "Our big neighbour: a giant galaxy you can spot without a telescope." The zh/es/pt clues already avoid the superlative.
2. **One change affects every piece and isn't in the brief.** `main.js` raised the open-piece distance factor from 1.55 to 2, which shows every piece smaller (Milky Way, observable universe). `frame: 1.7` already covers Andromeda. Revert to 1.55, or say why it changed and check the Milky Way screenshot.
3. **Odd declaration style in `pieces/local-group.js`.** The `M31 = [...] // comment` line continues with a leading `, M33`. Put the comment on its own line and keep the single `const` list.
4. **Missing tests.** Add one for `validatePiece` rejecting a bad `tilt`/`frame`, and one checking that `pick` prefers Andromeda over `local-group` at Andromeda's screen spot (`SolarAtlas.journey.pick` already exists for the smoke test).
5. **Small translation gap.** es "Unas 6 lunas llenas" and pt "Cerca de 6 luas cheias" drop "across". Use "de ancho" / "de largura".
6. **Pre-existing, optional.** The Triangulum (M33) label overlaps its galaxy in screenshot 1.
