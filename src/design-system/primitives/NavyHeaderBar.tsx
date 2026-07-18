import type { ReactNode } from 'react'
import { cn } from '@shared/cn'
import { EyebrowLabel } from './EyebrowLabel'
import { BrandLogo } from './BrandLogo'

export interface NavyHeaderBarProps {
  eyebrow?: string
  title: ReactNode
  right?: ReactNode
  showLogo?: boolean
  className?: string
}

/** Navy top bar: orange eyebrow + white serif title, logo chip top-right (SCF motif). */
export function NavyHeaderBar({
  eyebrow,
  title,
  right,
  showLogo = true,
  className,
}: NavyHeaderBarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 bg-navy px-6 py-4', className)}>
      <div className="min-w-0">
        {eyebrow && <EyebrowLabel>{eyebrow}</EyebrowLabel>}
        <h2 className="truncate font-serif text-2xl font-semibold text-white">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {right}
        {showLogo && (
          <span className="rounded-lg bg-white px-2 py-1">
            <BrandLogo variant="color" className="h-7" />
          </span>
        )}
      </div>
    </div>
  )
}
