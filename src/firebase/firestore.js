import {
  doc, setDoc, getDoc, collection,
  addDoc, getDocs, query, where, limit,
  serverTimestamp, increment, Timestamp, orderBy,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

const log = (tag, msg, data) => console.log(`[Firestore][${tag}]`, msg, data ?? '')
const err = (tag, msg, e)   => console.error(`[Firestore][${tag}] FAILED:`, msg, e?.message)

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
      xp: 0, level: 1, streak: 0, lastStreakDate: null,
      fluencyScore: 0, grammarScore: 0, pronunciationScore: 0,
      vocabularyMastery: 0, confidenceScore: 0,
      lessonsCompleted: 0, chatSessions: 0, wordsLearned: 0,
      targetLanguage: 'English', nativeLanguage: 'English',
      learningGoal: 'General fluency',
      createdAt: serverTimestamp(), lastActive: serverTimestamp(),
    })
    log('user:create', 'Created user doc', user.uid)
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
    const today = new Date().toDateString()
    const lastDate = data.lastStreakDate?.toDate?.().toDateString() ?? null
    if (lastDate === today) return
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const newStreak = lastDate === yesterday.toDateString() ? (data.streak || 0) + 1 : 1
    await setDoc(doc(db, 'users', uid), {
      streak: newStreak, lastStreakDate: serverTimestamp(), lastActive: serverTimestamp(),
    }, { merge: true })
    log('streak', `Updated to ${newStreak}`)
  } catch (e) { err('streak', 'update failed', e) }
}

// ── Chat History ──────────────────────────────────────────────────────────────
// Uses ONLY where('uid') — no orderBy — so NO composite index needed.
// Sorting is done client-side after fetch.
export const saveChatMessage = async (uid, message) => {
  try {
    const ref = await addDoc(collection(db, 'chatbot_history'), {
      uid,
      role: message.role,
      content: message.content,
      lang: message.lang || 'English',
      // Store timestamp as a plain number for reliable client-side sorting
      ts: Date.now(),
      createdAt: serverTimestamp(),
    })
    log('chat:save', `Saved ${message.role} msg`, ref.id)
    return ref
  } catch (e) {
    err('chat:save', 'save failed', e)
    throw e
  }
}

export const getChatHistory = async (uid, lang = null) => {
  try {
    // NO orderBy — avoids composite index requirement entirely
    const q = query(
      collection(db, 'chatbot_history'),
      where('uid', '==', uid),
      limit(200)
    )
    const snap = await getDocs(q)
    let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Sort client-side by numeric timestamp
    msgs.sort((a, b) => (a.ts || 0) - (b.ts || 0))

    // Filter by language client-side
    if (lang) msgs = msgs.filter(m => m.lang === lang)

    const result = msgs.slice(-60)
    log('chat:load', `Loaded ${result.length} msgs (lang=${lang})`)
    return result
  } catch (e) {
    err('chat:load', 'load failed', e)
    return []
  }
}

export const incrementChatSession = (uid) =>
  setDoc(doc(db, 'users', uid), { chatSessions: increment(1) }, { merge: true })

// ── Vocabulary ────────────────────────────────────────────────────────────────
// NO orderBy — avoids composite index. Sort client-side.
export const saveVocabWord = async (uid, word) => {
  try {
    const clean = Object.fromEntries(Object.entries(word).filter(([, v]) => v !== undefined))
    const ref = await addDoc(collection(db, 'vocabulary_history'), {
      uid, ...clean,
      masteryLevel: 0,
      ts: Date.now(),
      createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', uid), {
      wordsLearned: increment(1),
      vocabularyMastery: increment(2),
    }, { merge: true })
    log('vocab:save', `Saved "${word.word}"`, ref.id)
    return ref
  } catch (e) {
    err('vocab:save', 'save failed', e)
    throw e
  }
}

export const getUserVocab = async (uid) => {
  try {
    // NO orderBy — no composite index needed
    const q = query(
      collection(db, 'vocabulary_history'),
      where('uid', '==', uid),
      limit(500)
    )
    const snap = await getDocs(q)
    const result = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0)) // newest first, client-side
    log('vocab:load', `Loaded ${result.length} words`)
    return result
  } catch (e) {
    err('vocab:load', 'load failed', e)
    return []
  }
}

export const updateVocabMastery = async (wordId, masteryLevel) => {
  try {
    await setDoc(doc(db, 'vocabulary_history', wordId), { masteryLevel }, { merge: true })
    log('vocab:mastery', `Set ${wordId} → ${masteryLevel}`)
  } catch (e) { err('vocab:mastery', 'update failed', e) }
}

// ── Speaking Scores ───────────────────────────────────────────────────────────
export const saveSpeakingScore = async (uid, score) => {
  try {
    const ref = await addDoc(collection(db, 'speaking_scores'), {
      uid, ...score, ts: Date.now(), createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', uid), {
      fluencyScore: score.fluencyScore || 0,
      confidenceScore: score.confidenceScore || 0,
      pronunciationScore: score.fluencyScore || 0,
      xp: increment(15),
    }, { merge: true })
    log('speaking:save', 'Saved score', ref.id)
    return ref
  } catch (e) {
    err('speaking:save', 'save failed', e)
    throw e
  }
}

export const getSpeakingHistory = async (uid) => {
  try {
    const q = query(
      collection(db, 'speaking_scores'),
      where('uid', '==', uid),
      limit(50)
    )
    const snap = await getDocs(q)
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
  } catch (e) {
    err('speaking:load', 'load failed', e)
    return []
  }
}

// ── Lesson Completions ────────────────────────────────────────────────────────
export const saveLessonCompletion = async (uid, lesson) => {
  try {
    const ref = await addDoc(collection(db, 'lesson_completions'), {
      uid,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      level: lesson.level,
      score: lesson.score,
      xpEarned: lesson.xpEarned,
      ts: Date.now(),
      createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', uid), {
      lessonsCompleted: increment(1),
      xp: increment(lesson.xpEarned),
    }, { merge: true })
    // Read-modify-write for grammarScore (can't use increment inside Math.min)
    const userSnap = await getDoc(doc(db, 'users', uid))
    if (userSnap.exists()) {
      const current = userSnap.data().grammarScore || 0
      const updated = Math.min(100, current + Math.round(lesson.score * 0.3))
      await setDoc(doc(db, 'users', uid), { grammarScore: updated }, { merge: true })
    }
    log('lesson:save', `"${lesson.title}" score=${lesson.score}%`, ref.id)
    return ref
  } catch (e) {
    err('lesson:save', 'save failed', e)
    throw e
  }
}

export const getLessonHistory = async (uid) => {
  try {
    const q = query(
      collection(db, 'lesson_completions'),
      where('uid', '==', uid),
      limit(100)
    )
    const snap = await getDocs(q)
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
  } catch (e) {
    err('lesson:load', 'load failed', e)
    return []
  }
}

// ── Activity Log ──────────────────────────────────────────────────────────────
export const saveActivityEvent = async (uid, type, data = {}) => {
  try {
    const ref = await addDoc(collection(db, 'activity_log'), {
      uid, type, ...data,
      date: new Date().toISOString().split('T')[0],
      ts: Date.now(),
      timestamp: serverTimestamp(),
    })
    log('activity:save', `type=${type}`, ref.id)
    return ref
  } catch (e) { err('activity:save', `type=${type} failed`, e) }
}

export const getWeeklyActivity = async (uid) => {
  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const q = query(
      collection(db, 'activity_log'),
      where('uid', '==', uid),
      limit(200)
    )
    const snap = await getDocs(q)
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(d => (d.ts || 0) >= sevenDaysAgo)
      .sort((a, b) => (a.ts || 0) - (b.ts || 0))
  } catch (e) {
    err('activity:load', 'load failed', e)
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
