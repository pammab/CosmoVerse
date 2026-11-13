# Runbook for one factory run (a Claude scheduled task follows this)

0. Stop early if: it is after 2026-11-18 12:00 PM PT, or every queue item is `[x]`/`[!]`. Then just report.
1. Setup
   - `add_repo` owner `pammab`, repo `cosmoverse`, access `push`; clone it; `git checkout fabrica` (it exists on origin).
   - three r170 for smoke tests:
     `git clone --depth 1 --branch r170 --filter=blob:none --sparse https://github.com/mrdoob/three.js /tmp/three && git -C /tmp/three sparse-checkout set build`
   - Read `factory/project.md`, `factory/lessons.md`, `factory/examples.md`, `factory/queue.md`.
2. Pick work: the first unchecked queue item. If it is small (a piece), you may do up to 3 items this run.
   Stop starting new items after ~75 minutes of work.
3. BRIEF: write `factory/runs/<date>/<slug>/brief.md` (goal, files to touch, how you'll check it).
4. BUILD on `fabrica`. For pieces: research each fact with WebSearch/WebFetch on the source sites first, keep
   the URL you actually opened.
5. CHECK (the harness, report what was ACTUALLY built):
   - `node --test tests/` must pass.
   - `node build-standalone.mjs` if bundled modules changed.
   - Smoke test: serve the repo (`python3 -m http.server 8765` in the repo, background) and run a Playwright
     script (import `/opt/npm-tools/node_modules/playwright/index.mjs`; chromium args
     `--use-gl=swiftshader --enable-unsafe-swiftshader`; route the three CDN URL to `/tmp/three/build/three.module.js`;
     do not block other URLs). Record page errors, check `#vr` exists, drive the new feature (wheel zoom out
     past the overview, click a piece) and save screenshots in the run folder. Look at the screenshots.
6. JUDGE with fresh eyes: launch a separate agent (Agent tool, general-purpose) that has NOT seen your work.
   Give it: project.md, examples.md, the diff (`git diff origin/fabrica`), the check output and the screenshot
   paths. Ask for a score 0–10 against the Definition of done, plus concrete fixes. Pass = 8+ and no failed
   hard rule. Save as `verdict-<n>.md`.
7. If it fails: fix what the judge listed and go back to CHECK. At most 3 rounds. Still failing → revert the
   item's changes, mark `- [!] … reason`, add a lesson.
8. If it passes: commit on `fabrica` (message ends with the attribution lines from the system reminder), tick
   the queue item with the hash, add any lesson to `lessons.md`, push `fabrica`
   (`git -c push.negotiate=true push origin fabrica`).
9. Report: append to `factory/reports/<date>.md` (what was built, scores, screenshots, open questions for
   Pamela, how to test it), commit and push. Finish with a short summary as the final
   message. Write the report in **Portuguese** (Pamela's language); code and commits stay in English.
