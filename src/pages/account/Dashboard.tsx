import { useEffect, useState } from 'react'
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
  recentOrders: any[]
  referral: { totalRegistrations: number; paidUsers: number }
  commission: { pending: number; available: number; paid: number }
  recentCredits: any[]
}

export default function AccountDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    api<DashboardData>('/account/dashboard', { auth: true })
      .then(setData)
      .catch((e) => setErr((e as Error).message))
  }, [])

  if (err) return <p className="text-sm text-[#d4530f]">{err}</p>
  if (!data) return <p className="text-sm text-[#9ca3af]">加载中…</p>

  const active = data.subscription && data.subscription.status === 'active' && new Date(data.subscription.expires_at) > new Date()
  const daysLeft = active ? Math.max(0, Math.ceil((new Date(data.subscription.expires_at!).getTime() - Date.now()) / 86400000)) : 0

  return (
    <div>
      {/* 问候 */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">
          你好，{user?.name || user?.email?.split('@')[0] || '用户'}
        </h1>
      </div>

      {/* 当前套餐 */}
      {active ? (
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#9ca3af]">当前方案</div>
              <div className="mt-1 text-lg font-bold">
                {data.subscription!.plan_name}
                {data.subscription!.recommended && (
                  <span className="ml-2 rounded-full bg-[#f97316]/10 px-2 py-0.5 text-[10px] font-semibold text-[#f97316]">
                    推荐
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#9ca3af]">到期时间</div>
              <div className="mt-1 text-sm font-medium">{new Date(data.subscription!.expires_at).toLocaleDateString('zh-CN')}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#9ca3af]">剩余天数</div>
              <div className="mt-1 text-lg font-bold text-[#f97316]">{daysLeft} 天</div>
            </div>
            <Link
              to="/pricing"
              className="rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea6a0c]"
            >
              立即续费
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 text-center">
          <p className="text-sm text-[#6b7280]">暂无生效中的订阅</p>
          <Link
            to="/pricing"
            className="mt-3 inline-block rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ea6a0c]"
          >
            选择订阅方案
          </Link>
        </div>
      )}

      {/* 关键数据卡片 */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
          <div className="text-xs text-[#9ca3af]">牛气值</div>
          <div className="mt-1 text-xl font-bold text-[#f97316]">{data.credits.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
          <div className="text-xs text-[#9ca3af]">我的推广</div>
          <div className="mt-1 text-xl font-bold">{data.referral.totalRegistrations} 人</div>
          <div className="text-[11px] text-[#9ca3af]">付费 {data.referral.paidUsers} 人</div>
        </div>
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
          <div className="text-xs text-[#9ca3af]">可提现佣金</div>
          <div className="mt-1 text-xl font-bold">{fmtPrice(data.commission.available)}</div>
          <div className="text-[11px] text-[#9ca3af]">累计 {fmtPrice(data.commission.paid)} 已提现</div>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">最近订单</h2>
          <Link to="/account/orders" className="text-xs text-[#f97316] hover:underline">
            查看全部 →
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="mt-2 text-xs text-[#9ca3af]">暂无订单</p>
        ) : (
          <div className="mt-2 space-y-2">
            {data.recentOrders.map((o) => (
              <div key={o.order_no} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{o.plan_name}</div>
                  <div className="text-[11px] text-[#9ca3af]">{o.order_no}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{fmtPrice(o.amount_cents)}</div>
                  <div className={`text-[11px] ${o.status === 'paid' ? 'text-emerald-500' : 'text-[#f97316]'}`}>
                    {o.status === 'paid' ? '已支付' : '待支付'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 最近牛气值记录 */}
      <div className="mt-5">
        <h2 className="text-sm font-bold">最近牛气值记录</h2>
        {data.recentCredits.length === 0 ? (
          <p className="mt-2 text-xs text-[#9ca3af]">暂无记录</p>
        ) : (
          <div className="mt-2 space-y-2">
            {data.recentCredits.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
                <div>
                  <div className="text-sm font-medium">
                    {c.transaction_type === 'recharge' ? '充值' : c.transaction_type === 'consume' ? '消耗' : c.transaction_type}
                  </div>
                  <div className="text-[11px] text-[#9ca3af]">{new Date(c.created_at).toLocaleString('zh-CN')}</div>
                </div>
                <div className={`text-right ${c.amount > 0 ? 'text-emerald-500' : ''}`}>
                  <div className="text-sm font-bold">
                    {c.amount > 0 ? '+' : ''}{c.amount}
                  </div>
                  <div className="text-[11px] text-[#9ca3af]">余额 {c.balance_after.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}