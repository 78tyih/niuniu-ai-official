import { useEffect, useRef, useState } from 'react'
import { useLocation, Link } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import { CHAPTERS } from '../lib/chapters'
import { useIsMobile } from '../hooks/useIsMobile'

const DEMO_SLUGS = ['connect-mt5', 'ai-analysis', 'ai-review', 'position-diagnosis', 'ai-replay']
const DEMO_CHAPTERS = DEMO_SLUGS.map((s) => CHAPTERS.find((c) => c.slug === s)!)
const MORE_CHAPTERS = CHAPTERS.filter((c) => !DEMO_SLUGS.includes(c.slug))

/** 每个演示章节的文字教程（步骤式） */
const TUTORIALS: Record<string, string[]> = {
  'connect-mt5': [
    '打开牛牛AI 控制台，选择「连接 MT5」。',
    '输入你的 MT5 账户服务器与凭证，完成授权（全程只读权限）。',
    '等待行情与持仓数据同步完成，通常只需几秒钟。',
    '连接状态显示为已连接后，即可开始 AI 分析。',
    '提示：全程只读，不触碰资金；若连接失败，先联系客服确认你的券商接口是否有限制。',
  ],
  'ai-analysis': [
    '在分析面板选择要分析的品种与时间周期。',
    '选择一套提示词模板，或使用你保存的自定义提示词。',
    '点击「开始分析」，等待 AI 输出结构化结论。',
    '查看关键位置、市场条件与分析依据，可以就结论继续追问细节。',
  ],
  'ai-review': [
    '在准备下单前，打开「风险审核」功能。',
    '确认审核规则：单笔最大亏损、每日交易次数、止损止盈边界等。',
    '把当前交易条件提交给 AI，进行独立复核。',
    '逐条查看审核结果；审核不通过时，按建议调整后再提交。',
  ],
  'position-diagnosis': [
    '打开「持仓诊断」，查看当前全部持仓的风险汇总。',
    '重点关注被高亮提醒的异常持仓。',
    '结合 AI 给出的诊断建议，评估是否减仓、加仓或调整止损。',
    '诊断结果与 MT5 实时同步，持仓变化后可直接刷新复查。',
  ],
  'ai-replay': [
    '交易结束后，打开「交易复盘」。',
    '在时间线上找到对应订单，回看当时的分析与审核记录。',
    '对照实际结果，检查当时的判断依据是否成立。',
    '补充复盘备注，把经验沉淀到你的 AI 分析日志中。',
  ],
}

export default function Demo() {
  const location = useLocation()
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMobile = useIsMobile()
  const chapter = DEMO_CHAPTERS[active]

  // hash 联动 /demo#<slug>
  useEffect(() => {
    const slug = location.hash.replace('#', '')
    const idx = DEMO_CHAPTERS.findIndex((c) => c.slug === slug)
    if (idx >= 0) setActive(idx)
  }, [location.hash])

  // 切换章节或端型：重新加载并自动播放（chapter → video 联动）
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    setProgress(0)
    el.load()
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }, [active, isMobile])

  const onTimeUpdate = () => {
    const el = videoRef.current
    if (el && el.duration) setProgress(el.currentTime / el.duration)
  }

  const goNext = () => setActive((a) => (a + 1) % DEMO_CHAPTERS.length)

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />

      {/* 紧凑头部 */}
      <section className="pb-8 pt-[104px] sm:pt-[128px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <h1 className="font-display text-[28px] font-bold sm:text-[34px]">产品演示</h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">用真实操作了解牛牛AI。</p>
        </div>
      </section>

      {/* Video Theater */}
      <section className="pb-[64px] sm:pb-[80px]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          {/* 横向章节条（置于视频上方）：与播放进度双向联动 */}
          <div className="scrollbar-none -mx-6 mb-5 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:px-0">
            {DEMO_CHAPTERS.map((c, i) => {
              const isActive = i === active
              return (
                <button
                  key={c.slug}
                  onClick={() => setActive(i)}
                  className={`relative min-w-[132px] shrink-0 overflow-hidden rounded-lg px-4 py-3 text-left transition-colors duration-200 ${
                    isActive ? 'bg-white shadow-sm ring-1 ring-[#e5e7eb]' : 'hover:bg-white'
                  }`}
                >
                  <span className={`block font-mono text-[11px] font-semibold ${isActive ? 'text-[#f97316]' : 'text-[#d1d5db]'}`}>
                    {c.no}
                  </span>
                  <span className={`mt-0.5 block whitespace-nowrap text-[14px] ${isActive ? 'font-semibold' : 'font-medium text-[#374151]'}`}>
                    {c.title}
                  </span>
                  {/* 进度填充（video → chapter 联动） */}
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#f3f4f6]">
                    <span
                      className={`block h-full bg-[#f97316] transition-[width] duration-150 ${isActive ? '' : 'w-0'}`}
                      style={isActive ? { width: `${Math.round(progress * 100)}%` } : undefined}
                    />
                  </span>
                </button>
              )
            })}
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#0b1724] shadow-[0_24px_60px_-32px_rgba(11,23,36,0.45)]">
            <video
              ref={videoRef}
              key={`${chapter.slug}-${isMobile ? 'm' : 'd'}`}
              src={isMobile ? chapter.videoMobile : chapter.video}
              poster={isMobile ? chapter.posterMobile : chapter.poster}
              muted
              playsInline
              preload="auto"
              controls
              onTimeUpdate={onTimeUpdate}
              onEnded={goNext}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className={
                isMobile
                  ? 'mx-auto block max-h-[68vh] w-full object-contain'
                  : 'block aspect-video w-full object-cover'
              }
              aria-label={chapter.title}
            />
          </div>

          {/* 当前章节说明 */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold text-[#f97316]">{chapter.no}</span>
                <h2 className="text-[19px] font-bold">{chapter.title}</h2>
                {!playing && <span className="text-xs text-[#9ca3af]">已暂停</span>}
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">{chapter.desc}</p>
            </div>
            <button
              onClick={goNext}
              className="link-arrow shrink-0 text-sm font-medium text-[#f97316] transition-colors hover:text-[#ea6a0c]"
            >
              下一章节：{DEMO_CHAPTERS[(active + 1) % DEMO_CHAPTERS.length].title} <span className="arrow">→</span>
            </button>
          </div>

          {/* 当前章节文字教程 */}
          <div className="mt-8 rounded-xl border border-[#e5e7eb] bg-white p-6 sm:p-7">
            <div className="text-[13px] font-semibold text-[#9ca3af]">图文教程 · {chapter.title}</div>
            <ol className="mt-4 space-y-3.5">
              {TUTORIALS[chapter.slug].map((step, si) => (
                <li key={si} className="flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f97316]/10 font-mono text-[12px] font-bold text-[#f97316]">
                    {si + 1}
                  </span>
                  <p className="pt-0.5 text-[14px] leading-relaxed text-[#374151]">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* 更多章节 */}
          <div className="mt-8 border-t border-[#eceae6] pt-6">
            <div className="text-[13px] font-medium text-[#9ca3af]">更多功能章节</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {MORE_CHAPTERS.map((c) => (
                <a
                  key={c.slug}
                  href={c.video}
                  target="_blank"
                  rel="noreferrer"
                  className="link-arrow rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-medium text-[#374151] transition-colors hover:border-[#f97316] hover:text-[#f97316]"
                >
                  {c.title} <span className="arrow">→</span>
                </a>
              ))}
            </div>
          </div>

          {/* 底部 CTA */}
          <div className="mt-12 text-center">
            <p className="text-[15px] text-[#6b7280]">看完演示，选择适合你的使用周期。</p>
            <Link
              to="/pricing"
              className="btn-lift mt-4 inline-block rounded-lg bg-[#f97316] px-8 py-3.5 text-[15px] font-semibold text-white hover:bg-[#ea6a0c]"
            >
              查看价格方案
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
