# Factory queue (top to bottom). Builder: take the first unchecked item.
# Mark done as `- [x]` with the commit hash, or `- [!]` with a one-line reason if it failed after 3 rounds.

## A. Scale journey (Pamela chose this first, Nov 13)
- [x] journey-core: the **scale journey** framework. See "journey-core spec" below. (0771175, judge 7→8/10)
- [ ] piece milky-way: the Milky Way (barred spiral, ~100,000 ly; where the Sun is, in the Orion Arm) — starter shipped in 0771175 (6 sourced facts, Sun marker); refine or tick
- [ ] piece local-group: the Local Group (Milky Way, Andromeda, Triangulum, dwarf galaxies) — starter shipped in 0771175; refine or tick
- [x] piece andromeda: Andromeda galaxy M31 (1370eb2, judge 8/10)
- [ ] piece orion-nebula: Orion Nebula M42
- [ ] piece pleiades: the Pleiades star cluster M45
- [ ] piece laniakea: the Laniakea supercluster
- [ ] piece cosmic-web: the cosmic web (filaments and voids)
- [ ] piece observable-universe: the observable universe
- [ ] piece pillars-of-creation: Pillars of Creation (in M16, Eagle Nebula)
- [ ] piece betelgeuse: Betelgeuse (red supergiant)
- [ ] piece black-hole: Sagittarius A* (the Milky Way's central black hole)
- [ ] piece elliptical-galaxy: M87 (giant elliptical)
- [ ] piece alpha-centauri: Alpha Centauri / Proxima (nearest stars)

## journey-core spec
Goal: zoom out from the Solar System to the whole universe and back, with hands (webcam and VR) and mouse.

Levels (outermost first), each an id in `journey.js`:
1. `universe`: observable universe / cosmic web
2. `supercluster`: Laniakea
3. `local-group`: Local Group of galaxies
4. `galaxy`: the Milky Way
5. `neighbourhood`: nearby stars, nebulae, clusters (Orion Arm)
6. `solar-system`: the existing overview (mode 'overview' in main.js; unchanged)
Planets stay as they are (mode 'focus').

Behaviour:
- Zooming **out past the overview's minimum zoom** (wheel, two-finger pinch, webcam pinch, VR one- or two-hand
  pinch) moves **up** one level with a smooth transition (fade + particles streaming); zooming **in past a
  level's maximum** goes back **down**. A small level indicator ("You are here: Galaxy ▸ Solar System") sits on
  screen and on the VR panel.
- Each level shows its **pieces** as particle shapes; point-and-hold (hands) or click opens a piece: the info
  panel (and VR panel) shows its name, 5–6 sourced facts, narration (spoken with the existing narrate/voice
  fallback if simple; otherwise just text) and a "you are here" marker where relevant (e.g. the Sun in the
  Milky Way).
- A fist held / ⟵ Back in VR returns to the level view, then up/down as now.
- Distances are not to scale between levels (each level has its own scale); say so in a footnote, like the
  planets' "sizes to scale, distances compressed".

Code shape:
- `journey.js`: level list, current level, transitions, hooks into main.js (mode 'journey' or similar), picking.
- `shapes.js`: particle generators by type: `spiral-galaxy`, `barred-spiral`, `elliptical`, `cluster`,
  `nebula`, `web` (filaments), `galaxy-group`, `star` (glowing point with corona), `black-hole` (disk + ring).
  Deterministic (seeded random) so screenshots are stable.
- `pieces/<slug>.js`: one file per piece, exporting `default` with the schema below. `pieces/index.js` lists them.
- journey-core ships with **3 starter pieces** so every level isn't empty: `milky-way`, `local-group`,
  `observable-universe` (the later queue items then refine/replace those three and add the rest).
- Tests in `tests/journey.test.mjs`: level order, up/down transitions from zoom values, every piece valid
  against the schema (4 languages, 5–6 facts, each with a source URL).

Piece schema (`pieces/<slug>.js`):
```js
export default {
  id: 'milky-way', level: 'galaxy',
  names: { en, zh, es, pt },
  type: { en, zh, es, pt },                 // e.g. "Barred spiral galaxy"
  shape: { kind: 'barred-spiral', count: 60000, colors: ['#ffe9c4', '#8fb7ff'], params: { arms: 2, ... } },
  position: [x, y, z], size: 1,             // in the level's own scene units
  facts: [ { label: { en, zh, es, pt }, value: { en, zh, es, pt }, source: { name: 'NASA', url: 'https://…' } }, … ],   // 5–6
  narration: { en, zh, es, pt },            // 2–3 sentences
  clue: { en, zh, es, pt },                 // one-line riddle for the future "Find the Earth" game
  youAreHere: null | { en, … , at: [x,y,z] } // e.g. the Sun's place in the Milky Way
};
```

## Later (not tonight unless the queue above is done)
- Portuguese in the language menu (en/zh/es → +pt) and PT translations of the planet texts.
- "Find the Earth" game.
