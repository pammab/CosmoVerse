# Verdict 1 — run 2026-11-14 (cosmic-web, pillars-of-creation, m87)

Judge: fresh agent, first look at this work. Branch `fabrica` (tracking origin/fabrica, nothing on `main`).

## Summary

| Piece | Score | Result |
|---|---|---|
| cosmic-web | 8/10 | PASS once the one-line "Earliest strand" wording fix is made (must-fix 1) |
| pillars-of-creation | 7/10 | FAIL: one fact and one narration clause not on the cited page; the title overlaps the tallest pillar |
| m87 | 8/10 | PASS (nice-to-haves only) |

No hard rule is broken by the code itself. The failures are about facts and look (DoD 4 and 5).

## Definition of done

1. **Tests**: I reran `node --test tests/*.test.mjs` and got 33/33 passing. The new test checks that the void is empty, that M87 sits on `VIRGO_AT`, and that the jet is optional and points along +x. OK.
2. **Smoke test**: `smoke.log` shows `errors: none` and `vr button: true`. Each piece was reached: Pillars and M87 by clicking their tags, and the cosmic web by webcam point-and-hold. ES, ZH and PT panels render. OK.
3. **Mouse, webcam and VR** (checked by reading the code):
   - All three are ordinary journey pieces using the journey ShaderMaterial. `journey.update` divides `uSize` by `sizeScale()` every frame, so the VR dolly scale is handled. The new shape kinds only produce positions, colours and sizes. OK.
   - The `isolate` change (journey.js:225) now also dims the level backdrop and the neighbourhood Sun to 0.04. The `warp` points and the beacons are still exempt (`p === warp` is checked first, and beacons skip `dim`). This runs in the shared `update`, so desktop, webcam and VR behave the same. Side effect: Sgr A* (also `isolate`) now fades its level's backdrop too. The galaxy level has no backdrop, so nothing changes there. Acceptable.
   - VR labels: the "Void" sub-label and the M87 `labelAt` go through `xrLabels` with the default `r` value. Visibility follows the same `otherOpen` rule. OK.
   - `VIRGO_AT = turn(VIRGO − HOME)·S`. This matches Laniakea's holder (`−turn(HOME)·S`, rotated by TILT, spin 0) plus the label at `VIRGO·S`, so M87 really sits on the "Virgo Cluster" label. Picking: M87 is smaller than Laniakea, so it wins under the cursor, and "Virgo Cluster" is a sub-label, not a piece, so nothing competes for the click. OK.
4. **Standalone**: the rule says to regenerate `orbit-standalone.html` after changing a bundled module. I rebuilt it in a scratch copy and it is byte-identical to the working tree, so it is up to date. `pieces/m87` imports `pieces/laniakea`; the sorted PIECE_FILES order (laniakea < m87) makes this work. Note: `orbit-standalone.html` is modified but **not staged**, and it is missing from diff.patch. Stage it with the commit.
5. **Four languages**: names, type, every label and value, narration and clue all have en/zh/es/pt. I checked each translation against the EN text and they say the same thing (details per piece below).

## Fact check (WebFetch, 2026-11-14)

### cosmic-web
| Claim | Page | Verdict |
|---|---|---|
| Filaments and sheets, mostly dark matter | NASA "Mapping the cosmic web": "a web of filaments and vast sheets, largely made of dark matter" | OK |
| One filament about 13 million ly long streams into a cluster | Same page: "13-million-light-year-long filament … streaming into a region already full of matter"; also "four galaxy clusters colliding, fed by this filament" | OK |
| Local Void at least 150 million ly across, mostly empty | NASA "Lonely galaxy": "at least 150 million light-years across … There are no obvious galaxies" | OK |
| Filament gas over 10 million degrees, about 23 million ly long; "missing" matter | ESA XMM: "over 10 million degrees"; "for 23 million light-years"; the caption says it "contains a chunk of 'missing' matter" | OK |
| 3-million-ly filament, about 150 h, ESO VLT | ESO potw2504a: "stretches out for 3 million light-years", "after about 150 hours", "MUSE instrument at the VLT" | OK |
| **"Earliest strand": 10 galaxies, 830 Myr after Big Bang** | NASA Webb: "10 galaxies", "830 million years after the big bang". The body only calls it "**one of the earliest** filamentary structures"; the headline is plural ("earliest strands") | **Label overclaims** (same family of error as "the closest star of all") |
| Narration "held together mostly by dark matter" | The MAP page says the web is "largely made of dark matter" and that dark matter's gravity guides the structure | Acceptable paraphrase |

Translations: zh, es and pt match EN. No dropped or added claims.

### pillars-of-creation
| Claim | Page | Verdict |
|---|---|---|
| About 6,500 to 7,000 ly (ESA/Webb plus also NASA M16) | weic2216: "6,500 light-years"; NASA M16: "7,000 light-years" | OK (same pattern as the Betelgeuse range) |
| Serpens, the Snake | eso0926: "towards the constellation of Serpens (the Snake)" | OK. The URL has a stray `?lang=`; tidy it |
| Cool gas and dust, mostly molecular hydrogen | NASA visualization: "made primarily of cool molecular hydrogen and dust" | OK |
| Eroded by winds and UV from hot young stars | NASA visualization: "eroded by the fierce winds and punishing ultraviolet light of nearby hot, young stars" | OK |
| First Hubble picture 1995 | weic2216: "first imaged by the NASA/ESA Hubble Space Telescope in 1995" | OK |
| **Webb sees: "Newborn stars and a crimson glow at the edges"** | weic2216: the protostars "lie **outside** one of the dusty pillars"; "The crimson glow comes from the energetic hydrogen molecules that result from **jets and shocks**", "evident in the second and third pillars from the top". Nothing places the glow "at the edges" | **Not on page. Must fix** (all 4 languages: zh 边缘的深红色辉光, es "en los bordes", pt "nas bordas") |
| **Narration: "Webb's infrared view shows newborn stars forming inside"** | The page says the visible protostars lie outside a pillar; it separately says knots "within the pillars" collapse and eventually form stars | **Misleading as written. Must fix** (see wording below) |
| Narration: Eagle Nebula, 6,500 ly, cool gas and dust | weic2216 | OK |

Translations otherwise match EN.

### m87
| Claim | Page | Verdict |
|---|---|---|
| Giant elliptical galaxy | ESA/Hubble opo1332a: "giant elliptical galaxy" | OK |
| About 55 million ly | JPL: "some 55 million light-years from Earth" | OK (opo1332a body says 50, its table 55; JPL is cited) |
| Centre of Virgo Cluster, about 2,000 galaxies | opo1332a: "centre of the neighbouring Virgo cluster of roughly 2000 galaxies" | OK |
| About 6.5 billion solar masses | JPL: "6.5 billion times the mass of the Sun" | OK |
| EHT, April 2019 (first image) | NASA Spitzer page: "On April 10, 2019, the Event Horizon Telescope (EHT) unveiled the first-ever image of a black hole's event horizon" | OK |
| Visible jet about 5,000 ly | opo1332a: the visible jet extends "some 5000 light-years" | OK |
| Narration: about 15,000 globular clusters | NASA Hubble M87: "roughly 15,000 globular star clusters" | OK |
| Narration: particles near the speed of light | JPL: "traveling near the speed of light"; M87 page: "jet of subatomic particles traveling at nearly the speed of light" | OK |

ESO eso2305 is listed in the brief and header comment but no fact uses it. That is harmless; drop it from the comment. Translations match. PT "Virgem A" is unusual for the radio-source name, where "Virgo A" is the usual form (nice-to-have).

## Look (against examples.md)

- **cosmic-web**: Good. A fine blue-white thread of small galaxy clumps runs into a warm yellow-white cluster, with thinner side branches and lots of dark space. It is calm and clearly the same app. The void itself barely reads: its rim galaxies (5%, dim) are almost invisible, so "VOID" floats over plain darkness. At the universe level the "VOID" sub-label is visible next to "COSMIC WEB FILAMENT" before the piece is opened, which is mildly confusing.
- **pillars-of-creation**: Nice. There are three lumpy dust columns with crimson-gold rims, a blue haze and young stars, with real Webb-like colours and no blobs. Problem: in the 1440×900 open view (2-open.png, look-open.png) the head of the tallest pillar touches or overlaps the big left title "Pillars of Creation" (around x≈420–480, y≈200–215). examples.md asks to avoid text overlapping objects. The haze reads more as a grey-blue spray than a glow (nice-to-have).
- **m87**: Good overall. There is a warm yellow-white halo, a blue knotty jet and dark space around it. The core is a small saturated white spot. That is acceptable, but `bright` or fewer core points would soften it. The jet is drawn about as long as the galaxy's radius. The real visible jet (about 5,000 ly) is tiny next to the galaxy, so it is very exaggerated; the piece is already "drawn far larger than life", but halving `jet` would be truer. At the supercluster level the "M87 · VIRGO A" label renders **above** "VIRGO CLUSTER", about 25 px apart, even though the code comment says "below". It is readable but crowded.

## Required fixes (must-fix)

1. **cosmic-web**: the fact label "Earliest strand" (zh 最早的丝, es "El hilo más antiguo", pt "O fio mais antigo") claims a superlative the page doesn't make. Change it to "One of the earliest strands" / 最早的丝之一 / "Uno de los hilos más antiguos" / "Um dos fios mais antigos".
2. **pillars**: the fact "Webb sees" value is not on weic2216 as written. Replace it in all 4 languages with something the page states, e.g. "Newborn stars, and a crimson glow from young stars' jets and shocks" / 新生恒星，以及年轻恒星喷流和激波产生的深红色辉光 / "Estrellas recién nacidas y un brillo carmesí de los chorros y choques de estrellas jóvenes" / "Estrelas recém-nascidas e um brilho carmesim de jatos e choques de estrelas jovens".
3. **pillars**: the narration "Webb's infrared view shows newborn stars forming inside" should become, e.g., "Webb's infrared view shows newborn stars, and dense knots inside the pillars collapse to form more" (weic2216). Update zh, es and pt to match.
4. **pillars**: the open view must not put the pillar under the big title. Shift the shape down and right (or raise `frame` to about 1.3), then re-screenshot at 1440×900.
5. **Process**: stage and commit the regenerated `orbit-standalone.html` (it is current but unstaged).

## Nice-to-have

- cosmic-web: make the void rim slightly brighter or denser so the empty bubble reads as a shape. Consider hiding the "Void" sub-label until the piece is open.
- m87: shorten `jet` (about 0.5) and soften the saturated core. Put the "M87" label truly below the "Virgo Cluster" label (try `labelAt: [0, -6, 0]` and check on screen). Consider "Virgo A" in PT.
- pillars: the haze could be softer (fewer, larger, dimmer points). Its placement in the "Solar Neighbourhood" at about 6,500 ly (Orion is about 1,344 ly) is a stretch. The narration gives the distance, but a phrase like "far beyond the stars around the Sun" would help. Remove `?lang=` from the ESO URL.
- m87 header comment: drop the unused eso2305 source.

## For lessons.md

- weic2216 places Webb's protostars *outside* the pillars and attributes the crimson glow to jets and shocks. Re-read image captions for "where" claims, not just numbers.
- The NASA Webb "earliest strands" body says only "one of the earliest". Headline superlatives are not enough on their own.
