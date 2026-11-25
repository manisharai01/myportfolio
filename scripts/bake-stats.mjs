#!/usr/bin/env node
/**
 * Run before a build (the Pages workflow does): if the `stats` branch on origin holds a
 * newer signal.json than src/data/signal.json, copy it over, so the deployed bundle
 * starts with the freshest numbers. The page still checks for newer ones on load.
 *
 * No branch, offline or a bad file: keeps the committed copy. Never fails the build.
 *
 *   node scripts/bake-stats.mjs     (or: npm run stats:bake)
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, 'src', 'data', 'signal.json')
const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 60_000, stdio: ['ignore', 'pipe', 'pipe'] })
const stamp = (s) => Date.parse(s.updatedAt ?? s.generated)
const usable = (s) =>
  s && Number.isInteger(s.commits) && Array.isArray(s.series) && s.series.length > 0 && s.hours?.length === 24 && s.dows?.length === 7 && !Number.isNaN(stamp(s))

let live
try {
  git('fetch', '--quiet', '--no-tags', 'origin', '+refs/heads/stats:refs/remotes/origin/stats')
  live = JSON.parse(git('show', 'refs/remotes/origin/stats:signal.json'))
} catch {
  console.log('bake-stats: no published stats reachable, building with src/data/signal.json')
  process.exit(0)
}

const baked = JSON.parse(readFileSync(target, 'utf8'))
if (!usable(live)) {
  console.log('bake-stats: published stats look malformed, keeping src/data/signal.json')
} else if (stamp(live) > stamp(baked)) {
  writeFileSync(target, JSON.stringify(live) + '\n')
  console.log(`bake-stats: using published stats from ${live.updatedAt ?? live.generated} (${live.commits} commits, last ${live.last})`)
} else {
  console.log(`bake-stats: src/data/signal.json is already the newest (${baked.updatedAt ?? baked.generated})`)
}
