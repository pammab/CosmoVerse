# Brief: piece andromeda (run 2026-11-13)
Goal: Andromeda (M31) as its own clickable piece at the Local Group level (queue item "piece andromeda").
Files: new `pieces/andromeda.js`, `pieces/index.js`; `pieces/local-group.js` stops drawing M31 and its label (the new piece
draws it at the same spot, ×150 of the old unit position); `journey.js` gains an optional `tilt: [rx, rz]` on pieces
(schema-checked) so Andromeda keeps its steep tilt; regenerated `orbit-standalone.html`.
Facts: 6, from NASA Hubble Messier 31, NASA Imagine M31 and NASA Hubble halo pages (opened by a research agent with WebFetch).
Dropped (no allowed page stated them): diameter in ly, M110, black-hole mass, "farthest naked-eye object".
Check: tests, Playwright smoke (`smoke.mjs`): local-group level, click Andromeda, webcam point-and-hold on it, screenshots.
