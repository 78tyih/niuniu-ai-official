import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

interface ReferralData {
  referralCode: { code: string; status: string }
  referralUrl: string
  stats: {
    totalRegistrations: number
    paidUsers: number
  }
  commission: {
    pending: number
    available: number
    paid: number
  }
  records: Array<{
    id: number
    referred_user_id: string
    attributed_at: string
    first_paid_order_id: string | null
    status: string
  }>
}

const fmtMoney = (cents: number) => `¥${(cents / 100).toLocaleString('zh-CN')}`

export default function AccountReferral() {
  const { user } = useAuth()
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api<ReferralData>('/account/referral', { auth: true })
      .then(setData)
      .catch(e => setErr((e as Error).message))
      .finally(() => setLoading(false))
  }, [user])

  const copyCode = async () => {
    if (!data?.referralCode?.code) return
    await navigator.clipboard.writeText(data.referralCode.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = async () => {
    if (!data?.referralUrl) return
    await navigator.clipboard.writeText(data.referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="flex min-h-[200px] items-center justify-center text-[#6b7280]">加载中…</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">推广中心</h2>
        {copied && <span className="text-sm text-emerald-600">已复制</span>}
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>}

      {data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="text-sm text-[#6b7280]">总推广人数</div>
              <div className="mt-2 text-2xl font-bold">{data.stats.totalRegistrations}</div>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="text-sm text-[#6b7280]">已付费用户</div>
              <div className="mt-2 text-2xl font-bold">{data.stats.paidUsers}</div>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="text-sm text-[#6b7280]">待结算佣金</div>
              <div className="mt-2 text-2xl font-bold text-[#f97316]">{fmtMoney(data.commission.pending)}</div>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="text-sm text-[#6b7280]">可提现佣金</div>
              <div className="mt-2 text-2xl font-bold text-emerald-600">{fmtMoney(data.commission.available)}</div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">你的邀请码</h3>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-lg bg-[#f9fafb] px-4 py-3 font-mono text-lg">
                {data.referralCode?.code || '未生成'}
              </code>
              <button
                onClick={copyCode}
                className="rounded-lg bg-[#146eff] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0d5fe0]"
              >
                复制
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <code className="flex-1 rounded-lg bg-[#f9fafb] px-4 py-2 text-xs">
                {data.referralUrl || '未生成'}
              </code>
              <button
                onClick={copyLink}
                className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold hover:border-[#111111]"
              >
                复制链接
              </button>
            </div>
            <p className="mt-4 text-sm text-[#6b7280]">
              将邀请链接分享给好友，好友通过你的链接注册并购买后，你可以获得推广佣金。佣金比例由系统根据推广计划自动计算。
            </p>
          </div>

          {data.records && data.records.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] bg-[#f9fafb] px-6 py-3">
                <h3 className="text-sm font-semibold">最近邀请记录</h3>
              </div>
              <table className="min-w-full divide-y divide-[#e5e7eb]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">用户</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">邀请时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6b7280]">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {data.records.map((record) => (
                    <tr key={record.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 text-sm text-[#374151]">{record.referred_user_id}</td>
                      <td className="px-4 py-3 text-sm text-[#6b7280]">
                        {new Date(record.attributed_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.first_paid_order_id ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                            已付费
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                            待转化
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
