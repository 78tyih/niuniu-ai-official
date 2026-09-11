import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, CircleDollarSign, CreditCard, RefreshCw, Sparkles, TrendingUp, Users, Wallet } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { api, fmtPrice } from '../../lib/api'

interface DashboardData {
  subscription: {
    plan_code: string
    plan_name: string
    status: string
    starts_at: string
    expires_at: string
    nq_balance: number
    recommended: boolean
  } | null
  credits: number
  recentOrders: Array<{
    order_no: string
    plan_name: string
    amount_cents: number
    status: string
    created_at: string
  }>
  referral: { totalRegistrations: number; paidUsers: number }
  commission: { pending: number; available: number; paid: number }
  recentCredits: Array<{
    transaction_type: string
    amount: number
    balance_after: number
    created_at: string
  }>
}

const creditTypeLabel: Record<string, string> = {
  recharge: '充值',
  consume: 'AI 服务消耗',
  refund: '退回',
  gift: '赠送',
}

export default function AccountDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const loadDashboard = () => {
    setLoading(true)
    setErr('')
    api<DashboardData>('/account/dashboard', { auth: true })
      .then(setData)
      .catch((error) => setErr((error as Error).message))
      .finally(() => setLoading(false))
  }

  useEffect(loadDashboard, [])

  if (loading) {
    return (
      <div aria-label="正在加载账户数据" className="space-y-6">
        <div className="h-16 animate-pulse rounded-xl bg-[#f1f3f6]" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-[#f1f3f6]" />)}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-[#f1f3f6]" />
      </div>
    )
  }

  if (err || !data) {
    return (
      <div className="space-y-6" role="status">
        <header className="flex flex-col gap-4 border-b border-[#edf0f3] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff6a1a]">Account workspace</div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">账户工作台</h1>
            <p className="mt-2 text-sm text-[#7d8797]">账户明细正在同步，以下为工作台结构预览，不代表真实余额或收益。</p>
          </div>
          <button onClick={loadDashboard} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14171f] px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"><RefreshCw size={15} /> 重新加载</button>
        </header>
        <div className="grid gap-px overflow-hidden rounded-xl border border-[#e5e8ed] bg-[#e5e8ed] sm:grid-cols-2 xl:grid-cols-4">
          {['当前订阅', '牛气值余额', '推广返佣', '待处理事项'].map((label) => (
            <div key={label} className="bg-white p-5"><div className="text-xs font-medium text-[#7d8797]">{label}</div><div className="mt-3 text-2xl font-bold text-[#a0a8b6]">—</div><div className="mt-1 text-[11px] text-[#a0a8b6]">等待账户数据同步</div></div>
          ))}
        </div>
        <section className="rounded-xl border border-[#e5e8ed] bg-[#fafbfc] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-bold">推广返佣规则</h2><p className="mt-1 text-xs text-[#7d8797]">返佣按邀请人当前有效订阅档位自动确定。</p></div><Link to="/account/referral" className="text-sm font-semibold text-[#d4530f]">查看推广中心 <ArrowRight className="inline" size={14} /></Link></div>
          <div className="mt-5 grid divide-y divide-[#e5e8ed] rounded-lg border border-[#e5e8ed] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-4"><div className="text-xs text-[#7d8797]">未订阅 / 月付</div><div className="mt-1 text-xl font-bold">10%</div></div>
            <div className="p-4"><div className="text-xs text-[#7d8797]">季付套餐</div><div className="mt-1 text-xl font-bold">15%</div></div>
            <div className="p-4"><div className="text-xs text-[#7d8797]">年付套餐</div><div className="mt-1 text-xl font-bold">20%</div></div>
          </div>
        </section>
        <p className="text-center text-xs text-[#9aa3b0]">{err || '账户服务正在同步。'}</p>
      </div>
    )
  }

  const sub = data.subscription
  const active = Boolean(sub && sub.status === 'active' && new Date(sub.expires_at) > new Date())
  const daysLeft = active && sub ? Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000)) : 0
  const displayName = user?.name || user?.email?.split('@')[0] || '用户'
  const paidRate = data.referral.totalRegistrations > 0
    ? Math.round((data.referral.paidUsers / data.referral.totalRegistrations) * 100)
    : 0

  const metrics = [
    { label: '牛气值余额', value: data.credits.toLocaleString('zh-CN'), note: '用于 AI 分析服务', icon: Wallet, accent: true },
    { label: '推广用户', value: `${data.referral.totalRegistrations} 人`, note: `${data.referral.paidUsers} 人付费 · 转化 ${paidRate}%`, icon: Users },
    { label: '可提现佣金', value: fmtPrice(data.commission.available), note: `${fmtPrice(data.commission.pending)} 待结算`, icon: CircleDollarSign },
    { label: '累计已提现', value: fmtPrice(data.commission.paid), note: '返佣结算记录', icon: TrendingUp },
  ]

  return (
    <div>
      <header className="flex flex-col gap-5 border-b border-[#edf0f3] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff6a1a]">Overview / Workspace</div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">你好，{displayName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#7d8797]">
            <span>这里汇总你的订阅、用量、订单和推广收益。</span>
            {user?.email && <span className="hidden h-3.5 w-px bg-[#dfe3e8] sm:block" />}
            {user?.email && <span className="truncate text-xs text-[#9aa3b0]">{user.email}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/account/orders" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e1e5ea] bg-white px-4 py-2.5 text-sm font-semibold text-[#4f5968] transition-colors hover:border-[#14171f] hover:text-[#14171f] active:scale-[0.98]">
            购买记录
          </Link>
          <Link to="/pricing" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff6a1a] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:bg-[#f15f12] active:scale-[0.98]">
            查看套餐 <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="mt-7 overflow-hidden rounded-xl border border-[#e5e8ed] bg-[#14171f] text-white">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff6a1a]"><Sparkles size={20} /></div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/55">当前订阅</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{active && sub ? sub.plan_name : '暂未订阅'}</h2>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? 'bg-[#2d7a54] text-white' : 'bg-white/10 text-white/65'}`}>
                  {active ? '服务正常' : '未激活'}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/55">
                {active && sub ? `有效期至 ${new Date(sub.expires_at).toLocaleDateString('zh-CN')}` : '选择套餐后即可使用完整的 AI 交易辅助能力'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-white/50"><CalendarDays size={13} /> 剩余天数</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{active ? daysLeft : 0}<span className="ml-1 text-sm font-medium text-white/45">天</span></div>
            </div>
            <Link to="/account/subscription" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">管理订阅</Link>
          </div>
        </div>
        {!active && (
          <div className="flex flex-col gap-3 border-t border-white/10 bg-white/[0.04] px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="text-xs leading-relaxed text-white/55">还没有生效中的套餐，购买后即可解锁完整的 AI 交易辅助能力。</div>
            <Link to="/pricing" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#ff9b68] hover:text-white">选择套餐 <ArrowRight size={13} /></Link>
          </div>
        )}
      </section>

      <section className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[#e5e8ed] bg-[#e5e8ed] sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#7d8797]">{metric.label}</span>
                <Icon size={16} className={metric.accent ? 'text-[#ff6a1a]' : 'text-[#9aa3b0]'} />
              </div>
              <div className={`mt-3 text-2xl font-bold tabular-nums ${metric.accent ? 'text-[#ff6a1a]' : 'text-[#14171f]'}`}>{metric.value}</div>
              <div className="mt-1 text-[11px] text-[#9aa3b0]">{metric.note}</div>
            </div>
          )
        })}
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.35fr_0.85fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div><h2 className="text-sm font-bold">最近订单</h2><p className="mt-1 text-xs text-[#9aa3b0]">最新购买与交付状态</p></div>
            <Link to="/account/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-[#d4530f]">全部订单 <ArrowRight size={13} /></Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#e5e8ed]">
            {data.recentOrders.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center bg-[#fafbfc] px-5 text-center">
                <CreditCard size={22} className="text-[#a0a8b6]" />
                <p className="mt-3 text-sm font-semibold">暂无购买记录</p>
                <p className="mt-1 text-xs text-[#8a93a3]">完成购买后，订单与授权交付会显示在这里。</p>
              </div>
            ) : data.recentOrders.map((order) => (
              <div key={order.order_no} className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#edf0f3] px-4 py-3.5 last:border-0 hover:bg-[#fafbfc] sm:grid-cols-[1fr_120px_90px] sm:items-center">
                <div className="min-w-0"><div className="truncate text-sm font-semibold">{order.plan_name}</div><div className="mt-1 truncate font-mono text-[10px] text-[#9aa3b0]">{order.order_no}</div></div>
                <div className="hidden text-xs text-[#7d8797] sm:block">{new Date(order.created_at).toLocaleDateString('zh-CN')}</div>
                <div className="text-right"><div className="text-sm font-bold">{fmtPrice(order.amount_cents)}</div><div className={`mt-1 text-[10px] font-semibold ${order.status === 'paid' ? 'text-[#2d7a54]' : 'text-[#d4530f]'}`}>{order.status === 'paid' ? '已支付' : '待支付'}</div></div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3"><h2 className="text-sm font-bold">牛气值动态</h2><p className="mt-1 text-xs text-[#9aa3b0]">最近充值与使用明细</p></div>
          <div className="overflow-hidden rounded-xl border border-[#e5e8ed]">
            {data.recentCredits.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center bg-[#fafbfc] px-5 text-center">
                <Wallet size={22} className="text-[#a0a8b6]" /><p className="mt-3 text-sm font-semibold">暂无余额变动</p><p className="mt-1 text-xs text-[#8a93a3]">后续使用记录会自动同步。</p>
              </div>
            ) : data.recentCredits.slice(0, 5).map((credit, index) => (
              <div key={`${credit.created_at}-${index}`} className="flex items-center justify-between border-b border-[#edf0f3] px-4 py-3.5 last:border-0">
                <div><div className="text-sm font-semibold">{creditTypeLabel[credit.transaction_type] || credit.transaction_type}</div><div className="mt-1 text-[10px] text-[#9aa3b0]">{new Date(credit.created_at).toLocaleString('zh-CN')}</div></div>
                <div className="text-right"><div className={`text-sm font-bold tabular-nums ${credit.amount > 0 ? 'text-[#d4530f]' : 'text-[#2d7a54]'}`}>{credit.amount > 0 ? '+' : ''}{credit.amount.toLocaleString('zh-CN')}</div><div className="mt-1 text-[10px] text-[#9aa3b0]">余额 {credit.balance_after.toLocaleString('zh-CN')}</div></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
