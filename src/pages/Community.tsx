import { useState, type FormEvent } from 'react'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import { useReveal } from '../hooks/useReveal'

const FAQS = [
  { q: '牛牛AI 是什么？', a: '一款连接 MT5 交易环境的 AI 交易辅助系统。它把行情分析、风险审核、人工确认与交易复盘，组织在同一套工作流程中——不是脱离你交易环境的"信号机"。' },
  { q: '它是自动赚钱软件吗？', a: '不是。牛牛AI 不承诺任何收益，AI 输出仅供辅助参考。所有交易决策由你自己做出，风险也由你自己承担。如果有人向你承诺"稳赚"，那一定不是我们。' },
  { q: '行情数据从哪里来？', a: '来自你自己连接的 MT5 及其经纪商，牛牛AI 不自行定价、不提供行情。不同平台之间报价存在差异，通常与经纪商、品种、时区和延迟有关。' },
  { q: '支持所有 MT5 和券商吗？', a: '我们不这样承诺。原则上 MT5 环境均可连接，但个别券商的接口限制可能成为例外——建议先联系客服确认你的环境，再决定是否使用。' },
  { q: 'AI 会自动替我下单吗？最终由谁确认？', a: '分析与审核都只是辅助环节，最终由你确认。你可以在设置中决定风险审核、持仓诊断是否参与流程，并通过风控设置限制每日交易次数、最大持仓与止损止盈边界。' },
  { q: '什么样的人不适合用牛牛AI？', a: '只想得到一个确定买卖答案的人；希望软件保证收益、或代替自己承担亏损的人；不愿学习基础交易风险和账户操作的人。如果你属于以上情况，建议先了解风险教育内容，再考虑是否使用。' },
]

const UPDATES = [
  { date: '2026-08', title: '官网 V2 上线', desc: '全新视觉、真实产品演示视频剧场、社区页面开放。' },
  { date: '2026-08', title: '演示视频 10 章节发布', desc: '覆盖连接 MT5、AI 分析、风险审核、持仓诊断到交易复盘的完整流程。' },
  { date: '2026-07', title: '牛气值体系上线', desc: '50 元 = 1000 点，随套餐发放，用于 AI 分析额度消耗。' },
]

export default function Community() {
  useReveal()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [fbType, setFbType] = useState('功能建议')
  const [fbDesc, setFbDesc] = useState('')
  const [fbContact, setFbContact] = useState('')
  const [fbSent, setFbSent] = useState(false)

  const submitFeedback = (e: FormEvent) => {
    e.preventDefault()
    setFbSent(true)
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* Community Hero */}
      <section className="pt-32 pb-16 sm:pt-40">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal max-w-2xl">
            <h1 className="font-display text-[36px] font-bold sm:text-[48px]">加入牛牛 AI 社区</h1>
            <p className="mt-5 text-base leading-relaxed text-[#6b7280] sm:text-[17px]">
              获取产品更新、使用技巧和交易 AI 工作流经验。
            </p>
          </div>
        </div>
      </section>

      {/* 01 用户社群 */}
      <section id="groups" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal flex items-baseline gap-4">
            <span className="font-mono text-sm font-semibold text-[#f97316]">01</span>
            <h2 className="font-display text-[26px] font-bold sm:text-[30px]">用户社群</h2>
          </div>
          <p className="mt-3 text-sm text-[#6b7280]">QQ 群与企业微信群双通道保留，任一渠道都可以找到我们。</p>
          <div className="reveal mt-10 grid gap-5 sm:grid-cols-3">
            <div className="card-light rounded-2xl p-7 text-center">
              <img src="/qr/qq-group-qr.png" alt="QQ 群二维码" className="mx-auto h-36 w-36 rounded-lg border border-[#e5e7eb] object-cover" />
              <div className="mt-5 text-[15px] font-bold">QQ 交流群</div>
              <div className="mt-1 font-mono text-lg font-bold text-[#f97316]">638778129</div>
              <div className="mt-1 text-xs text-[#9ca3af]">搜索群号即可加入</div>
            </div>
            <div className="card-light rounded-2xl p-7 text-center">
              <img src="/qr/wecom-group-qr.png" alt="企业微信群二维码" className="mx-auto h-36 w-36 rounded-lg border border-[#e5e7eb] object-cover" />
              <div className="mt-5 text-[15px] font-bold">企业微信群</div>
              <div className="mt-1 text-xs text-[#9ca3af]">扫码加入（备用通道，防止 QQ 群不可达）</div>
            </div>
            <div className="card-light rounded-2xl p-7 text-center">
              <img src="/qr/qq-channel-qr.png" alt="腾讯频道二维码" className="mx-auto h-36 w-36 rounded-lg border border-[#e5e7eb] object-cover" />
              <div className="mt-5 text-[15px] font-bold">腾讯频道 · 🐮牛气冲天（MT5 版）</div>
              <a
                href="https://pd.qq.com/s/1j4t73gpf?b=9"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs font-medium text-[#f97316] underline underline-offset-4"
              >
                点击链接加入频道 →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 02 产品更新 */}
      <section id="updates" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal flex items-baseline gap-4">
            <span className="font-mono text-sm font-semibold text-[#f97316]">02</span>
            <h2 className="font-display text-[26px] font-bold sm:text-[30px]">产品更新</h2>
          </div>
          <div className="reveal mt-10 space-y-3">
            {UPDATES.map((u) => (
              <div key={u.title} className="card-light flex flex-col gap-2 rounded-xl px-6 py-5 sm:flex-row sm:items-center sm:gap-6">
                <span className="shrink-0 font-mono text-[13px] text-[#9ca3af]">{u.date}</span>
                <div>
                  <div className="text-[15px] font-semibold">{u.title}</div>
                  <div className="mt-0.5 text-sm text-[#6b7280]">{u.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 使用帮助（FAQ） */}
      <section id="faq" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <div className="reveal flex items-baseline gap-4">
            <span className="font-mono text-sm font-semibold text-[#f97316]">03</span>
            <h2 className="font-display text-[26px] font-bold sm:text-[30px]">使用帮助</h2>
          </div>
          <div className="reveal mt-10 space-y-3">
            {FAQS.map((f, i) => (
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

      {/* 04 用户反馈 */}
      <section id="feedback" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-2xl px-6 sm:px-10">
          <div className="reveal flex items-baseline gap-4">
            <span className="font-mono text-sm font-semibold text-[#f97316]">04</span>
            <h2 className="font-display text-[26px] font-bold sm:text-[30px]">用户反馈</h2>
          </div>
          <form onSubmit={submitFeedback} className="reveal card-light mt-10 space-y-5 rounded-2xl p-7">
            <div>
              <label className="mb-1.5 block text-xs text-[#9ca3af]">反馈类型</label>
              <select
                value={fbType}
                onChange={(e) => setFbType(e.target.value)}
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#f97316]"
              >
                {['功能建议', '使用问题', '支付与订阅', '其他'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#9ca3af]">简短描述</label>
              <textarea
                required
                value={fbDesc}
                onChange={(e) => setFbDesc(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#f97316]"
                placeholder="简单描述你遇到的问题或建议…"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#9ca3af]">联系方式（选填）</label>
              <input
                value={fbContact}
                onChange={(e) => setFbContact(e.target.value)}
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#f97316]"
                placeholder="邮箱 / 手机号 / QQ"
              />
            </div>
            <button type="submit" className="rounded-lg bg-[#f97316] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ea6a0c]">
              提交反馈
            </button>
            {fbSent && <p className="text-sm text-emerald-600">已收到你的反馈（演示环境）。紧急问题建议直接联系客服或加入社群。</p>}
          </form>
        </div>
      </section>

      {/* 客服区域 */}
      <section id="contact" className="scroll-mt-24 py-16 pb-28">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="font-display text-[26px] font-bold sm:text-[30px]">支持与服务</h2>
          <p className="mt-2 text-sm text-[#6b7280]">服务时间：9:00 – 18:00</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: '连接帮助', d: 'MT5 环境与兼容性确认', act: '打开客服抽屉' },
              { t: '使用帮助', d: '功能与操作问题', act: '查看常见问题', href: '#faq' },
              { t: '产品反馈', d: '告诉我们哪里可以做得更好', act: '打开反馈表单', href: '#feedback' },
              { t: '联系客服', d: '实时在线，快速响应', act: '打开客服抽屉' },
            ].map((c) => (
              <div key={c.t} className="card-light flex flex-col rounded-2xl p-6">
                <h3 className="text-[15px] font-bold">{c.t}</h3>
                <p className="mt-2 flex-1 text-sm text-[#6b7280]">{c.d}</p>
                {c.href ? (
                  <a href={c.href} className="mt-5 rounded-lg border border-[#e5e7eb] py-2.5 text-center text-sm font-semibold transition-colors hover:border-[#111111]">
                    {c.act}
                  </a>
                ) : (
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="mt-5 rounded-lg bg-[#f97316] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ea6a0c]"
                  >
                    {c.act}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* 客服抽屉 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto border-l border-[#e5e7eb] bg-white p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">联系客服</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-[#9ca3af] hover:text-[#111111]">✕</button>
            </div>
            <p className="mt-1 text-xs text-[#9ca3af]">服务时间 9:00 – 18:00</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-4">
                <img src="/qr/kefuyuanyuan-qr.png" alt="客服元元企业微信" className="h-20 w-20 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">企业微信客服 · 元元</div>
                  <div className="mt-1 text-xs text-[#9ca3af]">扫码添加，一对一服务</div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-4">
                <img src="/qr/qq-group-qr.png" alt="QQ 群" className="h-20 w-20 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">QQ 群 638778129</div>
                  <div className="mt-1 text-xs text-[#9ca3af]">群内提问，社区一起答</div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-4">
                <img src="/qr/wecom-group-qr.png" alt="企业微信群" className="h-20 w-20 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">企业微信群</div>
                  <div className="mt-1 text-xs text-[#9ca3af]">备用通道，防止 QQ 群不可达</div>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full rounded-lg bg-[#f97316] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ea6a0c]">
              联系客服
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
