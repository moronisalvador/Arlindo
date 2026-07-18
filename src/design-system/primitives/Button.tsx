import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@shared/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'lg' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-orange text-navy hover:bg-orange-dark active:bg-orange-dark',
  secondary: 'bg-navy text-white hover:bg-navy-deep active:bg-navy-deep',
  ghost: 'bg-transparent text-navy hover:bg-surface-alt border border-line',
  danger: 'bg-transparent text-red-600 hover:bg-red-50 border border-red-200',
}

const sizes: Record<Size, string> = {
  lg: 'min-h-[3.5rem] px-6 text-lg', // 56px — large touch target
  md: 'min-h-[2.75rem] px-4 text-base',
}

/** Large, high-contrast button. Defaults to the big `lg` size for touch use. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', fullWidth, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-sans font-semibold',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  )
})
