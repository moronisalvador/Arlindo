import { useEffect, useState } from 'react'
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
import { profileRepository } from '@persistence'
import type { Branding } from '@domain/model/presentation'
import { queryKeys } from '@app/queryKeys'
import { registerNamespace } from '@i18n/index'
import { ptBR } from './i18n/pt-BR'

registerNamespace('settings', ptBR)

type FieldKey = keyof Branding

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
              <Field key={key} label={t(`fields.${key}`)} htmlFor={key}>
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
    </Section>
  )
}
