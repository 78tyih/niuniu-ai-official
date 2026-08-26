import { useState } from 'react'
import { Link } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import ConsoleMock from '../components/ConsoleMock'
import { HOME_CHAPTERS } from '../lib/chapters'

const STEPS = [
  { no: '01', name: '分析', title: 'AI 帮你看清行情', desc: '行情、指标与规则，整理成清晰的分析依据。' },
  { no: '02', name: '复核', title: '行动之前，再检查一次', desc: '按你的风险规则，独立复核交易条件。' },
  { no: '03', name: '确认', title: '最终决策，由你确认', desc: '确认、修改或拒绝，选择权始终在你。' },
  { no: '04', name: '复盘', title: '每一步，都可以回看', desc: '分析、审核与交易记录，汇入同一条时间线。' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#14171f]">
      <Nav />

      {/* 01 Hero */}
      <section className="overflow-hidden pt-32 pb-20 sm:pt-40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="micro-label flex items-center gap-3 text-[#b0a89c]">
              <span className="h-px w-8 bg-[#d8d4cb]" />
              AI TRADING COPILOT FOR MT5
            </div>
            <h1 className="font-display mt-6 text-4xl leading-[1.15] font-bold sm:text-5xl">
              牛牛 AI，<br />让你的交易更智能
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#5b6170]">
              连接你的 MT5，让 AI 帮你分析行情、复核风险，做出智能决策。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/demo"
                className="rounded-xl bg-[#ff6a1a] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(255,106,26,0.55)] transition-all hover:bg-[#f45d0d]"
              >
                观看演示
              </Link>
              <Link
                to="/support"
                className="rounded-xl border border-[#d8d4cb] px-7 py-3.5 text-sm font-semibold text-[#3f4756] transition-all hover:border-[#14171f]"
              >
                咨询客服
              </Link>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[#9aa0ad]">
              不同 MT5 环境可能存在差异，连接前可联系客服协助确认。
            </p>
          </div>
          <div className="lg:translate-x-6 lg:scale-[1.06]">
            <ConsoleMock />
          </div>
        </div>
      </section>

      {/* 02 四步流程 */}
      <section id="workflow" className="scroll-mt-20 border-t border-[#eceae4] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="micro-label text-[#b0a89c]">WORKFLOW</div>
          <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl">从分析到复盘，AI 与你并肩决策</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5b6170]">
            AI 提供分析和复核，最终决策由你确认，每步过程可回看、可复盘。
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.no} className="card-light group rounded-2xl p-6 transition-all hover:border-[#14171f]/30">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm text-[#c9c4b9]">{s.no}</span>
                  <span className="micro-label text-[10px] text-[#b0a89c] group-hover:text-[#ff6a1a]">{s.name}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#6b7280]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 产品演示剧场 */}
      <section className="border-t border-[#eceae4] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="micro-label text-[#b0a89c]">DEMO THEATER</div>
          <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl">产品演示剧场</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5b6170]">
            五个关键章节，了解牛牛 AI 的完整工作流程。
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            {/* 章节列表 */}
            <div className="space-y-2.5">
              {HOME_CHAPTERS.map((c) => (
                <Link
                  key={c.no}
                  to={`/demo#${c.slug}`}
                  className="card-light group flex items-center gap-4 rounded-xl px-5 py-4 transition-all hover:border-[#14171f]/30"
                >
                  <span className="font-mono text-sm text-[#c9c4b9]">{c.no}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{c.title}</div>
                    <div className="mt-0.5 text-xs text-[#8a8f9c]">{c.desc}</div>
                  </div>
                  <span className="text-[#c9c4b9] transition-all group-hover:translate-x-0.5 group-hover:text-[#ff6a1a]">→</span>
                </Link>
              ))}
              <Link
                to="/demo"
                className="block rounded-xl border border-dashed border-[#d8d4cb] px-5 py-4 text-center text-sm font-medium text-[#6b7280] transition-all hover:border-[#ff6a1a] hover:text-[#ff6a1a]"
              >
                查看全部 10 个章节 →
              </Link>
            </div>

            {/* 剧场画面 */}
            <Link to="/demo" className="group relative block">
              <div className="ink-panel relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl">
                <div className="absolute inset-0 opacity-40">
                  <ConsoleMock className="h-full w-full rounded-none border-0 shadow-none" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/90 via-[#0a0f1a]/30 to-transparent" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6a1a] shadow-[0_10px_40px_-8px_rgba(255,106,26,0.7)] transition-transform group-hover:scale-105">
                  <svg className="ml-1 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="absolute bottom-5 left-6">
                  <div className="text-sm font-semibold text-white">01 · 连接 MT5</div>
                  <div className="mt-1 text-xs text-[#8fa0c0]">默认静音 · 字幕 · 倍速</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 04 核心能力 */}
      <Capabilities />

      {/* 05 信任边界 */}
      <section className="border-t border-[#eceae4] py-14">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
          <p className="text-sm font-medium text-[#3f4756]">
            连接你自己的 MT5 <span className="mx-3 text-[#d8d4cb]">｜</span> 最终决策由你确认
            <span className="mx-3 text-[#d8d4cb]">｜</span> 整个过程可以回看
          </p>
          <Link to="/support" className="mt-3 inline-block text-xs text-[#9aa0ad] underline underline-offset-4 hover:text-[#14171f]">
            了解数据与隐私 →
          </Link>
        </div>
      </section>

      {/* 06 转化区（整屏橙色） */}
      <section className="bg-[#ff6a1a] py-24 text-white sm:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="micro-label text-white/60">GET STARTED</div>
          <h2 className="font-display mt-5 text-3xl font-bold sm:text-5xl">现在，看看牛牛 AI 如何工作</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="rounded-xl bg-[#0a0f1a] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[#141b2e]"
            >
              观看完整演示
            </Link>
            <Link
              to="/support"
              className="rounded-xl border border-white/60 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              咨询客服
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/80">
            <Link to="/support#community" className="underline underline-offset-4 hover:text-white">加入使用社群</Link>
            <span className="text-white/40">·</span>
            <Link to="/support#faq" className="underline underline-offset-4 hover:text-white">查看常见问题</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/** 04 核心能力：三个轻交互卡片 */
function Capabilities() {
  return (
    <section className="border-t border-[#eceae4] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="micro-label text-[#b0a89c]">CAPABILITIES</div>
        <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl">核心能力</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5b6170]">
          三大核心能力，帮你建立更清晰、更有纪律的交易过程。
        </p>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <CompareCard />
          <ReviewCard />
          <ConfirmCard />
        </div>
      </div>
    </section>
  )
}

/** 看清行情：拖动分割线对比 */
function CompareCard() {
  const [pos, setPos] = useState(55)
  return (
    <div className="card-light rounded-2xl p-6">
      <h3 className="text-lg font-bold">看清行情</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
        行情、周期、指标与规则，集中到一个分析视图。
      </p>
      <div className="ink-panel relative mt-6 h-44 select-none overflow-hidden rounded-xl">
        {/* 原始行情 */}
        <div className="absolute inset-0 p-4">
          <svg viewBox="0 0 200 80" className="h-full w-full opacity-50">
            <path d="M0 60 L20 55 L40 62 L60 48 L80 58 L100 40 L120 52 L140 36 L160 46 L180 30 L200 38" fill="none" stroke="#5b6b8c" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-3 left-4 text-[10px] text-[#5b6b8c]">原始行情</span>
        </div>
        {/* AI 整理后 */}
        <div className="absolute inset-0 p-4" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <div className="absolute inset-0 bg-[#0a0f1a]" />
          <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full p-4">
            <path d="M0 60 L20 55 L40 62 L60 48 L80 58 L100 40 L120 52 L140 36 L160 46 L180 30 L200 38" fill="none" stroke="#38b6ff" strokeWidth="1.8" />
            <circle cx="100" cy="40" r="3" fill="none" stroke="#ff6a1a" strokeWidth="1.5" />
            <circle cx="180" cy="30" r="3" fill="none" stroke="#ff6a1a" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-3 right-4 text-[10px] text-[#38b6ff]">AI 整理后</span>
        </div>
        {/* 分割手柄 */}
        <div className="absolute inset-y-0 w-px bg-white/70" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 left-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#0a0f1a] shadow">
            ⇔
          </div>
        </div>
        <input
          type="range"
          min={8}
          max={92}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="拖动对比原始行情与 AI 整理后"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="mt-3 text-xs text-[#9aa0ad]">拖动分割线，对比「原始行情 / AI 整理后」</p>
    </div>
  )
}

/** 独立复核：切换风险条件 */
function ReviewCard() {
  const [strict, setStrict] = useState(false)
  const items = [
    { name: '仓位比例 ≤ 10%', pass: true },
    { name: '已设置止损', pass: true },
    { name: '避开高风险时段', pass: !strict },
  ]
  const allPass = items.every((i) => i.pass)
  return (
    <div className="card-light rounded-2xl p-6">
      <h3 className="text-lg font-bold">独立复核</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
        在行动前，根据你的条件重新检查风险。
      </p>
      <div className="ink-panel mt-6 h-44 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#5b6b8c]">AI-2 风险审核</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${allPass ? 'bg-[#38b6ff]/15 text-[#38b6ff]' : 'bg-[#ff6a1a]/15 text-[#ff6a1a]'}`}>
            {allPass ? '全部通过' : '存在未满足条件'}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {items.map((i) => (
            <div key={i.name} className="flex items-center justify-between rounded bg-[#0f1626] px-2.5 py-1.5 text-[11px]">
              <span className="text-[#8fa0c0]">{i.name}</span>
              <span className={i.pass ? 'text-[#38b6ff]' : 'text-[#ff6a1a]'}>{i.pass ? '通过' : '未满足'}</span>
            </div>
          ))}
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-xs text-[#6b7280]">
        <button
          onClick={() => setStrict(!strict)}
          className={`relative h-5 w-9 rounded-full transition-colors ${strict ? 'bg-[#ff6a1a]' : 'bg-[#d8d4cb]'}`}
          aria-pressed={strict}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${strict ? 'left-4.5' : 'left-0.5'}`} style={{ left: strict ? 18 : 2 }} />
        </button>
        切换风险条件：{strict ? '已开启「高风险时段过滤」' : '未开启「高风险时段过滤」'}
      </label>
    </div>
  )
}

/** 人工确认：悬停查看流程去向 */
function ConfirmCard() {
  const [hover, setHover] = useState<string | null>(null)
  const actions = [
    { key: 'confirm', label: '确认', hint: '按当前方案执行，记录进入复盘时间线', cls: 'bg-[#ff6a1a] text-white' },
    { key: 'modify', label: '修改', hint: '调整参数后返回 AI-2 重新审核', cls: 'border border-[#d8d4cb] text-[#3f4756]' },
    { key: 'reject', label: '拒绝', hint: '终止本次方案，原因写入复盘日志', cls: 'border border-[#d8d4cb] text-[#3f4756]' },
  ]
  return (
    <div className="card-light rounded-2xl p-6">
      <h3 className="text-lg font-bold">人工确认</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
        AI 帮你分析与复核，最后一步仍由你决定。
      </p>
      <div className="ink-panel mt-6 flex h-44 flex-col justify-center rounded-xl p-4">
        <div className="rounded bg-[#0f1626] px-3 py-2 text-[11px] text-[#8fa0c0]">
          XAUUSD · 买入 0.1 手 · 止损 2330.0
          <div className="mt-1 text-[10px] text-[#38b6ff]">AI-2 审核：全部通过</div>
        </div>
        <div className="mt-3 flex gap-2">
          {actions.map((a) => (
            <button
              key={a.key}
              onMouseEnter={() => setHover(a.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(a.key)}
              onBlur={() => setHover(null)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${a.cls}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 min-h-4 text-xs text-[#9aa0ad]">
        {hover ? actions.find((a) => a.key === hover)?.hint : '悬停「确认 / 修改 / 拒绝」查看流程去向'}
      </p>
    </div>
  )
}
