import { useEffect, useState } from 'react'
import { api, fmtPrice, CHANNEL_LABEL, type Order } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

export default function AccountOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [err, setErr] = useState('')
  const size = 20

  useEffect(() => {
    if (!user) return
    api<{ orders: Order[]; total: number; page: number }>(`/account/orders?page=${page}&size=${size}`, { auth: true })
      .then(d => { setOrders(d.orders); setTotal(d.total) })
      .catch(e => setErr((e as Error).message))
  }, [user, page])

  const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
    pending: { text: '待支付', cls: 'bg-yellow-50 text-yellow-600' },
    paid: { text: '已支付', cls: 'bg-emerald-50 text-emerald-600' },
    expired: { text: '已过期', cls: 'bg-gray-100 text-gray-500' },
    cancelled: { text: '已取消', cls: 'bg-red-50 text-red-500' },
  }

  const totalPages = Math.ceil(total / size)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">购买记录</h2>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>}

      <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
        <table className="min-w-full divide-y divide-[#e5e7eb]">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">订单号</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">套餐</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">支付方式</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] bg-white">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#6b7280]">
                  暂无购买记录
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.order_no} className="hover:bg-[#f9fafb]">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-[#111111]">
                    {o.order_no.slice(0, 10)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{o.plan_name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#111111]">{fmtPrice(o.amount_cents)}</td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{CHANNEL_LABEL[o.channel] || o.channel}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_LABEL[o.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[o.status]?.text || o.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#6b7280]">
                    {new Date(o.created_at).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`min-w-[32px] rounded-lg px-2 py-1 text-sm ${
                p === page ? 'bg-[#f97316] font-semibold text-white' : 'border border-[#e5e7eb] hover:border-[#111111]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
