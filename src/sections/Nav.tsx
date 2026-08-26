import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const links = [
  { en: 'PRODUCT', zh: '产品', to: '/product' },
  { en: 'DEMO', zh: '演示', to: '/demo' },
  { en: 'WORKFLOW', zh: '工作流', to: '/#workflow' },
  { en: 'PRICING', zh: '价格', to: '/pricing' },
  { en: 'SUPPORT', zh: '支持', to: '/support' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkCls = (to: string) =>
    `group flex flex-col items-start transition-colors ${
      location.pathname === to ? 'text-[#14171f]' : 'text-[#6b7280] hover:text-[#14171f]'
    }`

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-[#e8e6e0] bg-[#faf9f6]/90 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/assets/logo.png" alt="牛牛AI Logo" className="h-9 w-auto" />
          <span className="font-display text-lg font-bold tracking-wide text-[#14171f]">
            牛牛<span className="text-[#ff6a1a]">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) =>
            l.to.startsWith('/#') ? (
              <a key={l.en} href={l.to} className={linkCls(l.to)}>
                <span className="micro-label text-[9px] text-[#b0a89c] group-hover:text-[#ff6a1a]">{l.en}</span>
                <span className="text-sm font-medium">{l.zh}</span>
              </a>
            ) : (
              <Link key={l.en} to={l.to} className={linkCls(l.to)}>
                <span className="micro-label text-[9px] text-[#b0a89c] group-hover:text-[#ff6a1a]">{l.en}</span>
                <span className="text-sm font-medium">{l.zh}</span>
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/account')}
              className="rounded-lg border border-[#e0ddd6] px-4 py-2 text-sm font-medium text-[#3f4756] transition-all hover:border-[#14171f]"
            >
              我的账户
            </button>
          ) : (
            <Link to="/login" className="px-3 py-2 text-sm font-medium text-[#3f4756] transition-colors hover:text-[#14171f]">
              登录
            </Link>
          )}
          <Link
            to="/demo"
            className="hidden rounded-lg bg-[#ff6a1a] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_20px_-6px_rgba(255,106,26,0.5)] transition-all hover:bg-[#f45d0d] sm:inline-block"
          >
            观看演示
          </Link>
        </div>
      </div>
    </header>
  )
}
