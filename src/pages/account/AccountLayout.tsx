import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import { useAuth } from '../../hooks/useAuth'

const SIDEBAR_ITEMS = [
  { to: '/account', label: '总览', icon: '⊞', end: true },
  { to: '/account/subscription', label: '我的订阅', icon: '◈' },
  { to: '/account/orders', label: '购买记录', icon: '☰' },
  { to: '/account/credits', label: '牛气值', icon: '✦' },
  { to: '/account/referral', label: '推广中心', icon: '↗' },
  { to: '/account/commissions', label: '返佣记录', icon: '¥' },
  { to: '/account/settings', label: '账户设置', icon: '⚙' },
]

export default function AccountLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] text-[#9ca3af]">
        加载中…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />
      <div className="mx-auto max-w-[1280px] px-6 pt-24 pb-16 sm:px-10 sm:pt-28">
        {/* Mobile Header */}
        <div className="mb-4 flex items-center justify-between sm:hidden">
          <h1 className="font-display text-lg font-bold">
            {SIDEBAR_ITEMS.find((i) => i.to === location.pathname || (i.end && location.pathname === '/account'))?.label || '账户'}
          </h1>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm"
          >
            {mobileOpen ? '关闭' : '菜单'}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-44 shrink-0 sm:block">
            <nav className="sticky top-28 space-y-1">
              {SIDEBAR_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#f97316]/10 font-semibold text-[#f97316]'
                        : 'text-[#6b7280] hover:bg-[#f5f5f3] hover:text-[#111111]'
                    }`
                  }
                >
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              <hr className="my-3 border-[#e5e7eb]" />
              <button
                onClick={() => { logout(); navigate('/') }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-[#9ca3af] transition-colors hover:bg-[#f5f5f3] hover:text-[#111111]"
              >
                <span className="text-xs">↩</span>
                退出登录
              </button>
            </nav>
          </aside>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50 bg-black/30 sm:hidden" onClick={() => setMobileOpen(false)}>
              <div className="w-64 bg-white p-5 pt-20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <nav className="space-y-1">
                  {SIDEBAR_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-[#f97316]/10 font-semibold text-[#f97316]'
                            : 'text-[#6b7280] hover:bg-[#f5f5f3]'
                        }`
                      }
                    >
                      <span className="text-xs">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                  <hr className="my-3 border-[#e5e7eb]" />
                  <button
                    onClick={() => { logout(); navigate('/') }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm text-[#9ca3af]"
                  >
                    <span className="text-xs">↩</span>
                    退出登录
                  </button>
                </nav>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}