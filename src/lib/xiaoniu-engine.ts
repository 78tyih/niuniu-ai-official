import {
  isGroupQrValid,
  ORDER_INTENT_WORDS,
  PRIVATE_DATA_WORDS,
  SUPPORT_CONTACT,
  TRADE_ADVICE_WORDS,
  XIAONIU_TOPICS,
  type XiaoniuLink,
} from '../content/support/xiaoniu-kb'

export interface XiaoniuReply {
  /**
   * answer   常规知识命中
   * refuse   交易建议，硬拒答
   * privacy  隐私/账户类，只推一对一人工
   * order    订单查询意图，交给 Widget 走登录态异步查询
   * no-match 知识库外，委婉引导转人工
   * greeting 开场白
   */
  kind: 'answer' | 'refuse' | 'privacy' | 'order' | 'no-match' | 'greeting'
  lines: string[]
  links?: XiaoniuLink[]
  /** 是否展示转人工卡片 */
  escalate: boolean
  /**
   * 转人工卡片的形态：
   * one-on-one 只给客服个人码（隐私/订单/账号类，不推群）
   * plus-group 客服码 + 群入口（一般问题）
   */
  escalateMode?: 'one-on-one' | 'plus-group'
  /** 命中的知识条目 id（便于以后统计高频问题） */
  topicId?: string
  confidence: number
}

/** 全角转半角、去空白与标点 */
function normalize(s: string): string {
  return s
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .replace(/[\s，。？！、,.?!~～：:；;'"“”‘’()（）\[\]【】/\\-]/g, '')
}

function bigrams(s: string): string[] {
  const out: string[] = []
  for (let i = 0; i < s.length - 1; i += 1) out.push(s.slice(i, i + 2))
  return out
}

/** 一对一通道：只有长期有效的客服个人码，永远可用 */
const ONE_ON_ONE_LINKS: XiaoniuLink[] = [
  { label: '企业微信客服「元元」', to: SUPPORT_CONTACT.wecom.url, external: true },
]

/**
 * 群入口：企微群码 7 天一换，过期后自动剔除，避免给用户一张扫不出的图。
 * QQ 群号是长期不变的，任何情况下都保留。
 */
function groupLinks(): XiaoniuLink[] {
  const out: XiaoniuLink[] = []
  if (isGroupQrValid()) {
    out.push({ label: SUPPORT_CONTACT.wecomGroup.label, to: SUPPORT_CONTACT.wecomGroup.to })
  }
  out.push({ label: `QQ 群 ${SUPPORT_CONTACT.qqGroup}`, to: '/learn#groups' })
  return out
}

/** 一般问题的转人工链接：客服 + 群 */
function escalateLinks(): XiaoniuLink[] {
  return [...ONE_ON_ONE_LINKS, ...groupLinks()]
}

function hitsAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(normalize(w)))
}

function greetReply(): XiaoniuReply {
  return {
    kind: 'greeting',
    lines: [
      '你好，我是小牛 🐮。',
      '定价、上手、授权码、MT5 连接、牛气值我都能答。',
      'AI 输出仅供参考，不构成投资建议。',
    ],
    escalate: false,
    confidence: 1,
  }
}

function refuseReply(): XiaoniuReply {
  return {
    kind: 'refuse',
    lines: [
      '买卖方向、点位、涨跌预测这类问题小牛一律不答——这是硬规则，不是客气话。',
      '牛牛AI 不提供任何投资建议，不承诺收益；AI 只帮你把分析和风险复核整理清楚，决策权在你。',
      '如果你想要的是「怎么用产品更好地做自己的判断」，我可以讲功能、讲流程。',
    ],
    escalate: true,
    escalateMode: 'plus-group',
    confidence: 1,
  }
}

/** 订单白名单字段：只有这些能进对话，delivered_code 一律不出现 */
const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '待支付',
  paid: '已完成',
  fulfilled: '已发货',
  cancelled: '已取消',
  refunded: '已退款',
}

const CHANNEL_LABEL: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  stripe: 'Stripe',
}

function fmtTime(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/**
 * 把后端 /account/orders 的返回渲染成对话文本。
 * 白名单：订单号 / 套餐 / 金额 / 状态 / 下单时间。授权码（delivered_code）绝不出现。
 */
export function formatOrdersForChat(
  orders: Array<{
    order_no?: string
    plan_name?: string | null
    plan_code?: string
    amount_cents?: number
    status?: string
    channel?: string
    created_at?: string
    paid_at?: string | null
  }>,
): string[] {
  if (!orders || orders.length === 0) return ['你名下暂时没有订单记录。']
  return orders.slice(0, 5).flatMap((o, i) => [
    `${i + 1}. 订单号 ${o.order_no || '—'}`,
    `　 ${o.plan_name || o.plan_code || '—'} · ¥${((o.amount_cents ?? 0) / 100).toFixed(2)} · ${ORDER_STATUS_LABEL[o.status || ''] || o.status || '—'}${o.channel ? ` · ${CHANNEL_LABEL[o.channel] || o.channel}` : ''}`,
    `　 下单时间 ${fmtTime(o.created_at)}`,
  ])
}

/**
 * 隐私 / 账户类：只推一对一人工，绝不推群。
 * 理由：在群里核对订单号、手机号等于把个人隐私公开广播。
 */
function privacyReply(): XiaoniuReply {
  return {
    kind: 'privacy',
    lines: [
      '这个问题我怕答得不准，不想误导你。',
      '你的账户、手机号、支付信息这类内容小牛不查也不答——这是安全底线，不是我偷懒。',
      '找人工更快：扫下面的码加客服元元，一对一帮你核实。',
    ],
    links: [{ label: '登录后查看账户', to: '/account' }, ...ONE_ON_ONE_LINKS],
    escalate: true,
    escalateMode: 'one-on-one',
    confidence: 1,
  }
}

/** 订单查询意图：交给 Widget 判登录态，引擎只给引导语 */
function orderIntentReply(): XiaoniuReply {
  return {
    kind: 'order',
    lines: ['稍等，我帮你查一下——只显示你本人账户下的订单。'],
    escalate: false,
    confidence: 1,
  }
}

/**
 * 知识库外：委婉引导进群。
 * 三段式——先认怂，再划清能力边界，最后给出口。不甩「我不知道」四个字。
 */
function noMatchReply(): XiaoniuReply {
  return {
    kind: 'no-match',
    lines: [
      '这个问题我怕答得不准，不想误导你。',
      '我目前能回答使用教程、购买流程、常见问题这类内容。',
      '你的问题找人工更快——扫这个码加客服元元，一对一帮你解决；也欢迎进群和大家交流。',
    ],
    escalate: true,
    escalateMode: 'plus-group',
    confidence: 0,
  }
}

/**
 * 主入口：输入用户问题，输出结构化回复。
 * 顺序：招呼 → 交易建议（拒答）→ 隐私（转人工）→ 知识库打分 → 兜底转人工。
 */
export function askXiaoniu(raw: string): XiaoniuReply {
  const q = normalize(raw)
  if (!q) return noMatchReply()

  if (/^(你好|您好|hi|hello|嗨|哈喽|在吗|在么|hey)/.test(q)) return greetReply()
  if (hitsAny(q, TRADE_ADVICE_WORDS)) return refuseReply()
  // 订单意图优先于隐私兜底：订单号可以回给本人，前提是登录态（由 Widget 校验）
  if (hitsAny(q, ORDER_INTENT_WORDS)) return orderIntentReply()
  if (hitsAny(q, PRIVATE_DATA_WORDS)) return privacyReply()

  const qBigrams = bigrams(q)

  let best: { id: string; score: number; links?: XiaoniuLink[]; escalate?: boolean; lines: string[] } | null =
    null

  for (const t of XIAONIU_TOPICS) {
    let score = 0
    for (const k of [t.q, ...t.keywords]) {
      const nk = normalize(k)
      if (!nk) continue
      if (q === nk) score += 20
      else if (q.includes(nk) || nk.includes(q)) score += nk.length >= 5 ? 12 : 8
    }
    // 自由文本兜底：二元字组重合度
    const hay = normalize([t.q, ...t.keywords, ...t.answer].join(''))
    const overlap = qBigrams.filter((b) => hay.includes(b)).length
    score += Math.min(overlap, 6)

    if (!best || score > best.score) {
      best = { id: t.id, score, links: t.links, escalate: t.escalate, lines: t.answer }
    }
  }

  const THRESHOLD = 10
  if (!best || best.score < THRESHOLD) return noMatchReply()

  const links = [...(best.links ?? [])]
  if (best.escalate && !links.some((l) => l.to === SUPPORT_CONTACT.wecom.url)) {
    links.push(...escalateLinks())
  }

  return {
    kind: 'answer',
    lines: best.lines,
    links: links.length ? links : undefined,
    escalate: Boolean(best.escalate),
    escalateMode: best.escalate ? 'plus-group' : undefined,
    topicId: best.id,
    confidence: Math.min(1, best.score / 30),
  }
}
