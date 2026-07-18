import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  CurrencyDisplay,
  EyebrowLabel,
  Field,
  GrowthChart,
  Section,
  TextInput,
} from '@design-system'
import { derive } from '@domain/calc'
import { parseNumberInput } from '@domain/format'
import { presentationInputsSchema } from '@domain/model/presentation'
import type { DerivedPresentation } from '@domain/model/derived'
import { registerNamespace } from '@i18n/index'
import { ptBR } from './i18n/pt-BR'

registerNamespace('calc', ptBR)

/**
 * Standalone quick estimator (route `/calculo`). A large-touch form that builds a
 * `PresentationInputs` with `iul.projectionSource === 'estimate'` and runs it
 * through `derive()` (the approximate `IulProjectionEngine`). Everything shown
 * here is a non-guaranteed estimate — the official carrier illustration governs.
 */
export default function CalcEstimatorPage() {
  const { t } = useTranslation('calc')

  const [age, setAge] = useState('')
  const [premium, setPremium] = useState('')
  const [deathBenefit, setDeathBenefit] = useState('')
  const [projectionYears, setProjectionYears] = useState('')
  const [rate, setRate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const parsed = useMemo(
    () => ({
      age: parseNumberInput(age),
      premium: parseNumberInput(premium),
      deathBenefit: parseNumberInput(deathBenefit),
      projectionYears: parseNumberInput(projectionYears),
      rate: parseNumberInput(rate),
    }),
    [age, premium, deathBenefit, projectionYears, rate],
  )

  // Enough to build a meaningful estimate?
  const canCalculate =
    parsed.premium != null &&
    parsed.premium > 0 &&
    parsed.deathBenefit != null &&
    parsed.deathBenefit > 0 &&
    parsed.projectionYears != null &&
    parsed.projectionYears >= 1

  const derived = useMemo<DerivedPresentation | null>(() => {
    if (!canCalculate) return null
    const now = new Date().toISOString()
    const result = presentationInputsSchema.safeParse({
      id: 'calc',
      createdAt: now,
      updatedAt: now,
      productType: 'iul',
      productId: 'flexlife',
      client: { name: '', age: parsed.age != null ? Math.round(parsed.age) : undefined },
      iul: {
        premium: parsed.premium,
        premiumMode: 'monthly',
        deathBenefit: parsed.deathBenefit,
        projectionYears: parsed.projectionYears != null ? Math.round(parsed.projectionYears) : undefined,
        assumedRatePct: parsed.rate,
        projectionSource: 'estimate',
      },
    })
    if (!result.success) return null
    return derive(result.data)
  }, [canCalculate, parsed])

  const showResults = submitted && derived != null

  const years = derived?.series.policyYears ?? []
  const values = derived?.series.accumulatedValue ?? []
  const projectedYears =
    derived?.headline.projectionYears ?? years[years.length - 1] ?? 0

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <header className="text-center">
        <EyebrowLabel>{t('eyebrow')}</EyebrowLabel>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-navy">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted">{t('intro')}</p>
      </header>

      <Section title={t('title')}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t('form.age')} htmlFor="calc-age">
            <TextInput
              id="calc-age"
              inputMode="numeric"
              placeholder={t('form.agePlaceholder')}
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </Field>

          <Field label={t('form.premium')} htmlFor="calc-premium">
            <TextInput
              id="calc-premium"
              inputMode="decimal"
              placeholder={t('form.premiumPlaceholder')}
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
            />
          </Field>

          <Field label={t('form.deathBenefit')} htmlFor="calc-db">
            <TextInput
              id="calc-db"
              inputMode="decimal"
              placeholder={t('form.deathBenefitPlaceholder')}
              value={deathBenefit}
              onChange={(e) => setDeathBenefit(e.target.value)}
            />
          </Field>

          <Field label={t('form.projectionYears')} htmlFor="calc-years">
            <TextInput
              id="calc-years"
              inputMode="numeric"
              placeholder={t('form.projectionYearsPlaceholder')}
              value={projectionYears}
              onChange={(e) => setProjectionYears(e.target.value)}
            />
          </Field>

          <Field label={t('form.rate')} hint={t('form.rateHint')} htmlFor="calc-rate">
            <TextInput
              id="calc-rate"
              inputMode="decimal"
              placeholder={t('form.ratePlaceholder')}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </Field>
        </div>

        <Button
          fullWidth
          disabled={!canCalculate}
          onClick={() => setSubmitted(true)}
          className="mt-2"
        >
          {submitted ? t('form.recalculate') : t('form.calculate')}
        </Button>
      </Section>

      {showResults && derived ? (
        <Section eyebrow={t('results.eyebrow')} title={t('results.chartTitle')}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card tone="navy">
              <p className="text-base font-semibold text-white/80">
                {t('results.accumulatedTitle')}
              </p>
              <CurrencyDisplay
                amount={derived.headline.projectedAccumulatedValue}
                currency={derived.meta.currency}
                className="mt-2 block text-4xl text-white"
              />
              <p className="mt-1 text-sm text-white/70">
                {t('results.accumulatedSub', { years: projectedYears })}
              </p>
            </Card>

            <Card tone="alt">
              <p className="text-base font-semibold text-muted">{t('results.incomeTitle')}</p>
              <p className="mt-2">
                <CurrencyDisplay
                  amount={derived.headline.incomeOptionAnnual}
                  currency={derived.meta.currency}
                  className="text-4xl text-navy"
                />
                <span className="ml-1 text-xl font-semibold text-muted">
                  {' '}
                  {t('results.incomePerYear')}
                </span>
              </p>
            </Card>
          </div>

          <Card>
            <GrowthChart
              years={years}
              values={values}
              currency={derived.meta.currency}
              responsive
              height={320}
            />
          </Card>
        </Section>
      ) : (
        <Card tone="alt">
          <div className="py-6 text-center">
            <p className="font-serif text-2xl font-semibold text-navy">{t('empty.title')}</p>
            <p className="mx-auto mt-2 max-w-md text-lg text-muted">{t('empty.description')}</p>
          </div>
        </Card>
      )}

      <p className="rounded-xl border border-orange/40 bg-orange/5 px-5 py-4 text-center text-base font-semibold text-navy">
        {t('disclaimer')}
      </p>
    </div>
  )
}
