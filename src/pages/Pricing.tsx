import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import QRCode from 'qrcode'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import { api, fmtPrice, INTERVAL_LABEL, CHANNEL_LABEL, type Plan } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

type Channel = 'wechat' | 'alipay' | 'stripe'

interface PaymentState {
  plan: Plan
  channel: Channel
  orderNo?: string
  qrDataUrl?: string
  mode?: string
  message?: string
  paying?: boolean
  paid?: boolean
}

const CHANNELS: { key: Channel; label: string; hint: string }[] = [
  { key: 'wechat', label: '微信支付', hint: '扫码支付（演示）' },
  { key: 'alipay', label: '支付宝', hint: '扫码支付（演示）' },
  { key: 'stripe', label: 'Stripe', hint: '银行卡 · 真实测试通道' },
]

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [notice, setNotice] = useState('')
  const [payment, setPayment] = useState<PaymentState | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api<{ plans: Plan[]; notice: string }>('/plans').then((d) => {
      setPlans(d.plans)
      setNotice(d.notice)
    })
  }, [])

  const startPay = async (plan: Plan, channel: Channel) => {
    if (!user) {
      navigate('/login')
      return
    }
    setPayment({ plan, channel, paying: true })
    try {
      const d = await api<{ orderNo: string; mode: string; qrPayload?: string; checkoutUrl?: string; message?: string }>(
        '/orders',
        { body: { planCode: plan.code, channel }, auth: true },
      )
      if (d.mode === 'stripe' && d.checkoutUrl) {
        window.location.href = d.checkoutUrl
        return
      }
      const qrDataUrl = d.qrPayload ? await QRCode.toDataURL(d.qrPayload, { width: 220, margin: 1, color: { dark: '#0c1426', light: '#e2e8f0' } }) : undefined
      setPayment({ plan, channel, orderNo: d.orderNo, qrDataUrl, mode: d.mode, message: d.message })
    } catch (err) {
      alert((err as Error).message)
      setPayment(null)
    }
  }

  const confirmPaid = async () => {
    if (!payment?.orderNo) return
    setPayment({ ...payment, paying: true })
    try {
      await api('/pay/mock/confirm', { body: { orderNo: payment.orderNo }, auth: true })
      setPayment({ ...payment, paying: false, paid: true })
      setTimeout(() => navigate('/account'), 900)
    } catch (err) {
      alert((err as Error).message)
      setPayment({ ...payment, paying: false })
    }
  }

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-200">
      <Nav />
      <main className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-sky-400 uppercase">
            <span className="h-px w-6 bg-sky-400/60" />价格与订阅<span className="h-px w-6 bg-sky-400/60" />
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-50 sm:text-4xl">
            选择适合你的<span className="text-gradient-cyan">订阅周期</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            {notice || '演示占位价格，正式价格以官方价格表为准'} · 软件授权与牛气值为两套独立体系
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.code}
              className={`card-line relative flex flex-col rounded-2xl p-7 ${
                p.code === 'yearly' ? 'border-sky-400/50 shadow-[0_0_60px_-20px_rgba(56,189,248,0.4)]' : ''
              }`}
            >
              {p.code === 'yearly' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-400 px-3 py-1 text-xs font-bold whitespace-nowrap text-[#070c18]">
                  推荐 · 折合 ¥582/月
                </span>
              )}
              <h2 className="text-lg font-bold text-slate-100">{p.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-50">{fmtPrice(p.price_cents)}</span>
                <span className="text-sm text-slate-500">/ {INTERVAL_LABEL[p.interval]}</span>
              </div>
              <div className="mt-1 min-h-4 text-xs text-slate-500">
                {p.months > 0
                  ? `折合 ${fmtPrice(Math.round(p.price_cents / p.months))}/月 · `
                  : '短期体验 · '}
                含 {p.nq_credit.toLocaleString()} 牛气值
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* 支付方式 */}
              <div className="mt-8 space-y-2.5">
                {CHANNELS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => startPay(p, c.key)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      c.key === 'wechat'
                        ? 'border-orange-500/50 bg-orange-500 text-white hover:bg-orange-400'
                        : 'border-[#1b2740] bg-[#0a1120] hover:border-sky-400/50'
                    }`}
                  >
                    <span className="text-sm font-semibold">{c.label}订阅</span>
                    <span className={`ml-2 text-xs ${c.key === 'wechat' ? 'text-orange-100' : 'text-slate-500'}`}>
                      {c.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-slate-600">
          支付即表示你已阅读并理解风险说明：AI 分析仅供辅助参考，不承诺收益。退款与开票遵循「谁收款谁负责」原则，
          激活后退款受限制，依法处理的例外除外。遇到问题请先联系客服。
        </p>
      </main>
      <Footer />

      {/* 收银台弹窗 */}
      {payment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => !payment.paying && setPayment(null)}>
          <div className="card-line w-full max-w-sm rounded-2xl p-7" onClick={(e) => e.stopPropagation()}>
            {payment.paid ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="mt-4 text-lg font-bold text-slate-100">支付成功</div>
                <div className="mt-1 text-sm text-slate-500">正在跳转到你的订阅详情…</div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-slate-500">{CHANNEL_LABEL[payment.channel]}收银台</div>
                    <div className="mt-1 text-xl font-bold text-slate-100">
                      {payment.plan.name} · {fmtPrice(payment.plan.price_cents)}
                    </div>
                  </div>
                  <button onClick={() => setPayment(null)} className="text-slate-500 hover:text-slate-300">✕</button>
                </div>

                {payment.qrDataUrl ? (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="rounded-xl bg-slate-200 p-3">
                      <img src={payment.qrDataUrl} alt="支付二维码（演示）" className="h-44 w-44" />
                    </div>
                    <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                      {payment.message || '请扫码完成支付'}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-slate-600">订单号 {payment.orderNo}</p>
                  </div>
                ) : (
                  <div className="mt-6 py-6 text-center text-sm text-slate-400">
                    {payment.paying ? '正在创建订单…' : payment.message}
                  </div>
                )}

                {payment.orderNo && (
                  <button
                    onClick={confirmPaid}
                    disabled={payment.paying}
                    className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {payment.paying ? '确认中…' : '我已完成支付（演示确认）'}
                  </button>
                )}
                <p className="mt-3 text-center text-[11px] text-slate-600">
                  演示环境：不会产生真实扣款。接入真实商户后此步骤由支付平台异步通知完成。
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
