import { useState } from 'react'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import ConsoleMock from '../components/ConsoleMock'

const TABS = [
  {
    key: 'analyze',
    name: '分析',
    title: 'AI 帮你看清行情',
    desc: '读取行情，叠加你的指标与规则，生成分析结论与关键位置。',
  },
  {
    key: 'review',
    name: '复核',
    title: '行动之前，再检查一次',
    desc: '风险项目逐条检查，不满足的条件以橙色标出。',
  },
  {
    key: 'confirm',
    name: '确认',
    title: '最终决策，由你确认',
    desc: '确认面板成为唯一橙色焦点：确认、修改或拒绝。',
  },
  {
    key: 'replay',
    name: '复盘',
    title: '每一步，都可以回看',
    desc: '日志与历史订单关联，经验可以积累。',
  },
]

export default function Product() {
  const [tab, setTab] = useState(TABS[0])

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#14171f]">
      <Nav />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8">
        <div className="micro-label text-[#b0a89c]">WORKFLOW</div>
        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">工作流程</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5b6170]">牛牛 AI 的四步工作流程。</p>

        {/* Tabs */}
        <div className="mt-10 flex gap-2 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2.5 rounded-xl border px-5 py-3 whitespace-nowrap transition-all ${
                tab.key === t.key
                  ? 'border-[#14171f] bg-white shadow-sm'
                  : 'border-[#e8e6e0] bg-white/60 text-[#6b7280] hover:border-[#c9c4b9]'
              }`}
            >
              <span className={`font-mono text-xs ${tab.key === t.key ? 'text-[#ff6a1a]' : 'text-[#c9c4b9]'}`}>
                0{i + 1}
              </span>
              <span className="text-sm font-semibold">{t.name}</span>
            </button>
          ))}
        </div>

        {/* 中央界面 + 标注 */}
        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
          <ConsoleMock />
          <div>
            <h2 className="font-display text-2xl font-bold">{tab.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5b6170]">{tab.desc}</p>
            <div className="mt-6 space-y-2.5">
              {TABS.map((t) => (
                <div
                  key={t.key}
                  className={`flex items-center gap-3 text-sm ${t.key === tab.key ? 'text-[#14171f]' : 'text-[#b0a89c]'}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${t.key === tab.key ? 'bg-[#ff6a1a]' : 'bg-[#d8d4cb]'}`} />
                  {t.name} — {t.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mx-auto mt-16 max-w-2xl text-center text-xs leading-relaxed text-[#9aa0ad]">
          网络、券商接口、报价差异和市场波动可能影响实际执行；流程辅助不能消除交易风险。
        </p>
      </main>
      <Footer />
    </div>
  )
}
