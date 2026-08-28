import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const links = [
  { zh: '产品', to: '/product' },
  { zh: '演示', to: '/demo' },
  { zh: '定价', to: '/pricing' },
  { zh: '社区', to: '/community' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur transition-all duration-300 ${
        scrolled ? 'border-b border-[#e5e7eb]' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/assets/logo.png" alt="牛牛AI Logo" className="h-8 w-auto" />
          <span className="font-display text-[17px] font-bold tracking-wide text-[#111111]">
            牛牛<span className="text-[#f97316]">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm transition-colors ${
                location.pathname === l.to ? 'font-semibold text-[#111111]' : 'text-[#6b7280] hover:text-[#111111]'
              }`}
            >
              {l.zh}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <button
              onClick={() => navigate('/account')}
              className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
            >
              我的账户
            </button>
          ) : (
            <Link to="/login" className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]">
              登录
            </Link>
          )}
          <Link
            to="/demo"
            className="rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#ea6a0c]"
          >
            开始体验
          </Link>
        </div>

        {/* 移动端菜单按钮 */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          <svg className="h-4 w-4 text-[#111]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* 移动端抽屉 */}
      {menuOpen && (
        <div className="border-t border-[#e5e7eb] bg-white px-6 py-4 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block py-2.5 text-sm font-medium text-[#111111]">
              {l.zh}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-4 border-t border-[#f3f4f6] pt-4">
            <Link to={user ? '/account' : '/login'} className="text-sm text-[#6b7280]">
              {user ? '我的账户' : '登录'}
            </Link>
            <Link to="/demo" className="rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-white">
              开始体验
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
