import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@shared/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 'default' = white; 'alt' = light-gray; 'navy' = filled navy (recommended card). */
  tone?: 'default' | 'alt' | 'navy'
  /** Optional orange header strip with a title + optional icon (SCF motif). */
  headerStrip?: ReactNode
  headerIcon?: ReactNode
}

const tones = {
  default: 'bg-surface text-ink',
  alt: 'bg-surface-alt text-ink',
  navy: 'bg-navy text-white',
}

export function Card({
  tone = 'default',
  headerStrip,
  headerIcon,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-line/60 shadow-card',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {headerStrip && (
        <div className="flex items-center gap-2 bg-orange px-4 py-2 font-sans text-sm font-semibold text-navy">
          {headerIcon}
          <span>{headerStrip}</span>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
