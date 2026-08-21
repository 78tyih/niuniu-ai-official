export default function Hero() {
  return (
    <section id="top" className="bg-grid relative overflow-hidden pt-16">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-40 -left-40 h-[400px] w-[400px] rounded-full bg-sky-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute top-64 -right-32 h-[360px] w-[360px] rounded-full bg-orange-500/6 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-20 sm:px-8 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          {/* copy */}
          <div className="reveal">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-400/25 bg-sky-400/8 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-sky-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
              </span>
              AI TRADING COPILOT FOR MT5
            </div>

            <h1 className="font-display mt-7 text-4xl leading-[1.15] font-bold text-slate-50 sm:text-5xl lg:text-[3.4rem]">
              让你的交易流程，
              <br />
              拥有一个{' '}
              <span className="text-gradient-cyan">AI 助手</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              连接<span className="text-slate-200">你自己的 MT5 环境</span>
              ，把行情分析、风险审核、人工确认与交易复盘，
              组织在同一套工作流程中。
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#cta"
                className="group inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-[0_8px_30px_-8px_rgba(249,115,22,0.7)] transition-all hover:bg-orange-400"
              >
                查看产品演示
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 6l6 6-6 6M5 12h14" />
                </svg>
              </a>
              <a
                href="#cta"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600/70 px-7 py-3.5 text-base font-medium text-slate-200 transition-all hover:border-sky-400/60 hover:text-sky-300"
              >
                检测我的 MT5 是否兼容
              </a>
            </div>

            <p className="mt-7 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              AI 分析仅供辅助参考，不承诺收益；交易决策与风险由用户自行承担。
            </p>
          </div>

          {/* visual: real screenshot in a browser frame */}
          <div className="reveal relative" style={{ transitionDelay: '120ms' }}>
            <div className="glow-cyan relative rounded-2xl border border-[#1e2c48] bg-[#0a1120] shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-[#1b2740] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2a3a5c]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#2a3a5c]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#2a3a5c]" />
                <span className="ml-3 rounded-md bg-[#111c33] px-3 py-1 text-[11px] text-slate-500">
                  牛牛AI · 实时面板
                </span>
              </div>
              <img
                src="assets/image2.png"
                alt="牛牛AI 实时面板：智能K线、周期分析与一键布局"
                className="w-full rounded-b-2xl"
                loading="eager"
              />
            </div>

            {/* floating tags */}
            <div className="absolute -bottom-5 -left-4 rounded-xl border border-[#1e2c48] bg-[#0c1426]/95 px-4 py-3 shadow-xl backdrop-blur sm:-left-8">
              <div className="text-[11px] tracking-wide text-slate-500">工作流</div>
              <div className="mt-0.5 text-sm font-semibold text-sky-300">
                分析 → 审核 → 确认 → 复盘
              </div>
            </div>
            <div className="absolute -top-5 -right-3 rounded-xl border border-[#1e2c48] bg-[#0c1426]/95 px-4 py-3 shadow-xl backdrop-blur sm:-right-6">
              <div className="text-[11px] tracking-wide text-slate-500">行情来源</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-200">
                你自己的 MT5 账户
              </div>
            </div>
          </div>
        </div>

        {/* bottom strip */}
        <div className="reveal mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#1b2740] bg-[#1b2740] sm:grid-cols-4">
          {[
            ['三层 AI 工作流', '分析 / 审核 / 诊断各司其职'],
            ['连接自己的 MT5', '行情来自你的经纪商环境'],
            ['人工确认环节', '最终决策始终在你手里'],
            ['日志与复盘', '每一步可回看、可追溯'],
          ].map(([t, d]) => (
            <div key={t} className="bg-[#0a1120] px-6 py-5">
              <div className="text-sm font-semibold text-slate-200">{t}</div>
              <div className="mt-1 text-xs text-slate-500">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
