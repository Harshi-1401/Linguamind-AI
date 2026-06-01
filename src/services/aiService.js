// Groq API integration — uses llama-3.1-8b-instant
// Set VITE_GROQ_API_KEY in your .env file
// Get a free key at: https://console.groq.com

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

const HAS_KEY = GROQ_KEY.length > 10

export const aiStatus = {
  hasKey: HAS_KEY,
  provider: HAS_KEY ? 'Groq' : 'none',
}

// ── Core Groq caller ──────────────────────────────────────────────────────────
async function callGroq(systemPrompt, userPrompt, maxTokens = 512) {
  if (!HAS_KEY) throw new Error('NO_KEY')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq API error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

// ── Chat (multi-turn with history) ────────────────────────────────────────────
export async function sendChatMessage(messages, userMessage, mode = 'Casual Chat', targetLanguage = 'Spanish') {
  if (!HAS_KEY) {
    await new Promise(r => setTimeout(r, 600))
    return getLocalResponse(userMessage)
  }

  const system = `You are LinguaMind AI, a friendly and expert language tutor for ${targetLanguage}.
Conversation mode: ${mode}.
- Reply naturally and conversationally
- Gently correct grammar mistakes inline
- Suggest better vocabulary when helpful
- Keep replies to 2-4 sentences
- Always be encouraging and supportive
- When practicing ${targetLanguage}, include the target language with English translation in parentheses`

  // Build full message history for Groq (multi-turn)
  const historyMessages = messages.slice(-8).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }))

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: system },
        ...historyMessages,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 512,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

// ── Grammar analysis ──────────────────────────────────────────────────────────
export async function analyzeGrammar(text, targetLanguage = 'Spanish') {
  if (!HAS_KEY) return { errors: [], score: 80, feedback: 'Grammar analysis requires a Groq API key.' }

  const raw = await callGroq(
    `You are a ${targetLanguage} grammar expert. Return ONLY valid JSON, no markdown.`,
    `Analyze this text for grammar errors: "${text}"
Return: {"errors":[{"original":"","correction":"","explanation":""}],"score":85,"feedback":""}`,
    512
  )
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) }
  catch { return { errors: [], score: 85, feedback: raw } }
}

// ── Study plan ────────────────────────────────────────────────────────────────
const FALLBACK_PLAN = {
  days: [
    { day: 1, title: 'Foundations', tasks: ['Review 20 vocabulary words', 'Practice basic greetings', 'Listen to native audio 10 min'], duration: '30 min', focus: 'Vocabulary' },
    { day: 2, title: 'Grammar Basics', tasks: ['Study present tense verbs', 'Complete 10 grammar exercises', 'Write 5 sentences'], duration: '35 min', focus: 'Grammar' },
    { day: 3, title: 'Speaking Practice', tasks: ['Record yourself for 2 minutes', 'Practice pronunciation', 'AI conversation session'], duration: '30 min', focus: 'Speaking' },
    { day: 4, title: 'Vocabulary Expansion', tasks: ['Learn 15 new words', 'Create flashcards', 'Use words in context'], duration: '25 min', focus: 'Vocabulary' },
    { day: 5, title: 'Listening & Reading', tasks: ['Watch a short video in target language', 'Read a simple paragraph', 'Note new words'], duration: '40 min', focus: 'Comprehension' },
    { day: 6, title: 'Conversation Practice', tasks: ['AI chat session 15 min', 'Practice common phrases', 'Role-play a scenario'], duration: '35 min', focus: 'Fluency' },
    { day: 7, title: 'Review & Assessment', tasks: ['Review all week vocabulary', 'Take a mini quiz', 'Plan next week goals'], duration: '30 min', focus: 'Review' },
  ],
}

export async function generateStudyPlan(userData) {
  if (!HAS_KEY) return FALLBACK_PLAN

  const raw = await callGroq(
    'You are a language learning curriculum designer. Return ONLY valid JSON, no markdown, no extra text.',
    `Create a 7-day ${userData?.targetLanguage || 'Spanish'} study plan.
Level: ${userData?.level || 1}, Fluency: ${userData?.fluencyScore || 50}%, Goal: ${userData?.learningGoal || 'General fluency'}.
Return: {"days":[{"day":1,"title":"","tasks":["","",""],"duration":"30 min","focus":""}]}`,
    1024
  )
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    if (parsed?.days?.length) return parsed
  } catch { /* fall through */ }
  return FALLBACK_PLAN
}

// ── Vocabulary (free Dictionary API first, Groq fallback) ─────────────────────
async function fetchDictionary(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || !data[0]) return null
    const entry = data[0]
    const meaning = entry.meanings?.[0]
    const def = meaning?.definitions?.[0]
    return {
      definition: def?.definition || '',
      examples: def?.example ? [def.example] : [],
      synonyms: [...(meaning?.synonyms || []), ...(def?.synonyms || [])].slice(0, 4),
      pronunciation: entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '',
      difficulty: 'intermediate',
    }
  } catch { return null }
}

export async function getVocabSuggestions(word, targetLanguage = 'Spanish') {
  // Try free dictionary first
  const dictResult = await fetchDictionary(word)
  if (dictResult?.definition) return dictResult

  // Groq fallback
  if (HAS_KEY) {
    const raw = await callGroq(
      'You are a multilingual dictionary. Return ONLY valid JSON, no markdown.',
      `Provide details for the word "${word}" in the context of ${targetLanguage} learning.
Return: {"definition":"","examples":["",""],"synonyms":["",""],"difficulty":"beginner","pronunciation":""}`,
      256
    )
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      if (parsed?.definition) return parsed
    } catch { /* fall through */ }
  }

  return {
    definition: `No definition found for "${word}". Try a different word or check spelling.`,
    examples: [], synonyms: [], difficulty: 'unknown', pronunciation: '',
  }
}

// ── Speaking analysis ─────────────────────────────────────────────────────────
export async function analyzeSpeaking(transcript, targetLanguage = 'Spanish') {
  if (!HAS_KEY) {
    const words = transcript.trim().split(/\s+/).length
    const score = Math.min(95, 50 + words * 2)
    return {
      fluencyScore: score,
      confidenceScore: Math.max(40, score - 10),
      hesitations: Math.max(0, 5 - Math.floor(words / 10)),
      feedback: `Good effort! You spoke ${words} words. Keep practicing to improve your fluency.`,
      tips: ['Speak slowly and clearly', 'Practice common phrases daily', 'Record yourself and listen back'],
    }
  }

  const raw = await callGroq(
    `You are a ${targetLanguage} speaking coach. Return ONLY valid JSON, no markdown.`,
    `Analyze this spoken text for fluency and confidence: "${transcript}"
Return: {"fluencyScore":75,"confidenceScore":70,"hesitations":2,"feedback":"","tips":["","",""]}`,
    512
  )
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) }
  catch { return { fluencyScore: 72, confidenceScore: 68, hesitations: 1, feedback: raw || 'Good effort!', tips: ['Speak slowly', 'Practice daily', 'Record yourself'] } }
}

// ── Progress prediction ───────────────────────────────────────────────────────
export async function predictProgress(userData) {
  const current = userData?.fluencyScore || 0
  if (!HAS_KEY) {
    return {
      fluencyIn30Days: Math.min(100, current + 12),
      weeklyGrowth: 3,
      recommendation: 'Practice 20-30 minutes daily. Focus on speaking and vocabulary for fastest improvement.',
    }
  }

  const raw = await callGroq(
    'You are a language learning analytics AI. Return ONLY valid JSON, no markdown.',
    `Predict progress for: XP ${userData?.xp || 0}, Streak ${userData?.streak || 0} days, Fluency ${current}%.
Return: {"fluencyIn30Days":80,"weeklyGrowth":5,"recommendation":""}`,
    256
  )
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) }
  catch { return { fluencyIn30Days: Math.min(100, current + 15), weeklyGrowth: 4, recommendation: raw || 'Practice daily.' } }
}

// ── Local fallback responses (no key) ─────────────────────────────────────────
const LOCAL_RESPONSES = [
  "That's a great start! Keep practicing and you'll improve quickly. 💪",
  "Excellent effort! Try to use more vocabulary in your next sentence.",
  "Good job! Remember to pay attention to verb conjugations.",
  "You're making progress! Consistency is the key to fluency.",
  "Nice try! A small tip: practice speaking out loud every day.",
  "Well done! Try to think in the language rather than translating.",
  "Great question! The more you practice, the more natural it becomes.",
]

function getLocalResponse(msg) {
  const m = msg.toLowerCase()
  if (m.includes('hello') || m.includes('hi') || m.includes('hola'))
    return "Hello! Great to see you practicing. What topic would you like to work on today?"
  if (m.includes('thank'))
    return "You're welcome! Keep up the great work. Consistency is key! 🌟"
  if (m.includes('bye') || m.includes('goodbye'))
    return "Goodbye! Great session today. Come back tomorrow to keep your streak! 👋"
  if (m.includes('how are you'))
    return "I'm doing great, thank you! Ready to help you practice. What shall we work on?"
  return LOCAL_RESPONSES[Math.floor(Math.random() * LOCAL_RESPONSES.length)]
}
