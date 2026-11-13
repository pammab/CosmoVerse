# Verdict 2: journey-core (judge, 2026-11-13)

**Score: 8/10. PASS** (no hard rule broken)

## Definition of done
1. **Tests:** I re-ran `node --test tests/*.test.mjs`: 23/23 pass. The `tests/` directory form is a known Node 22 limitation that also fails before this change.
2. **Smoke:** no page errors (the only one is the `/api/voice` 404, which is pre-existing). The VR button is present and every level and open piece was reached. The new step, a webcam pinch-drag at the galaxy level, moves up to `local-group`.
3. **Inputs:**
   - Wheel, touch, webcam pinch and VR two-hand zoom all go through `zoomBy`, with edge pressure, a lock and a `zoomKey` guard.
   - Pinch onset no longer opens a piece in journey mode (`mode !== 'journey'`). Point-and-hold opens a piece, and the smoke test confirms it.
   - A fist or `onBack` calls `back()`, which goes piece → level → overview.
   - VR sizing is correct. The ShaderMaterial divides world size by `sizeScale()`, and since `modelViewMatrix` includes the dolly, `mv.z` is in metres. xr.js only rescales PointsMaterial and Sprites, so the two don't fight.
   - Per-label `visible()` hides the planet sprites during the journey.
4. **Facts:** I opened four sources and each one states its number:
   - NASA "Milky Way: our location": "The Sun is in a finger called the Orion Spur".
   - NASA COBE: 2.725 K (−270 °C is a unit conversion).
   - NASA M33: about 3 million ly.
   - NASA Hubble: "at least 10 times more" than the old estimate of about 200 billion.
   - Verdict 1 had already checked the ESA Gaia, Planck and Hubble+Gaia pages. The bar fact now says "half-length about 10,000 ly", which the page states.
   - All four languages are present, and `validatePiece` enforces this.
5. **Look:** the galaxy (2b), neighbourhood and open panels now meet the bar: warm core, blue arms, pink HII regions, calm space. The Back button is visible and the breadcrumb fits on one line.

## Verdict 1 problems
| # | Problem | Status |
|---|---|---|
| 1 | Webcam/VR pinch opened a piece | **Fixed**, with a smoke step |
| 2 | English-only VR rows and edge notice | **Fixed**: `JUI.vrGuide`/`vrHint`/`vrBack` are in 4 languages, and `noticeQ` uses `quad` |
| 3 | Galaxy under captions | **Mostly fixed** at the level view. Still there with the Milky Way open (7) |
| 4 | Local Group labels | **Improved**: Triangulum moved, and `sub` labels are hidden below 560px. In shot 3, "ANDROMEDA (M31)" and "TRIANGULUM (M33)" still butt together |
| 5 | Back button clipped, duplicate footnote | **Fixed** |
| 6 | Breadcrumb wrapping | **Fixed** (`shortPath` with "…") |
| 7 | VR labels fixed at first entry | **Fixed** (`xr.refreshLabels()` in `onLanguage`) |

## Hard rules
| Rule | Status |
|---|---|
| Branch `fabrica` only, no push to main | OK (uncommitted on `fabrica`) |
| `stellar10` untouched | OK |
| Plain ES modules, no new dependencies, same style, EN+中文 comments | OK |
| Desktop, webcam and VR paths kept, tests pass | OK |
| VR dolly size handling | OK |
| Standalone rebuilt, ORDER updated | OK. The bundle contains `journey`, `pieces/*` and the new code. I did not re-run the build because that writes a repo file |
| EN/zh/ES/PT text | OK. PT is written but stays hidden until PT is added to the language menu, which was a documented decision |
| Sourced facts | OK |

## Remaining fixes (none of these blocks the pass)
1. **Milky Way open (7):** the disk spills under the left help captions. When a piece is open at wide widths, raise `baseDist` to about 1.6, or shift the view further.
2. **Local Group (3):** Andromeda and Triangulum labels touch. Put the Triangulum label above M33 (positive y) instead of to its right.
3. **Supercluster (4):** filaments run under the top buttons and the nav bar. Use a slightly larger `baseDist` or a smaller backdrop `size`.
4. **Phone (9):** with the panel open, the "You are here" label peeks out from under it. Hide `.jtag` on mobile when `#info` is open.
5. **The intro eyebrow** "OUR COSMIC NEIGHBOURHOOD" (index.html) has no PT and reads oddly at the Universe level. Consider swapping it per mode.
6. **Pre-existing:** in VR, when the hand is over the Back button it reports `other`, which can also dwell-open the piece behind the button. Check this on the headset.
