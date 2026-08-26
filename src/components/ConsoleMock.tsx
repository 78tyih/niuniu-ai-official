/** 黑核控制台：代码绘制的牛牛AI产品界面嵌入面板 */
export default function ConsoleMock({ className = '' }: { className?: string }) {
  return (
    <div className={`ink-panel overflow-hidden rounded-xl shadow-[0_30px_80px_-30px_rgba(10,15,26,0.55)] ${className}`}>
      {/* 窗口栏 */}
      <div className="flex items-center gap-1.5 border-b border-[#1b2740] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#26334f]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#26334f]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#26334f]" />
        <span className="ml-3 text-[11px] tracking-wide text-[#5b6b8c]">牛牛AI · AI 交易工作台</span>
      </div>
      <div className="grid grid-cols-[104px_1fr_120px]">
        {/* 侧边菜单 */}
        <div className="border-r border-[#1b2740] py-3">
          {['智能分析', '风险审核', '持仓诊断', '交易复盘'].map((m, i) => (
            <div
              key={m}
              className={`mx-2 mb-1 rounded-md px-2.5 py-1.5 text-[11px] ${
                i === 0 ? 'bg-[#38b6ff]/12 text-[#38b6ff]' : 'text-[#5b6b8c]'
              }`}
            >
              {m}
            </div>
          ))}
        </div>
        {/* 图表区 */}
        <div className="p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] font-semibold text-[#dbe4f3]">XAUUSD · H1</span>
            <span className="text-[10px] text-[#38b6ff]">AI 分析完成</span>
          </div>
          <svg viewBox="0 0 240 96" className="w-full">
            <defs>
              <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38b6ff" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#38b6ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 78 L24 70 L48 74 L72 58 L96 62 L120 44 L144 50 L168 32 L192 38 L216 22 L240 26 L240 96 L0 96 Z" fill="url(#cyanFill)" />
            <path d="M0 78 L24 70 L48 74 L72 58 L96 62 L120 44 L144 50 L168 32 L192 38 L216 22 L240 26" fill="none" stroke="#38b6ff" strokeWidth="1.6" />
            <line x1="0" y1="52" x2="240" y2="52" stroke="#ff6a1a" strokeWidth="1" strokeDasharray="4 4" opacity="0.8" />
            <text x="226" y="48" fill="#ff6a1a" fontSize="7" textAnchor="end">风险线</text>
          </svg>
          <div className="mt-2 space-y-1">
            {['多周期趋势一致', '关键位置已标记', '波动率处于正常区间'].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-[10px] text-[#8fa0c0]">
                <span className="h-1 w-1 rounded-full bg-[#38b6ff]" />
                {t}
              </div>
            ))}
          </div>
        </div>
        {/* 确认面板 */}
        <div className="border-l border-[#1b2740] p-3">
          <div className="text-[10px] text-[#5b6b8c]">AI-2 风险审核</div>
          <div className="mt-1.5 space-y-1">
            {['仓位比例', '止损设置', '时段过滤'].map((t) => (
              <div key={t} className="rounded bg-[#0f1626] px-1.5 py-1 text-[9px] text-[#8fa0c0]">
                {t} <span className="float-right text-[#38b6ff]">通过</span>
              </div>
            ))}
          </div>
          <button className="mt-2.5 w-full rounded-md bg-[#ff6a1a] py-1.5 text-[10px] font-semibold text-white">
            人工确认
          </button>
          <div className="mt-1.5 text-center text-[9px] text-[#5b6b8c]">最终决策由你确认</div>
        </div>
      </div>
    </div>
  )
}
