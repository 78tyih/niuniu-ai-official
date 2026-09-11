import { useEffect, useState } from 'react'
import { ArrowRight, Copy, Landmark, TrendingUp, Users, Wallet } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

interface ReferralData {
  referralCode: { code: string; status: string } | null
  referralUrl: string | null
  stats: { totalRegistrations: number; paidUsers: number }
  commission: { pending: number; available: number; paid: number }
  records: Array<{ id: number; referred_user_id: string; attributed_at: string; first_paid_order_id: string | null; status: string }>
}

interface CommissionData {
  commissions: Array<{ id: number; order_id: string; base_amount: number; commission_rate: number; commission_amount: number; status: 'pending' | 'reserved' | 'available' | 'paid'; available_at: string; created_at: string }>
}

const money = (cents: number) => `¥${(cents / 100).toLocaleString('zh-CN')}`
const tiers = [
  { title: '基础返佣', rate: '10%', detail: '未订阅、3 天体验卡与月付用户', active: false },
  { title: '季付返佣', rate: '15%', detail: '当前有效季付套餐用户', active: false },
  { title: '年付返佣', rate: '20%', detail: '当前有效年付套餐用户', active: true },
]

export default function AccountReferral() {
  const { user } = useAuth()
  const [data, setData] = useState<ReferralData | null>(null)
  const [commissions, setCommissions] = useState<CommissionData['commissions']>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      api<ReferralData>('/account/referral', { auth: true }),
      api<CommissionData>('/account/commissions?page=1&size=10', { auth: true }),
    ])
      .then(([referral, commission]) => { setData(referral); setCommissions(commission.commissions || []) })
      .catch((error) => setErr((error as Error).message))
      .finally(() => setLoading(false))
  }, [user])

  const copy = async (value?: string | null) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const commission = data?.commission || { pending: 0, available: 0, paid: 0 }
  const currentRate = '10%'

  return (
    <div>
      <header className="flex flex-col gap-3 border-b border-[#edf0f3] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff6a1a]">Partner program</div><h1 className="mt-2 text-2xl font-bold tracking-tight">推广与返佣</h1><p className="mt-2 text-sm text-[#7d8797]">管理邀请链接、返佣档位、结算记录与收益去向。</p></div>
        {copied && <span className="text-sm font-semibold text-[#26734d]">已复制到剪贴板</span>}
      </header>

      {err && <div className="mt-5 rounded-lg border border-[#f2c9b9] bg-[#fff7f4] px-4 py-3 text-sm text-[#b94116]">返佣数据暂未同步：{err}。下方规则与功能结构可先预览。</div>}

      <section className="mt-6 overflow-hidden rounded-xl border border-[#e5e8ed] bg-[#14171f] text-white"><div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto]"><div><div className="text-xs font-medium text-white/55">你当前适用的返佣比例</div><div className="mt-2 flex items-end gap-3"><div className="text-4xl font-bold tabular-nums">{loading ? '—' : currentRate}</div><div className="pb-1 text-sm text-white/55">未订阅或月付档位</div></div><p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">返佣以被邀请用户的实际支付金额为基数，订单完成并经过结算期后进入可用余额。升级至季付或年付后，新产生的返佣将自动使用更高档位。</p></div><div className="flex items-start gap-3 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"><TrendingUp size={19} className="mt-0.5 text-[#ff9b68]" /><div><div className="text-xs text-white/55">累计已提现</div><div className="mt-1 text-xl font-bold">{loading ? '—' : money(commission.paid)}</div></div></div></div></section>

      <section className="mt-6"><div className="mb-3"><h2 className="text-sm font-bold">返佣规则</h2><p className="mt-1 text-xs text-[#9aa3b0]">比例由邀请人当前有效订阅档位决定，系统在订单结算时写入对应比例。</p></div><div className="grid gap-px overflow-hidden rounded-xl border border-[#e5e8ed] bg-[#e5e8ed] md:grid-cols-3">{tiers.map((tier) => <div key={tier.title} className="bg-white p-5"><div className="flex items-center justify-between"><span className="text-sm font-semibold">{tier.title}</span>{tier.active && <span className="rounded-full bg-[#fff1eb] px-2 py-1 text-[10px] font-semibold text-[#d4530f]">最高档</span>}</div><div className="mt-3 text-3xl font-bold tabular-nums">{tier.rate}</div><p className="mt-2 text-xs leading-relaxed text-[#7d8797]">{tier.detail}</p></div>)}</div></section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><div className="rounded-xl border border-[#e5e8ed] p-5"><div className="flex items-center gap-2"><Users size={17} className="text-[#ff6a1a]" /><h2 className="text-sm font-bold">邀请链接</h2></div><p className="mt-2 text-xs leading-relaxed text-[#7d8797]">好友通过链接注册并完成付费后，系统会自动归因并生成返佣记录。</p><div className="mt-5"><label className="text-xs font-medium text-[#697386]">邀请码</label><div className="mt-2 flex gap-2"><code className="min-w-0 flex-1 truncate rounded-lg bg-[#f7f8fa] px-3 py-2.5 text-sm font-semibold">{data?.referralCode?.code || '账户同步后自动生成'}</code><button onClick={() => copy(data?.referralCode?.code)} disabled={!data?.referralCode?.code} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e1e5ea] text-[#4f5968] disabled:opacity-40" aria-label="复制邀请码"><Copy size={16} /></button></div></div><div className="mt-4"><label className="text-xs font-medium text-[#697386]">推广链接</label><div className="mt-2 flex gap-2"><code className="min-w-0 flex-1 truncate rounded-lg bg-[#f7f8fa] px-3 py-2.5 text-xs">{data?.referralUrl || '账户同步后自动生成'}</code><button onClick={() => copy(data?.referralUrl)} disabled={!data?.referralUrl} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e1e5ea] text-[#4f5968] disabled:opacity-40" aria-label="复制推广链接"><Copy size={16} /></button></div></div></div>

        <div className="rounded-xl border border-[#e5e8ed] p-5"><div className="flex items-center gap-2"><Wallet size={17} className="text-[#ff6a1a]" /><h2 className="text-sm font-bold">返佣余额去向</h2></div><div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-[#e5e8ed] bg-[#e5e8ed] sm:grid-cols-3"><div className="bg-white p-3"><div className="text-xs text-[#7d8797]">待结算</div><div className="mt-1 text-lg font-bold">{loading ? '—' : money(commission.pending)}</div></div><div className="bg-white p-3"><div className="text-xs text-[#7d8797]">可用返佣</div><div className="mt-1 text-lg font-bold text-[#26734d]">{loading ? '—' : money(commission.available)}</div></div><div className="bg-white p-3"><div className="text-xs text-[#7d8797]">已完成</div><div className="mt-1 text-lg font-bold">{loading ? '—' : money(commission.paid)}</div></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled className="flex items-center justify-between rounded-lg border border-[#e1e5ea] px-4 py-3 text-left text-sm font-semibold text-[#7d8797] disabled:cursor-not-allowed"><span>兑换为牛气值</span><ArrowRight size={15} /><span className="sr-only">待确认兑换比例后开放</span></button><button disabled className="flex items-center justify-between rounded-lg bg-[#14171f] px-4 py-3 text-left text-sm font-semibold text-white opacity-45 disabled:cursor-not-allowed"><span>申请提现</span><Landmark size={15} /><span className="sr-only">可用余额为零时不可提现</span></button></div><p className="mt-3 text-xs leading-relaxed text-[#9aa3b0]">提现接口已具备审核流程；牛气值兑换比例尚未确定，因此暂不启用兑换，避免发生不可逆的错误结算。</p></div></section>

      <section className="mt-8"><div className="mb-3"><h2 className="text-sm font-bold">返佣记录</h2><p className="mt-1 text-xs text-[#9aa3b0]">展示最近 10 条订单结算记录。</p></div><div className="overflow-x-auto rounded-xl border border-[#e5e8ed]"><table className="min-w-[680px] w-full divide-y divide-[#e5e8ed] text-left"><thead className="bg-[#fafbfc]"><tr>{['订单', '基数', '返佣比例', '返佣金额', '状态', '时间'].map((label) => <th key={label} className="px-4 py-3 text-xs font-medium text-[#7d8797]">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf0f3] bg-white">{!loading && commissions.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#7d8797]">暂无返佣记录</td></tr> : commissions.map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono text-xs text-[#4f5968]">{item.order_id}</td><td className="px-4 py-3 text-sm">{money(item.base_amount)}</td><td className="px-4 py-3 text-sm font-semibold">{item.commission_rate}%</td><td className="px-4 py-3 text-sm font-semibold text-[#26734d]">{money(item.commission_amount)}</td><td className="px-4 py-3 text-sm text-[#697386]">{item.status === 'available' ? '可用' : item.status === 'pending' ? '待结算' : item.status === 'paid' ? '已提现' : '处理中'}</td><td className="px-4 py-3 text-sm text-[#697386]">{new Date(item.created_at).toLocaleDateString('zh-CN')}</td></tr>)}</tbody></table></div></section>
    </div>
  )
}
