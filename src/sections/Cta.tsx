const secondary = [
  ['阅读客户产品手册', '#'],
  ['查看详细 FAQ', '#faq'],
  ['了解数据与隐私', '#'],
]

export default function Cta() {
  return (
    <section id="cta" className="relative scroll-mt-16 overflow-hidden py-24 sm:py-32">
      <div className="bg-grid absolute inset-0" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[130px]" />

      <div className="reveal relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <img
          src="assets/logo.png"
          alt="牛牛AI"
          className="mx-auto h-24 w-auto drop-shadow-[0_8px_30px_rgba(56,189,248,0.3)]"
        />
        <h2 className="font-display mt-8 text-3xl font-bold text-slate-50 sm:text-4xl">
          下一步：用 3 分钟，
          <span className="text-gradient-orange">看看它怎么工作</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400">
          推荐路径：观看产品演示 → 检测 MT5 兼容性 → 阅读风险说明 →
          申请体验或咨询。不按头推销，不制造紧迫感。
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:demo@example.com?subject=预约牛牛AI产品演示"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_-8px_rgba(249,115,22,0.7)] transition-all hover:bg-orange-400"
          >
            预约产品演示
          </a>
          <a
            href="mailto:demo@example.com?subject=检测MT5兼容性"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600/70 px-8 py-4 text-base font-medium text-slate-200 transition-all hover:border-sky-400/60 hover:text-sky-300"
          >
            检测我的 MT5 是否兼容
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {secondary.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm text-slate-500 underline decoration-slate-700 underline-offset-4 transition-colors hover:text-sky-300"
            >
              {label}
            </a>
          ))}
        </div>

        <p className="mt-10 text-xs leading-relaxed text-slate-600">
          提交咨询即表示你已阅读并理解风险说明。AI 分析仅供辅助参考，不承诺收益。
        </p>
      </div>
    </section>
  )
}
