import type { DerivedPresentation } from '@domain/model/derived'
import type { YearlyRow } from '@domain/model/presentation'
import { formatMoney, formatNumber, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { DataTable, type Column } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** Evenly samples rows down to `max` so the table always fits one slide. */
function sample<T>(rows: T[], max: number): T[] {
  if (rows.length <= max) return rows
  const step = (rows.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => rows[Math.round(i * step)])
}

/**
 * Term premium schedule: Policy Year · Age · Guaranteed Premium · Guaranteed Death
 * Benefit — the exact four columns of a term illustration ledger. No cash value.
 */
export function TermScheduleSlide({ derived }: { derived: DerivedPresentation }) {
  const currency = derived.meta.currency
  const t = slideCopy(derived.meta.language).term
  const locale = localeFor(derived.meta.language)
  const rows = sample(derived.table, 16)

  const columns: Array<Column<YearlyRow>> = [
    { key: 'year', header: t.schedule.year, render: (r) => formatNumber(r.policyYear, { locale }) },
    { key: 'age', header: t.schedule.age, render: (r) => (r.age != null ? formatNumber(r.age, { locale }) : '—') },
    {
      key: 'premium',
      header: t.schedule.premium,
      align: 'right',
      emphasize: true,
      render: (r) => formatMoney(r.premiumPaid, currency, { locale }),
    },
    {
      key: 'death',
      header: t.schedule.death,
      align: 'right',
      render: (r) => formatMoney(r.deathBenefit, currency, { locale }),
    },
  ]

  return (
    <ContentSlide eyebrow={t.schedule.eyebrow} title={t.schedule.title}>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => String(r.policyYear)}
        highlightRow={(r) => derived.headline.termLengthYears === r.policyYear}
      />
    </ContentSlide>
  )
}
