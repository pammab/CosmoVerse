# Brief: piece laniakea (run 2026-11-13c)
Decision: `piece milky-way` and `piece local-group` stay unticked (still waiting for Pamela's answer, as in run 2026-11-13b);
the next item is laniakea.

Goal: the Supercluster level gets its first clickable piece, Laniakea, drawn as galaxies streaming along branching
filaments into a bright basin, with the Local Group ("You are here") near its outer edge and the Virgo Cluster labelled
on the way in.

Files:
- `shapes.js`: new shape kind `supercluster` (branching filaments into a core; `params.home` + `params.via` fix the branch
  that ends at the Local Group so the marker sits on a filament).
- `pieces/laniakea.js` (new), `pieces/index.js`.
- `journey.js`: optional piece `spin` (rad/s, default by kind) so Laniakea stays still under its "You are here" marker;
  the Supercluster level's own marker moves into the piece (`youAreHere`) to avoid two identical labels.
- `tests/journey.test.mjs`: supercluster home branch passes through `home`; spin validation.
- regenerate `orbit-standalone.html`.

Facts (6), all from pages opened this run with WebFetch:
- NASA APOD 2014-09-10 (apod.nasa.gov/apod/ap140910.html): ~500 million ly, ~100,000× Milky Way mass, Hawaiian "immense heaven",
  contains the Virgo Cluster, galaxies outside flow into other concentrations.
- Tully et al. 2014, Nature 513, 71 (nature.com/articles/nature13674): 100,000 large galaxies, 10^17 Suns.
- NASA Science Large-scale structures: the Local Group is on the outer edges of Laniakea.
- ESA "Between Local and Laniakea": "100 000-galaxy-strong Laniakea Supercluster", Local Group in Virgo Cluster (not used:
  NASA/APOD say Virgo is part of Laniakea; we avoid claiming the Local Group is inside the Virgo Cluster itself).

Check: node --test tests/*.test.mjs, build-standalone, Playwright: wheel out to Supercluster, screenshot, click Laniakea,
webcam point-and-hold, phone width; screenshots here.
