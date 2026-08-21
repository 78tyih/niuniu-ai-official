import SectionHead from '../components/SectionHead'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: '牛牛AI 是什么？',
    a: '一款连接 MT5 交易环境的 AI 交易辅助系统。它把行情分析、风险审核、人工确认与交易复盘，组织在同一套工作流程中——不是脱离你交易环境的"信号机"。',
  },
  {
    q: '它是自动赚钱软件吗？',
    a: '不是。牛牛AI 不承诺任何收益，AI 输出仅供辅助参考。所有交易决策由你自己做出，风险也由你自己承担。如果有人向你承诺"稳赚"，那一定不是我们。',
  },
  {
    q: '它和普通 AI 聊天工具有什么不同？',
    a: '普通 AI 聊天工具不了解你的交易环境。牛牛AI 连接你授权的 MT5 账户，能结合真实行情、你的指标与 Prompt 规则、以及你的历史订单进行分析、审核与复盘。',
  },
  {
    q: '行情数据从哪里来？',
    a: '来自你自己连接的 MT5 及其经纪商，牛牛AI 不自行定价、不提供行情。不同平台之间报价存在差异，通常与经纪商、品种、时区和延迟有关。',
  },
  {
    q: '支持所有 MT5 和券商吗？',
    a: '我们不这样承诺。原则上 MT5 环境均可连接，但个别券商的接口限制可能成为例外——所以建议先用页面的"兼容性检测"入口确认你的环境，再决定是否使用。',
  },
  {
    q: 'AI 会自动替我下单吗？最终由谁确认？',
    a: '分析与审核都只是辅助环节，最终由你确认。你可以在设置中决定 AI-2 风险审核、AI-3 持仓诊断是否参与流程，并通过风控设置限制每日交易次数、最大持仓与止损止盈边界。',
  },
  {
    q: 'AI-2 审核通过，就代表这笔交易安全吗？',
    a: '不代表。审核只是工作流程中的一道独立复核，用来检查交易条件和你的规则。市场、模型、网络和执行风险依然存在，审核通过不等于盈利保证。',
  },
  {
    q: '什么样的人不适合用牛牛AI？',
    a: '只想得到一个确定买卖答案的人；希望软件保证收益、或代替自己承担亏损的人；不愿学习基础交易风险和账户操作的人。如果你属于以上情况，建议先了解风险教育内容，再考虑是否使用。',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="relative scroll-mt-16 bg-[#080e1c] py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="常见问题"
          title={
            <>
              先把问题问清楚，
              <span className="text-gradient-cyan">再决定也不迟</span>
            </>
          }
          desc="以下回答基于当前产品资料整理，正式承诺以用户协议与正式版本为准。"
        />

        <div className="reveal mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                className="card-line overflow-hidden rounded-xl border px-6 transition-colors data-[state=open]:border-sky-400/40"
              >
                <AccordionTrigger className="py-5 text-left text-[15px] font-semibold text-slate-200 hover:text-sky-300 hover:no-underline [&[data-state=open]>svg]:text-sky-300">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-400">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-8 text-center text-sm text-slate-500">
            没有找到你的问题？
            <a href="#cta" className="ml-1 text-sky-300 underline decoration-sky-700 underline-offset-4 transition-colors hover:text-sky-200">
              直接咨询我们
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
