import { useSyncExternalStore } from 'react'
import baked from '../data/signal.json'

/**
 * Git stats behind the Signal section, hero, ticker, journey track and footer.
 *
 * The build ships a snapshot (src/data/signal.json). On load we also fetch the copy that
 * scripts/publish-stats.mjs keeps current on the repo's `stats` branch, and swap it in
 * when it's newer, so new commits show up without a code change or a redeploy.
 * Offline, blocked or malformed: the snapshot stays.
 */
const LIVE_URL = 'https://raw.githubusercontent.com/manisharai01/myportfolio/stats/signal.json'

const derive = (s) => ({
  ...s,
  repos: s.reposWork + s.reposPersonal,
  peakHour: s.hours.indexOf(Math.max(...s.hours)),
})

const DAY = /^\d{4}-\d{2}-\d{2}$/
const count = (n) => Number.isInteger(n) && n >= 0
const counts = (a, len) => Array.isArray(a) && (len ? a.length === len : a.length > 0) && a.every(count)
const share = (n) => typeof n === 'number' && n >= 0 && n <= 1

function valid(s) {
  return (
    !!s &&
    [s.start, s.first, s.last, s.generated].every((d) => typeof d === 'string' && DAY.test(d)) &&
    [s.commits, s.nonMerge, s.merges, s.workCommits, s.reposWork, s.reposPersonal, s.activeDays, s.bestStreak].every(count) &&
    s.commits > 0 &&
    counts(s.series) &&
    counts(s.hours, 24) &&
    counts(s.dows, 7) &&
    Array.isArray(s.langs) &&
    s.langs.every((l) => l && typeof l.name === 'string' && share(l.share)) &&
    share(s.outsideShare) &&
    share(s.weekendShare)
  )
}

const stamp = (s) => Date.parse(s.updatedAt ?? s.generated) || 0

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** '2026-11-25' → '25 Nov 2026' */
export const fmtDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

let current = derive(baked)
const subs = new Set()
const subscribe = (fn) => {
  subs.add(fn)
  return () => subs.delete(fn)
}
const snapshot = () => current

/** The freshest stats we have; re-renders when newer ones arrive. */
export function useSignal() {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

let started = false
/** Fetch the published stats once. Call as early as possible (main.jsx). */
export function syncSignal() {
  if (started || typeof fetch !== 'function') return
  started = true
  fetch(LIVE_URL)
    .then((r) => (r.ok ? r.json() : null))
    .then((s) => {
      if (!valid(s) || stamp(s) <= stamp(current)) return
      current = derive(s)
      subs.forEach((fn) => fn())
    })
    .catch(() => {})
}
