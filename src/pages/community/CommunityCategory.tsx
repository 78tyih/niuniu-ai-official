import { Link, useParams } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import CommunitySidebar from './CommunitySidebar'
import { useReveal } from '../../hooks/useReveal'
import { getArticlesByCategory, CATEGORIES, type ContentCategory } from '../../content'

const CATEGORY_DATA: Record<string, { label: string; desc: string; hero: string }> = {
  updates: { label: '产品更新', desc: '产品动态与版本更新记录', hero: '/screenshots/ai-analysis.jpg' },
  tutorials: { label: '教程指南', desc: '基于真实产品功能的逐步操作指南', hero: '/screenshots/ai-layout.jpg' },
  workflows: { label: '交易工作流', desc: '从分析到复盘的完整交易流程', hero: '/screenshots/ai-assistant.jpg' },
  prompts: { label: '提示词模板', desc: '可直接复制使用的提示词模板', hero: '/screenshots/custom-prompt.jpg' },
  risk: { label: '风险管理', desc: '风控设置与交易风险管理', hero: '/screenshots/ai-review.jpg' },
  mt5: { label: 'MT5 连接', desc: 'MT5 安装、连接与实例管理', hero: '/screenshots/connect-mt5.jpg' },
  troubleshooting: { label: '故障排查', desc: '常见问题与解决方案', hero: '/screenshots/ai-log.jpg' },
  faq: { label: '常见问题', desc: '高频问题快速解答', hero: '/screenshots/hero.jpg' },
}

export default function CommunityCategory() {
  useReveal()
  const { category } = useParams<{ category: string }>()
  const cat = CATEGORY_DATA[category || '']
  const articles = getArticlesByCategory((category as ContentCategory) || 'faq')
  const catMeta = CATEGORIES.find((c) => c.id === category)

  if (!cat) {
    return (
      <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
        <Nav />
        <section className="pt-[104px] sm:pt-[128px]">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10 text-center">
            <h1 className="text-[24px] font-bold">页面不存在</h1>
            <p className="mt-2 text-[#6b7280]">该分类尚未创建。</p>
            <Link to="/community" className="mt-4 inline-block text-[#f97316] font-medium">返回社区首页 →</Link>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* 分类头部 — 紧凑 */}
      <section className="pb-6 pt-[104px] sm:pt-[120px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="flex items-center gap-2 text-[13px] text-[#9ca3af]">
            <Link to="/community" className="hover:text-[#111111]">社区</Link>
            <span>/</span>
            <span className="text-[#111111]">{cat.label}</span>
          </div>
          <h1 className="mt-3 font-display text-[28px] font-bold sm:text-[34px]">{cat.label}</h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">{cat.desc}</p>
          {catMeta && (
            <div className="mt-1 text-[13px] text-[#9ca3af]">
              {articles.length} 篇文章
            </div>
          )}
        </div>
      </section>

      {/* 文章列表 */}
      <section className="pb-[64px] sm:pb-[80px]">
        <div className="mx-auto grid max-w-[1280px] items-start gap-8 px-6 sm:px-10 lg:grid-cols-[1fr_320px]">
          <div>
            {/* 分类导航 — 目录切换 */}
            <nav className="mb-6 flex flex-wrap gap-2">
              <Link
                to="/community"
                className="rounded-full border border-[#eceae6] px-3.5 py-1.5 text-[12px] font-medium text-[#6b7280] transition-colors hover:border-[#d1d5db]"
              >
                全部
              </Link>
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to={`/community/${c.id}`}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                    c.id === category
                      ? 'bg-[#111111] text-white'
                      : 'border border-[#eceae6] text-[#6b7280] hover:border-[#d1d5db]'
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </nav>

            {/* 文章 Grid */}
            {articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/community/${article.category}/${article.id}`}
                    className="group block rounded-xl border border-[#eceae6] bg-white p-5 transition-colors hover:border-[#d1d5db]"
                  >
                    <div className="flex items-center gap-3">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-[#111111]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#6b7280]">
                          {tag}
                        </span>
                      ))}
                      <span className="font-mono text-[12px] text-[#9ca3af]">{article.date}</span>
                      <span className="text-[11px] text-[#9ca3af]">{article.readingTime}</span>
                    </div>
                    <h2 className="mt-2 text-[16px] font-bold group-hover:text-[#f97316] transition-colors">
                      {article.title}
                    </h2>
                    <p className="mt-1 text-[14px] leading-relaxed text-[#6b7280] line-clamp-2">
                      {article.description}
                    </p>
                    <span className="link-arrow mt-2 inline-block text-[12px] font-medium text-[#f97316]">
                      阅读 <span className="arrow">→</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-[#9ca3af]">
                暂无内容，敬请期待。
              </p>
            )}
          </div>

          <CommunitySidebar />
        </div>
      </section>

      <Footer />
    </div>
  )
}