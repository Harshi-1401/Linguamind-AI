import {
  doc, setDoc, getDoc, collection,
  addDoc, getDocs, query, where, orderBy, limit,
  serverTimestamp, increment, Timestamp,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// ── helpers ───────────────────────────────────────────────────────────────────
const log = (tag, msg, data) => console.log(`[Firestore][${tag}]`, msg, data ?? '')
const err = (tag, msg, e)   => console.error(`[Firestore][${tag}]`, msg, e)

// ── User ──────────────────────────────────────────────────────────────────────
export const createUserDocument = async (user) => {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email,
      photoURL: user.photoURL || '',
      xp: 0,
      level: 1,
      streak: 0,
      lastStreakDate: null,
      fluencyScore: 0,
      grammarScore: 0,
      pronunciationScore: 0,
      vocabularyMastery: 0,
      confidenceScore: 0,
      lessonsCompleted: 0,
      chatSessions: 0,
      wordsLearned: 0,
      targetLanguage: 'English',
      nativeLanguage: 'English',
      learningGoal: 'General fluency',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    })
    log('createUser', 'User document created', user.uid)
  }
}

export const getUserDocument = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export const updateUserDocument = (uid, data) =>
  setDoc(doc(db, 'users', uid), { ...data, lastActive: serverTimestamp() }, { merge: true })

export const addXP = (uid, amount) =>
  setDoc(doc(db, 'users', uid), { xp: increment(amount) }, { merge: true })

// ── Streak ────────────────────────────────────────────────────────────────────
export const updateStreak = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return

    const data = snap.data()
    const now = new Date()
    const today = now.toDateString()
    const lastDate = data.lastStreakDate?.toDate?.().toDateString() ?? null

    if (lastDate === today) { log('streak', 'Already updated today'); return }

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const newStreak = lastDate === yesterday.toDateString()
      ? (data.streak || 0) + 1
      : 1

    await setDoc(doc(db, 'users', uid), {
      streak: newStreak,
      lastStreakDate: serverTimestamp(),
      lastActive: serverTimestamp(),
    }, { merge: true })
    log('streak', `Streak updated to ${newStreak}`)
  } catch (e) {
    err('streak', 'Failed to update streak', e)
  }
}

// ── Chat History ──────────────────────────────────────────────────────────────
// NOTE: Uses a simple uid+createdAt query — no composite index needed for lang.
// Lang filtering is done client-side to avoid Firestore index requirements.

export const saveChatMessage = async (uid, message) => {
  try {
    const ref = await addDoc(collection(db, 'chatbot_history'), {
      uid,
      role: message.role,         // 'user' | 'ai'
      content: message.content,
      lang: message.lang || 'English',
      createdAt: serverTimestamp(),
    })
    log('chat:save', `Saved ${message.role} message`, ref.id)
    return ref
  } catch (e) {
    err('chat:save', 'Failed to save message', e)
    throw e
  }
}

// Load last 60 messages for a user — filter by lang client-side to avoid needing composite index
export const getChatHistory = async (uid, lang = null) => {
  try {
    // Simple query: only uid + orderBy — single-field index, always works
    const q = query(
      collection(db, 'chatbot_history'),
      where('uid', '==', uid),
      orderBy('createdAt', 'asc'),
      limit(100)
    )
    const snap = await getDocs(q)
    let messages = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Filter by lang client-side
    if (lang) {
      messages = messages.filter(m => m.lang === lang)
    }

    // Return last 60 after filtering
    const result = messages.slice(-60)
    log('chat:load', `Loaded ${result.length} messages for lang=${lang}`)
    return result
  } catch (e) {
    err('chat:load', 'Failed to load chat history', e)
    return []
  }
}

export const incrementChatSession = (uid) =>
  setDoc(doc(db, 'users', uid), { chatSessions: increment(1) }, { merge: true })

// ── Vocabulary ────────────────────────────────────────────────────────────────
export const saveVocabWord = async (uid, word) => {
  try {
    // Clean undefined fields before saving
    const clean = Object.fromEntries(
      Object.entries(word).filter(([, v]) => v !== undefined)
    )
    const ref = await addDoc(collection(db, 'vocabulary_history'), {
      uid,
      ...clean,
      masteryLevel: 0,
      createdAt: serverTimestamp(),
    })
    // Increment counters on user doc
    await setDoc(doc(db, 'users', uid), {
      wordsLearned: increment(1),
      vocabularyMastery: increment(2),
    }, { merge: true })
    log('vocab:save', `Saved word "${word.word}"`, ref.id)
    return ref
  } catch (e) {
    err('vocab:save', 'Failed to save vocab word', e)
    throw e
  }
}

export const getUserVocab = async (uid) => {
  try {
    const q = query(
      collection(db, 'vocabulary_history'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    const result = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    log('vocab:load', `Loaded ${result.length} words for uid=${uid}`)
    return result
  } catch (e) {
    err('vocab:load', 'Failed to load vocab', e)
    return []
  }
}

export const updateVocabMastery = async (wordId, masteryLevel) => {
  try {
    await setDoc(doc(db, 'vocabulary_history', wordId), { masteryLevel }, { merge: true })
    log('vocab:mastery', `Updated word ${wordId} mastery to ${masteryLevel}`)
  } catch (e) {
    err('vocab:mastery', 'Failed to update mastery', e)
  }
}

// ── Speaking Scores ───────────────────────────────────────────────────────────
export const saveSpeakingScore = async (uid, score) => {
  try {
    const ref = await addDoc(collection(db, 'speaking_scores'), {
      uid, ...score, createdAt: serverTimestamp(),
    })
    // Update scores directly (not using increment for score fields)
    await setDoc(doc(db, 'users', uid), {
      fluencyScore: score.fluencyScore || 0,
      confidenceScore: score.confidenceScore || 0,
      pronunciationScore: score.fluencyScore || 0,
      xp: increment(15),
    }, { merge: true })
    log('speaking:save', 'Saved speaking score', ref.id)
    return ref
  } catch (e) {
    err('speaking:save', 'Failed to save speaking score', e)
    throw e
  }
}

export const getSpeakingHistory = async (uid) => {
  try {
    const q = query(
      collection(db, 'speaking_scores'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    err('speaking:load', 'Failed to load speaking history', e)
    return []
  }
}

// ── Lesson Completion ─────────────────────────────────────────────────────────
export const saveLessonCompletion = async (uid, lesson) => {
  try {
    const ref = await addDoc(collection(db, 'lesson_completions'), {
      uid,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      level: lesson.level,
      score: lesson.score,
      xpEarned: lesson.xpEarned,
      createdAt: serverTimestamp(),
    })
    // Use increment only — never mix with plain values in same setDoc
    await setDoc(doc(db, 'users', uid), {
      lessonsCompleted: increment(1),
      xp: increment(lesson.xpEarned),
    }, { merge: true })
    // Update grammarScore separately using a safe value
    const userSnap = await getDoc(doc(db, 'users', uid))
    if (userSnap.exists()) {
      const currentGrammar = userSnap.data().grammarScore || 0
      const gain = Math.round(lesson.score * 0.3)
      const newGrammar = Math.min(100, currentGrammar + gain)
      await setDoc(doc(db, 'users', uid), { grammarScore: newGrammar }, { merge: true })
    }
    log('lesson:save', `Saved lesson "${lesson.title}" score=${lesson.score}%`, ref.id)
    return ref
  } catch (e) {
    err('lesson:save', 'Failed to save lesson completion', e)
    throw e
  }
}

export const getLessonHistory = async (uid) => {
  try {
    const q = query(
      collection(db, 'lesson_completions'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    err('lesson:load', 'Failed to load lesson history', e)
    return []
  }
}

// ── Activity Log ──────────────────────────────────────────────────────────────
export const saveActivityEvent = async (uid, type, data = {}) => {
  try {
    const ref = await addDoc(collection(db, 'activity_log'), {
      uid, type, ...data,
      date: new Date().toISOString().split('T')[0],
      timestamp: serverTimestamp(),
    })
    log('activity:save', `Saved event: ${type}`, ref.id)
    return ref
  } catch (e) {
    err('activity:save', `Failed to save activity event: ${type}`, e)
  }
}

export const getWeeklyActivity = async (uid) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const q = query(
      collection(db, 'activity_log'),
      where('uid', '==', uid),
      where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('timestamp', 'asc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    err('activity:load', 'Failed to load weekly activity', e)
    return []
  }
}

// ── Study Plans ───────────────────────────────────────────────────────────────
export const saveStudyPlan = (uid, plan) =>
  setDoc(doc(db, 'study_plans', uid), { uid, ...plan, updatedAt: serverTimestamp() })

export const getStudyPlan = async (uid) => {
  const snap = await getDoc(doc(db, 'study_plans', uid))
  return snap.exists() ? snap.data() : null
}

// ── Achievements ──────────────────────────────────────────────────────────────
export const saveAchievement = (uid, achievement) =>
  addDoc(collection(db, 'achievements'), { uid, ...achievement, unlockedAt: serverTimestamp() })

export const getUserAchievements = async (uid) => {
  const q = query(collection(db, 'achievements'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
