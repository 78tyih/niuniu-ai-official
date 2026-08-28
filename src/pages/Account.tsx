import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import { api, fmtPrice, CHANNEL_LABEL, type Order, type Subscription } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Account() {
  const { user, loading, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [phone, setPhone] = useState('')
  const [bindingPhone, setBindingPhone] = useState(false)
  const [phoneMsg, setPhoneMsg] = useState('')

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  useEffect(() => {
    if (!user) return
    api<{ subscription: Subscription | null; orders: Order[] }>('/subscription', { auth: true }).then((d) => {
      setSub(d.subscription)
      setOrders(d.orders)
    })
  }, [user])

  const bindPhone = async () => {
    if (!user) return
    setPhoneMsg('')
    setBindingPhone(true)
    try {
      if (!/^1\d{10}$/.test(phone)) throw new Error('请输入 11 位大陆手机号')
      const { error } = await supabase.from('profiles').update({ phone }).eq('id', user.id)
      if (error) throw new Error(error.message)
      await refreshUser()
    } catch (err) {
      setPhoneMsg((err as Error).message)
    } finally {
      setBindingPhone(false)
    }
  }

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] text-[#9aa0ad]">加载中…</div>
  }

  const active = sub && sub.status === 'active' && new Date(sub.expires_at) > new Date()
  const daysLeft = active ? Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000)) : 0

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#14171f]">
      <Nav />
      <main className="mx-auto max-w-5xl px-5 pt-28 pb-24 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="micro-label text-[#b0a89c]">ACCOUNT</div>
            <h1 className="font-display mt-2 text-3xl font-bold">我的订阅</h1>
            <p className="mt-2 text-sm text-[#9aa0ad]">{user.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="rounded-lg border border-[#e0ddd6] px-4 py-2 text-sm text-[#6b7280] transition-colors hover:border-[#14171f] hover:text-[#14171f]"
          >
            退出登录
          </button>
        </div>

        {/* 订阅状态卡 */}
        <div className="card-light mt-8 overflow-hidden rounded-2xl">
          <div className="border-b border-[#f0eee9] bg-[#faf9f6] px-7 py-4 text-sm font-semibold">当前订阅</div>
          {active ? (
            <div className="grid gap-6 p-7 sm:grid-cols-4">
              <div>
                <div className="text-xs text-[#9aa0ad]">套餐</div>
                <div className="mt-1.5 text-lg font-bold">{sub.plan_name}</div>
              </div>
              <div>
                <div className="text-xs text-[#9aa0ad]">状态</div>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />生效中 · 剩 {daysLeft} 天
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-[#9aa0ad]">到期时间</div>
                <div className="mt-1.5 text-sm font-medium">{new Date(sub.expires_at).toLocaleDateString('zh-CN')}</div>
              </div>
              <div>
                <div className="text-xs text-[#9aa0ad]">牛气值余额</div>
                <div className="mt-1.5 text-lg font-bold text-[#ff6a1a]">{sub.nq_balance.toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 p-10 text-center">
              <p className="text-sm text-[#6b7280]">你还没有生效中的订阅</p>
              <Link to="/pricing" className="rounded-xl bg-[#ff6a1a] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#f45d0d]">
                去选择订阅套餐
              </Link>
            </div>
          )}
          {active && (
            <div className="border-t border-[#f0eee9] bg-[#faf9f6] px-7 py-4">
              <Link to="/pricing" className="text-sm text-[#ff6a1a] underline decoration-[#ff6a1a]/40 underline-offset-4 hover:text-[#f45d0d]">
                续费或更换套餐 →
              </Link>
            </div>
          )}
        </div>

        {/* 订单记录 */}
        <div className="card-light mt-6 overflow-hidden rounded-2xl">
          <div className="border-b border-[#f0eee9] bg-[#faf9f6] px-7 py-4 text-sm font-semibold">订单记录</div>
          {orders.length === 0 ? (
            <p className="p-7 text-sm text-[#9aa0ad]">暂无订单</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0eee9] text-left text-xs text-[#9aa0ad]">
                    <th className="px-7 py-3 font-medium">订单号</th>
                    <th className="px-4 py-3 font-medium">套餐</th>
                    <th className="px-4 py-3 font-medium">金额</th>
                    <th className="px-4 py-3 font-medium">支付方式</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-7 py-3 font-medium">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_no} className="border-b border-[#f5f3ee] last:border-0">
                      <td className="px-7 py-3.5 font-mono text-xs text-[#6b7280]">{o.order_no}</td>
                      <td className="px-4 py-3.5">{o.plan_name}</td>
                      <td className="px-4 py-3.5">{fmtPrice(o.amount_cents)}</td>
                      <td className="px-4 py-3.5 text-[#6b7280]">{CHANNEL_LABEL[o.channel] || o.channel}</td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          o.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#ff6a1a]/10 text-[#d4530f]'
                        }`}>
                          {o.status === 'paid' ? '已支付' : '待支付'}
                        </span>
                      </td>
                      <td className="px-7 py-3.5 text-xs text-[#9aa0ad]">
                        {new Date(o.created_at + 'Z').toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 手机号绑定 + 客服 */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card-light rounded-2xl p-7">
            <h3 className="text-sm font-semibold">手机号绑定</h3>
            {user.phone ? (
              <p className="mt-3 text-sm text-[#6b7280]">
                已绑定：<span className="font-medium text-[#14171f]">{user.phone}</span>
              </p>
            ) : (
              <>
                <p className="mt-2 text-xs leading-relaxed text-[#9aa0ad]">
                  邮箱账户需绑定手机号后方可订阅（演示环境跳过短信验证，正式环境需短信核验）。
                </p>
                <div className="mt-4 flex gap-2.5">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="11 位手机号"
                    maxLength={11}
                    className="flex-1 rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
                  />
                  <button
                    onClick={bindPhone}
                    disabled={bindingPhone}
                    className="rounded-lg bg-[#ff6a1a] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#f45d0d] disabled:opacity-50"
                  >
                    {bindingPhone ? '绑定中…' : '绑定'}
                  </button>
                </div>
                {phoneMsg && <p className="mt-2 text-xs text-[#d4530f]">{phoneMsg}</p>}
              </>
            )}
          </div>
          <div className="card-light rounded-2xl p-7">
            <h3 className="text-sm font-semibold">联系客服</h3>
            <p className="mt-2 text-xs text-[#9aa0ad]">连接协助、退款开票，都可以直接找我们：</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[#6b7280]">
              <li>
                QQ 交流群：<span className="font-mono text-base font-semibold text-[#ff6a1a]">638778129</span>
                <span className="ml-2 text-xs text-[#9aa0ad]">搜索群号即可加入</span>
              </li>
              <li>
                企业微信群：<Link to="/community#groups" className="text-[#ff6a1a] underline underline-offset-4">查看二维码</Link>
              </li>
              <li>服务时间：9:00 – 18:00</li>
            </ul>
          </div>
        </div>

        {/* 风险提示 */}
        <div className="mt-6 rounded-2xl border border-[#ff6a1a]/25 bg-[#ff6a1a]/6 p-7">
          <h3 className="text-sm font-semibold text-[#d4530f]">请记住</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">
            牛牛AI 是交易流程辅助工具，不承诺任何收益。AI 分析仅供辅助参考，
            交易决策与风险由你自行承担。软件授权与牛气值为两套独立体系，扣费明细以账户页面为准。
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
