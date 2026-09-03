export interface ContentArticle {
  id: string
  title: string
  description: string
  content: string
  category: ContentCategory
  tags: string[]
  date: string
  readingTime: string
  relatedIds?: string[]
}

export type ContentCategory =
  | 'updates'
  | 'tutorials'
  | 'workflows'
  | 'prompts'
  | 'risk'
  | 'mt5'
  | 'troubleshooting'
  | 'faq'

export const CATEGORY_LABEL: Record<ContentCategory, string> = {
  updates: '产品更新',
  tutorials: '教程指南',
  workflows: '交易工作流',
  prompts: '提示词模板',
  risk: '风险管理',
  mt5: 'MT5 连接',
  troubleshooting: '故障排查',
  faq: '常见问题',
}

export const CATEGORY_DESC: Record<ContentCategory, string> = {
  updates: '产品动态与版本更新记录',
  tutorials: '基于真实产品功能的逐步操作指南',
  workflows: '从分析到复盘的完整交易流程',
  prompts: '可直接复制使用的提示词模板',
  risk: '风控设置与交易风险管理',
  mt5: 'MT5 安装、连接与实例管理',
  troubleshooting: '常见问题与解决方案',
  faq: '高频问题快速解答',
}

export const CATEGORY_HERO: Record<ContentCategory, string> = {
  updates: '/screenshots/ai-analysis.jpg',
  tutorials: '/screenshots/ai-layout.jpg',
  workflows: '/screenshots/ai-assistant.jpg',
  prompts: '/screenshots/custom-prompt.jpg',
  risk: '/screenshots/ai-review.jpg',
  mt5: '/screenshots/connect-mt5.jpg',
  troubleshooting: '/screenshots/ai-log.jpg',
  faq: '/screenshots/hero.jpg',
}