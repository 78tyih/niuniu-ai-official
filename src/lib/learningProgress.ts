const STORAGE_KEY = 'niuniuai.learning.completed.v1'

function readCompleted(): string[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function getCompletedLearningSlugs(): string[] {
  return readCompleted()
}

export function markLearningComplete(slug: string): void {
  const completed = new Set(readCompleted())
  completed.add(slug)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
}

export function getLearningProgress(total: number): { completed: string[]; count: number; percent: number } {
  const completed = readCompleted()
  const count = Math.min(completed.length, total)
  return { completed, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }
}
