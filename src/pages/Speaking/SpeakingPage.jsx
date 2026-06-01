import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, RotateCcw, Zap, Shuffle, ChevronRight, Clock } from 'lucide-react'
import { useSpeech } from '../../hooks/useSpeech'
import { analyzeSpeaking } from '../../services/aiService'
import { useAuth } from '../../context/AuthContext'
import { saveSpeakingScore } from '../../firebase/firestore'
import GlassCard from '../../components/ui/GlassCard'
import ProgressRing from '../../components/ui/ProgressRing'
import Button from '../../components/ui/Button'

const PROMPTS = {
  beginner: [
    { text: 'Introduce yourself — your name, age, and where you are from.', type: 'Self Introduction' },
    { text: 'Describe what you did this morning step by step.', type: 'Daily Routine' },
    { text: 'Talk about your favorite food and why you like it.', type: 'Daily Life' },
    { text: 'Describe the weather today and what you are wearing.', type: 'Daily Life' },
    { text: 'Talk about your family members and what they do.', type: 'Self Introduction' },
    { text: 'Describe your home — how many rooms, what it looks like.', type: 'Daily Life' },
  ],
  intermediate: [
    { text: 'Describe your ideal vacation destination and what you would do there.', type: 'Travel' },
    { text: 'Talk about a memorable experience from your childhood.', type: 'Storytelling' },
    { text: 'Explain what you enjoy most about learning languages.', type: 'Opinion Sharing' },
    { text: 'Describe your daily work or study routine in detail.', type: 'Daily Routine' },
    { text: 'You are at a store — ask for help finding a product and negotiate the price.', type: 'Shopping' },
    { text: 'Talk about a movie or book you recently enjoyed and why.', type: 'Opinion Sharing' },
    { text: 'Describe a challenge you faced and how you overcame it.', type: 'Storytelling' },
  ],
  advanced: [
    { text: 'You are in a job interview. Introduce yourself and explain why you are the best candidate.', type: 'Job Interview' },
    { text: 'Debate: "Social media does more harm than good." Present your argument.', type: 'Debate' },
    { text: 'Discuss the impact of artificial intelligence on the future of work.', type: 'Classroom Discussion' },
    { text: 'You are presenting a business proposal to investors. Pitch your idea.', type: 'Office Communication' },
    { text: 'Explain a complex topic you know well to someone who knows nothing about it.', type: 'Teaching' },
    { text: 'Discuss the pros and cons of remote work versus office work.', type: 'Debate' },
    { text: 'Tell a story about a time you had to make a difficult decision.', type: 'Storytelling' },
  ],
}

const DIFF_COLORS = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }

export default function SpeakingPage() {
  const { transcript, listening, error, startListening, stopListening, resetTranscript } = useSpeech()
  const [result, setResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [promptIdx, setPromptIdx] = useState(0)
  const [history, setHistory] = useState([])
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef(null)
  const { user, userData } = useAuth()

  const prompts = PROMPTS[difficulty]
  const currentPrompt = prompts[promptIdx % prompts.length]

  // Timer
  useEffect(() => {
    if (listening) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [listening])

  const handleToggle = () => {
    if (listening) {
      stopListening()
    } else {
      resetTranscript()
      setResult(null)
      setSeconds(0)
      startListening()
    }
  }

  const nextPrompt = () => {
    setPromptIdx(i => (i + 1) % prompts.length)
    resetTranscript()
    setResult(null)
    setSeconds(0)
  }

  const randomPrompt = () => {
    const newIdx = Math.floor(Math.random() * prompts.length)
    setPromptIdx(newIdx)
    resetTranscript()
    setResult(null)
    setSeconds(0)
  }

  const handleAnalyze = async () => {
    if (!transcript.trim()) return
    setAnalyzing(true)
    try {
      const analysis = await analyzeSpeaking(transcript, userData?.targetLanguage || 'Spanish')
      setResult(analysis)
      setHistory(prev => [{ prompt: currentPrompt.text, transcript, ...analysis, date: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)])
      if (user) await saveSpeakingScore(user.uid, { transcript, prompt: currentPrompt.text, ...analysis }).catch(() => {})
    } catch {
      setResult({ fluencyScore: 70, confidenceScore: 65, hesitations: 2, feedback: 'Analysis unavailable. Please check your Gemini API key.', tips: [] })
    } finally {
      setAnalyzing(false)
    }
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Speaking Confidence Analyzer</h1>
        <p className="text-white/50 text-sm mt-1">Record yourself and get AI-powered pronunciation feedback</p>
      </div>

      {/* Difficulty selector */}
      <div className="flex gap-2">
        {Object.keys(PROMPTS).map(d => (
          <button key={d} onClick={() => { setDifficulty(d); setPromptIdx(0); resetTranscript(); setResult(null) }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              difficulty === d ? 'text-white' : 'glass-card text-white/50 hover:text-white/80'
            }`}
            style={difficulty === d ? { background: DIFF_COLORS[d], boxShadow: `0 0 16px ${DIFF_COLORS[d]}60` } : {}}>
            {d}
          </button>
        ))}
      </div>

      {/* Prompt card */}
      <GlassCard className="p-5" style={{ border: `1px solid ${DIFF_COLORS[difficulty]}25` }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${DIFF_COLORS[difficulty]}20`, color: DIFF_COLORS[difficulty] }}>
                {currentPrompt.type}
              </span>
              <span className="text-white/30 text-xs capitalize">{difficulty}</span>
            </div>
            <p className="text-white font-medium leading-relaxed">"{currentPrompt.text}"</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={randomPrompt} title="Random prompt"
              className="w-8 h-8 glass-card rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Shuffle size={14} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={nextPrompt} title="Next prompt"
              className="w-8 h-8 glass-card rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <ChevronRight size={14} />
            </motion.button>
          </div>
        </div>
        <p className="text-white/30 text-xs mt-3">Prompt {(promptIdx % prompts.length) + 1} of {prompts.length}</p>
      </GlassCard>

      {/* Mic section */}
      <GlassCard className="p-8 flex flex-col items-center gap-5">
        {/* Waveform */}
        <div className="flex items-center gap-1 h-10">
          {[4, 7, 12, 5, 9, 14, 6, 11, 8, 13, 5, 10, 7, 14, 6, 9, 12, 5, 8, 11].map((h, i) => (
            <motion.div key={i} className="w-1 rounded-full"
              style={{ background: listening ? DIFF_COLORS[difficulty] : 'rgba(255,255,255,0.1)' }}
              animate={listening ? { height: [6, h * 2.5, 6] } : { height: 6 }}
              transition={{ duration: 0.5 + i * 0.04, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }} />
          ))}
        </div>

        {/* Timer */}
        {(listening || seconds > 0) && (
          <div className="flex items-center gap-1.5 text-white/60 text-sm">
            <Clock size={13} />
            <span className={listening ? 'text-neon-blue' : ''}>{fmt(seconds)}</span>
          </div>
        )}

        {/* Mic button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: listening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            boxShadow: listening ? '0 0 40px rgba(239,68,68,0.5)' : '0 0 40px rgba(0,212,255,0.4)',
          }}
          animate={listening ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {listening ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
        </motion.button>

        <p className="text-white/50 text-sm">
          {listening ? '🔴 Recording... Click to stop' : 'Click the mic to start recording'}
        </p>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </GlassCard>

      {/* Live transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Live Transcript</h3>
                <button onClick={() => { resetTranscript(); setResult(null) }}
                  className="text-white/30 hover:text-white transition-colors">
                  <RotateCcw size={13} />
                </button>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{transcript}</p>
              <div className="mt-4">
                <Button onClick={handleAnalyze} loading={analyzing} className="gap-2 text-sm">
                  <Zap size={13} /> Analyze with AI
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="p-4 text-center flex flex-col items-center gap-2">
                <ProgressRing value={result.fluencyScore || 0} color="#00d4ff" size={70} />
                <p className="text-white/60 text-xs">Fluency</p>
              </GlassCard>
              <GlassCard className="p-4 text-center flex flex-col items-center gap-2">
                <ProgressRing value={result.confidenceScore || 0} color="#7c3aed" size={70} />
                <p className="text-white/60 text-xs">Confidence</p>
              </GlassCard>
              <GlassCard className="p-4 text-center flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-orange-400">{result.hesitations ?? 0}</p>
                <p className="text-white/60 text-xs mt-1">Hesitations</p>
              </GlassCard>
              <GlassCard className="p-4 text-center flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-green-400">
                  {Math.round(((result.fluencyScore || 0) + (result.confidenceScore || 0)) / 2)}%
                </p>
                <p className="text-white/60 text-xs mt-1">Overall</p>
              </GlassCard>
            </div>

            <GlassCard className="p-5">
              <h3 className="text-white font-semibold mb-3">AI Feedback</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4">{result.feedback}</p>
              {result.tips?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Improvement Tips</p>
                  {result.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-sm text-white/60">
                      <span className="text-neon-blue flex-shrink-0">→</span> {tip}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session history */}
      {history.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">Session History</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <p className="text-white/60 text-xs truncate flex-1 mr-4">{h.prompt}</p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-neon-blue text-xs">{h.fluencyScore}% fluency</span>
                  <span className="text-white/30 text-xs">{h.date}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
