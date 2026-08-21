import { useState } from 'react'
import SectionHead from '../components/SectionHead'

const shots = [
  { src: '/assets/image2.png', label: '实时面板', desc: '智能K线周期、指标筛选、账户状态与一键布局入口' },
  { src: '/assets/image3.png', label: 'AI 模型设置', desc: 'AI-1 分析、AI-2 风险审核、AI-3 持仓诊断是否参与流程' },
  { src: '/assets/image9.png', label: 'AI 分析', desc: '获取截图、填写提示词、生成分析报告' },
  { src: '/assets/image12.png', label: '克隆分析师', desc: '把你的指标、周期分工与风格整理成三类提示词' },
  { src: '/assets/image6.png', label: 'AI 日志', desc: '每次分析的继续、跳过、拒绝与原因，全部留痕' },
  { src: '/assets/image4.png', label: '风控设置', desc: '每日风控、止损止盈追踪与周期风控' },
  { src: '/assets/image5.png', label: '过滤设置', desc: '新闻过滤与交易时段过滤，避开高波动时段' },
  { src: '/assets/image10.png', label: '一键布局确认', desc: '选择方案、调整价格与手数并提交校验' },
]

export default function Screens() {
  const [active, setActive] = useState(0)
  const shot = shots[active]

  return (
    <section id="screens" className="relative scroll-mt-16 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="真实界面"
          title={
            <>
              看到的，就是<span className="text-gradient-cyan">实际在用的</span>
            </>
          }
          desc="以下均为真实客户端界面（含产品手册标注），界面版本以实际客户端为准。"
        />

        <div className="reveal mt-12 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {shots.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                i === active
                  ? 'border-sky-400/60 bg-sky-400/10 text-sky-200'
                  : 'border-[#1b2740] bg-[#0a1120] text-slate-400 hover:border-sky-400/30 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="reveal card-line mt-5 overflow-hidden rounded-2xl shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-[#1b2740] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2a3a5c]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2a3a5c]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2a3a5c]" />
            <span className="ml-3 rounded-md bg-[#111c33] px-3 py-1 text-[11px] text-slate-500">
              牛牛AI · {shot.label}
            </span>
          </div>
          <div className="bg-[#070b16]">
            <img
              key={shot.src}
              src={shot.src}
              alt={`牛牛AI ${shot.label}界面`}
              className="mx-auto max-h-[560px] w-auto max-w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="border-t border-[#1b2740] px-6 py-4">
            <p className="text-sm text-slate-400">{shot.desc}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
