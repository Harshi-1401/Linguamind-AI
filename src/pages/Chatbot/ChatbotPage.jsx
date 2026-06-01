import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Brain, RefreshCw, AlertCircle } from 'lucide-react'
import { sendChatMessage, aiStatus } from '../../services/aiService'
import { useAuth } from '../../context/AuthContext'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'

const MODES = ['Casual Chat', 'Interview Practice', 'Travel Communication', 'Classroom Discussion', 'Office Communication']

// Dynamic greeting based on target language
const GREETINGS = {
  Spanish:    '¡Hola! Soy tu tutor de LinguaMind AI. ¿De qué te gustaría hablar hoy?',
  French:     'Bonjour! Je suis votre tuteur LinguaMind AI. De quoi voulez-vous parler?',
  German:     'Hallo! Ich bin dein LinguaMind AI Tutor. Worüber möchtest du sprechen?',
  Hindi:      'नमस्ते! मैं आपका LinguaMind AI tutor हूँ। आज आप किस बारे में बात करना चाहेंगे?',
  Japanese:   'こんにちは！私はあなたのLinguaMind AIチューターです。今日は何について話しましょうか？',
  Mandarin:   '你好！我是你的LinguaMind AI导师。今天你想聊什么？',
  Italian:    'Ciao! Sono il tuo tutor LinguaMind AI. Di cosa vorresti parlare oggi?',
  Portuguese: 'Olá! Sou seu tutor LinguaMind AI. Sobre o que você gostaria de falar hoje?',
  Korean:     '안녕하세요! 저는 LinguaMind AI 튜터입니다. 오늘 무엇에 대해 이야기하고 싶으신가요?',
  Arabic:     'مرحباً! أنا مدرسك في LinguaMind AI. عن ماذا تريد أن تتحدث اليوم؟',
  Russian:    'Привет! Я ваш репетитор LinguaMind AI. О чём вы хотите поговорить сегодня?',
  English:    "Hello! I'm your LinguaMind AI tutor. What would you like to practice today?",
}

function getWelcome(lang) {
  return {
    role: 'ai',
    content: GREETINGS[lang] || `Hello! I'm your LinguaMind AI tutor for ${lang}. What would you like to practice today?`,
  }
}

const API_KEY_MISSING = !aiStatus.hasKey

export default function ChatbotPage() {
  const { userData } = useAuth()
  const lang = userData?.targetLanguage || 'Spanish'

  const [messages, setMessages] = useState(() => [getWelcome(lang)])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('Casual Chat')
  const bottomRef = useRef(null)
  const prevLang = useRef(lang)

  // Reset greeting when language changes
  useEffect(() => {
    if (prevLang.current !== lang) {
      prevLang.current = lang
      setMessages([getWelcome(lang)])
    }
  }, [lang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text = input) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendChatMessage(messages, trimmed, mode, lang)
      setMessages(prev => [...prev, { role: 'ai', content: reply }])
    } catch (err) {
      const isKeyError = err.message?.includes('API key') || err.message?.includes('Invalid')
      setMessages(prev => [...prev, {
        role: 'ai',
        content: isKeyError
          ? '⚠️ Gemini API key is not configured. Please add a valid VITE_GEMINI_API_KEY (starting with AIza...) to your .env file and restart the dev server.'
          : '⚠️ I had trouble connecting. Please check your internet connection and try again.',
        isError: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const reset = () => setMessages([getWelcome(lang)])

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">AI Conversation Partner</h1>
          <p className="text-white/50 text-sm">Practicing <span className="text-neon-blue">{lang}</span> with your AI tutor</p>
        </div>
        <Button variant="secondary" onClick={reset} className="gap-2 text-sm">
          <RefreshCw size={14} /> New Chat
        </Button>
      </div>

      {/* API key warning banner */}
      {API_KEY_MISSING && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-xs leading-relaxed">
            <strong>No AI API key configured.</strong> Add one of these to your <code>.env</code> file and restart:
            <br />• <code>VITE_GEMINI_API_KEY=AIzaSy...</code> — get free at <strong>aistudio.google.com</strong>
            <br />• <code>VITE_OPENAI_API_KEY=sk-...</code> — get at <strong>platform.openai.com</strong>
          </p>
        </div>
      )}

      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap flex-shrink-0">
        {MODES.map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === m ? 'text-white' : 'glass-card text-white/50 hover:text-white/80'
            }`}
            style={mode === m ? { background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' } : {}}>
            {m}
          </button>
        ))}
      </div>

      {/* Messages */}
      <GlassCard className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
                  style={{ background: msg.isError ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
                  {msg.isError ? <AlertCircle size={14} className="text-red-400" /> : <Brain size={14} className="text-white" />}
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' ? 'text-white rounded-tr-none' : 'glass-card rounded-tl-none'
                } ${msg.isError ? 'text-red-300' : msg.role === 'ai' ? 'text-white/90' : ''}`}
                style={msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
                  border: '1px solid rgba(0,212,255,0.25)',
                } : {}}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
              <Brain size={14} className="text-white" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-neon-blue"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </GlassCard>

      {/* Input */}
      <GlassCard className="p-3 flex gap-3 items-end flex-shrink-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Type in ${lang} or English... (Enter to send)`}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-white/30 outline-none resize-none text-sm py-1 max-h-28"
          style={{ lineHeight: '1.6' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
        >
          <Send size={16} className="text-white" />
        </motion.button>
      </GlassCard>
    </div>
  )
}
