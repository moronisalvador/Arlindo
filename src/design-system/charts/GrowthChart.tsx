import {
  Area,
  AreaChart,
  CartesianGrid,
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
}: GrowthChartProps) {
  const data = years.map((y, i) => ({ year: y, value: values[i] ?? 0 }))

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
      />
      <YAxis
        tick={{ fill: palette.muted, fontSize: 14 }}
        tickLine={false}
        axisLine={false}
        width={72}
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
