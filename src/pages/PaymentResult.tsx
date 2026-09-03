import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { api } from '../lib/api'

interface OrderInfo {
  status: string
  delivered_code: string | null
  delivery_status: 'none' | 'delivered' | 'out_of_stock'
}

export default function PaymentResult() {
  const [params] = useSearchParams()
  const orderNo = params.get('order') || ''
  const status = params.get('status') || ''
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!orderNo) return
    const poll = () => {
      // 每次轮询先向渠道主动核实，再读订单状态
      api('/pay/stripe-verify', { body: { orderNo }, auth: true }).catch(() => {})
      api('/pay/zpay-verify', { body: { orderNo }, auth: true })
        .catch(() => {})
        .finally(() => {
          api<{ order: OrderInfo }>(`/orders/${orderNo}`, { auth: true })
            .then((d) => setOrder(d.order))
            .catch(() => {})
        })
    }
    poll()
    const t = setInterval(() => {
      if (order?.status === 'paid' && order.delivery_status !== 'out_of_stock') return
      poll()
    }, 2000)
    return () => clearInterval(t)
  }, [orderNo, order?.status, order?.delivery_status])

  const paid = order?.status === 'paid'
  const delivered = paid && order?.delivery_status === 'delivered' && order?.delivered_code
  const outOfStock = paid && order?.delivery_status === 'out_of_stock'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070c18] px-5 py-16">
      <div className="card-line w-full max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-bold text-slate-100">
          {status === 'cancel' ? '支付已取消' : delivered ? '支付成功 · 授权码已发货' : paid ? '支付成功' : '支付结果确认中'}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          订单号 <span className="font-mono text-xs">{orderNo}</span>
          {!paid && status !== 'cancel' && (
            <>
              <br />
              当前状态：{order?.status === 'paid' ? '已支付' : '确认中…'}
            </>
          )}
        </p>

        {delivered && (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <div className="text-xs text-emerald-400/80">你的授权码（在牛牛AI 软件内输入激活）</div>
            <code className="mt-2 block select-all break-all rounded-lg bg-[#070c18] px-4 py-3 font-mono text-sm font-semibold tracking-wide text-emerald-300">
              {order.delivered_code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(order.delivered_code || '')
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
              className="mt-3 rounded-lg border border-emerald-500/30 px-4 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10"
            >
              {copied ? '已复制 ✓' : '复制授权码'}
            </button>
          </div>
        )}

        {outOfStock && (
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-relaxed text-amber-300/90">
            该套餐授权码暂时缺货，客服会尽快补码并主动联系你。
            也可以直接加入 QQ 群 <span className="font-mono font-semibold">638778129</span> 催促处理。
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link to="/account" className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-400">
            查看我的订阅
          </Link>
          <Link to="/pricing" className="rounded-xl border border-[#1b2740] px-6 py-3 text-sm text-slate-300 hover:border-sky-400/50">
            返回价格页
          </Link>
        </div>
      </div>
    </div>
  )
}
