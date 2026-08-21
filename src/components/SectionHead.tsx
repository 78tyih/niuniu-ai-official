interface SectionHeadProps {
  eyebrow: string
  title: React.ReactNode
  desc?: string
  align?: 'left' | 'center'
}

export default function SectionHead({
  eyebrow,
  title,
  desc,
  align = 'center',
}: SectionHeadProps) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`reveal max-w-3xl ${alignCls}`}>
      <div
        className={`inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-sky-400 uppercase ${
          align === 'center' ? 'justify-center' : ''
        }`}
      >
        <span className="h-px w-6 bg-sky-400/60" />
        {eyebrow}
        <span className="h-px w-6 bg-sky-400/60" />
      </div>
      <h2 className="font-display mt-4 text-3xl leading-tight font-bold text-slate-100 sm:text-4xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-4 text-base leading-relaxed text-slate-400">{desc}</p>
      )}
    </div>
  )
}
