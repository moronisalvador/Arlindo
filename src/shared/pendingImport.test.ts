import { describe, it, expect } from 'vitest'
import type { ParsedIllustration } from '@domain/illustration/types'
import { setPendingImport, takePendingImport } from './pendingImport'

const parsed = (name: string) => ({ productType: 'iul', client: { name } }) as unknown as ParsedIllustration

describe('pendingImport handoff store', () => {
  it('returns the parsed result once for the matching id, then clears', () => {
    setPendingImport('abc', parsed('Jose'))
    const first = takePendingImport('abc')
    expect(first?.client.name).toBe('Jose')
    // one-shot: a second take (e.g. StrictMode re-run) yields nothing
    expect(takePendingImport('abc')).toBeNull()
  })

  it('does not hand a pending import to a different presentation id', () => {
    setPendingImport('abc', parsed('Jose'))
    expect(takePendingImport('other')).toBeNull()
    // still available for the id it was meant for
    expect(takePendingImport('abc')?.client.name).toBe('Jose')
  })

  it('returns null when nothing is pending', () => {
    expect(takePendingImport('whatever')).toBeNull()
  })
})
