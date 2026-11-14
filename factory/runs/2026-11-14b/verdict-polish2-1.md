# Verdict polish-2 + polish-3 (judge 1)

**Score: 7/10. FAIL** (no hard rule broken, but polish-2 does not do what the queue item asks: it does not get rid of the white nucleus)

## Checked
- `node --test tests/*.test.mjs`: I re-ran it and got 37/37 passing, the same as tests-polish2.log. The new test walks every journey `UI` string and checks EN/zh/ES/PT.
- polish2.log: no page errors. The eyebrow reads OUR COSMIC NEIGHBOURHOOD → SCALE JOURNEY · GALAXY (PT: VIAGEM DE ESCALA · GALÁXIA) → SUPERCLUSTER on M87 → restored after home.
- orbit-standalone.html: I rebuilt it in a scratch copy and it is byte-identical to the diff. OK.
- Stale eyebrow: every way the level or piece can change (goLevel, openPiece, closePiece, home/overview/lineup/focus/trajectory) calls setIntro. Webcam gestures and the breadcrumb both go through zoomBy/back/goLevel, so they are covered. A language change cannot leave it stale: `quad` writes all 4 spans and CSS picks the one shown. The original text is saved before it is first overwritten. OK.
- VR: xr.js draws its panel from `journeyPanel()` (its own eyebrow), not from `.intro`. Nothing changes in VR. OK.
- 4 languages, bilingual comment, same code style: OK.

## Why it fails: polish-2
I compared pixels between after3/m87.png and polish2/2-m87.png:
- Only the halo around the centre got warmer. At (535,450) the colour went from 216,209,191 to 216,198,163.
- The nucleus itself, at (522–530, 449–450), is still **255,255,255**. Additive blending clips the dense core to white whatever colour you give it. lessons.md says this too: colour alone barely changes a dense additive core.
- In the screenshot, the bright point still reads as pure white.

## Required fix
- Make the centre of M87 come out warm white in the screenshot, not clipped to 255,255,255. For example:
  - raise `soft`, or lower the brightness/size of the innermost points, so they stop saturating;
  - or use a deeper core colour such as `#ffd890`.
- Then show a pixel sample of the centre that is no longer 255,255,255.

## Nice-to-haves
- When a piece is open (M87), the eyebrow shows the level (SUPERCLUSTER). That is acceptable, but "SCALE JOURNEY · SUPERCLUSTER · M87" could be clearer.
- Polish-3 is good to commit on its own if you split the two items.
