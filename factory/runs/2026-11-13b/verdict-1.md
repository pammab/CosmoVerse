# Verdict 1: neighbourhood pieces (Orion Nebula, Pleiades, Alpha Centauri), run 2026-11-13b

**Score: 7 / 10. FAIL.** No hard rule is broken. The score is below 8 because of three small fact and citation errors and one label overlap that shows in a screenshot. Each takes a few lines to fix.

## What I checked
- **Tests:** I re-ran `node --test tests/*.test.mjs` myself: 24/24 pass. `validatePiece` runs on all 7 pieces, so the allow-list, the 4 languages and 6 facts per piece are all checked.
- **Smoke log:** the VR button exists; each of the 3 pieces opens by click with 6 fact links; webcam point-and-hold opens Pleiades. The only error is the known `/api/voice` 404.
- **Hard rules:**
  - Branch is `fabrica`.
  - No new dependencies, plain ES modules, comments in EN + 中文.
  - `orbit-standalone.html` contains the new pieces and `otherOpen`.
  - Adding `esahubble.org` and `esawebb.org` to the allow-list is within "ESA, STScI/Hubble/Webb". `esawebb.org` is not used yet.
- **Sources I opened myself with WebFetch (8), each stating the claim:**
  - NASA TESS Pleiades page: "roughly 100 million years", "About six … unaided eye", "evenings from October to April", "Taurus".
  - NASA Hubble M45: "roughly 445 light-years", "over a thousand stars", "loosely bound by gravity", "Seven Sisters".
  - NOIRLab noao-m45: Seven Sisters, "in Japan it is called Subaru", blue light "scattering off of dust grains".
  - NASA 3-star page: three stars, "80 years to complete one orbit", Proxima "a red-dwarf star", flaring.
  - nasa.gov image article: "a near twin of our Sun", "just over four light years", Proxima "much smaller red dwarf", "frequently send out dangerous flares".
  - NASA Imagine: Proxima 4.25 ly, A & B 4.35 ly.
  - ESO eso1629: period 11.2 days, "well within the habitable zone".
  - **Not verified by me:** the four Orion URLs (NASA M42, ESA Webb NIRCam, ESO eso1723, esahubble heic0601a). My WebFetch permission requests for them timed out. For Orion I judged against the quotes in `../2026-11-13/orion-nebula-research.md` only.
- **VR and webcam paths (read from the code):**
  - Proxima is a `labels` entry in piece-local units × `size`, the same convention as local-group.js. It sits in the `spin` group, so it turns with the stars.
  - `owner` is set on every tag of a piece before the first `update`. `xrLabels` is built at session start or on a language change, and its `visible()` closure reads `state` live, so `otherOpen` works in VR too.
  - When a piece is open, its own labels (Proxima) stay visible and other pieces' labels are hidden, in both HTML and VR.
  - Picking and the webcam path are unchanged and were smoke-tested.

## Fixes

### Required
1. **Level marker overlaps the title (look, DoD 5).**
   - Where: `3-pleiades-open.png`. While Pleiades is open, the Sun and the "YOU ARE HERE · THE SUN" label sit right on the subtitle "Open star cluster · M45". On the phone Orion shot (`7-phone-orion.png`) a cut-off "HE" from the same label shows at the right edge.
   - Cause: the new `otherOpen` only hides tags that have an `owner`. The level `marker` tag has none.
   - Fix: also hide owner-less tags (the level marker) while a piece is open, e.g. `const otherOpen = t => !!state.piece && t.owner !== state.piece;`. The same function feeds `xrLabels`, so VR is covered too. Then retake screenshot 3.
2. **Mis-citation in Orion "Where to look" (DoD 4).**
   - The value says "The 'sword' of Orion", but the research notes have "sword" only on the ESA Webb page (`ESA_WEBB`). The NASA M42 quote only says "unaided eye from a dark sky site".
   - Fix: either cite `ESA_WEBB` for this fact, or drop "sword" from the value (in all 4 languages).
3. **Unsourced narration claim in Orion (DoD 4).**
   - "the Trapezium, light it up and shape it": the source only says the four stars "shape the nebula". "Light it up" is in no quote.
   - Fix: remove it in EN/zh/ES/PT ("…the Trapezium, shape it" / 塑造了它 / le dan forma / lhe dão forma), or find an allowed page that states it.
4. **Alpha Centauri "the closest star of all" is wrong (DoD 4).**
   - The Sun is closer. ESO says "the closest star to Earth apart from the Sun".
   - Fix in all 4 languages: "the closest star to the Sun" / 离太阳最近的恒星 / la estrella más cercana al Sol / a estrela mais próxima do Sol.
   - The same applies to the type line "our nearest stars" and the zh "离我们最近的恒星". Tolerable, but "nearest stars to the Sun" would be cleaner.

### Nice-to-have
5. **Alpha Centauri A and B look like solid white blobs** (`4-alpha-centauri-open.png`), which examples.md says to avoid. A should read warm Sun-like yellow-white. Fix: lower the count or share for A and B, or reduce the core point sizes, so the additive core does not saturate to flat white.
6. **Orion reads as 5–6 separate coloured knots, not a nebula.** This shows both in the overview and in the close-up. Fewer, larger, softer blobs (bigger `s`, or `blobs: 5` with more wisps) would read as one glowing cloud with the Trapezium at its centre.
7. **Phone overview is crowded** (`6-phone-neighbourhood.png`). "ALPHA CENTAURI" sits almost on top of "PLEIADES", next to "ORION NEBULA". Fix: spread the positions a little (the level has room up to radius ~110).
8. **Proxima's VR label floats far below the star.** `xrLabels` gives every `sub` tag `r: 2`, which offsets it 2.5 world units. That is fine for the Local Group (size 150) but about 4 Proxima diameters at size 5. Fix: allow a per-label `r` (e.g. `lb.r`) and use about 0.6 here.
9. **"Young stars" (Pleiades narration) is in no quote.** Only "about 100 million years old" is sourced. Drop "young" or source it.
10. **Translation wording:**
    - PT "presas de leve pela gravidade" → "fracamente ligadas pela gravidade".
    - ES Orion narration "la grande más cercana a la Tierra" → "la más cercana a la Tierra de las grandes".
    - Otherwise zh/ES/PT match EN with no extra claims and read naturally.
11. **Clicking Proxima itself may miss.** It sits about 4.3 units from the piece centre, right at the pick reach (0.85 × 5 = 4.25), so the click can land just outside.
12. **Add a small test for the label-hiding rule:** a tag with another piece's owner, or no owner, is hidden while a piece is open.
13. **Distances between pieces on this level are not proportional.** Orion (1,350 ly) is drawn only a little farther away than the Pleiades (445 ly). This is covered by the "not to scale" note, so optional.
