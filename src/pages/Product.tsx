import { Link } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import ProductFrame from '../components/ProductFrame'
import Section from '../components/Section'
import { useReveal } from '../hooks/useReveal'

const SECTIONS = [
  {
    no: '01',
    title: 'AI 行情分析',
    desc: 'AI 结合当前市场数据、指标和你的提示词，生成结构清晰的分析结论与关键位置。',
    img: '/screenshots/ai-analysis.jpg',
  },
  {
    no: '02',
    title: '风险审核',
    desc: '在交易行动之前，按你的风险规则对当前条件进行一次独立检查。',
    img: '/screenshots/ai-review.jpg',
  },
  {
    no: '03',
    title: '持仓诊断',
    desc: '真实订单与持仓状态集中呈现，当前风险一目了然。',
    img: '/screenshots/position-diagnosis.jpg',
  },
  {
    no: '04',
    title: '提示词系统',
    desc: '官方提供基础提示词；你可以修改、自定义、用 AI 生成，并保存为自己的提示词。',
    img: '/screenshots/custom-prompt.jpg',
  },
  {
    no: '05',
    title: '交易复盘',
    desc: '历史订单与分析记录保存在同一条时间线，方便后续复盘。',
    img: '/screenshots/ai-replay.jpg',
  },
]

export default function Product() {
  useReveal()
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* Product Hero（含 fixed nav 补偿） */}
      <section className="pb-[64px] pt-[132px] sm:pb-[88px] sm:pt-[164px]">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 sm:px-10 lg:grid-cols-[45%_55%]">
          <div className="reveal">
            <h1 className="font-display text-[34px] font-bold leading-[1.15] sm:text-[46px]">
              让 AI 进入你的交易工作流
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#6b7280] sm:text-[17px]">
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
          <div className="reveal">
            <ProductFrame src="/screenshots/hero.jpg" alt="牛牛AI 产品界面" />
          </div>
        </div>
      </section>

      {/* 5 个功能段：左右交替（统一 Section 间距） */}
      {SECTIONS.map((s, i) => (
        <Section key={s.no} variant="compact" bordered>
          <div
            className={`grid items-center gap-10 lg:grid-cols-2 ${
              i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
            }`}
          >
            <div className="reveal">
              <span className="font-mono text-sm font-semibold text-[#f97316]">{s.no}</span>
              <h2 className="font-display mt-2.5 text-[26px] font-bold sm:text-[32px]">{s.title}</h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#6b7280]">{s.desc}</p>
            </div>
            <div className="reveal">
              <ProductFrame src={s.img} alt={`牛牛AI ${s.title}界面`} />
            </div>
          </div>
        </Section>
      ))}

      {/* 底部 CTA */}
      <Section className="text-center">
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
