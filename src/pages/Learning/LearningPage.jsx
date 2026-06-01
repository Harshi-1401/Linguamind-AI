import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle, XCircle, ArrowRight, Trophy, Star } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { addXP } from '../../firebase/firestore'

const ALL_LESSONS = {
  beginner: [
    {
      id: 'b1', title: 'Basic Greetings', color: '#10b981', xp: 20,
      questions: [
        { q: 'How do you say "Hello" in Spanish?', options: ['Hola', 'Adiós', 'Gracias', 'Por favor'], answer: 0 },
        { q: 'What does "Buenos días" mean?', options: ['Good night', 'Good morning', 'Good afternoon', 'Goodbye'], answer: 1 },
        { q: 'How do you say "Thank you"?', options: ['De nada', 'Por favor', 'Gracias', 'Perdón'], answer: 2 },
        { q: '"Hasta luego" means:', options: ['Hello', 'See you later', 'Good morning', 'Please'], answer: 1 },
      ],
    },
    {
      id: 'b2', title: 'Numbers 1–10', color: '#00d4ff', xp: 20,
      questions: [
        { q: 'What is "cinco" in English?', options: ['Three', 'Four', 'Five', 'Six'], answer: 2 },
        { q: 'How do you say "eight" in Spanish?', options: ['Siete', 'Ocho', 'Nueve', 'Diez'], answer: 1 },
        { q: 'What number is "tres"?', options: ['1', '2', '3', '4'], answer: 2 },
        { q: '"Diez" means:', options: ['Six', 'Seven', 'Nine', 'Ten'], answer: 3 },
      ],
    },
    {
      id: 'b3', title: 'Colors', color: '#f59e0b', xp: 20,
      questions: [
        { q: '"Rojo" means:', options: ['Blue', 'Green', 'Red', 'Yellow'], answer: 2 },
        { q: 'How do you say "blue"?', options: ['Verde', 'Azul', 'Amarillo', 'Negro'], answer: 1 },
        { q: '"Blanco" means:', options: ['Black', 'White', 'Brown', 'Pink'], answer: 1 },
        { q: 'How do you say "yellow"?', options: ['Rojo', 'Azul', 'Amarillo', 'Verde'], answer: 2 },
      ],
    },
    {
      id: 'b4', title: 'Days of the Week', color: '#ec4899', xp: 25,
      questions: [
        { q: '"Lunes" means:', options: ['Tuesday', 'Monday', 'Wednesday', 'Friday'], answer: 1 },
        { q: 'How do you say "Sunday"?', options: ['Sábado', 'Viernes', 'Domingo', 'Jueves'], answer: 2 },
        { q: '"Miércoles" is:', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], answer: 2 },
        { q: 'How do you say "Saturday"?', options: ['Lunes', 'Sábado', 'Martes', 'Viernes'], answer: 1 },
      ],
    },
  ],
  intermediate: [
    {
      id: 'i1', title: 'Common Phrases', color: '#7c3aed', xp: 30,
      questions: [
        { q: '"¿Cómo estás?" means:', options: ['What is your name?', 'How are you?', 'Where are you from?', 'How old are you?'], answer: 1 },
        { q: 'How do you say "I don\'t understand"?', options: ['No sé', 'No entiendo', 'No puedo', 'No quiero'], answer: 1 },
        { q: '"Me llamo" means:', options: ['I am from', 'I like', 'My name is', 'I have'], answer: 2 },
        { q: '"¿Dónde está...?" means:', options: ['What is...?', 'Who is...?', 'Where is...?', 'When is...?'], answer: 2 },
      ],
    },
    {
      id: 'i2', title: 'Food & Dining', color: '#f97316', xp: 30,
      questions: [
        { q: '"Agua" means:', options: ['Food', 'Water', 'Juice', 'Milk'], answer: 1 },
        { q: 'How do you say "I am hungry"?', options: ['Tengo sed', 'Tengo hambre', 'Tengo frío', 'Tengo calor'], answer: 1 },
        { q: '"La cuenta, por favor" means:', options: ['The menu please', 'The bill please', 'More water please', 'A table please'], answer: 1 },
        { q: '"Delicioso" means:', options: ['Expensive', 'Spicy', 'Delicious', 'Cold'], answer: 2 },
      ],
    },
    {
      id: 'i3', title: 'Travel Vocabulary', color: '#06b6d4', xp: 35,
      questions: [
        { q: '"El aeropuerto" means:', options: ['Train station', 'Bus stop', 'Airport', 'Hotel'], answer: 2 },
        { q: 'How do you say "ticket"?', options: ['Maleta', 'Boleto', 'Pasaporte', 'Vuelo'], answer: 1 },
        { q: '"¿A qué hora sale el tren?" means:', options: ['Where is the train?', 'What time does the train leave?', 'How much is the train?', 'Is the train late?'], answer: 1 },
        { q: '"Habitación" means:', options: ['Bathroom', 'Kitchen', 'Room', 'Lobby'], answer: 2 },
      ],
    },
    {
      id: 'i4', title: 'Present Tense Verbs', color: '#10b981', xp: 40,
      questions: [
        { q: '"Yo hablo" means:', options: ['I spoke', 'I speak', 'I will speak', 'I am speaking'], answer: 1 },
        { q: 'How do you say "She eats"?', options: ['Ella come', 'Ella comer', 'Ella comió', 'Ella comerá'], answer: 0 },
        { q: '"Nosotros vivimos" means:', options: ['We lived', 'We live', 'We will live', 'We are living'], answer: 1 },
        { q: 'Correct form of "to be" for "I am":', options: ['Es', 'Son', 'Soy', 'Somos'], answer: 2 },
      ],
    },
  ],
  advanced: [
    {
      id: 'a1', title: 'Subjunctive Mood', color: '#ef4444', xp: 50,
      questions: [
        { q: 'When is the subjunctive used?', options: ['For facts', 'For doubts/wishes/emotions', 'For past events', 'For future plans'], answer: 1 },
        { q: '"Espero que él venga" means:', options: ['I hope he came', 'I hope he comes', 'He hopes I come', 'He came'], answer: 1 },
        { q: 'Subjunctive of "hablar" for "tú":', options: ['hablas', 'hables', 'habló', 'hablará'], answer: 1 },
        { q: '"Ojalá llueva" means:', options: ['It is raining', 'It rained', 'I hope it rains', 'It will rain'], answer: 2 },
      ],
    },
    {
      id: 'a2', title: 'Idiomatic Expressions', color: '#7c3aed', xp: 50,
      questions: [
        { q: '"Costar un ojo de la cara" means:', options: ['To be very cheap', 'To cost an arm and a leg', 'To be free', 'To be on sale'], answer: 1 },
        { q: '"No hay mal que por bien no venga" is equivalent to:', options: ['Every cloud has a silver lining', 'Actions speak louder than words', 'Better late than never', 'Time flies'], answer: 0 },
        { q: '"Estar en las nubes" means:', options: ['To be angry', 'To be daydreaming', 'To be happy', 'To be tired'], answer: 1 },
        { q: '"Meter la pata" means:', options: ['To put your foot in it', 'To run fast', 'To work hard', 'To be careful'], answer: 0 },
      ],
    },
    {
      id: 'a3', title: 'Business Spanish', color: '#00d4ff', xp: 60,
      questions: [
        { q: '"Reunión" means:', options: ['Report', 'Meeting', 'Contract', 'Deadline'], answer: 1 },
        { q: 'How do you say "I would like to schedule a meeting"?', options: ['Quiero cancelar la reunión', 'Me gustaría programar una reunión', 'La reunión fue cancelada', 'Tenemos una reunión mañana'], answer: 1 },
        { q: '"Presupuesto" means:', options: ['Invoice', 'Budget', 'Profit', 'Loss'], answer: 1 },
        { q: '"En cuanto a..." means:', options: ['Because of...', 'Despite...', 'Regarding...', 'Instead of...'], answer: 2 },
      ],
    },
  ],
}

const LEVEL_COLORS = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }
const LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export default function LearningPage() {
  const [activeLevel, setActiveLevel] = useState('beginner')
  const [selected, setSelected] = useState(null)
  const [current, setCurrent] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [completed, setCompleted] = useState({})
  const { user } = useAuth()
  const toast = useToast()

  const lessons = ALL_LESSONS[activeLevel]

  const startLesson = (lesson) => {
    setSelected(lesson)
    setCurrent(0)
    setChosen(null)
    setScore(0)
    setDone(false)
  }

  const handleAnswer = (idx) => {
    if (chosen !== null) return
    setChosen(idx)
    if (idx === selected.questions[current].answer) setScore(s => s + 1)
  }

  const handleNext = async () => {
    if (current + 1 >= selected.questions.length) {
      setDone(true)
      setCompleted(prev => ({ ...prev, [selected.id]: score }))
      const xpEarned = Math.round(score * (selected.xp / selected.questions.length))
      if (user) {
        await addXP(user.uid, xpEarned).catch(() => {})
        toast(`+${xpEarned} XP earned! 🎉`, 'success')
      }
    } else {
      setCurrent(c => c + 1)
      setChosen(null)
    }
  }

  // ── Quiz view ──────────────────────────────────────────────────────────────
  if (selected && !done) {
    const q = selected.questions[current]
    const progress = (current / selected.questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setSelected(null); setDone(false) }} className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1">
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm">{current + 1} / {selected.questions.length}</span>
            <div className="flex gap-1">
              {selected.questions.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                  i < current ? 'bg-green-400' : i === current ? 'bg-neon-blue' : 'bg-white/20'
                }`} />
              ))}
            </div>
          </div>
        </div>

        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: selected.color }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>

        <GlassCard className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${selected.color}20`, color: selected.color }}>
              {selected.title}
            </span>
            <span className="text-white/30 text-xs">Question {current + 1}</span>
          </div>
          <h2 className="text-white text-xl font-semibold mb-6">{q.q}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answer
              const isChosen = i === chosen
              let cls = 'border border-white/10 text-white/70 hover:border-white/30'
              if (chosen !== null) {
                if (isCorrect) cls = 'border border-green-500/60 bg-green-500/10 text-green-400'
                else if (isChosen) cls = 'border border-red-500/60 bg-red-500/10 text-red-400'
                else cls = 'border border-white/5 text-white/30'
              }
              return (
                <motion.button key={i}
                  whileHover={chosen === null ? { scale: 1.01, x: 4 } : {}}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl glass-card transition-all text-sm font-medium flex items-center justify-between ${cls}`}>
                  <span>{opt}</span>
                  {chosen !== null && isCorrect && <CheckCircle size={16} className="text-green-400 flex-shrink-0" />}
                  {chosen !== null && isChosen && !isCorrect && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {chosen !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center justify-between">
                <p className={`text-sm font-medium ${chosen === q.answer ? 'text-green-400' : 'text-red-400'}`}>
                  {chosen === q.answer ? '✓ Correct!' : `✗ Correct answer: ${q.options[q.answer]}`}
                </p>
                <Button onClick={handleNext} className="gap-2">
                  {current + 1 >= selected.questions.length ? 'Finish' : 'Next'} <ArrowRight size={14} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    )
  }

  if (done && selected) {
    const pct = Math.round((score / selected.questions.length) * 100)
    const xpEarned = Math.round(score * (selected.xp / selected.questions.length))
    return (
      <div className="max-w-md mx-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <GlassCard className="p-10 text-center neon-border">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Trophy size={56} className="text-yellow-400 mx-auto mb-4" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
            <p className="text-white/50 mb-2">{selected.title}</p>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20}
                  className={i < Math.round(pct / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
              ))}
            </div>
            <p className="text-white/60 mb-2">Score: <span className="text-white font-bold">{score}/{selected.questions.length}</span> ({pct}%)</p>
            <p className="text-neon-blue font-semibold text-lg mb-6">+{xpEarned} XP earned</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => startLesson(selected)} variant="secondary">Retry</Button>
              <Button onClick={() => { setSelected(null); setDone(false) }}>All Lessons</Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  // ── Lesson list ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Learning Modules</h1>
        <p className="text-white/50 text-sm mt-1">Choose your level and start a lesson</p>
      </div>

      {/* Level tabs */}
      <div className="flex gap-2">
        {Object.keys(ALL_LESSONS).map(level => (
          <button key={level} onClick={() => setActiveLevel(level)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeLevel === level ? 'text-white' : 'glass-card text-white/50 hover:text-white/80'
            }`}
            style={activeLevel === level ? {
              background: `linear-gradient(135deg, ${LEVEL_COLORS[level]}cc, ${LEVEL_COLORS[level]}88)`,
              boxShadow: `0 0 20px ${LEVEL_COLORS[level]}40`,
            } : {}}>
            {LEVEL_LABELS[level]}
          </button>
        ))}
      </div>

      {/* Lesson cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {lessons.map((lesson, i) => {
          const isCompleted = completed[lesson.id] !== undefined
          const bestScore = completed[lesson.id]
          const pct = isCompleted ? Math.round((bestScore / lesson.questions.length) * 100) : 0

          return (
            <motion.div key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <GlassCard hover glow={lesson.color} className="p-5 cursor-pointer relative overflow-hidden"
                onClick={() => startLesson(lesson)}>
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle size={16} className="text-green-400" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${lesson.color}15`, border: `1px solid ${lesson.color}30` }}>
                  <BookOpen size={18} style={{ color: lesson.color }} />
                </div>
                <h3 className="text-white font-semibold mb-1 pr-5">{lesson.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${LEVEL_COLORS[activeLevel]}15`, color: LEVEL_COLORS[activeLevel] }}>
                    {LEVEL_LABELS[activeLevel]}
                  </span>
                  <span className="text-white/30 text-xs">+{lesson.xp} XP</span>
                </div>
                <p className="text-white/40 text-xs">{lesson.questions.length} questions</p>
                {isCompleted && (
                  <div className="mt-3">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: lesson.color }} />
                    </div>
                    <p className="text-white/30 text-xs mt-1">Best: {pct}%</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
