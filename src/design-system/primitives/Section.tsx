import type { ReactNode } from 'react'
import { cn } from '@shared/cn'
import { EyebrowLabel } from './EyebrowLabel'

/** A titled content block: eyebrow + serif heading + orange underline divider. */
export function Section({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {(eyebrow || title) && (
        <header className="space-y-1">
          {eyebrow && <EyebrowLabel>{eyebrow}</EyebrowLabel>}
          {title && (
            <h3 className="font-serif text-2xl font-semibold text-navy">
              {title}
              <span className="mt-2 block h-1 w-16 rounded-full bg-orange" />
            </h3>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
