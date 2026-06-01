import { motion } from 'framer-motion'
import { Play, ArrowRight, Shield, Users, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import FloatingElements from './FloatingElements'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
})

const badges = [
  { icon: Shield, text: 'SOC2 Certified' },
  { icon: Users, text: '1M+ Learners' },
  { icon: Star, text: '4.9 Rating' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center section-padding pt-28">
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div className="space-y-8">
          {/* Badge */}
          <motion.div {...fadeUp(0.1)}>
            <span className="inline-flex items-center gap-2 glass-card neon-border px-4 py-2 rounded-full text-sm text-neon-blue font-medium">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
              AI-Powered Language Learning
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.2)}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
          >
            Master Languages{' '}
            <span className="gradient-text">with the Power</span>{' '}
            of AI
          </motion.h1>

          {/* Subheading */}
          <motion.p {...fadeUp(0.35)} className="text-white/60 text-lg md:text-xl leading-relaxed max-w-lg">
            LinguaMind AI helps you learn, speak, and think in multiple languages using
            advanced AI-powered conversations and real-time feedback.
          </motion.p>

          {/* Buttons */}
          <motion.div {...fadeUp(0.45)} className="flex flex-wrap gap-4">
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="glow-button text-white flex items-center gap-2"
              >
                Start Learning <ArrowRight size={16} />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="glass-card neon-border px-8 py-3 rounded-full font-semibold text-white/80 hover:text-white flex items-center gap-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
                <Play size={12} className="text-white ml-0.5" />
              </div>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div {...fadeUp(0.55)} className="flex flex-wrap gap-4">
            {badges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/50 text-sm">
                <Icon size={14} className="text-neon-cyan" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — floating dashboard */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          className="relative hidden lg:block"
        >
          <FloatingElements />

          {/* Glow behind panel */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-20 rounded-full"
            style={{ background: 'radial-gradient(circle, #00d4ff 0%, #7c3aed 50%, transparent 70%)' }} />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-white/30 text-xs">Scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-neon-blue to-transparent" />
      </motion.div>
    </section>
  )
}
