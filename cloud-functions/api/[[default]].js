// 牛牛AI 官网 API · EdgeOne Pages Cloud Functions 版
// 真实 Node.js 运行时，直接复用 Express；路由同时兼容 /api/xxx 与 /xxx
import express from 'express'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { randomBytes, createHash } from 'node:crypto'

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

// ============ ZPay 聚合支付（微信/支付宝免签通道） ============
const ZPAY_PID = process.env.ZPAY_PID || ''
const ZPAY_KEY = process.env.ZPAY_KEY || ''
const ZPAY_GATEWAY = (process.env.ZPAY_GATEWAY || 'https://zpayz.cn').replace(/\/+$/, '')
const zpayEnabled = Boolean(ZPAY_PID && ZPAY_KEY)

// ZPay 经典 MD5 签名：参数按 key 升序拼 k=v&...，末尾直接拼密钥，排除 sign/sign_type/空值
function zpaySign(params) {
  const str = Object.keys(params)
    .filter((k) => k !== 'sign' && k !== 'sign_type' && params[k] !== '' && params[k] != null)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&') + ZPAY_KEY
  return createHash('md5').update(str, 'utf8').digest('hex')
}

// ============ 事务邮件（SMTP 未配置时自动降级为不发送） ============
const mailer = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_PORT || '465') === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 8000,
    })
  : null
const MAIL_FROM = process.env.SMTP_FROM || process.env.SMTP_USER || ''
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || '010708lei@gmail.com'

async function sendMail(to, subject, text, html) {
  if (!mailer) return false
  try {
    await mailer.sendMail({ from: MAIL_FROM, to, subject, text, html })
    return true
  } catch (err) {
    console.error('[mail] send failed:', err?.message || err)
    return false
  }
}

const orderPaidHtml = ({ planName, orderNo, amount, code }) => `
  <div style="font-family:-apple-system,'PingFang SC',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#14171f">
    <h2 style="margin:0 0 8px">支付成功 · 牛牛AI</h2>
    <p style="color:#6b7280;font-size:14px">你购买的 <b>${planName}</b> 已生效（订单号 ${orderNo}，金额 ¥${amount}）。</p>
    ${code ? `
    <div style="margin:20px 0;padding:16px;border-radius:12px;background:#f5f3ee">
      <div style="font-size:12px;color:#9aa0ad">你的授权码（在牛牛AI 软件内输入激活）</div>
      <div style="margin-top:8px;font-family:monospace;font-size:16px;font-weight:700;letter-spacing:1px">${code}</div>
    </div>` : `
    <p style="font-size:14px;color:#d4530f">该套餐授权码暂时缺货，客服补码后会第一时间发给你，也可以直接回复本邮件或联系客服。</p>`}
    <p style="font-size:13px;color:#6b7280">也可以随时登录 <a href="https://niuniuai.app/account">niuniuai.app/account</a> 查看订阅与授权码。</p>
    <p style="font-size:12px;color:#9aa0ad;margin-top:24px">客服时间 9:00–18:00 · QQ 群 638778129<br>牛牛AI 是交易流程辅助工具，不承诺任何收益，交易风险由你自行承担。</p>
  </div>`

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

async function getAccountDashboard(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  try {
    // 订阅
    const { data: sub } = await admin
      .from('subscriptions')
      .select('id, plan_code, status, starts_at, expires_at, nq_balance, last_order_no, plans(name, recommended)')
      .eq('user_id', user.id)
      .maybeSingle()

    // 牛气值
    const { data: credit } = await admin
      .from('credit_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()

    // 最近订单
    const { data: orders } = await admin
      .from('orders')
      .select('order_no, plan_code, amount_cents, channel, status, created_at, paid_at, plans(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // 推广统计
    const { data: referrals } = await admin
      .from('referrals')
      .select('count(id)', { count: 'exact' })
      .eq('referrer_user_id', user.id)

    const { data: paidReferrals } = await admin
      .from('referrals')
      .select('count(id)', { count: 'exact' })
      .eq('referrer_user_id', user.id)
      .not.isNull('first_paid_order_id')

    // 佣金统计
    const { data: commPending } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'pending')
    const { data: commAvailable } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'available')
    const { data: commPaid } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'paid')

    const commissionPending = commPending?.[0]?.sum || 0
    const commissionAvailable = commAvailable?.[0]?.sum || 0
    const commissionPaid = commPaid?.[0]?.sum || 0

    // 最近牛气记录
    const { data: creditHistory } = await admin
      .from('credit_ledger')
      .select('created_at, transaction_type, amount, balance_after')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    res.json({
      subscription: sub || null,
      credits: credit ? credit.balance : 0,
      recentOrders: (orders || []).map(o => ({ ...o, plan_name: o.plans?.name })),
      referral: {
        totalRegistrations: referrals?.[0]?.count || 0,
        paidUsers: paidReferrals?.[0]?.count || 0,
      },
      commission: {
        pending: commissionPending,
        available: commissionAvailable,
        paid: commissionPaid,
      },
      recentCredits: creditHistory || [],
    })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function getAccountSubscription(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  try {
    const { data: sub } = await admin
      .from('subscriptions')
      .select('*, plans(name, description)')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!sub) return res.json({ subscription: null })
    // 关联权益
    const { data: entitlements } = await admin
      .from('user_entitlements')
      .select('entitlement_code, entitlement_definitions(name, description)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('entitlement_definitions(sort_order)')
    res.json({ subscription: sub, entitlements })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function getAccountOrders(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  const page = Math.max(1, parseInt(req.query.page || 1))
  const size = Math.max(1, parseInt(req.query.size || 20))
  try {
    const { data: orders } = await admin
      .from('orders')
      .select('order_no, plan_code, amount_cents, channel, status, created_at, paid_at, plans(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * size, page * size - 1)
    const { count } = await admin
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
    res.json({
      orders: (orders || []).map(o => ({ ...o, plan_name: o.plans?.name })),
      total: count || 0,
      page,
      size,
    })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function getAccountOrder(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  const { orderNo } = req.params
  try {
    const { data: order } = await admin
      .from('orders')
      .select('*, plans(name)')
      .eq('order_no', orderNo)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!order) return res.status(404).json({ error: 'not_found', message: '订单不存在' })
    res.json({ order: { ...order, plan_name: order.plans?.name } })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function getAccountCredits(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  try {
    const { data: wallet } = await admin
      .from('credit_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()
    res.json({ balance: wallet?.balance || 0 })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function getAccountCreditsHistory(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  const page = Math.max(1, parseInt(req.query.page || 1))
  const size = 20
  try {
    const { data: history } = await admin
      .from('credit_ledger')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * size, page * size - 1)
    const { count } = await admin
      .from('credit_ledger')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
    res.json({ history: history || [], total: count || 0, page, size })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function getAccountReferral(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  try {
    // 我的邀请码
    const { data: codes } = await admin
      .from('referral_codes')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
    const myCode = codes?.[0] || null

    // 统计
    const { data: referrals } = await admin
      .from('referrals')
      .select('count(id)', { count: 'exact' })
      .eq('referrer_user_id', user.id)
    const { data: paidReferrals } = await admin
      .from('referrals')
      .select('count(id)', { count: 'exact' })
      .eq('referrer_user_id', user.id)
      .not.isNull('first_paid_order_id')

    // 佣金统计
    const { data: commPending } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'pending')
    const { data: commAvailable } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'available')
    const { data: commPaid } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'paid')

    // 邀请记录
    const { data: records } = await admin
      .from('referrals')
      .select('id, referred_user_id, attributed_at, first_paid_order_id, status')
      .eq('referrer_user_id', user.id)
      .order('attributed_at', { ascending: false })
      .limit(50)
    // 脱敏显示，不暴露完整 user_id
    const sanitizedRecords = (records || []).map(r => ({
      ...r,
      referred_user_id: r.referred_user_id ? r.referred_user_id.slice(0, 8) + '...' : null,
    }))

    res.json({
      referralCode: myCode,
      referralUrl: myCode ? `${PUBLIC_BASE_URL}/?ref=${myCode.code}` : null,
      stats: {
        totalRegistrations: referrals?.[0]?.count || 0,
        paidUsers: paidReferrals?.[0]?.count || 0,
      },
      commission: {
        pending: commPending?.[0]?.sum || 0,
        available: commAvailable?.[0]?.sum || 0,
        paid: commPaid?.[0]?.sum || 0,
      },
      records: sanitizedRecords,
    })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function getAccountCommissions(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  const page = Math.max(1, parseInt(req.query.page || 1))
  const size = 20
  try {
    const { data: commissions } = await admin
      .from('commissions')
      .select('*')
      .eq('beneficiary_user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * size, page * size - 1)
    const { count } = await admin
      .from('commissions')
      .select('id', { count: 'exact' })
      .eq('beneficiary_user_id', user.id)
    // 计算统计
    const { data: pending } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'pending')
    const { data: available } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'available')
    const { data: paid } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'paid')
    res.json({
      commissions: commissions || [],
      total: count || 0,
      page,
      size,
      summary: {
        pending: pending?.[0]?.sum || 0,
        available: available?.[0]?.sum || 0,
        paid: paid?.[0]?.sum || 0,
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function createPayoutRequest(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  const { amount, method } = req.body || {}
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'invalid_amount', message: '提现金额必须大于 0' })
  }
  if (!['wechat', 'alipay', 'bank', 'usdt'].includes(method)) {
    return res.status(400).json({ error: 'invalid_method', message: '不支持该提现方式' })
  }
  // 校验可提现
  try {
    const { data: available } = await admin
      .from('commissions')
      .select('sum(commission_amount)')
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'available')
    const availableAmount = available?.[0]?.sum || 0
    if (amount > availableAmount) {
      return res.status(400).json({ error: 'insufficient_funds', message: `可提现佣金不足，当前可提现 ${(availableAmount / 100).toLocaleString('zh-CN')} 元` })
    }
    // 锁住佣金
    await admin
      .from('commissions')
      .update({ status: 'reserved' })
      .eq('beneficiary_user_id', user.id)
      .eq('status', 'available')
    // 创建提现请求
    const { error } = await admin
      .from('payout_requests')
      .insert({ user_id: user.id, amount, currency: 'CNY', method })
    if (error) throw error
    // 审计
    await audit(user.id, 'payout_requested', { amount, method })
    res.json({ ok: true, message: '提现申请已提交，审核通过后会尽快付款' })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function getAccountSettings(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  try {
    const { data } = await admin
      .from('profiles')
      .select('id, email, name, nickname, phone, avatar_url, account_status, country, locale')
      .eq('id', user.id)
      .maybeSingle()
    res.json({ profile: data || { id: user.id, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

async function updateAccountSettings(req, res) {
  const user = await requireUser(req, res)
  if (!user) return
  const { nickname, phone, avatar_url, country, locale } = req.body || {}
  try {
    const updates = {}
    if (nickname !== undefined) updates.nickname = nickname
    if (phone !== undefined) updates.phone = phone
    if (avatar_url !== undefined) updates.avatar_url = avatar_url
    if (country !== undefined) updates.country = country
    if (locale !== undefined) updates.locale = locale
    updates.updated_at = new Date().toISOString()
    const { error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (error) throw error
    await audit(user.id, 'profile_updated', { updates })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
}

// 完成支付后的统一 fulfillment
async function fulfillmentService(orderNo, userId, adminClient = admin) {
  // 找到订单
  const { data: order } = await adminClient
    .from('orders')
    .select('*')
    .eq('order_no', orderNo)
    .maybeSingle()
  if (!order || order.fulfilled_at) return 'already_fulfilled'

  // 1. 标记已支付
  await adminClient
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('order_no', orderNo)

  // 2. 获取套餐信息
  const { data: plan } = await adminClient
    .from('plans')
    .select('*')
    .eq('code', order.plan_code)
    .maybeSingle()

  // 3. 计算 interval（毫秒）
  const intervalMs = plan.days > 0
    ? plan.days * 86400000
    : plan.months * 30 * 86400000

  // 4. 处理订阅 - 顺延到期时间
  const { data: sub } = await adminClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (sub && sub.status === 'active' && sub.expires_at > new Date().toISOString()) {
    await adminClient
      .from('subscriptions')
      .update({
        expires_at: new Date(new Date(sub.expires_at).getTime() + intervalMs).toISOString(),
        nq_balance: sub.nq_balance + plan.nq_credit,
        last_order_no: orderNo,
        source_order_id: orderNo,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  } else {
    await adminClient
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_code: plan.code,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + intervalMs).toISOString(),
        nq_balance: plan.nq_credit,
        last_order_no: orderNo,
        source_order_id: orderNo,
      })
  }

  // 5. 发放牛气值
  if (plan.nq_credit > 0) {
    await adminClient.rpc('recharge_credits', {
      p_user_id: userId,
      p_amount: plan.nq_credit,
      p_source_type: 'order',
      p_source_id: orderNo,
      p_description: '套餐赠送牛气值',
    })
  }

  // 6. 处理返佣（有邀请关系时）
  if (order.referral_id) {
    await createCommissionForReferral(orderNo, order.user_id, order.amount_cents, adminClient)
  }

  // 7. 标记 fulfilled
  await adminClient
    .from('orders')
    .update({ fulfilled_at: new Date().toISOString() })
    .eq('order_no', orderNo)

  return 'fulfilled'
}

// 为邀请人生成佣金
async function createCommissionForReferral(orderId, referredUserId, orderAmountCents, adminClient = admin) {
  // 找到邀请关系
  const { data: referral } = await adminClient
    .from('referrals')
    .select('referrer_user_id, referral_code_id, id')
    .eq('referred_user_id', referredUserId)
    .maybeSingle()
  if (!referral) return

  // 找到适用的返佣规则（默认取第一个 active）
  const { data: rule } = await adminClient
    .from('commission_rules')
    .select('*')
    .eq('status', 'active')
    .order('rate', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!rule) return

  // 计算佣金
  let commissionAmount = 0
  if (rule.commission_type === 'percentage') {
    commissionAmount = Math.round(orderAmountCents * (rule.rate / 100))
  } else {
    commissionAmount = rule.fixed_amount
  }
  if (commissionAmount <= 0) return

  // 可用时间 = 现在 + hold_days
  const availableAt = new Date()
  availableAt.setDate(availableAt.getDate() + (rule.hold_days || 0))

  // 插入佣金记录
  await adminClient
    .from('commissions')
    .insert({
      beneficiary_user_id: referral.referrer_user_id,
      referred_user_id: referredUserId,
      order_id: orderId,
      rule_id: rule.id,
      base_amount: orderAmountCents,
      commission_rate: rule.rate,
      commission_amount: commissionAmount,
      currency: 'CNY',
      status: 'pending',
      available_at: availableAt.toISOString(),
    })

  // 更新 referral 标记首次付费
  await adminClient
    .from('referrals')
    .update({ first_paid_order_id: orderId })
    .eq('id', referral.id)

  // 审计
  await audit(referral.referrer_user_id, 'commission_created', {
    order_id: orderId,
    referral_id: referral.id,
    commission_amount: commissionAmount,
  })
}

// 自动生成默认邀请码给新用户
async function ensureReferralCodeForUser(userId, adminClient = admin) {
  const { data: existing } = await adminClient
    .from('referral_codes')
    .select('id')
    .eq('owner_user_id', userId)
    .limit(1)
  if (existing && existing.length > 0) return existing[0].id

  const { data } = await adminClient.rpc('generate_referral_code', { p_user_id: userId })
  return data
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
      ZPAY: Boolean(ZPAY_PID && ZPAY_KEY),
      SMTP: Boolean(mailer),
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

// ============ Referral Attribution（邀请码归因） ============
// 用户注册时绑定邀请人
app.post('/referral/bind', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  const { code } = req.body || {}
  if (!code) return res.status(400).json({ error: 'missing_code', message: '请输入邀请码' })
  try {
    // 查找邀请码
    const { data: refCode } = await admin
      .from('referral_codes')
      .select('id, owner_user_id')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .maybeSingle()
    if (!refCode) return res.status(404).json({ error: 'invalid_code', message: '邀请码无效' })
    if (refCode.owner_user_id === user.id) {
      return res.status(400).json({ error: 'self_referral', message: '不能邀请自己' })
    }
    // 检查是否已被邀请
    const { data: existing } = await admin
      .from('referrals')
      .select('id')
      .eq('referred_user_id', user.id)
      .maybeSingle()
    if (existing) return res.json({ ok: true, message: '已绑定邀请人' })
    // 绑定
    const { error } = await admin
      .from('referrals')
      .insert({
        referrer_user_id: refCode.owner_user_id,
        referred_user_id: user.id,
        referral_code_id: refCode.id,
      })
    if (error) throw error
    // 审计
    await audit(user.id, 'referral_bound', { referrer: refCode.owner_user_id, code: code.toUpperCase() })
    res.json({ ok: true, message: '绑定成功' })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
})

// 用户注册后自动生成邀请码
app.post('/account/ensure-referral-code', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  try {
    const code = await ensureReferralCodeForUser(user.id)
    res.json({ ok: true, code })
  } catch (err) {
    res.status(500).json({ error: 'db_error', message: String(err?.message || err) })
  }
})

// ============ Account API（个人中心） ============
app.get('/account/dashboard', getAccountDashboard)
app.get('/account/subscription', getAccountSubscription)
app.get('/account/orders', getAccountOrders)
app.get('/account/orders/:orderNo', getAccountOrder)
app.get('/account/credits', getAccountCredits)
app.get('/account/credits/history', getAccountCreditsHistory)
app.get('/account/referral', getAccountReferral)
app.get('/account/commissions', getAccountCommissions)
app.post('/account/payouts', createPayoutRequest)
app.get('/account/settings', getAccountSettings)
app.patch('/account/settings', updateAccountSettings)

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

  // ZPay 通道：微信/支付宝真实收款（配置 ZPAY_PID/ZPAY_KEY 后生效）
  if (zpayEnabled && (channel === 'wechat' || channel === 'alipay')) {
    const base = PUBLIC_BASE_URL || `https://${req.headers.host}`
    const params = {
      pid: ZPAY_PID,
      type: channel === 'wechat' ? 'wxpay' : 'alipay',
      out_trade_no: orderNo,
      notify_url: `${base}/api/pay/zpay-notify`,
      return_url: `${base}/payment/result?order=${orderNo}`,
      name: `牛牛AI ${plan.name}`,
      money: (plan.price_cents / 100).toFixed(2),
    }
    const qs = Object.entries({ ...params, sign: zpaySign(params), sign_type: 'MD5' })
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    return res.json({ orderNo, channel, mode: 'zpay', payUrl: `${ZPAY_GATEWAY}/submit.php?${qs}` })
  }

  res.json({
    orderNo, channel, mode: 'demo',
    qrPayload: `niuniu-demo-pay://${channel}/${orderNo}?amount=${(plan.price_cents / 100).toFixed(2)}`,
    message: '演示环境：未接入真实微信/支付宝商户，二维码为模拟收银台',
  })
})

// 支付成功后的邮件通知（客户收授权码 + 缺货时通知管理员）
async function notifyOrderPaid(orderNo) {
  try {
    const { data: order } = await admin.from('orders')
      .select('order_no, amount_cents, delivered_code, delivery_status, user_id, plans(name)')
      .eq('order_no', orderNo).maybeSingle()
    if (!order) return
    const { data: u } = await admin.auth.admin.getUserById(order.user_id)
    const email = u?.user?.email
    const planName = order.plans?.name || order.order_no
    if (email) {
      await sendMail(
        email,
        `支付成功 · 牛牛AI ${planName}`,
        `订单 ${order.order_no} 已支付成功。${order.delivered_code ? `你的授权码：${order.delivered_code}` : '授权码补货后会尽快发给你。'} 登录 https://niuniuai.app/account 可随时查看。`,
        orderPaidHtml({
          planName,
          orderNo: order.order_no,
          amount: (order.amount_cents / 100).toLocaleString('zh-CN'),
          code: order.delivered_code,
        }),
      )
    }
    if (order.delivery_status === 'out_of_stock') {
      await sendMail(
        ADMIN_NOTIFY_EMAIL,
        `【缺货告警】${planName} 订单 ${order.order_no} 待发码`,
        `订单 ${order.order_no}（${planName}）已支付但卡密库存不足，请尽快从上游补码并在管理台手动发货。管理台：https://niuniuai.app/admin`,
      )
    }
  } catch (err) {
    console.error('[mail] notifyOrderPaid failed:', err?.message || err)
  }
}

app.post('/pay/mock-confirm', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  const { orderNo } = req.body || {}
  const { data: order } = await admin.from('orders').select('*').eq('order_no', orderNo).eq('user_id', user.id).maybeSingle()
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  const { error } = await admin.rpc('mark_order_paid', { p_order_no: orderNo })
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  await notifyOrderPaid(orderNo)
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
      await notifyOrderPaid(orderNo)
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

// ZPay 异步回调（平台服务器对服务器通知，GET/POST 兼容）
const zpayNotify = async (req, res) => {
  if (!admin) return res.status(503).send('fail')
  if (!zpayEnabled) return res.status(503).send('fail')
  const p = { ...req.query, ...req.body }
  if (!p.out_trade_no || !p.sign) return res.status(400).send('fail')
  if (zpaySign(p) !== String(p.sign).toLowerCase()) {
    console.warn('[zpay] bad sign for', p.out_trade_no)
    return res.status(403).send('fail')
  }
  if (p.trade_status !== 'TRADE_SUCCESS') return res.send('success')
  // 金额校验，防伪造
  const { data: order } = await admin.from('orders').select('amount_cents').eq('order_no', p.out_trade_no).maybeSingle()
  if (!order) return res.status(404).send('fail')
  const expected = (order.amount_cents / 100).toFixed(2)
  if (Number(p.money).toFixed(2) !== expected) {
    console.warn('[zpay] amount mismatch', p.out_trade_no, p.money, expected)
    return res.status(400).send('fail')
  }
  await admin.rpc('mark_order_paid', { p_order_no: p.out_trade_no })
  await notifyOrderPaid(p.out_trade_no)
  res.send('success')
}
app.get('/pay/zpay-notify', zpayNotify)
app.post('/pay/zpay-notify', zpayNotify)

// ZPay 主动查单（回调丢失时的兜底，支付结果页轮询调用）
app.post('/pay/zpay-verify', async (req, res) => {
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res)
  if (!user) return
  const { orderNo } = req.body || {}
  const { data: order } = await admin.from('orders').select('*').eq('order_no', orderNo).eq('user_id', user.id).maybeSingle()
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  if (order.status === 'paid') return res.json({ status: 'paid' })
  if (!zpayEnabled) return res.json({ status: order.status })
  try {
    const r = await timeoutFetch(`${ZPAY_GATEWAY}/api.php?act=order&pid=${ZPAY_PID}&key=${ZPAY_KEY}&out_trade_no=${orderNo}`)
    const d = await r.json()
    if (d && Number(d.status) === 1) {
      await admin.rpc('mark_order_paid', { p_order_no: orderNo })
      await notifyOrderPaid(orderNo)
      return res.json({ status: 'paid' })
    }
    res.json({ status: order.status })
  } catch (err) {
    res.status(502).json({ error: 'zpay_error', message: String(err?.message || err) })
  }
})

// 公开订单状态查询（支付回跳用）：订单号本身是不可猜测的凭据，无需登录
app.get('/public/orders/:orderNo', async (req, res) => {
  if (!admin) return configMissing(res)
  const { data: order } = await admin.from('orders')
    .select('order_no, status, delivered_code, delivery_status, paid_at, plans(name)')
    .eq('order_no', req.params.orderNo).maybeSingle()
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  // 已支付才返回授权码；未支付不暴露任何敏感信息
  res.json({
    order: {
      order_no: order.order_no,
      plan_name: order.plans?.name,
      status: order.status,
      delivery_status: order.status === 'paid' ? order.delivery_status : 'none',
      delivered_code: order.status === 'paid' ? order.delivered_code : null,
    },
  })
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
  await sendMail(
    ADMIN_NOTIFY_EMAIL,
    `【新反馈】牛牛AI 官网收到一条用户反馈`,
    `类型：${type}\n内容：${String(content).slice(0, 500)}\n联系方式：${contact || '未填写'}\n\n处理入口：https://niuniuai.app/admin`,
  )
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
  if (data === 'delivered') await notifyOrderPaid(req.params.orderNo)
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
