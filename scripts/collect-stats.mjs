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
 *   node scripts/collect-stats.mjs
 *
 * stats.config.json shape:
 * {
 *   "roots": [{ "dir": "C:/work", "kind": "work" }, { "dir": "C:/projects", "kind": "personal" }],
 *   "exclude": ["myportfolio"],
 *   "excludeFromLoc": ["SomeRepoWithVendoredCode"],
 *   "names": ["my-git-name"],
 *   "emails": ["me@example.com"]
 * }
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const configPath = join(here, 'stats.config.json')
if (!existsSync(configPath)) {
  console.error('Missing scripts/stats.config.json — see the header of this file.')
  process.exit(1)
}
const cfg = JSON.parse(readFileSync(configPath, 'utf8'))
const NAMES = new Set(cfg.names)
const EMAILS = new Set(cfg.emails.map((e) => e.toLowerCase()))
const EXCLUDE = new Set(cfg.exclude ?? [])
const NO_LOC = new Set(cfg.excludeFromLoc ?? [])

const LANG = {
  dart: 'Dart', ts: 'TypeScript', tsx: 'TypeScript', mts: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
  mjs: 'JavaScript', cjs: 'JavaScript', py: 'Python', kt: 'Kotlin', kts: 'Kotlin', java: 'Java', swift: 'Swift',
  css: 'CSS', scss: 'CSS', html: 'HTML', sql: 'SQL', prisma: 'SQL', rs: 'Rust', go: 'Go',
}
// NB: no bare `lib` here — Flutter keeps all of its source in lib/
const SKIP_DIR = /(^|\/)(node_modules|dist|build|out|\.dart_tool|Pods|vendor|generated|coverage|\.next|site-packages|\.?venv)\//i
const SKIP_FILE = /(\.g\.dart|\.freezed\.dart|\.min\.(js|css)|\.map|lock\.json|\.lock|-lock\.yaml|\.d\.ts)$/i

// discover repositories: each top-level folder plus repos nested one or two levels down
const repos = []
const isDir = (p) => {
  try { return statSync(p).isDirectory() } catch { return false }
}
const scan = (p, name, kind, depth) => {
  if (existsSync(join(p, '.git'))) repos.push({ name, path: p, kind })
  if (depth === 0) return
  for (const sub of readdirSync(p)) {
    if (sub === 'node_modules' || sub.startsWith('.')) continue
    const sp = join(p, sub)
    if (isDir(sp)) scan(sp, `${name}/${sub}`, kind, depth - 1)
  }
}
for (const { dir, kind } of cfg.roots) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (!EXCLUDE.has(name) && isDir(p)) scan(p, name, kind, 2)
  }
}

const seen = new Set()
const days = {}
const hours = Array(24).fill(0)
const dows = Array(7).fill(0) // Mon..Sun
const langs = {}
const touched = { work: new Set(), personal: new Set() }
let commits = 0, merges = 0, work = 0, outside = 0, weekend = 0, added = 0
let first = null, last = null

for (const r of repos) {
  let out
  try {
    // branches + remotes + tags: every real commit, merges included, but not stash entries
    out = execFileSync('git', ['-C', r.path, 'log', '--branches', '--remotes', '--tags', '--format=@@@%H|%P|%an|%ae|%aI', '--numstat'], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 1024,
    })
  } catch {
    continue
  }
  for (const block of out.split('@@@').slice(1)) {
    const [head, ...lines] = block.split('\n')
    const [hash, parents, an, ae = '', iso] = head.split('|')
    if (!(NAMES.has(an) || EMAILS.has(ae.toLowerCase()))) continue
    if (seen.has(hash)) continue
    seen.add(hash)
    const day = iso.slice(0, 10)
    const hr = parseInt(iso.slice(11, 13), 10) // author's local wall clock
    const dow = (new Date(day + 'T00:00:00Z').getUTCDay() + 6) % 7
    days[day] = (days[day] || 0) + 1
    hours[hr]++
    dows[dow]++
    commits++
    const isMerge = parents.trim().split(' ').filter(Boolean).length > 1
    if (isMerge) merges++
    if (r.kind === 'work') work++
    touched[r.kind].add(r.name)
    if (dow >= 5 || hr < 9 || hr >= 18) outside++
    if (dow >= 5) weekend++
    if (!first || day < first) first = day
    if (!last || day > last) last = day
    if (NO_LOC.has(r.name)) continue
    for (const ln of lines) {
      const m = ln.match(/^(\d+)\t\d+\t(.+)$/)
      if (!m || SKIP_DIR.test(m[2]) || SKIP_FILE.test(m[2])) continue
      const lang = LANG[(m[2].split('.').pop() || '').toLowerCase()]
      if (!lang) continue
      langs[lang] = (langs[lang] || 0) + +m[1]
      if (r.kind === 'work') added += +m[1]
    }
  }
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

const result = {
  generated: new Date().toISOString().slice(0, 10),
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
writeFileSync(join(here, '..', 'src', 'data', 'signal.json'), JSON.stringify(result) + '\n')
const { series: _s, ...summary } = result
console.log(summary)
