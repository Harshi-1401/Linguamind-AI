import { motion } from 'framer-motion'
import { Mic, Globe, Brain, Zap, Star, MessageSquare } from 'lucide-react'

const floatingCards = [
  { icon: Brain, label: 'AI Powered', color: '#00d4ff', x: '-left-4', y: 'top-16' },
  { icon: Globe, label: '120+ Languages', color: '#7c3aed', x: '-right-4', y: 'top-32' },
  { icon: Mic, label: 'Voice AI', color: '#ec4899', x: '-left-8', y: 'bottom-32' },
  { icon: Zap, label: 'Real-time', color: '#06b6d4', x: '-right-8', y: 'bottom-16' },
]

export default function FloatingElements({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* Main dashboard panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="glass-card neon-border p-6 rounded-3xl relative"
        style={{ minHeight: '380px' }}
      >
        {/* Header bar */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-4 h-6 glass-card rounded-full flex items-center px-3">
            <span className="text-white/30 text-xs">linguamind.ai/dashboard</span>
          </div>
        </div>

        {/* AI chat simulation */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
              <Brain size={14} className="text-white" />
            </div>
            <div className="glass-card px-4 py-2 rounded-2xl rounded-tl-none max-w-xs">
              <p className="text-white/80 text-sm">Bonjour! Comment puis-je vous aider aujourd'hui?</p>
            </div>
          </div>

          <div className="flex items-start gap-3 justify-end">
            <div className="glass-card px-4 py-2 rounded-2xl rounded-tr-none max-w-xs"
              style={{ background: 'rgba(0,212,255,0.08)' }}>
              <p className="text-white/80 text-sm">Je voudrais pratiquer mon français.</p>
            </div>
            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-white/10 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
          </div>

          {/* Typing indicator */}
          <motion.div
            className="flex items-center gap-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
              <Brain size={14} className="text-white" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-neon-blue"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 glass-card p-3 rounded-xl">
          <div className="flex justify-between text-xs text-white/50 mb-2">
            <span>Daily Progress</span><span>78%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00d4ff, #7c3aed)' }}
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stars */}
        <div className="mt-3 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}>
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
          <span className="text-white/50 text-xs ml-1">4.9 rating</span>
        </div>
      </motion.div>

      {/* Floating mini cards */}
      {floatingCards.map(({ icon: Icon, label, color, x, y }, i) => (
        <motion.div
          key={label}
          className={`absolute ${x} ${y} glass-card px-3 py-2 rounded-xl flex items-center gap-2 z-10`}
          style={{ border: `1px solid ${color}30` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { delay: 0.8 + i * 0.2, duration: 0.5 },
            scale: { delay: 0.8 + i * 0.2, duration: 0.5 },
            y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 },
          }}
        >
          <Icon size={14} style={{ color }} />
          <span className="text-white/80 text-xs font-medium whitespace-nowrap">{label}</span>
        </motion.div>
      ))}
    </div>
  )
}
