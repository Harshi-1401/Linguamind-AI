import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Brain, Mic, BookMarked, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { predictProgress } from '../../services/aiService'
import { getSpeakingHistory } from '../../firebase/firestore'
import GlassCard from '../../components/ui/GlassCard'
import ProgressRing from '../../components/ui/ProgressRing'
import { FluencyLineChart, SkillRadarChart } from '../../components/charts/ProgressChart'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 rounded-xl text-xs border border-white/10">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const weeklyData = [
  { day: 'Mon', fluency: 55, grammar: 60, vocab: 40 },
  { day: 'Tue', fluency: 60, grammar: 63, vocab: 45 },
  { day: 'Wed', fluency: 58, grammar: 65, vocab: 50 },
  { day: 'Thu', fluency: 65, grammar: 68, vocab: 55 },
  { day: 'Fri', fluency: 70, grammar: 70, vocab: 60 },
  { day: 'Sat', fluency: 72, grammar: 74, vocab: 65 },
  { day: 'Sun', fluency: 75, grammar: 76, vocab: 70 },
]

const sessionData = [
  { week: 'W1', minutes: 45 },
  { week: 'W2', minutes: 60 },
  { week: 'W3', minutes: 35 },
  { week: 'W4', minutes: 80 },
  { week: 'W5', minutes: 70 },
  { week: 'W6', minutes: 90 },
]

export default function AnalyticsPage() {
  const { userData } = useAuth()
  const [prediction, setPrediction] = useState(null)
  const [loadingPred, setLoadingPred] = useState(false)

  const skillData = [
    { skill: 'Fluency', score: userData?.fluencyScore || 0 },
    { skill: 'Grammar', score: userData?.grammarScore || 0 },
    { skill: 'Pronunciation', score: userData?.pronunciationScore || 0 },
    { skill: 'Vocabulary', score: userData?.vocabularyMastery || 0 },
    { skill: 'Confidence', score: userData?.confidenceScore || 0 },
  ]

  const fetchPrediction = async () => {
    if (!userData) return
    setLoadingPred(true)
    try {
      const p = await predictProgress(userData)
      setPrediction(p)
    } catch {
      setPrediction({ fluencyIn30Days: 80, weeklyGrowth: 5, recommendation: 'Keep practicing daily for best results.' })
    } finally {
      setLoadingPred(false)
    }
  }

  useEffect(() => { fetchPrediction() }, [userData])

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-white">Analytics</h1>
        <p className="text-white/50 mt-1">Detailed performance insights and AI predictions</p>
      </motion.div>

      {/* Score rings */}
      <GlassCard className="p-6">
        <h3 className="font-display font-semibold text-white mb-6">Skill Breakdown</h3>
        <div className="flex flex-wrap gap-8 justify-around">
          {[
            { label: 'Fluency', value: userData?.fluencyScore || 0, color: '#00d4ff' },
            { label: 'Grammar', value: userData?.grammarScore || 0, color: '#7c3aed' },
            { label: 'Pronunciation', value: userData?.pronunciationScore || 0, color: '#ec4899' },
            { label: 'Vocabulary', value: userData?.vocabularyMastery || 0, color: '#06b6d4' },
            { label: 'Confidence', value: userData?.confidenceScore || 0, color: '#f59e0b' },
          ].map(s => (
            <ProgressRing key={s.label} value={s.value} color={s.color} label={s.label} size={90} />
          ))}
        </div>
      </GlassCard>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold text-white mb-4">Weekly Progress</h3>
          <FluencyLineChart data={weeklyData} />
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display font-semibold text-white mb-4">Skill Radar</h3>
          <SkillRadarChart data={skillData} />
        </GlassCard>
      </div>

      {/* Session time bar chart */}
      <GlassCard className="p-6">
        <h3 className="font-display font-semibold text-white mb-4">Study Time (minutes/week)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sessionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="minutes" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="Minutes" />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* AI Prediction */}
      <GlassCard className="p-6 neon-border">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-neon-blue" />
          <h3 className="font-display font-semibold text-white">AI Progress Prediction</h3>
        </div>
        {loadingPred ? (
          <div className="flex gap-1 py-4">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-neon-blue"
                animate={{ y: [0, -6, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
        ) : prediction ? (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
              <p className="text-3xl font-bold text-neon-blue">{prediction.fluencyIn30Days}%</p>
              <p className="text-white/50 text-xs mt-1">Fluency in 30 days</p>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)' }}>
              <p className="text-3xl font-bold text-purple-400">+{prediction.weeklyGrowth}%</p>
              <p className="text-white/50 text-xs mt-1">Weekly growth rate</p>
            </div>
            <div className="p-4 rounded-xl sm:col-span-1" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
              <p className="text-green-400 text-sm leading-relaxed">{prediction.recommendation}</p>
            </div>
          </div>
        ) : null}
      </GlassCard>
    </div>
  )
}
