import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney } from '@domain/format'
import type { CurrencyCode } from '@domain/model/presentation'
import { palette } from '@design-system/tokens/palette'

export interface GrowthChartProps {
  years: number[]
  values: number[]
  currency?: CurrencyCode
  /** Fixed pixel size (default) keeps present + print identical. Pass responsive for editor previews. */
  width?: number
  height?: number
  responsive?: boolean
  locale?: string
  /** Word for "Year" in the tooltip (default pt "Ano"). */
  yearLabel?: string
  /** Axis title under the X ticks, naming the unit (e.g. "Ano"). Omit to hide. */
  xAxisLabel?: string
  /**
   * Anchor the headline figure on the curve: a guide + dot at (markerYear, markerValue),
   * so a "value in N years" callout maps to a visible point. Both required to show it.
   */
  markerYear?: number | null
  markerValue?: number | null
}

/** Accumulated-value growth as an orange area over policy years (SVG → vector in PDF). */
export function GrowthChart({
  years,
  values,
  currency = 'USD',
  width = 900,
  height = 340,
  responsive = false,
  locale,
  yearLabel = 'Ano',
  xAxisLabel,
  markerYear,
  markerValue,
}: GrowthChartProps) {
  const data = years.map((y, i) => ({ year: y, value: values[i] ?? 0 }))
  const showMarker =
    markerYear != null && markerValue != null && years.includes(markerYear) && years.length > 1
  // Keep the value label inside the plot: anchor it left of the dot near the right edge.
  const markerFrac = showMarker
    ? (markerYear! - years[0]) / (years[years.length - 1] - years[0] || 1)
    : 0
  const markerLabelPos = markerFrac > 0.82 ? 'left' : 'top'

  const chart = (
    <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
      <defs>
        <linearGradient id="scf-growth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.orange} stopOpacity={0.85} />
          <stop offset="100%" stopColor={palette.orange} stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke={palette.line} vertical={false} />
      <XAxis
        dataKey="year"
        tick={{ fill: palette.muted, fontSize: 14 }}
        tickLine={false}
        axisLine={{ stroke: palette.line }}
        height={xAxisLabel ? 44 : 30}
        label={
          xAxisLabel
            ? { value: xAxisLabel, position: 'insideBottom', offset: 0, fill: palette.muted, fontSize: 13 }
            : undefined
        }
      />
      <YAxis
        tick={{ fill: palette.muted, fontSize: 14 }}
        tickLine={false}
        axisLine={false}
        width={104}
        tickFormatter={(v) => formatMoney(v, currency, { compact: true, locale })}
      />
      <Tooltip
        formatter={(v: number) => formatMoney(v, currency, { locale })}
        labelFormatter={(l) => `${yearLabel} ${l}`}
        contentStyle={{ borderRadius: 12, border: `1px solid ${palette.line}` }}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke={palette.orange}
        strokeWidth={3}
        fill="url(#scf-growth)"
      />
      {showMarker && (
        <ReferenceLine
          x={markerYear as number}
          stroke={palette.muted}
          strokeDasharray="4 4"
          strokeOpacity={0.6}
        />
      )}
      {showMarker && (
        <ReferenceDot
          x={markerYear as number}
          y={markerValue as number}
          r={6}
          fill={palette.navy}
          stroke={palette.surface}
          strokeWidth={2}
          isFront
          label={{
            value: formatMoney(markerValue as number, currency, { compact: true, locale }),
            position: markerLabelPos,
            fill: palette.navy,
            fontSize: 13,
            fontWeight: 700,
          }}
        />
      )}
    </AreaChart>
  )

  if (responsive) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        {chart}
      </ResponsiveContainer>
    )
  }
  return (
    <ResponsiveContainer width={width} height={height}>
      {chart}
    </ResponsiveContainer>
  )
}
