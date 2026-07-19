import type { ReactNode } from 'react'
import { cn } from '@shared/cn'

export interface Column<Row> {
  key: string
  header: ReactNode
  render: (row: Row) => ReactNode
  align?: 'left' | 'right' | 'center'
  emphasize?: boolean
}

export interface DataTableProps<Row> {
  columns: Array<Column<Row>>
  rows: Row[]
  rowKey: (row: Row, index: number) => string
  highlightRow?: (row: Row, index: number) => boolean
  className?: string
}

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' }

/** Compact, readable table. Highlighted rows get a soft navy tint (SCF motif). */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  highlightRow,
  className,
}: DataTableProps<Row>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="border-b-2 border-navy/15">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'px-3 py-2 font-sans text-sm font-semibold uppercase tracking-wide text-muted',
                  alignClass[c.align ?? 'left'],
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const highlighted = highlightRow?.(row, i)
            return (
            <tr
              key={rowKey(row, i)}
              className={cn(
                'border-b border-line',
                // Subtle zebra striping aids row tracking across wide tables; the
                // highlighted row's stronger tint takes precedence over it.
                !highlighted && i % 2 === 1 && 'bg-navy/[0.03]',
                highlighted && 'bg-navy/10 font-semibold',
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'px-3 py-2 tabular-nums',
                    alignClass[c.align ?? 'left'],
                    c.emphasize && 'font-serif font-semibold text-navy',
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
