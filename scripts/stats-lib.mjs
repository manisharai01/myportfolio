/**
 * Shared by collect-stats.mjs and cloud-config.mjs, so the PC and the GitHub Actions job
 * agree on which repos, which commits and which lines count.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const LANG = {
  dart: 'Dart', ts: 'TypeScript', tsx: 'TypeScript', mts: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
  mjs: 'JavaScript', cjs: 'JavaScript', py: 'Python', kt: 'Kotlin', kts: 'Kotlin', java: 'Java', swift: 'Swift',
  css: 'CSS', scss: 'CSS', html: 'HTML', sql: 'SQL', prisma: 'SQL', rs: 'Rust', go: 'Go',
}
// NB: no bare `lib` here — Flutter keeps all of its source in lib/
const SKIP_DIR = /(^|\/)(node_modules|dist|build|out|\.dart_tool|Pods|vendor|generated|coverage|\.next|site-packages|\.?venv)\//i
const SKIP_FILE = /(\.g\.dart|\.freezed\.dart|\.min\.(js|css)|\.map|lock\.json|\.lock|-lock\.yaml|\.d\.ts)$/i

/** numstat lines → { language: lines added }, skipping generated, vendored and lock files */
export function locByLang(lines) {
  const out = {}
  for (const ln of lines) {
    const m = ln.match(/^(\d+)\t\d+\t(.+)$/)
    if (!m || SKIP_DIR.test(m[2]) || SKIP_FILE.test(m[2])) continue
    const lang = LANG[(m[2].split('.').pop() || '').toLowerCase()]
    if (lang) out[lang] = (out[lang] || 0) + +m[1]
  }
  return out
}

/** Each top-level folder of each root, plus repos nested one or two levels down. */
export function discoverRepos(cfg) {
  const exclude = new Set(cfg.exclude ?? [])
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
  for (const { dir, kind } of cfg.roots ?? []) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (!exclude.has(name) && isDir(p)) scan(p, name, kind, 2)
    }
  }
  return repos
}

// Let git drop everyone else's commits before it diffs them (most of the run time on big shared
// repos). Fixed, case-insensitive substrings of the raw identity (no mailmap, the same identity
// %an/%ae report), so this only ever keeps a superset; isMine() decides what counts.
export const authorArgs = (cfg) => ['--no-use-mailmap', '-i', '-F', ...[...cfg.names, ...cfg.emails].map((p) => `--author=${p}`)]
export function isMine(cfg) {
  const names = new Set(cfg.names)
  const emails = new Set(cfg.emails.map((e) => e.toLowerCase()))
  return (an, ae = '') => names.has(an) || emails.has(ae.toLowerCase())
}

// Branches + remote branches + tags: every real commit, merges included, but no stash entries.
// The portfolio's own `stats` branch holds publish-stats.mjs's data commits; counting those would
// make every publish add a commit to the next one, forever.
export const refsFor = (self) =>
  self ? ['--exclude=stats', '--branches', '--exclude=*/stats', '--remotes', '--tags'] : ['--branches', '--remotes', '--tags']

export const LOG_FORMAT = '--format=@@@%H|%P|%an|%ae|%aI'
/** Parses `git log ${LOG_FORMAT} --numstat` output. */
export function* parseLog(out) {
  for (const block of out.split('@@@').slice(1)) {
    const [head, ...lines] = block.split('\n')
    const [hash, parents, an, ae = '', iso] = head.split('|')
    yield { hash, merge: parents.trim().split(' ').filter(Boolean).length > 1, an, ae, iso, lines }
  }
}
