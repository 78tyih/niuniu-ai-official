import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdmin, configMissing, requireUser } from '../_lib'

// 模拟支付成功（演示用；真实环境由支付平台异步通知替代）
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  const admin = getAdmin()
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res, admin)
  if (!user) return

  const { orderNo } = req.body || {}
  const { data: order } = await admin.from('orders').select('*').eq('order_no', orderNo).eq('user_id', user.id).maybeSingle()
  if (!order) return res.status(404).json({ error: 'order_not_found' })

  const { error } = await admin.rpc('mark_order_paid', { p_order_no: orderNo })
  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  res.json({ ok: true, orderNo })
}
