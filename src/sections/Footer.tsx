const policyLinks = ['隐私政策', '用户协议', '风险揭示', '售后政策', '版本状态']

export default function Footer() {
  return (
    <footer className="border-t border-[#16203a] bg-[#05080f]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <img src="assets/logo.png" alt="牛牛AI Logo" className="h-10 w-auto" />
              <span className="font-display text-lg font-bold text-slate-100">
                牛牛<span className="text-orange-500">AI</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              连接 MT5 交易环境的 AI 交易辅助系统。把行情分析、风险审核、人工确认与交易复盘，组织在同一套工作流程中。
            </p>
          </div>

          <div>
            <div className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
              政策与协议
            </div>
            <ul className="mt-4 space-y-2.5">
              {policyLinks.map((p) => (
                <li key={p}>
                  <a href="#" className="text-sm text-slate-400 transition-colors hover:text-sky-300">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
              联系与客服
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>QQ 交流群：<span className="font-mono text-sky-300">1107805860</span></li>
              <li>服务时间：交易日 9:00 – 21:00</li>
              <li className="text-slate-600">当前版本 V1.0.1.0</li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
              产品
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li><a href="/#features" className="transition-colors hover:text-sky-300">核心能力</a></li>
              <li><a href="/#workflow" className="transition-colors hover:text-sky-300">工作流程</a></li>
              <li><a href="/#screens" className="transition-colors hover:text-sky-300">真实界面</a></li>
              <li><a href="/pricing" className="transition-colors hover:text-sky-300">价格与订阅</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#141d33] pt-6">
          <p className="text-xs leading-relaxed text-slate-600">
            风险揭示：牛牛AI 是交易流程辅助工具，不构成投资建议，不承诺任何收益。金融市场存在风险，
            历史表现不代表未来结果，你可能损失部分或全部本金。AI 输出仅供辅助参考，
            所有交易决策与后果由用户自行承担。请在充分了解产品功能与风险后理性使用。
          </p>
          <p className="mt-4 text-xs text-slate-700">
            © 2026 牛牛AI · 本页面为产品介绍草稿，功能与界面以正式版本为准
          </p>
        </div>
      </div>
    </footer>
  )
}
