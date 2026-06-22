import { motion } from 'framer-motion'

const items = [
  'React', 'Flutter', 'Python', 'TensorFlow', 'OpenCV', 'Java',
  'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS', 'Figma',
  'Framer Motion', 'Node.js', 'REST APIs', 'Bootstrap',
]

export default function Marquee() {
  const row = [...items, ...items]
  return (
    <div className="marquee" aria-hidden>
      <motion.div
        className="marquee-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
      >
        {row.map((it, i) => (
          <span key={i} className="marquee-item">
            {it} <em>·</em>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
