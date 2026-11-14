# Verdict 2 — run 2026-11-14 (cosmic-web, pillars-of-creation, m87)

Judge: fresh agent for round 2. I read project.md, examples.md, lessons.md and verdict-1.md. Branch `fabrica`. All work is staged and nothing is committed yet. `factory/runs/2026-11-14/` is untracked.

## Summary

| Piece | Score | Result |
|---|---|---|
| cosmic-web | 8.5/10 | **PASS** |
| pillars-of-creation | 8/10 | **PASS** |
| m87 | 8/10 | **PASS** |

No hard rule is broken. There are no remaining must-fix items.

## Round-1 must-fix check

| # | Item | Status |
|---|---|---|
| 1 | cosmic-web: "Earliest strand" overclaims | **Fixed.** EN "One of the earliest strands", zh 最早的丝之一, es "Uno de los hilos más antiguos", pt "Um dos fios mais antigos". The page says "one of the earliest filamentary structures". |
| 2 | pillars: "Webb sees" value | **Fixed.** All 4 languages now read "Newborn stars, and a crimson glow from young stars' jets and shocks". weic2216 says "Newly formed protostars are the scene-stealers…", "The crimson glow comes from the energetic hydrogen molecules that result from jets and shocks", and that young stars "periodically shoot out jets". |
| 3 | pillars: narration "newborn stars forming inside" | **Fixed.** All 4 languages now say "…shows newborn stars, and dense knots inside the pillars collapse to form more". weic2216: knots "within the pillars … collapse under their own gravity, slowly heat up, and eventually form new stars". The zh, es and pt versions match the EN. The EN sentence is a little run-on, but it is accurate. |
| 4 | pillars: title overlaps the tallest pillar | **Fixed.** I checked `frame: 1.35` in 2-open.png and 3-open-pt.png (1440×900). The pillar head starts at about y≈240 and x≈440. The title ends at about y≈210. The subtitle line (y≈242) ends at x≈290 in EN and x≈318 in PT. Nothing overlaps. In the phone view the pillars sit clear between the subtitle and the panel. |
| 5 | Stage `orbit-standalone.html` | **Fixed.** It is staged (`git diff --cached --stat`) and has no unstaged diff. I rebuilt it in a scratch copy and the result is byte-identical. The bundle contains the new narration. |

## Definition of done

1. **Tests**: I reran `node --test tests/*.test.mjs` and got 33/33 passing.
2. **Smoke**: smoke.log is dated 08:54, after the 08:52 fixes. It shows `errors: none` and `vr button: true`. Pillars and M87 were opened by clicking their tags, and the cosmic web by webcam point-and-hold (`onHand` path). PT, ZH and ES panels render. The ElevenLabs toast in 1-neighbourhood.png was there before this work and is ignored.
3. **Mouse, webcam and VR** (checked by reading the code). Nothing changed since round 1 apart from `frame` and the text. All three pieces use the journey ShaderMaterial. `uSize` is divided by `ss` (sizeScale) every frame in `journey.update`. The rewritten `dim` line keeps the old behaviour for non-isolate pieces (other pieces 0.3, backdrop 1). For isolate pieces, everything else fades to 0.04, and `warp` and beacons are still exempt. It is shared code, so desktop, webcam and VR behave alike. The new shape kinds only emit positions, colours and sizes. VR is OK.
4. **Facts and four languages**: see below. Every user-visible string has en, zh, es and pt.
5. **Look**: see below.

## Fact check (WebFetch, 2026-11-14)

### pillars-of-creation (full)
| Claim | Page (quote) | OK? |
|---|---|---|
| About 6,500 to 7,000 ly | weic2216: "Eagle Nebula, which lies 6,500 light-years away". NASA M16 (`also`): "located 7,000 light-years from Earth in the constellation Serpens" | OK |
| Serpens, the Snake | eso0926: "Located 7000 light-years away, towards the constellation of Serpens (the Snake)" | OK |
| Cool gas and dust, mostly molecular hydrogen | NASA visualization: "made primarily of cool molecular hydrogen and dust" | OK |
| Eroded by winds and UV from hot young stars | NASA visualization: "eroded by the fierce winds and punishing ultraviolet light of nearby hot, young stars" | OK |
| First Hubble picture 1995 | weic2216: "first imaged by the NASA/ESA Hubble Space Telescope in 1995" | OK |
| Webb sees newborn stars and a crimson glow from jets and shocks | weic2216 (quoted above) | OK |
| Narration: in the Eagle Nebula, about 6,500 ly, towers of cool gas and dust | weic2216: "made up of cool interstellar gas and dust" | OK |
| Narration: knots inside collapse to form more stars | weic2216 (quoted above) | OK |
| Clue: Snake's constellation, cold dust carved by young stars' light | eso0926 and the visualization page | OK |

### cosmic-web (spot check)
- NASA Webb page: "a thread-like arrangement of 10 galaxies", "just 830 million years after the big bang", "one of the earliest filamentary structures". This matches the fixed label and value. OK.
- Round 1 checked the other facts. The facts are unchanged apart from the label.

### m87 (spot check)
- JPL: "some 55 million light-years from Earth", "6.5 billion times the mass of the Sun", "particles traveling near the speed of light". OK.
- opo1332a: "giant elliptical galaxy", "roughly 2000 galaxies", visible jet "some 5000 light-years". OK.

## Look (against examples.md)

- **cosmic-web**: Good. A fine blue-white thread with side branches feeds a warm cluster, with plenty of dark space. The void now reads faintly as a round bubble with "VOID" in it. At the universe level the "VOID" sub-label still shows before the piece is opened (nice-to-have).
- **pillars-of-creation**: Good. Three lumpy dust columns with crimson-gold rims, with young stars and a haze. Webb-like colours and no blobs or squares. The open view is clear of the title. The haze still reads as a grey-blue scatter rather than a glow, and the pillars look a bit sparse at frame 1.35 (nice-to-have).
- **m87**: Good. A warm halo with a blue knotty jet. The core is still a saturated white spot, and the jet is still very long compared with the galaxy. The piece is drawn larger than life, so this is acceptable. At the supercluster level "M87 · VIRGO A" sits about 28 px above "VIRGO CLUSTER". The code comment now honestly says "just above it". It is readable.
- Note (not this run): the top-left eyebrow "OUR COSMIC NEIGHBOURHOOD" is a static string in index.html:57, so it shows at every journey level (universe, supercluster). The new pieces did not cause this, but it looks odd in the M87 and cosmic-web screenshots.

## Must-fix
None.

## Nice-to-have
1. pillars: remove `?lang=` from the ESO URL (the page still loads). Make the haze softer and more glow-like (fewer, larger, dimmer points). Optionally smooth the EN narration, e.g. "…shows newborn stars, while dense knots inside the pillars collapse to form more" (and the same in zh, es and pt).
2. m87: shorten `jet` to about 0.5 and soften the white core (fewer core points or a `bright`-style multiplier). Drop the unused eso2305 from the header comment. "Virgem A" in PT is no longer an issue (PT now says "Virgo A").
3. cosmic-web: hide the "Void" sub-label until the piece is open.
4. App: make the top-left eyebrow follow the journey level, or hide it outside the Solar System.

## For lessons.md
- Raising `frame` (1.0 → 1.35) is enough to clear a tall piece from the big left title at 1440×900. Check both EN and the longest translation (PT) in the screenshot.
