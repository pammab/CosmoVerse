# Verdict 2: neighbourhood pieces (Orion Nebula, Pleiades, Alpha Centauri), run 2026-11-13b

**Score: 8 / 10. PASS.** No hard rule is broken. All four required fixes from round 1 are done. Three of the nine nice-to-haves (8, 9, 10) are done. The rest are looks and polish, not correctness.

## Round-1 required fixes
1. **Level marker over the title: done.** `otherOpen = t => !!state.piece && t.owner !== state.piece`, so tags with no owner (the level marker) are hidden too. The same check is used in the HTML loop and in `xrLabels().visible`. In `3-pleiades-open.png` the "YOU ARE HERE · THE SUN" label is gone. The Sun's own small particle glow still sits just under "Open star cluster · M45" (see nice-to-have 2).
2. **"Sword" citation: done.** "Where to look" now cites `ESA_WEBB`, the page with "so-called 'sword'". The narration combines naked-eye (NASA M42) and sword (ESA Webb). Both claims are sourced.
3. **"Light it up": done.** Removed in all 4 languages ("shape it" / 塑造了它的模样 / le dan forma / lhe dão forma).
4. **"Closest star of all": done.** The narration now says "the closest star to the Sun" / 离太阳最近的恒星 / la estrella más cercana al Sol / a estrela mais próxima do Sol. The type line "our nearest stars" is unchanged, which round 1 called tolerable.

## What I checked
- **Tests:** I re-ran `node --test tests/*.test.mjs`: 24/24 pass. That is the same count as round 1, so no test was added.
- **Smoke log:** VR button present. Each piece opens by click with 6 fact links. Webcam point-and-hold opens the Pleiades. The only error is the known `/api/voice` 404.
- **Hard rules:**
  - Branch is `fabrica`.
  - Plain ES modules, no new dependencies, comments in EN + 中文.
  - `orbit-standalone.html` contains the new code: `otherOpen`, `lb.r`, `t.r ??`, the new Proxima position and the PT fix are all present.
  - The allow-list additions `esahubble.org` and `esawebb.org` fall under "STScI/Hubble/Webb".
- **Standalone not rebuilt by me:** a sandbox permission check blocked my rebuild-and-compare, so I spot-checked the standalone file by grep instead.
- **Sources:** my WebFetch requests for all four Orion URLs (ESA Webb, NASA M42, ESO eso1723, esahubble heic0601a) timed out, the same as for the round-1 judge. Orion is therefore judged against the quoted research notes only. The Pleiades and Alpha Centauri URLs were opened and confirmed by the round-1 judge.
- **Every string against the quotes:**
  - Orion: 1,350 ly (ESO), "closest large star-forming region" (NASA), "just a million years old" (ESA), sword (ESA), Trapezium "four massive, young stars that shape the nebula" (NASA), ">3,000 stars" (heic0601a). "Light left about 1,350 years ago" follows from the distance.
  - Pleiades: "young" is dropped. Seven Sisters, Subaru, ~445 ly, ~100 Myr, >1000 loosely bound, about six stars, Oct–Apr, Taurus and dust scattering all match the quotes.
  - Alpha Centauri: three stars, "just over four light years", 80-year orbit, near twin of the Sun, red dwarf with frequent flares, Proxima 4.25 ly, Proxima b in the habitable zone with an 11.2-day year all match the quotes.
  - Clue "hanging from a hunter's belt": Orion as a hunter is common knowledge and the sword hangs from the belt. No number is involved, so this is acceptable.
- **zh/ES/PT vs EN:** all match, with no extra claims. The round-1 wording fixes are in: PT "fracamente ligadas", ES "la más cercana a la Tierra de las grandes".
- **Code paths:**
  - **Mouse:** pick is unchanged. With other tags hidden while a piece is open, you press Back before choosing another piece, which is consistent with the dwell rule.
  - **Webcam (`onHand`):** unchanged; dwell is already blocked while a piece is open.
  - **VR:** `xrLabels` reads `state` live, so hiding works in the headset. Proxima gets `r: 0.6`, which places its label 0.75 world units below the star instead of 2.5.
  - **Other levels:** `otherOpen` now also hides the Local Group's sub-labels while Andromeda is open, and the Milky Way's "you are here" label is owned by the Milky Way, so it stays visible. This is consistent and intended.

## Fixes (all nice-to-have; none required)
1. **Alpha Centauri A and B still saturate to flat white blobs** (`4-alpha-centauri-open.png`). examples.md says to avoid this, and A should read warm yellow-white. Lower the share or point size of A and B. This is round-1 item 5, not done.
2. **Pleiades close-up is weak.** It is an even, dim field with no clear bright "sisters" and no blue haze, and the Sun's particles touch the subtitle. Add a few brighter blue-white members and a faint blue haze around them, or shift the framing slightly.
3. **Orion still reads as separate knots** in both the overview and the close-up. Fewer, larger, softer blobs would read as one cloud. Round-1 item 6, not done.
4. **Phone overview is crowded** (`6-phone-neighbourhood.png`): ALPHA CENTAURI, PLEIADES and ORION NEBULA labels nearly touch. Spread the piece positions. Round-1 item 7, not done.
5. **Fact label "Nearest star"** should be "Nearest star to the Sun" / 离太阳最近的恒星 / … in all 4 languages, for the same reason as required fix 4 in round 1. The type line "our nearest stars" could be reworded the same way.
6. **Proxima can't be clicked.** It now sits at about 0.89 × 5 ≈ 4.45 units from the centre, which is beyond the pick reach of 0.85 × 5 = 4.25. Clicking Proxima itself misses (round-1 item 11; slightly worse now). Either move it to |p| ≤ 0.8 or accept that only the system opens.
7. **Add a test for the label-hiding rule** (round-1 item 12): a tag with another piece's owner, or no owner, is hidden while a piece is open.
8. **Pre-existing, not this change:** on the phone, the "OUR COSMIC NEIGHBOURHOOD" eyebrow sits under the toolbar buttons (`7-phone-orion.png`).
