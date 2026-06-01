import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { MessageSquare, Globe, Mic, BookOpen, Radio, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'AI Conversations',
    desc: 'Practice with a native-level AI tutor that adapts to your skill level and learning style.',
    color: '#00d4ff',
  },
  {
    icon: Globe,
    title: 'Real-time Translation',
    desc: 'Instant translation across 120+ languages with context-aware accuracy.',
    color: '#7c3aed',
  },
  {
    icon: Mic,
    title: 'Smart Pronunciation',
    desc: 'AI-powered phonetic analysis gives you precise feedback on every word.',
    color: '#ec4899',
  },
  {
    icon: BookOpen,
    title: 'Personalized Learning',
    desc: 'Adaptive curriculum that evolves with your progress and goals.',
    color: '#06b6d4',
  },
  {
    icon: Radio,
    title: 'Voice Recognition',
    desc: 'State-of-the-art speech recognition trained on millions of native speakers.',
    color: '#f59e0b',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    desc: 'Deep insights into your learning journey with actionable recommendations.',
    color: '#10b981',
  },
]

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { icon: Icon, title, desc, color } = feature

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-card p-6 rounded-2xl group cursor-default relative overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }} />

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={22} style={{ color }} />
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ boxShadow: `0 0 20px ${color}50` }}
        />
      </div>

      <h3 className="font-display font-semibold text-lg text-white mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </motion.div>
  )
}

export default function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-neon-blue text-sm font-medium tracking-widest uppercase">Features</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4">
            Why Choose <span className="gradient-text">LinguaMind AI</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Everything you need to become fluent, powered by cutting-edge artificial intelligence.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  )
}
