import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import { useReveal } from '../../hooks/useReveal'
import LearningBreadcrumb from '../../components/learn/LearningBreadcrumb'
import LearningVideo from '../../components/learn/LearningVideo'
import LearningStep from '../../components/learn/LearningStep'
import LearningFAQ from '../../components/learn/LearningFAQ'
import LearningNext from '../../components/learn/LearningNext'
import LearningProgress from '../../components/learn/LearningProgress'
import { getCompletedLearningSlugs, markLearningComplete } from '../../lib/learningProgress'
import {
  TRACK_NAME,
  getArticle,
  getPrevNext,
  getRelatedArticles,
} from '../../content/learn'

export default function LearnArticle() {
  const { slug = '' } = useParams()
  const article = getArticle(slug)
  const [completed, setCompleted] = useState(() => getCompletedLearningSlugs())
  useReveal()

  useEffect(() => {
    if (!article) {
      document.title = '教程未找到｜牛牛 AI 学习中心'
      return
    }
    document.title = `${article.title}｜牛牛 AI 学习中心`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', article.shortAnswer)
  }, [article])

  if (!article) {
    return (
      <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
        <Nav />
        <section className="mx-auto max-w-[820px] px-6 pb-24 pt-[140px] text-center">
          <h1 className="font-display text-[24px] font-bold">没有找到这篇教程</h1>
          <p className="mt-3 text-[15px] text-[#6b7280]">
            链接可能已更新。你可以回到学习中心重新查找。
          </p>
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

  const trackName = TRACK_NAME[article.track]
  const related = getRelatedArticles(article.slug)
  const { prev, next } = getPrevNext(article.slug)
  const isComplete = completed.includes(article.slug)
  const markComplete = () => {
    markLearningComplete(article.slug)
    setCompleted(getCompletedLearningSlugs())
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      <article className="mx-auto max-w-[1280px] px-6 pb-20 pt-[104px] sm:px-10 sm:pt-[120px]">
        <div className="mx-auto max-w-[820px]">
          <LearningBreadcrumb trackName={trackName} trackId={article.track} />

          {/* H1 */}
          <h1 className="mt-5 font-display text-[28px] font-bold leading-tight sm:text-[34px]">
            {article.title}
          </h1>

          {/* Short Answer */}
          <p className="mt-5 rounded-xl border border-[#eceae6] bg-white px-5 py-4 text-[16px] leading-[1.8] text-[#374151]">
            {article.shortAnswer}
          </p>

          {/* Metadata */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#6b7280]">
            {article.video && <span>视频 · {Math.round(article.video.durationSeconds)} 秒</span>}
            <span>图文 · {article.readingMinutes} 分钟</span>
            <span>{article.difficulty}</span>
            {article.updatedAt && <span>更新于 {article.updatedAt}</span>}
          </div>

          {/* Video — must appear early */}
          {article.video && <LearningVideo video={article.video} title={article.title} />}

          {/* Intro */}
          {article.intro && (
            <p className="mt-8 text-[16px] leading-[1.85] text-[#374151]">{article.intro}</p>
          )}

          {/* Prerequisites */}
          {article.prerequisites?.length ? (
            <section className="mt-8 rounded-xl border border-[#eceae6] bg-white p-5">
              <h2 className="font-display text-[15px] font-bold">准备工作</h2>
              <ul className="mt-3 space-y-2">
                {article.prerequisites.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[15px] leading-relaxed text-[#374151]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f97316]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Steps */}
          <section className="mt-12">
            <h2 className="font-display text-[20px] font-bold sm:text-[22px]">图文教程</h2>
            <div className="mt-8 space-y-8">
              {article.steps.map((s, i) => (
                <LearningStep key={s.id} step={s} index={i} />
              ))}
            </div>
          </section>

          {/* Common problems */}
          {article.commonProblems?.length ? (
            <section className="mt-14">
              <h2 className="font-display text-[20px] font-bold sm:text-[22px]">常见问题</h2>
              <div className="mt-6">
                <LearningFAQ items={article.commonProblems} />
              </div>
            </section>
          ) : null}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#eceae6] bg-white px-3 py-1 text-[12px] text-[#6b7280]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-[20px] font-bold sm:text-[22px]">下一步学习</h2>
              <div className="mt-6">
                <LearningNext articles={related} />
              </div>
            </section>
          )}

          <div className="mt-12 flex flex-col gap-3 rounded-xl border border-[#eceae6] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="text-sm font-bold">本节学习状态</div><p className="mt-1 text-sm text-[#6b7280]">完成后会同步到“我的账户”的学习进度。</p></div>
            <button onClick={markComplete} disabled={isComplete} className="rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:bg-[#d6dae0]">
              {isComplete ? '已完成本节' : '标记为已完成'}
            </button>
          </div>

          {/* Prev / Next */}
          <div className="mt-10">
            <LearningProgress prev={prev} next={next} />
          </div>

          {/* Back */}
          <div className="mt-10 text-center">
            <Link to="/learn" className="text-[14px] font-medium text-[#f97316]">
              ← 返回学习中心
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
