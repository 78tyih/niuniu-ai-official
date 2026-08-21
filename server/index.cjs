// 牛牛AI 官网后端 Demo
// 栈：Express + SQLite + JWT；支付：Stripe（有 key 走真实 Checkout）+ 微信/支付宝（模拟扫码流程）
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('./db.cjs')

const app = express()
const PORT = process.env.PORT || 8787
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
const stripe = STRIPE_SECRET_KEY ? require('stripe')(STRIPE_SECRET_KEY) : null

app.use(cors())
// Stripe webhook 需要原始 body，必须在 express.json() 之前注册
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(501).json({ error: 'stripe_not_configured' })
  }
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: 'invalid_signature' })
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    markOrderPaid(session.metadata && session.metadata.order_no)
  }
  res.json({ received: true })
})
app.use(express.json())

// ---------- 工具 ----------
const signToken = (user) =>
  jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '14d' })

function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'invalid_token' })
  }
}

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, phone: u.phone, created_at: u.created_at })

function planExpiry(plan, base) {
  const d = new Date(base)
  if (plan.days > 0) d.setDate(d.getDate() + plan.days)
  else d.setMonth(d.getMonth() + plan.months)
  return d
}

function markOrderPaid(orderNo) {
  if (!orderNo) return
  const order = db.prepare('SELECT * FROM orders WHERE order_no = ?').get(orderNo)
  if (!order || order.status === 'paid') return
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(order.plan_id)

  const tx = db.transaction(() => {
    db.prepare(`UPDATE orders SET status = 'paid', paid_at = datetime('now') WHERE order_no = ?`).run(orderNo)
    const existing = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(order.user_id)
    const now = new Date()
    if (existing && existing.status === 'active' && new Date(existing.expires_at) > now) {
      // 续费：在现有到期时间上顺延；保留当前套餐标识，避免短期卡覆盖长期卡
      const base = planExpiry(plan, existing.expires_at)
      db.prepare(
        `UPDATE subscriptions SET expires_at = ?, nq_balance = nq_balance + ?, last_order_no = ? WHERE user_id = ?`
      ).run(base.toISOString(), plan.nq_credit, orderNo, order.user_id)
    } else {
      const expires = planExpiry(plan, now)
      db.prepare(
        `INSERT INTO subscriptions (user_id, plan_id, status, started_at, expires_at, nq_balance, last_order_no)
         VALUES (?, ?, 'active', ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET plan_id=excluded.plan_id, status='active',
           started_at=excluded.started_at, expires_at=excluded.expires_at,
           nq_balance=excluded.nq_balance, last_order_no=excluded.last_order_no`
      ).run(order.user_id, plan.id, now.toISOString(), expires.toISOString(), plan.nq_credit, orderNo)
    }
  })
  tx()
}

// ---------- 认证 ----------
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body || {}
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'invalid_input', message: '邮箱必填，密码至少 6 位' })
  }
  if (phone && !/^1\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'invalid_phone', message: '手机号格式不正确' })
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (exists) return res.status(409).json({ error: 'email_taken', message: '该邮箱已注册' })
  const hash = bcrypt.hashSync(password, 10)
  const info = db.prepare('INSERT INTO users (email, name, phone, password_hash) VALUES (?, ?, ?, ?)').run(email, name || '', phone || null, hash)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email || '')
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'bad_credentials', message: '邮箱或密码不正确' })
  }
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.get('/api/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.uid)
  if (!user) return res.status(404).json({ error: 'not_found' })
  res.json({ user: publicUser(user) })
})

// 绑定手机号（演示环境：未接短信验证码；正式环境需短信核验）
app.post('/api/me/phone', authRequired, (req, res) => {
  const { phone } = req.body || {}
  if (!/^1\d{10}$/.test(phone || '')) {
    return res.status(400).json({ error: 'invalid_phone', message: '请输入 11 位大陆手机号' })
  }
  db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(phone, req.user.uid)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.uid)
  res.json({ user: publicUser(user) })
})

// ---------- 套餐与订阅 ----------
app.get('/api/plans', (_req, res) => {
  const plans = db.prepare('SELECT * FROM plans WHERE is_active = 1 ORDER BY price_cents').all()
  res.json({
    demo: true,
    notice: '官方 C 端直营价 · 经销商成交价以其签约文件为准',
    plans: plans.map((p) => ({ ...p, features: JSON.parse(p.features) })),
  })
})

app.get('/api/subscription', authRequired, (req, res) => {
  const sub = db.prepare(`
    SELECT s.*, p.name AS plan_name, p.code AS plan_code, p.price_cents, p.interval
    FROM subscriptions s JOIN plans p ON p.id = s.plan_id WHERE s.user_id = ?
  `).get(req.user.uid)
  const orders = db.prepare(`
    SELECT o.order_no, o.amount_cents, o.channel, o.status, o.created_at, o.paid_at, p.name AS plan_name
    FROM orders o JOIN plans p ON p.id = o.plan_id WHERE o.user_id = ? ORDER BY o.id DESC LIMIT 20
  `).all(req.user.uid)
  res.json({ subscription: sub || null, orders })
})

// ---------- 支付 ----------
app.post('/api/orders', authRequired, (req, res) => {
  const { planCode, channel } = req.body || {}
  if (!['wechat', 'alipay', 'stripe'].includes(channel)) {
    return res.status(400).json({ error: 'invalid_channel' })
  }
  const plan = db.prepare('SELECT * FROM plans WHERE code = ? AND is_active = 1').get(planCode || '')
  if (!plan) return res.status(404).json({ error: 'plan_not_found' })

  const orderNo = 'NN' + Date.now() + crypto.randomBytes(3).toString('hex').toUpperCase()
  db.prepare('INSERT INTO orders (order_no, user_id, plan_id, amount_cents, channel) VALUES (?, ?, ?, ?, ?)')
    .run(orderNo, req.user.uid, plan.id, plan.price_cents, channel)

  if (channel === 'stripe') {
    if (!stripe) {
      // 无 Stripe key：回退演示模式，前端走模拟支付
      return res.json({ orderNo, channel, mode: 'demo', message: '未配置 STRIPE_SECRET_KEY，已进入演示支付模式' })
    }
    // 真实 Stripe Checkout
    return (async () => {
      try {
        const base = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [{
            price_data: {
              currency: 'cny',
              unit_amount: plan.price_cents,
              product_data: { name: `牛牛AI ${plan.name}` },
            },
            quantity: 1,
          }],
          metadata: { order_no: orderNo },
          success_url: `${base}/payment/result?order=${orderNo}&status=success`,
          cancel_url: `${base}/payment/result?order=${orderNo}&status=cancel`,
        })
        db.prepare('UPDATE orders SET stripe_session_id = ? WHERE order_no = ?').run(session.id, orderNo)
        res.json({ orderNo, channel, mode: 'stripe', checkoutUrl: session.url })
      } catch (err) {
        res.status(502).json({ error: 'stripe_error', message: String(err.message || err) })
      }
    })()
  }

  // 微信 / 支付宝：演示模式返回收银台载荷（真实环境在此调用微信 Native / 支付宝当面付下单）
  res.json({
    orderNo,
    channel,
    mode: 'demo',
    qrPayload: `niuniu-demo-pay://${channel}/${orderNo}?amount=${(plan.price_cents / 100).toFixed(2)}`,
    message: '演示环境：未接入真实微信/支付宝商户，二维码为模拟收银台',
  })
})

// 模拟支付成功（演示用；真实环境由支付平台异步通知替代）
app.post('/api/pay/mock/confirm', authRequired, (req, res) => {
  const { orderNo } = req.body || {}
  const order = db.prepare('SELECT * FROM orders WHERE order_no = ? AND user_id = ?').get(orderNo || '', req.user.uid)
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  markOrderPaid(orderNo)
  res.json({ ok: true, orderNo })
})

// Stripe 回流校验（未配置 webhook 时的兜底：用户跳回后主动向 Stripe 核实）
app.post('/api/pay/stripe/verify', authRequired, async (req, res) => {
  const { orderNo } = req.body || {}
  const order = db.prepare('SELECT * FROM orders WHERE order_no = ? AND user_id = ?').get(orderNo || '', req.user.uid)
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  if (order.status === 'paid') return res.json({ status: 'paid' })
  if (!stripe || !order.stripe_session_id) return res.json({ status: order.status })
  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
    if (session.payment_status === 'paid') {
      markOrderPaid(orderNo)
      return res.json({ status: 'paid' })
    }
    res.json({ status: session.payment_status || order.status })
  } catch (err) {
    res.status(502).json({ error: 'stripe_error', message: String(err.message || err) })
  }
})

app.get('/api/orders/:orderNo', authRequired, (req, res) => {
  const order = db.prepare(`
    SELECT o.*, p.name AS plan_name FROM orders o JOIN plans p ON p.id = o.plan_id
    WHERE o.order_no = ? AND o.user_id = ?
  `).get(req.params.orderNo, req.user.uid)
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  res.json({ order })
})

// ---------- 生产环境托管前端 ----------
const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`[server] 牛牛AI 官网后端已启动: http://localhost:${PORT}`)
  console.log(`[server] Stripe: ${stripe ? '已配置（真实 Checkout）' : '未配置（演示模式）'}`)
})
