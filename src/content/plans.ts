import type { Plan } from '../lib/api'

/**
 * 静态兜底价格。
 *
 * 为什么需要它：/api/plans 一旦超时或失败，页面上原本只会渲染出一个空网格 ——
 * 看起来就像「价格被折叠了」。价格是转化链路上最不能消失的东西，所以这里保留
 * 一份与后端一致的兜底数据：接口成功时被真实数据覆盖，接口失败时至少还能看价格。
 *
 * 改动须知：后端调整价格时，这里也要同步改，否则接口挂掉时展示的是旧价。
 */
export const FALLBACK_PLANS: Plan[] = [
  {
    id: -1,
    code: 'days3',
    name: '3天体验卡',
    price_cents: 1990,
    currency: 'CNY',
    interval: 'days3',
    months: 0,
    days: 3,
    nq_credit: 3980,
    features: ['完整功能 3 天体验', 'AI 智能分析 / 风险审核 / 持仓诊断', '复盘与日志', '含 3,980 牛气值（50 元 = 1000 点折算）'],
  },
  {
    id: -2,
    code: 'monthly',
    name: '月卡',
    price_cents: 98000,
    currency: 'CNY',
    interval: 'month',
    months: 1,
    days: 0,
    nq_credit: 19600,
    features: ['AI 智能分析 / 风险审核 / 持仓诊断', '自定义提示词', '复盘与日志导出', '含 19,600 牛气值'],
  },
  {
    id: -3,
    code: 'quarterly',
    name: '季卡',
    price_cents: 201800,
    currency: 'CNY',
    interval: 'quarter',
    months: 3,
    days: 0,
    nq_credit: 40360,
    features: ['包含月卡全部功能', '多品种分析', '自定义提示词模板', '优先客服', '含 40,360 牛气值'],
  },
  {
    id: -4,
    code: 'yearly',
    name: '年卡',
    price_cents: 698000,
    currency: 'CNY',
    interval: 'year',
    months: 12,
    days: 0,
    nq_credit: 139600,
    features: ['包含季卡全部功能', '优先客服与部署协助', '版本更新优先体验', '含 139,600 牛气值'],
  },
]

/** 接口不可用时的提示语 */
export const FALLBACK_NOTICE = '暂时取不到最新价格，以下为参考价，下单时以结算页为准。'
