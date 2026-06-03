import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Zap, Trophy, Target, BookOpen, Mic, MessageSquare, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/ui/StatCard'
import GlassCard from '../../components/ui/GlassCard'
import ProgressRing from '../../components/ui/ProgressRing'
import { FluencyLineChart, SkillRadarChart } from '../../components/charts/ProgressChart'
import { getRecommendations } from '../../services/recommendationService'
import { getLessonHistory, getWeeklyActivity } from '../../firebase/firestore'

const quickActions = [
  { to: '/dashboard/learning', icon: BookOpen, label: 'Continue Lesson', color: '#00d4ff' },
  { to: '/dashboard/speaking', icon: Mic, label: 'Speaking Practice', color: '#7c3aed' },
  { to: '/dashboard/chatbot', icon: MessageSquare, label: 'AI Conversation', color: '#ec4899' },
]

// Build last-7-days chart data from activity log
function buildWeeklyChartData(activityLog, userData) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const result = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = days[d.getDay()]

    const dayEvents = activityLog.filter(e => e.date === dateStr)
    const hasLesson = dayEvents.some(e => e.type === 'lesson_completed')
    const hasSpeaking = dayEvents.some(e => e.type === 'speaking_practice')
    const hasChatSession = dayEvents.some(e => e.type === 'chat_session')
    const active = hasLesson || hasSpeaking || hasChatSession

    result.push({
      day: dayLabel,
      fluency: active ? Math.min(100, (userData?.fluencyScore || 0) - i * 2 + 4) : (userData?.fluencyScore || 0) - i * 3,
      grammar: active ? Math.min(100, (userData?.grammarScore || 0) - i * 1.5 + 3) : (userData?.grammarScore || 0) - i * 2,
    })
  }
  return result
}

export default function DashboardHome() {
  const { user, userData } = useAuth()
  const [recentLessons, setRecentLessons] = useState([])
  const [weeklyChart, setWeeklyChart] = useState([])
  const recs = getRecommendations(userData)

  useEffect(() => {
    if (!user) return
    // Load lesson history and activity log in parallel
    Promise.all([
      getLessonHistory(user.uid).catch(() => []),
      getWeeklyActivity(user.uid).catch(() => []),
    ]).then(([lessons, activity]) => {
      setRecentLessons(lessons.slice(0, 5))
      setWeeklyChart(buildWeeklyChartData(activity, userData))
    })
  }, [user, userData])

  const skillData = [
    { skill: 'Fluency', score: userData?.fluencyScore || 0 },
    { skill: 'Grammar', score: userData?.grammarScore || 0 },
    { skill: 'Pronunciation', score: userData?.pronunciationScore || 0 },
    { skill: 'Vocabulary', score: Math.min(100, userData?.vocabularyMastery || 0) },
    { skill: 'Confidence', score: userData?.confidenceScore || 0 },
  ]

  // Level calculation from XP
  const xp = userData?.xp || 0
  const level = Math.floor(xp / 500) + 1
  const levelProgress = ((xp % 500) / 500) * 100

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'Learner'}</span> 👋
        </h1>
        <p className="text-white/50 mt-1">
          {userData?.streak > 0
            ? `🔥 You're on a ${userData.streak}-day streak! Keep it up!`
            : 'Start your first lesson to begin your streak!'}
        </p>
      </motion.div>

      {/* Stat cards — all from real userData */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Day Streak" value={`${userData?.streak || 0} days`} color="#f97316" delay={0} />
        <StatCard icon={Zap} label="Total XP" value={`${xp} XP`} color="#00d4ff" delay={0.1} />
        <StatCard icon={Trophy} label="Level" value={`Level ${level}`} color="#7c3aed" delay={0.2} />
        <StatCard icon={Target} label="Fluency" value={`${userData?.fluencyScore || 0}%`} color="#ec4899" delay={0.3} />
      </div>

      {/* Level progress bar */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Level {level} Progress</span>
          <span className="text-neon-blue text-sm font-medium">{xp % 500} / 500 XP</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00d4ff, #7c3aed)' }}
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </GlassCard>

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
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <ArrowRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Weekly Progress</h3>
          <FluencyLineChart data={weeklyChart.length > 0 ? weeklyChart : [
            { day: 'Mon', fluency: 0, grammar: 0 },
            { day: 'Today', fluency: userData?.fluencyScore || 0, grammar: userData?.grammarScore || 0 },
          ]} />
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold mb-4">Skill Overview</h3>
          <SkillRadarChart data={skillData} />
        </GlassCard>
      </div>

      {/* Score rings + activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold mb-6">Score Breakdown</h3>
          <div className="flex flex-wrap gap-6 justify-around">
            <ProgressRing value={userData?.fluencyScore || 0} color="#00d4ff" label="Fluency" />
            <ProgressRing value={userData?.grammarScore || 0} color="#7c3aed" label="Grammar" />
            <ProgressRing value={userData?.pronunciationScore || 0} color="#ec4899" label="Pronunciation" />
            <ProgressRing value={Math.min(100, userData?.vocabularyMastery || 0)} color="#06b6d4" label="Vocabulary" />
          </div>
        </GlassCard>

        {/* Recent lessons / AI Recommendations */}
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold mb-4">
            {recentLessons.length > 0 ? 'Recent Activity' : 'AI Recommendations'}
          </h3>
          {recentLessons.length > 0 ? (
            <div className="space-y-2">
              {recentLessons.map((l, i) => (
                <motion.div key={l.id || i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <div>
                    <p className="text-sm font-medium">{l.lessonTitle || l.title}</p>
                    <p className="text-white/40 text-xs capitalize">{l.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neon-blue text-sm font-bold">+{l.xpEarned} XP</p>
                    <p className="text-white/40 text-xs">{l.score}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recs.slice(0, 4).map((rec, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: `${rec.color}08`, border: `1px solid ${rec.color}20` }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: rec.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{rec.reason}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
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
