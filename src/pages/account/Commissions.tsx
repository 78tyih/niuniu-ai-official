import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

interface Commission {
  id: number
  order_id: string
  base_amount: number
  commission_amount: number
  status: 'pending' | 'reserved' | 'available' | 'paid'
  available_at: string
  created_at: string
}

interface CommissionData {
  commissions: Commission[]
  total: number
  page: number
  size: number
  summary: {
    pending: number
    available: number
    paid: number
  }
}

const fmtMoney = (cents: number) => `¥${(cents / 100).toLocaleString('zh-CN')}`

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  pending: { text: '待结算', cls: 'bg-yellow-50 text-yellow-600' },
  reserved: { text: '已锁定（提现中）', cls: 'bg-blue-50 text-blue-600' },
  available: { text: '可提现', cls: 'bg-emerald-50 text-emerald-600' },
  paid: { text: '已提现', cls: 'bg-gray-100 text-gray-500' },
}

export default function AccountCommissions() {
  const { user } = useAuth()
  const [data, setData] = useState<CommissionData | null>(null)
  const [page, setPage] = useState(1)
  const [err, setErr] = useState('')
  const size = 20

  useEffect(() => {
    if (!user) return
    api<CommissionData>(`/account/commissions?page=${page}&size=${size}`, { auth: true })
      .then(setData)
      .catch(e => setErr((e as Error).message))
  }, [user, page])

  const totalPages = data ? Math.ceil(data.total / data.size) : 0

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">返佣记录</h2>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>}

      {data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="text-sm text-[#6b7280]">待结算</div>
              <div className="mt-2 text-2xl font-bold text-yellow-600">{fmtMoney(data.summary.pending)}</div>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="text-sm text-[#6b7280]">可提现</div>
              <div className="mt-2 text-2xl font-bold text-emerald-600">{fmtMoney(data.summary.available)}</div>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="text-sm text-[#6b7280]">已提现</div>
              <div className="mt-2 text-2xl font-bold text-[#111111]">{fmtMoney(data.summary.paid)}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
            <table className="min-w-full divide-y divide-[#e5e7eb]">
              <thead className="bg-[#f9fafb]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">订单</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">订单金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">佣金</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">可提现时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] bg-white">
                {data.commissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#6b7280]">
                      暂无返佣记录
                    </td>
                  </tr>
                ) : (
                  data.commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 text-sm font-medium text-[#111111]">
                        {c.order_id.slice(0, 10)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{fmtMoney(c.base_amount)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{fmtMoney(c.commission_amount)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_LABEL[c.status]?.cls}`}>
                          {STATUS_LABEL[c.status]?.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6b7280]">
                        {c.available_at ? new Date(c.available_at).toLocaleDateString('zh-CN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6b7280]">
                        {new Date(c.created_at).toLocaleDateString('zh-CN')}
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
        </>
      )}
    </div>
  )
}
