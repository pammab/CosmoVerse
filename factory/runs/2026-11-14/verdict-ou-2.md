# Verdict: piece observable-universe (refine), round 2

Judge: independent (round 2), 2026-11-14. Patch: `factory/runs/2026-11-14/diff-ou.patch` (staged on `fabrica`).
Round 1: `verdict-ou-1.md` (7/10, one must-fix on the galaxies value).

**Score: 8 / 10. PASS on content**, with one check to finish before the commit: the smoke log is empty and the open-panel screenshot is older than the fix (see Must-fix).

## Checks

| Check | Result |
|---|---|
| `node --test tests/*.test.mjs` | 34/34 pass (rerun by judge). The new test asserts `/100–200 billion/` in the EN value, as round 1 asked |
| Branch | `fabrica`. Staged: journey.js, orbit-standalone.html, pieces/cosmic-web.js, pieces/observable-universe.js, tests/journey.test.mjs. No push, `main` untouched |
| Standalone bundle | `orbit-standalone.html` (staged) holds the new value in all four languages ("100–200 billion", "1000 亿至 2000 亿", "100.000 a 200.000 millones", "100 a 200 bilhões") and `hiddenNow` |
| Style / deps | plain ES modules, no new deps, EN + 中文 comments kept |
| Smoke | **`smoke.log` is 0 bytes** (09:07). There is no record of a smoke run after the change |
| Screenshots | `1-open.png` (09:04) and `2-universe-level.png` (09:05) predate the fix in `pieces/observable-universe.js` (09:07). `1-open.png` still shows "At least 10× the old estimate of 200 billion" |

## (1) Round-1 must-fix: galaxies value

Opened https://esahubble.org/news/heic1620/ (WebFetch). It says the observable Universe was "estimated [to contain] between 100 to 200 billion galaxies" and that there are "at least 10 times as many galaxies in the observable Universe as previously thought".

New value: EN "At least 10× the old estimate of 100–200 billion"; zh 至少是旧估计（1000 亿至 2000 亿）的 10 倍; es "Al menos 10 veces la antigua cifra de 100.000 a 200.000 millones"; pt "Pelo menos 10 vezes a antiga estimativa de 100 a 200 bilhões". All four match the page and each other (1000 亿 = 100 billion; 100.000 millones = 100 billion; bilhões in the short scale). The source is now ESA/Hubble heic1620 itself, and the label shows "ESA/Hubble". **Fixed.**

## (2) Spot-checks of two other facts

| Fact | Cited page (opened) | Page says | OK? |
|---|---|---|---|
| Dark matter about 27% · dark energy about 68% | sci.esa.int/web/planck/-/51557-planck-new-cosmic-recipe | "occupies 26.8%", "accounts for 68.3%" (normal matter "4.9%") | Yes, rounded with "about" |
| Big Bang afterglow 2.725 K · about −270 °C | asd.gsfc.nasa.gov/archive/mather/cobe/science.html | "temperature of 2.725 +/- 0.001K" (and ±0.002 K elsewhere) | Yes. −270 °C is a conversion (2.725 K = −270.4 °C), now marked by a comment in EN + 中文, as round 1 suggested |

zh / es / pt values for both match EN.

## (3) Hard rules

- Branch `fabrica`, nothing pushed, `pammab/stellar10` not touched: OK.
- No build step, no new deps, same style: OK.
- Bundle regenerated and staged: OK (contents checked by grep).
- Four languages for all user-visible text changed (facts, narration, Void label): OK.
- Every fact sourced from an allowed body with a page that states the number: OK (heic1620, ESA recipe, NASA GSFC COBE checked this round; Planck and large-scale-structures pages checked in round 1).
- VR scale handling: no new sprites or PointsMaterials. The `hiddenNow` test is in both the HTML label path and the `xrLabels` `visible()` closure, so the Void label behaves the same with mouse, webcam (`onHand`/`pick` ignores sub-labels) and VR. OK.
- `node --test tests/` passes: OK.

No hard rule is broken.

## Round-1 nice-to-haves
- Comment placement in journey.js: fixed (`// level markers too (judge 2026-11-13b)` is back on the `otherOpen` line; `hiddenNow` has its own comment).
- CMB conversion comment: added.
- Behaviour test for `visible()` on the Void label: not added (still only the data flag). Still a nice-to-have.
- Full smoke at the end of the run: not done (see Must-fix).

## Must-fix (before commit)
1. Run the full smoke (`smoke.mjs`, see RUNBOOK.md) and keep its output in `smoke.log`; it must show no page errors and the Enter VR button. Retake `observable-universe/1-open.png` so the review evidence shows the corrected galaxies line. This is evidence for Definition of done #2 and #5, not a code change. The change is text plus a label-visibility flag, so I expect it to pass.

## Nice-to-have
- A test that calls `journey.xrLabels()` with the cosmic-web piece open and closed and checks `visible()` for the Void label.
- The ElevenLabs "voice not found" toast in `1-open.png` is a sandbox artefact, but it covers the top of the scene. Hide it before taking competition screenshots.
