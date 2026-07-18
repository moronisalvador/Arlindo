import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  EyebrowLabel,
  Loading,
  ErrorState,
  EmptyState,
  Section,
} from '@design-system'
import {
  isPresentable,
  type Client,
  type IulInputs,
  type PresentationInputs,
  type Rider,
  type YearlyRow,
} from '@domain/model/presentation'
import { availableProducts, getProduct } from '@domain/model/products'
import { formatMoney } from '@domain/format'
import { presentationRepository, profileRepository } from '@persistence'
import { routes } from '@app/routes'
import { queryKeys } from '@app/queryKeys'
import { cn } from '@shared/cn'
import { registerNamespace } from '@i18n/index'
import { dataEntry } from './i18n/pt-BR'
import { NumberField, Segmented, TextField } from './fields'
import { RidersEditor } from './RidersEditor'
import { YearTableEditor } from './YearTableEditor'
import { SlidePreview } from './SlidePreview'

registerNamespace('dataEntry', dataEntry)

const AUTOSAVE_MS = 500

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/** W2 — large-touch IUL data-entry wizard with autosave, rider editor, and live preview. */
export default function DataEntryPage() {
  const { id } = useParams()
  return id ? <Editor id={id} /> : <NewPresentationCreator />
}

/** No :id → create a fresh presentation from the profile branding, then redirect. */
function NewPresentationCreator() {
  const { t } = useTranslation('dataEntry')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const startedRef = useRef(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    let cancelled = false
    void (async () => {
      try {
        const branding = await profileRepository.get()
        const created = await presentationRepository.create({ branding, productType: 'iul' })
        if (cancelled) return
        queryClient.setQueryData(queryKeys.presentation(created.id), created)
        void queryClient.invalidateQueries({ queryKey: queryKeys.presentations })
        navigate(routes.editor(created.id), { replace: true })
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate, queryClient])

  if (failed) {
    return (
      <ErrorState
        title={t('page.errorTitle')}
        description={t('page.errorDescription')}
        onRetry={() => window.location.reload()}
      />
    )
  }
  return <Loading label={t('page.creating')} />
}

/** Loads the presentation by id and hosts the editing form. */
function Editor({ id }: { id: string }) {
  const { t } = useTranslation('dataEntry')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.presentation(id),
    queryFn: () => presentationRepository.get(id),
    // Do nothing on resume/focus — never refetch-flash a live edit.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  const [working, setWorking] = useState<PresentationInputs | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const seededIdRef = useRef<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Seed the working copy once per presentation id (never clobber live edits).
  useEffect(() => {
    if (query.data && seededIdRef.current !== query.data.id) {
      seededIdRef.current = query.data.id
      setWorking(query.data)
    }
  }, [query.data])

  // Flush any pending save on unmount.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  const scheduleSave = useCallback(
    (next: PresentationInputs) => {
      setSaveStatus('saving')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void (async () => {
          try {
            const saved = await presentationRepository.save(next)
            queryClient.setQueryData(queryKeys.presentation(saved.id), saved)
            void queryClient.invalidateQueries({ queryKey: queryKeys.presentations })
            setSaveStatus('saved')
          } catch {
            // Never leave the indicator stuck on "saving" — surface an error.
            setSaveStatus('error')
          }
        })()
      }, AUTOSAVE_MS)
    },
    [queryClient],
  )

  const update = useCallback(
    (mutator: (draft: PresentationInputs) => PresentationInputs) => {
      setWorking((prev) => {
        if (!prev) return prev
        const next = mutator(prev)
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave],
  )

  const setProduct = (productId: string) => update((p) => ({ ...p, productId }))
  const setClient = (patch: Partial<Client>) =>
    update((p) => ({ ...p, client: { ...p.client, ...patch } }))
  const setIul = (patch: Partial<IulInputs>) =>
    update((p) => ({ ...p, iul: { ...p.iul, ...patch } }))
  const setRiders = (riders: Rider[]) => update((p) => ({ ...p, iul: { ...p.iul, riders } }))
  const setRows = (yearlyRows: YearlyRow[]) => update((p) => ({ ...p, yearlyRows }))

  if (query.isLoading) return <Loading label={t('page.loading')} />
  if (query.isError) {
    return (
      <ErrorState
        title={t('page.errorTitle')}
        description={t('page.errorDescription')}
        onRetry={() => void query.refetch()}
      />
    )
  }
  if (!query.data) {
    return (
      <EmptyState
        icon="🔍"
        title={t('page.notFoundTitle')}
        description={t('page.notFoundDescription')}
        action={
          <Button variant="secondary" onClick={() => navigate(routes.home)}>
            {t('actions.back')}
          </Button>
        }
      />
    )
  }
  if (!working) return <Loading label={t('page.loading')} />

  const currency = working.displayCurrency
  const canPresent = isPresentable(working)
  const iul = working.iul

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <EyebrowLabel>{t('page.eyebrowEdit')}</EyebrowLabel>
          <SaveIndicator status={saveStatus} />
        </div>
        <h2 className="font-serif text-3xl font-semibold text-navy">
          {working.client.name.trim() || t('page.title')}
        </h2>
        {working.branding.agentName && (
          <p className="text-base text-muted">
            {t('branding.title')}: {working.branding.agentName}
            {working.branding.agentLicense
              ? ` · ${t('branding.licensePrefix')} ${working.branding.agentLicense}`
              : ''}
          </p>
        )}
      </header>

      {/* 1) Produto */}
      <Section eyebrow="1" title={t('sections.product')}>
        <ProductSelector value={working.productId} onChange={setProduct} />
      </Section>

      {/* 2) Cliente */}
      <Section eyebrow="2" title={t('sections.client')}>
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={t('client.name')}
              value={working.client.name}
              placeholder={t('client.namePlaceholder')}
              onChange={(v) => setClient({ name: v })}
            />
            <NumberField
              label={t('client.age')}
              value={working.client.age}
              integer
              placeholder={t('client.agePlaceholder')}
              suffix={t('plan.years')}
              onChange={(n) => setClient({ age: n })}
            />
            <Segmented
              label={t('client.sex')}
              value={working.client.sex}
              onChange={(v) => setClient({ sex: v })}
              options={[
                { value: 'M', label: t('client.male') },
                { value: 'F', label: t('client.female') },
              ]}
            />
          </div>
        </Card>
      </Section>

      {/* 3) Plano IUL */}
      <Section eyebrow="3" title={t('sections.plan')}>
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label={t('plan.premium')}
              value={iul.premium}
              money
              currency={currency}
              onChange={(n) => setIul({ premium: n })}
            />
            <Segmented
              label={t('plan.premiumMode')}
              value={iul.premiumMode}
              onChange={(v) => setIul({ premiumMode: v })}
              options={[
                { value: 'monthly', label: t('plan.monthly') },
                { value: 'annual', label: t('plan.annual') },
              ]}
            />
            <NumberField
              label={t('plan.deathBenefit')}
              value={iul.deathBenefit}
              money
              currency={currency}
              onChange={(n) => setIul({ deathBenefit: n })}
            />
            <NumberField
              label={t('plan.livingBenefit')}
              value={iul.livingBenefit}
              money
              currency={currency}
              onChange={(n) => setIul({ livingBenefit: n })}
            />
            <NumberField
              label={t('plan.livingBenefitPercent')}
              value={iul.livingBenefitPercent}
              integer
              suffix="%"
              onChange={(n) =>
                setIul({ livingBenefitPercent: Math.min(100, Math.max(0, n ?? 0)) })
              }
            />
            <NumberField
              label={t('plan.projectionYears')}
              value={iul.projectionYears}
              integer
              suffix={t('plan.years')}
              onChange={(n) => setIul({ projectionYears: n })}
            />
            <NumberField
              label={t('plan.projectedAccumulatedValue')}
              value={iul.projectedAccumulatedValue}
              money
              currency={currency}
              onChange={(n) => setIul({ projectedAccumulatedValue: n })}
            />
            <NumberField
              label={t('plan.incomeOptionAnnual')}
              value={iul.incomeOptionAnnual}
              money
              currency={currency}
              onChange={(n) => setIul({ incomeOptionAnnual: n })}
            />
            <NumberField
              label={t('plan.incomeToAge')}
              value={iul.incomeToAge}
              integer
              suffix={t('plan.age')}
              onChange={(n) => setIul({ incomeToAge: n })}
            />
          </div>
        </Card>
      </Section>

      {/* 4) Coberturas / Riders */}
      <Section eyebrow="4" title={t('sections.riders')}>
        <RidersEditor riders={iul.riders} onChange={setRiders} />
      </Section>

      {/* 5) Fonte dos números + tabela ano a ano (ou estimativa no app) */}
      <Section eyebrow="5" title={t('sections.years')}>
        <div className="space-y-6">
          <Segmented
            label={t('source.label')}
            value={iul.projectionSource}
            onChange={(v) => setIul({ projectionSource: v })}
            options={[
              { value: 'typed', label: t('source.typed') },
              { value: 'estimate', label: t('source.estimate') },
            ]}
          />

          {iul.projectionSource === 'estimate' ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  label={t('source.assumedRate')}
                  value={iul.assumedRatePct}
                  suffix="%"
                  hint={t('source.assumedRateHint')}
                  onChange={(n) => setIul({ assumedRatePct: n })}
                />
              </div>
              <Card tone="alt">
                <p className="text-base text-ink/80">{t('source.estimateNote')}</p>
              </Card>
            </div>
          ) : (
            <YearTableEditor rows={working.yearlyRows} onChange={setRows} />
          )}
        </div>
      </Section>

      {/* Live preview */}
      <Section eyebrow="★" title={t('sections.preview')}>
        <SlidePreview inputs={working} />
      </Section>

      {/* Footer actions */}
      <div className="sticky bottom-0 -mx-5 border-t border-line bg-surface/95 px-5 py-4 backdrop-blur no-print">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate(routes.home)}>
            {t('actions.back')}
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate(routes.pdf(working.id))}>
              {t('actions.exportPdf')}
            </Button>
            <Button
              variant="primary"
              disabled={!canPresent}
              title={canPresent ? undefined : t('actions.presentDisabled')}
              onClick={() => navigate(routes.present(working.id))}
            >
              {t('actions.present')}
            </Button>
          </div>
        </div>
        {!canPresent && (
          <p className="mx-auto mt-2 max-w-content text-sm text-muted">
            {t('actions.presentDisabled')}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Product picker over the NLG registry. Renders every AVAILABLE product as a
 * large touch button (single available product shows as a selected chip plus a
 * "coming soon" note); more products appear automatically as they turn on.
 * Always shows the selected product's positioning, carrier and minimum face.
 */
function ProductSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  const { t } = useTranslation('dataEntry')
  const products = availableProducts()
  const selected = getProduct(value)
  const single = products.length <= 1

  return (
    <Card>
      <div className="space-y-4">
        <EyebrowLabel>{t('product.label')}</EyebrowLabel>
        <div className="flex flex-wrap gap-2">
          {products.map((p) => {
            const active = p.id === selected.id
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                disabled={single}
                onClick={() => onChange(p.id)}
                className={cn(
                  'min-h-[3.25rem] rounded-xl border px-5 font-sans text-lg font-semibold transition-colors',
                  active
                    ? 'border-navy bg-navy text-white'
                    : 'border-line bg-surface text-ink hover:bg-surface-alt',
                  single && 'cursor-default',
                )}
              >
                {p.name}
                {single && active && (
                  <span className="ml-2 text-sm font-normal opacity-80">
                    · {t('product.selected')}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {single && <p className="text-base text-muted">{t('product.comingSoon')}</p>}

        <p className="text-lg text-ink/80">{selected.positioning}</p>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-base">
          <span className="text-muted">
            {t('product.carrier')}:{' '}
            <span className="font-semibold text-navy">{selected.carrier}</span>
          </span>
          <span className="text-muted">
            {t('product.minFace')}:{' '}
            <span className="font-semibold text-navy">
              {formatMoney(selected.minFace, 'USD', { compact: true })}
            </span>
          </span>
        </div>
      </div>
    </Card>
  )
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  const { t } = useTranslation('dataEntry')
  const label =
    status === 'saving'
      ? t('save.saving')
      : status === 'saved'
        ? t('save.saved')
        : status === 'error'
          ? t('save.error')
          : t('save.idle')
  const dot =
    status === 'saving'
      ? 'h-2.5 w-2.5 animate-pulse rounded-full bg-orange'
      : status === 'error'
        ? 'h-2.5 w-2.5 rounded-full bg-red-600'
        : 'h-2.5 w-2.5 rounded-full bg-green-500'
  return (
    <span
      className={
        status === 'error'
          ? 'flex items-center gap-2 text-sm font-medium text-red-600'
          : 'flex items-center gap-2 text-sm text-muted'
      }
    >
      <span className={dot} aria-hidden />
      {label}
    </span>
  )
}
