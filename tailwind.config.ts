import type { Config } from 'tailwindcss'

/**
 * SCF (Second Chance Financial) design tokens are declared as CSS variables in
 * src/design-system/tokens/tokens.css (space-separated RGB triplets so Tailwind's
 * `/<alpha-value>` opacity modifiers work). Swapping the brand = editing tokens.css.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'rgb(var(--navy) / <alpha-value>)',
          deep: 'rgb(var(--navy-deep) / <alpha-value>)',
          soft: 'rgb(var(--navy-soft) / <alpha-value>)',
        },
        orange: {
          DEFAULT: 'rgb(var(--orange) / <alpha-value>)',
          dark: 'rgb(var(--orange-dark) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          alt: 'rgb(var(--surface-alt) / <alpha-value>)',
        },
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        serif: 'var(--font-serif)',
        sans: 'var(--font-sans)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
      },
      zIndex: {
        header: 'var(--z-header)',
        nav: 'var(--z-nav)',
        overlay: 'var(--z-overlay)',
        present: 'var(--z-present)',
        toast: 'var(--z-toast)',
      },
      letterSpacing: {
        eyebrow: '0.14em',
      },
      maxWidth: {
        content: '80rem',
      },
    },
  },
  plugins: [],
} satisfies Config
