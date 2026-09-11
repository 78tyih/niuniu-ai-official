import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import { ChevronRight, CreditCard, Gift, LayoutDashboard, LogOut, Menu, Sparkles, Users, X } from 'lucide-react'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import { useAuth } from '../../hooks/useAuth'

const SIDEBAR_ITEMS = [
  { to: '/account', label: '总览', description: '账户概况', icon: LayoutDashboard, end: true },
  { to: '/account/subscription', label: '订阅', description: '套餐与权益', icon: Sparkles },
  { to: '/account/orders', label: '订阅与权益', description: '订单、授权与套餐权益', icon: CreditCard },
  { to: '/account/referral', label: '推广与返佣', description: '邀请、结算与提现', icon: Users },
]

function isItemActive(pathname: string, item: (typeof SIDEBAR_ITEMS)[number]) {
  return item.end ? pathname === item.to : pathname.startsWith(item.to)
}

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
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f7f8fa] text-sm text-[#8a93a3]">
        正在载入账户空间…
      </div>
    )
  }

  const activeItem = SIDEBAR_ITEMS.find((item) => isItemActive(location.pathname, item)) || SIDEBAR_ITEMS[0]
  const displayName = user.name || user.email?.split('@')[0] || '用户'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigation = (mobile = false) => (
    <nav className={mobile ? 'space-y-1' : 'space-y-1.5'} aria-label="账户导航">
      <div className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0a8b6]">Workspace</div>
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                isActive
                  ? 'bg-[#14171f] text-white shadow-[0_8px_20px_-12px_rgba(20,23,31,0.65)]'
                  : 'text-[#697386] hover:bg-[#eef1f5] hover:text-[#14171f]'
              }`
            }
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-current/10">
              <Icon size={16} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-0.5 block text-[11px] opacity-65">{item.description}</span>
            </span>
            <ChevronRight size={14} className="opacity-0 transition-opacity group-hover:opacity-60" />
          </NavLink>
        )
      })}
      <div className="my-5 border-t border-[#e5e8ed]" />
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#697386] transition-colors hover:bg-[#fff1eb] hover:text-[#d4530f]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-current/10"><LogOut size={16} strokeWidth={1.8} /></span>
        退出登录
      </button>
    </nav>
  )

  return (
    <div className="min-h-[100dvh] bg-[#f7f8fa] text-[#14171f]">
      <Nav />
      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 pb-16 pt-24 sm:px-8 sm:pt-28 lg:px-10">
        <aside className="hidden w-[232px] shrink-0 lg:block">
          <div className="sticky top-28">
            <div className="mb-5 flex items-center gap-3 border-b border-[#e5e8ed] px-3 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6a1a] text-white"><Gift size={18} /></div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">牛牛 AI</div>
                <div className="truncate text-xs text-[#8a93a3]">用户工作台</div>
              </div>
            </div>
            {navigation()}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#e5e8ed] bg-white px-4 py-3 shadow-[0_8px_24px_-24px_rgba(20,23,31,0.4)] sm:px-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a0a8b6]">Account workspace</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <span>{activeItem.label}</span><ChevronRight size={14} className="text-[#a0a8b6]" /><span className="font-normal text-[#8a93a3]">{displayName}</span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e8ed] text-[#697386] lg:hidden"
              aria-label="打开账户导航"
            ><Menu size={18} /></button>
          </div>

          {mobileOpen && (
            <div className="fixed inset-0 z-50 bg-[#14171f]/30 lg:hidden" onClick={() => setMobileOpen(false)}>
              <div className="h-full w-[min(88vw,320px)] bg-white p-5 pt-8 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-8 flex items-center justify-between">
                  <div className="text-sm font-bold">账户导航</div>
                  <button onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e8ed] text-[#697386]" aria-label="关闭账户导航"><X size={17} /></button>
                </div>
                {navigation(true)}
              </div>
            </div>
          )}

          <main className="rounded-2xl border border-[#e5e8ed] bg-white p-5 shadow-[0_12px_28px_-28px_rgba(20,23,31,0.45)] sm:p-7 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
