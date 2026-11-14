# Verdict run 2026-11-14c round 2 (polish-5 eyebrow, polish-4 label de-overlap): SCORE 8/10 PASS

I read project.md, examples.md, the brief, verdict-1, diff-2.patch, tests-2/smoke-2/probe-after logs, the smoke-2 screenshots (1, 3, 4, 5, 6) and before/galaxy-phone.png, plus journey.js (eyebrowText, spreadLabels, update label pass), main.js setIntro, xr.js and the .jtag CSS. I re-ran `node --test tests/*.test.mjs` myself (40/40 pass) and printed eyebrowText for all 13 pieces x 4 languages.

## Round-1 must-fix: fixed
- `local-group` and `observable-universe` now show the level form (`SCALE JOURNEY · LOCAL GROUP`, `VIAGEM DE ESCALA · UNIVERSO OBSERVÁVEL`, ...).
- `laniakea` stands alone (`LANIAKEA SUPERCLUSTER`, `SUPERAGLOMERADO LANIAKEA`, `拉尼亚凯亚超星系团`).
- No eyebrow in any language repeats the level name. A new test loops over every piece and language, checks this, and also checks that the level is still named.

## Definition of done
1. **Tests:** 40/40 pass, with 3 new tests (eyebrow for M87 in 4 languages, eyebrow with no repeats across all pieces, spreadLabels).
2. **Smoke:** no page errors and the Enter VR button exists. The eyebrow reads `GALAXY · MILKY WAY`, `GALAXY · SAGITTARIUS A*`, `SUPERCLUSTER · M87 · VIRGO A` and, in PT, `SUPERAGLOMERADO · M87 · VIRGO A`. Back returns to `SCALE JOURNEY · SUPERCLUSTER`, and wheel-in restores the home eyebrow. orbit-standalone.html is regenerated and contains both helpers (not committed yet, which is expected).
3. **Mouse, webcam and VR:**
   - **Mouse:** clicking a label opens its own piece. The CSS `translate` moves the hit box together with the drawn label.
   - **Webcam (`onHand`):** goes through pickAt and then the `.name` getBoundingClientRect, so it follows the moved label. The phone point-and-hold on SGR A* opens sgr-a-star.
   - **VR:** the xr.js sprites and the VR panel eyebrow (`c.eyebrow` from the piece type) are untouched, so VR picking uses the same DOM rects as before. Nothing regresses.
   - **Early return:** the new `shown.length < 2` early return sits at the very end of `update()`, so it skips nothing else. It also removes the forced layout in the common single-label case, which was round-1 nice-to-have #1 (partly).
4. **Languages and facts:** the eyebrow is built from existing 4-language names, no new strings were added and there are no new facts.
5. **Looks:**
   - **Phone:** MILKY WAY is at 382–407 and SGR A* at 411–436, with no overlap (smoke-2/4 vs before/galaxy-phone).
   - **Desktop:** unchanged.
   - **PT M87 eyebrow:** one line, and it looks calm and on-style (smoke-2/3).

## Must-fix
None.

## Nice-to-haves
- **The "names the open piece" rule has silent exceptions.** With a piece open, the eyebrow falls back to the level form in these cases:
  - **Milky Way in zh:** it shows `尺度之旅 · 银河系`, because the piece and level names are both 银河系, while EN shows `GALAXY · MILKY WAY`.
  - **Local Group and Observable Universe:** the eyebrow while open is identical to the eyebrow on the level.

  This is acceptable (the headline names the piece), but it could be made consistent with a "piece type" fallback, e.g. `银河系 · 我们的星系`. Or simply accept it and note the rule in a comment.
- **`P.includes(L)` is a raw substring test.** A future piece whose name merely contains the level word, e.g. a "GALAXY …" piece on the galaxy level, would lose its level prefix. A word-boundary or prefix/suffix check would be safer.
- **Carried over from round 1 (still open):**
  - the pushed SGR A* label now sits on its own ring and the galaxy core on a phone (smoke-2/4); the ring could be added as an obstacle;
  - there is no hysteresis or transition on the ~25 px snap;
  - labels can be pushed below the viewport (push-down only);
  - the layout read still runs on XR frames when 2+ labels are shown.
- **The phone eyebrow is partly hidden under the top-right button cluster (pre-existing).** In smoke-2/4 and smoke-2/5, "GALAXY" and "A*" sit under "Asteroid Analyzer". Piece eyebrows are longer, so this is worth its own polish item.
