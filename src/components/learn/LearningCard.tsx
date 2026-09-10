import { Link } from 'react-router'
import type { LearningArticle } from '../../content/learn'
import { TRACK_NAME } from '../../content/learn'

export default function LearningCard({ article }: { article: LearningArticle }) {
  return (
    <Link
      to={`/learn/${article.slug}`}
      className="group flex h-full flex-col rounded-xl border border-[#eceae6] bg-white p-5 transition-shadow hover:shadow-[0_8px_28px_rgba(17,17,17,0.08)]"
    >
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
        {article.video && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            {Math.round(article.video.durationSeconds)} 秒视频
          </span>
        )}
        <span>{article.readingMinutes} 分钟图文</span>
        <span>{article.difficulty}</span>
      </div>

      <div className="mt-3 text-[13px] font-medium text-[#f97316]">
        查看教程
        <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  )
}
