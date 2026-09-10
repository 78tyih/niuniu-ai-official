import { Link } from 'react-router'
import type { LearningTrackMeta } from '../../content/learn'
import { getArticlesByTrack } from '../../content/learn'

export default function LearningTrackCard({ track }: { track: LearningTrackMeta }) {
  const count = getArticlesByTrack(track.id).length

  return (
    <Link
      to={`/learn/${track.id}`}
      className="group flex flex-col rounded-xl border border-[#eceae6] bg-white p-5 transition-shadow hover:shadow-[0_8px_28px_rgba(17,17,17,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[16px] font-bold text-[#111111]">{track.name}</h3>
        <span className="shrink-0 text-[12px] text-[#9ca3af]">{count} 篇</span>
      </div>
      <p className="mt-2 text-[14px] font-medium text-[#f97316]">{track.question}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6b7280]">{track.description}</p>
      <div className="mt-auto pt-4 text-[13px] font-medium text-[#111111]">
        进入
        <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  )
}
