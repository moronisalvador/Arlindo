import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Field, TextInput } from '@design-system'
import { formatMoney, parseNumberInput } from '@domain/format'
import type { CurrencyCode } from '@domain/model/presentation'
import { cn } from '@shared/cn'

/**
 * Numeric input tuned for an older user: big touch target, numeric keyboard,
 * lenient pt-BR parsing, and an optional live money preview under the field.
 * Keeps its own text state so typing is never fought by the working-copy round
 * trip; reports the parsed number (rounded for integer fields) upward.
 */
export function NumberField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  integer = false,
  money = false,
  currency = 'USD',
  suffix,
}: {
  label: string
  value: number | undefined
  onChange: (n: number | undefined) => void
  hint?: ReactNode
  placeholder?: string
  integer?: boolean
  money?: boolean
  currency?: CurrencyCode
  suffix?: string
}) {
  const [text, setText] = useState(value == null ? '' : String(value))
  const focused = useRef(false)

  // Reflect external value changes (e.g. the 80%/100% quick buttons, or a clamp)
  // into the visible input — but never fight the user while they're typing.
  useEffect(() => {
    if (focused.current) return
    const next = value == null ? '' : String(value)
    if (parseNumberInput(text) !== value) setText(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handle = (raw: string) => {
    setText(raw)
    const parsed = parseNumberInput(raw)
    if (parsed == null) {
      onChange(undefined)
    } else {
      onChange(integer ? Math.round(parsed) : parsed)
    }
  }

  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <TextInput
          inputMode={integer ? 'numeric' : 'decimal'}
          value={text}
          placeholder={placeholder}
          onFocus={() => {
            focused.current = true
          }}
          onBlur={() => {
            focused.current = false
          }}
          onChange={(e) => handle(e.target.value)}
          className={suffix ? 'pr-16' : undefined}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted">
            {suffix}
          </span>
        )}
      </div>
      {money && (
        <span className="mt-1 block text-lg font-semibold text-navy">
          {formatMoney(value, currency)}
        </span>
      )}
    </Field>
  )
}

/** Plain text input wrapped in a Field. */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: ReactNode
}) {
  return (
    <Field label={label} hint={hint}>
      <TextInput value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

/** A large on/off pill toggle (accessible via role=switch). */
export function Toggle({
  on,
  onToggle,
  onLabel,
  offLabel,
}: {
  on: boolean
  onToggle: (next: boolean) => void
  onLabel: string
  offLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onToggle(!on)}
      className={cn(
        'inline-flex min-h-[3.25rem] items-center gap-3 rounded-xl border px-5 font-sans text-lg font-semibold transition-colors',
        on
          ? 'border-orange bg-orange text-white'
          : 'border-line bg-surface text-muted hover:bg-surface-alt',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-12 items-center rounded-full p-1 transition-colors',
          on ? 'justify-end bg-white/40' : 'justify-start bg-line',
        )}
        aria-hidden
      >
        <span className="h-5 w-5 rounded-full bg-white shadow" />
      </span>
      {on ? onLabel : offLabel}
    </button>
  )
}

/** A large segmented control for a small set of choices (sex, premium mode). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | undefined
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                'min-h-[3.25rem] flex-1 rounded-xl border px-5 font-sans text-lg font-semibold transition-colors',
                active
                  ? 'border-navy bg-navy text-white'
                  : 'border-line bg-surface text-ink hover:bg-surface-alt',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </Field>
  )
}
