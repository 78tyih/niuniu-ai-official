import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api, fmtPrice } from '../../lib/api'

export default function AccountSubscription() {
  const [sub, setSub] = useState<any>(null)
  const [entitlements, setEntitlements] = useState<any[]>([])
  const [err, setErr] = useState('')

  useEffect(() => {
    api<{ subscription: any; entitlements: any[] }>('/account/subscription', { auth: true })
      .then((d) => { setSub(d.subscription); setEntitlements(d.entitlements || []) })
      .catch((e) => setErr((e as Error).message))
  }, [])

  if (err) return <p className="text-sm text-[#d4530f]">{err}</p>
  if (!sub) return <p className="text-sm text-[#9ca3af]">加载中…</p>

  const active = sub.status === 'active' && new Date(sub.expires_at) > new Date()
  const daysLeft = active ? Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000)) : 0

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">我的订阅</h1>

      {sub ? (
        <>
          <div className="mt-5 rounded-2xl border border-[#e5e7eb] bg-white p-5">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-lg font-bold">{sub.plans?.name}</div>
                {sub.plans?.recommended && (
                  <span className="mt-1 inline-block rounded-full bg-[#f97316]/10 px-2 py-0.5 text-[10px] font-semibold text-[#f97316]">
                    推荐
                  </span>
                )}
              </div>
              {active ? (
                <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                  生效中 · 剩 {daysLeft} 天
                </span>
              ) : (
                <span className="ml-auto rounded-full bg-[#f5f5f3] px-3 py-1 text-xs font-medium text-[#9ca3af]">
                  已过期
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs text-[#9ca3af]">开始时间</div>
                <div className="mt-1 text-sm font-medium">{new Date(sub.starts_at).toLocaleDateString('zh-CN')}</div>
              </div>
              <div>
                <div className="text-xs text-[#9ca3af]">到期时间</div>
                <div className="mt-1 text-sm font-medium">{new Date(sub.expires_at).toLocaleDateString('zh-CN')}</div>
              </div>
              <div>
                <div className="text-xs text-[#9ca3af]">牛气值余额</div>
                <div className="mt-1 text-lg font-bold text-[#f97316]">{sub.nq_balance.toLocaleString()}</div>
              </div>
            </div>
            {active && (
              <div className="mt-4 border-t border-[#e5e7eb] pt-4">
                <Link to="/pricing" className="text-sm font-medium text-[#f97316] hover:underline">
                  续费或更换套餐 →
                </Link>
              </div>
            )}
          </div>

          {/* 权益列表 */}
          <h2 className="mt-6 text-sm font-bold">当前权益</h2>
          {entitlements.length === 0 ? (
            <p className="mt-2 text-xs text-[#9ca3af]">暂无权益数据</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {entitlements.map((e) => (
                <div key={e.entitlement_code} className="flex items-center gap-2.5 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-500">✓</span>
                  <div>
                    <div className="text-sm font-medium">{e.entitlement_definitions?.name || e.entitlement_code}</div>
                    {e.entitlement_definitions?.description && (
                      <div className="text-[11px] text-[#9ca3af]">{e.entitlement_definitions.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center">
          <p className="text-sm text-[#6b7280]">暂无订阅</p>
          <Link to="/pricing" className="mt-3 inline-block rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ea6a0c]">
            选择订阅方案
          </Link>
        </div>
      )}
    </div>
  )
}