import {
  doc, setDoc, getDoc, collection,
  addDoc, getDocs, query, where, limit, deleteDoc,
  serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

const log = (tag, msg, data) => console.log(`[Firestore][${tag}]`, msg, data ?? '')
const err = (tag, msg, e) => console.error(`[Firestore][${tag}] FAILED:`, msg, e?.message)

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
    log('user:create', 'Created', user.uid)
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
  } catch (e) { err('streak', 'failed', e) }
}

// ── ChatGPT-style Chat (subcollections under users/{uid}/conversations) ────────
// Schema:
//   users/{uid}/conversations/{convId}  → { title, lang, mode, lastMessage, messageCount, createdAt, updatedAt }
//   users/{uid}/conversations/{convId}/messages/{msgId} → { role, content, ts, createdAt }

export const createConversation = async (uid, { lang, mode, firstMessage }) => {
  try {
    const title = (firstMessage || 'New Chat').slice(0, 60)
    const convRef = doc(collection(db, 'users', uid, 'conversations'))
    await setDoc(convRef, {
      title,
      lang: lang || 'English',
      mode: mode || 'Casual Chat',
      lastMessage: title,
      messageCount: 0,
      ts: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    log('conv:create', `"${title}"`, convRef.id)
    return convRef.id
  } catch (e) {
    err('conv:create', 'failed', e)
    throw e
  }
}

export const saveMessage = async (uid, convId, message) => {
  try {
    const msgRef = doc(collection(db, 'users', uid, 'conversations', convId, 'messages'))
    await setDoc(msgRef, {
      role: message.role,
      content: message.content,
      ts: Date.now(),
      createdAt: serverTimestamp(),
    })
    // Update conversation metadata
    const update = {
      updatedAt: serverTimestamp(),
      messageCount: increment(1),
      ts: Date.now(),
    }
    if (message.role === 'user') update.lastMessage = message.content.slice(0, 80)
    await setDoc(doc(db, 'users', uid, 'conversations', convId), update, { merge: true })
    log('msg:save', `${message.role} in conv ${convId}`, msgRef.id)
    return msgRef.id
  } catch (e) {
    err('msg:save', 'failed', e)
    throw e
  }
}

export const getConversations = async (uid) => {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'conversations'))
    const result = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    log('conv:load', `${result.length} conversations`)
    return result
  } catch (e) {
    err('conv:load', 'failed', e)
    return []
  }
}

export const getMessages = async (uid, convId) => {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'conversations', convId, 'messages'))
    const result = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.ts || 0) - (b.ts || 0))
    log('msg:load', `${result.length} msgs from conv ${convId}`)
    return result
  } catch (e) {
    err('msg:load', 'failed', e)
    return []
  }
}

export const deleteConversation = async (uid, convId) => {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'conversations', convId, 'messages'))
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
    await deleteDoc(doc(db, 'users', uid, 'conversations', convId))
    log('conv:delete', convId)
  } catch (e) {
    err('conv:delete', 'failed', e)
    throw e
  }
}

export const incrementChatSession = (uid) =>
  setDoc(doc(db, 'users', uid), { chatSessions: increment(1) }, { merge: true })

// ── Vocabulary ────────────────────────────────────────────────────────────────
export const saveVocabWord = async (uid, word) => {
  try {
    const clean = Object.fromEntries(Object.entries(word).filter(([, v]) => v !== undefined))
    const ref = await addDoc(collection(db, 'vocabulary_history'), {
      uid, ...clean, masteryLevel: 0, ts: Date.now(), createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', uid), {
      wordsLearned: increment(1), vocabularyMastery: increment(2),
    }, { merge: true })
    log('vocab:save', `"${word.word}"`, ref.id)
    return ref
  } catch (e) { err('vocab:save', 'failed', e); throw e }
}

export const getUserVocab = async (uid) => {
  try {
    const snap = await getDocs(query(collection(db, 'vocabulary_history'), where('uid', '==', uid), limit(500)))
    const result = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.ts || 0) - (a.ts || 0))
    log('vocab:load', `${result.length} words`)
    return result
  } catch (e) { err('vocab:load', 'failed', e); return [] }
}

export const updateVocabMastery = async (wordId, masteryLevel) => {
  try {
    await setDoc(doc(db, 'vocabulary_history', wordId), { masteryLevel }, { merge: true })
    log('vocab:mastery', `${wordId} → ${masteryLevel}`)
  } catch (e) { err('vocab:mastery', 'failed', e) }
}

export const deleteVocabWord = async (uid, wordId) => {
  try {
    await deleteDoc(doc(db, 'vocabulary_history', wordId))
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const d = snap.data()
      await setDoc(doc(db, 'users', uid), {
        wordsLearned: Math.max(0, (d.wordsLearned || 1) - 1),
        vocabularyMastery: Math.max(0, (d.vocabularyMastery || 2) - 2),
      }, { merge: true })
    }
    log('vocab:delete', wordId)
  } catch (e) { err('vocab:delete', 'failed', e); throw e }
}

// ── Speaking ──────────────────────────────────────────────────────────────────
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
    log('speaking:save', ref.id)
    return ref
  } catch (e) { err('speaking:save', 'failed', e); throw e }
}

export const getSpeakingHistory = async (uid) => {
  try {
    const snap = await getDocs(query(collection(db, 'speaking_scores'), where('uid', '==', uid), limit(50)))
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.ts || 0) - (a.ts || 0))
  } catch (e) { err('speaking:load', 'failed', e); return [] }
}

// ── Lessons ───────────────────────────────────────────────────────────────────
export const saveLessonCompletion = async (uid, lesson) => {
  try {
    const ref = await addDoc(collection(db, 'lesson_completions'), {
      uid, lessonId: lesson.id, lessonTitle: lesson.title,
      level: lesson.level, score: lesson.score, xpEarned: lesson.xpEarned,
      ts: Date.now(), createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', uid), {
      lessonsCompleted: increment(1), xp: increment(lesson.xpEarned),
    }, { merge: true })
    const userSnap = await getDoc(doc(db, 'users', uid))
    if (userSnap.exists()) {
      const cur = userSnap.data().grammarScore || 0
      await setDoc(doc(db, 'users', uid), { grammarScore: Math.min(100, cur + Math.round(lesson.score * 0.3)) }, { merge: true })
    }
    log('lesson:save', `"${lesson.title}"`, ref.id)
    return ref
  } catch (e) { err('lesson:save', 'failed', e); throw e }
}

export const getLessonHistory = async (uid) => {
  try {
    const snap = await getDocs(query(collection(db, 'lesson_completions'), where('uid', '==', uid), limit(100)))
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.ts || 0) - (a.ts || 0))
  } catch (e) { err('lesson:load', 'failed', e); return [] }
}

// ── Activity Log ──────────────────────────────────────────────────────────────
export const saveActivityEvent = async (uid, type, data = {}) => {
  try {
    const ref = await addDoc(collection(db, 'activity_log'), {
      uid, type, ...data, date: new Date().toISOString().split('T')[0],
      ts: Date.now(), timestamp: serverTimestamp(),
    })
    log('activity:save', type, ref.id)
    return ref
  } catch (e) { err('activity:save', type, e) }
}

export const getWeeklyActivity = async (uid) => {
  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const snap = await getDocs(query(collection(db, 'activity_log'), where('uid', '==', uid), limit(200)))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(d => (d.ts || 0) >= sevenDaysAgo)
      .sort((a, b) => (a.ts || 0) - (b.ts || 0))
  } catch (e) { err('activity:load', 'failed', e); return [] }
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
  const snap = await getDocs(query(collection(db, 'achievements'), where('uid', '==', uid)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
