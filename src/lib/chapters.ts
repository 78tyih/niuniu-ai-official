export interface Chapter {
  no: string
  slug: string
  title: string
  desc: string
  video: string
  poster: string
}

const v = (slug: string) => `/videos/${slug}.mp4`
const p = (slug: string) => `/screenshots/${slug}.jpg`

export const CHAPTERS: Chapter[] = [
  { no: '01', slug: 'connect-mt5', title: '连接 MT5', desc: '安全连接你自己的交易账户，行情与持仓一键同步。', video: v('connect-mt5'), poster: p('connect-mt5') },
  { no: '02', slug: 'ai-analysis', title: 'AI 行情分析', desc: '多周期行情与指标，整理成清晰的分析结论。', video: v('ai-analysis'), poster: p('ai-analysis') },
  { no: '03', slug: 'ai-review', title: '风险审核', desc: '按你的风险规则，独立复核每一个交易条件。', video: v('ai-review'), poster: p('ai-review') },
  { no: '04', slug: 'position-diagnosis', title: '持仓诊断', desc: '当前持仓的风险状态，一目了然。', video: v('position-diagnosis'), poster: p('position-diagnosis') },
  { no: '05', slug: 'ai-replay', title: '交易复盘', desc: '分析、审核与订单记录，放回同一条时间线。', video: v('ai-replay'), poster: p('ai-replay') },
  { no: '06', slug: 'ai-layout', title: 'AI 交易布局', desc: '工作区与界面布局，按你的习惯组织。', video: v('ai-layout'), poster: p('ai-layout') },
  { no: '07', slug: 'custom-prompt', title: '自定义提示词', desc: '把你的指标、周期和规则交给 AI 理解。', video: v('custom-prompt'), poster: p('custom-prompt') },
  { no: '08', slug: 'ai-log', title: 'AI 分析日志', desc: '每一次分析与审核，都有记录可查。', video: v('ai-log'), poster: p('ai-log') },
  { no: '09', slug: 'multi-symbol', title: '多品种分析', desc: '一套流程，覆盖你关注的多个品种。', video: v('multi-symbol'), poster: p('multi-symbol') },
  { no: '10', slug: 'ai-assistant', title: 'AI 交易助手', desc: '完整工作流，从头到尾走一遍。', video: v('ai-assistant'), poster: p('ai-assistant') },
]

/** 首页剧场精选 5 段（顺序即展示顺序） */
const HOME_SLUGS = ['ai-analysis', 'ai-review', 'position-diagnosis', 'ai-layout', 'ai-replay']
export const HOME_CHAPTERS = HOME_SLUGS.map((s) => CHAPTERS.find((c) => c.slug === s)!)
