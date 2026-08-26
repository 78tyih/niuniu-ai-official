import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import { CHAPTERS } from '../lib/chapters'

export default function Demo() {
  const location = useLocation()
  const [active, setActive] = useState(CHAPTERS[0])

  useEffect(() => {
    const slug = location.hash.replace('#', '')
    const found = CHAPTERS.find((c) => c.slug === slug)
    if (found) setActive(found)
  }, [location.hash])

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#14171f]">
      <Nav />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8">
        <div className="micro-label text-[#b0a89c]">PRODUCT DEMO</div>
        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">产品演示</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5b6170]">
          通过视频演示，快速了解牛牛 AI 的核心功能。桌面 16:9 与手机 9:16 双版本自适应。
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* 章节导航 */}
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {CHAPTERS.map((c) => (
              <button
                key={c.no}
                onClick={() => setActive(c)}
                className={`flex min-w-[200px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all lg:min-w-0 ${
                  active.no === c.no
                    ? 'border-[#14171f] bg-white shadow-sm'
                    : 'border-[#e8e6e0] bg-white/60 hover:border-[#c9c4b9]'
                }`}
              >
                <span className={`font-mono text-xs ${active.no === c.no ? 'text-[#ff6a1a]' : 'text-[#c9c4b9]'}`}>{c.no}</span>
                <span className="text-sm font-medium">{c.title}</span>
              </button>
            ))}
          </nav>

          {/* 播放器 */}
          <div>
            <div className="ink-panel relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl">
              {/* 封面占位：视频素材待上架后替换为 <video> */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#12203a_0%,#0a0f1a_70%)]" />
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6a1a]/90">
                  <svg className="ml-1 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="mt-4 text-lg font-semibold text-white">{active.no} · {active.title}</div>
                <div className="mt-1.5 text-xs text-[#8fa0c0]">演示视频剪辑中，即将上架</div>
              </div>
              <div className="absolute right-4 bottom-3 flex items-center gap-3 text-[10px] text-[#5b6b8c]">
                <span>默认静音</span><span>字幕</span><span>倍速</span>
              </div>
            </div>

            {/* 步骤说明卡 */}
            <div className="card-light mt-5 rounded-2xl p-6">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 className="text-lg font-bold">{active.title}</h2>
                <span className="text-sm text-[#6b7280]">{active.desc}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.badges.map((b) => (
                  <span key={b} className="rounded-full border border-[#e8e6e0] bg-[#faf9f6] px-3 py-1 text-xs text-[#5b6170]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
