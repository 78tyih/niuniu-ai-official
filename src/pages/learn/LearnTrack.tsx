import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import { useReveal } from '../../hooks/useReveal'
import LearningBreadcrumb from '../../components/learn/LearningBreadcrumb'
import LearningCard from '../../components/learn/LearningCard'
import LearningSearch from '../../components/learn/LearningSearch'
import { LEARNING_TRACKS, getArticlesByTrack } from '../../content/learn'

export default function LearnTrack({ trackId }: { trackId?: string }) {
  const params = useParams()
  const track = trackId ?? params.track ?? ''
  useReveal()

  const meta = LEARNING_TRACKS.find((t) => t.id === track)
  const articles = meta ? getArticlesByTrack(meta.id) : []

  useEffect(() => {
    document.title = meta
      ? `${meta.name}｜牛牛 AI 学习中心`
      : '未找到分类｜牛牛 AI 学习中心'
  }, [meta])

  if (!meta) {
    return (
      <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
        <Nav />
        <section className="mx-auto max-w-[820px] px-6 pb-24 pt-[140px] text-center">
          <h1 className="font-display text-[24px] font-bold">没有找到这个分类</h1>
          <Link
            to="/learn"
            className="mt-6 inline-block rounded-lg bg-[#111111] px-5 py-2.5 text-[14px] font-medium text-white"
          >
            返回学习中心
          </Link>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      <section className="mx-auto max-w-[1280px] px-6 pb-20 pt-[104px] sm:px-10 sm:pt-[120px]">
        <div className="max-w-[820px]">
          <LearningBreadcrumb trackName={meta.name} />
          <h1 className="mt-5 font-display text-[28px] font-bold leading-tight sm:text-[34px]">
            {meta.name}
          </h1>
          <p className="mt-3 text-[16px] text-[#f97316]">{meta.question}</p>
          <p className="mt-3 text-[16px] leading-relaxed text-[#6b7280]">{meta.description}</p>
          <div className="mt-6 max-w-[560px]">
            <LearningSearch />
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <div key={a.id} className="reveal">
              <LearningCard article={a} />
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[#eceae6] pt-8">
          <div className="text-[13px] text-[#9ca3af]">其他分类</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEARNING_TRACKS.filter((t) => t.id !== meta.id).map((t) => (
              <Link
                key={t.id}
                to={`/learn/${t.id}`}
                className="rounded-full border border-[#eceae6] bg-white px-4 py-1.5 text-[13px] text-[#6b7280] transition-colors hover:border-[#f97316] hover:text-[#f97316]"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
