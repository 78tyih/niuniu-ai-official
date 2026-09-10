import type { LearningArticle, LearningTrack } from './types'
import { LEARNING_ARTICLES } from './articles'
import { LEARNING_TRACKS, TRACK_NAME } from './tracks'
import { POPULAR_QUESTIONS, QUICK_START_SLUGS } from './faq'

export type {
  LearningArticle,
  LearningTrack,
  LearningVideo,
  LearningStep,
  LearningFAQ,
  LearningCallout,
  LearningTrackMeta,
} from './types'

export { LEARNING_ARTICLES, LEARNING_TRACKS, TRACK_NAME, POPULAR_QUESTIONS }

export function getArticle(slug: string): LearningArticle | undefined {
  return LEARNING_ARTICLES.find((a) => a.slug === slug)
}

export function getArticleById(id: string): LearningArticle | undefined {
  return LEARNING_ARTICLES.find((a) => a.id === id)
}

export function getArticlesByTrack(track: LearningTrack | string): LearningArticle[] {
  return LEARNING_ARTICLES.filter((a) => a.track === track).sort((a, b) => a.order - b.order)
}

export function getQuickStartArticles(): LearningArticle[] {
  return QUICK_START_SLUGS.map((s) => getArticle(s)).filter((a): a is LearningArticle => Boolean(a))
}

export function getPopularQuestions(): { question: string; article: LearningArticle }[] {
  return POPULAR_QUESTIONS.map((q) => ({ question: q.question, article: getArticle(q.slug) })).filter(
    (x): x is { question: string; article: LearningArticle } => Boolean(x.article),
  )
}

export function getRelatedArticles(slug: string): LearningArticle[] {
  const article = getArticle(slug)
  if (!article?.related?.length) return []
  return article.related
    .map((s) => getArticle(s))
    .filter((a): a is LearningArticle => Boolean(a))
}

export function getPrevNext(slug: string): { prev?: LearningArticle; next?: LearningArticle } {
  const ordered = [...LEARNING_ARTICLES].sort((a, b) => a.order - b.order)
  const i = ordered.findIndex((a) => a.slug === slug)
  if (i < 0) return {}
  return { prev: ordered[i - 1], next: ordered[i + 1] }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '')
}

function scoreArticle(article: LearningArticle, q: string): number {
  const needle = normalize(q)
  if (!needle) return 0
  let score = 0
  const inTitle = normalize(article.title).includes(needle)
  const inAnswer = normalize(article.shortAnswer).includes(needle)
  const inTrack = normalize(TRACK_NAME[article.track] ?? '').includes(needle)
  const inTags = article.tags.some((t) => normalize(t).includes(needle))
  const inSteps = article.steps.some((s) => normalize(s.title).includes(needle))
  const inProblems = (article.commonProblems ?? []).some((p) => normalize(p.question).includes(needle))
  if (inTitle) score += 10
  if (inAnswer) score += 6
  if (inTags) score += 5
  if (inSteps) score += 4
  if (inProblems) score += 3
  if (inTrack) score += 2
  return score
}

export function searchArticles(query: string): LearningArticle[] {
  const q = query.trim()
  if (!q) return []
  const terms = q.split(/[\s，,、]+/).filter(Boolean)
  return LEARNING_ARTICLES.map((a) => ({
    article: a,
    score: terms.reduce((sum, t) => sum + scoreArticle(a, t), 0),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.article)
}

export const LEARNING_STATS = {
  articleCount: LEARNING_ARTICLES.length,
  videoCount: LEARNING_ARTICLES.filter((a) => a.video).length,
  trackCount: LEARNING_TRACKS.length,
}
