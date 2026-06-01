import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    avatar: 'SC',
    color: '#00d4ff',
    text: 'LinguaMind AI transformed how I learn Mandarin. The AI conversations feel incredibly natural and the pronunciation feedback is spot-on.',
    stars: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'Digital Nomad',
    avatar: 'MR',
    color: '#7c3aed',
    text: 'I\'ve tried every language app out there. Nothing comes close to the personalized experience LinguaMind AI delivers. Fluent in Spanish in 6 months.',
    stars: 5,
  },
  {
    name: 'Aiko Tanaka',
    role: 'Business Analyst',
    avatar: 'AT',
    color: '#ec4899',
    text: 'The real-time translation and cultural context features helped me close deals with international clients. Absolutely game-changing.',
    stars: 5,
  },
  {
    name: 'James Okafor',
    role: 'Medical Student',
    avatar: 'JO',
    color: '#06b6d4',
    text: 'Learning French for my residency abroad was daunting. LinguaMind AI made it manageable and even enjoyable. Highly recommend.',
    stars: 5,
  },
  {
    name: 'Elena Vasquez',
    role: 'Content Creator',
    avatar: 'EV',
    color: '#f59e0b',
    text: 'The progress analytics keep me motivated. Seeing my improvement visualized week over week is incredibly satisfying.',
    stars: 5,
  },
  {
    name: 'David Kim',
    role: 'Entrepreneur',
    avatar: 'DK',
    color: '#10b981',
    text: 'Built my entire team\'s language training around LinguaMind AI. The ROI has been phenomenal — communication barriers are gone.',
    stars: 5,
  },
]

function TestimonialCard({ t, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass-card p-6 rounded-2xl relative group overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 0% 0%, ${t.color}10, transparent 60%)` }} />

      <Quote size={20} className="mb-4 opacity-30" style={{ color: t.color }} />

      <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}>
            {t.avatar}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{t.name}</p>
            <p className="text-white/40 text-xs">{t.role}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(t.stars)].map((_, i) => (
            <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="testimonials" className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-neon-purple text-sm font-medium tracking-widest uppercase">Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4">
            Loved by <span className="gradient-text">Learners Worldwide</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Join over a million people who've transformed their language skills with LinguaMind AI.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => <TestimonialCard key={t.name} t={t} index={i} />)}
        </div>
      </div>
    </section>
  )
}
