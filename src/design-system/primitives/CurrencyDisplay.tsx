import { formatMoney } from '@domain/format'
import type { CurrencyCode } from '@domain/model/presentation'
import { cn } from '@shared/cn'

export interface CurrencyDisplayProps {
  amount: number | null | undefined
  currency?: CurrencyCode
  compact?: boolean
  locale?: string
  className?: string
}

/** Big serif money value, formatted with the given locale's grouping + product currency. */
export function CurrencyDisplay({
  amount,
  currency = 'USD',
  compact,
  locale,
  className,
}: CurrencyDisplayProps) {
  return (
    <span className={cn('font-serif font-semibold tabular-nums', className)}>
      {formatMoney(amount, currency, { compact, locale })}
    </span>
  )
}
