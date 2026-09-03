import { useState, type FormEvent } from 'react'
import { api } from '../../lib/api'

export default function CommunitySidebar() {
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

  return (
    <>
      <aside className="space-y-4 lg:sticky lg:top-[92px]">
        <div id="groups" className="card-light scroll-mt-24 rounded-2xl p-6">
          <h3 className="text-[15px] font-bold">加入社群</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/qr/qq-group-qr.png" alt="QQ 群二维码" className="h-16 w-16 shrink-0 rounded-lg border border-[#e5e7eb] object-cover" />
              <div>
                <div className="text-[13px] font-semibold">QQ 交流群</div>
                <div className="font-mono text-[13px] font-bold text-[#f97316]">638778129</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <img src="/qr/wecom-group-qr.png" alt="企业微信群二维码" className="h-16 w-16 shrink-0 rounded-lg border border-[#e5e7eb] object-cover" />
              <div>
                <div className="text-[13px] font-semibold">企业微信群</div>
                <div className="text-[11px] text-[#9ca3af]">备用通道，防 QQ 群不可达</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <img src="/qr/qq-channel-qr.png" alt="腾讯频道二维码" className="h-16 w-16 shrink-0 rounded-lg border border-[#e5e7eb] object-cover" />
              <div>
                <div className="text-[13px] font-semibold">腾讯频道 · 🐮牛气冲天</div>
                <a href="https://pd.qq.com/s/1j4t73gpf?b=9" target="_blank" rel="noreferrer" className="link-arrow text-[12px] font-medium text-[#f97316]">
                  点击加入 <span className="arrow">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

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
                <img src="/qr/kefuyuanyuan-qr.png" alt="客服元元企业微信" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">企业微信客服 · 元元</div>
                  <div className="mt-1 text-xs text-[#9ca3af]">扫码添加，一对一服务</div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-4">
                <img src="/qr/qq-group-qr.png" alt="QQ 群" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">QQ 群 638778129</div>
                  <div className="mt-1 text-xs text-[#9ca3af]">群内提问，社区一起答</div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] p-4">
                <img src="/qr/wecom-group-qr.png" alt="企业微信群" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">企业微信群</div>
                  <div className="mt-1 text-xs text-[#9ca3af]">备用通道，防止 QQ 群不可达</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

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
    </>
  )
}