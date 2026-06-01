import { motion } from 'framer-motion'
import { Flame, Zap, Trophy, Target, BookOpen, Mic, MessageSquare, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import GlassCard from '../../components/ui/GlassCard'
import ProgressRing from '../../components/ui/ProgressRing'
import { FluencyLineChart, SkillRadarChart } from '../../components/charts/ProgressChart'
import { getRecommendations } from '../../services/recommendationService'

const weeklyData = [
  { day: 'Mon', fluency: 55, grammar: 60 },
  { day: 'Tue', fluency: 60, grammar: 63 },
  { day: 'Wed', fluency: 58, grammar: 65 },
  { day: 'Thu', fluency: 65, grammar: 68 },
  { day: 'Fri', fluency: 70, grammar: 70 },
  { day: 'Sat', fluency: 72, grammar: 74 },
  { day: 'Sun', fluency: 75, grammar: 76 },
]

const quickActions = [
  { to: '/dashboard/learning', icon: BookOpen, label: 'Continue Lesson', color: '#00d4ff' },
  { to: '/dashboard/speaking', icon: Mic, label: 'Speaking Practice', color: '#7c3aed' },
  { to: '/dashboard/chatbot', icon: MessageSquare, label: 'AI Conversation', color: '#ec4899' },
]

export default function DashboardHome() {
  const { user, userData } = useAuth()
  const recs = getRecommendations(userData)

  const skillData = [
    { skill: 'Fluency', score: userData?.fluencyScore || 0 },
    { skill: 'Grammar', score: userData?.grammarScore || 0 },
    { skill: 'Pronunciation', score: userData?.pronunciationScore || 0 },
    { skill: 'Vocabulary', score: userData?.vocabularyMastery || 0 },
    { skill: 'Confidence', score: userData?.confidenceScore || 0 },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">
          Good morning, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'Learner'}</span> 👋
        </h1>
        <p className="text-white/50 mt-1">You're on a {userData?.streak || 0}-day streak. Keep it up!</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Day Streak" value={`${userData?.streak || 0} days`} color="#f97316" delay={0} trend={12} />
        <StatCard icon={Zap} label="Total XP" value={`${userData?.xp || 0} XP`} color="#00d4ff" delay={0.1} trend={8} />
        <StatCard icon={Trophy} label="Level" value={`Level ${userData?.level || 1}`} color="#7c3aed" delay={0.2} />
        <StatCard icon={Target} label="Fluency" value={`${userData?.fluencyScore || 0}%`} color="#ec4899" delay={0.3} trend={5} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map(({ to, icon: Icon, label, color }, i) => (
          <motion.div key={to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
            <Link to={to}>
              <GlassCard hover glow={color} className="p-5 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <span className="text-white font-medium text-sm">{label}</span>
                </div>
                <ArrowRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Line chart */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-white mb-4">Weekly Progress</h3>
          <FluencyLineChart data={weeklyData} />
        </GlassCard>

        {/* Skill rings */}
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold text-white mb-4">Skill Overview</h3>
          <SkillRadarChart data={skillData} />
        </GlassCard>
      </div>

      {/* Score rings + Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rings */}
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold text-white mb-6">Score Breakdown</h3>
          <div className="flex flex-wrap gap-6 justify-around">
            <ProgressRing value={userData?.fluencyScore || 0} color="#00d4ff" label="Fluency" />
            <ProgressRing value={userData?.grammarScore || 0} color="#7c3aed" label="Grammar" />
            <ProgressRing value={userData?.pronunciationScore || 0} color="#ec4899" label="Pronunciation" />
            <ProgressRing value={userData?.vocabularyMastery || 0} color="#06b6d4" label="Vocabulary" />
          </div>
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold text-white mb-4">AI Recommendations</h3>
          {recs.length === 0 ? (
            <p className="text-white/40 text-sm">Great work! No urgent recommendations right now.</p>
          ) : (
            <div className="space-y-3">
              {recs.slice(0, 4).map((rec, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: `${rec.color}08`, border: `1px solid ${rec.color}20` }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: rec.color }} />
                  <div>
                    <p className="text-white text-sm font-medium">{rec.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{rec.reason}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>{rec.priority}</span>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
