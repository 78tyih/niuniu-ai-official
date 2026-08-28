import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import QRCode from 'qrcode'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import { api, fmtPrice, INTERVAL_LABEL, CHANNEL_LABEL, type Plan } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useReveal } from '../hooks/useReveal'

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
  { key: 'stripe', label: 'Stripe', hint: '银行卡 · 测试通道' },
]

const PRICING_FAQS = [
  { q: '支持哪些 MT5？', a: '原则上 MT5 环境均可连接，但个别券商的接口限制可能成为例外。建议先联系客服确认你的环境，再决定是否订阅。' },
  { q: '如何连接我的 MT5？', a: '在牛牛AI 控制台中选择「连接 MT5」，按指引完成授权即可。行情与持仓会一键同步，全程只读，不触碰资金。' },
  { q: '牛气值怎么计算？', a: '牛气值按 50 元 = 1000 点折算（1 元 = 20 点），随套餐一次性发放到账户。使用规则以正式版本为准。' },
  { q: '是否支持续费？', a: '支持。续费会在当前到期时间上顺延，牛气值累加；短期卡不会覆盖长期卡的套餐标识。' },
  { q: '是否可以更换设备？', a: '可以。账号登录即可在新设备使用，MT5 连接需要在新设备上重新授权一次。' },
]

export default function Pricing() {
  useReveal()
  const [plans, setPlans] = useState<Plan[]>([])
  const [notice, setNotice] = useState('')
  const [payment, setPayment] = useState<PaymentState | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api<{ plans: Plan[]; notice: string }>('/plans')
      .then((d) => {
        setPlans(d.plans)
        setNotice(d.notice)
      })
      .catch((e) => setNotice((e as Error).message))
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
      const qrDataUrl = d.qrPayload
        ? await QRCode.toDataURL(d.qrPayload, { width: 220, margin: 1, color: { dark: '#0b1724', light: '#ffffff' } })
        : undefined
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
      await api('/pay/mock-confirm', { body: { orderNo: payment.orderNo }, auth: true })
      setPayment({ ...payment, paying: false, paid: true })
      setTimeout(() => navigate('/account'), 900)
    } catch (err) {
      alert((err as Error).message)
      setPayment({ ...payment, paying: false })
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* Pricing Hero */}
      <section className="pt-32 pb-14 sm:pt-40">
        <div className="mx-auto max-w-[1280px] px-6 text-center sm:px-10">
          <h1 className="font-display text-[36px] font-bold sm:text-[48px]">选择适合你的方案</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#6b7280] sm:text-[17px]">
            根据你的交易需求，选择对应的牛牛 AI 使用方案。
          </p>
          {notice && <p className="mt-3 text-[13px] text-[#9ca3af]">{notice}</p>}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((p) => {
              const recommended = p.code === 'yearly'
              return (
                <div
                  key={p.code}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 ${
                    recommended ? 'border-[#f97316]' : 'border-[#e5e7eb]'
                  }`}
                >
                  {recommended && (
                    <span className="absolute -top-3 left-7 rounded-full bg-[#f97316] px-3 py-1 text-xs font-bold text-white">
                      推荐
                    </span>
                  )}
                  <h2 className="text-base font-bold">{p.name}</h2>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-[34px] font-bold">{fmtPrice(p.price_cents)}</span>
                    <span className="text-sm text-[#9ca3af]">/ {INTERVAL_LABEL[p.interval]}</span>
                  </div>
                  <div className="mt-1.5 min-h-4 text-[13px] text-[#9ca3af]">
                    {p.months > 0 && `折合 ${fmtPrice(Math.round(p.price_cents / p.months))}/月 · `}
                    含 {p.nq_credit.toLocaleString()} 牛气值
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-[#f3f4f6] pt-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-[#4b5563]">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 space-y-2">
                    {CHANNELS.map((c) => (
                      <button
                        key={c.key}
                        onClick={() => startPay(p, c.key)}
                        className={`w-full rounded-lg px-4 py-2.5 text-left text-[13px] transition-colors ${
                          c.key === 'wechat'
                            ? 'bg-[#f97316] font-semibold text-white hover:bg-[#ea6a0c]'
                            : 'border border-[#e5e7eb] font-medium text-[#374151] hover:border-[#111111]'
                        }`}
                      >
                        {c.label}订阅
                        <span className={`ml-2 text-[11px] font-normal ${c.key === 'wechat' ? 'text-white/70' : 'text-[#9ca3af]'}`}>
                          {c.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-[#9ca3af]">
            官方 C 端直营价；经销商成交价以其签约文件及后台显示为准。牛气值按 50 元 = 1000 点折算，使用规则以正式版本为准。AI 分析仅供辅助参考，不构成投资建议。
          </p>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="pb-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <h2 className="font-display text-center text-[28px] font-bold sm:text-[32px]">常见问题</h2>
          <div className="mt-10 space-y-3">
            {PRICING_FAQS.map((f, i) => (
              <div key={f.q} className={`overflow-hidden rounded-xl border bg-white transition-colors ${openFaq === i ? 'border-[#111111]/30' : 'border-[#e5e7eb]'}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-[15px] font-semibold"
                >
                  {f.q}
                  <span className={`ml-4 text-[#d1d5db] transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>＋</span>
                </button>
                {openFaq === i && <p className="px-6 pb-5 text-sm leading-relaxed text-[#6b7280]">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* 收银台弹窗 */}
      {payment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={() => !payment.paying && setPayment(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#e5e7eb] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {payment.paid ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="mt-4 text-lg font-bold">支付成功</div>
                <div className="mt-1 text-sm text-[#9ca3af]">正在跳转到你的订阅详情…</div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-[#9ca3af]">{CHANNEL_LABEL[payment.channel]}收银台</div>
                    <div className="mt-1 text-xl font-bold">
                      {payment.plan.name} · {fmtPrice(payment.plan.price_cents)}
                    </div>
                  </div>
                  <button onClick={() => setPayment(null)} className="text-[#9ca3af] hover:text-[#111111]">✕</button>
                </div>

                {/* 支付方式切换 */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {CHANNELS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => !payment.orderNo && setPayment({ ...payment, channel: c.key })}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                        payment.channel === c.key ? 'border-[#f97316] text-[#f97316]' : 'border-[#e5e7eb] text-[#6b7280]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {payment.qrDataUrl ? (
                  <div className="mt-5 flex flex-col items-center">
                    <div className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                      <img src={payment.qrDataUrl} alt="支付二维码（演示）" className="h-44 w-44" />
                    </div>
                    <p className="mt-3 text-center text-xs leading-relaxed text-[#6b7280]">
                      {payment.message || '请扫码完成支付'}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-[#9ca3af]">订单号 {payment.orderNo}</p>
                  </div>
                ) : (
                  <div className="mt-5 py-6 text-center text-sm text-[#6b7280]">
                    {payment.paying ? '正在创建订单…' : payment.message || '点击「确认并前往支付」创建订单'}
                  </div>
                )}

                {!payment.orderNo && !payment.paying && (
                  <button
                    onClick={() => startPay(payment.plan, payment.channel)}
                    className="mt-5 w-full rounded-lg bg-[#f97316] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ea6a0c]"
                  >
                    确认并前往支付
                  </button>
                )}
                {payment.orderNo && (
                  <button
                    onClick={confirmPaid}
                    disabled={payment.paying}
                    className="mt-5 w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {payment.paying ? '确认中…' : '我已完成支付（演示确认）'}
                  </button>
                )}
                <p className="mt-3 text-center text-[11px] text-[#9ca3af]">
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
