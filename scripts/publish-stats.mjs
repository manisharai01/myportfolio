#!/usr/bin/env node
/**
 * Keeps the live site's git stats current, with no commits to master and no redeploy.
 *
 *   1. runs collect-stats.mjs into .signal/signal.json (git-ignored)
 *   2. compares it with signal.json on the `stats` branch of origin
 *   3. if the numbers changed, commits that one file to `stats` and pushes it
 *
 * Step 3 uses git plumbing only (hash-object → mktree → commit-tree → push), so your
 * working tree, index, HEAD and master are never touched, and it never gets in the way
 * of your own pushes. The site fetches the file from that branch on every visit
 * (src/lib/signal.js), and each Pages build bakes it in (scripts/bake-stats.mjs).
 *
 *   npm run stats:publish                 collect + publish if changed
 *   npm run stats:publish -- --dry-run    collect + compare, push nothing
 *   npm run stats:publish -- --force      publish even if the commit count dropped a lot
 *
 * Runs hourly through Windows Task Scheduler (npm run stats:schedule).
 * Every run appends one line to .signal/refresh.log.
 */
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const dir = join(root, '.signal')
const fresh = join(dir, 'signal.json')
const logFile = join(dir, 'refresh.log')
const BRANCH = 'stats'
const FILE = 'signal.json'
const DRY = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')

mkdirSync(dir, { recursive: true })

function log(msg) {
  const line = `${new Date().toISOString()}  ${msg}`
  console.log(line)
  try {
    if (existsSync(logFile) && statSync(logFile).size > 200_000) {
      writeFileSync(logFile, readFileSync(logFile, 'utf8').split('\n').slice(-400).join('\n'))
    }
    appendFileSync(logFile, line + '\n')
  } catch {}
}

// never stop to ask for credentials in the background: fail, log it, retry next hour
const env = { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' }
const git = (args, input) =>
  execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', env, input, timeout: 120_000, stdio: ['pipe', 'pipe', 'pipe'] }).trim()
const why = (e) => String(e.stderr || e.message || e).trim().split('\n').pop()

// the numbers, ignoring when they were generated
const same = (a, b) => {
  const strip = ({ generated, updatedAt, ...rest }) => rest
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b))
}

// 1. collect
try {
  execFileSync(process.execPath, [join(here, 'collect-stats.mjs'), '--out', fresh, '--quiet'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 15 * 60_000,
  })
} catch (e) {
  log(`collect failed: ${why(e)}`)
  process.exit(1)
}
const next = JSON.parse(readFileSync(fresh, 'utf8'))
const summary = `${next.commits.toLocaleString('en-IN')} commits · last ${next.last}`

// 2. compare with what's published
let parent = null
let published = null
try {
  if (git(['ls-remote', 'origin', `refs/heads/${BRANCH}`])) {
    git(['fetch', '--quiet', '--no-tags', '--no-write-fetch-head', 'origin', `+refs/heads/${BRANCH}:refs/remotes/origin/${BRANCH}`])
    parent = git(['rev-parse', `refs/remotes/origin/${BRANCH}`])
    try {
      published = JSON.parse(git(['show', `${parent}:${FILE}`]))
    } catch {}
  }
} catch (e) {
  log(`can't reach origin: ${why(e)}`)
  process.exit(1)
}

if (published && same(published, next)) {
  log(`unchanged · ${summary}`)
  process.exit(0)
}
// A big drop usually means a repo folder moved or the config broke, not real history.
if (published && next.commits < published.commits * 0.9 && !FORCE) {
  log(`not published: commits fell from ${published.commits} to ${next.commits}. If that's expected, run: npm run stats:publish -- --force`)
  process.exit(1)
}
if (DRY) {
  log(`dry run · would publish ${summary}${published ? ` (published: ${published.commits} commits · last ${published.last})` : ' (first publish)'}`)
  process.exit(0)
}

// 3. commit just signal.json onto `stats`, without touching the working tree, and push
try {
  const blob = git(['hash-object', '-w', '--no-filters', fresh])
  const tree = git(['mktree'], `100644 blob ${blob}\t${FILE}\n`)
  const commit = git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', `signal: ${summary}`])
  git(['push', '--quiet', 'origin', `${commit}:refs/heads/${BRANCH}`])
  log(`published ${commit.slice(0, 7)} · ${summary}`)
} catch (e) {
  log(`push failed: ${why(e)}`)
  process.exit(1)
}
