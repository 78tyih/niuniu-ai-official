import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import ProductFrame from '../components/ProductFrame'
import Section, { SectionHead } from '../components/Section'
import { HOME_CHAPTERS } from '../lib/chapters'
import { useReveal } from '../hooks/useReveal'
import { api, fmtPrice, INTERVAL_LABEL, type Plan } from '../lib/api'

const STEPS = [
  { no: '01', name: 'Analysis', title: 'AI 帮你整理行情与市场条件', img: '/screenshots/ai-analysis.jpg' },
  { no: '02', name: 'Risk Review', title: '行动之前，重新检查交易风险', img: '/screenshots/ai-review.jpg' },
  { no: '03', name: 'Human Confirmation', title: 'AI 提供分析，最终决定由你掌控', img: '/screenshots/ai-assistant.jpg' },
  { no: '04', name: 'Trade Review', title: '保存分析过程，每一次交易都可回看', img: '/screenshots/ai-replay.jpg' },
]

const CAPABILITIES = [
  { title: 'AI 行情分析', desc: '从行情、指标和交易条件中整理分析依据。', img: '/screenshots/ai-analysis.jpg' },
  { title: '独立审核', desc: '在行动之前，根据你的规则重新检查风险。', img: '/screenshots/ai-review.jpg' },
  { title: '人工确认', desc: 'AI 辅助分析，最终决定仍由你掌控。', img: '/screenshots/ai-assistant.jpg' },
]

const GALLERY = [
  { title: 'AI 分析', img: '/screenshots/ai-analysis.jpg', big: true },
  { title: '持仓诊断', img: '/screenshots/position-diagnosis.jpg' },
  { title: '风险审核', img: '/screenshots/ai-review.jpg' },
  { title: '提示词', img: '/screenshots/custom-prompt.jpg' },
  { title: '交易记录', img: '/screenshots/ai-log.jpg' },
  { title: '复盘', img: '/screenshots/ai-replay.jpg' },
]

/** Workflow：桌面端紧凑 Sticky Story（左图右文，滚动联动切换）；移动端纵向 Step */
function Workflow() {
  const [active, setActive] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx)
            if (!Number.isNaN(idx)) setActive(idx)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    stepRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* 桌面端 Sticky */}
      <div className="mt-12 hidden gap-10 lg:grid lg:grid-cols-[62%_38%]">
        <div className="relative">
          <div className="sticky top-[92px]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_24px_60px_-40px_rgba(11,23,36,0.35)]">
              {STEPS.map((s, i) => (
                <img
                  key={s.no}
                  src={s.img}
                  alt={s.title}
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ${
                    active === i ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute bottom-3 left-4 rounded-md bg-[#0b1724]/85 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                {STEPS[active].no} · {STEPS[active].name}
              </div>
            </div>
          </div>
        </div>
        <div>
          {STEPS.map((s, i) => (
            <div
              key={s.no}
              data-idx={i}
              ref={(el) => {
                stepRefs.current[i] = el
              }}
              className="flex min-h-[68vh] items-center"
            >
              <div
                className={`border-l-2 py-2 pl-6 transition-all duration-300 ${
                  active === i ? 'border-[#f97316] opacity-100' : 'border-[#e5e7eb] opacity-45'
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className={`font-mono text-sm font-semibold ${active === i ? 'text-[#f97316]' : 'text-[#9ca3af]'}`}>
                    {s.no}
                  </span>
                  <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#9ca3af]">{s.name}</span>
                </div>
                <h3 className="mt-2 text-[22px] font-bold leading-snug">{s.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 移动端纵向 Step */}
      <div className="mt-10 space-y-10 lg:hidden">
        {STEPS.map((s) => (
          <div key={s.no}>
            <div className="shot-zoom overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
              <img src={s.img} alt={s.title} loading="lazy" className="block aspect-[16/9] w-full object-cover object-top" />
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-mono text-sm font-semibold text-[#f97316]">{s.no}</span>
              <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#9ca3af]">{s.name}</span>
            </div>
            <h3 className="mt-1 text-[16px] font-semibold leading-snug">{s.title}</h3>
          </div>
        ))}
      </div>
    </>
  )
}

/** 首页演示剧场：Hover 章节播放 2–3 秒静音 Preview，点击播放完整 Demo */
function Theater() {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<'idle' | 'preview' | 'full'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<number | null>(null)
  const chapter = HOME_CHAPTERS[active]

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const playPreview = (i: number) => {
    if (mode === 'full' && i === active) return
    clearTimer()
    setActive(i)
    setMode('preview')
    timerRef.current = window.setTimeout(() => {
      videoRef.current?.pause()
      setMode('idle')
    }, 2800)
  }

  const playFull = (i: number) => {
    clearTimer()
    setActive(i)
    setMode('full')
  }

  useEffect(() => {
    const el = videoRef.current
    if (!el || mode === 'idle') return
    el.currentTime = 0
    el.play().catch(() => {})
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mode])

  useEffect(() => clearTimer, [])

  return (
    <div className="reveal mt-12 grid items-start gap-6 lg:grid-cols-[75%_25%]">
      {/* 大播放器 */}
      <div className="relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#0b1724] shadow-[0_24px_60px_-32px_rgba(11,23,36,0.45)]">
        <video
          ref={videoRef}
          key={chapter.slug}
          src={chapter.video}
          poster={chapter.poster}
          muted
          playsInline
          preload="metadata"
          controls={mode === 'full'}
          onClick={() => (mode === 'full' ? undefined : playFull(active))}
          onEnded={() => setMode('idle')}
          className={`block aspect-video w-full object-cover ${mode === 'full' ? '' : 'cursor-pointer'}`}
          aria-label={chapter.title}
        />
        {mode !== 'full' && (
          <button
            onClick={() => playFull(active)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
            aria-label={`播放 ${chapter.title}`}
          >
            {mode === 'idle' && (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f97316] shadow-[0_10px_36px_-8px_rgba(249,115,22,0.7)]">
                <svg className="ml-1 h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            )}
            <span className="absolute bottom-4 left-5 text-left">
              <span className="block text-sm font-semibold text-white">
                {chapter.no} · {chapter.title}
              </span>
              <span className="mt-0.5 block text-xs text-white/60">
                {mode === 'preview' ? '静音预览中 · 点击播放完整演示' : '默认静音 · 点击播放'}
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Chapter Rail */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
        {HOME_CHAPTERS.map((c, i) => {
          const isActive = i === active
          return (
            <button
              key={c.slug}
              onMouseEnter={() => playPreview(i)}
              onClick={() => playFull(i)}
              className={`flex min-w-[150px] items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors duration-200 lg:min-w-0 ${
                isActive ? 'bg-white shadow-sm ring-1 ring-[#e5e7eb]' : 'hover:bg-white'
              }`}
            >
              <span className={`font-mono text-[13px] font-semibold ${isActive ? 'text-[#f97316]' : 'text-[#d1d5db]'}`}>
                {c.no}
              </span>
              <span className={`flex-1 whitespace-nowrap text-[14px] lg:whitespace-normal ${isActive ? 'font-semibold' : 'font-medium text-[#374151]'}`}>
                {c.title}
              </span>
              {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f97316]" />}
            </button>
          )
        })}
        <Link
          to="/demo"
          className="link-arrow mt-1 block min-w-[150px] rounded-lg border border-dashed border-[#d1d5db] px-4 py-3 text-center text-[13px] font-medium text-[#6b7280] transition-colors hover:border-[#f97316] hover:text-[#f97316] lg:min-w-0"
        >
          完整演示剧场 <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  )
}

/** 首页 Pricing Preview（紧凑四卡） */
function PricingPreview() {
  const [plans, setPlans] = useState<Plan[]>([])
  useEffect(() => {
    api<{ plans: Plan[] }>('/plans')
      .then((d) => setPlans(d.plans))
      .catch(() => {})
  }, [])

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((p) => (
        <Link
          key={p.code}
          to="/pricing"
          className={`card-light btn-lift group rounded-xl p-5 ${p.code === 'yearly' ? 'border-2 border-[#f97316]' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold">{p.name}</span>
            {p.code === 'yearly' && (
              <span className="rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-bold text-white">推荐</span>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-[24px] font-bold">{fmtPrice(p.price_cents)}</span>
            <span className="text-[12px] text-[#9ca3af]">/ {INTERVAL_LABEL[p.interval]}</span>
          </div>
          <div className="link-arrow mt-3 text-[13px] font-medium text-[#f97316]">
            查看方案 <span className="arrow">→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function Home() {
  useReveal()

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* 01 Hero（含 fixed nav 补偿） */}
      <section className="pb-[64px] pt-[132px] sm:pb-[88px] sm:pt-[172px]">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 sm:px-10 lg:grid-cols-[45%_55%]">
          <div className="reveal">
            <h1 className="font-display text-[38px] font-bold leading-[1.12] sm:text-[54px] lg:text-[58px]">
              牛牛 AI
              <br />
              让你的交易更智能
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#6b7280] sm:text-[17px]">
              连接你的 MT5，让 AI 帮你分析行情、检查风险，并记录每一次交易决策。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/demo"
                className="btn-lift rounded-lg bg-[#f97316] px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-[#ea6a0c]"
              >
                观看产品演示
              </Link>
              <Link
                to="/community#contact"
                className="btn-lift rounded-lg border border-[#e5e7eb] bg-white px-7 py-3.5 text-[15px] font-semibold text-[#111111] hover:border-[#111111]"
              >
                咨询客服
              </Link>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-[#9ca3af]">
              不同 MT5 环境可能存在差异，连接前可联系客服协助确认。
            </p>
          </div>
          <div className="reveal">
            <ProductFrame src="/screenshots/hero.jpg" alt="牛牛AI 真实产品界面：AI 挂单方案与下单说明" />
          </div>
        </div>
      </section>

      {/* 02 Workflow：紧凑 Sticky Story */}
      <Section bordered>
        <SectionHead
          title="从分析到复盘，AI 与你并肩决策"
          desc="AI 提供分析和复核，最终决策由你确认，每步过程可回看、可复盘。"
        />
        <Workflow />
      </Section>

      {/* 03 Demo Theater */}
      <Section bordered>
        <SectionHead title="产品演示剧场" desc="从连接 MT5，到完成一次完整的 AI 交易分析。" />
        <Theater />
      </Section>

      {/* 04 核心能力 */}
      <Section bordered>
        <SectionHead title="AI 不替你交易，而是帮助你更清晰地决策" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="reveal">
              <div className="shot-zoom overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                <img src={c.img} alt={c.title} loading="lazy" className="block aspect-[16/9] w-full object-cover object-top" />
              </div>
              <h3 className="mt-4 text-[17px] font-bold">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6b7280]">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 05 真实产品界面画廊 */}
      <Section bordered>
        <SectionHead title="真实产品界面" desc="你看到的每一张图，都来自牛牛 AI 的真实操作界面。" />
        <div className="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((g) => (
            <figure key={g.title} className={g.big ? 'sm:col-span-2 lg:row-span-2' : ''}>
              <div className="shot-zoom overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                <img
                  src={g.img}
                  alt={`牛牛AI ${g.title}界面`}
                  loading="lazy"
                  className={`block w-full object-cover object-top ${g.big ? 'aspect-[16/9] lg:aspect-auto lg:h-full' : 'aspect-[16/9]'}`}
                />
              </div>
              <figcaption className="mt-2.5 text-[13px] font-medium text-[#6b7280]">{g.title}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* 06 Pricing Preview */}
      <Section variant="compact" tinted bordered>
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <SectionHead title="价格方案" desc="四个使用周期，按需选择。" className="!max-w-none" />
          <Link to="/pricing" className="link-arrow text-[14px] font-semibold text-[#f97316]">
            查看完整定价 <span className="arrow">→</span>
          </Link>
        </div>
        <PricingPreview />
      </Section>

      {/* 07 橙色 CTA */}
      <section className="bg-[#f97316] py-[64px] text-white sm:py-[80px]">
        <div className="mx-auto max-w-[1280px] px-6 text-center sm:px-10">
          <h2 className="font-display text-[30px] font-bold sm:text-[38px]">现在，看看牛牛 AI 如何工作</h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="btn-lift rounded-lg bg-[#0b1724] px-8 py-4 text-[15px] font-semibold text-white hover:bg-[#16283d]"
            >
              观看完整演示
            </Link>
            <Link
              to="/community#contact"
              className="btn-lift rounded-lg border border-white/50 px-8 py-4 text-[15px] font-semibold text-white hover:bg-white/10"
            >
              咨询客服
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
