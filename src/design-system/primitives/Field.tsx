import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@shared/cn'

const controlBase =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-lg text-ink ' +
  'placeholder:text-muted focus:border-orange focus:outline-none min-h-[3.25rem]'

export interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  htmlFor?: string
  children: ReactNode
  className?: string
}

/** Label + control wrapper with big text and clear hint/error slots. */
export function Field({ label, hint, error, htmlFor, children, className }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className={cn('block', className)}>
      <span className="mb-1.5 block font-sans text-base font-semibold text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-sm text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-sm font-medium text-red-600">{error}</span>}
    </label>
  )
}

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(controlBase, className)} {...rest} />
})
