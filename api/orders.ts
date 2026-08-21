import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes } from 'crypto'
import { getAdmin, configMissing, requireUser, getStripe } from './_lib'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  const admin = getAdmin()
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res, admin)
  if (!user) return

  const { planCode, channel } = req.body || {}
  if (!['wechat', 'alipay', 'stripe'].includes(channel)) {
    return res.status(400).json({ error: 'invalid_channel' })
  }
  const { data: plan } = await admin.from('plans').select('*').eq('code', planCode).eq('is_active', true).maybeSingle()
  if (!plan) return res.status(404).json({ error: 'plan_not_found' })

  const orderNo = 'NN' + Date.now() + randomBytes(3).toString('hex').toUpperCase()
  const { error } = await admin.from('orders').insert({
    order_no: orderNo,
    user_id: user.id,
    plan_code: plan.code,
    amount_cents: plan.price_cents,
    channel,
  })
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })

  if (channel === 'stripe') {
    const stripe = getStripe()
    if (!stripe) {
      return res.json({ orderNo, channel, mode: 'demo', message: '未配置 STRIPE_SECRET_KEY，已进入演示支付模式' })
    }
    try {
      const base = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`
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
      await admin.from('orders').update({ stripe_session_id: session.id }).eq('order_no', orderNo)
      return res.json({ orderNo, channel, mode: 'stripe', checkoutUrl: session.url })
    } catch (err: any) {
      return res.status(502).json({ error: 'stripe_error', message: String(err?.message || err) })
    }
  }

  // 微信 / 支付宝：演示模式（真实环境在此调用微信 Native / 支付宝当面付下单，异步通知入账）
  res.json({
    orderNo,
    channel,
    mode: 'demo',
    qrPayload: `niuniu-demo-pay://${channel}/${orderNo}?amount=${(plan.price_cents / 100).toFixed(2)}`,
    message: '演示环境：未接入真实微信/支付宝商户，二维码为模拟收银台',
  })
}
