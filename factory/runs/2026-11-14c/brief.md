# Brief — run 2026-11-14c (polish-5, polish-4)

Queue A: only milky-way and local-group remain, both waiting for Pamela's OK → not touched. polish-6 is a question
for Pamela → not touched. This run takes the two remaining polish items.

## polish-5: eyebrow names the open piece
- Goal: top-left eyebrow reads "SUPERCLUSTER · M87 · VIRGO A" while a piece is open, "SCALE JOURNEY · SUPERCLUSTER"
  on a level (as now). Decision: drop the "SCALE JOURNEY" prefix while a piece is open so PT stays one line.
- Files: journey.js (pure helper `eyebrowText(levelId, piece, lang)`), main.js (setIntro uses it), tests.
- Check: unit test (4 languages, level vs piece), screenshot with M87 open in EN and PT.

## polish-4: Sgr A* / Milky Way label overlap
- Found (probe, `before/`): the label-wins pick rule (0052d5c) already fixes "pointing at MILKY WAY opens Sgr A*"
  (both labels pick their own piece on desktop and phone). What is left: on a phone the two labels overlap
  (MILKY WAY 382–407 px, SAGITTARIUS A* 401–425 px), so the label you point at is ambiguous.
- Fix: a generic de-overlap pass for the HTML journey labels: pure helper `spreadLabels(boxes, gap)` in journey.js
  pushes a lower label down until it clears the ones above; applied as a CSS `translate` on `.name` only (the
  ring/dot stays on the anchor). Picking reads getBoundingClientRect, so it follows the moved label.
- VR: sprites are separate (xr.js), unchanged; VR picking goes through onHand → pickAt → same DOM rects.
- Check: unit tests for spreadLabels; probe again on phone + desktop (rects no longer overlap, picks still right).
