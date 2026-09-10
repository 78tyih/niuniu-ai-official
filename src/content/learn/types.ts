export type LearningTrack =
  | 'getting-started'
  | 'analysis'
  | 'risk'
  | 'custom-ai'
  | 'review'
  | 'troubleshooting'

export interface LearningVideo {
  src: string
  poster: string
  subtitle?: string
  durationSeconds: number
}

export interface LearningCallout {
  type: 'info' | 'important' | 'warning' | 'tip'
  text: string
}

export interface LearningStep {
  id: string
  title: string
  body: string
  image?: string
  expectedResult?: string
  callout?: LearningCallout
}

export interface LearningFAQ {
  question: string
  answer: string
}

export interface LearningArticle {
  id: string
  slug: string
  title: string
  shortAnswer: string
  track: LearningTrack
  order: number
  difficulty: '入门' | '进阶' | '高级'
  readingMinutes: number
  tags: string[]
  video?: LearningVideo
  intro?: string
  prerequisites?: string[]
  steps: LearningStep[]
  commonProblems?: LearningFAQ[]
  related?: string[]
  updatedAt?: string
}

export interface LearningTrackMeta {
  id: LearningTrack
  name: string
  question: string
  description: string
}
