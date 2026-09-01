import { useState, type FormEvent } from 'react'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import { useReveal } from '../hooks/useReveal'
import { api } from '../lib/api'

type FeedCategory = '产品更新' | 'Prompt 分享' | '使用技巧' | '常见问题'

interface FeedItem {
  cat: FeedCategory
  date: string
  title: string
  desc: string
}

const FEED: FeedItem[] = [
  { cat: '产品更新', date: '2026-08', title: '官网 V2 上线', desc: '全新视觉、真实产品演示视频剧场、社区页面开放。' },
  { cat: '产品更新', date: '2026-08', title: '演示视频 10 章节发布', desc: '覆盖连接 MT5、AI 分析、风险审核、持仓诊断到交易复盘的完整流程。' },
  { cat: 'Prompt 分享', date: '2026-08', title: '多周期共振分析模板', desc: '让 AI 同时参考日线趋势与 1 小时结构，输出冲突点和一致点。' },
  { cat: 'Prompt 分享', date: '2026-08', title: '风险审核规则模板', desc: '把单笔最大亏损、每日最大交易次数写进提示词，审核更贴合你的规则。' },
  { cat: '使用技巧', date: '2026-08', title: '如何让复盘更有效', desc: '交易结束后 10 分钟内打开复盘，把当时的判断理由口述给 AI 记录。' },
  { cat: '使用技巧', date: '2026-07', title: '多品种分析的正确打开方式', desc: '先跑一个品种建立提示词基线，再复制到其他品种微调。' },
  { cat: '产品更新', date: '2026-07', title: '牛气值体系上线', desc: '50 元 = 1000 点，随套餐发放，用于 AI 分析额度消耗。' },
]

const FAQS = [
  { q: '牛牛AI 是什么？', a: '一款连接 MT5 交易环境的 AI 交易辅助系统。它把行情分析、风险审核、人工确认与交易复盘，组织在同一套工作流程中——不是脱离你交易环境的"信号机"。' },
  { q: '它是自动赚钱软件吗？', a: '不是。牛牛AI 不承诺任何收益，AI 输出仅供辅助参考。所有交易决策由你自己做出，风险也由你自己承担。如果有人向你承诺"稳赚"，那一定不是我们。' },
  { q: '行情数据从哪里来？', a: '来自你自己连接的 MT5 及其经纪商，牛牛AI 不自行定价、不提供行情。不同平台之间报价存在差异，通常与经纪商、品种、时区和延迟有关。' },
  { q: '支持所有 MT5 和券商吗？', a: '我们不这样承诺。原则上 MT5 环境均可连接，但个别券商的接口限制可能成为例外——建议先联系客服确认你的环境，再决定是否使用。' },
  { q: 'AI 会自动替我下单吗？最终由谁确认？', a: '分析与审核都只是辅助环节，最终由你确认。你可以在设置中决定风险审核、持仓诊断是否参与流程，并通过风控设置限制每日交易次数、最大持仓与止损止盈边界。' },
  { q: '什么样的人不适合用牛牛AI？', a: '只想得到一个确定买卖答案的人；希望软件保证收益、或代替自己承担亏损的人；不愿学习基础交易风险和账户操作的人。如果你属于以上情况，建议先了解风险教育内容，再考虑是否使用。' },
]

const TABS: ('全部' | FeedCategory)[] = ['全部', '产品更新', 'Prompt 分享', '使用技巧', '常见问题']

const CAT_STYLE: Record<FeedCategory, string> = {
  产品更新: 'bg-[#2563eb]/10 text-[#2563eb]',
  'Prompt 分享': 'bg-[#f97316]/10 text-[#f97316]',
  使用技巧: 'bg-emerald-500/10 text-emerald-600',
  常见问题: 'bg-[#6b7280]/10 text-[#6b7280]',
}

export default function Community() {
  useReveal()
  const [tab, setTab] = useState<(typeof TABS)[number]>('全部')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [fbType, setFbType] = useState('功能建议')
  const [fbDesc, setFbDesc] = useState('')
  const [fbContact, setFbContact] = useState('')
  const [fbSent, setFbSent] = useState(false)
  const [fbSending, setFbSending] = useState(false)
  const [fbError, setFbError] = useState('')

  const FB_TYPE_MAP: Record<string, string> = {
    功能建议: 'suggest',
    使用问题: 'bug',
    支付与订阅: 'consult',
    其他: 'other',
  }

  const submitFeedback = async (e: FormEvent) => {
    e.preventDefault()
    if (fbSending) return
    setFbSending(true)
    setFbError('')
    try {
      await api('/feedback', {
        body: { type: FB_TYPE_MAP[fbType] || 'other', content: fbDesc, contact: fbContact || undefined },
        auth: true,
      })
      setFbSent(true)
    } catch (err) {
      setFbError((err as Error).message || '提交失败，请稍后重试')
    } finally {
      setFbSending(false)
    }
  }

  const items = FEED.filter((f) => tab === '全部' || f.cat === tab)
  const showFaq = tab === '全部' || tab === '常见问题'

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* 紧凑头部 */}
      <section className="pb-8 pt-[104px] sm:pt-[128px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h1 className="font-display text-[28px] font-bold sm:text-[34px]">加入牛牛 AI 社区</h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">获取产品更新、使用技巧和交易 AI 工作流经验。</p>
        </div>
      </section>

      <section className="pb-[64px] sm:pb-[80px]">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-6 sm:px-10 lg:grid-cols-[1fr_320px]">
          {/* ===== 左侧：内容 Feed ===== */}
          <div>
            {/* 分类 Tabs */}
            <div className="scrollbar-none -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:px-0">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
                    tab === t
                      ? 'bg-[#111111] text-white'
                      : 'border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#111111] hover:text-[#111111]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Feed 列表 */}
            <div className="mt-6 space-y-3">
              {items.map((f) => (
                <article key={f.title} className="card-light btn-lift cursor-default rounded-xl px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CAT_STYLE[f.cat]}`}>{f.cat}</span>
                    <span className="font-mono text-[12px] text-[#9ca3af]">{f.date}</span>
                  </div>
                  <h2 className="mt-2.5 text-[16px] font-bold">{f.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">{f.desc}</p>
                </article>
              ))}

              {/* 常见问题（Feed 内展开） */}
              {showFaq &&
                FAQS.map((f, i) => (
                  <div
                    key={f.q}
                    id={i === 0 ? 'faq' : undefined}
                    className={`overflow-hidden rounded-xl border bg-white transition-colors ${openFaq === i ? 'border-[#111111]/30' : 'border-[#e5e7eb]'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center gap-3 px-6 py-4 text-left"
                    >
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CAT_STYLE['常见问题']}`}>常见问题</span>
                      <span className="flex-1 text-[15px] font-semibold">{f.q}</span>
                      <span className={`text-[#d1d5db] transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>＋</span>
                    </button>
                    {openFaq === i && <p className="px-6 pb-4 text-sm leading-relaxed text-[#6b7280]">{f.a}</p>}
                  </div>
                ))}
            </div>
          </div>

          {/* ===== 右侧固定栏 ===== */}
          <aside className="space-y-4 lg:sticky lg:top-[92px]">
            {/* 加入社群 */}
            <div id="groups" className="card-light scroll-mt-24 rounded-2xl p-6">
              <h3 className="text-[15px] font-bold">加入社群</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <img src="/qr/qq-group-qr.png" alt="QQ 群二维码" className="h-16 w-16 rounded-lg border border-[#e5e7eb] object-cover" />
                  <div>
                    <div className="text-[13px] font-semibold">QQ 交流群</div>
                    <div className="font-mono text-[13px] font-bold text-[#f97316]">638778129</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <img src="/qr/wecom-group-qr.png" alt="企业微信群二维码" className="h-16 w-16 rounded-lg border border-[#e5e7eb] object-cover" />
                  <div>
                    <div className="text-[13px] font-semibold">企业微信群</div>
                    <div className="text-[11px] text-[#9ca3af]">备用通道，防 QQ 群不可达</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <img src="/qr/qq-channel-qr.png" alt="腾讯频道二维码" className="h-16 w-16 rounded-lg border border-[#e5e7eb] object-cover" />
                  <div>
                    <div className="text-[13px] font-semibold">腾讯频道 · 🐮牛气冲天</div>
                    <a href="https://pd.qq.com/s/1j4t73gpf?b=9" target="_blank" rel="noreferrer" className="link-arrow text-[12px] font-medium text-[#f97316]">
                      点击加入 <span className="arrow">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 联系客服 */}
            <div id="contact" className="card-light scroll-mt-24 rounded-2xl p-6">
              <h3 className="text-[15px] font-bold">联系客服</h3>
              <p className="mt-1 text-[12px] text-[#9ca3af]">服务时间 9:00 – 18:00</p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="btn-lift mt-4 w-full rounded-lg bg-[#f97316] py-2.5 text-sm font-semibold text-white hover:bg-[#ea6a0c]"
              >
                打开客服通道
              </button>
            </div>

            {/* 提交反馈 */}
            <div id="feedback" className="card-light scroll-mt-24 rounded-2xl p-6">
              <h3 className="text-[15px] font-bold">提交反馈</h3>
              <p className="mt-1 text-[12px] text-[#9ca3af]">告诉我们哪里可以做得更好</p>
              <button
                onClick={() => setFeedbackOpen(true)}
                className="btn-lift mt-4 w-full rounded-lg border border-[#e5e7eb] py-2.5 text-sm font-semibold text-[#111111] hover:border-[#111111]"
              >
                填写反馈表单
              </button>
            </div>
          </aside>
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
          </aside>
        </div>
      )}

      {/* 反馈弹窗 */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={() => setFeedbackOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">用户反馈</h3>
              <button onClick={() => setFeedbackOpen(false)} className="text-[#9ca3af] hover:text-[#111111]">✕</button>
            </div>
            <form onSubmit={submitFeedback} className="mt-5 space-y-4">
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
              <button type="submit" disabled={fbSending} className="btn-lift rounded-lg bg-[#f97316] px-8 py-3 text-sm font-semibold text-white hover:bg-[#ea6a0c] disabled:opacity-50">
                {fbSending ? '提交中…' : '提交反馈'}
              </button>
              {fbSent && <p className="text-sm text-emerald-600">已收到你的反馈，感谢！紧急问题建议直接联系客服或加入社群。</p>}
              {fbError && <p className="text-sm text-[#d4530f]">{fbError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
