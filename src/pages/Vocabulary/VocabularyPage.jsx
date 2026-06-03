import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Star, BookMarked, Zap, X, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { saveVocabWord, getUserVocab, updateVocabMastery, deleteVocabWord, saveActivityEvent } from '../../firebase/firestore'
import { getVocabSuggestions } from '../../services/aiService'
import { useToast } from '../../components/ui/Toast'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const LEVELS = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }

// Confirmation dialog component
function DeleteConfirmDialog({ word, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#0d1117', border: '1px solid rgba(239,68,68,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Delete Word</h3>
            <p className="text-white/50 text-xs">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-6">
          Remove <span className="text-white font-bold">"{word}"</span> from your vocabulary?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1 py-2.5 text-sm">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            className="flex-1 py-2.5 text-sm"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
          >
            <Trash2 size={13} /> Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function VocabularyPage() {
  const [words, setWords] = useState([])
  const [search, setSearch] = useState('')
  const [newWord, setNewWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiData, setAiData] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, word }
  const [deleting, setDeleting] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { user, userData, refreshUserData } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (!user) return
    setInitialLoading(true)
    getUserVocab(user.uid)
      .then(setWords)
      .catch(e => console.error('Failed to load vocab:', e))
      .finally(() => setInitialLoading(false))
  }, [user])

  const handleLookup = async () => {
    if (!newWord.trim()) return
    setLoading(true)
    try {
      const data = await getVocabSuggestions(newWord.trim(), userData?.targetLanguage || 'English')
      setAiData({ word: newWord.trim(), ...data })
    } catch (e) {
      setAiData({
        word: newWord.trim(),
        definition: 'Could not fetch definition. Please try again.',
        examples: [], synonyms: [], difficulty: null,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!aiData || !user) return
    try {
      const ref = await saveVocabWord(user.uid, aiData)
      await saveActivityEvent(user.uid, 'vocab_saved', { word: aiData.word, difficulty: aiData.difficulty })
      await refreshUserData()
      // Add to UI with real Firestore ID if available
      setWords(prev => [{ ...aiData, id: ref?.id || Date.now().toString(), masteryLevel: 0 }, ...prev])
      toast(`"${aiData.word}" saved!`, 'success')
    } catch (e) {
      console.error('Failed to save word:', e)
      toast('Failed to save. Please try again.', 'error')
    }
    setAiData(null)
    setNewWord('')
    setShowAdd(false)
  }

  const handleMasteryUpdate = async (wordId, newLevel) => {
    setWords(prev => prev.map(w => w.id === wordId ? { ...w, masteryLevel: newLevel } : w))
    await updateVocabMastery(wordId, newLevel).catch(console.error)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !user) return
    setDeleting(true)
    try {
      await deleteVocabWord(user.uid, deleteTarget.id)
      setWords(prev => prev.filter(w => w.id !== deleteTarget.id))
      await refreshUserData()
      toast(`"${deleteTarget.word}" removed from vocabulary.`, 'info')
    } catch (e) {
      console.error('Failed to delete word:', e)
      toast('Failed to delete. Please try again.', 'error')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filtered = words.filter(w => w.word?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmDialog
            word={deleteTarget.word}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Vocabulary Builder</h1>
          <p className="text-white/50 text-sm mt-1">
            {initialLoading ? 'Loading...' : `${words.length} words saved`}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 text-sm">
          <Plus size={14} /> Add Word
        </Button>
      </div>

      {/* Add word panel */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <GlassCard className="p-6 neon-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Add New Word</h3>
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
                  className="flex-1 glass-card px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'inherit' }}
                />
                <Button onClick={handleLookup} loading={loading} className="gap-2 text-sm">
                  <Zap size={14} /> AI Lookup
                </Button>
              </div>

              <AnimatePresence>
                {aiData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="p-4 rounded-xl space-y-2"
                      style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{aiData.word}</span>
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
                      {aiData.examples?.[0] && (
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
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <Input icon={Search} placeholder="Search your vocabulary..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Word list */}
      {initialLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <BookMarked size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">
            {search ? `No words matching "${search}"` : 'No words yet. Add your first word above.'}
          </p>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((w, i) => (
              <motion.div
                key={w.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                layout
              >
                <GlassCard className="p-5 group relative">
                  {/* Delete button */}
                  <button
                    onClick={() => setDeleteTarget({ id: w.id, word: w.word })}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                    title="Delete word"
                  >
                    <Trash2 size={12} />
                  </button>

                  <div className="flex items-start justify-between mb-2 pr-6">
                    <span className="font-bold">{w.word}</span>
                    {w.difficulty && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${LEVELS[w.difficulty] || '#7c3aed'}20`, color: LEVELS[w.difficulty] || '#7c3aed' }}>
                        {w.difficulty}
                      </span>
                    )}
                  </div>

                  {w.pronunciation && (
                    <p className="text-white/40 text-xs mb-1">/{w.pronunciation}/</p>
                  )}

                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{w.definition}</p>

                  {w.examples?.[0] && (
                    <p className="text-white/40 text-xs italic line-clamp-1 mb-3">"{w.examples[0]}"</p>
                  )}

                  {/* Mastery stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <button
                        key={j}
                        onClick={() => handleMasteryUpdate(w.id, j + 1 === w.masteryLevel ? 0 : j + 1)}
                        title={`Set mastery to ${j + 1}`}
                        className="transition-transform hover:scale-125"
                      >
                        <Star size={12}
                          className={j < (w.masteryLevel || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20 hover:text-yellow-300'} />
                      </button>
                    ))}
                    <span className="text-white/30 text-xs ml-1">
                      {w.masteryLevel > 0 ? `${w.masteryLevel}/5` : 'Mastery'}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
