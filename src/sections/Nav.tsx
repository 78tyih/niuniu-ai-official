import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const links = [
  { href: '/#features', label: '核心能力' },
  { href: '/#workflow', label: '工作流程' },
  { href: '/#screens', label: '真实界面' },
  { href: '/#faq', label: '常见问题' },
  { href: '/#risk', label: '风险说明' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goAnchor = (href: string) => (e: MouseEvent) => {
    if (isHome) {
      e.preventDefault()
      const id = href.replace('/#', '')
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'border-b border-[#1b2740]/80 bg-[#070c18]/85 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="assets/logo.png"
            alt="牛牛AI Logo"
            className="h-9 w-auto drop-shadow-[0_2px_10px_rgba(56,189,248,0.25)]"
          />
          <span className="font-display text-lg font-bold tracking-wide text-slate-100">
            牛牛<span className="text-orange-500">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={goAnchor(l.href)}
              className="text-sm text-slate-400 transition-colors hover:text-sky-300"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/pricing"
            className={`text-sm transition-colors ${
              location.pathname === '/pricing' ? 'text-sky-300' : 'text-slate-400 hover:text-sky-300'
            }`}
          >
            价格
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/account')}
              className="rounded-lg border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-300 transition-all hover:bg-sky-400/20"
            >
              我的订阅
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-[#2a3a5c] px-4 py-2 text-sm text-slate-300 transition-all hover:border-sky-400/50 hover:text-sky-300"
            >
              登录
            </Link>
          )}
          <Link
            to="/pricing"
            className="hidden rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_20px_-6px_rgba(249,115,22,0.6)] transition-all hover:bg-orange-400 sm:inline-block"
          >
            立即订阅
          </Link>
        </div>
      </div>
    </header>
  )
}
