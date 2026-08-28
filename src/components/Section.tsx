import type { ReactNode } from 'react'

/**
 * 全站统一 Spacing System。
 * 禁止各 Section 自行使用随机 padding —— 一律经过这里。
 *
 * Desktop:  Hero 96px / Default 80px / Compact 60px（垂直）
 * Mobile:   Hero 64px / Default 52px / Compact 44px
 * Section 之间不依靠巨大空白区分，可用极浅 border / 背景变化。
 */
export default function Section({
  variant = 'default',
  tinted = false,
  bordered = false,
  id,
  className = '',
  children,
}: {
  variant?: 'hero' | 'default' | 'compact'
  tinted?: boolean
  bordered?: boolean
  id?: string
  className?: string
  children: ReactNode
}) {
  const pad =
    variant === 'hero'
      ? 'py-[64px] sm:py-[96px]'
      : variant === 'compact'
        ? 'py-[44px] sm:py-[60px]'
        : 'py-[52px] sm:py-[80px]'
  return (
    <section
      id={id}
      className={`${pad} ${tinted ? 'bg-white' : ''} ${bordered ? 'border-t border-[#eceae6]' : ''} ${className}`}
    >
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10">{children}</div>
    </section>
  )
}

/** Section 标题组（统一左对齐编辑式） */
export function SectionHead({
  title,
  desc,
  className = '',
}: {
  title: string
  desc?: string
  className?: string
}) {
  return (
    <div className={`reveal max-w-2xl ${className}`}>
      <h2 className="font-display text-[28px] font-bold leading-tight sm:text-[36px]">{title}</h2>
      {desc && <p className="mt-3 text-[15px] leading-relaxed text-[#6b7280]">{desc}</p>}
    </div>
  )
}
