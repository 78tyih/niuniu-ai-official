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
  { key: 'stripe', label: 'Stripe', hint: '银行卡 · 测试通道' },
]

const FIT_LABEL: Record<string, string> = {
  days3: '渠道体验与新用户试用',
  month: '短期体验完整功能',
  quarter: '持续使用更划算',
  year: '长期使用者',
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<Plan | null>(null)
  const [channel, setChannel] = useState<Channel>('wechat')
  const [payment, setPayment] = useState<PaymentState | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api<{ plans: Plan[]; notice: string }>('/plans')
      .then((d) => {
        setPlans(d.plans)
        setNotice(d.notice)
        setSelected(d.plans.find((p) => p.code === 'yearly') || d.plans[0] || null)
      })
      .catch((e) => setNotice((e as Error).message))
  }, [])

  const startPay = async () => {
    if (!selected) return
    if (!user) {
      navigate('/login')
      return
    }
    const plan = selected
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
        ? await QRCode.toDataURL(d.qrPayload, { width: 220, margin: 1, color: { dark: '#0a0f1a', light: '#ffffff' } })
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
    <div className="min-h-screen bg-[#faf9f6] text-[#14171f]">
      <Nav />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8">
        <div className="micro-label text-[#b0a89c]">PRICING</div>
        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">选择适合你的使用周期</h1>
        <p className="mt-4 text-sm text-[#5b6170]">先选择方案，再选择支付方式。{notice && <span className="text-[#9aa0ad]">{notice}</span>}</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* ① 方案 */}
          <div className="grid gap-5 sm:grid-cols-2">
            {plans.map((p) => {
              const active = selected?.code === p.code
              return (
                <button
                  key={p.code}
                  onClick={() => setSelected(p)}
                  className={`relative flex flex-col rounded-2xl border bg-white p-6 text-left transition-all ${
                    active ? 'border-[#14171f] shadow-[0_10px_40px_-16px_rgba(20,23,31,0.25)]' : 'border-[#e8e6e0] hover:border-[#c9c4b9]'
                  }`}
                >
                  {p.code === 'yearly' && (
                    <span className="absolute -top-3 left-6 rounded-full bg-[#ff6a1a] px-3 py-1 text-xs font-bold text-white">
                      推荐
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold">{p.name}</h2>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${active ? 'border-[#ff6a1a] bg-[#ff6a1a] text-white' : 'border-[#d8d4cb] text-transparent'}`}>✓</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-bold">{fmtPrice(p.price_cents)}</span>
                    <span className="text-sm text-[#9aa0ad]">/ {INTERVAL_LABEL[p.interval]}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#9aa0ad]">
                    {p.months > 0 && `折合 ${fmtPrice(Math.round(p.price_cents / p.months))}/月 · `}
                    含 {p.nq_credit.toLocaleString()} 牛气值
                  </div>
                  <div className="mt-1 text-xs text-[#6b7280]">{FIT_LABEL[p.interval] || ''}</div>
                  <ul className="mt-4 flex-1 space-y-2 border-t border-[#f0eee9] pt-4">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[#5b6170]">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff6a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          {/* ② 支付预览 */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-light rounded-2xl p-6">
              <div className="micro-label text-[#b0a89c]">CHECKOUT</div>
              <h3 className="mt-2 text-base font-bold">订阅流程预览</h3>

              <div className="mt-5 rounded-xl bg-[#faf9f6] p-4">
                <div className="text-xs text-[#9aa0ad]">已选方案</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-semibold">{selected?.name || '请选择方案'}</span>
                  <span className="font-display text-lg font-bold">{selected ? fmtPrice(selected.price_cents) : '—'}</span>
                </div>
                {selected && (
                  <div className="mt-1 text-xs text-[#9aa0ad]">含 {selected.nq_credit.toLocaleString()} 牛气值</div>
                )}
              </div>

              <div className="mt-5">
                <div className="text-xs text-[#9aa0ad]">支付方式</div>
                <div className="mt-2 space-y-2">
                  {CHANNELS.map((c) => (
                    <label
                      key={c.key}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                        channel === c.key ? 'border-[#14171f] bg-white' : 'border-[#e8e6e0] hover:border-[#c9c4b9]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="channel"
                          checked={channel === c.key}
                          onChange={() => setChannel(c.key)}
                          className="accent-[#ff6a1a]"
                        />
                        <span className="text-sm font-medium">{c.label}</span>
                      </span>
                      <span className="text-xs text-[#9aa0ad]">{c.hint}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={startPay}
                disabled={!selected || payment?.paying}
                className="mt-6 w-full rounded-xl bg-[#ff6a1a] py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(255,106,26,0.55)] transition-all hover:bg-[#f45d0d] disabled:opacity-50"
              >
                确认并前往支付
              </button>

              <div className="mt-5 space-y-1.5 border-t border-[#f0eee9] pt-4 text-[11px] leading-relaxed text-[#9aa0ad]">
                <p>官方 C 端直营价；经销商成交价以其签约文件及后台显示为准。</p>
                <p>牛气值按 50 元 = 1000 点折算，使用规则以正式版本为准。</p>
                <p>AI 分析仅供辅助参考，不构成投资建议。</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />

      {/* 收银台弹窗 */}
      {payment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={() => !payment.paying && setPayment(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#e8e6e0] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {payment.paid ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="mt-4 text-lg font-bold">支付成功</div>
                <div className="mt-1 text-sm text-[#9aa0ad]">正在跳转到你的订阅详情…</div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-[#9aa0ad]">{CHANNEL_LABEL[payment.channel]}收银台</div>
                    <div className="mt-1 text-xl font-bold">
                      {payment.plan.name} · {fmtPrice(payment.plan.price_cents)}
                    </div>
                  </div>
                  <button onClick={() => setPayment(null)} className="text-[#9aa0ad] hover:text-[#14171f]">✕</button>
                </div>

                {payment.qrDataUrl ? (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="rounded-xl border border-[#e8e6e0] bg-white p-3">
                      <img src={payment.qrDataUrl} alt="支付二维码（演示）" className="h-44 w-44" />
                    </div>
                    <p className="mt-3 text-center text-xs leading-relaxed text-[#6b7280]">
                      {payment.message || '请扫码完成支付'}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-[#9aa0ad]">订单号 {payment.orderNo}</p>
                  </div>
                ) : (
                  <div className="mt-6 py-6 text-center text-sm text-[#6b7280]">
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
                <p className="mt-3 text-center text-[11px] text-[#9aa0ad]">
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
