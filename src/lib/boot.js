import { useEffect, useState } from 'react'

// Tiny "the curtain is up" signal shared by the preloader and the hero.
let ready = false
const subs = new Set()

export function markReady() {
  if (ready) return
  ready = true
  subs.forEach((fn) => fn())
  subs.clear()
}

export function onReady(fn) {
  if (ready) {
    fn()
    return () => {}
  }
  subs.add(fn)
  return () => subs.delete(fn)
}

export function useBootReady() {
  const [isReady, setReady] = useState(ready)
  useEffect(() => onReady(() => setReady(true)), [])
  return isReady
}
