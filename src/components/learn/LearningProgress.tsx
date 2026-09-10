import { Link } from 'react-router'
import type { LearningArticle } from '../../content/learn'

export default function LearningProgress({
  prev,
  next,
}: {
  prev?: LearningArticle
  next?: LearningArticle
}) {
  if (!prev && !next) return null

  return (
    <nav className="grid gap-4 border-t border-[#eceae6] pt-8 sm:grid-cols-2" aria-label="学习进度">
      {prev ? (
        <Link
          to={`/learn/${prev.slug}`}
          className="group rounded-xl border border-[#eceae6] bg-white px-5 py-4 transition-colors hover:border-[#f97316]"
        >
          <div className="text-[12px] text-[#9ca3af]">← 上一篇</div>
          <div className="mt-1 text-[15px] font-medium leading-snug text-[#111111]">{prev.title}</div>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          to={`/learn/${next.slug}`}
          className="group rounded-xl border border-[#eceae6] bg-white px-5 py-4 transition-colors hover:border-[#f97316] sm:text-right"
        >
          <div className="text-[12px] text-[#9ca3af]">下一篇 →</div>
          <div className="mt-1 text-[15px] font-medium leading-snug text-[#111111]">{next.title}</div>
        </Link>
      )}
    </nav>
  )
}
