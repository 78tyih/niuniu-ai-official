import { getAccessToken } from './supabase'

export async function api<T = any>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.auth) {
    const t = await getAccessToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
  }
  const res = await fetch(`/api${path}`, {
    method: options.method || (options.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error((data as any).message || (data as any).error || `HTTP ${res.status}`)
    ;(err as any).code = (data as any).error
    throw err
  }
  return data as T
}

export interface Plan {
  id: number
  code: string
  name: string
  price_cents: number
  currency: string
  interval: 'days3' | 'month' | 'quarter' | 'year'
  months: number
  days: number
  nq_credit: number
  features: string[]
}

export interface Subscription {
  plan_name: string
  plan_code: string
  status: string
  started_at: string
  expires_at: string
  nq_balance: number
  last_order_no: string
}

export interface Order {
  order_no: string
  plan_name: string
  amount_cents: number
  channel: string
  status: string
  delivered_code: string | null
  delivery_status: 'none' | 'delivered' | 'out_of_stock'
  created_at: string
  paid_at: string | null
}

export const fmtPrice = (cents: number) => `¥${(cents / 100).toLocaleString('zh-CN')}`

export const INTERVAL_LABEL: Record<string, string> = {
  days3: '3 天',
  month: '月',
  quarter: '季度',
  year: '年',
}

export const CHANNEL_LABEL: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  stripe: 'Stripe',
}

export const enabledPaymentMethods = ['wechat', 'stripe'] as const
