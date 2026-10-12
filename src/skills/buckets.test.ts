import { BUCKETS, bucketsForType, classifyAddSub } from './buckets'
import { CARD_TYPES } from '../types'

describe('bucket catalog', () => {
  it('has unique ids', () => {
    const ids = BUCKETS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('tiers are contiguous from 1 within each type', () => {
    for (const type of CARD_TYPES) {
      const tiers = [...new Set(bucketsForType(type).map((b) => b.tier))].sort((a, b) => a - b)
      expect(tiers[0]).toBe(1)
      tiers.forEach((t, i) => expect(t).toBe(i + 1))
    }
  })
})

describe('classifyAddSub', () => {
  it.each([
    [2, 3, 'add.within5'],
    [0, 1, 'add.within5'],
    [7, 3, 'add.within10'],
    [5, 5, 'add.within10'],
    [10, 5, 'add.tensPlusOnes'],
    [7, 20, 'add.tensPlusOnes'],
    [9, 9, 'add.teenMakeTen'],
    [8, 5, 'add.teenMakeTen'],
    [23, 4, 'add.2d1d.noCarry'],
    [37, 5, 'add.2d1d.carry'],
    [45, 32, 'add.2d2d.noCarry'],
    [37, 25, 'add.2d2d.carry'],
  ])('%i + %i -> %s', (a, b, bucket) => {
    expect(classifyAddSub(a, b, '+')[0]).toBe(bucket)
  })
  it('tags doubles', () => {
    expect(classifyAddSub(4, 4, '+')).toEqual(['add.within10', 'add.doubles'])
    expect(classifyAddSub(9, 9, '+')).toContain('add.doubles')
    expect(classifyAddSub(20, 20, '+')).not.toContain('add.doubles')
  })
  it.each([
    [5, 2, 'sub.within5'],
    [10, 4, 'sub.within10'],
    [15, 3, 'sub.teenNoBorrow'],
    [14, 6, 'sub.acrossTen'],
    [25, 3, 'sub.2d1d.noBorrow'],
    [52, 7, 'sub.2d1d.borrow'],
    [46, 23, 'sub.2d2d.noBorrow'],
    [52, 17, 'sub.2d2d.borrow'],
    [30, 10, 'sub.2d2d.noBorrow'],
  ])('%i - %i -> %s', (a, b, bucket) => {
    expect(classifyAddSub(a, b, '-')[0]).toBe(bucket)
  })
  it('tags tens apart', () => {
    expect(classifyAddSub(30, 10, '-')).toContain('sub.tensApart')
  })
})
