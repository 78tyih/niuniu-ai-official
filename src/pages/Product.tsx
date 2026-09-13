import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import Section from '../components/Section'
import { useReveal } from '../hooks/useReveal'

const FEATURES = [
  {
    no: '01',
    title: 'AI 行情分析',
    desc: 'AI 结合当前市场数据、指标和你的提示词，生成结构清晰的分析结论与关键位置。',
    points: ['多周期行情与指标整理', '关键位置与条件标注', '结论可追溯到分析依据'],
    img: '/screenshots/ai-analysis.jpg',
  },
  {
    no: '02',
    title: '风险审核',
    desc: '在交易行动之前，按你的风险规则对当前条件进行一次独立检查。',
    points: ['按你的规则独立复核', '风险项逐条列出', '不通过时给出修改建议'],
    img: '/screenshots/ai-review.jpg',
  },
  {
    no: '03',
    title: '持仓诊断',
    desc: '真实订单与持仓状态集中呈现，当前风险一目了然。',
    points: ['持仓风险集中呈现', '异常状态高亮提醒', '与 MT5 实时同步'],
    img: '/screenshots/position-diagnosis.jpg',
  },
  {
    no: '04',
    title: '提示词系统',
    desc: '官方提供基础提示词；你可以修改、自定义、用 AI 生成，并保存为自己的提示词。',
    points: ['官方基础模板开箱即用', '支持自定义与 AI 辅助生成', '按品种保存多套方案'],
    img: '/screenshots/custom-prompt.jpg',
  },
  {
    no: '05',
    title: '交易复盘',
    desc: '历史订单与分析记录保存在同一条时间线，方便后续复盘。',
    points: ['订单与分析同一时间线', '每次决策过程可回看', '支持按时间段检索'],
    img: '/screenshots/ai-replay.jpg',
  },
]

/** MT5 原生能力：全部取自 MT5 真实界面，说明牛牛 AI 建立在 MT5 之上 */
const MT5_POINTS = [
  {
    title: '图表与技术指标',
    desc: 'MT5 的 K 线、周期与指标原样保留，牛牛 AI 读取后给出分析结论。',
    img: '/mt5/mt5-indicators-on-chart.png',
  },
  {
    title: '订单与执行',
    desc: '方案以挂单方式交给 MT5 执行，价位由 MT5 校验，不绕过你的终端。',
    img: '/mt5/mt5-order-operations.png',
  },
  {
    title: '持仓与账户',
    desc: '行情、持仓与账户状态从 MT5 一键同步，AI 分析的是你的真实账户。',
    img: '/mt5/mt5-trade-window.png',
  },
]

/** 左图滑动 + 右侧说明（滚动联动，类似富途牛牛的功能展示板块） */
function Showcase() {
  const [active, setActive] = useState(0)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

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
    itemRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const scrollTo = (i: number) => {
    itemRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <>
      {/* 桌面端：左 sticky 图 + 右侧说明 */}
      <div className="mt-12 hidden gap-12 lg:grid lg:grid-cols-[58%_42%]">
        <div className="relative">
          <div className="sticky top-[92px]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_24px_60px_-40px_rgba(11,23,36,0.35)]">
              {FEATURES.map((f, i) => (
                <img
                  key={f.no}
                  src={f.img}
                  alt={`牛牛AI ${f.title}界面`}
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ${
                    active === i ? 'translate-y-0 opacity-100' : i < active ? '-translate-y-3 opacity-0' : 'translate-y-3 opacity-0'
                  }`}
                />
              ))}
              <div className="absolute bottom-3 left-4 rounded-md bg-[#0b1724]/85 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                {FEATURES[active].no} · {FEATURES[active].title}
              </div>
            </div>
            {/* 进度指示 */}
            <div className="mt-4 flex gap-1.5">
              {FEATURES.map((f, i) => (
                <button
                  key={f.no}
                  onClick={() => scrollTo(i)}
                  aria-label={f.title}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${active === i ? 'bg-[#f97316]' : 'bg-[#e5e7eb]'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          {FEATURES.map((f, i) => (
            <div
              key={f.no}
              data-idx={i}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              className="flex min-h-[62vh] items-center"
            >
              <div
                className={`border-l-2 py-2 pl-6 transition-all duration-300 ${
                  active === i ? 'border-[#f97316] opacity-100' : 'border-[#e5e7eb] opacity-40'
                }`}
              >
                <span className={`font-mono text-sm font-semibold ${active === i ? 'text-[#f97316]' : 'text-[#9ca3af]'}`}>
                  {f.no}
                </span>
                <h3 className="mt-2 text-[24px] font-bold leading-snug">{f.title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#6b7280]">{f.desc}</p>
                <ul className="mt-4 space-y-2">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-[13px] text-[#4b5563]">
                      <svg className="h-3.5 w-3.5 shrink-0 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 移动端：纵向卡片 */}
      <div className="mt-10 space-y-12 lg:hidden">
        {FEATURES.map((f) => (
          <div key={f.no}>
            <div className="shot-zoom overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
              <img src={f.img} alt={`牛牛AI ${f.title}界面`} loading="lazy" className="block aspect-[16/10] w-full object-cover object-top" />
            </div>
            <div className="mt-4">
              <span className="font-mono text-sm font-semibold text-[#f97316]">{f.no}</span>
              <h3 className="mt-1.5 text-[19px] font-bold">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">{f.desc}</p>
              <ul className="mt-3 space-y-1.5">
                {f.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-[13px] text-[#4b5563]">
                    <svg className="h-3.5 w-3.5 shrink-0 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function Product() {
  useReveal()
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* Product Hero */}
      <section className="pb-[56px] pt-[132px] sm:pb-[72px] sm:pt-[164px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal mx-auto max-w-3xl text-center">
            <h1 className="font-display text-[34px] font-bold leading-[1.15] sm:text-[46px]">
              让 AI 进入你的交易工作流
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#6b7280] sm:text-[17px]">
              连接 MT5，将行情分析、风险审核和交易复盘放到同一个工作流中。
            </p>
            <div className="mt-8">
              <Link
                to="/demo"
                className="btn-lift inline-block rounded-lg bg-[#f97316] px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-[#ea6a0c]"
              >
                观看产品演示
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 基于 MT5：先讲清它跑在什么之上 */}
      <Section bordered>
        <div className="reveal mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold tracking-[0.08em] text-[#9ca3af]">
            BUILT FOR MT5
          </div>
          <h2 className="mt-2 font-display text-[28px] font-bold leading-tight sm:text-[36px]">
            它跑在你正在用的 MT5 上
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[#6b7280]">
            牛牛 AI 不替换 MT5，而是接入你现有的 MT5 账户——图表、指标、订单与持仓都来自你的 MT5。
          </p>
        </div>

        {/* MT5 -> 牛牛 AI */}
        <div className="reveal mt-10 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <figure>
            <img
              src="/mt5/mt5-charts-candles.png"
              alt="MT5 的 K 线图表界面"
              loading="lazy"
              className="w-full rounded-xl border border-[#e5e7eb] bg-white shadow-[0_18px_44px_-32px_rgba(11,23,36,0.35)]"
            />
            <figcaption className="mt-2 text-center text-[13px] text-[#6b7280]">
              你的 MT5 · K 线与技术指标
            </figcaption>
          </figure>

          <div className="hidden justify-center lg:flex">
            <span className="whitespace-nowrap text-[13px] font-medium text-[#f97316]">
              接入 →
            </span>
          </div>

          <figure>
            <img
              src="/screenshots/ai-analysis.jpg"
              alt="牛牛 AI 的分析与审核界面"
              loading="lazy"
              className="w-full rounded-xl border border-[#e5e7eb] bg-white shadow-[0_18px_44px_-32px_rgba(11,23,36,0.35)]"
            />
            <figcaption className="mt-2 text-center text-[13px] text-[#6b7280]">
              牛牛 AI · 分析与审核
            </figcaption>
          </figure>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {MT5_POINTS.map((p) => (
            <div
              key={p.title}
              className="reveal overflow-hidden rounded-xl border border-[#eceae6] bg-white"
            >
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                className="aspect-[16/9] w-full border-b border-[#eceae6] object-cover object-top"
              />
              <div className="p-4">
                <div className="font-display text-[15px] font-bold">{p.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6b7280]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 功能展示：左图滑动 + 右侧说明 */}
      <Section bordered>
        <div className="reveal max-w-2xl">
          <h2 className="font-display text-[28px] font-bold leading-tight sm:text-[36px]">五个核心功能，一条工作流</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6b7280]">向下滚动，逐个了解每一步如何在真实界面中完成。</p>
        </div>
        <Showcase />
      </Section>

      {/* 底部 CTA */}
      <Section variant="compact" tinted bordered className="text-center">
        <div className="reveal">
          <h2 className="font-display text-[28px] font-bold sm:text-[34px]">体验牛牛 AI</h2>
          <p className="mt-3 text-[15px] text-[#6b7280]">先看演示，再选择适合你的方案。</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="btn-lift rounded-lg bg-[#f97316] px-8 py-4 text-[15px] font-semibold text-white hover:bg-[#ea6a0c]"
            >
              观看演示
            </Link>
            <Link
              to="/pricing"
              className="btn-lift rounded-lg border border-[#e5e7eb] bg-white px-8 py-4 text-[15px] font-semibold hover:border-[#111111]"
            >
              查看价格
            </Link>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
