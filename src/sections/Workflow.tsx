import { useState } from 'react'
import SectionHead from '../components/SectionHead'

const steps = [
  { n: '01', t: '连接', sys: '读取你授权的 MT5 账户与实例', you: '选择账户与客户端' },
  { n: '02', t: '输入', sys: '读取行情，叠加指标、周期与你的 Prompt', you: '检查分析依据' },
  { n: '03', t: '分析', sys: '生成市场状态、关键位置和风险提示', you: '核对假设与逻辑' },
  { n: '04', t: '审核', sys: '按交易条件和风险规则独立复核', you: '查看通过或拒绝的理由' },
  { n: '05', t: '确认', sys: '呈现方案与风险，等待你的决定', you: '接受、修改或拒绝' },
  { n: '06', t: '复盘', sys: '汇总 AI 日志与历史订单', you: '形成改进动作' },
]

export default function Workflow() {
  const [active, setActive] = useState(0)
  const step = steps[active]

  return (
    <section id="workflow" className="relative scroll-mt-16 bg-[#080e1c] py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="工作流程"
          title={
            <>
              从自己的 MT5 环境开始，
              <span className="text-gradient-cyan">一条可回看的流程</span>
            </>
          }
          desc="分析不等于执行，执行不等于收益。每一个环节都清晰分层、留痕可查。"
        />

        {/* step rail */}
        <div className="reveal mt-14 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {steps.map((s, i) => (
            <button
              key={s.n}
              onClick={() => setActive(i)}
              className={`group relative rounded-xl border px-3 py-4 text-left transition-all ${
                i === active
                  ? 'border-sky-400/60 bg-sky-400/10 shadow-[0_0_30px_-10px_rgba(56,189,248,0.5)]'
                  : 'border-[#1b2740] bg-[#0a1120] hover:border-sky-400/30'
              }`}
            >
              <div
                className={`text-[11px] font-bold tracking-widest ${
                  i === active ? 'text-sky-300' : 'text-slate-600'
                }`}
              >
                {s.n}
              </div>
              <div
                className={`mt-1 text-sm font-semibold ${
                  i === active ? 'text-slate-100' : 'text-slate-400'
                }`}
              >
                {s.t}
              </div>
              {i < steps.length - 1 && (
                <svg
                  className="absolute top-1/2 -right-2.5 hidden h-3 w-3 -translate-y-1/2 text-slate-600 sm:block"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* detail panel */}
        <div className="reveal card-line mt-6 overflow-hidden rounded-2xl">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-[#1b2740] p-8 md:border-r md:border-b-0">
              <div className="text-xs font-medium tracking-[0.18em] text-sky-400 uppercase">
                系统做什么
              </div>
              <p className="mt-3 text-lg leading-relaxed text-slate-200">{step.sys}</p>
            </div>
            <div className="p-8">
              <div className="text-xs font-medium tracking-[0.18em] text-orange-400 uppercase">
                你做什么
              </div>
              <p className="mt-3 text-lg leading-relaxed text-slate-200">{step.you}</p>
            </div>
          </div>
          <div className="border-t border-[#1b2740] bg-[#080d1a] px-8 py-4">
            <p className="text-xs leading-relaxed text-slate-500">
              网络、券商接口、报价差异和市场波动可能影响实际执行；流程辅助不能消除交易风险。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
