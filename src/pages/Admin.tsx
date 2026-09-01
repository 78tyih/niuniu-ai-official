import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { api, fmtPrice, CHANNEL_LABEL } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const ADMIN_EMAILS = ['010708lei@gmail.com']

type Tab = 'dashboard' | 'orders' | 'keys' | 'feedback'

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
  ]

  return (
    <div className="flex min-h-screen bg-[#fafaf8] text-[#111111]">
      {/* 侧边导航 */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
        <div className="border-b border-[#f0eee9] px-6 py-5">
          <div className="font-display text-lg font-bold">牛牛AI 管理台</div>
          <div className="mt-1 truncate text-xs text-[#9ca3af]">{user.email}</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
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
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'orders' && <Orders />}
        {tab === 'keys' && <Keys />}
        {tab === 'feedback' && <Feedback />}
      </main>
    </div>
  )
}

/* ============ 仪表盘 ============ */
function Dashboard() {
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
      <h1 className="font-display text-2xl font-bold">仪表盘</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card-light rounded-2xl p-6">
            <div className="text-xs text-[#9ca3af]">{label}</div>
            <div className="mt-2 font-display text-3xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      {/* 库存 */}
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

      {/* 缺货订单告警 */}
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

/* ============ 订单 ============ */
function Orders() {
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

  useEffect(load, [load])

  const fulfill = async (orderNo: string) => {
    setMsg('')
    try {
      const d = await api<{ result: string }>(`/admin/orders/${orderNo}/fulfill`, { method: 'POST', auth: true })
      setMsg(d.result === 'delivered' ? `${orderNo} 已发货` : `${orderNo}：${d.result}`)
      load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold">订单</h1>
        <div className="ml-auto flex flex-wrap gap-2">
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
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-[#d4530f]">{msg}</p>}

      <div className="card-light mt-5 overflow-x-auto rounded-2xl">
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

      <div className="mt-4 flex items-center gap-3 text-sm text-[#6b7280]">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 disabled:opacity-40">上一页</button>
        <span>{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 disabled:opacity-40">下一页</button>
      </div>
    </div>
  )
}

/* ============ 卡密库存 ============ */
function Keys() {
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
    try {
      await api(`/admin/card-keys/${id}/disable`, { method: 'POST', auth: true })
      load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 50)) : 1

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold">卡密库存</h1>
        <div className="ml-auto flex flex-wrap gap-2">
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
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-[#d4530f]">{msg}</p>}

      <div className="card-light mt-5 overflow-x-auto rounded-2xl">
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
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-[#9ca3af]">暂无卡密，点击右上角导入</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm text-[#6b7280]">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 disabled:opacity-40">上一页</button>
        <span>{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 disabled:opacity-40">下一页</button>
      </div>

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
    setSending(true)
    setErr('')
    setResult('')
    try {
      const d = await api<{ total: number; imported: number; duplicated: number }>(
        '/admin/card-keys/import',
        { body: { planCode, batch, text }, auth: true },
      )
      setResult(`共 ${d.total} 行，成功导入 ${d.imported} 条，重复跳过 ${d.duplicated} 条`)
      setText('')
      if (d.imported > 0) setTimeout(onDone, 1200)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-[#e5e7eb] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">导入卡密</h3>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#111111]">✕</button>
        </div>
        <p className="mt-1 text-xs text-[#9ca3af]">
          从上游控制台拿到授权码后粘贴到下面，每行一条。可选格式：<code className="font-mono">授权码,采购成本(元)</code>
        </p>
        <div className="mt-4 flex gap-2">
          <select value={planCode} onChange={(e) => setPlanCode(e.target.value)}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
            {Object.entries(PLAN_LABEL).map(([c, l]) => <option key={c} value={c}>{l}</option>)}
          </select>
          <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="批次名（如 2026-09-01）"
            className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#f97316]" />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={'NN-XXXX-XXXX-XXXX\nNN-YYYY-YYYY-YYYY,150'}
          className="mt-3 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 font-mono text-sm outline-none focus:border-[#f97316]"
        />
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

/* ============ 用户反馈 ============ */
function Feedback() {
  const [items, setItems] = useState<FeedbackItem[] | null>(null)
  const [status, setStatus] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    const params = status ? `?status=${status}` : ''
    api<{ feedback: FeedbackItem[] }>(`/admin/feedback${params}`, { auth: true }).then((d) => setItems(d.feedback)).catch((e) => setMsg(e.message))
  }, [status])

  useEffect(load, [load])

  const markDone = async (id: number) => {
    try {
      await api(`/admin/feedback/${id}/done`, { method: 'POST', auth: true })
      load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold">用户反馈</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="ml-auto rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
          <option value="">全部</option>
          <option value="new">未处理</option>
          <option value="done">已处理</option>
        </select>
      </div>
      {msg && <p className="mt-3 text-sm text-[#d4530f]">{msg}</p>}

      <div className="mt-5 space-y-3">
        {(items || []).map((f) => (
          <div key={f.id} className="card-light rounded-xl px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#f97316]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#f97316]">
                {FB_TYPE_LABEL[f.type] || f.type}
              </span>
              <span className="text-xs text-[#9ca3af]">{new Date(f.created_at + 'Z').toLocaleString('zh-CN')}</span>
              <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                f.status === 'new' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
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
