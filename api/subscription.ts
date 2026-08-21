import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdmin, configMissing, requireUser } from './_lib'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = getAdmin()
  if (!admin) return configMissing(res)
  const user = await requireUser(req, res, admin)
  if (!user) return

  const { data: sub } = await admin
    .from('subscriptions')
    .select('*, plans(name)')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: orders } = await admin
    .from('orders')
    .select('order_no, plan_code, amount_cents, channel, status, created_at, paid_at, plans(name)')
    .eq('user_id', user.id)
    .order('id', { ascending: false })
    .limit(20)

  const flatten = (s: any) =>
    s && { ...s, plan_name: s.plans?.name, plans: undefined }
  const flattenOrder = (o: any) => ({ ...o, plan_name: o.plans?.name, plans: undefined })

  res.json({
    subscription: sub ? flatten(sub) : null,
    orders: (orders || []).map(flattenOrder),
  })
}
