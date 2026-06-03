import {
  doc, setDoc, getDoc, updateDoc, collection,
  addDoc, getDocs, query, where, orderBy, limit,
  serverTimestamp, increment, Timestamp,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

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

// ── Streak: call this on every login ─────────────────────────────────────────
export const updateStreak = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return

  const data = snap.data()
  const now = new Date()
  const today = now.toDateString()

  const lastDate = data.lastStreakDate?.toDate
    ? data.lastStreakDate.toDate().toDateString()
    : null

  if (lastDate === today) return // already updated today

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  const newStreak = lastDate === yesterdayStr
    ? (data.streak || 0) + 1  // continued streak
    : 1                         // reset streak

  await setDoc(doc(db, 'users', uid), {
    streak: newStreak,
    lastStreakDate: serverTimestamp(),
    lastActive: serverTimestamp(),
  }, { merge: true })
}

// ── Vocabulary ────────────────────────────────────────────────────────────────
export const saveVocabWord = async (uid, word) => {
  const docRef = await addDoc(collection(db, 'vocabulary_history'), {
    uid, ...word, masteryLevel: 0, createdAt: serverTimestamp(),
  })
  // Update user wordsLearned count
  await setDoc(doc(db, 'users', uid), {
    wordsLearned: increment(1),
    vocabularyMastery: increment(2), // each word adds 2% mastery (capped in display)
  }, { merge: true })
  return docRef
}

export const getUserVocab = async (uid) => {
  const q = query(
    collection(db, 'vocabulary_history'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateVocabMastery = (wordId, masteryLevel) =>
  setDoc(doc(db, 'vocabulary_history', wordId), { masteryLevel }, { merge: true })

// ── Chat history ──────────────────────────────────────────────────────────────
export const saveChatMessage = async (uid, message) => {
  await addDoc(collection(db, 'chatbot_history'), {
    uid,
    role: message.role,
    content: message.content,
    lang: message.lang || 'English',
    createdAt: serverTimestamp(),
  })
}

export const getChatHistory = async (uid, lang = null) => {
  let q
  if (lang) {
    q = query(
      collection(db, 'chatbot_history'),
      where('uid', '==', uid),
      where('lang', '==', lang),
      orderBy('createdAt', 'asc'),
      limit(60)
    )
  } else {
    q = query(
      collection(db, 'chatbot_history'),
      where('uid', '==', uid),
      orderBy('createdAt', 'asc'),
      limit(60)
    )
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Track chat sessions
export const incrementChatSession = (uid) =>
  setDoc(doc(db, 'users', uid), { chatSessions: increment(1) }, { merge: true })

// ── Speaking scores ───────────────────────────────────────────────────────────
export const saveSpeakingScore = async (uid, score) => {
  await addDoc(collection(db, 'speaking_scores'), {
    uid, ...score, createdAt: serverTimestamp(),
  })
  // Update user scores
  await setDoc(doc(db, 'users', uid), {
    fluencyScore: score.fluencyScore || 0,
    confidenceScore: score.confidenceScore || 0,
    pronunciationScore: score.fluencyScore || 0,
    xp: increment(15),
  }, { merge: true })
}

export const getSpeakingHistory = async (uid) => {
  const q = query(
    collection(db, 'speaking_scores'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Lesson completion ─────────────────────────────────────────────────────────
export const saveLessonCompletion = async (uid, lesson) => {
  await addDoc(collection(db, 'lesson_completions'), {
    uid,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    level: lesson.level,
    score: lesson.score,
    xpEarned: lesson.xpEarned,
    createdAt: serverTimestamp(),
  })
  // Update user stats
  await setDoc(doc(db, 'users', uid), {
    lessonsCompleted: increment(1),
    xp: increment(lesson.xpEarned),
    grammarScore: Math.min(100, increment(Math.round(lesson.score * 0.5))),
  }, { merge: true })
}

export const getLessonHistory = async (uid) => {
  const q = query(
    collection(db, 'lesson_completions'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(30)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Activity analytics ────────────────────────────────────────────────────────
export const saveActivityEvent = async (uid, type, data = {}) => {
  await addDoc(collection(db, 'activity_log'), {
    uid, type, ...data,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    timestamp: serverTimestamp(),
  })
}

export const getWeeklyActivity = async (uid) => {
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
}

// ── Study plans ───────────────────────────────────────────────────────────────
export const saveStudyPlan = (uid, plan) =>
  setDoc(doc(db, 'study_plans', uid), { uid, ...plan, updatedAt: serverTimestamp() })

export const getStudyPlan = async (uid) => {
  const snap = await getDoc(doc(db, 'study_plans', uid))
  return snap.exists() ? snap.data() : null
}

// ── Achievements ──────────────────────────────────────────────────────────────
export const saveAchievement = (uid, achievement) =>
  addDoc(collection(db, 'achievements'), {
    uid, ...achievement, unlockedAt: serverTimestamp(),
  })

export const getUserAchievements = async (uid) => {
  const q = query(collection(db, 'achievements'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
