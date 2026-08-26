import { useState, type FormEvent } from 'react'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'

const FAQS = [
  { q: '牛牛AI 是什么？', a: '一款连接 MT5 交易环境的 AI 交易辅助系统。它把行情分析、风险审核、人工确认与交易复盘，组织在同一套工作流程中——不是脱离你交易环境的"信号机"。' },
  { q: '它是自动赚钱软件吗？', a: '不是。牛牛AI 不承诺任何收益，AI 输出仅供辅助参考。所有交易决策由你自己做出，风险也由你自己承担。如果有人向你承诺"稳赚"，那一定不是我们。' },
  { q: '它和普通 AI 聊天工具有什么不同？', a: '普通 AI 聊天工具不了解你的交易环境。牛牛AI 连接你授权的 MT5 账户，能结合真实行情、你的指标与 Prompt 规则、以及你的历史订单进行分析、审核与复盘。' },
  { q: '行情数据从哪里来？', a: '来自你自己连接的 MT5 及其经纪商，牛牛AI 不自行定价、不提供行情。不同平台之间报价存在差异，通常与经纪商、品种、时区和延迟有关。' },
  { q: '支持所有 MT5 和券商吗？', a: '我们不这样承诺。原则上 MT5 环境均可连接，但个别券商的接口限制可能成为例外——建议先联系客服确认你的环境，再决定是否使用。' },
  { q: 'AI 会自动替我下单吗？最终由谁确认？', a: '分析与审核都只是辅助环节，最终由你确认。你可以在设置中决定风险审核、持仓诊断是否参与流程，并通过风控设置限制每日交易次数、最大持仓与止损止盈边界。' },
  { q: '风险审核通过，就代表这笔交易安全吗？', a: '不代表。审核只是工作流程中的一道独立复核，用来检查交易条件和你的规则。市场、模型、网络和执行风险依然存在，审核通过不等于盈利保证。' },
  { q: '什么样的人不适合用牛牛AI？', a: '只想得到一个确定买卖答案的人；希望软件保证收益、或代替自己承担亏损的人；不愿学习基础交易风险和账户操作的人。如果你属于以上情况，建议先了解风险教育内容，再考虑是否使用。' },
]

const ISSUE_TYPES = ['MT5 连接问题', '产品功能咨询', '套餐与支付', '售后与反馈', '其他问题']

export default function Support() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [issue, setIssue] = useState(ISSUE_TYPES[0])
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [fbType, setFbType] = useState('功能建议')
  const [fbDesc, setFbDesc] = useState('')
  const [fbContact, setFbContact] = useState('')
  const [fbSent, setFbSent] = useState(false)

  const submitFeedback = (e: FormEvent) => {
    e.preventDefault()
    // 演示环境：不落地存储，正式环境接入工单系统
    setFbSent(true)
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#14171f]">
      <Nav />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8">
        <div className="micro-label text-[#b0a89c]">SUPPORT</div>
        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">支持与服务</h1>
        <p className="mt-4 text-sm text-[#5b6170]">我们在这里帮助你。服务时间：9:00 – 18:00</p>

        {/* 四张服务卡 */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-light flex flex-col rounded-2xl p-6">
            <h2 className="text-base font-bold">咨询客服</h2>
            <p className="mt-2 flex-1 text-sm text-[#6b7280]">实时在线，快速响应</p>
            <button
              onClick={() => setDrawerOpen(true)}
              className="mt-5 rounded-xl bg-[#ff6a1a] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#f45d0d]"
            >
              打开客服抽屉
            </button>
          </div>
          <div id="community" className="card-light flex flex-col rounded-2xl p-6">
            <h2 className="text-base font-bold">使用社群</h2>
            <p className="mt-2 flex-1 text-sm text-[#6b7280]">加入社群，交流经验</p>
            <a href="#community-list" className="mt-5 rounded-xl border border-[#d8d4cb] py-2.5 text-center text-sm font-semibold text-[#3f4756] transition-all hover:border-[#14171f]">
              查看社群入口
            </a>
          </div>
          <div id="feedback" className="card-light flex flex-col rounded-2xl p-6">
            <h2 className="text-base font-bold">产品反馈</h2>
            <p className="mt-2 flex-1 text-sm text-[#6b7280]">告诉我们哪里可以做得更好</p>
            <a href="#feedback-form" className="mt-5 rounded-xl border border-[#d8d4cb] py-2.5 text-center text-sm font-semibold text-[#3f4756] transition-all hover:border-[#14171f]">
              打开反馈表单
            </a>
          </div>
          <div className="card-light flex flex-col rounded-2xl p-6">
            <h2 className="text-base font-bold">常见问题</h2>
            <p className="mt-2 flex-1 text-sm text-[#6b7280]">查看常见问题解答</p>
            <a href="#faq" className="mt-5 rounded-xl border border-[#d8d4cb] py-2.5 text-center text-sm font-semibold text-[#3f4756] transition-all hover:border-[#14171f]">
              展开 FAQ 列表
            </a>
          </div>
        </div>

        {/* 社群入口 */}
        <section id="community-list" className="mt-16 scroll-mt-24">
          <h2 className="font-display text-2xl font-bold">使用社群</h2>
          <p className="mt-2 text-sm text-[#6b7280]">QQ 群与企业微信群双通道保留，任一渠道都可以找到我们。</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="card-light rounded-2xl p-6 text-center">
              <img src="/community/qq-group-qr.png" alt="QQ 群二维码" className="mx-auto h-36 w-36 rounded-lg border border-[#e8e6e0] object-cover" />
              <div className="mt-4 text-sm font-semibold">QQ 交流群</div>
              <div className="mt-1 font-mono text-base font-bold text-[#ff6a1a]">638778129</div>
              <div className="mt-1 text-xs text-[#9aa0ad]">搜索群号即可加入</div>
            </div>
            <div className="card-light rounded-2xl p-6 text-center">
              <img src="/community/wecom-group-qr.png" alt="企业微信群二维码" className="mx-auto h-36 w-36 rounded-lg border border-[#e8e6e0] object-cover" />
              <div className="mt-4 text-sm font-semibold">企业微信群</div>
              <div className="mt-1 text-xs text-[#9aa0ad]">扫码加入（备用通道，防止 QQ 群不可达）</div>
            </div>
            <div className="card-light rounded-2xl p-6 text-center">
              <img src="/community/qq-channel-qr.png" alt="腾讯频道二维码" className="mx-auto h-36 w-36 rounded-lg border border-[#e8e6e0] object-cover" />
              <div className="mt-4 text-sm font-semibold">腾讯频道 · 🐮牛气冲天（MT5 版）</div>
              <a
                href="https://pd.qq.com/s/1j4t73gpf?b=9"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs text-[#ff6a1a] underline underline-offset-4"
              >
                点击链接加入频道 →
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-16 scroll-mt-24">
          <h2 className="font-display text-2xl font-bold">常见问题</h2>
          <p className="mt-2 text-sm text-[#6b7280]">以下回答基于当前产品资料整理，正式承诺以用户协议与正式版本为准。</p>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`card-light overflow-hidden rounded-xl transition-colors ${openFaq === i ? 'border-[#14171f]/40' : ''}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-[15px] font-semibold"
                >
                  {f.q}
                  <span className={`ml-4 text-[#c9c4b9] transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>＋</span>
                </button>
                {openFaq === i && <p className="px-6 pb-5 text-sm leading-relaxed text-[#6b7280]">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* 反馈表单 */}
        <section id="feedback-form" className="mt-16 scroll-mt-24">
          <h2 className="font-display text-2xl font-bold">产品反馈</h2>
          <form onSubmit={submitFeedback} className="card-light mt-8 max-w-2xl space-y-5 rounded-2xl p-7">
            <div>
              <label className="mb-1.5 block text-xs text-[#9aa0ad]">反馈类型</label>
              <select
                value={fbType}
                onChange={(e) => setFbType(e.target.value)}
                className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
              >
                {['功能建议', '使用问题', '支付与订阅', '其他'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#9aa0ad]">简短描述</label>
              <textarea
                required
                value={fbDesc}
                onChange={(e) => setFbDesc(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
                placeholder="简单描述你遇到的问题或建议…"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#9aa0ad]">联系方式（选填）</label>
              <input
                value={fbContact}
                onChange={(e) => setFbContact(e.target.value)}
                className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
                placeholder="邮箱 / 手机号 / QQ"
              />
            </div>
            <button type="submit" className="rounded-xl bg-[#ff6a1a] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#f45d0d]">
              提交反馈
            </button>
            {fbSent && <p className="text-sm text-emerald-600">已收到你的反馈（演示环境）。紧急问题建议直接联系客服或加入社群。</p>}
          </form>
        </section>
      </main>
      <Footer />

      {/* 客服抽屉（右侧滑出） */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto border-l border-[#e8e6e0] bg-white p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">联系客服</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-[#9aa0ad] hover:text-[#14171f]">✕</button>
            </div>
            <p className="mt-1 text-xs text-[#9aa0ad]">服务时间 9:00 – 18:00</p>

            <div className="mt-6">
              <div className="text-xs text-[#9aa0ad]">先选一个问题类型</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ISSUE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setIssue(t)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs transition-all ${
                      issue === t ? 'border-[#ff6a1a] bg-[#ff6a1a]/8 text-[#ff6a1a]' : 'border-[#e0ddd6] text-[#6b7280] hover:border-[#c9c4b9]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#faf9f6] p-5">
              <div className="text-sm font-semibold">{issue}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#6b7280]">
                {issue === 'MT5 连接问题' && '请准备好你的 MT5 版本、券商名称与系统版本，客服会逐步协助你完成连接。'}
                {issue === '产品功能咨询' && '告诉我们你想了解的功能章节，客服会结合演示视频为你讲解。'}
                {issue === '套餐与支付' && '请提供订单号或注册邮箱，客服会核对订阅与牛气值到账情况。'}
                {issue === '售后与反馈' && '退款与开票遵循「谁收款谁负责」原则，客服会告知你具体流程。'}
                {issue === '其他问题' && '直接描述你的问题即可，客服会在服务时间内尽快回复。'}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-[#e8e6e0] p-4">
                <img src="/community/kefuyuanyuan-qr.png" alt="客服元元企业微信" className="h-20 w-20 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">企业微信客服 · 元元</div>
                  <div className="mt-1 text-xs text-[#9aa0ad]">扫码添加，一对一服务</div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[#e8e6e0] p-4">
                <img src="/community/qq-group-qr.png" alt="QQ 群" className="h-20 w-20 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">QQ 群 638778129</div>
                  <div className="mt-1 text-xs text-[#9aa0ad]">群内提问，社区一起答</div>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full rounded-xl bg-[#ff6a1a] py-3 text-sm font-semibold text-white transition-all hover:bg-[#f45d0d]">
              联系客服
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
