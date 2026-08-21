// Vercel 云函数共享工具（以下划线开头，不会被当作函数入口）
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export function getAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export function configMissing(res: VercelResponse) {
  return res.status(503).json({
    error: 'backend_not_configured',
    message: '后端未配置：请在 Vercel 环境变量中设置 SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY',
  })
}

/** 校验前端带来的 Supabase 访问令牌，返回用户 id */
export async function requireUser(req: VercelRequest, res: VercelResponse, admin: SupabaseClient) {
  const header = (req.headers.authorization as string) || ''
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

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  return key ? new Stripe(key) : null
}
