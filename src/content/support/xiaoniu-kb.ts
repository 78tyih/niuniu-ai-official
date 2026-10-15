/**
 * 小牛客服 · 知识库
 *
 * 纪律：这里的每一条答案都必须能在站点现有内容里找到出处（FAQ / 套餐 / 教程），
 * 并且挂上链接。想加新答案 = 先在源头内容里写清楚，再在这里引用。
 * 小牛不做自由生成，不回答买卖建议，不返回用户隐私数据。
 */

export interface XiaoniuLink {
  label: string
  to: string
  external?: boolean
}

export interface XiaoniuTopic {
  id: string
  /** 标准问法，用于「你可能想问」的推荐位 */
  q: string
  /** 命中词：口语、同义词、错字都要收，越大越好命中 */
  keywords: string[]
  /** 回答正文，一段一项，聊天里逐条渲染 */
  answer: string[]
  links?: XiaoniuLink[]
  /** 是否建议转人工 */
  escalate?: boolean
}

/** 客服出口：全站统一，改动请同步 LearnHub / PaymentResult / Account */
export const SUPPORT_CONTACT = {
  wecom: {
    label: '企业微信客服「元元」',
    url: 'https://work.weixin.qq.com/u/vcd5b0b3be8bb945b5',
  },
  qqGroup: '638778129',
  wecomGroup: {
    label: '企业微信群「牛气冲天（MT5 版）」',
    to: '/learn#groups',
    /** 群码图片，用于对话面板内嵌展示 */
    qr: '/qr/wecom-group-qr.png',
  },
  /** 客服个人码（长期有效），群码过期时降级只留这一个 */
  wecomQr: '/qr/kefuyuanyuan-qr.png',
  hours: '9:00 – 18:00',
}

/**
 * 企微群码有效期（Asia/Shanghai）。企微群码 7 天一换，过期后扫码会失效。
 * 到期行为：对话面板与全站自动隐藏群码入口，只留长期有效的客服个人码，
 * 同时给出「进群」文字引导。改这一个常量即可，六处引用会同步生效。
 */
export const GROUP_QR_EXPIRES_AT = '2026-10-22T23:59:59+08:00'

/** 群码是否仍在有效期内 */
export function isGroupQrValid(now: Date = new Date()): boolean {
  const t = Date.parse(GROUP_QR_EXPIRES_AT)
  if (Number.isNaN(t)) return false
  return now.getTime() <= t
}

/** 群码剩余天数（用于提前提醒站长换码） */
export function groupQrDaysLeft(now: Date = new Date()): number {
  const t = Date.parse(GROUP_QR_EXPIRES_AT)
  if (Number.isNaN(t)) return 0
  return Math.ceil((t - now.getTime()) / 86_400_000)
}

/**
 * 订单意图：命中后走「登录态查询」分支，而不是静态话术。
 * 注意与 PRIVATE_DATA_WORDS 的区别——这里只回显本人订单的脱敏字段，
 * 且必须登录；PRIVATE_DATA_WORDS 里的一律转人工。
 */
export const ORDER_INTENT_WORDS = [
  '我的订单', '订单号', '查订单', '查一下订单', '订单状态', '订单在哪',
  '我买的', '我买过', '我的购买', '买了什么', '买的是哪', '订单记录',
  '支付成功了吗', '付款成功了吗', '到账了吗', '生效了吗', '我的订阅', '订阅到什么时候',
]

export const XIAONIU_TOPICS: XiaoniuTopic[] = [
  {
    id: 'pricing',
    q: '套餐价格是多少？',
    keywords: [
      '价格', '多少钱', '收费', '套餐', '定价', '价目', '怎么卖', '贵不贵',
      '月卡', '年卡', '季卡', '体验卡', '订阅多少钱', '购买', '下单',
    ],
    answer: [
      '四个周期，功能一致、周期不同：',
      '· 3 天体验卡 ¥19.9（含 3,980 牛气值）',
      '· 月卡 ¥980（含 19,600 牛气值）',
      '· 季卡 ¥2,018（含 40,360 牛气值，多品种分析、自定义提示词模板、优先客服）',
      '· 年卡 ¥6,980（含 139,600 牛气值，优先客服与部署协助、版本更新优先体验）',
    ],
    links: [{ label: '查看完整定价', to: '/pricing' }],
  },
  {
    id: 'trial',
    q: '有没有试用期？',
    keywords: ['试用', '体验', '免费', '白嫖', '先试试', '体验卡', '有没有试用'],
    answer: [
      '有 3 天体验卡，¥19.9，包含完整功能——和月卡、季卡、年卡功能一致，只是使用周期不同。',
      '也可以先到演示页把所有功能演示视频看一遍，再决定要不要买。',
    ],
    links: [
      { label: '定价与体验卡', to: '/pricing' },
      { label: '产品演示', to: '/demo' },
    ],
  },
  {
    id: 'getting-started',
    q: '第一次使用怎么上手？',
    keywords: ['怎么开始', '如何上手', '新手', '第一次', '怎么用', '入门', '怎么使用', '教程', '怎么学', '学习'],
    answer: [
      '三步走：登录账号 → 在 MT5 实例页面绑定你的交易账号 → 跑第一次 AI 分析。',
      '完整的第一次使用流程在学习中心「快速上手」分类里，有视频也有图文。',
    ],
    links: [
      { label: '快速上手分类', to: '/learn/getting-started' },
      { label: '怎么登录并连接 MT5', to: '/learn/how-to-connect-mt5' },
    ],
  },
  {
    id: 'nq-credit',
    q: '牛气值是什么？怎么扣？',
    keywords: ['牛气值', '点数', '积分', '怎么扣', '余额', '充值', '不够用', '消耗', '计费'],
    answer: [
      '牛气值是平台内的计费单位，衡量 AI 调用量：50 元 = 1000 牛气值，随套餐自动发放。',
      'AI 行情分析、风险审核、持仓诊断等 AI 功能调用会消耗牛气值；余额不足时可以在账户页面充值。',
    ],
    links: [{ label: '牛气值说明', to: '/learn/what-is-niuqi-credit' }],
  },
  {
    id: 'license',
    q: '支付后没收到授权码怎么办？',
    keywords: ['授权码', '卡密', '激活码', '没收到', '发货', '待发码', '激活', '兑换码'],
    answer: [
      '正常情况下支付成功后会自动发货，授权码直接显示在支付结果页。',
      '如果页面提示「待发码」，通常是卡密库存不足，需要联系客服补货后手动发货。',
    ],
    links: [{ label: '支付后没收到授权码怎么办', to: '/learn/how-to-get-license-after-payment' }],
    escalate: true,
  },
  {
    id: 'mt5-connect',
    q: 'MT5 连不上怎么办？',
    keywords: ['连不上', '连接失败', 'mt5', '绑定', '实例', '算法交易', '已连接', '连不上怎么办'],
    answer: [
      '先在控制台检查 MT5 实例是否绑定；再打开 MT5 的「工具」菜单，找到「算法交易」，确认它处于允许状态。',
      '设置完成后回到控制台，看到「已连接」就说明绑定正常。',
    ],
    links: [{ label: 'MT5 连不上排查步骤', to: '/learn/how-to-fix-mt5-connection' }],
  },
  {
    id: 'auto-trade',
    q: 'AI 会自动替我下单吗？',
    keywords: ['自动下单', '自动交易', '谁确认', '全自动', '托管', '代操盘', 'ai下单', '是否自动'],
    answer: [
      '不会替你下单。AI 只做分析和复核，最终是否执行由你确认。',
      '方案以挂单方式交给 MT5 执行，价位由 MT5 校验，不绕过你的终端。',
    ],
    links: [{ label: 'AI 为什么有时候拒绝开仓', to: '/learn/why-ai-rejects-trade' }],
  },
  {
    id: 'workflow',
    q: '牛牛AI 是什么、怎么工作的？',
    keywords: ['是什么', '干嘛的', '做什么', '工作原理', '流程', '介绍', '功能', '有什么用'],
    answer: [
      '牛牛AI 是一款连接你 MT5 的 AI 交易辅助系统，不是脱离交易环境的「信号机」。',
      '核心工作流：行情分析 → 风险审核 → 人工确认 → 交易执行 → 持仓诊断 → AI 日志复盘。',
    ],
    links: [
      { label: '产品介绍', to: '/product' },
      { label: '完整交易流程', to: '/learn/what-is-the-full-workflow' },
    ],
  },
  {
    id: 'safety',
    q: '我的交易数据安全吗？',
    keywords: ['安全', '隐私', '数据', '账号安全', '泄露', '凭证', '信息安全'],
    answer: [
      '你的 MT5 连接信息、交易数据都只用于你自己的分析与执行，详见站点隐私政策。',
      '如果涉及账户异常或安全疑虑，直接转人工客服核实，不在对话里核对任何账户信息。',
    ],
    links: [{ label: '常见问题与排错', to: '/learn/troubleshooting' }],
    escalate: true,
  },
  {
    id: 'platform',
    q: '支持 macOS 吗？',
    keywords: ['mac', 'macos', '苹果', '系统要求', 'win', 'windows', '支持什么系统', '电脑'],
    answer: [
      '支持 Windows 和 macOS 双平台，MT5 在 macOS 上也有对应版本，可以正常连接使用。',
      '注意：不同系统的 MT5 安装路径可能不同，连接时请在 MT5 实例页面确认路径正确。',
    ],
    links: [{ label: '怎么登录并连接 MT5', to: '/learn/how-to-connect-mt5' }],
  },
  {
    id: 'refund',
    q: '支持退款吗？',
    keywords: ['退款', '退钱', '退货', '不想要了', '取消订单', '退订', '可以退吗'],
    answer: [
      '退款政策正在制定中。如果有退款需求，请直接联系企业微信客服「元元」处理。',
      '订单、退款一律走人工核验，小牛不会在对话里处理任何退款操作。',
    ],
    escalate: true,
  },
  {
    id: 'contact',
    q: '怎么联系人工客服？',
    keywords: ['客服', '人工', '转人工', '联系', '找人', '加群', '微信群', 'qq群', '售后', '投诉'],
    answer: [
      '企业微信客服「元元」：扫码添加，一对一服务。',
      'QQ 群 638778129：群内提问，社区一起答。',
      '企业微信群「牛气冲天（MT5 版）」：扫码加入，二维码有效期至 10 月 22 日。',
      `服务时间 ${SUPPORT_CONTACT.hours}。`,
    ],
    links: [
      { label: '联系客服（企业微信）', to: SUPPORT_CONTACT.wecom.url, external: true },
      { label: '企微群二维码入口', to: '/learn#groups' },
    ],
  },
  {
    id: 'subscription',
    q: '怎么看我的订阅和续费？',
    keywords: ['订阅', '续费', '到期', '剩余时间', '我的套餐', '账户', '会员', '有效期', '怎么续'],
    answer: [
      '登录后进入「账户」页面，可以看到当前订阅方案、到期时间和牛气值余额。',
      '续费直接在账户页操作；推荐邀请码和佣金记录也在账户页的「推荐」里。',
    ],
    links: [{ label: '我的账户', to: '/account' }],
  },
  {
    id: 'referral',
    q: '推荐有佣金吗？',
    keywords: ['推荐', '邀请', '佣金', '分销', '返佣', '邀请码', '拉人', '推广'],
    answer: [
      '有。登录后进入「账户 → 推荐」，可以看到你的专属邀请码和佣金记录。',
    ],
    links: [{ label: '我的推荐与佣金', to: '/account/referral' }],
  },
  {
    id: 'custom-prompt',
    q: '怎么让 AI 按我的方法分析？',
    keywords: ['提示词', 'prompt', '自定义', '克隆分析师', '训练', '我的方法', '模板', '策略'],
    answer: [
      '分析、风控、监控三段提示词都可以自己改；也可以用「克隆分析师」按你的风格生成一套（激进/保守，可指定 MACD 等指标）。',
      '关于固定策略模板（马丁、网格、斐波那契等），策略库正在建设中，可以先从自定义提示词入手。',
    ],
    links: [
      { label: '怎么让 AI 按我的习惯分析', to: '/learn/how-to-train-ai-with-your-style' },
      { label: '克隆分析师怎么用', to: '/learn/how-to-clone-analysis-style' },
    ],
  },
  {
    id: 'risk',
    q: '怎么控制风险？',
    keywords: ['风控', '风险', '止损', '止盈', '亏损', '限制', '手数', '仓位', '审核'],
    answer: [
      '在风控设置里可以限制每天最大交易次数和最大亏损；达到每日最大亏损后当天停止开新仓。',
      '还可以使用新闻过滤和风控审核师：行情分析通过 ≠ 风险规则通过，执行前会再复核一遍。',
    ],
    links: [
      { label: '每日亏损限制怎么设', to: '/learn/how-to-set-daily-loss-limit' },
      { label: 'AI 为什么拒绝开仓', to: '/learn/why-ai-rejects-trade' },
    ],
  },
  {
    id: 'no-profit',
    q: '它是自动赚钱软件吗？',
    keywords: ['赚钱', '稳赚', '收益', '盈利', '保证', '自动赚', '躺着', '翻倍', '靠谱吗'],
    answer: [
      '不是。牛牛AI 不承诺任何收益，AI 输出仅供辅助参考；所有交易决策由你做出，风险也由你承担。',
      '如果有人向你承诺「稳赚」，那一定不是我们。',
    ],
  },
]

/** 硬拒答：交易建议类。命中即固定话术，绝不自由发挥。 */
export const TRADE_ADVICE_WORDS = [
  '买点', '卖点', '该不该买', '现在能买', '能不能买', '要不要卖', '做多还是', '做空还是',
  '预测', '预判', '会涨吗', '会跌吗', '涨跌', '走势怎么看', '后市', '目标价',
  '推荐股票', '推荐品种', '买什么', '什么币种', '点位给我', '喊单', '带单',
]

/** 敏感：涉及用户隐私数据，一律转人工核验，不在对话里返回 */
export const PRIVATE_DATA_WORDS = [
  '我的订单', '订单号', '查订单', '我的手机号', '我的账号', '我的资料', '退款进度',
  '帮我查', '我的邮箱', '改手机号', '注销',
]

/** 开场白 */
export const XIAONIU_GREETING = [
  '我是小牛 🐮，牛牛AI 的在线助手。',
  '定价、上手、授权码、MT5 连接、牛气值这些我都能答；订单、退款和个人信息要转人工客服，我不碰。',
  'AI 输出仅供参考，不构成投资建议。',
]

/** 推荐位（首屏「你可能想问」） */
export const QUICK_ASK = [
  '套餐价格是多少？',
  '第一次使用怎么上手？',
  '支付后没收到授权码怎么办？',
  'MT5 连不上怎么办？',
  '牛气值是什么？怎么扣？',
  '怎么联系人工客服？',
]
