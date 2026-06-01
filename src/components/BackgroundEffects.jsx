import { motion } from 'framer-motion'

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Radial gradient top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse, #00d4ff 0%, transparent 70%)' }} />

      {/* Blob 1 */}
      <motion.div
        className="absolute top-1/4 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Blob 2 */}
      <motion.div
        className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }}
        animate={{ x: [0, -60, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Blob 3 */}
      <motion.div
        className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-neon-cyan opacity-40"
          style={{
            left: `${10 + i * 8}%`,
            top: `${15 + (i % 5) * 18}%`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}
    </div>
  )
}
