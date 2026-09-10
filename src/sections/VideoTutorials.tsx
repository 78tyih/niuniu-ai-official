import { useEffect, useState } from 'react'
import {
  VIDEO_TUTORIALS,
  VIDEO_TUTORIAL_GROUPS,
  formatDuration,
  type VideoTutorial,
} from '../content/videoTutorials'

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9.5 7.6c0-.9 1-1.5 1.8-1L17 10.9c.7.4.7 1.4 0 1.8l-5.7 3.3c-.8.4-1.8-.1-1.8-1V7.6Z" />
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export default function VideoTutorials() {
  const [groupId, setGroupId] = useState<string>('all')
  const [active, setActive] = useState<VideoTutorial | null>(null)

  const list =
    groupId === 'all' ? VIDEO_TUTORIALS : VIDEO_TUTORIALS.filter((v) => v.groupId === groupId)

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [active])

  return (
    <section id="videos" className="border-t border-[#eceae6] py-12">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
        <div className="reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.08em] text-[#9ca3af]">
              VIDEO TUTORIALS
            </div>
            <h2 className="mt-2 font-display text-[24px] font-bold sm:text-[28px]">视频教程</h2>
            <p className="mt-2 max-w-2xl text-[15px] text-[#6b7280]">
              每条约 20 秒的功能演示，一个功能一条，跟着画面走一遍即可上手。
            </p>
          </div>
          <div className="text-[13px] text-[#9ca3af]">共 {VIDEO_TUTORIALS.length} 条</div>
        </div>

        <div className="reveal mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setGroupId('all')}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              groupId === 'all' ? 'bg-[#111111] text-white' : 'bg-white text-[#6b7280] hover:bg-[#f3f4f6]'
            }`}
          >
            全部
          </button>
          {VIDEO_TUTORIAL_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroupId(g.id)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                groupId === g.id ? 'bg-[#111111] text-white' : 'bg-white text-[#6b7280] hover:bg-[#f3f4f6]'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v)}
              className="reveal group overflow-hidden rounded-xl border border-[#eceae6] bg-white text-left transition-shadow hover:shadow-[0_8px_28px_rgba(17,17,17,0.08)]"
            >
              <div className="relative aspect-video overflow-hidden bg-[#f3f4f6]">
                <img
                  src={v.coverUrl}
                  alt={v.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <PlayIcon className="h-11 w-11 text-white drop-shadow-md opacity-90" />
                </div>
                <div className="absolute right-2.5 top-2.5 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white">
                  {formatDuration(v.durationSeconds)}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#9ca3af]">
                  <span>{v.no}</span>
                  <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
                  <span>{v.groupName}</span>
                  <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
                  <span>{v.difficulty}</span>
                </div>
                <h3 className="mt-2 font-display text-[16px] font-bold leading-snug">{v.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#6b7280]">
                  {v.summary}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <div
            className="w-full max-w-[960px] overflow-hidden rounded-xl bg-[#0d1118]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="font-display text-[17px] font-bold text-white">{active.title}</h3>
                <p className="mt-1 text-[13px] text-white/60">
                  {active.no} · {active.groupName} · {formatDuration(active.durationSeconds)}
                </p>
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="关闭"
                className="shrink-0 rounded-lg px-2 py-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <video
              key={active.id}
              src={active.videoUrl}
              poster={active.coverUrl}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-black"
            />
            <p className="px-5 py-4 text-[13px] leading-relaxed text-white/55">{active.summary}</p>
          </div>
        </div>
      )}
    </section>
  )
}