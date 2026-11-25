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
| Ticker | `ticker` |

Components only render it.

## Git stats (they update themselves)

`signal.json` contains only aggregates: daily counts, hours, weekdays and language shares.
No repository names, commit messages or paths are included.

1. **Collect.** Every hour, GitHub Actions (`.github/workflows/stats.yml`) reads your repos with
   read-only `git log`. No PC has to be on.
2. **Publish.** If the numbers changed, just `signal.json` is pushed to the `stats` branch.
3. **Show.** On load, the page fetches `signal.json` from the `stats` branch and swaps it in if it
   is newer than the bundled copy (`src/lib/signal.js`). Offline, it keeps the bundled copy. Each
   Pages build also bakes in the latest published copy (`scripts/bake-stats.mjs`).

### One-time setup

1. **Create a token.** Open
   [github.com/settings/tokens/new?scopes=repo](https://github.com/settings/tokens/new?scopes=repo&description=portfolio-git-stats)
   (a classic token). Use the GitHub account that can see all your repos.
   - Keep the `repo` scope; it's needed to read private repos.
   - Pick an expiry. When it runs out, the job fails and emails you; make a new token and
     replace the secret.
   - If an organisation uses SSO, click **Configure SSO → Authorize** next to the new token.
2. **Build the repo list.** On your PC, run `npm run stats:cloud-config`. It writes
   `.signal/STATS_CONFIG.json`, which is git-ignored.
3. **Add two secrets.** Go to
   [Settings → Secrets and variables → Actions](https://github.com/manisharai01/myportfolio/settings/secrets/actions)
   and click **New repository secret** for each:
   - `STATS_TOKEN`: the token.
   - `STATS_CONFIG`: the whole contents of `.signal/STATS_CONFIG.json`.
4. **Run it once.** Open
   [Actions → Refresh git stats](https://github.com/manisharai01/myportfolio/actions/workflows/stats.yml)
   and click **Run workflow**. The first run clones everything (about 5 minutes); later runs take
   1–2 minutes.

Re-run step 2 and update `STATS_CONFIG` when you start working in a new repo.

How the secret is used:
- **No npm packages in the job.** The token is only used by a job that installs nothing from npm.
- **The logs name repos only by number.** The repo is public, so its Actions logs are too.
  `.signal/cloud-repos.txt` on your PC says which number is which.
- **Commits GitHub can't see are carried in the secret as totals.** These are branches deleted on
  GitHub, unpushed work and repos that aren't on GitHub, so the site matches what your PC counts.

### On your PC

The same pipeline can run on your PC. Once GitHub Actions publishes, the PC task stands down on its
own.

| Command | What it does |
|---|---|
| `npm run stats:cloud-config` | Build the `STATS_CONFIG` secret from the repos on this PC |
| `npm run stats:schedule` | Publish hourly from this PC via Windows Task Scheduler |
| `npm run stats:unschedule` | Remove that scheduled task |
| `npm run stats:publish` | Publish from this PC now; add `-- --dry-run` to only compare |
| `npm run stats` | Regenerate the bundled copy, `src/data/signal.json` |
| `npm run stats:bake` | Copy the published stats into `src/data/signal.json` |

The PC task logs each run to `.signal/refresh.log`. If the commit count suddenly drops by more than
10%, publishing is refused, because that usually means a repo went missing. Run the publisher once
with `--force` if the drop is real.

## Stack

- React 18 + Vite 5
- Framer Motion and Lenis
- Raw WebGL2
- Fonts from Fontsource: Anybody, Hanken Grotesk, Martian Mono, Fraunces
