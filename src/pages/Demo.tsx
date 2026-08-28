import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import VideoPlayer from '../components/VideoPlayer'
import { CHAPTERS } from '../lib/chapters'
import { useReveal } from '../hooks/useReveal'

export default function Demo() {
  useReveal()
  const location = useLocation()
  const [active, setActive] = useState(CHAPTERS[0])

  useEffect(() => {
    const slug = location.hash.replace('#', '')
    const found = CHAPTERS.find((c) => c.slug === slug)
    if (found) setActive(found)
  }, [location.hash])

  const next = CHAPTERS[(CHAPTERS.indexOf(active) + 1) % CHAPTERS.length]

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* Demo Hero */}
      <section className="pt-32 pb-14 sm:pt-40">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal max-w-2xl">
            <h1 className="font-display text-[36px] font-bold sm:text-[48px]">看看牛牛 AI 如何工作</h1>
            <p className="mt-5 text-base leading-relaxed text-[#6b7280] sm:text-[17px]">
              通过真实操作视频，了解从 MT5 连接到 AI 分析的完整流程。
            </p>
          </div>
        </div>
      </section>

      {/* Demo Theater */}
      <section className="pb-24">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <VideoPlayer
                key={active.slug}
                src={active.video}
                poster={active.poster}
                title={`${active.no} · ${active.title}`}
                autoPlayOnVisible
              />
              {/* 当前章节说明 */}
              <div className="mt-7">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm font-semibold text-[#f97316]">{active.no}</span>
                  <h2 className="text-xl font-bold">{active.title}</h2>
                </div>
                <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-[#6b7280]">{active.desc}</p>
                <button
                  onClick={() => setActive(next)}
                  className="mt-5 text-sm font-medium text-[#f97316] transition-colors hover:text-[#ea6a0c]"
                >
                  下一章节：{next.no} {next.title} →
                </button>
              </div>
            </div>

            {/* 章节导航 */}
            <nav className="space-y-1.5">
              {CHAPTERS.map((c) => (
                <button
                  key={c.no}
                  onClick={() => setActive(c)}
                  className={`flex w-full items-center gap-4 rounded-lg px-4 py-3.5 text-left transition-colors ${
                    active.slug === c.slug ? 'bg-white shadow-sm ring-1 ring-[#e5e7eb]' : 'hover:bg-white'
                  }`}
                >
                  <span className={`font-mono text-sm font-semibold ${active.slug === c.slug ? 'text-[#f97316]' : 'text-[#d1d5db]'}`}>
                    {c.no}
                  </span>
                  <span className={`flex-1 text-[15px] ${active.slug === c.slug ? 'font-semibold' : 'font-medium text-[#374151]'}`}>
                    {c.title}
                  </span>
                  {active.slug === c.slug && <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="pb-24 text-center">
        <p className="text-[15px] text-[#6b7280]">看完演示，选择适合你的使用周期。</p>
        <Link
          to="/pricing"
          className="mt-5 inline-block rounded-lg bg-[#f97316] px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#ea6a0c]"
        >
          查看价格方案
        </Link>
      </section>

      <Footer />
    </div>
  )
}
