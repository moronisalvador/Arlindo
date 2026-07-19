import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  ErrorState,
  Field,
  Loading,
  Section,
  TextInput,
} from '@design-system'
import { presentationRepository, profileRepository, type BackupFile } from '@persistence'
import type { Branding } from '@domain/model/presentation'
import { queryKeys } from '@app/queryKeys'
import { registerNamespace } from '@i18n/index'
import { ptBR } from './i18n/pt-BR'

registerNamespace('settings', ptBR)

type FieldKey = keyof Branding

/** Filename-safe date stamp for backup files, e.g. "2026-07-18". */
function fileDateStamp(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

type BackupFeedback = { kind: 'success' | 'error'; message: string } | null

const FIELD_ORDER: FieldKey[] = [
  'agentName',
  'agentTitle',
  'agentLicense',
  'company',
  'carrier',
]

export default function SettingsPage() {
  const { t } = useTranslation('settings')
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Branding | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  const query = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => profileRepository.get(),
  })

  // Seed the local form once the profile loads.
  useEffect(() => {
    if (query.data && form === null) {
      setForm(query.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data])

  const saveMutation = useMutation({
    mutationFn: (profile: Branding) => profileRepository.save(profile),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      setJustSaved(true)
      window.setTimeout(() => setJustSaved(false), 2500)
    },
  })

  function updateField(key: FieldKey, value: string) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
    setJustSaved(false)
  }

  return (
    <Section eyebrow={t('eyebrow')} title={t('title')}>
      <p className="text-base text-muted">{t('description')}</p>

      {query.isLoading || form === null ? (
        <Loading label={t('loading')} />
      ) : query.isError ? (
        <ErrorState
          title={t('error.title')}
          retryLabel={t('error.retry')}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <Card>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate(form)
            }}
          >
            {FIELD_ORDER.map((key) => (
              <Field
                key={key}
                label={t(`fields.${key}`)}
                htmlFor={key}
                hint={key === 'agentName' ? t('hints.agentName') : undefined}
              >
                <TextInput
                  id={key}
                  value={form[key]}
                  placeholder={t(`placeholders.${key}`)}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              </Field>
            ))}

            {saveMutation.isError && (
              <p role="alert" className="text-base font-medium text-red-600">
                {t('error.save')}
              </p>
            )}

            <div className="flex items-center gap-4">
              <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('saving') : t('save')}
              </Button>
              {justSaved && (
                <span
                  role="status"
                  className="text-base font-semibold text-green-700"
                >
                  {t('saved')}
                </span>
              )}
            </div>
          </form>
        </Card>
      )}

      <BackupCard />
    </Section>
  )
}

/** Export/import all presentations as a JSON backup file (local-first safety net). */
function BackupCard() {
  const { t } = useTranslation('settings')
  const [feedback, setFeedback] = useState<BackupFeedback>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFeedback(null)
    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as BackupFile
      await presentationRepository.import(data, 'merge')
      setFeedback({ kind: 'success', message: t('backup.successImport') })
    } catch {
      setFeedback({ kind: 'error', message: t('backup.errorImport') })
    } finally {
      setIsImporting(false)
    }
  }

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
          <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
            {isExporting ? t('backup.exporting') : t('backup.export')}
          </Button>
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            {isImporting ? t('backup.importing') : t('backup.import')}
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />
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
