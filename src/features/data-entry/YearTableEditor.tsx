import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState } from '@design-system'
import { parseNumberInput } from '@domain/format'
import type { YearlyRow } from '@domain/model/presentation'
import { cn } from '@shared/cn'

type NumField = keyof YearlyRow

const COLUMNS: { key: NumField; labelKey: string; integer?: boolean }[] = [
  { key: 'policyYear', labelKey: 'years.policyYear', integer: true },
  { key: 'age', labelKey: 'years.age', integer: true },
  { key: 'premiumPaid', labelKey: 'years.premiumPaid' },
  { key: 'accumulatedValue', labelKey: 'years.accumulatedValue' },
  { key: 'cashSurrenderValue', labelKey: 'years.cashSurrenderValue' },
  { key: 'deathBenefit', labelKey: 'years.deathBenefit' },
]

/**
 * Editable year-by-year table copied off the carrier illustration. Add / remove
 * rows and edit every cell. A `gen` counter forces a body remount only on
 * structural changes (add/remove) so cell inputs keep focus during typing.
 */
export function YearTableEditor({
  rows,
  onChange,
  clientAge,
  defaultDeathBenefit,
}: {
  rows: YearlyRow[]
  onChange: (next: YearlyRow[]) => void
  /** Seeds the first row's age and increments from there (auto-fill, editable). */
  clientAge?: number
  /** Prefilled into each new row's death benefit (level-DB common case; editable). */
  defaultDeathBenefit?: number
}) {
  const { t } = useTranslation('dataEntry')
  const [gen, setGen] = useState(0)

  const editCell = (index: number, key: NumField, raw: string, integer?: boolean) => {
    const parsed = parseNumberInput(raw)
    const value = parsed == null ? undefined : integer ? Math.round(parsed) : parsed
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
  }

  const addRow = () => {
    const last = rows[rows.length - 1]
    const nextRow: YearlyRow = {
      policyYear: last ? last.policyYear + 1 : 1,
      // Auto-fill age (from the client's age, then +1 each year) and carry the
      // death benefit down (level-DB common case). Every cell stays editable.
      age: last?.age != null ? last.age + 1 : clientAge,
      deathBenefit: last?.deathBenefit ?? defaultDeathBenefit,
    }
    onChange([...rows, nextRow])
    setGen((g) => g + 1)
  }

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index))
    setGen((g) => g + 1)
  }

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <EmptyState icon="📊" title={t('years.empty')} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-alt">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="whitespace-nowrap px-3 py-3 font-sans text-sm font-semibold text-muted"
                  >
                    {t(col.labelKey)}
                  </th>
                ))}
                <th className="px-3 py-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${gen}-${index}`} className="border-t border-line">
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-2 py-2">
                      <CellInput
                        value={row[col.key]}
                        integer={col.integer}
                        onChange={(raw) => editCell(index, col.key, raw, col.integer)}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <Button
                      variant="danger"
                      size="md"
                      aria-label={t('years.removeRow', { year: row.policyYear })}
                      onClick={() => removeRow(index)}
                    >
                      ✕
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button variant="secondary" onClick={addRow}>
        + {t('years.add')}
      </Button>
    </div>
  )
}

/** A single numeric table cell; owns its text state so typing is smooth. */
function CellInput({
  value,
  integer,
  onChange,
}: {
  value: number | undefined
  integer?: boolean
  onChange: (raw: string) => void
}) {
  const [text, setText] = useState(value == null ? '' : String(value))
  return (
    <input
      inputMode={integer ? 'numeric' : 'decimal'}
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onChange(e.target.value)
      }}
      className={cn(
        'w-28 min-w-[5.5rem] rounded-lg border border-line bg-surface px-3 py-2.5 text-base text-ink',
        'focus:border-orange focus:outline-none',
      )}
    />
  )
}
