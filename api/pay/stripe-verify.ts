import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdmin, configMissing, requireUser, getStripe } from '../_lib'

// Stripe 回流校验：用户付款跳回后，主动向 Stripe 核实并入账（webhook 的兜底）
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  const admin = getAdmin()
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res, admin)
  if (!user) return

  const { orderNo } = req.body || {}
  const { data: order } = await admin.from('orders').select('*').eq('order_no', orderNo).eq('user_id', user.id).maybeSingle()
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  if (order.status === 'paid') return res.json({ status: 'paid' })

  const stripe = getStripe()
  if (!stripe || !order.stripe_session_id) return res.json({ status: order.status })

  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
    if (session.payment_status === 'paid') {
      await admin.rpc('mark_order_paid', { p_order_no: orderNo })
      return res.json({ status: 'paid' })
    }
    res.json({ status: session.payment_status || order.status })
  } catch (err: any) {
    res.status(502).json({ error: 'stripe_error', message: String(err?.message || err) })
  }
}
