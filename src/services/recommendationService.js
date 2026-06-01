// Rule-based adaptive recommendation engine

export function getRecommendations(userData) {
  const recs = []

  if (!userData) return recs

  const { fluencyScore, grammarScore, pronunciationScore, vocabularyMastery, streak } = userData

  if (grammarScore < 60) {
    recs.push({ type: 'lesson', priority: 'high', title: 'Grammar Fundamentals', reason: 'Your grammar score needs improvement', icon: 'BookOpen', color: '#ef4444' })
  }
  if (pronunciationScore < 65) {
    recs.push({ type: 'speaking', priority: 'high', title: 'Pronunciation Practice', reason: 'Focus on phonetics and accent', icon: 'Mic', color: '#f59e0b' })
  }
  if (vocabularyMastery < 50) {
    recs.push({ type: 'vocab', priority: 'medium', title: 'Vocabulary Builder', reason: 'Expand your word bank', icon: 'BookMarked', color: '#7c3aed' })
  }
  if (fluencyScore < 70) {
    recs.push({ type: 'chat', priority: 'medium', title: 'AI Conversation Practice', reason: 'Build fluency through dialogue', icon: 'MessageSquare', color: '#00d4ff' })
  }
  if (streak === 0) {
    recs.push({ type: 'streak', priority: 'low', title: 'Start Your Streak', reason: 'Consistency is key to fluency', icon: 'Flame', color: '#f97316' })
  }

  return recs
}

export function getDifficultyLevel(score) {
  if (score < 40) return 'beginner'
  if (score < 70) return 'intermediate'
  return 'advanced'
}

export function calculateXPForLevel(level) {
  return level * 500
}

export function getLevelFromXP(xp) {
  return Math.floor(xp / 500) + 1
}
