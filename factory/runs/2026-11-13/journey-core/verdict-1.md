# Verdict 1: journey-core (judge, 2026-11-13)

**Score: 7/10. FAIL** (needs 8+ with no hard rule broken)

## Checks
- **Tests:** `node --test tests/*.test.mjs` gives 23/23 passing (I re-ran it). The 11 new journey tests cover level order, edge pressure, schema and shapes.
- **Smoke:** no page errors. The only 404 is `/api/voice` (expected). The Enter VR button is there, and every level and open piece is reached and screenshotted. The standalone bundle contains `journey`, `shapes` and `pieces/*`.
- **Facts:** I fetched 6 source pages:
  - ESA Gaia guide: 26,000 ly and 4 million Suns are stated. The page says the bar's *half*-length is about 10,000 ly, so "bar about 20,000 ly" is derived, not stated.
  - NASA Imagine: 100,000 ly and 250 Myr are stated. The Local Group being nearly 10 Mly across is stated.
  - NASA large-scale structures: "over 50" galaxies and the cosmic web are stated.
  - ESA Hubble+Gaia: a 50-50 chance within 10 Gyr is stated.
  - ESA Planck: 13.8 Gyr, 4.9%, 26.8% and 68.3% are stated.
  - All checked facts are correct.
- **Mouse and touch:** these work through `zoomBy`. The pressure, lock and fade logic is sound.
- **VR sizing:** this is correct. The ShaderMaterial divides by `sizeScale()`, `viewport.w` is the eye height, and the labels use per-label `visible()`. `onBack` goes to `back()`, and two-hand zoom goes through `zoomBy` with a `zoomKey` guard.

## Hard rules
| Rule | Status |
|---|---|
| Branch `fabrica` only, no push to main | OK (changes are not committed yet) |
| `stellar10` untouched | OK |
| Plain ES modules, no new dependencies, same style, EN+中文 comments | OK |
| Desktop, webcam and VR paths keep working; tests pass | OK for the old paths. The new feature has a webcam/VR bug (see bug 1) |
| VR dolly size handling | OK |
| Standalone rebuilt and ORDER updated | OK |
| User-visible text in EN/zh/ES/PT | **BROKEN**: `journeyPanel()` in main.js has English-only VR gesture rows and hint ("Pinch + down…", "Press ⟵ Back…"). `notice()` for the edge message passes en/zh/es only |
| Sourced facts | OK. The bar length is the one fact the page doesn't state directly |

## Bugs (by priority)
1. **Webcam and VR one-hand pinch opens the piece instead of zooming.**
   - In `onHand`, a pinch onset with `hand.hoverId` set in the last 900 ms calls `select(hoverId)` and sets `hand.pinch = null`.
   - At each journey level, the single centred piece fills most of the screen (pick reach = 0.85 × the projected radius), so the hand is almost always "hovering" it.
   - I reproduced it: `other` → `pinch` + drag at the galaxy level opens `milky-way` with no zoom.
   - Inside the open piece the same thing happens. `openPiece` returns early, so pinch zoom is dead there too.
   - Zoom only works if the hand appears already pinching. That means that in practice you can't leave the Galaxy by pinching with the webcam or one hand in VR.
2. **Text overlapping objects** (examples.md says to avoid this):
   - Galaxy level (2, wheel-in-2): the galaxy spills under the left help captions and the planet nav bar.
   - Local Group (3, 8): the "Andromeda (M31)" and "Triangulum (M33)" labels collide. "You are here · Milky Way" sits on the galaxy's particles.
   - Phone (9): three labels stack on top of each other.
3. **Info panel at 1440×900** (6, 7): the "⟵ Back" button is clipped below the fold. The scale footnote appears twice (in the panel and in the breadcrumb).
4. **Universe level** (5, 6): the breadcrumb wraps to two lines and crowds the footnote and the nav bar.
5. **Galaxy level** (2): the "Milky Way" piece tag is washed out by the bright bulge.
6. **VR labels are fixed at first VR entry:** `journey.xrLabels(lang())` is built once (`labelsBuilt`), so changing the language afterwards isn't reflected.

## Fixes
1. **main.js `onHand`:** in journey mode, don't treat pinch onset as "open". Use point-and-hold only, or require `hand.dwellId === hand.hoverId` with some progress. Always start `hand.pinch`. Add a smoke step: `other` → `pinch` drag at the galaxy level should move up a level.
2. **main.js `journeyPanel` and the `JUI.edge` notice:** move the gesture rows and hint into `journey.js` `UI` with en/zh/es/pt, and use `tr(…, lang())`. Pass PT through, or make `notice` accept `quad`.
3. **journey.js `baseDist`/`viewRadius`:** at the galaxy level, use about 1.6× the radius or a steeper pitch, so the disk clears the captions and the nav.
4. **pieces/local-group.js labels:** move the Triangulum label to the right or above. Offset "You are here" so it sits above the Milky Way. In journey.js, hide `sub` labels below about 500 px width.
5. **style.css:** give `#info` in journey mode a sticky Back button or a smaller fact grid. Drop `.jnote` from the panel or the crumb `small` while a piece is open. Make the crumb `nowrap` with a shorter middle (or collapse the middle levels to "…").
6. **xr.js `buildLabels`:** rebuild the labels when the language changes, or draw the text per-language at session start.

Also check the HTML piece tags at the galaxy level for contrast (add a darker text shadow).
