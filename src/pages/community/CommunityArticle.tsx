import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import { useReveal } from '../../hooks/useReveal'
import { getArticle, getRelatedArticles, CATEGORIES } from '../../content'

function extractTOC(md: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = []
  for (const line of md.split('\n')) {
    const m = line.match(/^(#{2,4})\s+(.+)$/)
    if (m) {
      const text = m[2].trim()
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '')
      toc.push({ id, text, level: m[1].length })
    }
  }
  return toc
}

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
      const text = line.slice(3)
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '')
      html.push(`<h2 id="${id}" class="mt-10 mb-4 text-[22px] font-bold sm:text-[26px]">${text}</h2>`)
    } else if (line.startsWith('### ')) {
      flushList()
      const text = line.slice(4)
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '')
      html.push(`<h3 id="${id}" class="mt-8 mb-3 text-[18px] font-bold">${text}</h3>`)
    } else if (line.startsWith('#### ')) {
      flushList()
      const text = line.slice(5)
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '')
      html.push(`<h4 id="${id}" class="mt-6 mb-2 text-[16px] font-bold text-[#374151]">${text}</h4>`)
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul class="mb-5 space-y-1.5">')
        inList = true
      }
      html.push(`<li class="relative pl-5 text-[15px] leading-relaxed text-[#374151] before:absolute before:left-1.5 before:top-[8px] before:h-1 before:w-1 before:rounded-full before:bg-[#d1d5db]">${line.slice(2)}</li>`)
    } else if (/^\d+\.\s/.test(line)) {
      if (!inList) {
        html.push('<ol class="mb-5 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#374151]">')
        inList = true
      }
      html.push(`<li class="pl-1">${line.replace(/^\d+\.\s/, '')}</li>`)
    } else if (line.startsWith('| ')) {
      flushList()
      const cells = line.split('|').filter(Boolean).map((c) => c.trim())
      if (cells.every((c) => /^[-:]+\s*$/.test(c))) continue
      html.push(`<div class="mb-5 overflow-x-auto"><table class="w-full text-left text-[15px]"><tr>${cells.map((c) => `<th class="border-b border-[#e5e7eb] px-3 py-2.5 font-semibold text-[#111111]">${c}</th>`).join('')}</tr></table></div>`)
    } else if (line.startsWith('[ ] ') || line.startsWith('- [ ] ')) {
      if (!inList) {
        html.push('<ul class="mb-5 space-y-1.5">')
        inList = true
      }
      const text = line.replace(/^-?\s*\[ \]\s*/, '')
      html.push(`<li class="flex items-start gap-2 text-[15px] leading-relaxed text-[#374151]"><span class="mt-0.5 h-4 w-4 shrink-0 rounded border border-[#d1d5db]" />${text}</li>`)
    } else if (line.startsWith('[x] ') || line.startsWith('- [x] ')) {
      if (!inList) {
        html.push('<ul class="mb-5 space-y-1.5">')
        inList = true
      }
      const text = line.replace(/^-?\s*\[x\]\s*/, '')
      html.push(`<li class="flex items-start gap-2 text-[15px] leading-relaxed text-[#374151]"><span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border bg-[#f97316] text-white text-[10px] font-bold">✓</span>${text}</li>`)
    } else if (line === '') {
      flushList()
    } else {
      flushList()
      const processed = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[13px] font-mono text-[#111]">$1</code>')
      html.push(`<p class="mb-4 text-[15px] leading-[1.8] text-[#374151]">${processed}</p>`)
    }
  }
  flushCode()
  flushList()

  return html.join('\n')
}

function TOCPanel({ toc }: { toc: { id: string; text: string; level: number }[] }) {
  const [open, setOpen] = useState(false)
  if (toc.length === 0) return null

  return (
    <>
      {/* Desktop TOC */}
      <nav className="hidden lg:block">
        <div className="sticky top-[92px] w-[200px] xl:w-[220px]">
          <div className="text-[11px] font-semibold tracking-[0.08em] text-[#9ca3af]">目录</div>
          <ul className="mt-3 space-y-1.5">
            {toc.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={`block text-[13px] leading-relaxed text-[#6b7280] transition-colors hover:text-[#111111] ${
                    h.level === 3 ? 'pl-3' : h.level === 4 ? 'pl-6' : ''
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile TOC — 折叠式 */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg border border-[#eceae6] bg-white px-4 py-3 text-sm font-semibold"
        >
          本文目录
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {open && (
          <ul className="mt-2 space-y-1 rounded-lg border border-[#eceae6] bg-white p-3">
            {toc.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={() => setOpen(false)}
                  className={`block text-[13px] text-[#6b7280] py-1 hover:text-[#111111] ${
                    h.level === 3 ? 'pl-3' : h.level === 4 ? 'pl-6' : ''
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
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

  const toc = extractTOC(article.content)
  const related = getRelatedArticles(article)

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* Breadcrumb */}
      <section className="pb-0 pt-[104px] sm:pt-[120px]">
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
            <span className="text-[#111111] truncate max-w-[240px]">{article.title}</span>
          </div>
        </div>
      </section>

      {/* Article Header */}
      <section className="pb-6 pt-6">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="max-w-[820px]">
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
            <h1 className="mt-4 font-display text-[28px] font-bold leading-tight sm:text-[36px] lg:text-[40px]">
              {article.title}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-[#6b7280] lg:text-[17px]">
              {article.description}
            </p>
            {article.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[#e5e7eb] px-3 py-1 text-[11px] font-medium text-[#6b7280]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Body + TOC */}
      <section className="pb-[64px] sm:pb-[80px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="flex gap-10">
            {/* Body */}
            <article className="min-w-0 flex-1 max-w-[820px]">
              <TOCPanel toc={toc} />
              <div className="border-t border-[#e5e7eb] pt-6">
                <div dangerouslySetInnerHTML={{ __html: renderContent(article.content) }} />
              </div>

              {/* Related Articles */}
              {related.length > 0 && (
                <div className="mt-12 border-t border-[#e5e7eb] pt-8">
                  <h3 className="text-[16px] font-bold">继续学习</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((r) => {
                      const rc = CATEGORIES.find((c) => c.id === r.category)
                      return (
                        <Link
                          key={r.id}
                          to={`/community/${r.category}/${r.id}`}
                          className="card-light btn-lift group rounded-xl border border-[#eceae6] bg-white px-5 py-4 transition-colors hover:border-[#d1d5db]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#111111]/5 px-2 py-0.5 text-[11px] font-semibold text-[#6b7280]">
                              {rc?.label}
                            </span>
                            <span className="text-[11px] text-[#9ca3af]">{r.readingTime}</span>
                          </div>
                          <h4 className="mt-1.5 text-[14px] font-bold leading-snug group-hover:text-[#f97316] transition-colors">
                            {r.title}
                          </h4>
                          <p className="mt-1 text-[13px] leading-relaxed text-[#6b7280] line-clamp-2">
                            {r.description}
                          </p>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </article>

            {/* Desktop TOC sidebar */}
            <aside className="hidden lg:block w-[200px] xl:w-[220px] shrink-0">
              <TOCPanel toc={toc} />
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}