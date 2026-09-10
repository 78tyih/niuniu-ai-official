import { useState } from 'react'
import type { LearningFAQ as LearningFAQData } from '../../content/learn'

export default function LearningFAQ({ items }: { items: LearningFAQData[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!items.length) return null

  return (
    <div className="divide-y divide-[#eceae6] overflow-hidden rounded-xl border border-[#eceae6] bg-white">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.question}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#fafaf8]"
            >
              <span className="text-[15px] font-medium text-[#111111]">{item.question}</span>
              <svg
                className={`mt-1 h-4 w-4 shrink-0 text-[#9ca3af] transition-transform ${isOpen ? 'rotate-45' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            {isOpen && (
              <p className="px-5 pb-5 text-[15px] leading-[1.8] text-[#374151]">{item.answer}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
