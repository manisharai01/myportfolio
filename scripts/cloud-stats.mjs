#!/usr/bin/env node
/**
 * The GitHub Actions side of the git stats (.github/workflows/stats.yml): no PC needed.
 *
 * Reads two repository secrets:
 *   STATS_TOKEN   a GitHub token that can read every repo below
 *   STATS_CONFIG  the JSON that `npm run stats:cloud-config` writes (repo list + your git identities)
 *
 * Keeps a blobless bare clone of each repo in ~/stats-repos (cached between runs), downloads
 * just the file versions your own commits touched (one batch per repo), then runs
 * collect-stats.mjs over the clones into .signal/signal.json for publish-stats.mjs.
 *
 * This repo is public, so its Actions logs are too: repos are only ever named by number
 * (.signal/cloud-repos.txt on your PC says which is which), and every name, URL and
 * identity from the secret is masked.
 *
 * Try it on your PC first, with your normal git login and .signal/STATS_CONFIG.json:
 *   STATS_REPOS_DIR=<scratch dir> node scripts/cloud-stats.mjs --local
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const fail = (msg) => {
  console.log(`::error::${msg}`)
  process.exit(1)
}

const LOCAL = process.argv.includes('--local')
const cfgFile = join(root, '.signal', 'STATS_CONFIG.json')
const token = process.env.STATS_TOKEN
const raw = process.env.STATS_CONFIG || (LOCAL && existsSync(cfgFile) ? readFileSync(cfgFile, 'utf8') : '')
if ((!token && !LOCAL) || !raw) {
  // not set up yet: skip quietly rather than fail (and email you) every hour
  console.log('::notice::Skipped: add the STATS_TOKEN and STATS_CONFIG repository secrets to turn this on (README → "Git stats").')
  process.exit(0)
}
let cfg
try {
  cfg = JSON.parse(raw)
} catch {
  fail("STATS_CONFIG isn't valid JSON. Paste the whole of .signal/STATS_CONFIG.json from `npm run stats:cloud-config`.")
}
if (!Array.isArray(cfg.repos) || !cfg.repos.length || !cfg.names || !cfg.emails) fail('STATS_CONFIG is missing repos, names or emails.')

// hide everything private before anything else gets printed (only means something on Actions)
const mask = (v) => {
  if (process.env.GITHUB_ACTIONS === 'true' && typeof v === 'string' && v.length >= 3) console.log(`::add-mask::${v}`)
}
for (const r of cfg.repos) [r.repo, ...r.repo.split('/'), r.name].forEach(mask)
;[...cfg.names, ...cfg.emails].forEach(mask)

const env = { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never', GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'gc.auto', GIT_CONFIG_VALUE_0: '0' }
if (token) {
  // the token travels as a header from the environment: never in a URL or on a command line
  const auth = Buffer.from(`x-access-token:${token}`).toString('base64')
  mask(auth)
  Object.assign(env, { GIT_CONFIG_COUNT: '2', GIT_CONFIG_KEY_1: 'http.https://github.com/.extraheader', GIT_CONFIG_VALUE_1: `AUTHORIZATION: basic ${auth}` })
}
delete env.STATS_TOKEN
delete env.STATS_CONFIG
const git = (args, input) =>
  execFileSync('git', args, { env, input, encoding: 'utf8', maxBuffer: 1 << 30, timeout: 20 * 60_000, stdio: ['pipe', 'pipe', 'pipe'] })

const MINE = ['--no-use-mailmap', '-i', '-F', ...[...cfg.names, ...cfg.emails].map((p) => `--author=${p}`)]
const self = (process.env.GITHUB_REPOSITORY || '').toLowerCase()
const base = process.env.STATS_REPOS_DIR || join(homedir(), 'stats-repos')
mkdirSync(base, { recursive: true })

const repos = []
const broken = []
const t0 = Date.now()
for (const [i, r] of cfg.repos.entries()) {
  const n = `repo #${i + 1} (${r.kind})`
  const dir = join(base, createHash('sha1').update(r.repo.toLowerCase()).digest('hex').slice(0, 16) + '.git')
  const isSelf = r.repo.toLowerCase() === self
  const cached = existsSync(join(dir, 'HEAD'))
  try {
    if (cached) git(['-C', dir, 'fetch', '--quiet', '--prune', '--tags', 'origin', '+refs/heads/*:refs/heads/*'])
    else git(['clone', '--quiet', '--bare', '--filter=blob:none', `https://github.com/${r.repo}.git`, dir])
  } catch {
    if (!cached) {
      broken.push(n)
      continue
    }
    console.log(`::warning::Couldn't update ${n}; using its copy from the last run.`)
  }
  // One request for every file version your commits touched, so the line counts below never
  // fall back to fetching them one at a time. (Submodule pointers aren't files: skipped.)
  try {
    const refs = isSelf ? ['--exclude=stats', '--branches'] : ['--branches']
    const oids = new Set()
    for (const line of git(['-C', dir, 'log', ...refs, '--tags', ...MINE, '--format=', '--raw', '--no-abbrev', '--no-renames']).split('\n')) {
      const m = line.match(/^:(\d{6}) (\d{6}) ([0-9a-f]{40}) ([0-9a-f]{40}) /)
      if (!m) continue
      if (m[1] !== '160000' && !/^0+$/.test(m[3])) oids.add(m[3])
      if (m[2] !== '160000' && !/^0+$/.test(m[4])) oids.add(m[4])
    }
    if (oids.size) {
      const args = ['-C', dir, '-c', 'fetch.negotiationAlgorithm=noop', 'fetch', '--quiet', '--no-tags', '--no-write-fetch-head', '--recurse-submodules=no', '--filter=blob:none', '--stdin', 'origin']
      git(args, [...oids].join('\n') + '\n')
    }
  } catch {
    console.log(`::warning::Couldn't batch-download files for ${n}; its line counts will be slower.`)
  }
  repos.push({ path: dir, name: r.name, kind: r.kind, self: isSelf })
}

// Never publish numbers that silently leave a repo out.
if (broken.length) {
  fail(`Couldn't clone ${broken.join(', ')}. Give the token access (or authorize it for the org's SSO), or remove that entry from STATS_CONFIG. .signal/cloud-repos.txt on your PC lists the numbers.`)
}

const tmp = join(process.env.RUNNER_TEMP || homedir(), 'stats.cloud.json')
const out = join(root, '.signal', LOCAL ? 'signal.cloud-test.json' : 'signal.json')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(tmp, JSON.stringify({ repos, names: cfg.names, emails: cfg.emails, excludeFromLoc: cfg.excludeFromLoc ?? [], extra: cfg.extra }))
try {
  execFileSync(process.execPath, [join(here, 'collect-stats.mjs'), '--config', tmp, '--out', out, '--quiet', '--strict'], {
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 40 * 60_000,
  })
} catch (e) {
  fail(`Counting failed: ${String(e.stderr || '').trim().split('\n').pop() || 'unknown error'}`)
}

// mark who published it, so the PC task (if still installed) knows to stand down
const s = JSON.parse(readFileSync(out, 'utf8'))
if (!LOCAL) {
  s.source = 'github-actions'
  writeFileSync(out, JSON.stringify(s) + '\n')
}
console.log(`Read ${repos.length} repos in ${Math.round((Date.now() - t0) / 1000)}s · ${s.commits.toLocaleString('en-IN')} commits · last ${s.last}`)
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, 'ready=true\n') // lets the publish step run
