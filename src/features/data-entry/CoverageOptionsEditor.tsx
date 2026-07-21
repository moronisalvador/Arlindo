import { useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Icon, Modal } from '@design-system'
import { formatMoney } from '@domain/format'
import type { CoverageOption, CurrencyCode } from '@domain/model/presentation'
import { applyIllustrationToOption } from '@domain/illustration/applyIllustration'
import { parseIllustration } from '@domain/illustration/parseIllustration'
import type { ParsedIllustration } from '@domain/illustration/types'
import { extractIllustrationText } from '@shared/pdfExtract'
import { cn } from '@shared/cn'
import { NumberField, TextField } from './fields'

const MAX_OPTIONS = 3

/**
 * Optional 2–3 tier "compare coverage options" editor. Each row is a Card with
 * an optional label, death benefit, living benefit (amount or %), monthly
 * premium, and (term only) term years. Mirrors RidersEditor's per-row Card
 * style and YearTableEditor's remove-row button. One row may be marked
 * "recommended" (radio-style, via `recommendedOptionId`) — the rest of the
 * deck (headline/coverage/projection) then captions itself against that pick.
 */
export function CoverageOptionsEditor({
  options,
  onChange,
  currency,
  isTerm,
  recommendedOptionId,
  onRecommend,
}: {
  options: CoverageOption[]
  onChange: (next: CoverageOption[]) => void
  currency: CurrencyCode
  isTerm: boolean
  recommendedOptionId?: string
  onRecommend: (id: string | undefined) => void
}) {
  const { t } = useTranslation('dataEntry')

  const patch = (id: string, changes: Partial<CoverageOption>) =>
    onChange(options.map((o) => (o.id === id ? { ...o, ...changes } : o)))

  const removeOption = (id: string) => {
    onChange(options.filter((o) => o.id !== id))
    if (recommendedOptionId === id) onRecommend(undefined)
  }

  const addOption = () =>
    onChange([
      ...options,
      {
        id: crypto.randomUUID(),
        label: undefined,
        deathBenefit: undefined,
        livingBenefit: undefined,
        livingBenefitPercent: undefined,
        termYears: undefined,
        monthlyPremium: undefined,
        annualPremium: undefined,
      },
    ])

  return (
    <div className="space-y-4">
      {options.length === 0 ? (
        <p className="text-base text-muted">{t('options.hint')}</p>
      ) : (
        <div className="space-y-4">
          {options.map((option, index) => {
            const recommended = option.id === recommendedOptionId
            return (
            <Card key={option.id} className={cn(recommended && 'border-orange/40')}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <TextField
                      label={t('options.labelPlaceholder', { n: index + 1 })}
                      value={option.label ?? ''}
                      placeholder={t('options.labelPlaceholder', { n: index + 1 })}
                      onChange={(v) => patch(option.id, { label: v || undefined })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={recommended}
                      onClick={() => onRecommend(recommended ? undefined : option.id)}
                      className={cn(
                        'min-h-[3.25rem] rounded-xl border px-4 font-sans text-base font-semibold transition-colors',
                        recommended
                          ? 'border-orange bg-orange text-navy'
                          : 'border-line bg-surface text-muted hover:bg-surface-alt',
                      )}
                    >
                      {recommended ? `✓ ${t('options.recommended')}` : t('options.recommendButton')}
                    </button>
                    <Button
                      variant="danger"
                      size="md"
                      aria-label={t('options.removeButton')}
                      onClick={() => removeOption(option.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                <OptionPdfImport
                  isTerm={isTerm}
                  currency={currency}
                  onApply={(parsed) => patch(option.id, applyIllustrationToOption(parsed, option))}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    label={t('options.deathBenefit')}
                    value={option.deathBenefit}
                    money
                    currency={currency}
                    onChange={(n) => patch(option.id, { deathBenefit: n })}
                  />
                  <NumberField
                    label={t('options.livingBenefit')}
                    value={option.livingBenefit}
                    money
                    currency={currency}
                    onChange={(n) => patch(option.id, { livingBenefit: n })}
                  />
                  <NumberField
                    label={t('options.livingBenefitPercent')}
                    value={option.livingBenefitPercent}
                    integer
                    suffix="%"
                    onChange={(n) =>
                      patch(option.id, {
                        livingBenefitPercent: n == null ? undefined : Math.min(100, Math.max(0, n)),
                      })
                    }
                  />
                  {isTerm && (
                    <NumberField
                      label={t('options.termYears')}
                      value={option.termYears}
                      integer
                      suffix={t('plan.years')}
                      onChange={(n) => patch(option.id, { termYears: n })}
                    />
                  )}
                  <NumberField
                    label={t('options.monthlyPremium')}
                    value={option.monthlyPremium}
                    money
                    currency={currency}
                    onChange={(n) => patch(option.id, { monthlyPremium: n })}
                  />
                </div>
              </div>
            </Card>
            )
          })}
        </div>
      )}

      {options.length < MAX_OPTIONS && (
        <Button variant="secondary" onClick={addOption}>
          + {t('options.addButton')}
        </Button>
      )}
    </div>
  )
}

type ImportStatus = 'idle' | 'reading' | 'review' | 'error'

/**
 * Per-option PDF import: upload a second/third carrier illustration and pull its
 * death benefit / living benefit / term length / premium straight into THIS row
 * (instead of the main plan, which `ImportIllustration` already covers). Same
 * "review before applying" rule — a parser can misread a value.
 */
function OptionPdfImport({
  isTerm,
  currency,
  onApply,
}: {
  isTerm: boolean
  currency: CurrencyCode
  onApply: (parsed: ParsedIllustration) => void
}) {
  const { t } = useTranslation('dataEntry')
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [parsed, setParsed] = useState<ParsedIllustration | null>(null)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setStatus('reading')
    try {
      const text = await extractIllustrationText(file)
      const p = parseIllustration(text)
      if (!p || (p.rows.length === 0 && p.face == null && p.premium == null)) {
        setStatus('error')
        return
      }
      setParsed(p)
      setStatus('review')
    } catch {
      setStatus('error')
    }
  }

  const money = (n?: number) => (n != null ? formatMoney(n, currency) : '—')
  const rows: Array<[string, string]> = parsed
    ? [
        [t('import.field.premium'), parsed.premium != null ? `${money(parsed.premium)} ${parsed.premiumMode === 'annual' ? t('plan.annual') : t('plan.monthly')}` : '—'],
        [t('import.field.death'), money(parsed.deathBenefit)],
        [t('import.field.living'), money(parsed.livingBenefit)],
        ...(isTerm ? [[t('planTerm.termLength'), parsed.termLengthYears ? `${parsed.termLengthYears} ${t('plan.years')}` : '—'] as [string, string]] : []),
      ]
    : []

  return (
    <div>
      <Button
        variant="ghost"
        size="md"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'reading'}
      >
        <span className="inline-flex items-center gap-2">
          <Icon name="document" className="h-5 w-5" strokeWidth={1.6} />
          {status === 'reading' ? t('import.reading') : t('options.importPdf')}
        </span>
      </Button>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onFile} />
      {status === 'error' && (
        <p role="status" className="mt-2 text-sm font-medium text-red-700">
          {t('import.error')}
        </p>
      )}

      {status === 'review' && parsed && (
        <Modal onClose={() => setStatus('idle')} labelledBy="option-import-review-title" className="max-h-[85dvh] max-w-lg overflow-y-auto">
          <h3 id="option-import-review-title" className="font-serif text-2xl font-semibold text-navy">
            {t('import.reviewTitle')}
          </h3>
          <p className="mt-1 text-base text-muted">{t('import.reviewSubtitle')}</p>

          {parsed.confidence === 'low' && (
            <p className="mt-3 rounded-lg bg-orange/15 px-3 py-2 text-sm font-medium text-navy">
              {t('import.lowConfidence')}
            </p>
          )}

          <dl className="mt-4 divide-y divide-line">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2">
                <dt className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">{label}</dt>
                <dd className="text-right font-sans text-base text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="ghost" onClick={() => setStatus('idle')}>
              {t('import.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onApply(parsed)
                setStatus('idle')
              }}
            >
              {t('import.apply')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
