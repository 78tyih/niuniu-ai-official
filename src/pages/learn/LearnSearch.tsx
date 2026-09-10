import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import { useReveal } from '../../hooks/useReveal'
import LearningCard from '../../components/learn/LearningCard'
import LearningSearch from '../../components/learn/LearningSearch'
import { LEARNING_ARTICLES, LEARNING_TRACKS, searchArticles } from '../../content/learn'

export default function LearnSearch() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('q') ?? ''
  const [q, setQ] = useState(initial)
  useReveal()

  useEffect(() => {
    setQ(params.get('q') ?? '')
  }, [params])

  const results = useMemo(() => (q.trim() ? searchArticles(q) : []), [q])

  useEffect(() => {
    document.title = q.trim()
      ? `搜索「${q.trim()}」｜牛牛 AI 学习中心`
      : '搜索｜牛牛 AI 学习中心'
  }, [q])

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      <section className="mx-auto max-w-[1280px] px-6 pb-20 pt-[104px] sm:px-10 sm:pt-[120px]">
        <h1 className="font-display text-[26px] font-bold sm:text-[30px]">搜索学习内容</h1>

        <form
          className="mt-6 max-w-[640px]"
          onSubmit={(e) => {
            e.preventDefault()
            setParams(q.trim() ? { q: q.trim() } : {})
          }}
        >
          <div className="rounded-xl border border-[#e5e7eb] bg-white focus-within:border-[#f97316]">
            <div className="flex items-center gap-3 px-4">
              <svg
                className="h-4 w-4 shrink-0 text-[#9ca3af]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="例如：MT5 连不上、不开仓、止损"
                aria-label="搜索学习内容"
                className="w-full bg-transparent py-3.5 text-[15px] outline-none placeholder:text-[#9ca3af]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-medium text-white"
              >
                搜索
              </button>
            </div>
          </div>
        </form>

        {!q.trim() ? (
          <div className="mt-10">
            <div className="text-[14px] text-[#6b7280]">或者按分类浏览：</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {LEARNING_TRACKS.map((t) => (
                <Link
                  key={t.id}
                  to={`/learn/${t.id}`}
                  className="rounded-full border border-[#eceae6] bg-white px-4 py-1.5 text-[13px] text-[#6b7280] transition-colors hover:border-[#f97316] hover:text-[#f97316]"
                >
                  {t.name}
                </Link>
              ))}
            </div>
            <div className="mt-8 text-[13px] text-[#9ca3af]">
              共 {LEARNING_ARTICLES.length} 篇教程可供检索
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[#eceae6] bg-white px-6 py-10 text-center">
            <div className="text-[16px] font-medium">没有找到匹配的教程</div>
            <p className="mt-2 text-[14px] text-[#6b7280]">
              换个说法试试，或者直接按分类浏览。
            </p>
            <div className="mt-6 max-w-[520px] mx-auto text-left">
              <LearningSearch />
            </div>
          </div>
        ) : (
          <div className="mt-10">
            <div className="text-[14px] text-[#6b7280]">
              找到 <span className="font-semibold text-[#111111]">{results.length}</span> 篇相关教程
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <div key={a.id} className="reveal">
                  <LearningCard article={a} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
