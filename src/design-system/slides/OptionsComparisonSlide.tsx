import type { DerivedPresentation } from '@domain/model/derived'
import type { CoverageOption } from '@domain/model/presentation'
import { formatMoney, formatNumber, localeFor } from '@domain/format'
import { slideCopy } from '@domain/presentationCopy'
import { DataTable, type Column } from '@design-system/primitives'
import { ContentSlide } from './ContentSlide'

/** Localized "years" suffix for the term column, matching the app's other slides. */
function yearsSuffix(lang: 'pt' | 'en' | 'es'): string {
  return lang === 'en' ? 'years' : lang === 'es' ? 'años' : 'anos'
}

/**
 * Side-by-side comparison of 2-3 coverage options (from `derived.coverageOptions`).
 * Caller must guard on `coverageOptions.length >= 2` before rendering this slide;
 * it also defensively returns null when there are fewer than two options.
 */
export function OptionsComparisonSlide({ derived }: { derived: DerivedPresentation }) {
  const options = derived.coverageOptions
  if (!options || options.length < 2) return null

  const currency = derived.meta.currency
  const lang = derived.meta.language
  const c = slideCopy(lang)
  const t = c.optionsComparison
  const locale = localeFor(lang)
  const isTerm = derived.meta.productType === 'term'

  const columns: Array<Column<CoverageOption>> = [
    {
      key: 'label',
      header: '',
      emphasize: true,
      render: (opt) => (
        <span className="inline-flex items-center gap-2">
          {opt.label ?? t.optionLabel(options.indexOf(opt) + 1)}
          {opt.id === derived.recommendedOptionId && (
            <span className="rounded-full bg-orange px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-navy">
              {t.recommendedBadge}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'death',
      header: t.death,
      align: 'right',
      render: (opt) => formatMoney(opt.deathBenefit, currency, { locale }),
    },
    {
      key: 'living',
      header: t.living,
      align: 'right',
      render: (opt) => {
        if (opt.livingBenefit != null) return formatMoney(opt.livingBenefit, currency, { locale })
        if (opt.livingBenefitPercent != null) return c.coverage.upTo(`${opt.livingBenefitPercent}%`)
        return '—'
      },
    },
    ...(isTerm
      ? [
          {
            key: 'term',
            header: t.term,
            align: 'right' as const,
            render: (opt: CoverageOption) =>
              opt.termYears != null ? `${formatNumber(opt.termYears, { locale })} ${yearsSuffix(lang)}` : '—',
          },
        ]
      : []),
    {
      key: 'monthly',
      header: t.monthly,
      align: 'right',
      emphasize: true,
      render: (opt) => {
        const monthly = opt.monthlyPremium ?? (opt.annualPremium != null ? opt.annualPremium / 12 : undefined)
        return formatMoney(monthly, currency, { locale })
      },
    },
  ]

  return (
    <ContentSlide eyebrow={t.eyebrow} title={t.title}>
      <DataTable
        columns={columns}
        rows={options}
        rowKey={(opt, i) => opt.id ?? String(i)}
        highlightRow={(opt) => opt.id === derived.recommendedOptionId}
      />
      <p className="mt-4 font-sans text-sm text-muted">{t.footnote}</p>
    </ContentSlide>
  )
}
