import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Zap, CheckCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { generateStudyPlan } from '../../services/aiService'
import { saveStudyPlan, getStudyPlan } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'

const DAY_COLORS = ['#00d4ff', '#7c3aed', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#f97316']

function SkeletonCard() {
  return (
    <GlassCard className="p-5 h-48 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-white/10" />
        <div className="w-8 h-3 rounded bg-white/10" />
      </div>
      <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
      <div className="h-3 bg-white/10 rounded mb-4 w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-5/6" />
        <div className="h-3 bg-white/10 rounded w-4/6" />
      </div>
    </GlassCard>
  )
}

export default function PlannerPage() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [completed, setCompleted] = useState({})
  const { user, userData } = useAuth()

  useEffect(() => {
    if (!user) { setInitialLoading(false); return }
    getStudyPlan(user.uid)
      .then(p => { if (p?.days?.length) setPlan(p) })
      .catch(() => {})
      .finally(() => setInitialLoading(false))
  }, [user])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const safeData = {
        targetLanguage: userData?.targetLanguage || 'Spanish',
        level: userData?.level || 1,
        fluencyScore: userData?.fluencyScore || 50,
        grammarScore: userData?.grammarScore || 50,
        learningGoal: userData?.learningGoal || 'General fluency',
      }
      const generated = await generateStudyPlan(safeData)

      // Validate structure before setting
      if (!generated?.days || !Array.isArray(generated.days) || generated.days.length === 0) {
        throw new Error('Invalid plan structure received')
      }

      setPlan(generated)
      setCompleted({})
      if (user) await saveStudyPlan(user.uid, generated).catch(() => {})
    } catch (err) {
      setError(err.message || 'Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = (dayIdx, taskIdx) => {
    const key = `${dayIdx}-${taskIdx}`
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Loading skeleton
  if (initialLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-white/10 rounded w-48 animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">AI Study Planner</h1>
          <p className="text-white/50 text-sm mt-1">
            Personalized 7-day roadmap for {userData?.targetLanguage || 'Spanish'}
          </p>
        </div>
        <Button onClick={handleGenerate} loading={loading} className="gap-2 text-sm">
          {plan ? <RefreshCw size={14} /> : <Zap size={14} />}
          {plan ? 'Regenerate' : 'Generate Plan'}
        </Button>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <Button variant="secondary" onClick={handleGenerate} loading={loading} className="text-xs py-1 px-3">
              Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !plan && (
        <GlassCard className="p-16 text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Calendar size={56} className="text-neon-blue/40 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-white font-semibold text-lg mb-2">No study plan yet</h3>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Generate a personalized AI study plan based on your current progress and learning goals.
          </p>
          <Button onClick={handleGenerate} loading={loading} className="gap-2">
            <Zap size={14} /> Generate My 7-Day Plan
          </Button>
        </GlassCard>
      )}

      {/* Plan grid */}
      {!loading && plan?.days?.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plan.days.map((day, i) => {
            if (!day) return null
            const color = DAY_COLORS[i % DAY_COLORS.length]
            const tasks = Array.isArray(day.tasks) ? day.tasks : []
            const dayCompleted = tasks.filter((_, j) => completed[`${i}-${j}`]).length
            const total = tasks.length

            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}>
                <GlassCard className="p-5 h-full flex flex-col" style={{ border: `1px solid ${color}25` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{ background: `${color}20`, color }}>
                      {day.day || i + 1}
                    </div>
                    <span className="text-white/30 text-xs">{dayCompleted}/{total}</span>
                  </div>

                  <h3 className="text-white font-semibold text-sm mb-1">{day.title || `Day ${i + 1}`}</h3>

                  {day.duration && (
                    <div className="flex items-center gap-1 text-white/40 text-xs mb-2">
                      <Clock size={10} /> {day.duration}
                    </div>
                  )}

                  {day.focus && (
                    <span className="text-xs px-2 py-0.5 rounded-full mb-3 inline-block w-fit"
                      style={{ background: `${color}15`, color }}>
                      {day.focus}
                    </span>
                  )}

                  <div className="space-y-2 flex-1">
                    {tasks.map((task, j) => (
                      <button key={j} onClick={() => toggleTask(i, j)}
                        className="flex items-start gap-2 w-full text-left group">
                        <CheckCircle size={13} className={`mt-0.5 flex-shrink-0 transition-colors ${
                          completed[`${i}-${j}`] ? 'text-green-400' : 'text-white/20 group-hover:text-white/40'
                        }`} />
                        <span className={`text-xs leading-relaxed transition-colors ${
                          completed[`${i}-${j}`] ? 'text-white/30 line-through' : 'text-white/60'
                        }`}>{task}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: color }}
                      animate={{ width: total ? `${(dayCompleted / total) * 100}%` : '0%' }}
                      transition={{ duration: 0.4 }} />
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
