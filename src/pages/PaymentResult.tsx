import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { api } from '../lib/api'

export default function PaymentResult() {
  const [params] = useSearchParams()
  const orderNo = params.get('order') || ''
  const status = params.get('status') || ''
  const [orderStatus, setOrderStatus] = useState<string>('查询中…')

  useEffect(() => {
    if (!orderNo) return
    // 先从 Stripe 主动核实一次（未配置 webhook 时的兜底），之后轮询订单状态
    api('/pay/stripe-verify', { body: { orderNo }, auth: true })
      .then((d) => (d as any).status && setOrderStatus((d as any).status))
      .catch(() => {})
    const t = setInterval(() => {
      api<{ order: { status: string } }>(`/orders/${orderNo}`, { auth: true })
        .then((d) => setOrderStatus(d.order.status))
        .catch(() => setOrderStatus('未知'))
    }, 2000)
    return () => clearInterval(t)
  }, [orderNo])

  const paid = orderStatus === 'paid'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070c18] px-5">
      <div className="card-line w-full max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-bold text-slate-100">
          {status === 'cancel' ? '支付已取消' : paid ? '支付成功' : '支付结果确认中'}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          订单号 <span className="font-mono text-xs">{orderNo}</span>
          <br />
          当前状态：{orderStatus === 'paid' ? '已支付' : orderStatus}
        </p>
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
