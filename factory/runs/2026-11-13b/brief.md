# Brief: neighbourhood pieces (run 2026-11-13b)
Goal: fill the emptiest level (Solar Neighbourhood) with three clickable pieces: Orion Nebula M42, Pleiades M45,
Alpha Centauri/Proxima (queue items orion-nebula, pleiades, alpha-centauri; alpha-centauri taken early because it is
on the same level and its research was complete).
Files: new `pieces/orion-nebula.js`, `pieces/pleiades.js`, `pieces/alpha-centauri.js`; `pieces/index.js`;
`journey.js` source allow-list gains esahubble.org / esawebb.org (ESA's Hubble/Webb sites); regenerated orbit-standalone.html.
Facts: 6 per piece, from NASA, ESA, ESA/Hubble, ESO, NOIRLab pages opened with WebFetch (research notes in this folder
and in ../2026-11-13/orion-nebula-research.md).
Check: tests, Playwright smoke: neighbourhood level, click each piece, webcam point-and-hold, phone width, screenshots.
