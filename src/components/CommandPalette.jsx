import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV, PROFILE, WORK } from '../data/content'
import { scrollToTarget, startScroll, stopScroll } from '../lib/scroll'
import { copyText, toast } from '../lib/toast'
import './CommandPalette.css'

function buildActions() {
  return [
    ...NAV.map((n) => ({ group: 'Go to', label: n.label, hint: n.n, run: () => scrollToTarget(n.href) })),
    { group: 'Go to', label: 'Top', hint: '00', run: () => scrollToTarget(0) },
    ...WORK.map((w) => ({ group: 'Projects', label: w.name, hint: w.kicker, run: () => scrollToTarget(`#work-${w.id}`) })),
    {
      group: 'Contact',
      label: 'Copy email address',
      hint: PROFILE.email,
      run: async () => toast((await copyText(PROFILE.email)) ? 'Email copied to clipboard' : PROFILE.email),
    },
    { group: 'Contact', label: 'Write an email', hint: 'mailto', run: () => (window.location.href = `mailto:${PROFILE.email}`) },
    { group: 'Contact', label: 'Open LinkedIn', hint: PROFILE.linkedinHandle, run: () => window.open(PROFILE.linkedin, '_blank', 'noopener') },
    { group: 'Contact', label: 'Open GitHub', hint: PROFILE.githubHandle, run: () => window.open(PROFILE.github, '_blank', 'noopener') },
  ]
}

export default function CommandPalette({ open, onClose }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const actions = useMemo(buildActions, [])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return actions
    return actions.filter((a) => `${a.group} ${a.label} ${a.hint}`.toLowerCase().includes(s))
  }, [q, actions])

  useEffect(() => {
    if (!open) return
    setQ('')
    setIdx(0)
    stopScroll()
    const prev = document.activeElement
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => {
      clearTimeout(t)
      startScroll()
      prev?.focus?.()
    }
  }, [open])

  useEffect(() => setIdx(0), [q])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  const run = (a) => {
    onClose()
    setTimeout(() => a.run(), 120)
  }

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(results.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Enter' && results[idx]) { e.preventDefault(); run(results[idx]) }
    else if (e.key === 'Tab') e.preventDefault()
  }

  let lastGroup = null
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="cmdk__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
          >
            <div className="cmdk__search">
              <span className="mono cmdk__prompt">›</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Jump to a section, a project, or copy my email…"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmdk-list"
                aria-activedescendant={results[idx] ? `cmdk-${idx}` : undefined}
                aria-autocomplete="list"
                spellCheck="false"
              />
              <button type="button" className="cmdk__close" onClick={onClose} aria-label="Close menu">
                ✕
              </button>
            </div>
            <ul className="cmdk__list" id="cmdk-list" role="listbox" ref={listRef}>
              {results.length === 0 && <li className="cmdk__empty mono">No matches — try “email” or “work”.</li>}
              {results.map((a, i) => {
                const head = a.group !== lastGroup
                lastGroup = a.group
                return (
                  <li key={`${a.group}-${a.label}`} role="presentation">
                    {head && <p className="cmdk__group mono">{a.group}</p>}
                    <div
                      id={`cmdk-${i}`}
                      role="option"
                      aria-selected={i === idx}
                      className="cmdk__item"
                      onMouseMove={() => setIdx(i)}
                      onClick={() => run(a)}
                    >
                      <span>{a.label}</span>
                      <span className="cmdk__hint mono">{a.hint}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
