# Verdict: piece observable-universe (refine), round 1

Judge: independent, 2026-11-14. Patch: `factory/runs/2026-11-14/diff-ou.patch` (staged on `fabrica`).

**Score: 7 / 10. FAIL** (one fact value does not match its cited page; it is a two-minute fix.)

## Checks

| Check | Result |
|---|---|
| `node --test tests/*.test.mjs` | 34/34 pass (rerun by judge) |
| Standalone bundle | `orbit-standalone.html` is staged and contains the change (`hiddenNow`, `planck-new-cosmic-recipe`, `heic1620`, `onlyOpen: true`, "stars and galaxies"; no "of us") |
| Sources allowed | all 5 URLs match `ALLOWED_SOURCES` (esa.int, sci.esa.int, asd.gsfc.nasa.gov, science.nasa.gov, esahubble.org) |
| Branch / rules | `fabrica`, plain ES modules, no new deps, EN + 中文 comments kept |
| Smoke | look script: no page errors, labels as expected; Enter VR button visible in both screenshots. The full smoke (smoke.log) is from before this change, so run it once at the end of the run |
| Screenshots | good (see below) |

## Sources opened (WebFetch) and what they say

| Fact / claim | Cited page | On the page? |
|---|---|---|
| Age "about 13.8 billion years" | ESA Planck_reveals_an_almost_perfect_Universe | Yes: "the age of the Universe is 13.82 billion years" |
| Ordinary matter "about 5% (4.9%)" | same | Yes: "Normal matter that makes up stars and galaxies contributes just 4.9%" |
| Narration "the stuff of stars and galaxies" | same (and RECIPE) | Yes, same sentence. Neither page mentions people, so dropping "of us" was right |
| Dark matter about 27% · dark energy about 68% | sci.esa.int 51557 "Planck's new cosmic recipe" | Yes: 26.8% and 68.3%. (The PLANCK page has 26.8% but no dark-energy number, so moving this fact to RECIPE was right) |
| CMB "2.725 K" | asd.gsfc.nasa.gov/archive/mather/cobe/science.html | Yes: "temperature of 2.725 +/- 0.002 K". "About −270 °C" is not on the page; it is a unit conversion (2.725 K = −270.4 °C), which I accept |
| Shape "cosmic web of filaments and voids"; narration "threads and walls … around empty voids" | science.nasa.gov large-scale-structures | Yes: "twisting, threadlike structures called the cosmic web", "walls or sheets of galaxies", "voids of space in between", "empty bubbles". No size adjective for voids, so dropping "huge" was right |
| Galaxies "At least 10× the old estimate of 200 billion" | esahubble.org heic1620 | **Partly.** "at least ten times too low" / "at least 10 times as many galaxies" is there, but the old estimate is a range, "between 100 to 200 billion galaxies". The page never gives a single figure of 200 billion |
| "This is as far as we can see" | (definition of observable universe) | Fine, no number |

## Languages
zh / es / pt narration matches EN after the edit: "around empty voids" → 围绕着空洞 / alrededor de vacíos / em volta de vazios; "stars and galaxies" → 恒星和星系 / las estrellas y las galaxias / das estrelas e galáxias. All fact values agree across the four languages. The `Void` label has all four (Void / 空洞 / Vacío / Vazio).

## onlyOpen code (journey.js)
- `hiddenNow(t) = t.onlyOpen && state.piece !== t.owner` is added to both the HTML label `show` test and the `xrLabels` `visible()` closure. Owners are set on sub-labels a line later, so `t.owner` is defined before the first frame.
- **Mouse:** the HTML label is hidden at the level view and shown only in the cosmic-web close-up. The look script confirms this: universe labels have no VOID, cosmic-web open labels = ["VOID"].
- **Webcam (`onHand` → `pick`):** `pick` only looks at tags with `pieceId`. Sub-labels are never pick targets, so a hidden or shown "Void" cannot steal a pick. No change in behaviour.
- **VR (`xr.js`):** sprites are built once at `sessionstart` from `journey.xrLabels(lang())`, and `visible()` is called every frame (xr.js:109). The new condition therefore applies live in VR as the piece opens and closes. Scale and `r` handling are unchanged. Correct.
- Other pieces' labels are unaffected (`onlyOpen` defaults to false).

## Look (screenshots)
- `2-universe-level.png`: calm web of fine blue-white and warm points, with the filament inset as a clear secondary object. The labels (OBSERVABLE UNIVERSE, YOU ARE HERE, COSMIC WEB FILAMENT) do not overlap and there is no stray "VOID" floating in mid-web. That stray label was the point of the change, and it works.
- `1-open.png`: the info panel shows the new narration and six facts with ESA/NASA/ESA/Hubble links, and the title is clear of the particles. Fine.

## Must-fix
1. **Galaxies fact value misquotes heic1620.** The page says the old estimate was "between 100 to 200 billion". Change the value to "At least 10× the old estimate of 100–200 billion" (zh 至少是旧估计（1000 亿至 2000 亿）的 10 倍; es "Al menos 10 veces la antigua cifra de 100.000 a 200.000 millones"; pt "Pelo menos 10 vezes a antiga estimativa de 100 a 200 bilhões"). Extend the new test to assert `/100/` in the EN value.

## Nice-to-have
- journey.js: the old trailing comment `// level markers too (judge 2026-11-13b)` now sits at the end of the `hiddenNow` line, after the new comment. It belongs on the `otherOpen` line. Move it back.
- The new test checks only the data flag (`w.labels[0].onlyOpen === true`), not the behaviour. A small test that calls `xrLabels()` with a piece open or closed and checks `visible()` for the Void label would guard the VR path.
- Add a comment beside the CMB fact that −270 °C is a conversion from 2.725 K (the page gives kelvin only).
- Run the full smoke once at the end of the run, since smoke.log predates this change.
