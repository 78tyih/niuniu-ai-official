import type { LearningArticle } from './types'

export const LEARNING_ARTICLES: LearningArticle[] = [
  {
    id: '02-connect-mt5',
    slug: 'how-to-connect-mt5',
    title: '第一次用牛牛 AI，怎么登录并连接 MT5？',
    shortAnswer:
      '先在牛牛 AI 里打开 MT5 实例面板，切换并选中你要绑定的交易账号，点击「绑定到此 MT5」，回到控制台看到「已连接」就完成了。',
    track: 'getting-started',
    order: 1,
    difficulty: '入门',
    readingMinutes: 3,
    tags: ['MT5', '连接', '入门', '第一次使用'],
    video: {
      src: '/videos/tutorials/02-connect-mt5.mp4',
      poster: '/videos/tutorials/covers/02-connect-mt5.jpg',
      durationSeconds: 23.75,
    },
    intro:
      'MT5 是牛牛 AI 获取行情与持仓的数据来源。没有完成绑定，AI 无法分析你的账户，也无法把方案同步回 MT5。',
    prerequisites: ['已注册牛牛 AI 账户并登录', 'MT5 已安装并可以正常运行'],
    steps: [
      {
        id: 's1',
        title: '打开 MT5 实例面板',
        body: '在牛牛 AI 里进入「MT5 实例」区域，这里是管理绑定关系的入口。',
        callout: { type: 'info', text: '如果有多台机器或多个 MT5 目录，会在这里分别列出。' },
      },
      {
        id: 's2',
        title: '切换 MT5 实例',
        body: '点击「切换 MT5 实例」，让牛牛 AI 识别当前正在运行的 MT5。',
      },
      {
        id: 's3',
        title: '选中要绑定的交易账号',
        body: '在实例列表里选择你要连接的那个交易账号，确认账号与服务器信息无误。',
        expectedResult: '列表中目标账号处于被选中状态。',
      },
      {
        id: 's4',
        title: '点击「绑定到此 MT5」',
        body: '这是本教程的核心动作。点击后牛牛 AI 会与 MT5 建立连接关系。',
        callout: { type: 'important', text: '请确认选中的是你真正要使用的账号，绑定关系决定后续行情与持仓的来源。' },
      },
      {
        id: 's5',
        title: '回到控制台确认「已连接」',
        body: '返回牛牛 AI 主控制台，查看连接状态标识。',
        expectedResult: '控制台显示「已连接」，说明绑定成功。',
        callout: { type: 'warning', text: '如果一直显示未连接，先按《MT5 连不上牛牛 AI，应该先检查什么？》排查，不要反复重复绑定。' },
      },
    ],
    commonProblems: [
      {
        question: '绑定和「算法交易」是同一件事吗？',
        answer:
          '不是。绑定解决的是「牛牛 AI 能不能读到你的 MT5 账户」；算法交易开关属于另一个设置项，作用是允许自动交易执行。建议先完成绑定，再单独处理算法交易。',
      },
      {
        question: '绑定后行情没有立刻变化？',
        answer: '行情与持仓同步需要几秒钟。如果长时间没有数据，先确认 MT5 本身处于登录状态且行情正常刷新。',
      },
    ],
    related: ['how-to-fix-mt5-connection', 'how-to-start-auto-trading', 'how-to-analyze-screenshot'],
  },
  {
    id: '03-auto-trading-basics',
    slug: 'how-to-start-auto-trading',
    title: '怎么让牛牛 AI 开始自动盯盘？',
    shortAnswer:
      '在主界面上方开启自动交易，AI 会按固定间隔分析当前品种，并在出现合适机会时生成挂单方案。默认每隔几分钟分析一次，这个间隔可以调整。',
    track: 'getting-started',
    order: 2,
    difficulty: '进阶',
    readingMinutes: 3,
    tags: ['自动交易', '盯盘', '分析间隔'],
    video: {
      src: '/videos/tutorials/03-auto-trading-basics.mp4',
      poster: '/videos/tutorials/covers/03-auto-trading-basics.jpg',
      durationSeconds: 24.96,
    },
    intro: '自动交易让 AI 按固定间隔重复分析，代替你一直盯着图表。它不改变分析逻辑，只是把「手动点一次」变成「按节奏持续跑」。',
    prerequisites: ['已完成 MT5 绑定'],
    steps: [
      {
        id: 's1',
        title: '在主界面上方开启自动交易',
        body: '控制台顶部提供暂停与恢复分析的开关，开启后 AI 开始按间隔循环分析。',
      },
      {
        id: 's2',
        title: '确认 AI 正在盯住当前品种',
        body: '开启后界面上会显示当前分析的品种与下一次分析的时间。',
        expectedResult: '能看到下一次分析倒计时，说明自动循环已经跑起来。',
      },
      {
        id: 's3',
        title: '按需要调整分析间隔',
        body: '默认每隔几分钟分析一次。品种波动较快时可以缩短间隔，反之可以拉长。',
        callout: { type: 'tip', text: '间隔越短，AI 调用次数越多，牛气值消耗也越快。' },
      },
      {
        id: 's4',
        title: '理解生成的结果是什么',
        body: '有合适机会时，AI 会生成挂单方案，包含入场、止损、止盈等要素。',
        callout: { type: 'important', text: '开启自动交易不等于完全放手。方案是否执行仍由你决定。' },
      },
    ],
    commonProblems: [
      {
        question: '开了自动交易，AI 会自己下单吗？',
        answer: 'AI 负责分析并给出挂单方案，是否执行由你确认。请把自动交易理解为「自动分析」，不是「自动替我承担风险」。',
      },
      {
        question: '开了很久一次方案都没有？',
        answer: '没有方案可能只是因为当前行情不满足条件，也可能被风控审核拦下。可以查看《AI 为什么有时候会拒绝开仓？》。',
      },
    ],
    related: ['how-to-set-trading-params', 'why-ai-rejects-trade', 'how-to-connect-mt5'],
  },
  {
    id: '04-auto-trading-params',
    slug: 'how-to-set-trading-params',
    title: '自动分析时，方向、手数和止损止盈怎么设置？',
    shortAnswer:
      '在自动交易参数里先选交易方向（多空都做 / 只做多 / 只做空），再设置每单手数，最后填写手动止损与止盈点数。设好这些再交给 AI 执行。',
    track: 'analysis',
    order: 3,
    difficulty: '进阶',
    readingMinutes: 4,
    tags: ['参数', '手数', '止损', '止盈', '交易方向'],
    video: {
      src: '/videos/tutorials/04-auto-trading-params.mp4',
      poster: '/videos/tutorials/covers/04-auto-trading-params.jpg',
      durationSeconds: 25.36,
    },
    intro: '参数决定 AI 生成方案时的边界。同一段行情，参数不同，方案的风险特征完全不同。',
    prerequisites: ['已开启自动交易'],
    steps: [
      {
        id: 's1',
        title: '设置交易方向',
        body: '可以选择「多空都做」「只做多」或「只做空」。如果你对方向有明确偏好，用后两项限制 AI 的出手范围。',
      },
      {
        id: 's2',
        title: '设置每单手数',
        body: '决定每次开仓的基础仓位大小，界面默认值较小。',
        callout: { type: 'important', text: '手数直接决定单笔风险敞口，请结合账户资金规模设置，不要照搬他人参数。' },
      },
      {
        id: 's3',
        title: '设置手动止损点数',
        body: '填写你希望强制执行的止损距离。',
      },
      {
        id: 's4',
        title: '设置手动止盈点数',
        body: '填写你的止盈目标距离。',
        callout: { type: 'warning', text: '止损与止盈的具体含义与生效方式请以产品当前版本为准，设置前建议先用模拟账户验证。' },
      },
      {
        id: 's5',
        title: '确认参数并交给 AI',
        body: '参数设置完成后，AI 会按这套边界生成方案。',
        expectedResult: '参数保存成功，后续方案符合你设置的取值范围。',
      },
    ],
    commonProblems: [
      {
        question: '止损止盈点数怎么换算成价格？',
        answer: '不同品种的点值不同，换算方式与品种报价精度有关。建议先用模拟账户观察一次实际效果再用于真实账户。',
      },
    ],
    related: ['how-to-start-auto-trading', 'how-to-use-one-click-layout', 'how-to-set-daily-loss-limit'],
  },
  {
    id: '05-risk-review-mechanism',
    slug: 'why-ai-rejects-trade',
    title: 'AI 为什么有时候会拒绝开仓？',
    shortAnswer:
      '因为行情分析通过，不代表风险规则也通过。牛牛 AI 会在执行前再做一次风险审核，由风控审核师检查 AI 的判断是否合理，不满足条件时这一次就不会开仓。',
    track: 'risk',
    order: 4,
    difficulty: '进阶',
    readingMinutes: 3,
    tags: ['风控', '审核', '不开仓'],
    video: {
      src: '/videos/tutorials/05-risk-review-mechanism.mp4',
      poster: '/videos/tutorials/covers/05-risk-review-mechanism.jpg',
      durationSeconds: 25.96,
    },
    intro: '「不开仓」通常不是故障，而是审核环节在起作用。理解这一点，能避免你把正常的风险拦截误判为系统异常。',
    steps: [
      {
        id: 's1',
        title: 'AI 先分析出机会',
        body: '分析环节给出方向与条件，这一步只说明「存在机会」。',
      },
      {
        id: 's2',
        title: '进入风控审核',
        body: '机会不会直接执行，而是先交给风控审核环节。',
        callout: { type: 'info', text: '审核与分析是两个独立环节，前者不通过，后者给的结论也不会被执行。' },
      },
      {
        id: 's3',
        title: '审核检查判断是否合理',
        body: '风控审核师会复核 AI 的分析依据，判断这次出手是否符合你的风险规则。',
      },
      {
        id: 's4',
        title: '通过后才生成方案',
        body: '只有审核通过，才会继续生成挂单方案。',
        expectedResult: '审核通过时能看到对应方案；不通过时该次分析不产生可执行方案。',
      },
    ],
    commonProblems: [
      {
        question: '连续多次都不开仓，要改什么？',
        answer:
          '先分辨原因：是行情条件不满足，还是风控规则过严。可先查看 AI 日志中记录的理由，再决定是否调整风控设置，不要为了「让它开仓」而盲目放宽限制。',
      },
      {
        question: '可以把风控审核关掉吗？',
        answer: '风控审核是账户的一道保护。是否可关闭以及开关位置，请以产品当前版本的设置项为准。',
      },
    ],
    related: ['how-to-set-daily-loss-limit', 'how-to-review-trades', 'how-execution-threshold-works'],
  },
  {
    id: '06-one-click-layout-lines',
    slug: 'how-to-auto-draw-levels',
    title: '不会画支撑阻力，怎么让 AI 自动帮你画？',
    shortAnswer:
      '使用自动划线功能，AI 会直接在图表上标出阻力线、支撑线和趋势线，这几类线可以单独开关。持仓明细里也能查看每一个订单，新手更容易看懂关键位置。',
    track: 'analysis',
    order: 5,
    difficulty: '进阶',
    readingMinutes: 3,
    tags: ['自动划线', '支撑阻力', '图表'],
    video: {
      src: '/videos/tutorials/06-one-click-layout-lines.mp4',
      poster: '/videos/tutorials/covers/06-one-click-layout-lines.jpg',
      durationSeconds: 24,
    },
    intro: '划线的作用是把「关键位置在哪」这件事可视化。你不需要先学会画线，才能读懂图。',
    steps: [
      {
        id: 's1',
        title: '在图表上启用自动划线',
        body: '开启后 AI 会根据当前行情自动标注关键位置。',
      },
      {
        id: 's2',
        title: '确认阻力线',
        body: '图表上会直接标出上方阻力位置。',
      },
      {
        id: 's3',
        title: '确认支撑线与趋势线',
        body: '支撑线与趋势线会一并画出，帮助你判断结构。',
        expectedResult: '图上能看到三类线，且位置与当前周期行情对应。',
      },
      {
        id: 's4',
        title: '按需单独开关某类线',
        body: '如果画面太满，可以关掉不需要的线，只保留你最关心的那类。',
        callout: { type: 'tip', text: '线是辅助判断，不是买卖信号。请结合自己的分析使用。' },
      },
    ],
    commonProblems: [
      {
        question: '自动画出来的线和我平时画的不一样？',
        answer: 'AI 依据它识别的结构与周期标注，和你手工画线的方法可能不同。建议先观察一段时间，再决定是否采用。',
      },
    ],
    related: ['how-to-use-one-click-layout', 'how-to-configure-strategy', 'how-to-connect-mt5'],
  },
  {
    id: '07-one-click-layout',
    slug: 'how-to-use-one-click-layout',
    title: '怎么用一键布局生成一套挂单方案？',
    shortAnswer:
      '看到合适行情后点「一键布局」，AI 会根据当前周期生成挂单方案。方案里的入场价、止损、止盈和手数都可以修改，确认后挂单会同步到 MT5。是否执行由你决定。',
    track: 'analysis',
    order: 6,
    difficulty: '进阶',
    readingMinutes: 4,
    tags: ['一键布局', '挂单', '方案'],
    video: {
      src: '/videos/tutorials/07-one-click-layout.mp4',
      poster: '/videos/tutorials/covers/07-one-click-layout.jpg',
      durationSeconds: 27,
    },
    intro: '一键布局解决的是「不想自己算入场、止损和止盈」。AI 给方案，你负责检查与确认。',
    prerequisites: ['已完成 MT5 绑定', '当前品种有正常行情数据'],
    steps: [
      {
        id: 's1',
        title: '找到想操作的行情',
        body: '先选定品种与周期，确认行情符合你的判断。',
      },
      {
        id: 's2',
        title: '点击「一键布局」',
        body: 'AI 会按当前周期生成挂单方案。',
      },
      {
        id: 's3',
        title: '检查入场价、止损、止盈与手数',
        body: '方案生成后逐项核对四个关键数值是否符合你的预期。',
        callout: { type: 'important', text: '这一步不能跳过。AI 给的是方案，风险由你承担。' },
      },
      {
        id: 's4',
        title: '按需修改参数',
        body: '四个数值都可以改，改完再进入确认。',
      },
      {
        id: 's5',
        title: '确认后同步到 MT5',
        body: '确认后，挂单会同步到你的 MT5。',
        expectedResult: 'MT5 中出现对应的挂单记录。',
        callout: { type: 'warning', text: '同步结果需要回到 MT5 侧核对，界面上「已提交」不等于 MT5 已接受。' },
      },
    ],
    commonProblems: [
      {
        question: '生成的参数还能改吗？',
        answer: '可以改。入场价、止损、止盈和手数都能在确认前调整。',
      },
      {
        question: '确认后没在 MT5 看到挂单？',
        answer: '先确认 MT5 处于可交易状态，再检查是否存在价位校验未通过的情况。详情见《MT5 连不上牛牛 AI，应该先检查什么？》。',
      },
    ],
    related: ['how-to-auto-draw-levels', 'how-to-set-trading-params', 'how-to-choose-among-plans'],
  },
  {
    id: '08-ai-screenshot-analysis',
    slug: 'how-to-analyze-screenshot',
    title: '只有一张行情截图，也能让 AI 帮你分析吗？',
    shortAnswer:
      '可以。先在 MT5 上截取你关注的图表，上传截图（最多三张），再输入你想了解的分析需求，AI 大约需要半分钟给出结果，结果会包含具体建议与依据。',
    track: 'analysis',
    order: 7,
    difficulty: '入门',
    readingMinutes: 3,
    tags: ['截图分析', '手动分析', 'AI 分析'],
    video: {
      src: '/videos/tutorials/08-ai-screenshot-analysis.mp4',
      poster: '/videos/tutorials/covers/08-ai-screenshot-analysis.jpg',
      durationSeconds: 24,
    },
    intro: '除了自动交易，你也可以随时手动发起一次分析。适合临时看到感兴趣的行情、又不想开启自动循环的场景。',
    steps: [
      {
        id: 's1',
        title: '在 MT5 上截取图表',
        body: '截取你要分析的那张图表，尽量包含完整的K线与关键位置。',
      },
      {
        id: 's2',
        title: '上传截图',
        body: '把截图上传到牛牛 AI，最多可以传三张。',
        callout: { type: 'tip', text: '多张截图可用于对比不同周期或不同品种。' },
      },
      {
        id: 's3',
        title: '输入你的分析需求',
        body: '用一句话说明你想了解什么，例如关注的方向、周期或担忧的位置。',
        callout: { type: 'info', text: '需求写得越具体，结果越贴近你的问题。' },
      },
      {
        id: 's4',
        title: '等待结果',
        body: 'AI 大约需要半分钟给出结果。',
        expectedResult: '返回包含具体建议与判断依据的分析结果。',
      },
    ],
    commonProblems: [
      {
        question: '截图里需要注意什么？',
        answer: '尽量保证图表清晰、K 线完整、时间周期可见，避免截到过多无关区域。',
      },
    ],
    related: ['how-to-connect-mt5', 'how-to-choose-among-plans', 'how-to-set-trading-params'],
  },
  {
    id: '09-ai-analysis-multi-plan',
    slug: 'how-to-choose-among-plans',
    title: '同一个行情有多个方案，应该怎么选？',
    shortAnswer:
      '同一段行情 AI 可能给出多套方案，每个方案都有自己的入场价和止损止盈。勾选你想挂出的那一套，点修改还能调整价格和手数，确认后由 MT5 校验价位并提交。',
    track: 'analysis',
    order: 8,
    difficulty: '进阶',
    readingMinutes: 4,
    tags: ['多方案', '选择', '挂单'],
    video: {
      src: '/videos/tutorials/09-ai-analysis-multi-plan.mp4',
      poster: '/videos/tutorials/covers/09-ai-analysis-multi-plan.jpg',
      durationSeconds: 25,
    },
    intro: '多方案不是让你全都要，而是让你按自己的判断挑一套。方案之间的差异通常在入场位置与风险距离上。',
    steps: [
      {
        id: 's1',
        title: '查看生成的多套方案',
        body: '例如这里生成了两个挂单方案，并排展示各自的参数。',
      },
      {
        id: 's2',
        title: '对比入场价与止损止盈',
        body: '逐个方案看它的入场位置、止损距离和止盈目标，判断哪一套更贴合你的风险偏好。',
        callout: { type: 'important', text: '选择标准应该是「你能不能接受它的止损」，而不是「哪个看起来赚得多」。' },
      },
      {
        id: 's3',
        title: '勾选你要挂出的那一套',
        body: '确定后只勾选选中的方案，避免误挂多套。',
      },
      {
        id: 's4',
        title: '按需修改价格与手数',
        body: '点修改可以调整价格和手数，再进入确认。',
      },
      {
        id: 's5',
        title: '确认后由 MT5 校验并提交',
        body: 'MT5 会对价位进行校验，通过后提交挂单。',
        expectedResult: '选中方案出现在 MT5 的挂单列表中。',
      },
    ],
    commonProblems: [
      {
        question: '可以同时挂多套方案吗？',
        answer: '是否允许多套同时挂出，取决于产品当前版本的设置与你的风控边界。同时挂多套会放大整体风险敞口，请谨慎。',
      },
    ],
    related: ['how-to-use-one-click-layout', 'how-to-set-trading-params', 'why-ai-rejects-trade'],
  },
  {
    id: '10-trading-strategies',
    slug: 'how-to-configure-strategy',
    title: '怎么配置自己的交易策略？',
    shortAnswer:
      '在交易策略板块可以看到当前运行的策略，也可以选择其他策略进入详细配置。例如网格加趋势过滤策略支持多档自定义间隔，配合磁吸功能让挂单更灵活。',
    track: 'analysis',
    order: 9,
    difficulty: '高级',
    readingMinutes: 4,
    tags: ['策略', '网格', '配置'],
    video: {
      src: '/videos/tutorials/10-trading-strategies.mp4',
      poster: '/videos/tutorials/covers/10-trading-strategies.jpg',
      durationSeconds: 26,
    },
    intro: '策略适合已经有明确交易框架、希望把参数固定下来的用户。不同策略的风险特征差异很大，建议先小仓位验证。',
    steps: [
      {
        id: 's1',
        title: '进入交易策略板块',
        body: '这里能看到当前正在运行的策略。',
      },
      {
        id: 's2',
        title: '选择要使用的策略',
        body: '从列表中选择其他策略进入详细配置。',
      },
      {
        id: 's3',
        title: '配置策略参数',
        body: '以网格加趋势过滤为例，它可以自定义多档间隔，档数与间距按你的计划设置。',
        callout: { type: 'warning', text: '网格类策略在单边行情中会持续加仓，风险敞口可能快速放大，务必先用模拟账户验证。' },
      },
      {
        id: 's4',
        title: '按需启用磁吸等功能',
        body: '磁吸可以让挂单更灵活地贴合价格。',
      },
    ],
    commonProblems: [
      {
        question: '策略和自动交易是什么关系？',
        answer: '自动交易负责「按节奏跑分析」，策略决定「按什么规则下单」。两者可以配合使用。',
      },
    ],
    related: ['how-to-set-trading-params', 'how-to-start-auto-trading', 'how-to-set-daily-loss-limit'],
  },
  {
    id: '11-ai-model-execution',
    slug: 'how-execution-threshold-works',
    title: '开仓执行度调高或调低，会发生什么？',
    shortAnswer:
      '最低开仓执行度是一个门槛：低于这个值，AI 不会提交开仓。调高门槛会更谨慎、出手机会更少；调低门槛会更积极、出手频次更高，相应地需要你自己把控节奏。',
    track: 'custom-ai',
    order: 10,
    difficulty: '高级',
    readingMinutes: 3,
    tags: ['执行度', '阈值', 'AI 模型'],
    video: {
      src: '/videos/tutorials/11-ai-model-execution.mp4',
      poster: '/videos/tutorials/covers/11-ai-model-execution.jpg',
      durationSeconds: 26,
    },
    intro: '这个设置影响的是「AI 出手的严格程度」，不是预测准确率。请把它当作筛选门槛来理解。',
    steps: [
      {
        id: 's1',
        title: '找到最低开仓执行度设置',
        body: '它位于 AI 模型相关设置中，用来控制 AI 提交开仓的门槛。',
      },
      {
        id: 's2',
        title: '理解门槛的作用方式',
        body: '设定一个数值后，未达到该门槛的情况不会进入开仓流程。',
        callout: { type: 'important', text: '执行度是「是否提交开仓」的筛选门槛，不代表盈利概率或胜率。' },
      },
      {
        id: 's3',
        title: '调高门槛会怎样',
        body: '调高后 AI 更谨慎，符合条件的机会相应减少。',
      },
      {
        id: 's4',
        title: '调低门槛会怎样',
        body: '调低后 AI 更积极，出手频次上升，风险需要你自己把控。',
        callout: { type: 'warning', text: '降低门槛不会提高单笔质量，只会增加出手次数。请结合账户承受能力调整。' },
      },
      {
        id: 's5',
        title: '按自己的风格定一个值',
        body: '没有通用最优值。建议先在模拟账户上固定一个值观察一段时间，再逐步调整。',
      },
    ],
    commonProblems: [
      {
        question: '调高执行度能提高成功率吗？',
        answer: '不能这样理解。执行度只决定「哪些情况会被提交开仓」，与后续结果没有必然关系，也不构成任何收益预期。',
      },
    ],
    related: ['why-ai-rejects-trade', 'how-to-set-daily-loss-limit', 'how-to-review-trades'],
  },
  {
    id: '12-position-monitoring',
    slug: 'how-to-monitor-positions',
    title: '开仓以后，怎么让 AI 持续盯着持仓风险？',
    shortAnswer:
      '开启分析后，牛牛 AI 会持续监控持仓。主面板上能看到距下次分析的时间，分析间隔默认是五分钟；持仓出现风险时会自动处理，你也可以随时暂停或恢复分析。',
    track: 'risk',
    order: 11,
    difficulty: '进阶',
    readingMinutes: 3,
    tags: ['持仓', '监控', '分析间隔'],
    video: {
      src: '/videos/tutorials/12-position-monitoring.mp4',
      poster: '/videos/tutorials/covers/12-position-monitoring.jpg',
      durationSeconds: 25,
    },
    intro: '持仓管理的关键是「持续」二字。开仓只是一次决策，持仓期间的风险变化才是更需要被看管的部分。',
    prerequisites: ['已有持仓', '已开启分析'],
    steps: [
      {
        id: 's1',
        title: '开启分析',
        body: '开启后牛牛 AI 会持续监控当前持仓。',
      },
      {
        id: 's2',
        title: '查看距下次分析的时间',
        body: '主面板上显示倒计时，你可以据此判断监控节奏。',
        expectedResult: '能看到下一次分析的剩余时间。',
      },
      {
        id: 's3',
        title: '了解默认监控间隔',
        body: '分析间隔默认是五分钟，可以按品种波动情况调整。',
        callout: { type: 'tip', text: '间隔越短，牛气值消耗越快，请结合自己的使用频率权衡。' },
      },
      {
        id: 's4',
        title: '持仓出现风险时的处理',
        body: '监控到风险时系统会自动处理。',
        callout: { type: 'important', text: '自动处理的具体动作与触发条件请以产品当前版本说明为准，建议先用模拟账户观察一次实际表现。' },
      },
      {
        id: 's5',
        title: '随时暂停或恢复',
        body: '监控节奏由你自己决定，可以随时暂停，需要时再恢复。',
      },
    ],
    commonProblems: [
      {
        question: '暂停分析期间持仓还有保护吗？',
        answer: '暂停意味着不再按间隔进行新的分析。已经设置在 MT5 侧的止损止盈不受影响，这部分由你的交易账户本身执行。',
      },
    ],
    related: ['how-to-set-daily-loss-limit', 'why-ai-rejects-trade', 'how-to-review-trades'],
  },
  {
    id: '13-risk-control',
    slug: 'how-to-set-daily-loss-limit',
    title: '每天最多做几单、亏多少就停，怎么设置？',
    shortAnswer:
      '在风控设置里可以限制每天的最大交易次数和最大亏损。达到每日最大亏损后，当天会停止开新仓；此外还有新闻过滤和风控审核师可以配合使用。',
    track: 'risk',
    order: 12,
    difficulty: '进阶',
    readingMinutes: 4,
    tags: ['风控', '最大亏损', '交易次数', '新闻过滤'],
    video: {
      src: '/videos/tutorials/13-risk-control.mp4',
      poster: '/videos/tutorials/covers/13-risk-control.jpg',
      durationSeconds: 26.61,
    },
    intro: '风控设置的作用是提前把边界定好，避免在情绪波动时临时做决定。',
    prerequisites: ['已完成 MT5 绑定'],
    steps: [
      {
        id: 's1',
        title: '进入风控设置',
        body: '风控设置可以限制每天的亏损和交易次数。',
      },
      {
        id: 's2',
        title: '设置每日最大交易次数',
        body: '限制当天允许的开仓次数，界面默认值为 20 次。',
        callout: { type: 'info', text: '默认值只是初始示例，请按自己的交易节奏调整。' },
      },
      {
        id: 's3',
        title: '设置每日最大亏损',
        body: '设定你当天能承受的亏损上限。',
        callout: { type: 'important', text: '触发后的限制范围（是否影响已有持仓、挂单与手工操作）请以产品当前版本说明为准。' },
      },
      {
        id: 's4',
        title: '了解触发后的行为',
        body: '达到每日最大亏损后，会停止开新仓。',
        expectedResult: '达到上限后当天不再生成新的开仓方案。',
      },
      {
        id: 's5',
        title: '按需开启新闻过滤',
        body: '新闻过滤会在重大数据发布前后暂停交易，帮助规避数据行情带来的剧烈波动。',
      },
      {
        id: 's6',
        title: '按需开启风控审核师',
        body: '开启后，每次开仓前会由风控审核师再做一次把关。',
        callout: { type: 'tip', text: '这些设置的作用是给账户多加一层边界，不改变行情本身的风险。' },
      },
    ],
    commonProblems: [
      {
        question: '限制触发后，已有持仓会怎样？',
        answer:
          '这一点必须以产品当前版本的官方说明为准。本教程不对此做推断。相关信息请向产品团队确认后再作为操作依据。',
      },
      {
        question: '每日额度什么时候重置？',
        answer: '重置时间与计算口径请以产品当前版本说明为准，建议先用模拟账户验证一次完整周期。',
      },
    ],
    related: ['why-ai-rejects-trade', 'how-to-monitor-positions', 'how-to-set-trading-params'],
  },
  {
    id: '14-prompt-templates',
    slug: 'how-to-train-ai-with-your-style',
    title: '怎么让 AI 按你的交易习惯来分析？',
    shortAnswer:
      '牛牛 AI 的分析、风控和监控三段提示词都可以自己改。先选好多周期方案，再到对应提示词里补充你的要求，保存后就会按新提示词分析，结果会直接用在新一轮决策里。',
    track: 'custom-ai',
    order: 13,
    difficulty: '进阶',
    readingMinutes: 4,
    tags: ['提示词', '自定义', '分析偏好'],
    video: {
      src: '/videos/tutorials/14-prompt-templates.mp4',
      poster: '/videos/tutorials/covers/14-prompt-templates.jpg',
      durationSeconds: 26,
    },
    intro: '把「你平时怎么看盘」写成明确规则，是让 AI 输出更贴近你方法的最直接方式。',
    steps: [
      {
        id: 's1',
        title: '了解三段提示词的分工',
        body: '分析、风控和监控各有一段提示词，分别影响对应环节。',
        callout: { type: 'info', text: '改哪个环节，就改哪一段，不必全部重写。' },
      },
      {
        id: 's2',
        title: '先选好多周期方案',
        body: '确定 AI 需要同时参考的周期组合。',
      },
      {
        id: 's3',
        title: '在对应提示词里补充你的要求',
        body: '写清你关注的指标、判断条件，以及你不希望出现的行为。',
        callout: { type: 'tip', text: '规则写得越具体、越可执行，结果越稳定。避免写成模糊的期望。' },
      },
      {
        id: 's4',
        title: '保存并生效',
        body: '改完保存，后续分析会使用新提示词。',
        expectedResult: '下一轮分析结果体现你新增的要求。',
      },
    ],
    commonProblems: [
      {
        question: '提示词写得越长越好吗？',
        answer: '不是。互相冲突或过于笼统的要求会削弱效果，建议先写少量明确规则，观察效果后再逐步补充。',
      },
      {
        question: '不想自己写怎么办？',
        answer: '可以先了解《怎么把你的分析风格复制给 AI？》，用克隆分析师根据你的习惯生成提示词初稿。',
      },
    ],
    related: ['how-to-clone-analysis-style', 'how-execution-threshold-works', 'how-to-analyze-screenshot'],
  },
  {
    id: '15-ai-logs-review',
    slug: 'how-to-review-trades',
    title: '一笔交易为什么发生，怎么从 AI 日志里看出来？',
    shortAnswer:
      '每次分析 AI 都会记进 AI 日志。日志里能看到每一次的判断结果，包括持有还是卖出以及对应的数值，还会写明这样判断的理由，复盘时可以对照行情回看。',
    track: 'review',
    order: 14,
    difficulty: '进阶',
    readingMinutes: 3,
    tags: ['复盘', 'AI 日志', '记录'],
    video: {
      src: '/videos/tutorials/15-ai-logs-review.mp4',
      poster: '/videos/tutorials/covers/15-ai-logs-review.jpg',
      durationSeconds: 24,
    },
    intro: '复盘的价值在于把「当时为什么这么判断」留存下来。没有记录，经验很难沉淀。',
    steps: [
      {
        id: 's1',
        title: '打开 AI 日志',
        body: '每次分析都会记录在这里。',
      },
      {
        id: 's2',
        title: '查看判断结果',
        body: '日志中能看到每一次的判断结论，例如持有还是卖出，以及对应的数值。',
      },
      {
        id: 's3',
        title: '阅读判断理由',
        body: '每条记录都写明这样判断的理由，这是复盘的核心信息。',
        callout: { type: 'tip', text: '重点看理由，而不是只看结论对错。' },
      },
      {
        id: 's4',
        title: '对照行情回看',
        body: '把日志与当时的行情放在一起看，检查判断依据是否成立。',
        expectedResult: '能定位到某笔交易的完整决策链路。',
      },
    ],
    commonProblems: [
      {
        question: '日志能保存多久？',
        answer: '关于记录保留时长与导出方式，请以产品当前版本说明为准。建议重要复盘及时整理到自己的记录中。',
      },
    ],
    related: ['why-ai-rejects-trade', 'how-to-monitor-positions', 'how-to-train-ai-with-your-style'],
  },
  {
    id: '16-mt5-troubleshooting',
    slug: 'how-to-fix-mt5-connection',
    title: 'MT5 连不上牛牛 AI，应该先检查什么？',
    shortAnswer:
      '先在控制台检查实例绑定，再打开 MT5 进入「工具」菜单找到「算法交易」这一项，确认它处于允许状态。设置完成后回到牛牛 AI 控制台，看到「已连接」说明绑定正常。',
    track: 'troubleshooting',
    order: 15,
    difficulty: '进阶',
    readingMinutes: 4,
    tags: ['MT5', '排错', '算法交易', '未连接'],
    video: {
      src: '/videos/tutorials/16-mt5-troubleshooting.mp4',
      poster: '/videos/tutorials/covers/16-mt5-troubleshooting.jpg',
      durationSeconds: 26,
    },
    intro: '绝大多数「连不上」都能靠固定顺序排查出来。先绑定，再检查 MT5 侧设置，最后回到控制台确认。',
    steps: [
      {
        id: 's1',
        title: '在控制台检查实例绑定',
        body: '如果 MT5 显示未连接，先回到牛牛 AI 控制台确认实例绑定状态。',
        callout: { type: 'info', text: '先排除绑定本身的问题，再去查 MT5 侧设置。' },
      },
      {
        id: 's2',
        title: '打开 MT5 的「工具」菜单',
        body: '进入 MT5，点开顶部「工具」菜单。',
      },
      {
        id: 's3',
        title: '找到「算法交易」这一项',
        body: '在工具菜单中找到算法交易设置入口。',
      },
      {
        id: 's4',
        title: '确认算法交易处于允许状态',
        body: '检查该项是否被设为允许。未允许时会直接影响连接与执行。',
        expectedResult: '算法交易显示为允许状态。',
      },
      {
        id: 's5',
        title: '回到控制台确认已连接',
        body: '设置完成后返回牛牛 AI 控制台查看状态。',
        expectedResult: '控制台显示「已连接」，说明绑定正常。',
      },
    ],
    commonProblems: [
      {
        question: '都检查过了还是连不上？',
        answer:
          '请按顺序确认：MT5 是否处于登录状态、行情是否正常刷新、实例是否选对、算法交易是否允许。若仍无法解决，联系客服并提供你的环境信息。',
      },
      {
        question: '换了一台电脑要重新绑定吗？',
        answer: '在新环境下需要重新选择并绑定对应的 MT5 实例。',
      },
    ],
    related: ['how-to-connect-mt5', 'what-is-niuqi-credit', 'why-ai-rejects-trade'],
  },
  {
    id: '17-account-niuqi-intro',
    slug: 'what-is-niuqi-credit',
    title: '牛气值是什么？一次 AI 分析会怎么扣？',
    shortAnswer:
      '牛气值是平台内的计费单位，用于衡量 AI 调用量。每次自动分析都会记录一次扣费，充值与扣费明细都能在账户页面查看；余额不足时可以在账户页面充值。',
    track: 'troubleshooting',
    order: 16,
    difficulty: '入门',
    readingMinutes: 3,
    tags: ['牛气值', '计费', '账户'],
    video: {
      src: '/videos/tutorials/17-account-niuqi-intro.mp4',
      poster: '/videos/tutorials/covers/17-account-niuqi-intro.jpg',
      durationSeconds: 24,
    },
    intro: '理解计费方式，才能合理控制分析频率。分析间隔越短，消耗越快。',
    steps: [
      {
        id: 's1',
        title: '打开账户页面',
        body: '这里能看到当前用户信息与会员状态。',
      },
      {
        id: 's2',
        title: '查看会员剩余天数',
        body: '会员剩余天数显示在账户页面，方便你掌握有效期。',
      },
      {
        id: 's3',
        title: '查看充值与扣费明细',
        body: '明细区记录每一次充值与消耗。',
        expectedResult: '能看到每次分析对应的扣费记录。',
      },
      {
        id: 's4',
        title: '了解扣费触发时机',
        body: '每次自动分析都会记录一次扣费。',
        callout: { type: 'tip', text: '想控制消耗，可以先拉长分析间隔，或在不看盘时暂停分析。' },
      },
      {
        id: 's5',
        title: '余额不足时充值',
        body: '余额不足时，可以在账户页面完成充值。',
      },
    ],
    commonProblems: [
      {
        question: '牛气值和套餐是什么关系？',
        answer: '牛气值随套餐发放，用于 AI 分析与相关功能调用。具体额度与折算规则以购买页与账户页面显示为准。',
      },
      {
        question: '暂停分析还会扣费吗？',
        answer: '暂停期间不再按间隔发起新的分析，也就不会产生对应的分析扣费。',
      },
    ],
    related: ['how-to-start-auto-trading', 'how-to-monitor-positions', 'how-to-fix-mt5-connection'],
  },
  {
    id: '18-clone-analyst',
    slug: 'how-to-clone-analysis-style',
    title: '怎么把你的分析风格复制给 AI？',
    shortAnswer:
      '使用克隆分析师，先选好要用的分析周期，再选择生成类型（激进型或保守型都可以），还可以补充要求，例如加入 MACD 等指标。生成后保存到提示词，就能直接使用。',
    track: 'custom-ai',
    order: 17,
    difficulty: '高级',
    readingMinutes: 4,
    tags: ['克隆分析师', '提示词', '风格'],
    video: {
      src: '/videos/tutorials/18-clone-analyst.mp4',
      poster: '/videos/tutorials/covers/18-clone-analyst.jpg',
      durationSeconds: 26,
    },
    intro: '克隆分析师的作用是把「你常看的周期 、指标和判断条件」整理成一份可复用的提示词方案。',
    steps: [
      {
        id: 's1',
        title: '选择分析周期',
        body: '先确定要使用的分析周期组合。',
      },
      {
        id: 's2',
        title: '选择生成类型',
        body: '可以在激进型与保守型之间选择，两者对应不同的出手倾向。',
        callout: { type: 'info', text: '类型只影响风格倾向，不改变你在风控里设定的边界。' },
      },
      {
        id: 's3',
        title: '补充你的具体要求',
        body: '例如加入 MACD 等指标，或写明你不希望出现的操作。',
        callout: { type: 'tip', text: '把「不做什么」也写清楚，往往比只写「要做什么」更有效。' },
      },
      {
        id: 's4',
        title: '生成并保存到提示词',
        body: '生成后保存，即可在后续分析中直接使用。',
        expectedResult: '提示词列表中出现新生成的方案，下一轮分析按它执行。',
      },
    ],
    commonProblems: [
      {
        question: '生成后还能改吗？',
        answer: '可以。保存到提示词后仍然可以继续编辑，参考《怎么让 AI 按你的交易习惯来分析？》。',
      },
      {
        question: '克隆的分析师会保证收益吗？',
        answer: '不会。克隆分析师只是让输出更贴近你的分析方法，不构成任何收益承诺，交易风险仍由你自己承担。',
      },
    ],
    related: ['how-to-train-ai-with-your-style', 'how-execution-threshold-works', 'how-to-review-trades'],
  },
  {
    id: 'workflow-overview',
    slug: 'what-is-the-full-workflow',
    title: '牛牛 AI 的完整交易流程是怎样的？',
    shortAnswer:
      '牛牛 AI 把行情分析、风险审核、用户确认、交易执行、持仓诊断和 AI 日志复盘串在同一条流程里。每个环节各司其职，最终是否执行由你确认。',
    track: 'getting-started',
    order: 18,
    difficulty: '入门',
    readingMinutes: 5,
    tags: ['工作流', '流程', '总览'],
    intro: '先理解整条链路，再看单点功能会更容易上手。下面是一次完整的流程。',
    steps: [
      {
        id: 's1',
        title: '行情分析',
        body: 'AI 读取你关注的品种与周期，结合指标给出结构化判断。',
      },
      {
        id: 's2',
        title: '风险审核',
        body: '分析结论不会直接执行，而是先经过风控审核，检查是否符合你设定的风险规则。',
        callout: { type: 'info', text: '审核可以拦下不符合条件的交易，这就是「有时不开仓」的原因。' },
      },
      {
        id: 's3',
        title: '用户确认',
        body: '通过审核的方案会呈现给你，由你决定是否执行。',
        callout: { type: 'important', text: '这是流程中由你掌握的一步。AI 不替你承担交易结果。' },
      },
      {
        id: 's4',
        title: '交易执行',
        body: '确认后的挂单同步到 MT5 提交。',
      },
      {
        id: 's5',
        title: '持仓诊断',
        body: '开仓后持续监控持仓状态，关注风险变化。',
      },
      {
        id: 's6',
        title: 'AI 日志与复盘',
        body: '每一次分析都会记录在日志中，包含判断结论与理由，便于事后复盘。',
        expectedResult: '你能在日志里回看任意一次决策的完整依据。',
      },
    ],
    commonProblems: [
      {
        question: '这些环节都是必须的吗？',
        answer:
          '风险审核、持仓诊断等是否参与流程，与你在设置中的选择有关。建议新手保留全部环节，先理解每一步在做什么。',
      },
      {
        question: 'AI 会自动替我下单吗？',
        answer: '流程中保留了用户确认环节。牛牛 AI 不承诺收益，交易决策与风险由你自己承担。',
      },
    ],
    related: ['how-to-connect-mt5', 'how-to-start-auto-trading', 'why-ai-rejects-trade'],
  },
  {
    id: 'multi-symbol-analysis',
    slug: 'how-to-analyze-multiple-symbols',
    title: '怎么用一套流程同时分析多个品种？',
    shortAnswer:
      '选择多个品种后，AI 会依次对每个品种执行分析流程，结果分别展示互不干扰。参数、提示词和风控规则可以跨品种统一配置，也可以针对特定品种单独调整。',
    track: 'analysis',
    order: 19,
    difficulty: '进阶',
    readingMinutes: 4,
    tags: ['多品种', '批量分析', '效率'],
    intro: '多品种分析解决的是「逐个重复操作太慢」。适合同时跟踪多个市场的使用者。',
    prerequisites: ['已完成 MT5 绑定', '已明确自己的分析周期与提示词'],
    steps: [
      {
        id: 's1',
        title: '选择要分析的品种',
        body: '一次选择多个品种，AI 会依次对每个品种执行分析。',
      },
      {
        id: 's2',
        title: '确认统一配置',
        body: '分析参数、提示词和风控规则可以跨品种统一，避免逐个调整。',
        callout: { type: 'tip', text: '建议先在一个品种上跑通，再把配置复制到其他品种。' },
      },
      {
        id: 's3',
        title: '按需针对单个品种调整',
        body: '不同品种的波动特性不同，必要时单独微调该品种的参数。',
      },
      {
        id: 's4',
        title: '对比分析结果',
        body: '分析完成后对比各品种的结论，识别机会与风险。',
        expectedResult: '每个品种都有独立结果，互不覆盖。',
        callout: { type: 'warning', text: '品种越多，同时暴露的风险敞口越大。请先确认整体风险边界再扩大范围。' },
      },
    ],
    commonProblems: [
      {
        question: '多品种会更快消耗牛气值吗？',
        answer: '会。分析次数增加，对应的调用量与消耗也相应增加，建议按实际需要选择品种数量。',
      },
    ],
    related: ['how-to-train-ai-with-your-style', 'how-to-choose-among-plans', 'how-to-set-daily-loss-limit'],
  },
  {
    id: 'order-history-review',
    slug: 'how-to-learn-from-order-history',
    title: '怎么从历史订单里提炼自己的交易逻辑？',
    shortAnswer:
      '把历史订单和当时的 AI 分析、审核结论放在一起回看，找出反复出现的行为模式，再把有效的判断条件写进提示词，形成属于你的交易规则。',
    track: 'review',
    order: 20,
    difficulty: '高级',
    readingMinutes: 4,
    tags: ['历史订单', '复盘', '逻辑提炼'],
    intro: '单笔盈亏说明不了太多，反复出现的行为模式才是可沉淀的部分。',
    steps: [
      {
        id: 's1',
        title: '整理历史订单',
        body: '按时间顺序查看订单记录，标注出你认为「做对了」和「做错了」的几笔。',
      },
      {
        id: 's2',
        title: '找出共同点',
        body: '对比这些订单的入场时机、周期与市场状态，找出共同特征。',
        callout: { type: 'tip', text: '重点找「重复出现的条件」，而不是单次结果。' },
      },
      {
        id: 's3',
        title: '回到 AI 日志核对依据',
        body: '用 AI 日志核对当时的判断理由，确认是规则有效还是运气成分。',
        expectedResult: '能说清某类订单背后的判断依据。',
      },
      {
        id: 's4',
        title: '写进提示词',
        body: '把验证过的条件整理为明确规则，补充到分析提示词中。',
        callout: { type: 'important', text: '不要用少数订单的盈亏结论反推规则。样本太少时，结论不具备参考价值。' },
      },
    ],
    commonProblems: [
      {
        question: '多久复盘一次比较合适？',
        answer: '建议固定频率，例如每周一次。频率过高容易陷入对单笔结果的过度解读。',
      },
    ],
    related: ['how-to-review-trades', 'how-to-train-ai-with-your-style', 'how-execution-threshold-works'],
  },
  {
    id: 'payment-no-license',
    slug: 'how-to-get-license-after-payment',
    title: '支付成功后没收到授权码，怎么办？',
    shortAnswer:
      '先确认订单状态。常见原因是支付回调延迟，等待 1–2 分钟后刷新即可；如果页面提示「待发码」，通常是卡密库存不足，需要联系客服补货后手动发货。',
    track: 'troubleshooting',
    order: 21,
    difficulty: '入门',
    readingMinutes: 2,
    tags: ['支付', '授权码', '订单'],
    intro: '支付与发码是两个环节，付款成功不等于授权码已立即发出。按下面的顺序排查最快。',
    steps: [
      {
        id: 's1',
        title: '先查看订单状态',
        body: '回到订单或支付结果页，确认当前状态是「已支付」还是「待发码」。',
        callout: { type: 'info', text: '支付结果页支持免登录查询，可以直接用订单信息核对。' },
      },
      {
        id: 's2',
        title: '判断是否为回调延迟',
        body: '支付回调偶尔会延迟，系统尚未处理完成。',
        expectedResult: '等待 1–2 分钟后刷新页面，订单状态更新为已发货。',
      },
      {
        id: 's3',
        title: '检查是否为库存不足',
        body: '如果状态长时间停留在「待发码」，可能是该套餐的卡密库存已用完。',
        callout: { type: 'warning', text: '这种情况无法自动发货，需要联系客服补货后手动发码。' },
      },
      {
        id: 's4',
        title: '联系客服处理',
        body: '准备好订单号与支付凭证，联系客服核对。',
      },
    ],
    commonProblems: [
      {
        question: '支付金额和订单金额不一致会怎样？',
        answer: '实际支付金额与订单金额不一致时，系统会拦截该订单，需要联系客服人工核对处理。',
      },
    ],
    related: ['what-is-niuqi-credit', 'how-to-fix-mt5-connection', 'how-to-connect-mt5'],
  },
]
