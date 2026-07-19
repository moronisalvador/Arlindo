import { useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Modal } from '@design-system'
import { formatMoney } from '@domain/format'
import type { CurrencyCode } from '@domain/model/presentation'
import { parseIllustration } from '@domain/illustration/parseIllustration'
import type { ParsedIllustration } from '@domain/illustration/types'
import { extractIllustrationText } from '@shared/pdfExtract'

type Status = 'idle' | 'reading' | 'review' | 'error'

/**
 * Upload a carrier illustration PDF (NLG/LSW FlexLife IUL or Term) and autofill
 * the presentation from it. Parsed entirely in-browser (never uploaded), then
 * shown for review before anything is applied — the official illustration is the
 * authoritative document.
 */
export function ImportIllustration({
  currency,
  onApply,
}: {
  currency: CurrencyCode
  onApply: (parsed: ParsedIllustration) => void
}) {
  const { t } = useTranslation('dataEntry')
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
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

  return (
    <Card tone="alt">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-xl font-semibold text-navy">{t('import.title')}</h3>
          <p className="text-base text-muted">{t('import.description')}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'reading'}
        >
          {status === 'reading' ? t('import.reading') : t('import.button')}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={onFile}
      />
      {status === 'error' && (
        <p role="status" className="mt-3 text-base font-medium text-red-700">
          {t('import.error')}
        </p>
      )}

      {status === 'review' && parsed && (
        <ReviewDialog
          parsed={parsed}
          currency={currency}
          onCancel={() => setStatus('idle')}
          onApply={() => {
            onApply(parsed)
            setStatus('idle')
          }}
        />
      )}
    </Card>
  )
}

function ReviewDialog({
  parsed,
  currency,
  onApply,
  onCancel,
}: {
  parsed: ParsedIllustration
  currency: CurrencyCode
  onApply: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation('dataEntry')
  const money = (n?: number) => (n != null ? formatMoney(n, currency) : '—')
  const isTerm = parsed.productType === 'term'

  const rows: Array<[string, string]> = [
    [t('import.field.product'), isTerm ? t('sections.planTerm') : `IUL${parsed.productName ? ` · ${parsed.productName}` : ''}`],
    [t('import.field.client'), [parsed.client.name, parsed.client.age ? `${parsed.client.age} ${t('plan.years')}` : null, parsed.rateClass].filter(Boolean).join(' · ') || '—'],
    [t('import.field.premium'), parsed.premium != null ? `${money(parsed.premium)} ${parsed.premiumMode === 'annual' ? t('plan.annual') : t('plan.monthly')}` : '—'],
    [t('import.field.death'), money(parsed.deathBenefit)],
  ]
  if (isTerm) {
    rows.push([t('planTerm.termLength'), parsed.termLengthYears ? `${parsed.termLengthYears} ${t('plan.years')}` : '—'])
  } else {
    if (parsed.paymentYears) rows.push([t('import.field.paymentYears'), `${parsed.paymentYears} ${t('plan.years')}`])
    rows.push([t('import.field.projected'), money(parsed.projectedAccumulatedValue)])
    rows.push([
      t('import.field.income'),
      parsed.incomeOptionAnnual != null
        ? `${money(parsed.incomeOptionAnnual)} ${t('plan.perYear')}${parsed.incomeToAge ? ` · ${parsed.incomeToAge} ${t('plan.age')}` : ''}`
        : '—',
    ])
    rows.push([t('import.field.rate'), parsed.assumedRatePct != null ? `${parsed.assumedRatePct}%` : '—'])
  }
  rows.push([t('import.field.rows'), String(parsed.rows.length)])

  return (
    <Modal onClose={onCancel} labelledBy="import-review-title" className="max-h-[85dvh] max-w-lg overflow-y-auto">
      <h3 id="import-review-title" className="font-serif text-2xl font-semibold text-navy">{t('import.reviewTitle')}</h3>
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

        {parsed.warnings.length > 0 && (
          <ul className="mt-3 space-y-1">
            {parsed.warnings.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span aria-hidden>⚠️</span>
                {w}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            {t('import.cancel')}
          </Button>
          <Button variant="primary" onClick={onApply}>
            {t('import.apply')}
          </Button>
        </div>
    </Modal>
  )
}
