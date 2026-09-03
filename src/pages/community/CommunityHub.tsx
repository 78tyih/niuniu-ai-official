import { useState } from 'react'
import { Link } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import { useReveal } from '../../hooks/useReveal'
import { CATEGORIES, ALL_ARTICLES, CATEGORY_LABEL, type ContentCategory } from '../../content'

const QUICK_START = [
  {
    num: '01',
    title: '第一次使用牛牛 AI',
    desc: '从安装到第一次 AI 分析。',
    to: '/community/tutorials/connect-mt5',
  },
  {
    num: '02',
    title: '连接 MT5',
    desc: '完成账户与行情环境连接。',
    to: '/community/tutorials/connect-mt5',
  },
  {
    num: '03',
    title: '第一次 AI 分析',
    desc: '了解 AI-1 输出的主要信息。',
    to: '/community/tutorials/ai-analysis',
  },
  {
    num: '04',
    title: '设置风险规则',
    desc: '让交易在明确边界中运行。',
    to: '/community/risk/risk-control-setup',
  },
]

const TOPICS = [
  { label: 'AI 分析', to: '/community/tutorials' },
  { label: '风险审核', to: '/community/risk' },
  { label: 'MT5', to: '/community/mt5' },
  { label: 'Prompt', to: '/community/prompts' },
  { label: '持仓诊断', to: '/community/tutorials' },
  { label: '交易复盘', to: '/community/tutorials' },
  { label: '故障排查', to: '/community/troubleshooting' },
  { label: 'FAQ', to: '/community/faq' },
]

export default function CommunityHub() {
  useReveal()
  const [activeCat, setActiveCat] = useState<string | null>(null)

  const sorted = [...ALL_ARTICLES].sort((a, b) => b.date.localeCompare(a.date))
  const featured = sorted[0]
  const secondary = sorted.slice(1, 4)
  const latest = sorted.slice(4, 10)
  const updates = sorted.filter((a) => a.category === 'updates').slice(0, 5)

  const filtered = activeCat
    ? sorted.filter((a) => a.category === activeCat)
    : sorted
  const displayLatest = activeCat ? filtered.slice(0, 8) : latest

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* Community Header — 紧凑，160–240px */}
      <section className="pb-6 pt-[104px] sm:pt-[120px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="text-[11px] font-semibold tracking-[0.08em] text-[#9ca3af]">
            NIUNIU AI COMMUNITY
          </div>
          <h1 className="mt-2 font-display text-[28px] font-bold sm:text-[34px]">
            教程、产品更新与 AI 交易工作流
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-[#6b7280]">
            从第一次连接 MT5，到建立属于自己的 AI 交易流程。
          </p>
          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="搜索功能、教程或问题…"
              className="w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm outline-none placeholder:text-[#d1d5db] focus:border-[#f97316]"
            />
          </div>
        </div>
      </section>

      {/* 分类导航 — 紧凑横向 */}
      <section className="border-b border-[#eceae6] pb-0">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <nav className="flex gap-1 overflow-x-auto pb-3 text-sm scrollbar-none">
            <button
              onClick={() => setActiveCat(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                activeCat === null
                  ? 'bg-[#111111] text-white'
                  : 'text-[#6b7280] hover:bg-[#f3f4f6]'
              }`}
            >
              全部
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  activeCat === cat.id
                    ? 'bg-[#111111] text-white'
                    : 'text-[#6b7280] hover:bg-[#f3f4f6]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Featured Content — 60/40 编辑式布局 */}
      {!activeCat && featured && (
        <section className="pb-10 pt-8 sm:pb-14 sm:pt-10">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {/* Left: Feature */}
              <Link
                to={`/community/${featured.category}/${featured.id}`}
                className="group relative block overflow-hidden rounded-2xl bg-[#0b1724]"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-[#1a2d3d] to-[#0b1724]" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                      {CATEGORY_LABEL[featured.category as ContentCategory]}
                    </span>
                    <span className="text-[11px] text-white/50">{featured.readingTime}</span>
                  </div>
                  <h2 className="mt-3 text-[20px] font-bold leading-tight text-white sm:text-[24px]">
                    {featured.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-white/70">
                    {featured.description}
                  </p>
                  <span className="link-arrow mt-3 inline-block text-[13px] font-medium text-[#f97316]">
                    阅读文章 <span className="arrow">→</span>
                  </span>
                </div>
              </Link>

              {/* Right: Secondary */}
              <div className="flex flex-col gap-4">
                {secondary.map((article) => (
                  <Link
                    key={article.id}
                    to={`/community/${article.category}/${article.id}`}
                    className="group flex flex-col rounded-xl border border-[#eceae6] bg-white p-5 transition-colors hover:border-[#d1d5db]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#111111]/5 px-2 py-0.5 text-[11px] font-semibold text-[#6b7280]">
                        {CATEGORY_LABEL[article.category as ContentCategory]}
                      </span>
                      <span className="text-[11px] text-[#9ca3af]">{article.readingTime}</span>
                    </div>
                    <h3 className="mt-2 text-[15px] font-bold leading-snug group-hover:text-[#f97316] transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#6b7280]">
                      {article.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Start — 编辑式 Row */}
      {!activeCat && (
        <section className="border-t border-[#eceae6] py-10 sm:py-14">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
            <h2 className="text-[18px] font-bold sm:text-[20px]">从这里开始</h2>
            <div className="mt-6 divide-y divide-[#eceae6]">
              {QUICK_START.map((item) => (
                <Link
                  key={item.num}
                  to={item.to}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-[#f5f3ef]/50 -mx-4 px-4 rounded-lg"
                >
                  <span className="font-display text-[22px] font-bold text-[#d1d5db] group-hover:text-[#f97316] transition-colors">
                    {item.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold group-hover:text-[#f97316] transition-colors">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-[13px] text-[#6b7280]">{item.desc}</div>
                  </div>
                  <span className="text-[14px] text-[#d1d5db] group-hover:text-[#f97316] transition-colors">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="text-[18px] font-bold sm:text-[20px]">
            {activeCat ? (CATEGORY_LABEL[activeCat as ContentCategory] || '最新内容') : '最新教程'}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {displayLatest.map((article) => {
              const cat = CATEGORIES.find((c) => c.id === article.category)
              return (
                <Link
                  key={article.id}
                  to={`/community/${article.category}/${article.id}`}
                  className="group flex flex-col rounded-xl border border-[#eceae6] bg-white overflow-hidden transition-colors hover:border-[#d1d5db]"
                >
                  <div className="aspect-[3/2] bg-gradient-to-br from-[#f5f3ef] to-[#eceae6]" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-[#111111]/5 px-2 py-0.5 text-[11px] font-semibold text-[#6b7280]">
                        {cat?.label}
                      </span>
                      <span className="text-[11px] text-[#9ca3af]">{article.readingTime}</span>
                      <span className="font-mono text-[11px] text-[#9ca3af]">{article.date}</span>
                    </div>
                    <h3 className="mt-2 text-[15px] font-bold leading-snug group-hover:text-[#f97316] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6b7280] line-clamp-2">
                      {article.description}
                    </p>
                    <span className="link-arrow mt-auto pt-3 inline-block text-[12px] font-medium text-[#f97316]">
                      阅读 <span className="arrow">→</span>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          {displayLatest.length === 0 && (
            <p className="py-8 text-center text-sm text-[#9ca3af]">暂无内容，敬请期待。</p>
          )}
        </div>
      </section>

      {/* Product Updates — Release Feed */}
      {!activeCat && updates.length > 0 && (
        <section className="border-t border-[#eceae6] py-10 sm:py-14">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
            <h2 className="text-[18px] font-bold sm:text-[20px]">产品更新</h2>
            <div className="mt-6 divide-y divide-[#eceae6]">
              {updates.map((u) => (
                <Link
                  key={u.id}
                  to={`/community/updates/${u.id}`}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-[#f5f3ef]/50 -mx-4 px-4 rounded-lg"
                >
                  <span className="shrink-0 rounded-md bg-[#f5f3ef] px-2.5 py-1 font-mono text-[12px] font-bold text-[#6b7280]">
                    {u.date}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold group-hover:text-[#f97316] transition-colors">
                      {u.title}
                    </div>
                    <p className="mt-0.5 text-[13px] text-[#6b7280] line-clamp-1">{u.description}</p>
                  </div>
                  <span className="text-[13px] text-[#9ca3af] group-hover:text-[#f97316] transition-colors">
                    详情 →
                  </span>
                </Link>
              ))}
            </div>
            <Link
              to="/community/updates"
              className="link-arrow mt-4 inline-block text-[13px] font-medium text-[#f97316]"
            >
              查看全部更新 <span className="arrow">→</span>
            </Link>
          </div>
        </section>
      )}

      {/* Topics — 文字 Grid */}
      {!activeCat && (
        <section className="border-t border-[#eceae6] py-10 sm:py-14">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
            <h2 className="text-[18px] font-bold sm:text-[20px]">按主题学习</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TOPICS.map((t) => (
                <Link
                  key={t.label}
                  to={t.to}
                  className="rounded-xl border border-[#eceae6] bg-white px-5 py-4 text-[14px] font-bold transition-colors hover:border-[#d1d5db] hover:text-[#f97316]"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Support Strip — 放在文章下方 */}
      {!activeCat && (
        <section className="border-t border-[#eceae6] bg-white py-10 sm:py-14">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10 text-center">
            <h2 className="text-[18px] font-bold sm:text-[20px]">需要帮助？</h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/community#contact"
                className="btn-lift rounded-lg bg-[#f97316] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ea6a0c]"
              >
                联系客服
              </Link>
              <Link
                to="/community#groups"
                className="btn-lift rounded-lg border border-[#e5e7eb] bg-white px-6 py-3 text-sm font-semibold text-[#111111] hover:border-[#111111]"
              >
                加入使用社群
              </Link>
              <Link
                to="/community#feedback"
                className="btn-lift rounded-lg border border-[#e5e7eb] bg-white px-6 py-3 text-sm font-semibold text-[#111111] hover:border-[#111111]"
              >
                提交反馈
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}