import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

interface CreditLedgerEntry {
  id: number
  transaction_type: string
  amount: number
  balance_after: number
  description: string
  created_at: string
}

export default function AccountCredits() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState<CreditLedgerEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [err, setErr] = useState('')
  const size = 20

  useEffect(() => {
    if (!user) return
    api<{ balance: number }>('/account/credits', { auth: true })
      .then(d => setBalance(d.balance))
      .catch(e => setErr((e as Error).message))

    api<{ history: CreditLedgerEntry[]; total: number }>(`/account/credits/history?page=${page}&size=${size}`, { auth: true })
      .then(d => { setHistory(d.history); setTotal(d.total) })
      .catch(e => setErr((e as Error).message))
  }, [user, page])

  const TYPE_LABEL: Record<string, string> = {
    recharge: '充值',
    order_reward: '订单奖励',
    consume: '消费',
    expire: '过期',
    refund: '退款',
    admin_adjust: '管理员调整',
  }

  const totalPages = Math.ceil(total / size)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">牛气值</h2>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
          <div className="text-sm text-[#6b7280]">当前余额</div>
          <div className="mt-2 text-3xl font-bold text-[#111111]">{balance}</div>
          <div className="mt-2 text-xs text-[#8b96a8]">
            牛气值可用于解锁高级功能、兑换官方定制提示词、参与社区活动
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
        <table className="min-w-full divide-y divide-[#e5e7eb]">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">说明</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">变动</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">余额</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] bg-white">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6b7280]">
                  暂无牛气值记录
                </td>
              </tr>
            ) : (
              history.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.amount > 0
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {TYPE_LABEL[entry.transaction_type] || entry.transaction_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{entry.description || '-'}</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    <span className={entry.amount > 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{entry.balance_after}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#6b7280]">
                    {new Date(entry.created_at).toLocaleString('zh-CN')}
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
