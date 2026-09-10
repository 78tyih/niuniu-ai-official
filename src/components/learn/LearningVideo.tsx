import { useRef, useState } from 'react'
import type { LearningVideo as LearningVideoData } from '../../content/learn'

function formatDuration(seconds: number): string {
  return `${Math.round(seconds)} 秒`
}

export default function LearningVideo({ video, title }: { video: LearningVideoData; title: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <figure className="my-6">
      <div className="relative overflow-hidden rounded-xl border border-[#eceae6] bg-[#0d1118]">
        <video
          ref={ref}
          src={video.src}
          poster={video.poster}
          playsInline
          preload="metadata"
          controls={playing}
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="block aspect-video w-full object-cover"
          aria-label={title}
        />
        {!playing && (
          <button
            onClick={toggle}
            aria-label={`播放 ${title}`}
            className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f97316] shadow-[0_10px_32px_-8px_rgba(249,115,22,0.7)] transition-transform hover:scale-105">
              <svg className="ml-0.5 h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2.5 flex items-center gap-2 text-[13px] text-[#6b7280]">
        <span>视频教程</span>
        <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
        <span>{formatDuration(video.durationSeconds)}</span>
        {video.subtitle && (
          <>
            <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
            <span>{video.subtitle}</span>
          </>
        )}
      </figcaption>
    </figure>
  )
}
