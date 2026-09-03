import { Link, useParams } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import CommunitySidebar from './CommunitySidebar'
import { useReveal } from '../../hooks/useReveal'
import { getArticlesByCategory, type ContentCategory } from '../../content'

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

      {/* 分类头部 */}
      <section className="relative overflow-hidden pb-8 pt-[104px] sm:pt-[128px]">
        <div className="absolute inset-0">
          <img
            src={cat.hero}
            alt=""
            className="h-full w-full object-cover opacity-[0.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fafaf8]" />
        </div>
        <div className="relative mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="flex items-center gap-2 text-[13px] text-[#9ca3af]">
            <Link to="/community" className="hover:text-[#111111]">社区</Link>
            <span>/</span>
            <span className="text-[#111111]">{cat.label}</span>
          </div>
          <h1 className="mt-3 font-display text-[28px] font-bold sm:text-[34px]">{cat.label}</h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">{cat.desc}</p>
        </div>
      </section>

      <section className="pb-[64px] sm:pb-[80px]">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-6 sm:px-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/community/${article.category}/${article.id}`}
                className="card-light btn-lift group block rounded-xl px-5 py-4"
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
                <h2 className="mt-2 text-[16px] font-bold group-hover:text-[#f97316] transition-colors">{article.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">{article.description}</p>
              </Link>
            ))}
            {articles.length === 0 && (
              <p className="py-8 text-center text-sm text-[#9ca3af]">
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