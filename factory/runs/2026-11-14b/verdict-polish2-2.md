# Verdict polish-2 + polish-3 (judge 2)

**Score: 8/10. PASS** (no hard rule broken)

## Checked
- `node --test tests/*.test.mjs`: I re-ran it and got 37/37 passing. The new test walks every `UI` string in journey.js and checks that EN/zh/ES/PT are all present.
- orbit-standalone.html: I rebuilt it in a scratch copy and it is byte-identical to the working tree. Its diff contains exactly the m87, journey.js and main.js changes.
- polish-3: unchanged since judge 1, who passed it. polish2.log shows the eyebrow going OUR COSMIC NEIGHBOURHOOD → SCALE JOURNEY · GALAXY (PT: VIAGEM DE ESCALA · GALÁXIA) → SUPERCLUSTER → restored, with no page errors. `JUI`/`tr` are imported in main.js. VR is not affected because xr.js uses `journeyPanel`. You can see the eyebrow in polish2b/m87.png.
- polish-2: I sampled pixels myself in a 55×35 px box around the nucleus:

| Screenshot | Pure-white pixels | Pixels with R+G+B > 600 |
|---|---|---|
| after3 (original) | 119 | 262 |
| polish2 (round 1) | 104 | 242 |
| polish2b (round 2) | 28 | 92 |

  - The row through the nucleus in polish2b now goes 146,127,92 → 255,255,211 → (255 ×2) → 234,202,143.
  - In the crops and in m87-core-zoom.png, the white disc is gone. It is now a small warm yellow-white nucleus with only a few white peak pixels, which is physically right because the nucleus is the brightest point.
  - The body and halo read warmer. The blue jet is kept.
- Matches examples.md: the galaxy core is warm yellow-white and is not a solid blob.

## Notes (not blocking)
- The body is a bit fainter overall (bright 0.72). It is still fine at this framing.
- The queue line for polish-2 still says `#ffe9b8`. When you tick it, record that `#ffd890` with soft 0.88 was used.
- No smoke log for round 2 specifically. That is acceptable because round 2 changed only data in m87.js. Re-run smoke before committing.
