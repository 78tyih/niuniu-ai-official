export interface PopularQuestion {
  question: string
  slug: string
}

export const POPULAR_QUESTIONS: PopularQuestion[] = [
  { question: 'AI 为什么没有开仓？', slug: 'why-ai-rejects-trade' },
  { question: 'MT5 连不上怎么办？', slug: 'how-to-fix-mt5-connection' },
  { question: '怎么让 AI 按我的方法分析？', slug: 'how-to-train-ai-with-your-style' },
  { question: '一键布局生成的参数还能改吗？', slug: 'how-to-use-one-click-layout' },
  { question: '牛气值是怎么扣的？', slug: 'what-is-niuqi-credit' },
  { question: '在哪里查看以前的 AI 分析？', slug: 'how-to-review-trades' },
]

/** 首页固定四步（SPEC §20） */
export const QUICK_START_SLUGS = [
  'how-to-connect-mt5',
  'how-to-analyze-screenshot',
  'how-to-use-one-click-layout',
  'how-to-set-daily-loss-limit',
]
