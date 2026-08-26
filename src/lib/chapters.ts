export interface Chapter {
  no: string
  slug: string
  title: string
  desc: string
  badges: string[]
}

export const CHAPTERS: Chapter[] = [
  { no: '01', slug: 'connect-mt5', title: '连接 MT5', desc: '安全连接你自己的交易账户，只读行情，不触碰资金。', badges: ['安全连接', '只读不交易', '数据加密传输'] },
  { no: '02', slug: 'ai-analysis', title: 'AI 智能分析', desc: '多周期行情与指标，整理成清晰的分析结论。', badges: ['多周期', '指标叠加', '结论可回看'] },
  { no: '03', slug: 'ai-review', title: 'AI 风险审核', desc: '按你的风险规则，独立复核每一个交易条件。', badges: ['独立复核', '规则自定义', '异常标出'] },
  { no: '04', slug: 'position-diagnosis', title: '持仓诊断', desc: '当前持仓的风险状态，一目了然。', badges: ['实时状态', '风险分层', '一目了然'] },
  { no: '05', slug: 'ai-replay', title: 'AI 交易复盘', desc: '分析、审核与订单记录，放回同一条时间线。', badges: ['统一时间线', '订单关联', '经验沉淀'] },
  { no: '06', slug: 'ai-layout', title: 'AI 交易布局', desc: '工作区与界面布局，按你的习惯组织。', badges: ['自定义工作区', '习惯记忆', '一键切换'] },
  { no: '07', slug: 'custom-prompt', title: '自定义提示词', desc: '把你的指标、周期和规则交给 AI 理解。', badges: ['规则可写', '模板可用', '随时调整'] },
  { no: '08', slug: 'ai-log', title: 'AI 分析日志', desc: '每一次分析与审核，都有记录可查。', badges: ['全程留痕', '可检索', '可导出'] },
  { no: '09', slug: 'multi-symbol', title: '多品种分析', desc: '一套流程，覆盖你关注的多个品种。', badges: ['多品种', '同一流程', '并行分析'] },
  { no: '10', slug: 'ai-assistant', title: 'AI 交易助手', desc: '完整工作流，从头到尾走一遍。', badges: ['端到端', '流程闭环', '人工确认'] },
]

/** 首页剧场精选 5 段 */
export const HOME_CHAPTERS = CHAPTERS.slice(0, 5)
