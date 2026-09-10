import { useState } from 'react'
import { Link } from 'react-router'
import Nav from '../../sections/Nav'
import Footer from '../../sections/Footer'
import { useReveal } from '../../hooks/useReveal'
import LearningSearch from '../../components/learn/LearningSearch'
import LearningCard from '../../components/learn/LearningCard'
import LearningTrackCard from '../../components/learn/LearningTrackCard'
import {
  LEARNING_ARTICLES,
  LEARNING_TRACKS,
  LEARNING_STATS,
  TRACK_NAME,
  getArticlesByTrack,
  getPopularQuestions,
  getQuickStartArticles,
  type LearningTrack,
} from '../../content/learn'
import { UPDATES } from '../../content/updates'

export default function LearnHub() {
  useReveal()
  const [filter, setFilter] = useState<'all' | LearningTrack>('all')
  const [openUpdate, setOpenUpdate] = useState<string | null>(null)

  const quickStart = getQuickStartArticles()
  const popular = getPopularQuestions()
  const recentUpdates = [...UPDATES].slice(0, 4)

  const filtered =
    filter === 'all'
      ? [...LEARNING_ARTICLES].sort((a, b) => a.order - b.order)
      : getArticlesByTrack(filter)

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* Hero */}
      <section className="pb-10 pt-[104px] sm:pt-[128px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="max-w-[820px]">
            <div className="text-[11px] font-semibold tracking-[0.08em] text-[#9ca3af]">
              NIUNIU AI LEARN
            </div>
            <h1 className="mt-3 font-display text-[30px] font-bold leading-tight sm:text-[38px]">
              牛牛 AI 学习中心
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-[#6b7280] sm:text-[17px]">
              从连接 MT5，到让 AI 按你的方法分析，一步一步学会牛牛 AI。
            </p>
          </div>

          <div className="mt-8 max-w-[640px]">
            <LearningSearch />
          </div>

          <div className="mt-4 text-[13px] text-[#9ca3af]">
            共 {LEARNING_STATS.articleCount} 篇教程 · {LEARNING_STATS.videoCount} 条视频
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="reveal font-display text-[22px] font-bold sm:text-[26px]">
            第一次使用？从这里开始
          </h2>
          <div className="mt-8 divide-y divide-[#eceae6] border-t border-[#eceae6]">
            {quickStart.map((a, i) => (
              <Link
                key={a.id}
                to={`/learn/${a.slug}`}
                className="reveal group flex items-center gap-5 py-5 transition-colors hover:bg-white/60 sm:gap-8"
              >
                <span className="font-display text-[20px] font-bold tabular-nums text-[#d1d5db] transition-colors group-hover:text-[#f97316] sm:text-[24px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <span className="block font-display text-[16px] font-bold leading-snug sm:text-[18px]">
                    {a.title}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-[13px] leading-relaxed text-[#6b7280] sm:text-[14px]">
                    {a.shortAnswer}
                  </span>
                </span>
                <span className="shrink-0 text-[18px] text-[#d1d5db] transition-colors group-hover:text-[#f97316]">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="reveal font-display text-[22px] font-bold sm:text-[26px]">
            按你要解决的问题学习
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEARNING_TRACKS.map((t) => (
              <div key={t.id} className="reveal">
                <LearningTrackCard track={t} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="reveal font-display text-[22px] font-bold sm:text-[26px]">
            大家最常问的问题
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {popular.map((q) => (
              <Link
                key={q.article.id}
                to={`/learn/${q.article.slug}`}
                className="reveal group flex items-center justify-between gap-4 rounded-xl border border-[#eceae6] bg-white px-5 py-4 transition-colors hover:border-[#f97316]"
              >
                <span className="text-[15px] font-medium leading-snug">{q.question}</span>
                <span className="shrink-0 text-[#d1d5db] transition-colors group-hover:text-[#f97316]">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All articles */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-[22px] font-bold sm:text-[26px]">全部教程</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  filter === 'all' ? 'bg-[#111111] text-white' : 'bg-white text-[#6b7280] hover:bg-[#f3f4f6]'
                }`}
              >
                全部
              </button>
              {LEARNING_TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                    filter === t.id ? 'bg-[#111111] text-white' : 'bg-white text-[#6b7280] hover:bg-[#f3f4f6]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <div key={a.id} className="reveal">
                <LearningCard article={a} />
              </div>
            ))}
          </div>

          {filter !== 'all' && (
            <div className="mt-6 text-[13px] text-[#9ca3af]">
              当前分类：{TRACK_NAME[filter]} · {filtered.length} 篇
            </div>
          )}
        </div>
      </section>

      {/* Recent updates — lightweight */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="reveal font-display text-[18px] font-bold sm:text-[20px]">最近更新</h2>
          <div className="mt-6 divide-y divide-[#eceae6] border-t border-[#eceae6]">
            {recentUpdates.map((u) => (
              <div key={u.id} className="reveal">
                <button
                  onClick={() => setOpenUpdate(openUpdate === u.id ? null : u.id)}
                  aria-expanded={openUpdate === u.id}
                  className="flex w-full items-center justify-between gap-4 py-3.5 text-left transition-colors hover:bg-white/60"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-display text-[12px] tabular-nums text-[#9ca3af]">{u.date}</span>
                    <span className="text-[15px] font-medium">{u.title}</span>
                  </span>
                  <span className="shrink-0 text-[#d1d5db]">{openUpdate === u.id ? '−' : '+'}</span>
                </button>
                {openUpdate === u.id && (
                  <p className="pb-4 text-[14px] leading-relaxed text-[#6b7280]">{u.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still stuck */}
      <section id="help" className="border-t border-[#eceae6] bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="reveal font-display text-[18px] font-bold sm:text-[20px]">还是没解决？</h2>
          <div className="reveal mt-6 grid gap-4 sm:grid-cols-3">
            <Link
              to="/learn/troubleshooting"
              className="rounded-xl border border-[#eceae6] bg-[#fafaf8] px-5 py-4 transition-colors hover:border-[#f97316]"
            >
              <div className="text-[15px] font-medium">查看常见问题</div>
              <div className="mt-1 text-[13px] text-[#6b7280]">连不上、不开仓、没有数据</div>
            </Link>
            <a
              id="groups"
              href="https://niuniuai.app/#contact"
              className="rounded-xl border border-[#eceae6] bg-[#fafaf8] px-5 py-4 transition-colors hover:border-[#f97316]"
            >
              <div className="text-[15px] font-medium">加入用户群</div>
              <div className="mt-1 text-[13px] text-[#6b7280]">QQ · 企业微信 · 腾讯频道</div>
            </a>
            <a
              id="contact"
              href="https://niuniuai.app/#contact"
              className="rounded-xl border border-[#eceae6] bg-[#fafaf8] px-5 py-4 transition-colors hover:border-[#f97316]"
            >
              <div className="text-[15px] font-medium">联系客服</div>
              <div className="mt-1 text-[13px] text-[#6b7280]">产品与账户问题</div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
