import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section-padding relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden text-center p-12 md:p-20"
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 -z-10"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'linear-gradient(135deg, #020408, #0a1628, #7c3aed30, #00d4ff20, #020408)',
              backgroundSize: '300% 300%',
            }}
          />

          {/* Glass overlay */}
          <div className="absolute inset-0 glass-card rounded-3xl -z-10" />

          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 -z-10"
            style={{ background: '#7c3aed' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 -z-10"
            style={{ background: '#00d4ff' }} />

          {/* Border */}
          <div className="absolute inset-0 rounded-3xl"
            style={{ border: '1px solid rgba(0,212,255,0.2)' }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm text-neon-blue font-medium mb-6">
              <Sparkles size={14} />
              Limited Time — 30 Days Free
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Start Your AI Language{' '}
              <span className="gradient-text">Journey Today</span>
            </h2>

            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Join thousands of learners transforming communication with LinguaMind AI.
              No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="glow-button text-white flex items-center justify-center gap-2 text-lg px-10 py-4"
                >
                  Get Started Free <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="glass-card px-10 py-4 rounded-full font-semibold text-white/70 hover:text-white transition-colors text-lg"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  View Pricing
                </motion.button>
              </Link>
            </div>

            <p className="text-white/30 text-sm mt-6">
              No credit card required · Cancel anytime · 30-day free trial
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
