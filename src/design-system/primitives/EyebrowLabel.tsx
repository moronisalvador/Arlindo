import type { ReactNode } from 'react'
import { cn } from '@shared/cn'

/** Small uppercase, letter-spaced orange label above a title (SCF motif). */
export function EyebrowLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={cn('eyebrow', className)}>{children}</span>
}
