import type { ReactNode } from 'react'
import { cn } from '@shared/cn'
import { Button } from './Button'
import { Icon } from './Icon'

/** Loading state — forced everywhere a load is in flight (never a blank screen). */
export function Loading({ label = 'Carregando…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-muted', className)}>
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-orange" />
      <span className="font-sans text-base">{label}</span>
    </div>
  )
}

/** Empty state — a friendly prompt, optionally with a primary action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      {icon && <div className="text-4xl">{icon}</div>}
      <h3 className="font-serif text-2xl font-semibold text-navy">{title}</h3>
      {description && <p className="max-w-md text-base text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Error state — distinct from empty; never renders as success/blank. */
export function ErrorState({
  title = 'Algo deu errado.',
  description,
  onRetry,
  retryLabel = 'Tentar novamente',
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      <Icon name="warning" className="h-9 w-9 text-orange-dark" strokeWidth={1.5} />
      <h3 className="font-serif text-2xl font-semibold text-navy">{title}</h3>
      {description && <p className="max-w-md text-base text-muted">{description}</p>}
      {onRetry && (
        <Button variant="ghost" size="md" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
