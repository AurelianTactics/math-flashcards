import { freshStore, migrate } from './schema'
import { STORAGE_KEY, exportJson, importJson, load, saveNow } from './storage'
import type { Attempt } from '../types'

const attempt = (id: string, ts: number): Attempt => ({
  id, ts, sessionId: 's', sig: 'add:1+1', type: 'add', buckets: ['add.within5'], correct: true,
  steps: [{ id: 'answer', tries: 1, firstTry: true }], ms: 500,
})

beforeEach(() => localStorage.clear())

describe('migrate', () => {
  it('garbage becomes a fresh v1 store', () => {
    expect(migrate(null).version).toBe(1)
    expect(migrate('x').version).toBe(1)
    expect(migrate({ version: 99 }).version).toBe(1)
    expect(migrate({ version: 1, attempts: 'nope' }).attempts).toEqual([])
  })
  it('is idempotent and fills missing settings', () => {
    const s = freshStore()
    delete (s.settings as Partial<typeof s.settings>).columnMode
    const m = migrate(s)
    expect(m.settings.columnMode).toBe('auto')
    expect(migrate(m)).toEqual(m)
  })
})

describe('load/save', () => {
  it('round-trips', () => {
    const s = freshStore()
    s.attempts.push(attempt('a', 1))
    saveNow(s)
    expect(load()).toEqual(s)
  })
  it('recovers from corrupt JSON without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(load().attempts).toEqual([])
    expect(Object.keys(localStorage).some((k) => k.includes('corrupt'))).toBe(true)
  })
})

describe('export/import', () => {
  it('export then import replace equals original', () => {
    const s = freshStore()
    s.attempts.push(attempt('a', 1))
    expect(importJson(exportJson(s), freshStore(), 'replace')).toEqual(s)
  })
  it('merge dedupes by id and sorts by time', () => {
    const cur = freshStore()
    cur.attempts.push(attempt('a', 5))
    const inc = freshStore()
    inc.attempts.push(attempt('a', 5), attempt('b', 2))
    const out = importJson(exportJson(inc), cur, 'merge')
    expect(out.attempts.map((a) => a.id)).toEqual(['b', 'a'])
  })
  it('rejects non-exports', () => {
    expect(() => importJson('nope', freshStore(), 'replace')).toThrow(/JSON/)
    expect(() => importJson('{"x":1}', freshStore(), 'replace')).toThrow(/export/)
  })
})
