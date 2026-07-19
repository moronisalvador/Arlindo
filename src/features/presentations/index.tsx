import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  Modal,
  NavyHeaderBar,
  TextInput,
} from '@design-system'
import {
  presentationRepository,
  profileRepository,
  type BackupFile,
} from '@persistence'
import type { PresentationInputs } from '@domain/model/presentation'
import { formatMoney } from '@domain/format'
import { parseIllustration } from '@domain/illustration/parseIllustration'
import { applyIllustration } from '@domain/illustration/applyIllustration'
import { extractIllustrationText } from '@shared/pdfExtract'
import { routes } from '@app/routes'
import { queryKeys } from '@app/queryKeys'
import { registerNamespace } from '@i18n/index'
import { ptBR } from './i18n/pt-BR'
import { formatDate, fileDateStamp } from './formatDate'

registerNamespace('presentations', ptBR)

type BackupFeedback = { kind: 'success' | 'error'; message: string } | null

export default function PresentationsPage() {
  const { t } = useTranslation('presentations')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<BackupFeedback>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isImportingPdf, setIsImportingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.presentations })

  const query = useQuery({
    queryKey: queryKeys.presentations,
    queryFn: () => presentationRepository.list(),
  })

  // Live list: refresh whenever the repository changes (import, duplicate, …).
  useEffect(() => {
    const unsub = presentationRepository.observe(() => {
      void invalidate()
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createMutation = useMutation({
    mutationFn: async (productType: 'iul' | 'term' = 'iul') => {
      const profile = await profileRepository.get()
      const created = await presentationRepository.create({
        branding: profile,
        productType,
      })
      return created
    },
    onSuccess: (created) => {
      void invalidate()
      navigate(routes.editor(created.id))
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => presentationRepository.duplicate(id),
    onSuccess: () => void invalidate(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => presentationRepository.remove(id),
    onSuccess: () => {
      setConfirmDeleteId(null)
      void invalidate()
    },
  })

  async function handleExport() {
    setFeedback(null)
    setIsExporting(true)
    try {
      const backup = await presentationRepository.exportAll()
      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `arlindo-backup-${fileDateStamp()}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setFeedback({ kind: 'success', message: t('backup.successExport') })
    } catch {
      setFeedback({ kind: 'error', message: t('backup.errorExport') })
    } finally {
      setIsExporting(false)
    }
  }

  // Import a carrier illustration PDF from the home page: parse it in-browser,
  // create a presentation of the auto-detected product type, apply the values,
  // then open the editor for review. Nothing is created if parsing fails.
  async function handleImportPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFeedback(null)
    setIsImportingPdf(true)
    try {
      const text = await extractIllustrationText(file)
      const parsed = parseIllustration(text)
      if (!parsed || (parsed.rows.length === 0 && parsed.face == null && parsed.premium == null)) {
        setFeedback({ kind: 'error', message: t('importPdf.error') })
        return
      }
      const profile = await profileRepository.get()
      const created = await presentationRepository.create({
        branding: profile,
        productType: parsed.productType,
      })
      const saved = await presentationRepository.save(applyIllustration(parsed, created))
      void invalidate()
      navigate(routes.editor(saved.id))
    } catch {
      setFeedback({ kind: 'error', message: t('importPdf.error') })
    } finally {
      setIsImportingPdf(false)
    }
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset the input so the same file can be picked again later.
    event.target.value = ''
    if (!file) return
    setFeedback(null)
    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as BackupFile
      await presentationRepository.import(data, 'merge')
      void invalidate()
      setFeedback({ kind: 'success', message: t('backup.successImport') })
    } catch {
      setFeedback({ kind: 'error', message: t('backup.errorImport') })
    } finally {
      setIsImporting(false)
    }
  }

  const createButtons = (
    <>
      <Button
        variant="primary"
        className="max-sm:col-span-2"
        onClick={() => pdfInputRef.current?.click()}
        disabled={isImportingPdf}
      >
        {isImportingPdf ? t('importPdf.reading') : t('importPdf.button')}
      </Button>
      <Button
        variant="secondary"
        className="max-sm:flex-1"
        onClick={() => createMutation.mutate('iul')}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? t('creating') : `+ ${t('newIul')}`}
      </Button>
      <Button
        variant="secondary"
        className="max-sm:flex-1"
        onClick={() => createMutation.mutate('term')}
        disabled={createMutation.isPending}
      >
        {`+ ${t('newTerm')}`}
      </Button>
    </>
  )

  return (
    <div className="space-y-6">
      {/* Buttons sit in the header on sm+, and drop to a full-width row on phones. */}
      <NavyHeaderBar
        eyebrow={t('eyebrow')}
        title={t('title')}
        className="rounded-card"
        showLogo={false}
        right={<div className="hidden flex-wrap gap-2 sm:flex">{createButtons}</div>}
      />
      <div className="grid grid-cols-2 gap-2 sm:hidden">{createButtons}</div>

      <BackupBar
        onExport={handleExport}
        onImportClick={() => fileInputRef.current?.click()}
        isExporting={isExporting}
        isImporting={isImporting}
        feedback={feedback}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleImportPdf}
      />

      <ListBody
        query={query}
        search={search}
        onSearchChange={setSearch}
        onCreate={() => createMutation.mutate('iul')}
        creating={createMutation.isPending}
        onOpen={(id) => navigate(routes.editor(id))}
        onPresent={(id) => navigate(routes.present(id))}
        onExportPdf={(id) => navigate(routes.pdf(id))}
        onDuplicate={(id) => duplicateMutation.mutate(id)}
        duplicatingId={
          duplicateMutation.isPending
            ? (duplicateMutation.variables as string)
            : null
        }
        onAskDelete={(id) => setConfirmDeleteId(id)}
      />

      {confirmDeleteId && (
        <ConfirmDeleteDialog
          onConfirm={() => deleteMutation.mutate(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          pending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

function BackupBar({
  onExport,
  onImportClick,
  isExporting,
  isImporting,
  feedback,
}: {
  onExport: () => void
  onImportClick: () => void
  isExporting: boolean
  isImporting: boolean
  feedback: BackupFeedback
}) {
  const { t } = useTranslation('presentations')
  return (
    <Card tone="alt">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-xl font-semibold text-navy">
            {t('backup.title')}
          </h3>
          <p className="text-base text-muted">{t('backup.description')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onExport} disabled={isExporting}>
            {isExporting ? t('backup.exporting') : t('backup.export')}
          </Button>
          <Button variant="ghost" onClick={onImportClick} disabled={isImporting}>
            {isImporting ? t('backup.importing') : t('backup.import')}
          </Button>
        </div>
      </div>
      {feedback && (
        <p
          role="status"
          className={
            feedback.kind === 'success'
              ? 'mt-3 text-base font-medium text-green-700'
              : 'mt-3 text-base font-medium text-red-600'
          }
        >
          {feedback.message}
        </p>
      )}
    </Card>
  )
}

/** Accent- and case-insensitive normalization for friendly search matching. */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Words a presentation should be findable by: client, title, and product. */
function searchHaystack(p: PresentationInputs, t: (k: string) => string): string {
  const productLabel =
    p.productType === 'annuity'
      ? t('product.annuity')
      : p.productType === 'term'
        ? t('product.term')
        : t('product.iul')
  return normalize([p.client.name, p.title, productLabel].filter(Boolean).join(' '))
}

function ListBody({
  query,
  search,
  onSearchChange,
  onCreate,
  creating,
  onOpen,
  onPresent,
  onExportPdf,
  onDuplicate,
  duplicatingId,
  onAskDelete,
}: {
  query: UseQueryResult<PresentationInputs[]>
  search: string
  onSearchChange: (value: string) => void
  onCreate: () => void
  creating: boolean
  onOpen: (id: string) => void
  onPresent: (id: string) => void
  onExportPdf: (id: string) => void
  onDuplicate: (id: string) => void
  duplicatingId: string | null
  onAskDelete: (id: string) => void
}) {
  const { t } = useTranslation('presentations')

  if (query.isLoading) return <Loading label={t('loading')} />

  if (query.isError) {
    return (
      <ErrorState
        title={t('error.title')}
        description={t('error.description')}
        retryLabel={t('error.retry')}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const items = query.data ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        icon="📁"
        title={t('empty.title')}
        description={t('empty.description')}
        action={
          <Button variant="primary" onClick={onCreate} disabled={creating}>
            {creating ? t('creating') : `+ ${t('new')}`}
          </Button>
        }
      />
    )
  }

  const q = normalize(search.trim())
  const filtered = q ? items.filter((p) => searchHaystack(p, t).includes(q)) : items

  // Only worth showing the search box once there's a handful to sift through.
  const showSearch = items.length > 3

  return (
    <div className="space-y-4">
      {showSearch && (
        <TextInput
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t('search.noResults.title')}
          description={t('search.noResults.description')}
          action={
            <Button variant="ghost" onClick={() => onSearchChange('')}>
              {t('search.clear')}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PresentationCard
              key={p.id}
              presentation={p}
              onOpen={() => onOpen(p.id)}
              onPresent={() => onPresent(p.id)}
              onExportPdf={() => onExportPdf(p.id)}
              onDuplicate={() => onDuplicate(p.id)}
              duplicating={duplicatingId === p.id}
              onAskDelete={() => onAskDelete(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** A few at-a-glance numbers for a presentation tile (only the ones that exist). */
function tileStats(
  p: PresentationInputs,
  t: (k: string) => string,
): Array<{ label: string; value: string }> {
  const cur = p.displayCurrency
  const per = (mode: 'monthly' | 'annual') => (mode === 'annual' ? t('tile.perYear') : t('tile.perMonth'))
  const stats: Array<{ label: string; value: string }> = []
  if (p.productType === 'term') {
    const term = p.term
    if (term.deathBenefit != null) stats.push({ label: t('tile.protection'), value: formatMoney(term.deathBenefit, cur) })
    if (term.premium != null) stats.push({ label: t('tile.premium'), value: `${formatMoney(term.premium, cur)}${per(term.premiumMode)}` })
    if (term.termLengthYears != null) stats.push({ label: t('tile.term'), value: `${term.termLengthYears} ${t('tile.years')}` })
  } else {
    const iul = p.iul
    if (iul.deathBenefit != null) stats.push({ label: t('tile.protection'), value: formatMoney(iul.deathBenefit, cur) })
    if (iul.premium != null) stats.push({ label: t('tile.premium'), value: `${formatMoney(iul.premium, cur)}${per(iul.premiumMode)}` })
    if (iul.incomeOptionAnnual != null) {
      stats.push({ label: t('tile.income'), value: `${formatMoney(iul.incomeOptionAnnual, cur)}${t('tile.perYear')}` })
    } else if (iul.projectedAccumulatedValue != null) {
      stats.push({ label: t('tile.value'), value: formatMoney(iul.projectedAccumulatedValue, cur) })
    }
  }
  return stats
}

function PresentationCard({
  presentation,
  onOpen,
  onPresent,
  onExportPdf,
  onDuplicate,
  duplicating,
  onAskDelete,
}: {
  presentation: PresentationInputs
  onOpen: () => void
  onPresent: () => void
  onExportPdf: () => void
  onDuplicate: () => void
  duplicating: boolean
  onAskDelete: () => void
}) {
  const { t } = useTranslation('presentations')
  const name = presentation.client.name.trim() || t('noName')
  const productLabel =
    presentation.productType === 'annuity'
      ? t('product.annuity')
      : presentation.productType === 'term'
        ? t('product.term')
        : t('product.iul')
  const ageBit = presentation.client.age ? ` · ${presentation.client.age} ${t('tile.years')}` : ''
  const subtitle = (presentation.title.trim() ? `${presentation.title} · ${productLabel}` : productLabel) + ageBit
  const stats = tileStats(presentation, t)

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-2xl font-semibold text-navy">
            {name}
          </h3>
          <p className="truncate text-base text-muted">{subtitle}</p>
          <p className="mt-1 text-sm text-muted">
            {t('updated', { date: formatDate(presentation.updatedAt) })}
          </p>
        </div>
        {stats.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-3">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <div className="text-sm font-semibold uppercase tracking-wide text-muted">{s.label}</div>
                <div className="font-serif text-lg font-semibold text-navy tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="md" onClick={onOpen}>
            {t('actions.open')}
          </Button>
          <Button variant="secondary" size="md" onClick={onPresent}>
            {t('actions.present')}
          </Button>
          <Button variant="ghost" size="md" onClick={onExportPdf}>
            {t('actions.exportPdf')}
          </Button>
          <Button variant="ghost" size="md" onClick={onDuplicate} disabled={duplicating}>
            {t('actions.duplicate')}
          </Button>
          <Button variant="ghost" size="md" className="ml-auto text-red-600" onClick={onAskDelete}>
            {t('actions.delete')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ConfirmDeleteDialog({
  onConfirm,
  onCancel,
  pending,
}: {
  onConfirm: () => void
  onCancel: () => void
  pending: boolean
}) {
  const { t } = useTranslation('presentations')
  return (
    <Modal onClose={onCancel} labelledBy="confirm-delete-title" className="max-w-md">
      <h3 id="confirm-delete-title" className="font-serif text-2xl font-semibold text-navy">
        {t('confirmDelete.title')}
      </h3>
      <p className="mt-2 text-base text-muted">{t('confirmDelete.description')}</p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          {t('confirmDelete.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {t('confirmDelete.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
