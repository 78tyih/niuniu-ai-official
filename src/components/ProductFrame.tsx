/** 产品截图框：轻量浏览器窗口包裹真实产品截图 */
export default function ProductFrame({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#0b1724] shadow-[0_24px_60px_-32px_rgba(11,23,36,0.45)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-3 text-[11px] text-white/35">牛牛AI 控制台</span>
      </div>
      <img src={src} alt={alt} loading="lazy" className="block w-full" />
    </div>
  )
}
