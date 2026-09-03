import type { ContentArticle, ContentCategory } from './types'
import { UPDATES } from './updates'
import { TUTORIALS } from './tutorials'
import { WORKFLOWS } from './workflows'
import { PROMPTS } from './prompts'
import { RISK } from './risk'
import { MT5 } from './mt5'
import { TROUBLESHOOTING } from './troubleshooting'
import { FAQS } from './faq'

export type { ContentArticle, ContentCategory } from './types'
export { CATEGORY_LABEL, CATEGORY_DESC, CATEGORY_HERO } from './types'

export const CONTENT_MAP: Record<ContentCategory, ContentArticle[]> = {
  updates: UPDATES,
  tutorials: TUTORIALS,
  workflows: WORKFLOWS,
  prompts: PROMPTS,
  risk: RISK,
  mt5: MT5,
  troubleshooting: TROUBLESHOOTING,
  faq: FAQS,
}

export const ALL_ARTICLES: ContentArticle[] = Object.values(CONTENT_MAP).flat()

export function getArticle(id: string): ContentArticle | undefined {
  return ALL_ARTICLES.find((a) => a.id === id)
}

export function getArticlesByCategory(cat: ContentCategory): ContentArticle[] {
  return CONTENT_MAP[cat] || []
}

export function getRelatedArticles(article: ContentArticle, limit = 3): ContentArticle[] {
  const sameCategory = getArticlesByCategory(article.category).filter((a) => a.id !== article.id)
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)
  const others = ALL_ARTICLES.filter((a) => a.id !== article.id && !sameCategory.includes(a))
  return [...sameCategory, ...others].slice(0, limit)
}

export const CATEGORIES: { id: ContentCategory; label: string; desc: string }[] = [
  { id: 'updates', label: '产品更新', desc: '产品动态与版本更新记录' },
  { id: 'tutorials', label: '教程指南', desc: '基于真实产品功能的逐步操作指南' },
  { id: 'workflows', label: '交易工作流', desc: '从分析到复盘的完整交易流程' },
  { id: 'prompts', label: '提示词模板', desc: '可直接复制使用的提示词模板' },
  { id: 'risk', label: '风险管理', desc: '风控设置与交易风险管理' },
  { id: 'mt5', label: 'MT5 连接', desc: 'MT5 安装、连接与实例管理' },
  { id: 'troubleshooting', label: '故障排查', desc: '常见问题与解决方案' },
  { id: 'faq', label: '常见问题', desc: '高频问题快速解答' },
]