import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { askXiaoniu, formatOrdersForChat, type XiaoniuReply } from '../../lib/xiaoniu-engine'
import type { XiaoniuLink } from '../../content/support/xiaoniu-kb'
import {
  isGroupQrValid,
  QUICK_ASK,
  SUPPORT_CONTACT,
  XIAONIU_GREETING,
} from '../../content/support/xiaoniu-kb'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

type Msg = {
  id: string
  from: 'bot' | 'user'
  text?: string
  lines?: string[]
  links?: XiaoniuLink[]
  escalate?: boolean
  escalateMode?: XiaoniuReply['escalateMode']
  kind?: XiaoniuReply['kind']
  /**
   * 敏感消息：含订单号等本人数据，不写 localStorage。
   * 刷新即消失，避免共用电脑 / 退出登录后留下残留。
   */
  sensitive?: boolean
}

const HISTORY_KEY = 'xiaoniu-chat-history'

/** 抹掉敏感消息后再落盘 */
function persistable(msgs: Msg[]): Msg[] {
  return msgs.filter((m) => !m.sensitive).map(({ sensitive: _drop, ...rest }) => rest)
}

interface RawOrder {
  order_no: string
  plan_name?: string | null
  plan_code?: string
  amount_cents?: number
  status?: string
  channel?: string
  created_at?: string
  paid_at?: string | null
}

function CowIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.6 8.6C5 8 4 6.6 4.4 5.6c.5-1 2-.9 2.9.3" />
      <path d="M17.4 8.6c1.6-.6 2.6-2 2.2-3-.5-1-2-.9-2.9.3" />
      <path d="M5 10.8c0-2.9 2.7-5.3 6-5.3s6 2.4 6 5.3v2.6c0 3.4-2.7 6.1-6 6.1s-6-2.7-6-6.1v-2.6Z" />
      <path d="M8.4 15.4c0 1.5 1.7 2.6 3.6 2.6s3.6-1.1 3.6-2.6-1.7-2-3.6-2-3.6.5-3.6 2Z" />
      <circle cx="10.5" cy="16" r=".75" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="16" r=".75" fill="currentColor" stroke="none" />
      <circle cx="9.3" cy="11.7" r=".95" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="11.7" r=".95" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkChip({ link }: { link: XiaoniuLink }) {
  const cls =
    'inline-flex items-center rounded-lg border border-[#eceae6] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#374151] transition-colors hover:border-[#f97316] hover:text-[#f97316]'
  return link.external ? (
    <a href={link.to} target="_blank" rel="noreferrer" className={cls}>
      {link.label} →
    </a>
  ) : (
    <Link to={link.to} className={cls}>
      {link.label} →
    </Link>
  )
}

/** 可放大的二维码：面板里先看小图，点一下开大图，不占版面 */
function QrBadge({ src, label, hint }: { src: string; label: string; hint?: string }) {
  const [zoom, setZoom] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="flex items-center gap-2.5 rounded-lg border border-[#eceae6] bg-white p-1.5 pr-3 text-left transition-colors hover:border-[#f97316]"
        aria-label={`放大查看${label}二维码`}
      >
        <img src={src} alt={label} className="h-12 w-12 rounded object-cover" />
        <span className="min-w-0">
          <span className="block text-[12px] font-medium text-[#374151]">{label}</span>
          {hint && <span className="mt-0.5 block text-[10.5px] text-[#9ca3af]">{hint}</span>}
        </span>
      </button>
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-6"
          role="presentation"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6">
            <img src={src} alt={label} className="h-56 w-56 rounded-xl object-cover" />
            <div className="text-[13px] font-medium text-[#111111]">{label}</div>
            {hint && <div className="text-[11.5px] text-[#9ca3af]">{hint}</div>}
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="rounded-lg border border-[#eceae6] px-4 py-1.5 text-[12.5px] text-[#6b7280] hover:text-[#111111]"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * 转人工卡片。
 * one-on-one：只给客服个人码（订单 / 隐私 / 账号类，绝不把人推进群里核对隐私）
 * plus-group：客服码 + 群入口（一般问题，群里有其他人能接得住）
 */
function EscalateCard({ mode = 'plus-group' }: { mode?: XiaoniuReply['escalateMode'] }) {
  const groupValid = isGroupQrValid()
  const oneOnOne = mode === 'one-on-one'
  return (
    <div className="mt-2.5 rounded-xl border border-[#f97316]/25 bg-[#fff7f0] px-3.5 py-3">
      <div className="text-[12.5px] font-semibold text-[#111111]">
        {oneOnOne ? '转人工 · 一对一核对' : '转人工客服'}
      </div>
      <div className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">
        服务时间 {SUPPORT_CONTACT.hours}
        {oneOnOne ? '。涉及账户与支付信息，请走一对一通道，不要在群里公开。' : '。'}
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5">
        <QrBadge src={SUPPORT_CONTACT.wecomQr} label="企业微信客服「元元」" hint="扫码 · 一对一" />
        {!oneOnOne && groupValid && (
          <QrBadge
            src={SUPPORT_CONTACT.wecomGroup.qr}
            label={SUPPORT_CONTACT.wecomGroup.label}
            hint="扫码进群"
          />
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <a
          href={SUPPORT_CONTACT.wecom.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-[#f97316] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#f45d0d]"
        >
          企业微信客服 →
        </a>
        {!oneOnOne && groupValid && <LinkChip link={SUPPORT_CONTACT.wecomGroup as XiaoniuLink} />}
        {!oneOnOne && <LinkChip link={{ label: `QQ 群 ${SUPPORT_CONTACT.qqGroup}`, to: '/learn#groups' }} />}
      </div>
    </div>
  )
}

export default function XiaoniuWidget() {
  const { user, loading: authLoading } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) return JSON.parse(raw) as Msg[]
    } catch {
      /* 历史记录损坏就重来 */
    }
    return [
      { id: 'm0', from: 'bot', lines: XIAONIU_GREETING },
      { id: 'm1', from: 'bot', lines: ['你可以直接问我，比如：'], links: undefined },
    ]
  })
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  /** 当前会话所属账号；切换账号时清空历史，防止 A 看到 B 的残留 */
  const ownerRef = useRef<string | null>(null)
  /**
   * 会话版本号。登出 / 切号时 +1，在途的订单请求据此丢弃结果。
   * 只比 uid 不够：A → 登出 → 再登回 A，uid 相同但已经是另一段会话了。
   */
  const sessionRef = useRef(0)
  /** 在途订单请求的取消器 */
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // 敏感消息不落盘：订单号这类本人数据只活在当前会话里
    try {
      const safe = persistable(msgs)
      if (safe.length) localStorage.setItem(HISTORY_KEY, JSON.stringify(safe))
      else localStorage.removeItem(HISTORY_KEY)
    } catch {
      /* 隐私模式下 localStorage 不可用，忽略 */
    }
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    })
  }, [msgs])

  // 登录态变化 = 换人（或退出登录）：清空历史，绝不留上一个账号的对话
  useEffect(() => {
    if (authLoading) return
    const uid = user?.id ?? null
    if (ownerRef.current === null) {
      ownerRef.current = uid
      return
    }
    if (ownerRef.current !== uid) {
      ownerRef.current = uid
      // 会话版本 +1，并掐断在途请求：否则 A 的订单会在切号后落到新会话里
      sessionRef.current += 1
      abortRef.current?.abort()
      abortRef.current = null
      localStorage.removeItem(HISTORY_KEY)
      setMsgs([
        { id: 'm0', from: 'bot', lines: XIAONIU_GREETING },
        { id: `m${Date.now()}`, from: 'bot', lines: ['你可以直接问我，比如：'] },
      ])
    }
  }, [user?.id, authLoading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const showQuickAsk = useMemo(() => msgs.filter((m) => m.from === 'user').length === 0, [msgs])

  const pushBot = (m: Omit<Msg, 'id' | 'from'>) => {
    setMsgs((prev) => [...prev, { id: `b${Date.now()}${Math.random().toString(36).slice(2, 6)}`, from: 'bot', ...m }])
  }

  /** 未登录：零数据 + 引导登录，一个字段都不给 */
  const replyOrdersNeedLogin = () => {
    pushBot({
      kind: 'order',
      lines: [
        '查询订单需要先登录，以保护你的账户信息。',
        '登录后再发一次「查订单」即可。',
        '不方便登录的话，也可以联系元元，核验身份后协助查询。',
      ],
      links: [{ label: '去登录', to: '/login' }],
      escalate: true,
      escalateMode: 'one-on-one',
    })
  }

  /** 已登录：只取脱敏字段，授权码绝不进对话 */
  const fetchOrders = async () => {
    // 发起时锁定会话版本与账号；返回时任何一个变了就丢弃结果
    const sessionAtSend = sessionRef.current
    const uidAtSend = user?.id ?? null
    const ctrl = new AbortController()
    abortRef.current?.abort()
    abortRef.current = ctrl

    const stale = () => sessionRef.current !== sessionAtSend || (user?.id ?? null) !== uidAtSend

    try {
      const data = await api<{ orders?: RawOrder[] }>('/account/orders', {
        auth: true,
        signal: ctrl.signal,
      })
      // 请求在途期间用户登出或切号：结果一律作废，一个字都不渲染
      if (stale() || ctrl.signal.aborted) return

      const orders = data.orders || []
      if (orders.length === 0) {
        pushBot({
          kind: 'order',
          lines: ['你名下暂时没有订单记录。', '如果刚付完款没看到，可能是还在入账——稍等两分钟再来问我。'],
        })
        return
      }
      pushBot({
        kind: 'order',
        lines: [
          `查到 ${orders.length} 笔，以下是最近 ${Math.min(orders.length, 5)} 笔：`,
          ...formatOrdersForChat(orders),
          '授权码涉及账户安全，不在对话里显示——请到「账户」页查看，或联系客服核验身份后协助查询。',
        ],
        links: [{ label: '我的账户', to: '/account' }],
        // 订单号属于本人数据：不落 localStorage，刷新即消失
        sensitive: true,
      })
    } catch (e: any) {
      if (stale() || ctrl.signal.aborted || e?.name === 'AbortError') return

      // 401 单独分支：登录态过期 ≠ 网络故障，给的路完全不同
      if (e?.status === 401) {
        pushBot({
          kind: 'order',
          lines: ['登录已过期，我拿不到你的订单数据。', '重新登录后再发一次「查订单」就行。'],
          links: [{ label: '去登录', to: '/login' }],
          escalate: true,
          escalateMode: 'one-on-one',
        })
        return
      }
      // 不透传网络错误原文，避免把后端细节暴露到前端对话
      pushBot({
        kind: 'order',
        lines: [
          '刚才暂时没能完成查询，请稍后重试。',
          '或者直接联系元元，核验身份后协助查询。',
        ],
        escalate: true,
        escalateMode: 'one-on-one',
      })
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null
    }
  }

  const send = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    const reply = askXiaoniu(text)
    setMsgs((prev) => [
      ...prev,
      { id: `u${Date.now()}`, from: 'user', text },
    ])

    if (reply.kind === 'order') {
      pushBot({ lines: reply.lines, kind: reply.kind })
      if (authLoading) {
        setTimeout(() => (user ? fetchOrders() : replyOrdersNeedLogin()), 400)
      } else if (user) {
        void fetchOrders()
      } else {
        replyOrdersNeedLogin()
      }
    } else {
      pushBot({
        lines: reply.lines,
        links: reply.links,
        escalate: reply.escalate,
        escalateMode: reply.escalateMode,
        kind: reply.kind,
      })
    }
    setInput('')
  }

  return (
    <>
      {/* 悬浮入口 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '关闭客服小牛' : '打开客服小牛'}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#111111] shadow-[0_10px_30px_-8px_rgba(17,17,17,0.25)] ring-1 ring-[#eceae6] transition-transform hover:scale-[1.04] active:scale-[0.98] sm:bottom-7 sm:right-7"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <CowIcon />
        )}
      </button>

      {/* 对话面板 */}
      {open && (
        <div className="fixed bottom-24 right-4 z-[69] flex h-[min(620px,calc(100vh-140px))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#eceae6] bg-white shadow-[0_24px_60px_-12px_rgba(17,17,17,0.28)] sm:right-7 sm:w-[380px]">
          {/* 头部 */}
          <div className="flex items-center gap-3 border-b border-[#eceae6] bg-[#fafaf8] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#f97316] ring-1 ring-[#eceae6]">
              <CowIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold leading-tight text-[#111111]">小牛 · 智能客服</div>
              <div className="mt-0.5 text-[11.5px] text-[#9ca3af]">服务时间 {SUPPORT_CONTACT.hours}</div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem(HISTORY_KEY)
                setMsgs([
                  { id: 'm0', from: 'bot', lines: XIAONIU_GREETING },
                  { id: `m${Date.now()}`, from: 'bot', lines: ['你可以直接问我，比如：'] },
                ])
              }}
              aria-label="清空对话"
              title="清空对话"
              className="rounded-lg p-1.5 text-[#9ca3af] transition-colors hover:bg-white hover:text-[#111111]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
              </svg>
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="关闭"
              className="rounded-lg p-1.5 text-[#9ca3af] transition-colors hover:bg-white hover:text-[#111111]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* 消息区 */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4">
            {msgs.map((m) =>
              m.from === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-xl rounded-br-sm bg-[#111111] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[88%] rounded-xl rounded-bl-sm border border-[#eceae6] bg-[#fafaf8] px-3.5 py-2.5">
                    {m.lines?.map((l, i) => (
                      <p key={i} className="text-[13.5px] leading-[1.75] text-[#374151]">
                        {l}
                      </p>
                    ))}
                    {m.links && m.links.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.links.map((l) => (
                          <LinkChip key={l.label} link={l} />
                        ))}
                      </div>
                    )}
                    {m.escalate && <EscalateCard mode={m.escalateMode} />}
                  </div>
                </div>
              ),
            )}

            {showQuickAsk && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_ASK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-[#eceae6] bg-white px-3 py-1.5 text-[12px] text-[#6b7280] transition-colors hover:border-[#f97316] hover:text-[#f97316]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 免责 + 输入 */}
          <div className="border-t border-[#eceae6] bg-[#fafaf8] px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="问点什么，比如「多少钱」"
                aria-label="输入你的问题"
                className="min-w-0 flex-1 rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[13.5px] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#f97316]"
              />
              <button
                type="submit"
                aria-label="发送"
                className="shrink-0 rounded-xl bg-[#f97316] px-3.5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#f45d0d]"
              >
                发送
              </button>
            </form>
            <p className="mt-2 text-[10.5px] leading-relaxed text-[#9ca3af]">
              AI 输出仅供参考，不构成投资建议；交易决策与风险由你自行承担。
            </p>
          </div>
        </div>
      )}
    </>
  )
}
