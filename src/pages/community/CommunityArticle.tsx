import { Link, useParams } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import CommunitySidebar from './CommunitySidebar'
import { useReveal } from '../../hooks/useReveal'
import { getArticle, getRelatedArticles, CATEGORIES } from '../../content'

function renderContent(md: string) {
  const lines = md.split('\n')
  const html: string[] = []
  let inList = false
  let inCode = false
  let codeBuffer: string[] = []

  const flushList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }
  const flushCode = () => {
    if (inCode) {
      html.push(`<pre class="overflow-x-auto rounded-lg bg-[#0b1724] p-4 text-[13px] leading-relaxed text-[#e5e7eb]"><code>${codeBuffer.join('\n')}</code></pre>`)
      codeBuffer = []
      inCode = false
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.startsWith('```')) {
      if (inCode) {
        flushCode()
      } else {
        flushList()
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeBuffer.push(line)
      continue
    }

    if (line.startsWith('## ')) {
      flushList()
      html.push(`<h2 class="mt-8 mb-3 text-[20px] font-bold sm:text-[22px]">${line.slice(3)}</h2>`)
    } else if (line.startsWith('### ')) {
      flushList()
      html.push(`<h3 class="mt-6 mb-2 text-[17px] font-bold">${line.slice(4)}</h3>`)
    } else if (line.startsWith('#### ')) {
      flushList()
      html.push(`<h4 class="mt-4 mb-2 text-[15px] font-bold text-[#374151]">${line.slice(5)}</h4>`)
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul class="mb-4 space-y-1.5">')
        inList = true
      }
      html.push(`<li class="relative pl-5 text-sm leading-relaxed text-[#374151] before:absolute before:left-1.5 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-[#d1d5db]">${line.slice(2)}</li>`)
    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') || line.startsWith('7. ') || line.startsWith('8. ')) {
      flushList()
      html.push(`<p class="mb-2 text-sm leading-relaxed text-[#374151]">${line}</p>`)
    } else if (line.startsWith('| ')) {
      flushList()
      const cells = line.split('|').filter(Boolean).map((c) => c.trim())
      if (cells.every((c) => /^[-:]+\s*$/.test(c))) continue
      html.push(`<div class="mb-4 overflow-x-auto"><table class="w-full text-left text-sm"><tr>${cells.map((c) => `<th class="border-b border-[#e5e7eb] px-3 py-2 font-semibold text-[#111111]">${c}</th>`).join('')}</tr></table></div>`)
    } else if (line.startsWith('[ ] ') || line.startsWith('- [ ] ')) {
      if (!inList) {
        html.push('<ul class="mb-4 space-y-1.5">')
        inList = true
      }
      const text = line.replace(/^-?\s*\[ \]\s*/, '')
      html.push(`<li class="flex items-start gap-2 text-sm leading-relaxed text-[#374151]"><span class="mt-0.5 h-4 w-4 shrink-0 rounded border border-[#d1d5db]" />${text}</li>`)
    } else if (line.startsWith('[x] ') || line.startsWith('- [x] ')) {
      if (!inList) {
        html.push('<ul class="mb-4 space-y-1.5">')
        inList = true
      }
      const text = line.replace(/^-?\s*\[x\]\s*/, '')
      html.push(`<li class="flex items-start gap-2 text-sm leading-relaxed text-[#374151]"><span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border bg-[#f97316] text-white text-[10px] font-bold">✓</span>${text}</li>`)
    } else if (line === '') {
      flushList()
    } else {
      flushList()
      const processed = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="rounded bg-[#f3f4f6] px-1 py-0.5 text-[12px] font-mono text-[#111]">$1</code>')
      html.push(`<p class="mb-3 text-sm leading-relaxed text-[#374151]">${processed}</p>`)
    }
  }
  flushCode()
  flushList()

  return html.join('\n')
}

export default function CommunityArticle() {
  useReveal()
  const { slug } = useParams<{ category: string; slug: string }>()
  const article = getArticle(slug || '')
  const cat = CATEGORIES.find((c) => c.id === article?.category)

  if (!article) {
    return (
      <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
        <Nav />
        <section className="pt-[104px] sm:pt-[128px]">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10 text-center">
            <h1 className="text-[24px] font-bold">文章不存在</h1>
            <p className="mt-2 text-[#6b7280]">该文章尚未创建或已被删除。</p>
            <Link to="/community" className="mt-4 inline-block text-[#f97316] font-medium">返回社区首页 →</Link>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const related = getRelatedArticles(article)

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      <section className="pb-8 pt-[104px] sm:pt-[128px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="flex items-center gap-2 text-[13px] text-[#9ca3af]">
            <Link to="/community" className="hover:text-[#111111]">社区</Link>
            <span>/</span>
            {cat && (
              <>
                <Link to={`/community/${cat.id}`} className="hover:text-[#111111]">{cat.label}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-[#111111] truncate max-w-[200px]">{article.title}</span>
          </div>
        </div>
      </section>

      <section className="pb-[64px] sm:pb-[80px]">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-6 sm:px-10 lg:grid-cols-[1fr_320px]">
          <article className="min-w-0">
            <header className="mb-8">
              <div className="flex items-center gap-3 flex-wrap">
                {cat && (
                  <Link
                    to={`/community/${cat.id}`}
                    className="rounded-full bg-[#111111]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#6b7280] hover:text-[#111111]"
                  >
                    {cat.label}
                  </Link>
                )}
                <span className="font-mono text-[12px] text-[#9ca3af]">{article.date}</span>
                <span className="text-[11px] text-[#9ca3af]">{article.readingTime} 阅读</span>
              </div>
              <h1 className="mt-3 font-display text-[26px] font-bold leading-tight sm:text-[32px]">{article.title}</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">{article.description}</p>
              {article.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#e5e7eb] px-3 py-1 text-[11px] font-medium text-[#6b7280]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div className="prose-custom max-w-none border-t border-[#e5e7eb] pt-6">
              <div dangerouslySetInnerHTML={{ __html: renderContent(article.content) }} />
            </div>

            {related.length > 0 && (
              <div className="mt-12 border-t border-[#e5e7eb] pt-8">
                <h3 className="text-[16px] font-bold">相关文章</h3>
                <div className="mt-4 space-y-3">
                  {related.map((r) => {
                    const rc = CATEGORIES.find((c) => c.id === r.category)
                    return (
                      <Link
                        key={r.id}
                        to={`/community/${r.category}/${r.id}`}
                        className="card-light btn-lift group block rounded-xl px-5 py-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#111111]/5 px-2 py-0.5 text-[11px] font-semibold text-[#6b7280]">
                            {rc?.label}
                          </span>
                          <span className="text-[11px] text-[#9ca3af]">{r.readingTime}</span>
                        </div>
                        <h4 className="mt-1.5 text-[14px] font-bold group-hover:text-[#f97316] transition-colors">{r.title}</h4>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </article>

          <CommunitySidebar />
        </div>
      </section>

      <Footer />
    </div>
  )
}