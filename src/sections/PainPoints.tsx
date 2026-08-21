import SectionHead from '../components/SectionHead'

const pains = [
  {
    title: '信息分散',
    desc: 'K线、指标、周期、规则和持仓状态散落在不同位置，分析依据难以统一。',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    ),
    fix: '牛牛AI 把行情、指标和你的规则组织成同一份分析输入',
  },
  {
    title: '决策过快',
    desc: '看到机会后直接行动，缺少独立的风险审核和再次确认。',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    fix: '把「看到机会」和「是否执行」拆成分析、审核两层',
  },
  {
    title: '复盘断层',
    desc: '只看盈亏结果，难以回看当时的分析、审核和决策过程。',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    ),
    fix: 'AI 日志关联历史订单，让每一次决策可回看',
  },
]

export default function PainPoints() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="为什么需要它"
          title={
            <>
              交易的问题，往往不只在
              <span className="text-gradient-cyan">「看不懂行情」</span>
            </>
          }
          desc="更多时候，问题出在流程：信息、决策和复盘各自断裂。"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pains.map((p, i) => (
            <div
              key={p.title}
              className="reveal card-line group relative overflow-hidden rounded-2xl p-7 transition-colors hover:border-sky-400/40"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-sky-500/6 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-400/10 text-sky-300">
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  {p.icon}
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-100">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{p.desc}</p>
              <div className="mt-5 border-t border-[#1b2740] pt-4 text-sm text-sky-300/90">
                → {p.fix}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
