import SectionHead from '../components/SectionHead'

const trust = [
  {
    t: '数据来源透明',
    d: '行情来自你连接的 MT5 经纪商环境，不由牛牛AI 自行定价或提供。',
  },
  {
    t: '决策边界清晰',
    d: '分析、审核与你的确认是不同环节，AI 输出不代表未来市场结果。',
  },
  {
    t: '风险说明可见',
    d: 'AI 不会消除市场、模型、网络和执行风险，风险披露在页面固定可见。',
  },
  {
    t: '政策入口完整',
    d: '隐私政策、用户协议、风险揭示与售后政策在页脚集中提供。',
  },
]

const risks = [
  ['市场风险', '金融市场价格可能快速波动。任何分析、提示、评分或历史复盘均不代表未来表现，也不能排除亏损。'],
  ['AI 风险', 'AI 可能出现理解偏差、遗漏、过时信息或错误推理。你应核对输入、依据和账户状态。'],
  ['数据风险', '连接 MT5 和同步历史订单涉及账户与交易数据，请在使用前了解数据类型、用途与权限规则。'],
  ['执行风险', '网络、终端、经纪商接口、滑点、报价差异和系统故障都可能影响执行结果。'],
]

export default function Risk() {
  return (
    <section id="risk" className="relative scroll-mt-16 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="信任与风险"
          title={
            <>
              信任不靠口号，
              <span className="text-gradient-cyan">靠可核验的边界</span>
            </>
          }
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((c, i) => (
            <div
              key={c.t}
              className="reveal card-line rounded-2xl p-6"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/12 text-sky-300">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-100">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="reveal mt-10 overflow-hidden rounded-2xl border border-[#1b2740]">
          <div className="border-b border-[#1b2740] bg-[#0c1426] px-7 py-4">
            <span className="text-sm font-semibold text-slate-200">风险声明</span>
          </div>
          <div className="grid gap-px bg-[#1b2740] sm:grid-cols-2">
            {risks.map(([t, d]) => (
              <div key={t} className="bg-[#0a1120] p-7">
                <h4 className="text-sm font-semibold text-orange-400">{t}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{d}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1b2740] bg-[#080d1a] px-7 py-4">
            <p className="text-xs leading-relaxed text-slate-500">
              用户责任：使用自己理解并能承受的风险参数；保护账户与设备安全；检查每次交易信息并做出最终决定；遵守经纪商、平台和所在地区的规则。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
