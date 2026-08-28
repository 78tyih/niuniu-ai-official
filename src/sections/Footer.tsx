import { Link } from 'react-router'

const cols = [
  {
    title: '产品',
    items: [
      { label: '产品介绍', to: '/product' },
      { label: '工作流程', to: '/product' },
      { label: '产品演示', to: '/demo' },
      { label: '价格方案', to: '/pricing' },
    ],
  },
  {
    title: '支持',
    items: [
      { label: '常见问题', to: '/community#faq' },
      { label: '使用帮助', to: '/community' },
      { label: '联系客服', to: '/community#contact' },
    ],
  },
  {
    title: '社区',
    items: [
      { label: '用户社群', to: '/community#groups' },
      { label: '产品更新', to: '/community#updates' },
      { label: '用户反馈', to: '/community#feedback' },
    ],
  },
  {
    title: '关于',
    items: [
      { label: '用户协议', to: '/community' },
      { label: '隐私政策', to: '/community' },
      { label: '风险说明', to: '/community' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#0b1724] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16 sm:px-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/assets/logo.png" alt="牛牛AI" className="h-8 w-auto" />
              <span className="font-display text-[17px] font-bold">
                牛牛<span className="text-[#f97316]">AI</span>
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-white/80">你的 MT5 AI 交易副驾驶</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/45">
              连接你的 MT5，让 AI 帮你分析行情、检查风险，并记录每一次交易决策。
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold tracking-widest text-white/40 uppercase">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((i) => (
                  <li key={i.label}>
                    {i.to.includes('#') ? (
                      <a href={i.to} className="text-sm text-white/65 transition-colors hover:text-white">
                        {i.label}
                      </a>
                    ) : (
                      <Link to={i.to} className="text-sm text-white/65 transition-colors hover:text-white">
                        {i.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 牛牛AI</span>
          <span>AI 分析仅供辅助参考，不构成投资建议。交易决策与风险由用户自行承担。</span>
        </div>
      </div>
    </footer>
  )
}
