import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = false, glow, onClick }) {
  const base = `glass-card rounded-2xl ${className}`
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`${base} cursor-pointer`}
        style={glow ? { boxShadow: `0 0 30px ${glow}20` } : {}}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )
  }
  return <div className={base} style={glow ? { boxShadow: `0 0 30px ${glow}20` } : {}}>{children}</div>
}
