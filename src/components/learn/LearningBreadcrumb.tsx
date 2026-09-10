import { Link } from 'react-router'

export default function LearningBreadcrumb({
  trackName,
  trackId,
  title,
}: {
  trackName?: string
  trackId?: string
  title?: string
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[13px] text-[#6b7280]" aria-label="面包屑">
      <Link to="/learn" className="transition-colors hover:text-[#111111]">
        学习
      </Link>
      {trackName && (
        <>
          <span className="text-[#d1d5db]">/</span>
          {trackId ? (
            <Link to={`/learn/${trackId}`} className="transition-colors hover:text-[#111111]">
              {trackName}
            </Link>
          ) : (
            <span>{trackName}</span>
          )}
        </>
      )}
      {title && (
        <>
          <span className="text-[#d1d5db]">/</span>
          <span className="line-clamp-1 text-[#9ca3af]">{title}</span>
        </>
      )}
    </nav>
  )
}
