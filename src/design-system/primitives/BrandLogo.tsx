import { cn } from '@shared/cn'

/**
 * The real Second Chance Financial logo (served from `public/scf-logo.png`).
 * It has a white background and is always shown inside a white chip (header,
 * cover, disclaimers), so the same asset serves every variant. Size via the
 * `className` height (e.g. `h-9`); width scales automatically.
 */
const LOGO_SRC = `${import.meta.env.BASE_URL}scf-logo.png`

export function BrandLogo({
  className,
}: {
  /** Kept for API compatibility; the real logo is used for every variant. */
  variant?: 'color' | 'light' | 'mark'
  className?: string
}) {
  return (
    <img
      src={LOGO_SRC}
      alt="Second Chance Financial"
      className={cn('inline-block h-8 w-auto object-contain', className)}
    />
  )
}
