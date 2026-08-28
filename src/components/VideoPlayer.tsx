import { useRef, useState, useEffect } from 'react'

/** 极简视频播放器：默认静音、封面优先、点击播放、原生控制条 */
export default function VideoPlayer({
  src,
  poster,
  title,
  className = '',
  autoPlayOnVisible = false,
}: {
  src: string
  poster: string
  title: string
  className?: string
  autoPlayOnVisible?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPlaying(false)
    if (ref.current) {
      ref.current.pause()
      ref.current.load()
    }
  }, [src])

  useEffect(() => {
    if (!autoPlayOnVisible || !ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.play().then(() => setPlaying(true)).catch(() => {})
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [autoPlayOnVisible, src])

  const toggle = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <div className={`group relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#0b1724] shadow-[0_24px_60px_-32px_rgba(11,23,36,0.45)] ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        controls={playing}
        onClick={toggle}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        className="block aspect-video w-full cursor-pointer object-cover"
        aria-label={title}
      />
      {!playing && (
        <button
          onClick={toggle}
          className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
          aria-label={`播放 ${title}`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f97316] shadow-[0_10px_36px_-8px_rgba(249,115,22,0.7)] transition-transform group-hover:scale-105">
            <svg className="ml-1 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="absolute bottom-4 left-5 text-left">
            <span className="block text-sm font-semibold text-white">{title}</span>
            <span className="mt-0.5 block text-xs text-white/60">默认静音 · 点击播放</span>
          </span>
        </button>
      )}
    </div>
  )
}
