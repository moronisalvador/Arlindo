import { cn } from '@shared/cn'

/**
 * Second Chance Financial brand lockup — a gold monogram badge ("SCF") beside the
 * stacked wordmark, drawn as inline SVG so it stays crisp in the header chip, on
 * the cover slide, and in the PDF/PPTX export. A faithful navy + gold recreation
 * (brand colors #0E2148 / #DDA22E) built from the reference logo.
 *
 * `variant`:
 *  - `color` — navy wordmark on a gold badge, for light backgrounds.
 *  - `light` — white wordmark on a gold badge, for the navy background.
 *  - `mark`  — the gold "SCF" badge only (no wordmark), for tight spaces.
 *
 * Size via `className` height (e.g. `h-9`); width scales automatically.
 */
export function BrandLogo({
  variant = 'color',
  className,
}: {
  variant?: 'color' | 'light' | 'mark'
  className?: string
}) {
  const navy = '#0E2148'
  const gold = '#DDA22E'
  const goldDark = '#B0801C'
  const wordFill = variant === 'light' ? '#FFFFFF' : navy
  const wordMuted = variant === 'light' ? 'rgba(255,255,255,0.82)' : 'rgba(14,33,72,0.72)'

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label="Second Chance Financial"
        className={cn('inline-block h-8 w-auto', className)}
      >
        <Badge navy={navy} gold={gold} goldDark={goldDark} />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 300 64"
      role="img"
      aria-label="Second Chance Financial"
      className={cn('inline-block h-8 w-auto', className)}
    >
      <Badge navy={navy} gold={gold} goldDark={goldDark} />
      <g fontFamily="Georgia, 'Times New Roman', serif">
        <text
          x="80"
          y="30"
          fontSize="22"
          fontWeight="700"
          fill={wordFill}
          letterSpacing="0.5"
        >
          Second Chance
        </text>
      </g>
      <g fontFamily="Arial, Helvetica, sans-serif">
        <text
          x="81"
          y="50"
          fontSize="13"
          fontWeight="600"
          fill={wordMuted}
          letterSpacing="5.5"
        >
          FINANCIAL
        </text>
      </g>
      <rect x="82" y="37" width="150" height="2.5" rx="1.25" fill={gold} />
    </svg>
  )
}

/** The gold rounded-square monogram badge with a serif "SCF" in navy. */
function Badge({ navy, gold, goldDark }: { navy: string; gold: string; goldDark: string }) {
  return (
    <g>
      <defs>
        <linearGradient id="scf-badge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={gold} />
          <stop offset="1" stopColor={goldDark} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#scf-badge)" />
      <text
        x="32"
        y="43"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="27"
        fontWeight="700"
        letterSpacing="0.5"
        fill={navy}
      >
        SCF
      </text>
    </g>
  )
}
