import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdmin, configMissing } from './_lib'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const admin = getAdmin()
  if (!admin) return configMissing(res)

  const { data, error } = await admin
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('price_cents', { ascending: true })

  if (error) return res.status(500).json({ error: 'db_error', message: error.message })
  res.json({
    notice: '官方 C 端直营价 · 经销商成交价以其签约文件为准',
    plans: data,
  })
}
