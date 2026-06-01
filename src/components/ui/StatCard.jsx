import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

export default function StatCard({ icon: Icon, label, value, color = '#00d4ff', trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <GlassCard className="p-5 relative overflow-hidden group" hover glow={color}>
        {/* bg glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
          style={{ background: `radial-gradient(circle at 0% 0%, ${color}10, transparent 60%)` }} />

        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Icon size={18} style={{ color }} />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold font-display text-white mb-0.5">{value}</p>
        <p className="text-white/50 text-xs">{label}</p>
      </GlassCard>
    </motion.div>
  )
}
