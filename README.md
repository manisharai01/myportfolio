# Manisha Rai — Portfolio

**From the socket to the screen.** A hand-built portfolio for a full-stack engineer who works on
real-time systems, mobile apps and the backends underneath them.

Live: https://manisharai01.github.io/myportfolio/

## What's in it

- **Live contour-field hero.** A raw WebGL2 fragment shader (no libraries) draws a topographic noise map.
  The cursor bends it into a glowing gravity well. The shader adapts its resolution to the device,
  freezes on a still frame for software renderers, and renders once for reduced-motion users.
- **Kinetic name.** A variable font (Anybody, `wdth` 50–150). Letters near the pointer stretch while
  the rest of the line compresses to compensate, so the layout never jumps.
- **Five project "screens", rebuilt in code** instead of screenshots:
  - a split-flap ferry departure board with race-safe gate scans
  - a 5-judge dressage scoreboard
  - a fintech phone that walks through record → pay → fulfil
  - a gamification engine
  - a microservice health monitor
- **Stacking project cards at every screen size.** Each card publishes its height, and CSS pins it
  with `top: min(deck offset, 100svh − height)`. Short cards stick like a deck; tall cards stick by
  their bottom edge once read. The next card always slides over, and nothing is ever clipped.
- **Signal.** A commit heatmap, a 24-hour commit clock and a language mix, all generated from real
  `git log` data and kept current automatically.
- **Journey as release notes.** Roles ship as versions (v0.0 → v2.0) in a pinned, scroll-stepped
  stage:
  - an odometer version number
  - a ghost codename in the background
  - a typed `git` command
  - a changelog for each role
  - a real monthly-commit track with a moving playhead

  Screens that can't fit the stage get a designed list instead.
- **Halftone portrait.** Ink dots on paper that scatter away from the cursor.
- **Extras:**
  - `Ctrl/⌘ + K` command palette
  - custom cursor
  - Lenis smooth scroll
  - stacking project cards
  - self-hosted variable fonts
  - JSON-LD / Open Graph metadata
  - a full reduced-motion path

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview
```

Pushing to `master` deploys to GitHub Pages via `.github/workflows/static.yml`.

## Editing content

All copy lives in **`src/data/content.js`**:

| Section | Constant |
|---|---|
| Profile and links | `PROFILE` |
| Case studies | `WORK` |
| Smaller projects | `ALSO` |
| Experience | `JOURNEY` |
| Skills | `TOOLBELT` |
| Side projects | `LAB` |
| Ticker | `TICKER` |

Components only render it.

## Git stats (they update themselves)

`signal.json` contains only aggregates: daily counts, hours, weekdays and language shares.
No repository names, commit messages or paths are included.

1. **Collect.** `scripts/collect-stats.mjs` runs read-only `git log` over the repos listed in
   `scripts/stats.config.json`. That file is git-ignored; the script's header shows the format.
2. **Publish.** `scripts/publish-stats.mjs` collects into `.signal/`. If the numbers changed, it
   pushes just `signal.json` to the `stats` branch. It uses git plumbing, so your working tree and
   `master` are never touched.
3. **Show.** On load, the page fetches `signal.json` from the `stats` branch and swaps it in if it
   is newer than the bundled copy (`src/lib/signal.js`). Offline, it keeps the bundled copy. Each
   Pages build also bakes in the latest published copy (`scripts/bake-stats.mjs`).

| Command | What it does |
|---|---|
| `npm run stats:schedule` | Publish hourly via Windows Task Scheduler, while you're logged in |
| `npm run stats:unschedule` | Remove that scheduled task |
| `npm run stats:publish` | Publish now; add `-- --dry-run` to only compare |
| `npm run stats` | Regenerate the bundled copy, `src/data/signal.json` |
| `npm run stats:bake` | Copy the published stats into `src/data/signal.json` |

Each scheduled run adds one line to `.signal/refresh.log`. If the commit count suddenly drops by
more than 10% (say a repo folder moved), the publisher refuses and logs why;
`npm run stats:publish -- --force` overrides it.

## Stack

- React 18 + Vite 5
- Framer Motion and Lenis
- Raw WebGL2
- Fonts from Fontsource: Anybody, Hanken Grotesk, Martian Mono, Fraunces
