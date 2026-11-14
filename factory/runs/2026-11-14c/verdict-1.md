# Verdict run 2026-11-14c (polish-5 eyebrow, polish-4 label de-overlap): SCORE 7/10 FAIL

I checked `project.md`, `examples.md`, the brief, `diff.patch`, the tests, smoke and probe logs, and the screenshots (smoke/1–6, before/after galaxy-phone, after/m87-pt). I also read the code paths in journey.js (update, pick, spreadLabels, eyebrowText), main.js (setIntro, setEyebrow, pickAt, onHand), xr.js (labels, cursor) and style.css (.jtag). I re-ran `node --test tests/*.test.mjs` and got 39/39 passing.

## Definition of done
1. **Tests:** pass. There are 39 tests, and the 2 new ones cover eyebrowText and spreadLabels.
2. **Smoke test:** passes. There are no page errors, the Enter VR button is present, and the label clicks, M87 in EN and PT, back and wheel-in all behave as expected. `orbit-standalone.html` was regenerated and contains spreadLabels. It is not committed yet, which is fine at this stage.
3. **Mouse, webcam and VR:**
   - **Mouse:** pointer hit-testing follows the CSS `translate`, so hovering and clicking the moved label works. The probe shows each label picks its own piece on desktop and on phone.
   - **Webcam (`onHand`):** it goes through `pickAt` and then `journey.pick`, which reads `.name` with getBoundingClientRect, so it follows the moved label. The phone point-and-hold on the SGR A* label opens sgr-a-star.
   - **VR:** the sprites in xr.js are independent and unchanged. VR picking uses the same DOM rects, which were already invisible and offset from the sprites before this change, so nothing regresses.
   - **Eyebrow in VR:** the VR panel builds its own eyebrow from `p.type`, so the eyebrow change does not touch VR.
4. **Languages:** the eyebrow is built from existing names in all four languages and no new strings were added. No facts were added.
5. **Looks:** the phone labels no longer overlap (MILKY WAY ends at 382–407 and SGR A* sits at 411–436). The desktop is unchanged and the PT M87 eyebrow fits on one line.

## Code review notes (verified, OK)
- **`translate` with `transform: translateX(-50%)`:** individual transform properties compose before `transform`. Both are pure translations, so the order does not matter and the result is correct. The property needs Chromium 104+ (Quest Browser is fine) and Safari 14.1+. An old browser would ignore it, and picking would still agree with what is drawn.
- **Measuring:** `offsetTop`, `offsetWidth` and `offsetHeight` ignore transforms, so the measurement does not read back the translate it just applied. There is no feedback loop or drift. The x position (`sx - w/2`) matches `translateX(-50%)`.
- **Stale translate when hidden:** this is not a bug. `t.dy` always mirrors what is actually in the DOM. A hidden label keeps its old translate, but on the frame it is shown again the new dy is computed and written before paint. Hidden labels are left out of `shown`, so they never push other labels.
- **Language switch:** widths are re-measured every frame, so a language change is picked up straight away. `t.nameEl` caching is safe because the element is never rebuilt.
- **`.jtag.sub` hidden on phone:** CSS hides these with `display: none !important`, so they measure w = 0 and spreadLabels skips them. The test covers this case.
- **spreadLabels:** the logic is correct. It sorts by y with a stable tie-break, loops repeatedly (capped at 20) so a label clears every placed label, and only pushes labels down.

## Must-fix
1. **Duplicated eyebrow text.** eyebrowText repeats the level name when a piece has the same name as its level, or when the piece name already contains it. This is visible in all four languages:
   - `LOCAL GROUP · LOCAL GROUP` (local-group piece)
   - `OBSERVABLE UNIVERSE · OBSERVABLE UNIVERSE` / `UNIVERSO OBSERVABLE · UNIVERSO OBSERVABLE` (observable-universe)
   - `SUPERCLUSTER · LANIAKEA SUPERCLUSTER` / `SUPERAGLOMERADO · SUPERAGLOMERADO LANIAKEA` (laniakea)

   **Fix:** in `eyebrowText`, compare per language.
   - If the piece name equals the level name, show the level form (`SCALE JOURNEY · LEVEL`).
   - If the piece name contains the level name (case-insensitive), show only the piece name.

   Add a test that loops over every piece in PIECES and every language, and asserts that no eyebrow repeats a segment or the level word. The current test only checks M87.

## Nice-to-haves
- **Forced layout every frame.** The pass reads `offset*` right after writing display, transform and class, which forces one synchronous layout per frame. That includes XR frames, where the DOM labels are not even shown. The DOM is small, so this is cheap, but it can be avoided:
  - skip the pass when `shown.length < 2`;
  - cache `w` and `h` per tag and only re-measure when the shown set or the language changes;
  - or skip it while `renderer.xr.isPresenting`. You would need to keep the last dy so that VR picking stays consistent.
- **Label covers its own ring.** The pushed-down SGR A* label (bottom at 436) now touches or overlaps the top of its own ring, which sits at about 434–448. In tighter stacks, a pushed label could cover its ring or another tag's dot. One option is to include each ring or dot as a fixed obstacle box in spreadLabels.
- **No hysteresis.** As the camera moves, a label snaps about 25 px when the overlap starts or ends, and two labels at nearly the same y can swap places. A small hysteresis would help, or a short `transition: translate .2s` (picking still follows the rect).
- **Labels can be pushed off-screen.** spreadLabels only pushes down, so it could push a label below the viewport or under the crumb or nav bar. One fix is to clamp at `innerHeight` and push upward instead.
- **Phone eyebrow is covered (pre-existing).** On a phone the top-right button cluster already covers the eyebrow (smoke/5: "A*" is hidden under "Asteroid Analyzer"). Piece eyebrows are longer, so more of them is now hidden. This is worth a separate polish item, for example a narrow-screen eyebrow with the level part dropped.
