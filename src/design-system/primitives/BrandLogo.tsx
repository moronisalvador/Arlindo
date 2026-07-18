import { cn } from '@shared/cn'

/**
 * Placeholder SCF wordmark until the real logo asset is provided. Swap this one
 * component (drop in the SVG/PNG) and the header chip, cover, and PDF all update.
 * `color` = for light backgrounds; `light` = for the navy background.
 */
export function BrandLogo({
  variant = 'color',
  className,
}: {
  variant?: 'color' | 'light'
  className?: string
}) {
  const mono = variant === 'light' ? 'text-white' : 'text-navy'
  const accent = 'text-orange'
  return (
    <span className={cn('inline-flex items-center gap-1.5 leading-none', className)}>
      <span className={cn('font-serif text-xl font-bold tracking-tight', accent)}>SCF</span>
      <span className={cn('font-sans text-[0.6rem] font-semibold uppercase leading-tight', mono)}>
        Second
        <br />
        Chance
        <br />
        Financial
      </span>
    </span>
  )
}
