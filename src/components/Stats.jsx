import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, Globe, TrendingUp, Clock } from 'lucide-react'

const stats = [
  { icon: Users, value: 1000000, suffix: '+', label: 'Active Users', color: '#00d4ff', display: '1M+' },
  { icon: Globe, value: 120, suffix: '+', label: 'Languages', color: '#7c3aed', display: '120+' },
  { icon: TrendingUp, value: 98, suffix: '%', label: 'Success Rate', color: '#ec4899', display: '98%' },
  { icon: Clock, value: 24, suffix: '/7', label: 'AI Support', color: '#06b6d4', display: '24/7' },
]

function CountUp({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  const display = target >= 1000000
    ? `${(count / 1000000).toFixed(count >= 1000000 ? 0 : 1)}M`
    : count

  return <span ref={ref}>{display}{suffix}</span>
}

export default function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="glass-card neon-border rounded-3xl p-10 md:p-16"
        >
          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl opacity-10 blur-2xl -z-10"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map(({ icon: Icon, value, suffix, label, color, display }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${color}15`, border: `1px solid ${color}30`, boxShadow: `0 0 20px ${color}20` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <div className="font-display text-4xl md:text-5xl font-bold mb-1"
                  style={{ color }}>
                  <CountUp target={value} suffix={suffix} />
                </div>
                <p className="text-white/50 text-sm font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
