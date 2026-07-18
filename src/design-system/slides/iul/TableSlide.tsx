import type { DerivedPresentation } from '@domain/model/derived'
import type { YearlyRow } from '@domain/model/presentation'
import { formatMoney, formatNumber } from '@domain/format'
import { DataTable, type Column } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'

/** Evenly samples rows down to `max` so the table always fits one slide. */
function sample<T>(rows: T[], max: number): T[] {
  if (rows.length <= max) return rows
  const step = (rows.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => rows[Math.round(i * step)])
}

/** Year-by-year detail table (sampled to fit; highlighted years get a tint). */
export function TableSlide({ derived }: { derived: DerivedPresentation }) {
  const currency = derived.meta.currency
  const rows = sample(derived.table, 16)

  const columns: Array<Column<YearlyRow>> = [
    { key: 'year', header: 'Ano', render: (r) => formatNumber(r.policyYear) },
    { key: 'age', header: 'Idade', render: (r) => (r.age != null ? formatNumber(r.age) : '—') },
    {
      key: 'premium',
      header: 'Depósito',
      align: 'right',
      render: (r) => formatMoney(r.premiumPaid, currency),
    },
    {
      key: 'accum',
      header: 'Valor acumulado',
      align: 'right',
      emphasize: true,
      render: (r) => formatMoney(r.accumulatedValue, currency),
    },
    {
      key: 'death',
      header: 'Proteção por morte',
      align: 'right',
      render: (r) => formatMoney(r.deathBenefit, currency),
    },
  ]

  return (
    <ContentSlide eyebrow="Detalhamento" title="Projeção Ano a Ano">
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => String(r.policyYear)}
        highlightRow={(r) => derived.headline.projectionYears === r.policyYear}
      />
    </ContentSlide>
  )
}
