import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import QRCode from 'qrcode'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import { api, fmtPrice, INTERVAL_LABEL, CHANNEL_LABEL, enabledPaymentMethods, type Plan } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useReveal } from '../hooks/useReveal'

type Channel = (typeof enabledPaymentMethods)[number]

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
  { key: 'wechat', label: '微信支付', hint: '微信扫码完成支付' },
  { key: 'stripe', label: 'Stripe', hint: 'Credit / Debit Card' },
]

const AUDIENCE: Record<string, { who: string; line: string }> = {
  days3: { who: '想先体验再决定的用户', line: '完整功能 3 天体验，渠道活动同价。' },
  monthly: { who: '轻度使用的个人交易者', line: '一个月完整工作流，按需续停。' },
  quarterly: { who: '稳定使用的进阶用户', line: '覆盖一个季度，月均成本更低。' },
  yearly: { who: '长期主力使用者', line: '全年最优月均成本，省心首选。' },
}

const INCLUDED = [
  'AI 行情分析',
  '风险审核',
  '持仓诊断',
  'AI 日志',
  '自定义 Prompt',
  'MT5 连接',
  '产品更新',
  '技术支持',
]

const PRICING_FAQS = [
  { q: '套餐之间有什么区别？', a: '四档套餐的功能完全一致，区别仅在于使用周期和牛气值额度。选择适合你的使用周期即可。' },
  { q: '牛气值是什么？', a: '牛气值是牛牛 AI 平台内的统一计费单位，用于衡量 AI 分析调用量。50 元人民币 = 1000 牛气值，随套餐自动发放。' },
  { q: '软件授权是否包含牛气值？', a: '软件授权与 AI 使用消耗属于两个不同部分。套餐费用包含基础牛气值额度，部分 AI 分析、审核及诊断功能会根据实际调用消耗牛气值。' },
  { q: '支持哪些 MT5？', a: '原则上 MT5 环境均可连接，但个别券商的接口限制可能成为例外。建议先联系客服确认你的环境，再决定是否订阅。' },
  { q: '如何连接我的 MT5？', a: '在牛牛 AI 控制台中选择「连接 MT5」，按指引完成授权即可。行情与持仓会一键同步，全程只读，不触碰资金。' },
  { q: '激活后可以退款吗？', a: '待产品确认。目前退款政策正在制定中，如有退款需求请直接联系客服。' },
  { q: '如何续费？', a: '续费在当前到期时间上顺延，牛气值累加。短期卡不会覆盖长期卡的套餐标识。' },
  { q: '支付失败怎么办？', a: '如支付失败，请检查网络连接后重试。如持续失败，请通过社区页面联系客服协助。' },
]

export default function Pricing() {
  useReveal()
  const [plans, setPlans] = useState<Plan[]>([])
  const [notice, setNotice] = useState('')
  const [payment, setPayment] = useState<PaymentState | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [hovered, setHovered] = useState<string | null>(null)
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

  const openCheckout = (plan: Plan) => {
    if (!user) {
      navigate('/login')
      return
    }
    setPayment({ plan, channel: 'wechat' })
  }

  const startPay = async (plan: Plan, channel: Channel) => {
    if (!user) {
      navigate('/login')
      return
    }
    setPayment({ plan, channel, paying: true })
    try {
      const d = await api<{ orderNo: string; mode: string; qrPayload?: string; checkoutUrl?: string; payUrl?: string; message?: string }>(
        '/orders',
        { body: { planCode: plan.code, channel }, auth: true },
      )
      if (d.mode === 'stripe' && d.checkoutUrl) {
        window.location.href = d.checkoutUrl
        return
      }
      if (d.mode === 'zpay' && d.payUrl) {
        window.location.href = d.payUrl
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

      {/* Pricing Hero — 紧凑，不超过 100px padding */}
      <section className="pb-6 pt-[88px] sm:pt-[104px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h1 className="font-display text-[28px] font-bold sm:text-[34px]">选择适合你的方案</h1>
          <p className="mt-2 max-w-xl text-[15px] text-[#6b7280]">
            按照你的使用周期选择牛牛 AI，功能保持简单透明。
            {notice && <span className="ml-2 text-[#9ca3af]">{notice}</span>}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-10 sm:pb-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" onMouseLeave={() => setHovered(null)}>
            {plans.map((p) => {
              const recommended = p.code === 'yearly'
              const dim = hovered && hovered !== p.code
              const a = AUDIENCE[p.code]
              return (
                <div
                  key={p.code}
                  onMouseEnter={() => setHovered(p.code)}
                  className={`relative flex flex-col rounded-2xl bg-white p-6 ${
                    recommended ? 'border-2 border-[#f97316]' : 'border border-[#e5e7eb]'
                  } ${hovered === p.code ? '-translate-y-1 shadow-[0_18px_44px_-24px_rgba(17,17,17,0.3)]' : ''} ${
                    dim ? 'opacity-[0.72]' : ''
                  }`}
                >
                  {recommended && (
                    <span className="absolute -top-3 left-6 rounded-full bg-[#f97316] px-3 py-1 text-[11px] font-bold text-white">
                      推荐
                    </span>
                  )}
                  <h2 className="text-[15px] font-bold">{p.name}</h2>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display text-[32px] font-bold">{fmtPrice(p.price_cents)}</span>
                    <span className="text-[13px] text-[#9ca3af]">/ {INTERVAL_LABEL[p.interval]}</span>
                  </div>
                  <div className="mt-1 text-[12px] text-[#9ca3af]">
                    {p.months > 0 && `折合 ${fmtPrice(Math.round(p.price_cents / p.months))}/月 · `}
                    含 {p.nq_credit.toLocaleString()} 牛气值
                  </div>
                  <div className="mt-5 flex-1 border-t border-[#f3f4f6] pt-4">
                    <div className="text-[13px] font-semibold text-[#111111]">适合：{a?.who}</div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#6b7280]">{a?.line}</p>
                  </div>
                  <button
                    onClick={() => openCheckout(p)}
                    className={`btn-lift mt-5 w-full rounded-lg py-3 text-sm font-semibold ${
                      recommended
                        ? 'bg-[#f97316] text-white hover:bg-[#ea6a0c]'
                        : 'border border-[#e5e7eb] text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    选择{p.name}
                  </button>
                </div>
              )
            })}
          </div>

          {/* 所有方案均包含 */}
          <div className="reveal mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-[#e5e7eb] bg-white px-6 py-4">
            <span className="text-[13px] font-semibold text-[#111111]">所有方案均包含</span>
            {INCLUDED.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-[13px] text-[#6b7280]">
                <svg className="h-3.5 w-3.5 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 牛气值说明 */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-[22px] font-bold sm:text-[26px]">关于牛气值</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6b7280]">
              软件授权与 AI 使用消耗属于两个不同部分。部分 AI 分析、审核及诊断功能会根据实际调用消耗牛气值。
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
              牛气值按 50 元 = 1000 点折算，随套餐一次性发放到账户。使用规则以正式版本为准。
            </p>
            <Link
              to="/community/faq"
              className="link-arrow mt-4 inline-block text-[14px] font-medium text-[#f97316]"
            >
              了解牛气值 <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="font-display text-[22px] font-bold sm:text-[26px]">常见问题</h2>
          <div className="mt-6 max-w-3xl space-y-2">
            {PRICING_FAQS.map((f, i) => (
              <div
                key={f.q}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  openFaq === i ? 'border-[#111111]/30' : 'border-[#e5e7eb]'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-[15px] font-semibold"
                >
                  {f.q}
                  <span className={`ml-4 shrink-0 text-[#d1d5db] transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                    ＋
                  </span>
                </button>
                {openFaq === i && <p className="px-6 pb-4 text-sm leading-relaxed text-[#6b7280]">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="border-t border-[#eceae6] bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 text-center">
          <h2 className="font-display text-[22px] font-bold sm:text-[26px]">还有问题？</h2>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            如果你不确定自己的 MT5 环境或套餐是否合适，可以先联系我们。
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              to="/community#contact"
              className="btn-lift rounded-lg bg-[#f97316] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ea6a0c]"
            >
              联系客服
            </Link>
            <Link
              to="/demo"
              className="btn-lift rounded-lg border border-[#e5e7eb] bg-white px-6 py-3 text-sm font-semibold text-[#111111] hover:border-[#111111]"
            >
              查看产品演示
            </Link>
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

                {/* 支付方式切换 — 仅显示已启用的支付方式 */}
                <div className="mt-5 space-y-3">
                  {CHANNELS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => !payment.orderNo && setPayment({ ...payment, channel: c.key })}
                      className={`w-full rounded-lg border px-5 py-4 text-left transition-colors ${
                        payment.channel === c.key
                          ? 'border-2 border-[#f97316]'
                          : 'border border-[#e5e7eb] hover:border-[#111111]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          payment.channel === c.key ? 'border-[#f97316]' : 'border-[#d1d5db]'
                        }`}>
                          {payment.channel === c.key && (
                            <div className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{c.label}</div>
                          <div className="mt-0.5 text-[11px] text-[#9ca3af]">{c.hint}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {payment.qrDataUrl ? (
                  <div className="mt-5 flex flex-col items-center">
                    <div className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                      <img src={payment.qrDataUrl} alt="支付二维码" className="h-44 w-44" />
                    </div>
                    <p className="mt-3 text-center text-xs leading-relaxed text-[#6b7280]">
                      {payment.message || '请使用微信扫码完成支付'}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-[#9ca3af]">订单号 {payment.orderNo}</p>
                  </div>
                ) : (
                  <div className="mt-5 py-6 text-center text-sm text-[#6b7280]">
                    {payment.paying ? '正在创建订单…' : payment.message || '选择支付方式，点击下方按钮创建订单'}
                  </div>
                )}

                {!payment.orderNo && !payment.paying && (
                  <button
                    onClick={() => startPay(payment.plan, payment.channel)}
                    className="btn-lift mt-5 w-full rounded-lg bg-[#f97316] py-3 text-sm font-semibold text-white hover:bg-[#ea6a0c]"
                  >
                    确认并前往支付
                  </button>
                )}
                {payment.orderNo && (
                  <button
                    onClick={confirmPaid}
                    disabled={payment.paying}
                    className="btn-lift mt-5 w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
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