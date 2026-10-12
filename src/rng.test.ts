import { createRng } from './rng'

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()))
  })
  it('int stays within inclusive bounds', () => {
    const r = createRng(1)
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i++) {
      const v = r.int(3, 7)
      expect(v).toBeGreaterThanOrEqual(3)
      expect(v).toBeLessThanOrEqual(7)
      seen.add(v)
    }
    expect(seen.size).toBe(5)
  })
  it('shuffle keeps elements', () => {
    const r = createRng(9)
    expect(r.shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4])
  })
})
