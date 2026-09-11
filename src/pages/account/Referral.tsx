import { useEffect, useState } from 'react'
import { Copy, Landmark, TrendingUp, Users, Wallet } from 'lucide-react'
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

interface PayoutData {
  payouts: Array<{ id: number; amount: number; currency: string; method: 'alipay' | 'usdt'; status: 'submitted' | 'approved' | 'paid' | 'rejected'; requested_at: string; approved_at?: string | null; paid_at?: string | null; rejected_at?: string | null; admin_note?: string | null }>
}

const money = (cents: number) => `¥${(cents / 100).toLocaleString('zh-CN')}`
const payoutStatus: Record<string, string> = { submitted: '待审核', approved: '已通过', paid: '已付款', rejected: '已拒绝' }
const payoutStatusClass: Record<string, string> = { submitted: 'bg-[#fff4e8] text-[#b45309]', approved: 'bg-[#eef8f1] text-[#26734d]', paid: 'bg-[#eef4ff] text-[#315b9a]', rejected: 'bg-[#fff1f1] text-[#b94116]' }
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
  const [payouts, setPayouts] = useState<PayoutData['payouts']>([])
  const [showPayout, setShowPayout] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState<'alipay' | 'usdt'>('alipay')
  const [payoutRecipient, setPayoutRecipient] = useState({ account_name: '', account: '', network: '', address: '' })
  const [payoutSubmitting, setPayoutSubmitting] = useState(false)
  const [payoutMessage, setPayoutMessage] = useState('')

  const loadPayouts = async () => {
    const result = await api<PayoutData>('/account/payouts', { auth: true })
    setPayouts(result.payouts || [])
  }

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      api<ReferralData>('/account/referral', { auth: true }),
      api<CommissionData>('/account/commissions?page=1&size=10', { auth: true }),
      api<PayoutData>('/account/payouts', { auth: true }),
    ])
      .then(([referral, commission, payout]) => {
        setData(referral)
        setCommissions(commission.commissions || [])
        setPayouts(payout.payouts || [])
      })
      .catch((error) => setErr((error as Error).message))
      .finally(() => setLoading(false))
  }, [user])

  const submitPayout = async () => {
    if (!data || commission.available <= 0) return
    setPayoutSubmitting(true)
    setPayoutMessage('')
    try {
      await api('/account/payouts', {
        method: 'POST',
        auth: true,
        body: { amount: commission.available, method: payoutMethod, recipient: payoutRecipient },
      })
      setPayoutMessage('返现工单已提交，请等待后台审核。')
      setPayoutRecipient({ account_name: '', account: '', network: '', address: '' })
      setShowPayout(false)
      await loadPayouts()
    } catch (error) {
      setPayoutMessage((error as Error).message)
    } finally {
      setPayoutSubmitting(false)
    }
  }

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

        <div className="rounded-xl border border-[#e5e8ed] p-5"><div className="flex items-center gap-2"><Wallet size={17} className="text-[#ff6a1a]" /><h2 className="text-sm font-bold">返佣余额去向</h2></div><div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-[#e5e8ed] bg-[#e5e8ed] sm:grid-cols-3"><div className="bg-white p-3"><div className="text-xs text-[#7d8797]">待结算</div><div className="mt-1 text-lg font-bold">{loading ? '—' : money(commission.pending)}</div></div><div className="bg-white p-3"><div className="text-xs text-[#7d8797]">可用返佣</div><div className="mt-1 text-lg font-bold text-[#26734d]">{loading ? '—' : money(commission.available)}</div></div><div className="bg-white p-3"><div className="text-xs text-[#7d8797]">已完成</div><div className="mt-1 text-lg font-bold">{loading ? '—' : money(commission.paid)}</div></div></div><div className="mt-5"><button onClick={() => { setPayoutMessage(''); setShowPayout(true) }} disabled={loading || commission.available <= 0 || payoutSubmitting} className="flex w-full items-center justify-between rounded-lg bg-[#14171f] px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-[#242936] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"><span>申请返现</span><Landmark size={15} /><span className="sr-only">可用返佣为零时不可申请返现</span></button></div>{payoutMessage && <p aria-live="polite" className="mt-3 text-sm text-[#26734d]">{payoutMessage}</p>}<p className="mt-3 text-xs leading-relaxed text-[#9aa3b0]">返佣仅以返现工单形式结算，不兑换为牛气值。用户提交支付宝或 USDT 收款信息后，由后台审核并人工打款。</p></div></section>

      {showPayout && <section className="mt-6 rounded-xl border border-[#e5e8ed] bg-[#fafbfc] p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-bold">提交返现工单</h2><p className="mt-1 text-xs text-[#7d8797]">本次将申请全部可用返佣：{money(commission.available)}。收款信息会保存为本次工单快照。</p></div><button type="button" onClick={() => setShowPayout(false)} className="text-sm text-[#7d8797] hover:text-[#14171f]">关闭</button></div><div className="mt-5 flex gap-2"><button type="button" onClick={() => setPayoutMethod('alipay')} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${payoutMethod === 'alipay' ? 'border-[#ff6a1a] bg-[#fff4ee] text-[#c44e13]' : 'border-[#e1e5ea] bg-white text-[#697386]'}`}>支付宝</button><button type="button" onClick={() => setPayoutMethod('usdt')} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${payoutMethod === 'usdt' ? 'border-[#ff6a1a] bg-[#fff4ee] text-[#c44e13]' : 'border-[#e1e5ea] bg-white text-[#697386]'}`}>USDT</button></div><div className="mt-4 grid gap-4 sm:grid-cols-2">{payoutMethod === 'alipay' ? <><label className="text-xs font-medium text-[#697386]">支付宝实名<input value={payoutRecipient.account_name} onChange={(e) => setPayoutRecipient({ ...payoutRecipient, account_name: e.target.value })} className="mt-2 w-full rounded-lg border border-[#dfe3e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ff6a1a]" placeholder="请输入支付宝实名" /></label><label className="text-xs font-medium text-[#697386]">支付宝账号<input value={payoutRecipient.account} onChange={(e) => setPayoutRecipient({ ...payoutRecipient, account: e.target.value })} className="mt-2 w-full rounded-lg border border-[#dfe3e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ff6a1a]" placeholder="手机号或邮箱" /></label></> : <><label className="text-xs font-medium text-[#697386]">链名称<input value={payoutRecipient.network} onChange={(e) => setPayoutRecipient({ ...payoutRecipient, network: e.target.value })} className="mt-2 w-full rounded-lg border border-[#dfe3e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ff6a1a]" placeholder="例如 TRC20" /></label><label className="text-xs font-medium text-[#697386]">USDT 收款地址<input value={payoutRecipient.address} onChange={(e) => setPayoutRecipient({ ...payoutRecipient, address: e.target.value })} className="mt-2 w-full rounded-lg border border-[#dfe3e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ff6a1a]" placeholder="请输入收款地址" /></label></>}</div><button type="button" onClick={submitPayout} disabled={payoutSubmitting} className="mt-5 rounded-lg bg-[#ff6a1a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e65d12] active:scale-[0.98] disabled:opacity-50">{payoutSubmitting ? '提交中…' : '提交返现申请'}</button></section>}

      <section className="mt-8"><div className="mb-3"><h2 className="text-sm font-bold">返现工单</h2><p className="mt-1 text-xs text-[#9aa3b0]">你提交的返现申请会在这里显示审核与打款状态。</p></div><div className="overflow-x-auto rounded-xl border border-[#e5e8ed]"><table className="min-w-[620px] w-full divide-y divide-[#e5e8ed] text-left"><thead className="bg-[#fafbfc]"><tr>{['工单', '金额', '方式', '状态', '申请时间', '备注'].map((label) => <th key={label} className="px-4 py-3 text-xs font-medium text-[#7d8797]">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf0f3] bg-white">{payouts.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#7d8797]">暂无返现工单</td></tr> : payouts.map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono text-xs text-[#4f5968]">#{item.id}</td><td className="px-4 py-3 text-sm font-semibold">{money(item.amount)}</td><td className="px-4 py-3 text-sm">{item.method === 'alipay' ? '支付宝' : 'USDT'}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${payoutStatusClass[item.status] || 'bg-[#f1f3f5] text-[#697386]'}`}>{payoutStatus[item.status] || item.status}</span></td><td className="px-4 py-3 text-sm text-[#697386]">{new Date(item.requested_at).toLocaleDateString('zh-CN')}</td><td className="max-w-[220px] truncate px-4 py-3 text-xs text-[#7d8797]">{item.admin_note || '—'}</td></tr>)}</tbody></table></div></section>

      <section className="mt-8"><div className="mb-3"><h2 className="text-sm font-bold">返佣记录</h2><p className="mt-1 text-xs text-[#9aa3b0]">展示最近 10 条订单结算记录。</p></div><div className="overflow-x-auto rounded-xl border border-[#e5e8ed]"><table className="min-w-[680px] w-full divide-y divide-[#e5e8ed] text-left"><thead className="bg-[#fafbfc]"><tr>{['订单', '基数', '返佣比例', '返佣金额', '状态', '时间'].map((label) => <th key={label} className="px-4 py-3 text-xs font-medium text-[#7d8797]">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf0f3] bg-white">{!loading && commissions.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#7d8797]">暂无返佣记录</td></tr> : commissions.map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono text-xs text-[#4f5968]">{item.order_id}</td><td className="px-4 py-3 text-sm">{money(item.base_amount)}</td><td className="px-4 py-3 text-sm font-semibold">{item.commission_rate}%</td><td className="px-4 py-3 text-sm font-semibold text-[#26734d]">{money(item.commission_amount)}</td><td className="px-4 py-3 text-sm text-[#697386]">{item.status === 'available' ? '可用' : item.status === 'pending' ? '待结算' : item.status === 'paid' ? '已提现' : '处理中'}</td><td className="px-4 py-3 text-sm text-[#697386]">{new Date(item.created_at).toLocaleDateString('zh-CN')}</td></tr>)}</tbody></table></div></section>
    </div>
  )
}
