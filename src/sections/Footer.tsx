import { Link } from 'react-router'

const cols = [
  {
    title: '产品',
    items: [
      { label: '产品功能', to: '/product' },
      { label: '工作流程', to: '/#workflow' },
      { label: '演示视频', to: '/demo' },
      { label: '价格方案', to: '/pricing' },
    ],
  },
  {
    title: '支持',
    items: [
      { label: '使用指南', to: '/support' },
      { label: '客服中心', to: '/support' },
      { label: '使用社群', to: '/support#community' },
      { label: '产品反馈', to: '/support#feedback' },
    ],
  },
  {
    title: '法律',
    items: [
      { label: '用户协议', to: '/support' },
      { label: '隐私政策', to: '/support' },
      { label: '风险揭示', to: '/support' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e6e0] bg-[#faf9f6]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/assets/logo.png" alt="牛牛AI" className="h-9 w-auto" />
              <span className="font-display text-lg font-bold text-[#14171f]">
                牛牛<span className="text-[#ff6a1a]">AI</span>
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-[#3f4756]">让你的交易更智能</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#8a8f9c]">
              连接你的 MT5，让 AI 帮你分析行情、复核风险，做出智能决策。
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="micro-label text-[#b0a89c]">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((i) => (
                  <li key={i.label}>
                    {i.to.startsWith('/#') || i.to.includes('#') ? (
                      <a href={i.to} className="text-sm text-[#6b7280] transition-colors hover:text-[#14171f]">
                        {i.label}
                      </a>
                    ) : (
                      <Link to={i.to} className="text-sm text-[#6b7280] transition-colors hover:text-[#14171f]">
                        {i.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-[#e8e6e0] pt-6 text-xs text-[#9aa0ad] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 牛牛AI</span>
          <span>AI 分析仅供辅助参考，不构成投资建议。交易决策与风险由用户自行承担。</span>
        </div>
      </div>
    </footer>
  )
}
