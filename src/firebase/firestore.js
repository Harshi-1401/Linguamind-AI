import {
  doc, setDoc, getDoc, updateDoc, collection,
  addDoc, getDocs, query, where, orderBy, limit,
  serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// ── User ──────────────────────────────────────────────
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
      fluencyScore: 0,
      grammarScore: 0,
      pronunciationScore: 0,
      vocabularyMastery: 0,
      confidenceScore: 0,
      targetLanguage: 'Spanish',
      nativeLanguage: 'English',
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

// ── Vocabulary ────────────────────────────────────────
export const saveVocabWord = (uid, word) =>
  addDoc(collection(db, 'vocabulary_history'), {
    uid, ...word, masteryLevel: 0, createdAt: serverTimestamp(),
  })

export const getUserVocab = async (uid) => {
  const q = query(collection(db, 'vocabulary_history'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Speaking Scores ───────────────────────────────────
export const saveSpeakingScore = (uid, score) =>
  addDoc(collection(db, 'speaking_scores'), {
    uid, ...score, createdAt: serverTimestamp(),
  })

export const getSpeakingHistory = async (uid) => {
  const q = query(collection(db, 'speaking_scores'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(20))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Chatbot History ───────────────────────────────────
export const saveChatMessage = (uid, message) =>
  addDoc(collection(db, 'chatbot_history'), {
    uid, ...message, createdAt: serverTimestamp(),
  })

export const getChatHistory = async (uid) => {
  const q = query(collection(db, 'chatbot_history'), where('uid', '==', uid), orderBy('createdAt', 'asc'), limit(50))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Achievements ──────────────────────────────────────
export const saveAchievement = (uid, achievement) =>
  addDoc(collection(db, 'achievements'), {
    uid, ...achievement, unlockedAt: serverTimestamp(),
  })

export const getUserAchievements = async (uid) => {
  const q = query(collection(db, 'achievements'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Study Plans ───────────────────────────────────────
export const saveStudyPlan = (uid, plan) =>
  setDoc(doc(db, 'study_plans', uid), { uid, ...plan, updatedAt: serverTimestamp() })

export const getStudyPlan = async (uid) => {
  const snap = await getDoc(doc(db, 'study_plans', uid))
  return snap.exists() ? snap.data() : null
}

// ── Analytics ─────────────────────────────────────────
export const saveAnalyticsEvent = (uid, event) =>
  addDoc(collection(db, 'analytics'), {
    uid, ...event, timestamp: serverTimestamp(),
  })
