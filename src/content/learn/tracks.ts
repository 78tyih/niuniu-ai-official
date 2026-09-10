import type { LearningTrackMeta } from './types'

export const LEARNING_TRACKS: LearningTrackMeta[] = [
  {
    id: 'getting-started',
    name: '快速上手',
    question: '第一次怎么用？',
    description: '从登录、连接 MT5 到完成第一次 AI 分析。',
  },
  {
    id: 'analysis',
    name: 'AI 分析与下单',
    question: 'AI 怎么分析、怎么生成方案？',
    description: '行情分析、多方案选择、一键布局与策略配置。',
  },
  {
    id: 'risk',
    name: '风控与持仓',
    question: '怎么审核、怎么限制风险？',
    description: '风控审核、每日亏损限制，以及开仓后的持仓管理。',
  },
  {
    id: 'custom-ai',
    name: '自定义 AI',
    question: '怎么让 AI 按我的方法分析？',
    description: '提示词、克隆分析师与执行度设置。',
  },
  {
    id: 'review',
    name: '复盘与进阶',
    question: '为什么会产生这笔交易？',
    description: 'AI 日志、历史记录与交易复盘。',
  },
  {
    id: 'troubleshooting',
    name: '常见问题与排错',
    question: '出错了先检查什么？',
    description: '连不上、不开仓、没有数据与账户问题。',
  },
]

export const TRACK_NAME: Record<string, string> = Object.fromEntries(
  LEARNING_TRACKS.map((t) => [t.id, t.name]),
)
