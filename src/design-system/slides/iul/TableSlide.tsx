import type { DerivedPresentation } from '@domain/model/derived'
import type { YearlyRow } from '@domain/model/presentation'
import { formatMoney, formatNumber, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { DataTable, type Column } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'
import { sampleRows } from '../sampleRows'

/** Year-by-year detail table (sampled to fit; highlighted years get a tint). */
export function TableSlide({ derived }: { derived: DerivedPresentation }) {
  const currency = derived.meta.currency
  const c = slideCopy(derived.meta.language)
  const locale = localeFor(derived.meta.language)
  const rows = sampleRows(derived.table, 12)

  const columns: Array<Column<YearlyRow>> = [
    { key: 'year', header: c.table.year, render: (r) => formatNumber(r.policyYear, { locale }) },
    { key: 'age', header: c.table.age, render: (r) => (r.age != null ? formatNumber(r.age, { locale }) : '—') },
    {
      key: 'premium',
      header: c.table.premium,
      align: 'right',
      render: (r) => formatMoney(r.premiumPaid, currency, { locale }),
    },
    {
      key: 'accum',
      header: c.table.accumulated,
      align: 'right',
      emphasize: true,
      render: (r) => formatMoney(r.accumulatedValue, currency, { locale }),
    },
    {
      key: 'death',
      header: c.table.death,
      align: 'right',
      render: (r) => formatMoney(r.deathBenefit, currency, { locale }),
    },
  ]

  return (
    <ContentSlide eyebrow={c.table.eyebrow} title={c.table.title}>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => String(r.policyYear)}
        highlightRow={(r) => derived.headline.projectionYears === r.policyYear}
      />
    </ContentSlide>
  )
}
