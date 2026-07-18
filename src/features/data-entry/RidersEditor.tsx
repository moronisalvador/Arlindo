import { useTranslation } from 'react-i18next'
import { Card } from '@design-system'
import { formatMoney } from '@domain/format'
import type { Rider } from '@domain/model/presentation'
import { cn } from '@shared/cn'
import { NumberField, Toggle } from './fields'

const CATEGORY_ORDER: Rider['category'][] = ['included', 'iul_exclusive', 'optional']

/**
 * Rider editor: each row toggles `included`, sets the accessible `percent`
 * (with 80 / 100 quick buttons), and flags `additionalCost`. Grouped by
 * category with pt-BR headings. Prefilled from DEFAULT_IUL_RIDERS on creation.
 */
export function RidersEditor({
  riders,
  onChange,
}: {
  riders: Rider[]
  onChange: (next: Rider[]) => void
}) {
  const { t } = useTranslation('dataEntry')

  const patch = (id: string, changes: Partial<Rider>) =>
    onChange(riders.map((r) => (r.id === id ? { ...r, ...changes } : r)))

  const categoryLabel: Record<Rider['category'], string> = {
    included: t('riders.categoryIncluded'),
    iul_exclusive: t('riders.categoryExclusive'),
    optional: t('riders.categoryOptional'),
  }

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((category) => {
        const group = riders.filter((r) => r.category === category)
        if (group.length === 0) return null
        return (
          <div key={category} className="space-y-3">
            <h4 className="font-sans text-base font-semibold uppercase tracking-wide text-muted">
              {categoryLabel[category]}
            </h4>
            {group.map((rider) => (
              <Card
                key={rider.id}
                tone={rider.included ? 'default' : 'alt'}
                className={cn(rider.included && 'border-orange/40')}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-serif text-xl font-semibold text-navy">{rider.label}</p>
                      {rider.englishLabel && (
                        <p className="text-sm text-muted">{rider.englishLabel}</p>
                      )}
                      {rider.lifetimeMax != null && (
                        <span className="mt-1 inline-block rounded-full bg-surface-alt px-3 py-1 text-sm font-semibold text-navy">
                          {t('riders.lifetimeMaxPrefix')}{' '}
                          {formatMoney(rider.lifetimeMax, 'USD', { compact: true })}
                        </span>
                      )}
                    </div>
                    <Toggle
                      on={rider.included}
                      onToggle={(next) => patch(rider.id, { included: next })}
                      onLabel={t('riders.included')}
                      offLabel={t('riders.notIncluded')}
                    />
                  </div>

                  {rider.note && <p className="text-base text-ink/80">{rider.note}</p>}

                  {rider.included && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <NumberField
                          label={t('riders.percent')}
                          value={rider.percent}
                          integer
                          suffix="%"
                          onChange={(n) =>
                            patch(rider.id, { percent: Math.min(100, Math.max(0, n ?? 0)) })
                          }
                        />
                        <div className="flex gap-2">
                          <QuickPercent
                            label={t('riders.quick80')}
                            active={rider.percent === 80}
                            onClick={() => patch(rider.id, { percent: 80 })}
                          />
                          <QuickPercent
                            label={t('riders.quick90')}
                            active={rider.percent === 90}
                            onClick={() => patch(rider.id, { percent: 90 })}
                          />
                          <QuickPercent
                            label={t('riders.quick100')}
                            active={rider.percent === 100}
                            onClick={() => patch(rider.id, { percent: 100 })}
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Toggle
                          on={rider.additionalCost}
                          onToggle={(next) => patch(rider.id, { additionalCost: next })}
                          onLabel={t('riders.additionalCostOn')}
                          offLabel={t('riders.additionalCostOff')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function QuickPercent({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-[3rem] flex-1 rounded-xl border px-4 font-sans text-lg font-semibold transition-colors',
        active ? 'border-navy bg-navy text-white' : 'border-line bg-surface text-navy hover:bg-surface-alt',
      )}
    >
      {label}
    </button>
  )
}
