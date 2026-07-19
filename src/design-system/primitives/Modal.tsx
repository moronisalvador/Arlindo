import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@shared/cn'

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal shell: dark scrim + centered panel with proper focus handling
 * — moves focus in on open, traps Tab inside, closes on Escape, and restores
 * focus to the trigger on close. Backdrop click closes. Pass `labelledBy` (the id
 * of the panel's heading) so the dialog has an accessible name.
 */
export function Modal({
  onClose,
  labelledBy,
  className,
  children,
}: {
  onClose: () => void
  labelledBy?: string
  className?: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus()
    return () => restoreRef.current?.focus?.()
  }, [])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    )
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-5"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={cn('w-full rounded-card bg-surface p-6 shadow-card focus:outline-none', className)}
      >
        {children}
      </div>
    </div>
  )
}
