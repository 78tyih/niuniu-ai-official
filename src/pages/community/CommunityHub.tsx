import { Link } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import CommunitySidebar from './CommunitySidebar'
import { useReveal } from '../../hooks/useReveal'
import { CATEGORIES, ALL_ARTICLES } from '../../content'

export default function CommunityHub() {
  useReveal()
  const recent = ALL_ARTICLES.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      <section className="pb-8 pt-[104px] sm:pt-[128px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h1 className="font-display text-[28px] font-bold sm:text-[34px]">牛牛 AI 社区</h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            牛牛 AI 学习、产品更新和交易 AI 工作流知识中心。
          </p>
        </div>
      </section>

      <section className="pb-[64px] sm:pb-[80px]">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-6 sm:px-10 lg:grid-cols-[1fr_320px]">
          <div>
            {/* 内容分类导航 */}
            <div className="grid gap-3 sm:grid-cols-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/community/${cat.id}`}
                  className="card-light btn-lift group rounded-xl px-5 py-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold">{cat.label}</span>
                    <span className="text-[11px] text-[#9ca3af]">
                      ({ALL_ARTICLES.filter((a) => a.category === cat.id).length})
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#6b7280]">{cat.desc}</p>
                  <span className="link-arrow mt-2 inline-block text-[12px] font-medium text-[#f97316]">
                    浏览 <span className="arrow">→</span>
                  </span>
                </Link>
              ))}
            </div>

            {/* 最新内容 */}
            <h2 className="mb-4 mt-10 text-[18px] font-bold">最新内容</h2>
            <div className="space-y-3">
              {recent.map((article) => {
                const cat = CATEGORIES.find((c) => c.id === article.category)
                return (
                  <Link
                    key={article.id}
                    to={`/community/${article.category}/${article.id}`}
                    className="card-light btn-lift group block rounded-xl px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#111111]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#6b7280]">
                        {cat?.label}
                      </span>
                      <span className="font-mono text-[12px] text-[#9ca3af]">{article.date}</span>
                      <span className="text-[11px] text-[#9ca3af]">{article.readingTime}</span>
                    </div>
                    <h3 className="mt-2 text-[15px] font-bold group-hover:text-[#f97316] transition-colors">{article.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6b7280]">{article.description}</p>
                  </Link>
                )
              })}
            </div>
          </div>

          <CommunitySidebar />
        </div>
      </section>

      <Footer />
    </div>
  )
}