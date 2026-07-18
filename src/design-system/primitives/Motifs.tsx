import { cn } from '@shared/cn'

/** Orange "VS" circle placed between two compared options (SCF motif). */
export function VsBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange',
        'font-sans text-sm font-bold uppercase text-white shadow-card',
        className,
      )}
    >
      vs
    </span>
  )
}

/** Numbered step circle for "próximos passos" lists (SCF motif). */
export function StepCircle({
  n,
  tone = 'navy',
  className,
}: {
  n: number
  tone?: 'navy' | 'white'
  className?: string
}) {
  const styles =
    tone === 'white'
      ? 'bg-white text-navy'
      : 'bg-navy text-white'
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        'font-serif text-lg font-bold',
        styles,
        className,
      )}
    >
      {n}
    </span>
  )
}

/**
 * Large decorative circle / quarter-circle used in corners (SCF motif).
 * Purely visual; place inside a `relative overflow-hidden` container.
 */
export function DecorativeCircle({
  className,
  tone = 'navy-soft',
}: {
  className?: string
  tone?: 'navy-soft' | 'orange'
}) {
  const color = tone === 'orange' ? 'bg-orange' : 'bg-navy-soft'
  return (
    <span
      aria-hidden
      className={cn('pointer-events-none absolute rounded-full opacity-60', color, className)}
    />
  )
}
