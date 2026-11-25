#!/usr/bin/env node
/**
 * Regenerates src/data/signal.json — the commit heatmap, commit clock and
 * language mix shown in the "Signal" section.
 *
 * READ-ONLY: it only runs `git log` against the repositories listed in
 * scripts/stats.config.json (git-ignored, so private repo names and
 * identities never reach the public repo). The output contains aggregates
 * only — no repository names, messages, or file paths.
 *
 *   node scripts/collect-stats.mjs                  → src/data/signal.json
 *   node scripts/collect-stats.mjs --out <file>     → anywhere else (publish-stats.mjs uses this)
 *   --config <file>  another config   --quiet  no summary   --strict  fail if any repo can't be read
 *
 * stats.config.json shape:
 * {
 *   "roots": [{ "dir": "C:/work", "kind": "work" }, { "dir": "C:/projects", "kind": "personal" }],
 *   "exclude": ["myportfolio"],
 *   "excludeFromLoc": ["SomeRepoWithVendoredCode"],
 *   "names": ["my-git-name"],
 *   "emails": ["me@example.com"]
 * }
 * The GitHub Actions job (cloud-stats.mjs) passes a config with two more keys:
 *   "repos": [{ "path": "/x.git", "name": "x", "kind": "work", "self": false }]   read these directly
 *   "extra": { "repos": [["x", "work"]], "commits": [["<hash prefix>", "<author ISO date>", 0|1, repoIndex, { "Dart": 12 }]] }
 *            commits only your PC has (branches deleted on GitHub, unpushed work), counted unless
 *            the same commit turns up in a repo
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { authorArgs, discoverRepos, isMine, locByLang, LOG_FORMAT, parseLog, refsFor } from './stats-lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const outAt = argv.indexOf('--out')
const OUT = outAt >= 0 && argv[outAt + 1] ? resolve(argv[outAt + 1]) : join(here, '..', 'src', 'data', 'signal.json')
const QUIET = argv.includes('--quiet')
const STRICT = argv.includes('--strict')
const cfgAt = argv.indexOf('--config')
const configPath = cfgAt >= 0 && argv[cfgAt + 1] ? resolve(argv[cfgAt + 1]) : join(here, 'stats.config.json')
if (!existsSync(configPath)) {
  console.error(`Missing ${configPath} — see the header of this file.`)
  process.exit(1)
}
const cfg = JSON.parse(readFileSync(configPath, 'utf8'))
const mine = isMine(cfg)
const NO_LOC = new Set(cfg.excludeFromLoc ?? [])
const SELF = resolve(here, '..').toLowerCase()
const repos = [...(cfg.repos ?? []), ...discoverRepos(cfg)]

const seen = new Set()
const days = {}
const hours = Array(24).fill(0)
const dows = Array(7).fill(0) // Mon..Sun
const langs = {}
const touched = { work: new Set(), personal: new Set() }
let commits = 0, merges = 0, work = 0, outside = 0, weekend = 0, added = 0
let first = null, last = null

function count({ hash, merge, iso, kind, name, loc }) {
  seen.add(hash)
  const day = iso.slice(0, 10)
  const hr = parseInt(iso.slice(11, 13), 10) // author's local wall clock
  const dow = (new Date(day + 'T00:00:00Z').getUTCDay() + 6) % 7
  days[day] = (days[day] || 0) + 1
  hours[hr]++
  dows[dow]++
  commits++
  if (merge) merges++
  if (kind === 'work') work++
  touched[kind].add(name)
  if (dow >= 5 || hr < 9 || hr >= 18) outside++
  if (dow >= 5) weekend++
  if (!first || day < first) first = day
  if (!last || day > last) last = day
  for (const [lang, n] of Object.entries(loc ?? {})) {
    langs[lang] = (langs[lang] || 0) + n
    if (kind === 'work') added += n
  }
}

for (const [i, r] of repos.entries()) {
  let out
  try {
    out = execFileSync('git', ['-C', r.path, 'log', ...refsFor(r.self || resolve(r.path).toLowerCase() === SELF), ...authorArgs(cfg), LOG_FORMAT, '--numstat'], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch {
    if (STRICT) {
      console.error(`Couldn't read repo #${i + 1} (${r.kind}).`) // by number: this may run in public CI logs
      process.exit(1)
    }
    continue
  }
  for (const c of parseLog(out)) {
    if (!mine(c.an, c.ae) || seen.has(c.hash)) continue
    count({ ...c, kind: r.kind, name: r.name, loc: NO_LOC.has(r.name) ? null : locByLang(c.lines) })
  }
}

if (cfg.extra?.commits?.length) {
  const prefixes = new Set([...seen].map((h) => h.slice(0, 12)))
  for (const [h, iso, merge, ri, loc] of cfg.extra.commits) {
    if (prefixes.has(h)) continue
    const [name, kind] = cfg.extra.repos[ri]
    count({ hash: h, merge: !!merge, iso, kind, name, loc })
  }
}

if (!commits) {
  console.error('No matching commits found — check roots, names and emails in scripts/stats.config.json.')
  process.exit(1)
}

// one count per day from the first Monday on/before `first` to `last`
const start = new Date(first + 'T00:00:00Z')
start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7))
const series = []
for (let d = new Date(start); d.toISOString().slice(0, 10) <= last; d.setUTCDate(d.getUTCDate() + 1)) {
  series.push(days[d.toISOString().slice(0, 10)] || 0)
}

let best = 0, run = 0
for (const c of series) { run = c ? run + 1 : 0; best = Math.max(best, run) }

const totalLoc = Object.values(langs).reduce((a, b) => a + b, 0)
const langMix = Object.entries(langs)
  .sort((a, b) => b[1] - a[1])
  .map(([name, loc]) => ({ name, share: +(loc / totalLoc).toFixed(4) }))

const now = new Date()
const result = {
  // the day in local time (IST), like every other date in here; updatedAt is the exact moment
  generated: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10),
  updatedAt: now.toISOString(),
  start: start.toISOString().slice(0, 10),
  first,
  last,
  commits,
  nonMerge: commits - merges,
  merges,
  workCommits: work,
  reposWork: touched.work.size,
  reposPersonal: touched.personal.size,
  activeDays: Object.keys(days).length,
  bestStreak: best,
  outsideShare: +(outside / commits).toFixed(3),
  weekendShare: +(weekend / commits).toFixed(3),
  workLinesAdded: added,
  hours,
  dows,
  langs: langMix,
  series,
}
writeFileSync(OUT, JSON.stringify(result) + '\n')
if (!QUIET) {
  const { series: _s, ...summary } = result
  console.log(summary)
}
