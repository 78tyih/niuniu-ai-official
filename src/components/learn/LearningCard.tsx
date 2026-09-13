import { Link } from 'react-router'
import type { LearningArticle } from '../../content/learn'
import { TRACK_NAME } from '../../content/learn'

export default function LearningCard({ article }: { article: LearningArticle }) {
  return (
    <Link
      to={`/learn/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#eceae6] bg-white transition-shadow hover:shadow-[0_8px_28px_rgba(17,17,17,0.08)]"
    >
      {article.video && (
        <div className="relative aspect-video w-full overflow-hidden bg-[#f3f4f6]">
          <img
            src={article.video.poster}
            alt={`${article.title} 教程封面`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-[0_4px_14px_rgba(17,17,17,0.18)] transition-transform group-hover:scale-110">
              <svg
                className="h-4 w-4 translate-x-[1px] text-[#111111]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <span className="absolute bottom-2 right-2 rounded bg-[#0b1724]/80 px-1.5 py-0.5 font-mono text-[11px] text-white">
            {Math.round(article.video.durationSeconds)}s
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-medium tracking-[0.04em] text-[#9ca3af]">
          {TRACK_NAME[article.track]}
        </div>

        <h3 className="mt-2 font-display text-[16px] font-bold leading-snug text-[#111111]">
          {article.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6b7280]">
          {article.shortAnswer}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-[12px] text-[#9ca3af]">
          {article.video && <span>含视频</span>}
          <span>{article.readingMinutes} 分钟</span>
          <span>{article.difficulty}</span>
        </div>

        <div className="mt-3 text-[13px] font-medium text-[#f97316]">
          查看教程
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  )
}
