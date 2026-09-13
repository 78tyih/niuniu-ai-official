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
import { HOME_CHAPTERS as DEMO_CHAPTERS } from '../../lib/chapters'

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
          <div className="mx-auto max-w-[820px] text-center">
            <div className="text-[11px] font-semibold tracking-[0.08em] text-[#9ca3af]">
              NIUNIU AI LEARN
            </div>
            <h1 className="mt-3 font-display text-[30px] font-bold leading-tight sm:text-[38px]">
              牛牛 AI 学习中心
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#6b7280] sm:text-[17px]">
              从连接 MT5，到让 AI 按你的方法分析，一步一步学会牛牛 AI。
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[640px]">
            <LearningSearch />
          </div>

          <div className="mt-4 text-center text-[13px] text-[#9ca3af]">
            共 {LEARNING_STATS.articleCount} 篇教程 · {LEARNING_STATS.videoCount} 条视频
          </div>
        </div>
      </section>

      {/* 视频演示：先看真实操作，再看图文 */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="reveal text-center">
            <h2 className="font-display text-[22px] font-bold sm:text-[26px]">
              先看一遍真实操作
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-[14px] text-[#6b7280]">
              每段都是产品内的真实录屏，点开就能播。
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_CHAPTERS.map((c) => (
              <div
                key={c.slug}
                className="reveal overflow-hidden rounded-xl border border-[#eceae6] bg-white"
              >
                <video
                  src={c.video}
                  poster={c.poster}
                  controls
                  playsInline
                  preload="none"
                  className="aspect-video w-full bg-black object-cover"
                />
                <div className="px-5 py-4">
                  <div className="font-display text-[15px] font-bold">{c.title}</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-[#6b7280]">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-t border-[#eceae6] py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h2 className="reveal font-display text-[22px] font-bold sm:text-[26px]">
            第一次使用？从这里开始
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quickStart.map((a, i) => (
              <Link
                key={a.id}
                to={`/learn/${a.slug}`}
                className="reveal group overflow-hidden rounded-xl border border-[#eceae6] bg-white transition-shadow hover:shadow-[0_8px_28px_rgba(17,17,17,0.08)]"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[#f3f4f6]">
                  {a.video ? (
                    <>
                      <img
                        src={a.video.poster}
                        alt={`${a.title} 教程封面`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="absolute left-3 top-3 rounded-md bg-[#0b1724]/85 px-2 py-0.5 font-display text-[13px] font-bold tabular-nums text-white">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-[0_6px_18px_rgba(17,17,17,0.2)] transition-transform group-hover:scale-110">
                          <svg
                            className="h-5 w-5 translate-x-[1px] text-[#111111]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                      <span className="absolute bottom-2 right-2 rounded bg-[#0b1724]/80 px-1.5 py-0.5 font-mono text-[11px] text-white">
                        {Math.round(a.video.durationSeconds)}s
                      </span>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-[13px] text-[#9ca3af]">
                      图文教程
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[16px] font-bold leading-snug">{a.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6b7280]">
                    {a.shortAnswer}
                  </p>
                  <div className="mt-3 text-[13px] font-medium text-[#f97316]">
                    查看教程
                    <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </div>
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
