/**
 * Thin `rows` down to at most `max`, on a UNIFORM integer stride, always keeping
 * the first and last row. A thinned schedule then reads as a deliberate cadence
 * ("every 2nd / 5th year") instead of randomly dropped years — a fractional
 * stride (e.g. 19/15) drops single years unevenly (1, 2, 4, 5, 7…) and looks
 * like a data glitch to a client. `max` is kept low enough that the table fits
 * one 16:9 slide without the last row clipping off the bottom.
 */
export function sampleRows<T>(rows: T[], max: number): T[] {
  if (rows.length <= max) return rows
  const stride = Math.ceil((rows.length - 1) / (max - 1))
  const out: T[] = []
  for (let i = 0; i < rows.length; i += stride) out.push(rows[i])
  const last = rows[rows.length - 1]
  if (out[out.length - 1] !== last) out.push(last)
  return out
}
