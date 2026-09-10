import type { LearningStep as LearningStepData } from '../../content/learn'

const CALLOUT_STYLE: Record<string, { label: string; box: string; text: string }> = {
  info: { label: '说明', box: 'border-[#dbeafe] bg-[#f5f9ff]', text: '#1d4ed8' },
  important: { label: '重要', box: 'border-[#fed7aa] bg-[#fff8f1]', text: '#c2410c' },
  warning: { label: '注意', box: 'border-[#fecaca] bg-[#fff5f5]', text: '#b91c1c' },
  tip: { label: '提示', box: 'border-[#bbf7d0] bg-[#f4fdf7]', text: '#15803d' },
}

export default function LearningStep({ step, index }: { step: LearningStepData; index: number }) {
  const callout = step.callout ? CALLOUT_STYLE[step.callout.type] : null

  return (
    <section className="border-t border-[#eceae6] pt-8 first:border-t-0 first:pt-0" id={step.id}>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[13px] font-semibold tabular-nums text-[#f97316]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-display text-[17px] font-bold leading-snug text-[#111111]">{step.title}</h3>
      </div>

      <p className="mt-3 text-[16px] leading-[1.8] text-[#374151]">{step.body}</p>

      {step.image && (
        <img
          src={step.image}
          alt={step.title}
          loading="lazy"
          className="mt-4 w-full rounded-lg border border-[#eceae6]"
        />
      )}

      {callout && step.callout && (
        <div className={`mt-4 rounded-lg border px-4 py-3 ${callout.box}`}>
          <div className="text-[12px] font-semibold" style={{ color: callout.text }}>
            {callout.label}
          </div>
          <p className="mt-1 text-[14px] leading-relaxed text-[#374151]">{step.callout.text}</p>
        </div>
      )}

      {step.expectedResult && (
        <div className="mt-4 flex gap-2.5 rounded-lg bg-[#fafaf8] px-4 py-3">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-[#15803d]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="text-[12px] font-semibold text-[#15803d]">你应该看到</div>
            <p className="mt-0.5 text-[14px] leading-relaxed text-[#374151]">{step.expectedResult}</p>
          </div>
        </div>
      )}
    </section>
  )
}
