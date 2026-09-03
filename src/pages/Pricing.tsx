import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import QRCode from 'qrcode'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import Section, { SectionHead } from '../components/Section'
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

const AUDIENCE: Record<string, { who: string; line: string }> = {
  days3: { who: '想先体验再决定的用户', line: '完整功能 3 天体验，渠道活动同价。' },
  monthly: { who: '轻度使用的个人交易者', line: '一个月完整工作流，按需续停。' },
  quarterly: { who: '稳定使用的进阶用户', line: '覆盖一个季度，月均成本更低。' },
  yearly: { who: '长期主力使用者', line: '全年最优月均成本，省心首选。' },
}

const INCLUDED = ['AI 行情分析', '风险审核', '持仓诊断', 'AI 日志', '自定义 Prompt']

/** 功能对比（demo 版，具体标准待与用户确认后调整） */
const COMPARE: { name: string; values: (string | boolean)[] }[] = [
  { name: 'AI 行情分析', values: [true, true, true, true] },
  { name: '风险审核', values: [true, true, true, true] },
  { name: '持仓诊断', values: [true, true, true, true] },
  { name: 'AI 分析日志', values: [true, true, true, true] },
  { name: '自定义 Prompt', values: [true, true, true, true] },
  { name: '多品种分析', values: [false, true, true, true] },
  { name: '复盘记录保存', values: ['3 天', '30 天', '90 天', '365 天'] },
  { name: '牛气值额度', values: ['3,980', '19,600', '40,360', '139,600'] },
  { name: '客服支持', values: ['社群支持', '社群支持', '优先响应', '一对一优先'] },
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
        // 跳转到 ZPay 收银台，支付完成后回到 /payment/result
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

      {/* 紧凑头部：价格卡必须在第一屏主要区域出现 */}
      <section className="pb-8 pt-[104px] sm:pt-[128px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h1 className="font-display text-[28px] font-bold sm:text-[34px]">选择适合你的方案</h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            四个使用周期，功能完全一致。{notice && <span className="text-[#9ca3af]">{notice}</span>}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-[52px] sm:pb-[80px]">
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
                  className={`pricing-card relative flex flex-col rounded-2xl bg-white p-6 ${
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
          <div className="reveal mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-[#e5e7eb] bg-white px-6 py-4">
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

          {/* 功能对比表 */}
          {plans.length === 4 && (
            <div className="reveal mt-10">
              <h2 className="font-display text-center text-[22px] font-bold sm:text-[26px]">功能对比</h2>
              <div className="mt-6 overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white">
                <table className="w-full min-w-[640px] border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] text-left">
                      <th className="px-5 py-3.5 font-semibold text-[#6b7280]">功能 / 权益</th>
                      {plans.map((p) => (
                        <th key={p.code} className={`px-5 py-3.5 text-center font-bold ${p.code === 'yearly' ? 'text-[#f97316]' : ''}`}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((row, ri) => (
                      <tr key={row.name} className={ri % 2 === 1 ? 'bg-[#fafaf8]' : ''}>
                        <td className="px-5 py-3 font-medium text-[#374151]">{row.name}</td>
                        {row.values.map((v, ci) => (
                          <td key={ci} className="px-5 py-3 text-center">
                            {v === true ? (
                              <svg className="mx-auto h-4 w-4 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : v === false ? (
                              <span className="text-[#d1d5db]">—</span>
                            ) : (
                              <span className="font-medium text-[#111111]">{v}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-center text-[12px] text-[#9ca3af]">
                功能对比为演示版本，各方案具体功能标准以正式确认后的版本为准。
              </p>
            </div>
          )}

          <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-[#9ca3af]">
            官方 C 端直营价；经销商成交价以其签约文件及后台显示为准。牛气值按 50 元 = 1000 点折算，使用规则以正式版本为准。AI 分析仅供辅助参考，不构成投资建议。
          </p>
        </div>
      </section>

      {/* 常见问题 */}
      <Section variant="compact" tinted bordered>
        <SectionHead title="常见问题" className="mx-auto text-center" />
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {PRICING_FAQS.map((f, i) => (
            <div key={f.q} className={`overflow-hidden rounded-xl border bg-white transition-colors ${openFaq === i ? 'border-[#111111]/30' : 'border-[#e5e7eb]'}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-[15px] font-semibold"
              >
                {f.q}
                <span className={`ml-4 text-[#d1d5db] transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>＋</span>
              </button>
              {openFaq === i && <p className="px-6 pb-4 text-sm leading-relaxed text-[#6b7280]">{f.a}</p>}
            </div>
          ))}
        </div>
      </Section>

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
                    {payment.paying ? '正在创建订单…' : payment.message || '选择支付方式，点击「确认并前往支付」创建订单'}
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
