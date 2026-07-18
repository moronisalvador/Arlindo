import { beforeEach, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { IdbPresentationRepository } from './IdbPresentationRepository'
import { resetDbForTests } from './db'

describe('IdbPresentationRepository', () => {
  let repo: IdbPresentationRepository

  beforeEach(() => {
    // Fresh in-memory IndexedDB per test.
    globalThis.indexedDB = new IDBFactory()
    resetDbForTests()
    repo = new IdbPresentationRepository()
  })

  it('creates, lists, and gets a presentation', async () => {
    const created = await repo.create({ client: { name: 'Iracema' } })
    expect(created.id).toBeTruthy()
    expect(created.client.name).toBe('Iracema')

    const list = await repo.list()
    expect(list).toHaveLength(1)

    const fetched = await repo.get(created.id)
    expect(fetched?.client.name).toBe('Iracema')
  })

  it('prefills IUL riders and disclaimers on create', async () => {
    const created = await repo.create()
    expect(created.iul.riders.length).toBeGreaterThan(0)
    expect(created.disclaimers.length).toBeGreaterThan(0)
  })

  it('duplicates a presentation with a new id', async () => {
    const a = await repo.create({ client: { name: 'Ana' } })
    const b = await repo.duplicate(a.id)
    expect(b.id).not.toBe(a.id)
    expect(b.client.name).toContain('cópia')
    expect(await repo.list()).toHaveLength(2)
  })

  it('exports and re-imports as a backup round-trip', async () => {
    await repo.create({ client: { name: 'Bruno' } })
    const backup = await repo.exportAll()
    expect(backup.presentations).toHaveLength(1)

    await repo.import(backup, 'replace')
    expect(await repo.list()).toHaveLength(1)
  })

  it('notifies observers on change', async () => {
    let calls = 0
    const off = repo.observe(() => {
      calls += 1
    })
    await repo.create()
    expect(calls).toBe(1)
    off()
    await repo.create()
    expect(calls).toBe(1)
  })
})
