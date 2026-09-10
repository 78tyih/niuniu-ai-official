import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { searchArticles } from '../../content/learn'

const EXAMPLES = ['MT5 连不上', 'AI 为什么不开仓', '怎么设置止损', '怎么修改 Prompt']

export default function LearningSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const blurTimer = useRef<number | null>(null)

  const results = useMemo(() => (q.trim() ? searchArticles(q).slice(0, 6) : []), [q])
  const open = focused && q.trim().length > 0

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            blurTimer.current = window.setTimeout(() => setFocused(false), 150)
          }}
          placeholder="你现在想解决什么问题？"
          aria-label="搜索学习内容"
          className="w-full rounded-xl border border-[#e5e7eb] bg-white py-3.5 pl-11 pr-4 text-[15px] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#f97316]"
        />
      </div>

      {!q.trim() && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQ(ex)}
              className="rounded-full border border-[#eceae6] bg-white px-3 py-1.5 text-[12px] text-[#6b7280] transition-colors hover:border-[#f97316] hover:text-[#f97316]"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-[#eceae6] bg-white shadow-[0_16px_48px_-16px_rgba(17,17,17,0.18)]">
          {results.length === 0 ? (
            <div className="px-4 py-5 text-[13px] text-[#9ca3af]">
              没有匹配的教程。可以换个说法，或到下方分类里浏览。
            </div>
          ) : (
            <ul className="divide-y divide-[#f3f4f6]">
              {results.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/learn/${a.slug}`}
                    onClick={() => {
                      if (blurTimer.current) window.clearTimeout(blurTimer.current)
                      setFocused(false)
                    }}
                    className="block px-4 py-3 transition-colors hover:bg-[#fafaf8]"
                  >
                    <div className="text-[14px] font-medium text-[#111111]">{a.title}</div>
                    <div className="mt-0.5 line-clamp-1 text-[12px] text-[#6b7280]">{a.shortAnswer}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
