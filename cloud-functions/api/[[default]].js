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
    .select('order_no, plan_code, amount_cents, channel, status, created_at, paid_at, plans(name)')
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

export default app
