import type { ContentArticle } from './types'

export const FAQS: ContentArticle[] = [
  {
    id: 'what-is-niuniuai',
    title: '牛牛AI 是什么？',
    description: '产品定位和核心功能简介。',
    date: '2026-08',
    category: 'faq',
    tags: ['产品'],
    readingTime: '1 分钟',
    content: `
牛牛AI 是一款连接 MT5 交易环境的 AI 交易辅助系统。它把行情分析、风险审核、人工确认与交易复盘，组织在同一套工作流程中——不是脱离你交易环境的"信号机"。

核心工作流：行情分析 → 风险审核 → 用户确认 → 交易执行 → 持仓诊断 → AI 日志/复盘
    `,
  },
  {
    id: 'is-auto-profit',
    title: '它是自动赚钱软件吗？',
    description: '明确产品定位和收益承诺。',
    date: '2026-08',
    category: 'faq',
    tags: ['产品', '收益'],
    readingTime: '1 分钟',
    content: `
不是。牛牛AI 不承诺任何收益，AI 输出仅供辅助参考。所有交易决策由你自己做出，风险也由你自己承担。如果有人向你承诺"稳赚"，那一定不是我们。
    `,
  },
  {
    id: 'data-source',
    title: '行情数据从哪里来？',
    description: '行情数据的来源和差异说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['数据', '行情'],
    readingTime: '1 分钟',
    content: `
来自你自己连接的 MT5 及其经纪商，牛牛AI 不自行定价、不提供行情。不同平台之间报价存在差异，通常与经纪商、品种、时区和延迟有关。
    `,
  },
  {
    id: 'broker-compatibility',
    title: '支持所有 MT5 和券商吗？',
    description: '券商兼容性说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['MT5', '券商'],
    readingTime: '1 分钟',
    content: `
我们不这样承诺。原则上 MT5 环境均可连接，但个别券商的接口限制可能成为例外——建议先联系客服确认你的环境，再决定是否使用。
    `,
  },
  {
    id: 'auto-trade',
    title: 'AI 会自动替我下单吗？最终由谁确认？',
    description: 'AI 下单机制和用户确认流程。',
    date: '2026-08',
    category: 'faq',
    tags: ['交易', '确认'],
    readingTime: '1 分钟',
    content: `
分析与审核都只是辅助环节，最终由你确认。你可以在设置中决定风险审核、持仓诊断是否参与流程，并通过风控设置限制每日交易次数、最大持仓与止损止盈边界。
    `,
  },
  {
    id: 'who-not-suitable',
    title: '什么样的人不适合用牛牛AI？',
    description: '产品适用人群说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['产品', '适用人群'],
    readingTime: '1 分钟',
    content: `
只想得到一个确定买卖答案的人；希望软件保证收益、或代替自己承担亏损的人；不愿学习基础交易风险和账户操作的人。如果你属于以上情况，建议先了解风险教育内容，再考虑是否使用。
    `,
  },
  {
    id: 'what-is-nq-credit',
    title: '什么是牛气值？',
    description: '牛气值的定义和用途。',
    date: '2026-08',
    category: 'faq',
    tags: ['牛气值', '计费'],
    readingTime: '1 分钟',
    content: `
牛气值是牛牛 AI 平台内的统一计费单位，用于衡量 AI 分析调用量。50 元人民币 = 1000 牛气值，随套餐自动发放。AI 行情分析、风险审核、持仓诊断等 AI 功能调用会消耗牛气值。
    `,
  },
  {
    id: 'how-to-recharge',
    title: '如何充值或续费？',
    description: '充值续费方式说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['充值', '续费'],
    readingTime: '1 分钟',
    content: `
访问官网定价页面（/pricing），选择适合的套餐，通过微信支付或 Stripe 完成支付即可。续费会自动顺延套餐有效期并累加牛气值。

目前支持：
- 微信支付（ZPay 通道）
- Stripe 支付（测试模式，海外客户）

待开通：支付宝通道。
    `,
  },
  {
    id: 'how-to-contact',
    title: '如何联系客服？',
    description: '客服渠道和服务时间。',
    date: '2026-08',
    category: 'faq',
    tags: ['客服', '联系'],
    readingTime: '1 分钟',
    content: `
客服渠道：
- 企业微信客服「元元」：扫码添加，一对一服务
- QQ 群：638778129，群内提问，社区一起答
- 企业微信群：备用通道，防止 QQ 群不可达
- 腾讯频道「牛气冲天」：https://pd.qq.com/s/1j4t73gpf?b=9

服务时间：9:00 – 18:00
    `,
  },
  {
    id: 'data-security',
    title: '我的交易数据和账户信息安全吗？',
    description: '数据安全和隐私保护说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['安全', '隐私'],
    readingTime: '1 分钟',
    content: `
牛牛AI 只读取你 MT5 账户的行情数据和持仓信息，不存储你的 MT5 账户密码。所有数据通过加密传输，AI 分析在云端完成，但你的交易账户密码始终由你自己保管。

具体的安全措施：
- MT5 连接通过本地客户端建立，不暴露账户密码
- 数据传输使用加密通道
- 历史订单分析在本地完成
- 不向第三方分享你的交易数据
    `,
  },
  {
    id: 'trial-period',
    title: '有试用期吗？',
    description: '试用方式和体验卡说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['试用', '体验'],
    readingTime: '1 分钟',
    content: `
我们提供 3 天体验卡（¥199），适合先体验完整功能再决定是否长期使用。你也可以在演示页面查看所有功能演示视频，了解产品后再购买。

体验卡包含完整功能，与月卡、季卡、年卡的功能一致，只是使用周期不同。
    `,
  },
  {
    id: 'refund-policy',
    title: '支持退款吗？',
    description: '退款政策说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['退款', '政策'],
    readingTime: '1 分钟',
    content: `
待产品确认。目前退款政策正在制定中，如有退款需求请直接联系客服元元处理。
    `,
  },
  {
    id: 'difference-from-signals',
    title: '牛牛AI 和交易信号跟单有什么区别？',
    description: '产品差异说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['产品', '对比'],
    readingTime: '2 分钟',
    content: `
牛牛AI 和交易信号跟单是完全不同的产品。

**交易信号跟单**

复制他人的交易信号，跟随别人的交易决策。你不了解交易逻辑，也不参与决策过程。

**牛牛AI**

AI 辅助你分析市场、管理风险，但最终决策由你做出。你不是在跟随别人的交易，而是在 AI 的辅助下做出自己的交易决策。

核心区别：
- 信号跟单：被动跟随
- 牛牛AI：主动决策 + AI 辅助
    `,
  },
  {
    id: 'mac-support',
    title: '支持 macOS 吗？',
    description: 'macOS 支持说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['macOS', '系统'],
    readingTime: '1 分钟',
    content: `
支持。牛牛AI 支持 Windows 和 macOS 双平台。MT5 在 macOS 上也有对应的版本，可以正常连接使用。

需要注意的是，不同操作系统的 MT5 安装路径可能不同，连接时请在 MT5 实例页面确认路径正确。
    `,
  },
  {
    id: 'ai-accuracy',
    title: 'AI 分析的准确率如何？',
    description: 'AI 分析准确率说明。',
    date: '2026-08',
    category: 'faq',
    tags: ['AI', '准确率'],
    readingTime: '1 分钟',
    content: `
牛牛AI 不承诺 AI 分析的准确率，也不提供胜率、收益率等数据。AI 分析的质量受多种因素影响：
- 提示词的质量和精确度
- 行情数据的质量
- 市场环境的复杂度
- AI 模型本身的局限性

AI 输出仅供辅助参考，不构成投资建议。所有交易决策和风险由你自己承担。
    `,
  },
]