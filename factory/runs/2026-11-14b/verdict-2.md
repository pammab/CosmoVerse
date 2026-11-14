# Verdict 2: run 2026-11-14b

**Score: 8/10. PASS.** No hard rule is broken.

## Checks
- **Tests:** I re-ran them and all 36 pass.
- **Smoke:** no page errors and the VR button exists. Every step was reached, including webcam point-and-hold on Alpha Cen and the phone view. PT shows "esporão de Órion" (6 links).
- **Hard rules:** the work is on `fabrica`, unpushed, with no new dependencies. `orbit-standalone.html` appears in the diff stat, and a scratch rebuild is byte-identical.
- **Mouse, onHand and VR:** the `soft` param only scales the per-vertex size attribute and `bright` only scales vertex colour, so xr.js's PointsMaterial rescale is unaffected. `onlyOpenHidden` behaves the same in the HTML labels and in VR `visible()`.
- **Facts:** I accept the quotes in the re-check, and all four languages are present.

## Round-1 required fixes
1. **Alpha Centauri: resolved.** The count went from 1500 to 1000 and the members use `bright` 0.6 and 0.62. A and B are now warm cream-orange and clearly brighter than the field stars, so the system has a clear focal object again.
2. **M87: mostly resolved.** `soft: 0.65` shrinks the central points and the blown-out disc is now a small nucleus with a warm yellow halo. The very centre is still a pure-white point, though, not the warm yellow-white I asked for.

## Required fixes
None.

## Nice-to-haves
- M87: tint the innermost points (rad < 0.05) toward `#ffe9b8` so the nucleus reads warm.
- The "dims the body but not the jet" test never checks the jet. Assert that the jet luminance is unchanged.
- ES/PT: consider "espolón (brazo) de Orión" and "esporão (braço) de Órion" so readers still recognise the common name.
- The top-left eyebrow reads "Our cosmic neighbourhood" at the supercluster and galaxy levels. This was likely already there before this run; check it.
