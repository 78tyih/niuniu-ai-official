import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { api, fmtPrice, CHANNEL_LABEL } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const ADMIN_EMAILS = ['010708lei@gmail.com']

type Tab = 'dashboard' | 'orders' | 'keys' | 'feedback' | 'users' | 'plans' | 'subscriptions' | 'commissions' | 'payouts' | 'audit'

interface Stats {
  ordersTotal: number
  ordersToday: number
  revenueCents: number
  usersToday: number
  stockByPlan: Record<string, number>
  outOfStockOrders: { order_no: string; plan_code: string; paid_at: string }[]
}

interface AdminOrder {
  id: number
  order_no: string
  plan_name: string
  plan_code: string
  amount_cents: number
  channel: string
  status: string
  delivered_code: string | null
  delivery_status: string
  created_at: string
  paid_at: string | null
}

interface CardKey {
  id: number
  code: string
  plan_code: string
  batch: string
  cost_cents: number | null
  status: 'available' | 'sold' | 'disabled'
  order_no: string | null
  sold_at: string | null
  created_at: string
}

interface FeedbackItem {
  id: number
  type: string
  content: string
  contact: string | null
  status: 'new' | 'done'
  created_at: string
}

interface AdminUser {
  id: string
  name: string | null
  nickname: string | null
  phone: string | null
  email: string | null
  account_status: string
  created_at: string
}

interface PlanItem {
  code: string
  name: string
  price_cents: number
  is_active: boolean
  recommended: boolean
  commissionable: boolean
  nq_credit: number
  entitlements: any[]
}

interface EntitlementDef {
  code: string
  name: string
  category: string
}

interface CommissionItem {
  id: number
  beneficiary_user_id: string
  referred_user_id: string
  order_id: number
  base_amount: number
  commission_rate: number
  commission_amount: number
  status: string
  available_at: string
  created_at: string
}

interface PayoutItem {
  id: number
  user_id: string
  amount: number
  method: string
  status: string
  requested_at: string
  admin_note: string | null
}

interface AuditItem {
  id: number
  actor_type: string
  actor_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  created_at: string
}

const PLAN_LABEL: Record<string, string> = {
  days3: '3 天卡', monthly: '月卡', quarterly: '季卡', yearly: '年卡',
}
const FB_TYPE_LABEL: Record<string, string> = {
  bug: '使用问题', suggest: '功能建议', consult: '支付与订阅', other: '其他',
}
const KEY_STATUS_LABEL: Record<string, [string, string]> = {
  available: ['可用', 'bg-emerald-50 text-emerald-600'],
  sold: ['已售出', 'bg-[#6b7280]/10 text-[#6b7280]'],
  disabled: ['已禁用', 'bg-red-50 text-red-500'],
}
const COMM_STATUS_LABEL: Record<string, string> = {
  pending: '待结算', available: '可提现', reserved: '已锁定', paid: '已支付', reversed: '已撤销',
}
const PAYOUT_STATUS_LABEL: Record<string, [string, string]> = {
  submitted: ['待审核', 'bg-amber-50 text-amber-600'],
  reviewing: ['审核中', 'bg-blue-50 text-blue-600'],
  approved: ['已通过', 'bg-emerald-50 text-emerald-600'],
  paid: ['已付款', 'bg-[#6b7280]/10 text-[#6b7280]'],
  rejected: ['已拒绝', 'bg-red-50 text-red-500'],
  cancelled: ['已取消', 'bg-[#6b7280]/10 text-[#6b7280]'],
}

export default function Admin() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('dashboard')

  const isAdmin = !!user && (ADMIN_EMAILS.includes((user.email || '').toLowerCase()) || (user as any).user_metadata?.role === 'admin')

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fafaf8] text-[#9ca3af]">加载中…</div>
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fafaf8]">
        <p className="text-[#6b7280]">当前账号没有管理台权限</p>
        <Link to="/" className="text-sm text-[#f97316] underline underline-offset-4">返回首页</Link>
      </div>
    )
  }

  const TABS: [Tab, string][] = [
    ['dashboard', '仪表盘'],
    ['orders', '订单'],
    ['keys', '卡密库存'],
    ['feedback', '用户反馈'],
    ['users', '用户管理'],
    ['plans', '套餐管理'],
    ['subscriptions', '订阅管理'],
    ['commissions', '返佣管理'],
    ['payouts', '提现审核'],
    ['audit', '审计日志'],
  ]

  return (
    <div className="flex min-h-screen bg-[#fafaf8] text-[#111111]">
      <aside className="flex w-52 shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
        <div className="border-b border-[#f0eee9] px-6 py-5">
          <div className="font-display text-lg font-bold">牛牛AI 管理台</div>
          <div className="mt-1 truncate text-xs text-[#9ca3af]">{user.email}</div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                tab === key ? 'bg-[#111111] text-white' : 'text-[#6b7280] hover:bg-[#f5f3ee] hover:text-[#111111]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-[#f0eee9] p-4">
          <Link to="/" className="text-xs text-[#9ca3af] hover:text-[#111111]">← 返回官网</Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-8">
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'keys' && <KeysTab />}
        {tab === 'feedback' && <FeedbackTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'plans' && <PlansTab />}
        {tab === 'subscriptions' && <SubscriptionsTab />}
        {tab === 'commissions' && <CommissionsTab />}
        {tab === 'payouts' && <PayoutsTab />}
        {tab === 'audit' && <AuditTab />}
      </main>
    </div>
  )
}

/* ============================================================ */
/* 通用组件 */
function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      {children && <div className="ml-auto flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  return (
    <div className="mt-4 flex items-center gap-3 text-sm text-[#6b7280]">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 disabled:opacity-40">上一页</button>
      <span>{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 disabled:opacity-40">下一页</button>
    </div>
  )
}

/* ============================================================ */
/* 仪表盘 */
function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    api<Stats>('/admin/stats', { auth: true }).then(setStats).catch((e) => setErr(e.message))
  }, [])

  if (err) return <p className="text-sm text-[#d4530f]">{err}</p>
  if (!stats) return <p className="text-sm text-[#9ca3af]">加载中…</p>

  const cards: [string, string][] = [
    ['今日订单', String(stats.ordersToday)],
    ['累计订单', String(stats.ordersTotal)],
    ['累计成交额', fmtPrice(stats.revenueCents)],
    ['今日新增用户', String(stats.usersToday)],
  ]

  return (
    <div>
      <PageHeader title="仪表盘" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card-light rounded-2xl p-6">
            <div className="text-xs text-[#9ca3af]">{label}</div>
            <div className="mt-2 font-display text-3xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold">卡密库存余量</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(PLAN_LABEL).map(([code, label]) => {
          const n = stats.stockByPlan[code] || 0
          return (
            <div key={code} className={`card-light rounded-2xl p-6 ${n === 0 ? 'border-red-200 bg-red-50/40' : n < 5 ? 'border-amber-200 bg-amber-50/40' : ''}`}>
              <div className="text-xs text-[#9ca3af]">{label}</div>
              <div className={`mt-2 font-display text-3xl font-bold ${n === 0 ? 'text-red-500' : n < 5 ? 'text-amber-500' : ''}`}>
                {n} <span className="text-sm font-normal text-[#9ca3af]">张</span>
              </div>
              {n === 0 && <div className="mt-1 text-xs text-red-500">缺货！请尽快从上游补码</div>}
              {n > 0 && n < 5 && <div className="mt-1 text-xs text-amber-500">库存偏低</div>}
            </div>
          )
        })}
      </div>

      {stats.outOfStockOrders.length > 0 && (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <h2 className="text-sm font-semibold text-red-600">待发码订单（已支付但缺货）</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {stats.outOfStockOrders.map((o) => (
              <li key={o.order_no} className="flex items-center gap-3">
                <code className="font-mono text-xs">{o.order_no}</code>
                <span className="text-[#6b7280]">{PLAN_LABEL[o.plan_code] || o.plan_code}</span>
                <span className="text-xs text-[#9ca3af]">{o.paid_at ? new Date(o.paid_at + 'Z').toLocaleString('zh-CN') : ''}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[#9ca3af]">补码后请到「订单」页对这些订单执行手动发货。</p>
        </div>
      )}
    </div>
  )
}

/* ============================================================ */
/* 订单 */
function OrdersTab() {
  const [data, setData] = useState<{ total: number; orders: AdminOrder[] } | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [delivery, setDelivery] = useState('')
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set('status', status)
    if (delivery) params.set('delivery', delivery)
    if (q) params.set('q', q)
    api<{ total: number; orders: AdminOrder[] }>(`/admin/orders?${params}`, { auth: true }).then(setData).catch((e) => setMsg(e.message))
  }, [page, status, delivery, q])

  useEffect(() => { load() }, [load])

  const fulfill = async (orderNo: string) => {
    setMsg('')
    try {
      const d = await api<{ result: string }>(`/admin/orders/${orderNo}/fulfill`, { method: 'POST', auth: true })
      setMsg(d.result === 'delivered' ? `${orderNo} 已发货` : `${orderNo}：${d.result}`)
      load()
    } catch (e) { setMsg((e as Error).message) }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1

  return (
    <div>
      <PageHeader title="订单">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="搜索订单号"
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#f97316]" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
          <option value="">全部状态</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付</option>
        </select>
        <select value={delivery} onChange={(e) => { setDelivery(e.target.value); setPage(1) }}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
          <option value="">全部发货状态</option>
          <option value="delivered">已发货</option>
          <option value="out_of_stock">待发码</option>
        </select>
      </PageHeader>
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}

      <div className="card-light overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f0eee9] text-left text-xs text-[#9ca3af]">
              <th className="px-5 py-3 font-medium">订单号</th>
              <th className="px-4 py-3 font-medium">套餐</th>
              <th className="px-4 py-3 font-medium">金额</th>
              <th className="px-4 py-3 font-medium">渠道</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">授权码</th>
              <th className="px-4 py-3 font-medium">创建时间</th>
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(data?.orders || []).map((o) => (
              <tr key={o.id} className="border-b border-[#f5f3ee] last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-[#6b7280]">{o.order_no}</td>
                <td className="px-4 py-3">{o.plan_name}</td>
                <td className="px-4 py-3">{fmtPrice(o.amount_cents)}</td>
                <td className="px-4 py-3 text-[#6b7280]">{CHANNEL_LABEL[o.channel] || o.channel}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    o.status === 'paid'
                      ? o.delivery_status === 'out_of_stock' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      : 'bg-[#f97316]/10 text-[#d4530f]'
                  }`}>
                    {o.status === 'paid' ? (o.delivery_status === 'out_of_stock' ? '待发码' : '已支付') : '待支付'}
                  </span>
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-[#6b7280]">{o.delivered_code || '—'}</td>
                <td className="px-4 py-3 text-xs text-[#9ca3af]">{new Date(o.created_at + 'Z').toLocaleString('zh-CN')}</td>
                <td className="px-5 py-3">
                  {o.status === 'paid' && o.delivery_status === 'out_of_stock' && (
                    <button onClick={() => fulfill(o.order_no)}
                      className="rounded-lg bg-[#f97316] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#ea6a0c]">
                      手动发货
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data && data.orders.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-[#9ca3af]">没有匹配的订单</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

/* ============================================================ */
/* 卡密库存 */
function KeysTab() {
  const [data, setData] = useState<{ total: number; keys: CardKey[]; batches: string[] } | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [planCode, setPlanCode] = useState('')
  const [msg, setMsg] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set('status', status)
    if (planCode) params.set('planCode', planCode)
    api<{ total: number; keys: CardKey[]; batches: string[] }>(`/admin/card-keys?${params}`, { auth: true }).then(setData).catch((e) => setMsg(e.message))
  }, [page, status, planCode])

  useEffect(load, [load])

  const disable = async (id: number) => {
    setMsg('')
    try { await api(`/admin/card-keys/${id}/disable`, { method: 'POST', auth: true }); load() } catch (e) { setMsg((e as Error).message) }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 50)) : 1

  return (
    <div>
      <PageHeader title="卡密库存">
        <select value={planCode} onChange={(e) => { setPlanCode(e.target.value); setPage(1) }}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
          <option value="">全部套餐</option>
          {Object.entries(PLAN_LABEL).map(([c, l]) => <option key={c} value={c}>{l}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
          <option value="">全部状态</option>
          <option value="available">可用</option>
          <option value="sold">已售出</option>
          <option value="disabled">已禁用</option>
        </select>
        <button onClick={() => setImportOpen(true)}
          className="rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea6a0c]">
          + 导入卡密
        </button>
      </PageHeader>
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}

      <div className="card-light overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f0eee9] text-left text-xs text-[#9ca3af]">
              <th className="px-5 py-3 font-medium">卡密</th>
              <th className="px-4 py-3 font-medium">套餐</th>
              <th className="px-4 py-3 font-medium">批次</th>
              <th className="px-4 py-3 font-medium">采购成本</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">绑定订单</th>
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(data?.keys || []).map((k) => (
              <tr key={k.id} className="border-b border-[#f5f3ee] last:border-0">
                <td className="max-w-[220px] truncate px-5 py-3 font-mono text-xs">{k.code}</td>
                <td className="px-4 py-3">{PLAN_LABEL[k.plan_code] || k.plan_code}</td>
                <td className="px-4 py-3 text-xs text-[#6b7280]">{k.batch || '—'}</td>
                <td className="px-4 py-3 text-xs text-[#6b7280]">{k.cost_cents != null ? fmtPrice(k.cost_cents) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${KEY_STATUS_LABEL[k.status]?.[1]}`}>
                    {KEY_STATUS_LABEL[k.status]?.[0] || k.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#9ca3af]">{k.order_no || '—'}</td>
                <td className="px-5 py-3">
                  {k.status === 'available' && (
                    <button onClick={() => disable(k.id)} className="text-xs text-red-400 hover:text-red-600">禁用</button>
                  )}
                </td>
              </tr>
            ))}
            {data && data.keys.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-[#9ca3af]">暂无卡密</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onDone={() => { setImportOpen(false); load() }} />}
    </div>
  )
}

function ImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [planCode, setPlanCode] = useState('monthly')
  const [batch, setBatch] = useState(() => new Date().toISOString().slice(0, 10))
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState('')
  const [err, setErr] = useState('')

  const submit = async () => {
    setSending(true); setErr(''); setResult('')
    try {
      const d = await api<{ total: number; imported: number; duplicated: number }>(
        '/admin/card-keys/import', { body: { planCode, batch, text }, auth: true },
      )
      setResult(`共 ${d.total} 行，成功导入 ${d.imported} 条`)
      if (d.imported > 0) setTimeout(onDone, 1200)
    } catch (e) { setErr((e as Error).message) } finally { setSending(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-[#e5e7eb] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">导入卡密</h3>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#111111]">✕</button>
        </div>
        <p className="mt-1 text-xs text-[#9ca3af]">每行一条，格式：<code className="font-mono">授权码,采购成本(元)</code></p>
        <div className="mt-4 flex gap-2">
          <select value={planCode} onChange={(e) => setPlanCode(e.target.value)}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
            {Object.entries(PLAN_LABEL).map(([c, l]) => <option key={c} value={c}>{l}</option>)}
          </select>
          <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="批次名"
            className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#f97316]" />
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder={'NN-XXXX-XXXX-XXXX\nNN-YYYY-YYYY-YYYY,150'}
          className="mt-3 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 font-mono text-sm outline-none focus:border-[#f97316]" />
        <div className="mt-4 flex items-center gap-3">
          <button onClick={submit} disabled={sending || !text.trim()}
            className="rounded-lg bg-[#f97316] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#ea6a0c] disabled:opacity-50">
            {sending ? '导入中…' : '开始导入'}
          </button>
          {result && <p className="text-sm text-emerald-600">{result}</p>}
          {err && <p className="text-sm text-[#d4530f]">{err}</p>}
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/* 用户反馈 */
function FeedbackTab() {
  const [items, setItems] = useState<FeedbackItem[] | null>(null)
  const [status, setStatus] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    const params = status ? `?status=${status}` : ''
    api<{ feedback: FeedbackItem[] }>(`/admin/feedback${params}`, { auth: true }).then((d) => setItems(d.feedback)).catch((e) => setMsg(e.message))
  }, [status])

  useEffect(load, [load])

  const markDone = async (id: number) => {
    try { await api(`/admin/feedback/${id}/done`, { method: 'POST', auth: true }); load() } catch (e) { setMsg((e as Error).message) }
  }

  return (
    <div>
      <PageHeader title="用户反馈">
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
          <option value="">全部</option>
          <option value="new">未处理</option>
          <option value="done">已处理</option>
        </select>
      </PageHeader>
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}
      <div className="space-y-3">
        {(items || []).map((f) => (
          <div key={f.id} className="card-light rounded-xl px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#f97316]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#f97316]">{FB_TYPE_LABEL[f.type] || f.type}</span>
              <span className="text-xs text-[#9ca3af]">{new Date(f.created_at + 'Z').toLocaleString('zh-CN')}</span>
              <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-medium ${f.status === 'new' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {f.status === 'new' ? '未处理' : '已处理'}
              </span>
              {f.status === 'new' && (
                <button onClick={() => markDone(f.id)} className="text-xs text-[#6b7280] hover:text-[#111111]">标记已处理</button>
              )}
            </div>
            <p className="mt-2.5 text-sm leading-relaxed">{f.content}</p>
            {f.contact && <p className="mt-2 text-xs text-[#9ca3af]">联系方式：{f.contact}</p>}
          </div>
        ))}
        {items && items.length === 0 && <p className="py-8 text-center text-sm text-[#9ca3af]">暂无反馈</p>}
      </div>
    </div>
  )
}

/* ============================================================ */
/* 用户管理 */
function UsersTab() {
  const [data, setData] = useState<{ total: number; users: AdminUser[] } | null>(null)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (q) params.set('q', q)
    api<{ total: number; users: AdminUser[] }>(`/admin/users?${params}`, { auth: true }).then(setData).catch((e) => setMsg(e.message))
  }, [page, q])

  useEffect(() => { load() }, [load])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1

  return (
    <div>
      <PageHeader title="用户管理">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="搜索用户名/邮箱/昵称"
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#f97316]" />
      </PageHeader>
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}
      <div className="card-light overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f0eee9] text-left text-xs text-[#9ca3af]">
              <th className="px-5 py-3 font-medium">用户 ID</th>
              <th className="px-4 py-3 font-medium">邮箱</th>
              <th className="px-4 py-3 font-medium">昵称</th>
              <th className="px-4 py-3 font-medium">手机</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {(data?.users || []).map((u) => (
              <tr key={u.id} className="border-b border-[#f5f3ee] last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-[#6b7280]">{u.id.slice(0, 8)}…</td>
                <td className="px-4 py-3">{u.email || '—'}</td>
                <td className="px-4 py-3">{u.nickname || u.name || '—'}</td>
                <td className="px-4 py-3">{u.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    u.account_status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                  }`}>{u.account_status === 'active' ? '正常' : u.account_status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#9ca3af]">{u.created_at ? new Date(u.created_at + 'Z').toLocaleString('zh-CN') : '—'}</td>
              </tr>
            ))}
            {data && data.users.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-[#9ca3af]">暂无用户</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

/* ============================================================ */
/* 套餐管理 */
function PlansTab() {
  const [data, setData] = useState<{ plans: PlanItem[]; entitlementDefs: EntitlementDef[] } | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [selectedEnts, setSelectedEnts] = useState<Record<string, string[]>>({})
  const [msg, setMsg] = useState('')

  const load = () => {
    api<{ plans: PlanItem[]; entitlementDefs: EntitlementDef[] }>('/admin/plans', { auth: true })
      .then((d) => {
        setData(d)
        const map: Record<string, string[]> = {}
        for (const p of d.plans) {
          map[p.code] = (p.entitlements || []).map((e: any) => e.entitlement_code)
        }
        setSelectedEnts(map)
      })
      .catch((e) => setMsg(e.message))
  }

  useEffect(() => { load() }, [])

  const updatePlan = async (code: string, updates: Partial<PlanItem>) => {
    try {
      await api(`/admin/plans/${code}`, { method: 'PUT', body: updates, auth: true })
      setMsg('已保存')
      load()
    } catch (e) { setMsg((e as Error).message) }
  }

  const saveEntitlements = async (code: string) => {
    try {
      const codes = selectedEnts[code] || []
      await api(`/admin/plans/${code}/entitlements`, {
        method: 'POST',
        body: { entitlements: codes.map((c) => ({ code: c })) },
        auth: true,
      })
      setMsg('权益配置已保存')
      setEditing(null)
      load()
    } catch (e) { setMsg((e as Error).message) }
  }

  const toggleEnt = (code: string, entCode: string) => {
    setSelectedEnts((prev) => {
      const arr = prev[code] || []
      if (arr.includes(entCode)) return { ...prev, [code]: arr.filter((c) => c !== entCode) }
      return { ...prev, [code]: [...arr, entCode] }
    })
  }

  if (!data) return <p className="text-sm text-[#9ca3af]">加载中…</p>

  return (
    <div>
      <PageHeader title="套餐管理" />
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}
      <div className="space-y-4">
        {data.plans.map((plan) => (
          <div key={plan.code} className="card-light rounded-2xl p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <span className="rounded-full bg-[#f97316]/10 px-2.5 py-0.5 text-xs font-semibold text-[#f97316]">{fmtPrice(plan.price_cents)}</span>
              {plan.recommended && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">推荐</span>}
              <div className="ml-auto flex gap-2">
                <button onClick={() => updatePlan(plan.code, { is_active: !plan.is_active })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${plan.is_active ? 'border border-[#e5e7eb] text-[#6b7280] hover:border-red-300 hover:text-red-500' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                  {plan.is_active ? '下架' : '上架'}
                </button>
                <button onClick={() => { setEditing(editing === plan.code ? null : plan.code); load() }}
                  className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-xs font-semibold text-[#6b7280] hover:border-[#111111] hover:text-[#111111]">
                  {editing === plan.code ? '收起' : '配置权益'}
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#6b7280]">
              <span>牛气值：<b className="text-[#111111]">{plan.nq_credit.toLocaleString('zh-CN')}</b></span>
              <span>推广：<b className="text-[#111111]">{plan.commissionable ? '可返佣' : '不可返佣'}</b></span>
              <span>排序：<b className="text-[#111111]">{plan.code}</b></span>
            </div>
            {editing === plan.code && (
              <div className="mt-5 border-t border-[#f0eee9] pt-5">
                <p className="mb-3 text-xs font-semibold text-[#6b7280]">包含权益</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {data.entitlementDefs.map((def) => (
                    <label key={def.code} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#f0eee9] p-2.5 hover:bg-[#fafaf8]">
                      <input
                        type="checkbox"
                        checked={(selectedEnts[plan.code] || []).includes(def.code)}
                        onChange={() => toggleEnt(plan.code, def.code)}
                        className="h-4 w-4 accent-[#f97316]"
                      />
                      <div>
                        <div className="text-sm font-medium">{def.name}</div>
                        <div className="text-[11px] text-[#9ca3af]">{def.category === 'core' ? '核心' : '服务'}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => saveEntitlements(plan.code)}
                    className="rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea6a0c]">
                    保存权益配置
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm text-[#6b7280] hover:border-[#111111]">
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================ */
/* 订阅管理 */
function SubscriptionsTab() {
  const [data, setData] = useState<{ total: number; subscriptions: any[] } | null>(null)
  const [page, setPage] = useState(1)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    api<{ total: number; subscriptions: any[] }>(`/admin/subscriptions?page=${page}`, { auth: true })
      .then(setData).catch((e) => setMsg(e.message))
  }, [page])

  useEffect(() => { load() }, [load])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1

  return (
    <div>
      <PageHeader title="订阅管理" />
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}
      <div className="card-light overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f0eee9] text-left text-xs text-[#9ca3af]">
              <th className="px-5 py-3 font-medium">用户 ID</th>
              <th className="px-4 py-3 font-medium">套餐</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">到期时间</th>
              <th className="px-4 py-3 font-medium">牛气值</th>
            </tr>
          </thead>
          <tbody>
            {(data?.subscriptions || []).map((s) => (
              <tr key={s.id} className="border-b border-[#f5f3ee] last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-[#6b7280]">{s.user_id.slice(0, 8)}…</td>
                <td className="px-4 py-3">{s.plan_name || s.plan_code}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.status === 'active' && new Date(s.expires_at) > new Date()
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-[#6b7280]/10 text-[#6b7280]'
                  }`}>{s.status === 'active' && new Date(s.expires_at) > new Date() ? '生效中' : '已过期'}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#6b7280]">{s.expires_at ? new Date(s.expires_at + 'Z').toLocaleString('zh-CN') : '—'}</td>
                <td className="px-4 py-3">{(s.nq_balance || 0).toLocaleString('zh-CN')}</td>
              </tr>
            ))}
            {data && data.subscriptions.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#9ca3af]">暂无订阅</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

/* ============================================================ */
/* 返佣管理 */
function CommissionsTab() {
  const [data, setData] = useState<{ total: number; commissions: CommissionItem[] } | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set('status', status)
    api<{ total: number; commissions: CommissionItem[] }>(`/admin/commissions?${params}`, { auth: true })
      .then(setData).catch((e) => setMsg(e.message))
  }, [page, status])

  useEffect(() => { load() }, [load])

  const payCommission = async (id: number) => {
    try {
      await api(`/admin/commissions/${id}/pay`, { method: 'PUT', auth: true })
      setMsg('已标记为已支付')
      load()
    } catch (e) { setMsg((e as Error).message) }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1

  return (
    <div>
      <PageHeader title="返佣管理">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
          <option value="">全部状态</option>
          <option value="pending">待结算</option>
          <option value="available">可提现</option>
          <option value="paid">已支付</option>
          <option value="reversed">已撤销</option>
        </select>
      </PageHeader>
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}
      <div className="card-light overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f0eee9] text-left text-xs text-[#9ca3af]">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">受益人</th>
              <th className="px-4 py-3 font-medium">订单金额</th>
              <th className="px-4 py-3 font-medium">返佣比例</th>
              <th className="px-4 py-3 font-medium">返佣金额</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">创建时间</th>
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(data?.commissions || []).map((c) => (
              <tr key={c.id} className="border-b border-[#f5f3ee] last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-[#6b7280]">#{c.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.beneficiary_user_id.slice(0, 8)}…</td>
                <td className="px-4 py-3">{fmtPrice(c.base_amount)}</td>
                <td className="px-4 py-3">{c.commission_rate}%</td>
                <td className="px-4 py-3 font-semibold">{fmtPrice(c.commission_amount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    c.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                    c.status === 'paid' ? 'bg-[#6b7280]/10 text-[#6b7280]' :
                    c.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-500'
                  }`}>{COMM_STATUS_LABEL[c.status] || c.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#9ca3af]">{new Date(c.created_at + 'Z').toLocaleString('zh-CN')}</td>
                <td className="px-5 py-3">
                  {c.status === 'available' && (
                    <button onClick={() => payCommission(c.id)}
                      className="rounded-lg bg-[#f97316] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#ea6a0c]">
                      标记已支付
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data && data.commissions.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-[#9ca3af]">暂无返佣记录</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

/* ============================================================ */
/* 提现审核 */
function PayoutsTab() {
  const [data, setData] = useState<{ total: number; payouts: PayoutItem[] } | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set('status', status)
    api<{ total: number; payouts: PayoutItem[] }>(`/admin/payouts?${params}`, { auth: true })
      .then(setData).catch((e) => setMsg(e.message))
  }, [page, status])

  useEffect(() => { load() }, [load])

  const act = async (id: number, action: 'approve' | 'reject' | 'pay') => {
    try {
      await api(`/admin/payouts/${id}`, { method: 'PUT', body: { action }, auth: true })
      setMsg('操作成功')
      load()
    } catch (e) { setMsg((e as Error).message) }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1
  const METHOD_LABEL: Record<string, string> = { wechat: '微信', alipay: '支付宝', bank: '银行卡', usdt: 'USDT' }

  return (
    <div>
      <PageHeader title="提现审核">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
          <option value="">全部状态</option>
          <option value="submitted">待审核</option>
          <option value="approved">已通过</option>
          <option value="paid">已付款</option>
          <option value="rejected">已拒绝</option>
        </select>
      </PageHeader>
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}
      <div className="card-light overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f0eee9] text-left text-xs text-[#9ca3af]">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">用户 ID</th>
              <th className="px-4 py-3 font-medium">金额</th>
              <th className="px-4 py-3 font-medium">方式</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">申请时间</th>
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(data?.payouts || []).map((p) => (
              <tr key={p.id} className="border-b border-[#f5f3ee] last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-[#6b7280]">#{p.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.user_id.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-semibold">{fmtPrice(p.amount)}</td>
                <td className="px-4 py-3">{METHOD_LABEL[p.method] || p.method}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYOUT_STATUS_LABEL[p.status]?.[1] || 'bg-[#6b7280]/10 text-[#6b7280]'}`}>
                    {PAYOUT_STATUS_LABEL[p.status]?.[0] || p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#9ca3af]">{new Date(p.requested_at + 'Z').toLocaleString('zh-CN')}</td>
                <td className="px-5 py-3 flex gap-1.5">
                  {p.status === 'submitted' && (
                    <>
                      <button onClick={() => act(p.id, 'approve')} className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-600">通过</button>
                      <button onClick={() => act(p.id, 'reject')} className="rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50">拒绝</button>
                    </>
                  )}
                  {p.status === 'approved' && (
                    <button onClick={() => act(p.id, 'pay')} className="rounded-lg bg-[#f97316] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#ea6a0c]">标记已付款</button>
                  )}
                </td>
              </tr>
            ))}
            {data && data.payouts.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-[#9ca3af]">暂无提现申请</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

/* ============================================================ */
/* 审计日志 */
function AuditTab() {
  const [data, setData] = useState<{ total: number; logs: AuditItem[] } | null>(null)
  const [page, setPage] = useState(1)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    api<{ total: number; logs: AuditItem[] }>(`/admin/audit-logs?page=${page}`, { auth: true })
      .then(setData).catch((e) => setMsg(e.message))
  }, [page])

  useEffect(() => { load() }, [load])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 30)) : 1

  return (
    <div>
      <PageHeader title="审计日志" />
      {msg && <p className="mb-3 text-sm text-[#d4530f]">{msg}</p>}
      <div className="card-light overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f0eee9] text-left text-xs text-[#9ca3af]">
              <th className="px-5 py-3 font-medium">时间</th>
              <th className="px-4 py-3 font-medium">操作者</th>
              <th className="px-4 py-3 font-medium">操作</th>
              <th className="px-4 py-3 font-medium">资源</th>
              <th className="px-4 py-3 font-medium">资源 ID</th>
            </tr>
          </thead>
          <tbody>
            {(data?.logs || []).map((l) => (
              <tr key={l.id} className="border-b border-[#f5f3ee] last:border-0">
                <td className="px-5 py-3 text-xs text-[#9ca3af]">{new Date(l.created_at + 'Z').toLocaleString('zh-CN')}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    l.actor_type === 'admin' ? 'bg-purple-50 text-purple-600' :
                    l.actor_type === 'system' ? 'bg-blue-50 text-blue-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>{l.actor_type}</span>
                  <span className="ml-1.5 font-mono text-xs text-[#6b7280]">{l.actor_id.slice(0, 12)}…</span>
                </td>
                <td className="px-4 py-3 font-medium">{l.action}</td>
                <td className="px-4 py-3 text-[#6b7280]">{l.resource_type || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#9ca3af]">{l.resource_id || '—'}</td>
              </tr>
            ))}
            {data && data.logs.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#9ca3af]">暂无日志</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
