#!/usr/bin/env node
/**
 * Builds the STATS_CONFIG secret for the GitHub Actions job (.github/workflows/stats.yml) from
 * scripts/stats.config.json and the repos on this PC:
 *   - every GitHub repo that holds commits of yours, for the job to clone
 *   - your git names/emails
 *   - "extra": totals for commits GitHub no longer has or never had (branches deleted there,
 *     unpushed work, repos that aren't on GitHub), so the site's numbers match this PC's.
 *     Hash prefix, date, merge or not, lines per language; nothing else. A commit that later
 *     turns up on GitHub is counted once.
 *
 *   npm run stats:cloud-config
 *
 * Writes, both git-ignored:
 *   .signal/STATS_CONFIG.json   paste its whole contents into the STATS_CONFIG secret
 *   .signal/cloud-repos.txt     which number is which repo (Actions logs only say "repo #7")
 *
 * Read-only: runs only `git remote`, `git ls-remote` and `git log` in your repos. Re-run it
 * when you start working in a new repo, and update the secret.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { authorArgs, discoverRepos, isMine, locByLang, LOG_FORMAT, parseLog, refsFor } from './stats-lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const cfg = JSON.parse(readFileSync(join(here, 'stats.config.json'), 'utf8'))
const mine = isMine(cfg)
const MINE = authorArgs(cfg)
const NO_LOC = new Set(cfg.excludeFromLoc ?? [])
const SELF = resolve(root).toLowerCase()

const git = (cwd, args, input) => {
  try {
    return execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      input,
      maxBuffer: 1 << 30,
      timeout: 120_000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, // a stale GitHub login may show its normal sign-in window
      stdio: ['pipe', 'pipe', 'ignore'],
    })
  } catch {
    return null
  }
}
const slugOf = (url) => url.trim().match(/github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i)?.slice(1, 3).join('/')
// your commits (exact identity, like collect-stats) reachable from the revisions given on stdin
const reachable = (cwd, revs) =>
  revs.length
    ? new Set(
        (git(cwd, ['log', '--stdin', ...MINE, '--format=%H|%an|%ae'], revs.join('\n') + '\n') ?? '')
          .split('\n')
          .filter(Boolean)
          .map((l) => l.split('|'))
          .filter(([, an, ae]) => mine(an, ae))
          .map(([h]) => h)
      )
    : new Set()

const out = [] // repos for the job to clone
const listed = new Set()
const extraRepos = []
const extra = []
const counted = new Set() // every commit, once
let total = 0
let unchecked = 0

for (const r of discoverRepos(cfg)) {
  const self = resolve(r.path).toLowerCase() === SELF
  const log = git(r.path, ['log', ...refsFor(self), ...MINE, LOG_FORMAT, '--numstat'])
  if (!log) continue
  const commits = [...parseLog(log)].filter((c) => mine(c.an, c.ae) && !counted.has(c.hash))
  if (!commits.length) continue

  // what GitHub has: your commits on branches that still exist there
  const onGitHub = new Set()
  for (const remote of (git(r.path, ['remote']) ?? '').split('\n').filter(Boolean)) {
    const slug = slugOf(git(r.path, ['remote', 'get-url', remote]) ?? '')
    if (!slug) continue
    const local = (git(r.path, ['for-each-ref', '--format=%(refname:lstrip=3)', `refs/remotes/${remote}`]) ?? '')
      .split('\n')
      .filter((b) => b && b !== 'HEAD' && !(self && b === 'stats'))
    const ls = git(r.path, ['ls-remote', '--heads', remote])
    if (ls === null) {
      unchecked++ // can't tell which branches GitHub still has, so the totals would be wrong
      continue
    }
    const there = new Set(ls.split('\n').filter(Boolean).map((l) => l.split('\trefs/heads/')[1]))
    const live = local.filter((b) => there.has(b))
    const hits = reachable(r.path, live.map((b) => `refs/remotes/${remote}/${b}`))
    if (!hits.size) continue // e.g. an upstream you only pull from
    hits.forEach((h) => onGitHub.add(h))
    if (!listed.has(slug.toLowerCase())) {
      listed.add(slug.toLowerCase())
      out.push({ repo: slug, name: r.name, kind: r.kind })
    }
  }

  let ri = -1
  for (const c of commits) {
    counted.add(c.hash)
    total++
    if (onGitHub.has(c.hash)) continue
    if (ri < 0) ri = extraRepos.push([r.name, r.kind]) - 1
    const loc = NO_LOC.has(r.name) ? {} : locByLang(c.lines)
    extra.push([c.hash.slice(0, 12), c.iso, c.merge ? 1 : 0, ri, ...(Object.keys(loc).length ? [loc] : [])])
  }
}

if (unchecked) {
  console.error(
    `Couldn't reach GitHub for ${unchecked} repo(s), so nothing was written (your last STATS_CONFIG.json is untouched).\n` +
      'Usually git just needs you to sign in again: run `git fetch` in one of your work repos, then run this again.'
  )
  process.exit(1)
}

const dir = join(root, '.signal')
mkdirSync(dir, { recursive: true })
const secret = { repos: out, names: cfg.names, emails: cfg.emails, excludeFromLoc: cfg.excludeFromLoc ?? [], extra: { repos: extraRepos, commits: extra } }
const json = JSON.stringify(secret)
writeFileSync(join(dir, 'STATS_CONFIG.json'), json + '\n')
writeFileSync(
  join(dir, 'cloud-repos.txt'),
  out.map((r, i) => `#${String(i + 1).padEnd(3)} ${r.kind.padEnd(9)} ${r.repo}   (on this PC: ${r.name})`).join('\n') + '\n'
)

console.log(`${out.length} GitHub repos to read · ${total.toLocaleString('en-IN')} commits of yours, ${extra.length} of them carried in the secret (not on GitHub)`)
console.log(`Secret size: ${(json.length / 1024).toFixed(1)} KB of GitHub's 48 KB limit`)
if (json.length > 48_000) console.log('Too big for one secret: remove repos you no longer want counted from scripts/stats.config.json.')
// Also put it on the clipboard: selecting a 12,000-character line by hand is how pastes get cut off.
let copied = false
try {
  if (process.platform === 'win32') {
    const ps = '[Console]::InputEncoding = [Text.Encoding]::UTF8; Set-Clipboard -Value ([Console]::In.ReadToEnd())'
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { input: json, stdio: ['pipe', 'ignore', 'ignore'], timeout: 30_000 })
    copied = true
  } else if (process.platform === 'darwin') {
    execFileSync('pbcopy', [], { input: json, timeout: 30_000 })
    copied = true
  }
} catch {}
console.log(
  copied
    ? `Copied to your clipboard (${json.length.toLocaleString('en-US')} characters): paste it into the STATS_CONFIG secret.`
    : `Paste the whole of ${join(dir, 'STATS_CONFIG.json')} into the STATS_CONFIG secret.`
)
console.log(`Repo numbers (Actions logs use them): ${join(dir, 'cloud-repos.txt')}`)
