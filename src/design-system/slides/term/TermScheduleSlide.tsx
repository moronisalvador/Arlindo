import type { DerivedPresentation } from '@domain/model/derived'
import type { YearlyRow } from '@domain/model/presentation'
import { formatMoney, formatNumber, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { DataTable, type Column } from '@design-system/primitives'
import { ContentSlide } from '../ContentSlide'
import { sampleRows } from '../sampleRows'

/**
 * Term premium schedule: Policy Year · Age · Guaranteed Premium · Guaranteed Death
 * Benefit — the exact four columns of a term illustration ledger. No cash value.
 */
export function TermScheduleSlide({ derived }: { derived: DerivedPresentation }) {
  const currency = derived.meta.currency
  const t = slideCopy(derived.meta.language).term
  const locale = localeFor(derived.meta.language)

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

  // Premium "cliff": level for the term, then the annually-renewable ramp. Only
  // shown when there's a real jump (motivates conversion).
  const all = derived.table
  const level = all[0]?.premiumPaid
  const peak = all.reduce((mx, r) => ((r.premiumPaid ?? 0) > (mx.premiumPaid ?? 0) ? r : mx), all[0])
  // The FIRST post-level jump is the decision-relevant number (near the conversion
  // window); the peak is the dramatic end. We cite both, honestly.
  const firstJump = level != null ? all.find((r) => (r.premiumPaid ?? 0) > level * 1.5) : undefined
  const levelYears = derived.headline.termLengthYears
  const showCliff =
    level != null &&
    peak?.premiumPaid != null &&
    firstJump?.premiumPaid != null &&
    levelYears != null &&
    peak.premiumPaid > level * 1.5

  // Fewer rows when the cliff banner is present — it eats vertical space, so the
  // table must stay shorter to avoid the last row clipping off the slide bottom.
  const rows = sampleRows(all, showCliff ? 10 : 12)

  return (
    <ContentSlide eyebrow={t.schedule.eyebrow} title={t.schedule.title}>
      {showCliff && (
        <div className="mb-5 rounded-card border-l-4 border-orange bg-surface px-5 py-3">
          <p className="font-sans text-base font-semibold text-navy">{t.schedule.cliffTitle}</p>
          <p className="mt-1 font-sans text-base text-ink">
            {t.schedule.cliffBody(
              levelYears,
              formatMoney(level, currency, { locale }),
              formatMoney(firstJump?.premiumPaid, currency, { locale }),
              firstJump?.age ?? 0,
              formatMoney(peak.premiumPaid, currency, { locale }),
              peak.age ?? 0,
            )}
          </p>
        </div>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => String(r.policyYear)}
        highlightRow={(r) => derived.headline.termLengthYears === r.policyYear}
      />
    </ContentSlide>
  )
}
