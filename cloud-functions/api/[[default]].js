// 牛牛AI 官网 API · EdgeOne Pages Cloud Functions 版
// 真实 Node.js 运行时，直接复用 Express；路由同时兼容 /api/xxx 与 /xxx
import express from 'express'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { randomBytes } from 'node:crypto'

const app = express()
app.use(express.json())

// 路径归一化：无论平台是否剥离 /api 前缀都能命中
app.use((req, _res, next) => {
  if (req.url.startsWith('/api')) req.url = req.url.slice(4) || '/'
  next()
})

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || ''

// 所有出站请求带 10s 超时，避免平台 30s 才兜底返回 504
const timeoutFetch = (url, opts = {}) => fetch(url, { ...opts, signal: AbortSignal.timeout(10000) })

const admin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
      global: { fetch: timeoutFetch },
    })
  : null
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null

const configMissing = (res) => res.status(503).json({
  error: 'backend_not_configured',
  message: '后端未配置：请在 EdgeOne 项目环境变量中设置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
})

async function requireUser(req, res) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'unauthorized', message: '请先登录' })
    return null
  }
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ error: 'invalid_token', message: '登录已过期，请重新登录' })
    return null
  }
  return data.user
}

// 管理员白名单（客服圆圆本人）；也可用环境变量 ADMIN_EMAILS 覆盖，逗号分隔
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '010708lei@gmail.com')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)

async function requireAdmin(req, res) {
  const user = await requireUser(req, res)
  if (!user) return null
  const isAdmin = ADMIN_EMAILS.includes((user.email || '').toLowerCase())
    || user.user_metadata?.role === 'admin'
  if (!isAdmin) {
    res.status(403).json({ error: 'forbidden', message: '需要管理员权限' })
    return null
  }
  return user
}

async function audit(adminId, action, detail = {}) {
  try {
    await admin.from('admin_audit_log').insert({ admin_id: adminId, action, detail })
  } catch { /* 审计失败不阻塞主流程 */ }
}

app.get('/', (_req, res) => res.json({ name: '牛牛AI API', ok: true }))

// 部署自检：只暴露布尔与耗时，不泄露任何密钥
app.get('/__health', async (_req, res) => {
  const report = {
    ok: true,
    node: process.version,
    env: {
      SUPABASE_URL: Boolean(SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(SUPABASE_SERVICE_ROLE_KEY),
      STRIPE_SECRET_KEY: Boolean(STRIPE_SECRET_KEY),
      PUBLIC_BASE_URL: Boolean(PUBLIC_BASE_URL),
    },
  }
  if (SUPABASE_URL) {
    const t0 = Date.now()
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/`, { signal: AbortSignal.timeout(5000) })
      report.supabaseReachable = true
      report.supabaseRestStatus = r.status
      report.supabaseRestMs = Date.now() - t0
    } catch (err) {
      report.supabaseReachable = false
      report.supabaseRestError = String(err?.name === 'TimeoutError' ? 'timeout_5s' : (err?.message || err))
      report.supabaseRestMs = Date.now() - t0
    }
    if (admin) {
      const t1 = Date.now()
      const { error } = await admin.from('plans').select('code', { count: 'exact', head: true })
      report.plansQueryMs = Date.now() - t1
      if (error) report.plansQueryError = error.message
    }
  }
  res.json(report)
})

app.get('/plans', async (_req, res) => {
  if (!admin) return configMissing(res)
  const { data, error } = await admin.from('plans').select('*').eq('is_active', true).order('price_cents')
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  res.json({ notice: '官方 C 端直营价 · 经销商成交价以其签约文件为准', plans: data })
})

app.get('/subscription', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  const { data: sub } = await admin.from('subscriptions').select('*, plans(name)').eq('user_id', user.id).maybeSingle()
  const { data: orders } = await admin.from('orders')
    .select('order_no, plan_code, amount_cents, channel, status, delivered_code, delivery_status, created_at, paid_at, plans(name)')
    .eq('user_id', user.id).order('id', { ascending: false }).limit(20)
  res.json({
    subscription: sub ? { ...sub, plan_name: sub.plans?.name, plans: undefined } : null,
    orders: (orders || []).map((o) => ({ ...o, plan_name: o.plans?.name, plans: undefined })),
  })
})

app.post('/orders', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  const { planCode, channel } = req.body || {}
  if (!['wechat', 'alipay', 'stripe'].includes(channel)) {
    return res.status(400).json({ error: 'invalid_channel' })
  }
  const { data: plan } = await admin.from('plans').select('*').eq('code', planCode).eq('is_active', true).maybeSingle()
  if (!plan) return res.status(404).json({ error: 'plan_not_found' })

  const orderNo = 'NN' + Date.now() + randomBytes(3).toString('hex').toUpperCase()
  const { error } = await admin.from('orders').insert({
    order_no: orderNo, user_id: user.id, plan_code: plan.code, amount_cents: plan.price_cents, channel,
  })
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })

  if (channel === 'stripe') {
    if (!stripe) return res.json({ orderNo, channel, mode: 'demo', message: '未配置 STRIPE_SECRET_KEY，已进入演示支付模式' })
    try {
      const base = PUBLIC_BASE_URL || `https://${req.headers.host}`
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: { currency: 'cny', unit_amount: plan.price_cents, product_data: { name: `牛牛AI ${plan.name}` } },
          quantity: 1,
        }],
        metadata: { order_no: orderNo },
        success_url: `${base}/payment/result?order=${orderNo}&status=success`,
        cancel_url: `${base}/payment/result?order=${orderNo}&status=cancel`,
      })
      await admin.from('orders').update({ stripe_session_id: session.id }).eq('order_no', orderNo)
      return res.json({ orderNo, channel, mode: 'stripe', checkoutUrl: session.url })
    } catch (err) {
      return res.status(502).json({ error: 'stripe_error', message: String(err?.message || err) })
    }
  }

  res.json({
    orderNo, channel, mode: 'demo',
    qrPayload: `niuniu-demo-pay://${channel}/${orderNo}?amount=${(plan.price_cents / 100).toFixed(2)}`,
    message: '演示环境：未接入真实微信/支付宝商户，二维码为模拟收银台',
  })
})

app.post('/pay/mock-confirm', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  const { orderNo } = req.body || {}
  const { data: order } = await admin.from('orders').select('*').eq('order_no', orderNo).eq('user_id', user.id).maybeSingle()
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  const { error } = await admin.rpc('mark_order_paid', { p_order_no: orderNo })
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  res.json({ ok: true, orderNo })
})

app.post('/pay/stripe-verify', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  const { orderNo } = req.body || {}
  const { data: order } = await admin.from('orders').select('*').eq('order_no', orderNo).eq('user_id', user.id).maybeSingle()
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  if (order.status === 'paid') return res.json({ status: 'paid' })
  if (!stripe || !order.stripe_session_id) return res.json({ status: order.status })
  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
    if (session.payment_status === 'paid') {
      await admin.rpc('mark_order_paid', { p_order_no: orderNo })
      return res.json({ status: 'paid' })
    }
    res.json({ status: session.payment_status || order.status })
  } catch (err) {
    res.status(502).json({ error: 'stripe_error', message: String(err?.message || err) })
  }
})

// 单笔订单查询（支付结果页轮询用）：仅本人可见
app.get('/orders/:orderNo', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  const { data: order } = await admin.from('orders')
    .select('order_no, plan_code, amount_cents, channel, status, delivered_code, delivery_status, created_at, paid_at, plans(name)')
    .eq('order_no', req.params.orderNo).eq('user_id', user.id).maybeSingle()
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  res.json({ order: { ...order, plan_name: order.plans?.name, plans: undefined } })
})

// ============ 用户反馈（登录可选） ============
app.post('/feedback', async (req, res) => {
  if (!admin) return configMissing(res)
  const { type, content, contact } = req.body || {}
  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: 'invalid_content', message: '请填写反馈内容' })
  }
  // 尝试识别登录用户，不强制
  let userId = null
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) {
    const { data } = await admin.auth.getUser(header.slice(7))
    userId = data?.user?.id || null
  }
  const { error } = await admin.from('feedback').insert({
    user_id: userId,
    type: ['bug', 'suggest', 'consult', 'other'].includes(type) ? type : 'other',
    content: String(content).slice(0, 2000),
    contact: contact ? String(contact).slice(0, 200) : null,
  })
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  res.json({ ok: true, message: '已收到你的反馈，感谢！' })
})

// ============ 管理台 API ============
app.get('/admin/stats', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireAdmin(req, res)
  if (!user) return
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayIso = todayStart.toISOString()

  const [ordersAll, ordersToday, paidAgg, usersToday, stock, pendingStock] = await Promise.all([
    admin.from('orders').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    admin.from('orders').select('amount_cents').eq('status', 'paid'),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    admin.from('card_keys').select('plan_code').eq('status', 'available'),
    admin.from('orders').select('order_no, plan_code, paid_at').eq('delivery_status', 'out_of_stock').order('paid_at', { ascending: false }).limit(20),
  ])
  const revenueCents = (paidAgg.data || []).reduce((s, o) => s + (o.amount_cents || 0), 0)
  const stockByPlan = {}
  for (const k of stock.data || []) stockByPlan[k.plan_code] = (stockByPlan[k.plan_code] || 0) + 1
  res.json({
    ordersTotal: ordersAll.count || 0,
    ordersToday: ordersToday.count || 0,
    revenueCents,
    usersToday: usersToday.count || 0,
    stockByPlan,
    outOfStockOrders: pendingStock.data || [],
  })
})

app.get('/admin/orders', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireAdmin(req, res)
  if (!user) return
  const { status, delivery, q } = req.query
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const size = 20
  let query = admin.from('orders')
    .select('id, order_no, user_id, plan_code, amount_cents, channel, status, delivered_code, delivery_status, created_at, paid_at, plans(name)', { count: 'exact' })
    .order('id', { ascending: false })
    .range((page - 1) * size, page * size - 1)
  if (status) query = query.eq('status', status)
  if (delivery) query = query.eq('delivery_status', delivery)
  if (q) query = query.ilike('order_no', `%${q}%`)
  const { data, count, error } = await query
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  res.json({
    total: count || 0, page, size,
    orders: (data || []).map((o) => ({ ...o, plan_name: o.plans?.name, plans: undefined })),
  })
})

// 手动补单发货（库存回补后）
app.post('/admin/orders/:orderNo/fulfill', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireAdmin(req, res)
  if (!user) return
  const { data, error } = await admin.rpc('fulfill_order', { p_order_no: req.params.orderNo })
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  await audit(user.id, 'order_fulfill', { order_no: req.params.orderNo, result: data })
  res.json({ result: data })
})

// 卡密批量导入：textarea 每行一条，格式 `码` 或 `码,成本价(元)`
app.post('/admin/card-keys/import', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireAdmin(req, res)
  if (!user) return
  const { planCode, batch, text } = req.body || {}
  const { data: plan } = await admin.from('plans').select('code').eq('code', planCode).maybeSingle()
  if (!plan) return res.status(404).json({ error: 'plan_not_found' })
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return res.status(400).json({ error: 'empty_input', message: '请粘贴卡密，每行一条' })
  if (lines.length > 500) return res.status(400).json({ error: 'too_many', message: '单次最多导入 500 条' })

  const rows = []
  const skipped = []
  for (const line of lines) {
    const [codeRaw, costRaw] = line.split(/[,，]/).map((s) => (s || '').trim())
    const code = codeRaw
    if (!code) { skipped.push({ line, reason: 'empty_code' }); continue }
    let cost_cents = null
    if (costRaw) {
      const n = Number(costRaw)
      if (Number.isFinite(n) && n >= 0) cost_cents = Math.round(n * 100)
    }
    rows.push({ code, plan_code: planCode, batch: batch || '', cost_cents })
  }
  const { data: inserted, error } = await admin.from('card_keys')
    .upsert(rows, { onConflict: 'code', ignoreDuplicates: true })
    .select('id')
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  await audit(user.id, 'card_keys_import', { plan_code: planCode, batch, total: lines.length, imported: inserted?.length || 0 })
  res.json({ ok: true, total: lines.length, imported: inserted?.length || 0, duplicated: rows.length - (inserted?.length || 0), skipped })
})

app.get('/admin/card-keys', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireAdmin(req, res)
  if (!user) return
  const { status, planCode, batch } = req.query
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const size = 50
  let query = admin.from('card_keys')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false })
    .range((page - 1) * size, page * size - 1)
  if (status) query = query.eq('status', status)
  if (planCode) query = query.eq('plan_code', planCode)
  if (batch) query = query.eq('batch', batch)
  const { data, count, error } = await query
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  // 批次列表供筛选
  const { data: batches } = await admin.from('card_keys').select('batch').neq('batch', '').limit(200)
  res.json({ total: count || 0, page, size, keys: data || [], batches: [...new Set((batches || []).map((b) => b.batch))] })
})

app.post('/admin/card-keys/:id/disable', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireAdmin(req, res)
  if (!user) return
  const { data: key } = await admin.from('card_keys').select('id, status').eq('id', req.params.id).maybeSingle()
  if (!key) return res.status(404).json({ error: 'not_found' })
  if (key.status !== 'available') return res.status(400).json({ error: 'not_available', message: '仅可用状态的卡密可禁用' })
  const { error } = await admin.from('card_keys').update({ status: 'disabled' }).eq('id', key.id)
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  await audit(user.id, 'card_key_disable', { id: key.id })
  res.json({ ok: true })
})

app.get('/admin/feedback', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireAdmin(req, res)
  if (!user) return
  const { status } = req.query
  let query = admin.from('feedback').select('*').order('id', { ascending: false }).limit(100)
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  res.json({ feedback: data || [] })
})

app.post('/admin/feedback/:id/done', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireAdmin(req, res)
  if (!user) return
  const { error } = await admin.from('feedback').update({ status: 'done' }).eq('id', req.params.id)
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  await audit(user.id, 'feedback_done', { id: Number(req.params.id) })
  res.json({ ok: true })
})

export default app
