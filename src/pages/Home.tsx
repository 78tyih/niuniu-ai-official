import { Link } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import ProductFrame from '../components/ProductFrame'
import VideoPlayer from '../components/VideoPlayer'
import { HOME_CHAPTERS, CHAPTERS } from '../lib/chapters'
import { useReveal } from '../hooks/useReveal'

const STEPS = [
  { no: '01', name: '分析', title: 'AI 帮你整理行情与市场条件', img: '/screenshots/ai-analysis.jpg' },
  { no: '02', name: '审核', title: '行动之前，重新检查交易风险', img: '/screenshots/ai-review.jpg' },
  { no: '03', name: '确认', title: 'AI 提供分析，最终决定由你掌控', img: '/screenshots/ai-assistant.jpg' },
  { no: '04', name: '复盘', title: '保存分析过程，每一次交易都可回看', img: '/screenshots/ai-replay.jpg' },
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

export default function Home() {
  useReveal()
  const theater = HOME_CHAPTERS[0]

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* 01 Hero */}
      <section className="pt-32 pb-24 sm:pt-40 sm:pb-28">
        <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[45%_55%]">
          <div className="reveal">
            <h1 className="font-display text-[40px] leading-[1.12] font-bold sm:text-[56px] lg:text-[60px]">
              牛牛 AI
              <br />
              让你的交易更智能
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#6b7280] sm:text-[17px]">
              连接你的 MT5，让 AI 帮你分析行情、检查风险，并记录每一次交易决策。
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/demo"
                className="rounded-lg bg-[#f97316] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#ea6a0c]"
              >
                观看产品演示
              </Link>
              <Link
                to="/community#contact"
                className="rounded-lg border border-[#e5e7eb] bg-white px-7 py-3.5 text-[15px] font-semibold text-[#111111] transition-colors hover:border-[#111111]"
              >
                咨询客服
              </Link>
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-[#9ca3af]">
              不同 MT5 环境可能存在差异，连接前可联系客服协助确认。
            </p>
          </div>
          <div className="reveal">
            <ProductFrame src="/screenshots/hero.jpg" alt="牛牛AI 真实产品界面：AI 挂单方案与下单说明" />
          </div>
        </div>
      </section>

      {/* 02 Workflow */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal max-w-2xl">
            <h2 className="font-display text-[32px] font-bold sm:text-[38px]">从分析到复盘，AI 与你并肩决策</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6b7280]">
              AI 提供分析和复核，最终决策由你确认，每步过程可回看、可复盘。
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.no} className="reveal group">
                <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                  <img src={s.img} alt={s.title} loading="lazy" className="block aspect-[16/9] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-mono text-sm font-semibold text-[#f97316]">{s.no}</span>
                  <span className="text-[13px] font-medium tracking-wide text-[#9ca3af]">{s.name}</span>
                </div>
                <h3 className="mt-1.5 text-[15px] font-semibold leading-snug">{s.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 产品演示剧场 */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal max-w-2xl">
            <h2 className="font-display text-[32px] font-bold sm:text-[38px]">产品演示剧场</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6b7280]">
              从连接 MT5，到完成一次完整的 AI 交易分析。
            </p>
          </div>
          <div className="reveal mt-14 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
            <VideoPlayer src={theater.video} poster={theater.poster} title={`${theater.no} · ${theater.title}`} />
            <div className="space-y-1.5">
              {HOME_CHAPTERS.map((c) => (
                <Link
                  key={c.no}
                  to={`/demo#${c.slug}`}
                  className="group flex items-center gap-4 rounded-lg px-4 py-3.5 transition-colors hover:bg-white"
                >
                  <span className="font-mono text-sm font-semibold text-[#f97316]">{c.no}</span>
                  <span className="flex-1 text-[15px] font-medium">{c.title}</span>
                  <span className="text-[#d1d5db] transition-all group-hover:translate-x-0.5 group-hover:text-[#f97316]">→</span>
                </Link>
              ))}
              <Link
                to="/demo"
                className="mt-2 block rounded-lg border border-dashed border-[#d1d5db] px-4 py-3.5 text-center text-sm font-medium text-[#6b7280] transition-colors hover:border-[#f97316] hover:text-[#f97316]"
              >
                查看全部 {CHAPTERS.length} 个章节 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 04 核心能力 */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal max-w-2xl">
            <h2 className="font-display text-[32px] font-bold sm:text-[38px]">
              AI 不替你交易，而是帮助你更清晰地决策
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="reveal group">
                <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                  <img src={c.img} alt={c.title} loading="lazy" className="block aspect-[16/9] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 真实产品界面 */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal max-w-2xl">
            <h2 className="font-display text-[32px] font-bold sm:text-[38px]">真实产品界面</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6b7280]">
              你看到的每一张图，都来自牛牛 AI 的真实操作界面。
            </p>
          </div>
          <div className="reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((g) => (
              <figure key={g.title} className={g.big ? 'sm:col-span-2 lg:row-span-2' : ''}>
                <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                  <img
                    src={g.img}
                    alt={`牛牛AI ${g.title}界面`}
                    loading="lazy"
                    className={`block w-full object-cover object-top ${g.big ? 'aspect-[16/9] lg:aspect-auto lg:h-full' : 'aspect-[16/9]'}`}
                  />
                </div>
                <figcaption className="mt-3 text-[13px] font-medium text-[#6b7280]">{g.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 06 橙色 CTA */}
      <section className="bg-[#f97316] py-24 text-white sm:py-28">
        <div className="mx-auto max-w-[1280px] px-6 text-center sm:px-10">
          <h2 className="font-display text-[32px] font-bold sm:text-[40px]">现在，看看牛牛 AI 如何工作</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="rounded-lg bg-[#0b1724] px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#16283d]"
            >
              观看完整演示
            </Link>
            <Link
              to="/community#contact"
              className="rounded-lg border border-white/50 px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
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
