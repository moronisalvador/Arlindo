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
  NavyHeaderBar,
} from '@design-system'
import {
  presentationRepository,
  profileRepository,
  type BackupFile,
} from '@persistence'
import type { PresentationInputs } from '@domain/model/presentation'
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

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<BackupFeedback>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    mutationFn: async () => {
      const profile = await profileRepository.get()
      const created = await presentationRepository.create({
        branding: profile,
        productType: 'iul',
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

  return (
    <div className="space-y-6">
      <NavyHeaderBar
        eyebrow={t('eyebrow')}
        title={t('title')}
        className="rounded-card"
        showLogo={false}
        right={
          <Button
            variant="primary"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? t('creating') : `+ ${t('new')}`}
          </Button>
        }
      />

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

      <ListBody
        query={query}
        onCreate={() => createMutation.mutate()}
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

function ListBody({
  query,
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

  return (
    <div className="grid gap-4">
      {items.map((p) => (
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
  )
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
      : t('product.iul')
  const subtitle = presentation.title.trim()
    ? `${presentation.title} · ${productLabel}`
    : productLabel

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
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={onOpen}>
            {t('actions.open')}
          </Button>
          <Button variant="secondary" onClick={onPresent}>
            {t('actions.present')}
          </Button>
          <Button variant="ghost" onClick={onExportPdf}>
            {t('actions.exportPdf')}
          </Button>
          <Button variant="ghost" onClick={onDuplicate} disabled={duplicating}>
            {t('actions.duplicate')}
          </Button>
          <Button variant="danger" onClick={onAskDelete}>
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-5"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-card bg-surface p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-2xl font-semibold text-navy">
          {t('confirmDelete.title')}
        </h3>
        <p className="mt-2 text-base text-muted">
          {t('confirmDelete.description')}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {t('confirmDelete.cancel')}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {t('confirmDelete.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
