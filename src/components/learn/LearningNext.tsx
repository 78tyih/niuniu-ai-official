import { Link } from 'react-router'
import type { LearningArticle } from '../../content/learn'

export default function LearningNext({ articles }: { articles: LearningArticle[] }) {
  if (!articles.length) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {articles.map((a) => (
        <Link
          key={a.id}
          to={`/learn/${a.slug}`}
          className="group rounded-xl border border-[#eceae6] bg-white p-5 transition-shadow hover:shadow-[0_8px_28px_rgba(17,17,17,0.08)]"
        >
          <div className="text-[11px] font-medium tracking-[0.04em] text-[#9ca3af]">相关教程</div>
          <h3 className="mt-2 font-display text-[15px] font-bold leading-snug text-[#111111]">
            {a.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6b7280]">
            {a.shortAnswer}
          </p>
          <div className="mt-3 text-[13px] font-medium text-[#f97316]">
            查看
            <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
