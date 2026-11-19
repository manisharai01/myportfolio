import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { onToast } from '../lib/toast'

export default function Toaster() {
  const [items, setItems] = useState([])
  useEffect(
    () =>
      onToast((message) => {
        const id = Math.random().toString(36).slice(2)
        setItems((list) => [...list.slice(-2), { id, message }])
        setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 2600)
      }),
    []
  )
  return (
    <div className="toaster" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            className="toast mono"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="live-dot live-dot--volt" /> {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
