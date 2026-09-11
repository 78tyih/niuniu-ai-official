import { useEffect, useState } from 'react'
import { CreditCard, Wallet } from 'lucide-react'
import { api, fmtPrice, CHANNEL_LABEL, type Order } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

interface CreditLedgerEntry {
  id: number
  transaction_type: string
  amount: number
  balance_after: number
  description: string
  created_at: string
}

const ORDER_STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: '待支付', cls: 'bg-[#fff3df] text-[#9a6200]' },
  paid: { text: '已支付', cls: 'bg-[#eaf7ef] text-[#26734d]' },
  expired: { text: '已过期', cls: 'bg-[#f1f3f6] text-[#697386]' },
  cancelled: { text: '已取消', cls: 'bg-[#fff0ec] text-[#b94116]' },
}

const CREDIT_TYPE: Record<string, string> = {
  recharge: '充值',
  consume: '服务消耗',
  refund: '退款返还',
  bonus: '赠送',
  admin_adjustment: '后台调整',
  reversal: '冲正',
  expiration: '过期',
}

export default function AccountOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [credits, setCredits] = useState(0)
  const [history, setHistory] = useState<CreditLedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setErr('')
    Promise.all([
      api<{ orders: Order[] }>('/account/orders?page=1&size=20', { auth: true }),
      api<{ balance: number }>('/account/credits', { auth: true }),
      api<{ history: CreditLedgerEntry[] }>('/account/credits/history?page=1&size=8', { auth: true }),
    ])
      .then(([orderData, creditData, ledgerData]) => {
        setOrders(orderData.orders || [])
        setCredits(creditData.balance || 0)
        setHistory(ledgerData.history || [])
      })
      .catch((error) => setErr((error as Error).message))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div>
      <header className="flex flex-col gap-3 border-b border-[#edf0f3] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff6a1a]">Commerce</div><h1 className="mt-2 text-2xl font-bold tracking-tight">购买与牛气值</h1><p className="mt-2 text-sm text-[#7d8797]">集中查看套餐订单、授权交付和牛气值使用明细。</p></div>
      </header>

      {err && <div className="mt-5 rounded-lg border border-[#f2c9b9] bg-[#fff7f4] px-4 py-3 text-sm text-[#b94116]">部分账户数据未能同步：{err}</div>}

      <section className="mt-6 grid gap-px overflow-hidden rounded-xl border border-[#e5e8ed] bg-[#e5e8ed] sm:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-[#14171f] p-5 text-white"><div className="flex items-center gap-2 text-xs text-white/55"><Wallet size={15} /> 牛气值余额</div><div className="mt-3 text-3xl font-bold tabular-nums">{loading ? '—' : credits.toLocaleString('zh-CN')}</div><p className="mt-2 text-xs leading-relaxed text-white/50">牛气值由套餐权益、充值和返佣兑换等来源累积，可用于 AI 服务消耗。</p></div>
        <div className="bg-white p-5"><div className="flex items-center gap-2 text-xs font-medium text-[#7d8797]"><CreditCard size={15} /> 订单与授权</div><p className="mt-3 text-sm leading-relaxed text-[#4f5968]">已支付订单会在此展示套餐、支付状态和授权交付信息。3 天体验卡每个账户只能购买一次。</p></div>
      </section>

      <section className="mt-7">
        <div className="mb-3"><h2 className="text-sm font-bold">购买记录</h2><p className="mt-1 text-xs text-[#9aa3b0]">最近 20 笔套餐订单</p></div>
        <div className="overflow-x-auto rounded-xl border border-[#e5e8ed]"><table className="min-w-[720px] w-full divide-y divide-[#e5e8ed] text-left"><thead className="bg-[#fafbfc]"><tr>{['订单号', '套餐', '金额', '支付方式', '状态', '时间'].map((label) => <th key={label} className="px-4 py-3 text-xs font-medium text-[#7d8797]">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf0f3] bg-white">{!loading && orders.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#7d8797]">暂无购买记录</td></tr> : orders.map((order) => { const status = ORDER_STATUS[order.status] || { text: order.status, cls: 'bg-[#f1f3f6] text-[#697386]' }; return <tr key={order.order_no}><td className="px-4 py-3 font-mono text-xs text-[#4f5968]">{order.order_no}</td><td className="px-4 py-3 text-sm font-semibold">{order.plan_name}</td><td className="px-4 py-3 text-sm font-semibold">{fmtPrice(order.amount_cents)}</td><td className="px-4 py-3 text-sm text-[#697386]">{CHANNEL_LABEL[order.channel] || order.channel}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${status.cls}`}>{status.text}</span></td><td className="px-4 py-3 text-sm text-[#697386]">{new Date(order.created_at).toLocaleDateString('zh-CN')}</td></tr>})}</tbody></table></div>
      </section>

      <section className="mt-8"><div className="mb-3"><h2 className="text-sm font-bold">牛气值明细</h2><p className="mt-1 text-xs text-[#9aa3b0]">套餐赠送、充值、返佣兑换和服务消耗都会保留流水。</p></div><div className="overflow-hidden rounded-xl border border-[#e5e8ed]">{!loading && history.length === 0 ? <div className="bg-[#fafbfc] px-5 py-10 text-center text-sm text-[#7d8797]">暂无牛气值变动记录</div> : history.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-4 border-b border-[#edf0f3] bg-white px-4 py-3.5 last:border-0"><div><div className="text-sm font-semibold">{CREDIT_TYPE[entry.transaction_type] || entry.transaction_type}</div><div className="mt-1 text-xs text-[#9aa3b0]">{entry.description || '牛气值账户变动'} · {new Date(entry.created_at).toLocaleString('zh-CN')}</div></div><div className="text-right"><div className={`text-sm font-bold ${entry.amount >= 0 ? 'text-[#d4530f]' : 'text-[#26734d]'}`}>{entry.amount >= 0 ? '+' : ''}{entry.amount.toLocaleString('zh-CN')}</div><div className="mt-1 text-xs text-[#9aa3b0]">余额 {entry.balance_after.toLocaleString('zh-CN')}</div></div></div>)}</div></section>
    </div>
  )
}
