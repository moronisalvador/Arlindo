import type { ReactNode } from 'react'
import { cn } from '@shared/cn'

/**
 * A large-touch collapsible section for the data-entry editor. The header shows a
 * numbered step circle (a check once the section has data), the title, and a short
 * summary when collapsed — so an older user always sees progress without an
 * enormous single scroll. One section is open at a time (accordion, controlled by
 * the parent).
 */
export function CollapsibleSection({
  step,
  title,
  summary,
  complete = false,
  open,
  onToggle,
  children,
}: {
  step: string
  title: string
  summary?: ReactNode
  complete?: boolean
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-alt"
      >
        <span
          aria-hidden
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-sans text-xl font-bold',
            complete ? 'bg-navy text-white' : 'bg-orange text-navy',
          )}
        >
          {complete ? '✓' : step}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-xl font-semibold text-navy">{title}</span>
          {summary != null && !open && (
            <span className="mt-0.5 block truncate text-base text-muted">{summary}</span>
          )}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cn(
            'h-6 w-6 shrink-0 text-muted transition-transform',
            open && 'rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div className="border-t border-line px-5 py-5">{children}</div>}
    </div>
  )
}
