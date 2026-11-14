# Run 2026-11-14 brief (three pieces)

Goal: ship three queue pieces, each a `pieces/<slug>.js` with 6 sourced facts in EN/zh/ES/PT, narration, clue.
Skipped: milky-way and local-group (still waiting for Pamela to test the standalone file, per queue note).

1. **cosmic-web** (universe level, Pamela chose option B): a close-up of ONE filament full of small galaxies with an
   empty void beside it. New shape kind `filament` in shapes.js. `isolate: true` so the whole-universe web fades.
   Sources: NASA "Mapping the Cosmic Web", NASA "Lonely galaxy lost in space" (Local Void), ESA XMM-Newton 2025 missing matter,
   ESO potw2504a (MUSE filament), NASA Webb earliest strands.
2. **pillars-of-creation** (neighbourhood level, far side from Orion; not to scale): new shape kind `pillars`
   (three dusty columns, glowing crimson/gold edges, blue-teal haze, young stars). Sources: esawebb weic2216, NASA Hubble M16,
   NASA Hubble+Webb visualization, ESO eso0926.
3. **m87** (supercluster level, at the Virgo Cluster inside Laniakea): `elliptical` with a new optional `jet` param.
   `isolate: true`, label moved below the Virgo label. Sources: NASA JPL 2019, NASA Spitzer M87 page, ESA/Hubble opo1332a,
   NASA Hubble M87 page, ESO eso2305.

Files: shapes.js, pieces/{cosmic-web,pillars-of-creation,m87}.js, pieces/index.js, pieces/laniakea.js (export Virgo spot),
tests/journey.test.mjs, orbit-standalone.html (regenerated).
Check: node --test tests/*.test.mjs; node build-standalone.mjs; Playwright smoke (open each piece, screenshots, page errors, #vr);
judge = separate fresh agent.
