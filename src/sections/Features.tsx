import SectionHead from '../components/SectionHead'

const layers = [
  {
    tag: 'AI-1',
    name: '行情分析助手',
    question: '当前市场处于什么状态？',
    points: ['趋势与市场状态判断', '关键位置与多周期信息', '分析理由、假设与风险提示'],
    color: 'sky',
  },
  {
    tag: 'AI-2',
    name: '风险审核助手',
    question: '这个分析符合我的交易条件和风险规则吗？',
    points: ['独立检查交易条件', '识别不满足规则或风险过高的方案', '给出通过 / 拒绝 / 需补充的理由'],
    color: 'orange',
  },
  {
    tag: 'AI-3',
    name: '持仓诊断助手',
    question: '市场变化后，当前持仓条件还成立吗？',
    points: ['观察持仓状态与市场变化', '提示风险变化与待检查事项', '为复盘保留过程记录'],
    color: 'sky',
  },
]

const modules = [
  ['MT5 连接与实例管理', '绑定并检查自己的 MT5 客户端路径'],
  ['实时面板 · 智能K线', '账户状态、周期分析、持仓与一键布局入口'],
  ['AI 分析', '图表分析、连续追问、报告导出'],
  ['一键布局', '选择方案、调整价格与手数并提交校验'],
  ['风控设置', '每日风控、止损止盈追踪、周期风控'],
  ['过滤设置', '新闻过滤与交易时段过滤'],
  ['克隆分析师', '把你的指标、周期与风格整理成三类提示词'],
  ['历史订单逻辑提炼', '从授权的历史订单中梳理进出场特征'],
  ['AI 日志与复盘', '每个环节的继续、跳过、拒绝都有据可查'],
]

export default function Features() {
  return (
    <section id="features" className="relative scroll-mt-16 py-24 sm:py-28">
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="核心能力"
          title={
            <>
              三层 AI 工作流，
              <span className="text-gradient-cyan">各司其职</span>
            </>
          }
          desc="分析、审核与诊断是三个独立环节——AI 负责把每一步做清楚，最终决策始终由你确认。"
        />

        {/* three AI layers */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {layers.map((l, i) => (
            <div
              key={l.tag}
              className="reveal card-line relative overflow-hidden rounded-2xl p-7 transition-colors hover:border-sky-400/40"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wider ${
                    l.color === 'orange'
                      ? 'bg-orange-500/15 text-orange-400'
                      : 'bg-sky-400/12 text-sky-300'
                  }`}
                >
                  {l.tag}
                </span>
                <h3 className="text-lg font-bold text-slate-100">{l.name}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                「{l.question}」
              </p>
              <ul className="mt-4 space-y-2.5">
                {l.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {pt}
                  </li>
                ))}
              </ul>
              {i < layers.length - 1 && (
                <div className="absolute top-1/2 -right-4 hidden h-px w-8 bg-gradient-to-r from-sky-400/50 to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>

        {/* module grid */}
        <div className="reveal mt-16">
          <h3 className="text-center text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
            围绕工作流的完整功能模块
          </h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(([t, d], i) => (
              <div
                key={t}
                className="reveal group flex items-start gap-4 rounded-xl border border-[#16203a] bg-[#0a1120]/70 p-5 transition-all hover:border-sky-400/35 hover:bg-[#0c1528]"
                style={{ transitionDelay: `${(i % 3) * 70}ms` }}
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-sm bg-sky-400/70 transition-colors group-hover:bg-orange-400" />
                <div>
                  <div className="text-sm font-semibold text-slate-200">{t}</div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-500">{d}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-600">
            另提供可执行 EA 交易策略模块；EA 策略与三层 AI 工作流互斥，启用一方将暂停另一方。
          </p>
        </div>
      </div>
    </section>
  )
}
