import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Save, CheckCircle, Edit2 } from 'lucide-react'
import { updateProfile } from 'firebase/auth'
import { useAuth } from '../../context/AuthContext'
import { updateUserDocument } from '../../firebase/firestore'
import { auth } from '../../firebase/firebaseConfig'
import { useToast } from '../../components/ui/Toast'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ProgressRing from '../../components/ui/ProgressRing'

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German',
  'Japanese', 'Mandarin', 'Italian', 'Portuguese', 'Korean', 'Arabic', 'Russian',
]

export default function ProfilePage() {
  const { user, userData, refreshUserData } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [form, setForm] = useState({
    displayName: '',
    targetLanguage: 'Spanish',
    nativeLanguage: 'English',
    learningGoal: 'General fluency',
  })

  // Sync form when userData loads
  useEffect(() => {
    if (user || userData) {
      setForm({
        displayName: user?.displayName || '',
        targetLanguage: userData?.targetLanguage || 'Spanish',
        nativeLanguage: userData?.nativeLanguage || 'English',
        learningGoal: userData?.learningGoal || 'General fluency',
      })
    }
  }, [user, userData])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      // Update Firebase Auth display name
      if (form.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: form.displayName })
      }
      // Update Firestore
      await updateUserDocument(user.uid, {
        displayName: form.displayName,
        targetLanguage: form.targetLanguage,
        nativeLanguage: form.nativeLanguage,
        learningGoal: form.learningGoal,
      })
      await refreshUserData()
      setSaved(true)
      setEditingName(false)
      toast('Profile saved successfully!', 'success')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
      toast('Failed to save profile. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const scores = [
    { label: 'Fluency', value: userData?.fluencyScore || 0, color: '#00d4ff' },
    { label: 'Grammar', value: userData?.grammarScore || 0, color: '#7c3aed' },
    { label: 'Pronunciation', value: userData?.pronunciationScore || 0, color: '#ec4899' },
    { label: 'Vocabulary', value: userData?.vocabularyMastery || 0, color: '#06b6d4' },
    { label: 'Confidence', value: userData?.confidenceScore || 0, color: '#f59e0b' },
  ]

  const GOALS = ['General fluency', 'Business communication', 'Travel', 'Academic study', 'Cultural interest', 'Exam preparation']

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle size={16} /> Changes saved!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <GlassCard className="p-8 flex flex-col items-center text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold mb-4 cursor-pointer relative group"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
          >
            {form.displayName?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || 'U'}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </motion.div>

          {/* Editable name */}
          {editingName ? (
            <input
              autoFocus
              value={form.displayName}
              onChange={set('displayName')}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
              className="bg-transparent text-white font-bold text-lg text-center outline-none border-b border-neon-blue w-full mb-1"
            />
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white font-bold text-lg">{form.displayName || 'Learner'}</h2>
              <button onClick={() => setEditingName(true)} className="text-white/30 hover:text-white transition-colors">
                <Edit2 size={13} />
              </button>
            </div>
          )}

          <p className="text-white/50 text-sm mb-4">{user?.email}</p>

          <div className="flex gap-4 w-full justify-center">
            {[
              { label: 'XP', value: userData?.xp || 0 },
              { label: 'Streak', value: `${userData?.streak || 0}d` },
              { label: 'Level', value: userData?.level || 1 },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-white font-bold text-lg">{value}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Settings */}
        <GlassCard className="p-6 lg:col-span-2 space-y-5">
          <h3 className="text-white font-semibold">Learning Settings</h3>

          <Input
            label="Display Name"
            icon={User}
            value={form.displayName}
            onChange={set('displayName')}
            placeholder="Your name"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/60 text-sm font-medium">Native Language</label>
              <select value={form.nativeLanguage} onChange={set('nativeLanguage')}
                className="w-full glass-card px-4 py-3 rounded-xl text-white outline-none text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                {LANGUAGES.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-white/60 text-sm font-medium">Target Language</label>
              <select value={form.targetLanguage} onChange={set('targetLanguage')}
                className="w-full glass-card px-4 py-3 rounded-xl text-white outline-none text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                {LANGUAGES.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/60 text-sm font-medium">Learning Goal</label>
            <select value={form.learningGoal} onChange={set('learningGoal')}
              className="w-full glass-card px-4 py-3 rounded-xl text-white outline-none text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {GOALS.map(g => <option key={g} value={g} className="bg-gray-900">{g}</option>)}
            </select>
          </div>

          <Button onClick={handleSave} loading={saving} className="gap-2">
            <Save size={14} /> Save Changes
          </Button>
        </GlassCard>
      </div>

      {/* Score breakdown */}
      <GlassCard className="p-6">
        <h3 className="text-white font-semibold mb-6">Your Skill Scores</h3>
        <div className="flex flex-wrap gap-8 justify-around">
          {scores.map(s => (
            <ProgressRing key={s.label} value={s.value} color={s.color} label={s.label} size={90} />
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
