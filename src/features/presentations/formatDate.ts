/** pt-BR date formatting helper for the presentations feature. */
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/**
 * Format an ISO date string (e.g. `updatedAt`) as a pt-BR date like "18/07/2026".
 * Returns "—" when the value is missing or unparseable.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return dateFormatter.format(d)
}

/** A filename-safe date stamp for backup files, e.g. "2026-07-18". */
export function fileDateStamp(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
