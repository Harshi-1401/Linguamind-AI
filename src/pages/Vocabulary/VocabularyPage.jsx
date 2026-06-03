import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Star, BookMarked, Zap, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { saveVocabWord, getUserVocab, updateVocabMastery, saveActivityEvent } from '../../firebase/firestore'
import { getVocabSuggestions } from '../../services/aiService'
import { useToast } from '../../components/ui/Toast'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const LEVELS = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }

export default function VocabularyPage() {
  const [words, setWords] = useState([])
  const [search, setSearch] = useState('')
  const [newWord, setNewWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiData, setAiData] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const { user, userData, refreshUserData } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (user) {
      getUserVocab(user.uid)
        .then(setWords)
        .catch(err => console.error('Failed to load vocab:', err))
    }
  }, [user])

  const handleLookup = async () => {
    if (!newWord.trim()) return
    setLoading(true)
    try {
      const data = await getVocabSuggestions(newWord.trim(), userData?.targetLanguage || 'Spanish')
      setAiData({ word: newWord.trim(), ...data })
    } catch (err) {
      setAiData({
        word: newWord.trim(),
        definition: err.message?.includes('API key')
          ? '⚠️ Gemini API key missing. Add VITE_GEMINI_API_KEY to .env (must start with AIza...).'
          : 'Could not fetch definition. Please try again.',
        examples: [],
        synonyms: [],
        difficulty: null,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!aiData || !user) return
    try {
      await saveVocabWord(user.uid, aiData)
      await saveActivityEvent(user.uid, 'vocab_saved', { word: aiData.word, difficulty: aiData.difficulty })
      await refreshUserData()
      setWords(prev => [{ ...aiData, id: Date.now(), masteryLevel: 0 }, ...prev])
      toast(`"${aiData.word}" saved to vocabulary!`, 'success')
    } catch (err) {
      console.error('Failed to save word:', err)
      toast('Failed to save word. Please try again.', 'error')
    }
    setAiData(null)
    setNewWord('')
    setShowAdd(false)
  }

  const handleMasteryUpdate = async (wordId, newLevel) => {
    setWords(prev => prev.map(w => w.id === wordId ? { ...w, masteryLevel: newLevel } : w))
    await updateVocabMastery(wordId, newLevel).catch(console.error)
  }

  const filtered = words.filter(w => w.word?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Vocabulary Builder</h1>
          <p className="text-white/50 text-sm mt-1">{words.length} words saved</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 text-sm">
          <Plus size={14} /> Add Word
        </Button>
      </div>

      {/* Add word modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <GlassCard className="p-6 neon-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Add New Word</h3>
                <button onClick={() => { setShowAdd(false); setAiData(null) }} className="text-white/30 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-3 mb-4">
                <input
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder="Enter a word..."
                  className="flex-1 glass-card px-4 py-2.5 rounded-xl text-white placeholder-white/30 outline-none text-sm"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <Button onClick={handleLookup} loading={loading} className="gap-2 text-sm">
                  <Zap size={14} /> AI Lookup
                </Button>
              </div>

              {aiData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{aiData.word}</span>
                      {aiData.pronunciation && (
                        <span className="text-white/40 text-sm">/{aiData.pronunciation}/</span>
                      )}
                      {aiData.difficulty && LEVELS[aiData.difficulty] && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${LEVELS[aiData.difficulty]}20`, color: LEVELS[aiData.difficulty] }}>
                          {aiData.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">{aiData.definition}</p>
                    {aiData.examples?.length > 0 && (
                      <p className="text-white/50 text-xs italic">"{aiData.examples[0]}"</p>
                    )}
                    {aiData.synonyms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {aiData.synonyms.slice(0, 4).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={handleSave} variant="secondary" className="gap-2 text-sm">
                    <BookMarked size={14} /> Save to Vocabulary
                  </Button>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <Input icon={Search} placeholder="Search your vocabulary..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Word list */}
      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <BookMarked size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No words yet. Add your first word above.</p>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w, i) => (
            <motion.div key={w.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-white font-bold">{w.word}</span>
                  {w.difficulty && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${LEVELS[w.difficulty] || '#7c3aed'}20`, color: LEVELS[w.difficulty] || '#7c3aed' }}>
                      {w.difficulty}
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{w.definition}</p>
                {w.examples?.[0] && (
                  <p className="text-white/40 text-xs italic line-clamp-1">"{w.examples[0]}"</p>
                )}
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(5)].map((_, j) => (
                    <button
                      key={j}
                      onClick={() => handleMasteryUpdate(w.id, j + 1 === w.masteryLevel ? 0 : j + 1)}
                      title={`Set mastery to ${j + 1}`}
                    >
                      <Star size={12}
                        className={j < (w.masteryLevel || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20 hover:text-yellow-300'} />
                    </button>
                  ))}
                  <span className="text-white/30 text-xs ml-1">Mastery</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
