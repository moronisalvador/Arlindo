import { formatMoney } from '@domain/format'
import type { CurrencyCode } from '@domain/model/presentation'
import { cn } from '@shared/cn'

export interface CurrencyDisplayProps {
  amount: number | null | undefined
  currency?: CurrencyCode
  compact?: boolean
  className?: string
}

/** Big serif money value, formatted with pt-BR grouping and the product currency. */
export function CurrencyDisplay({
  amount,
  currency = 'USD',
  compact,
  className,
}: CurrencyDisplayProps) {
  return (
    <span className={cn('font-serif font-semibold tabular-nums', className)}>
      {formatMoney(amount, currency, { compact })}
    </span>
  )
}
