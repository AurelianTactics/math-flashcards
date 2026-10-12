import { additionGenerator } from './addition'
import { subtractionGenerator } from './subtraction'
import { generateForBucket, problemFromSignature } from './index'
import { createRng } from '../rng'
import { DEFAULT_SETTINGS } from '../storage/schema'
import { bucketsForType } from '../skills/buckets'

const N = 1000

describe.each([
  ['add', additionGenerator],
  ['sub', subtractionGenerator],
] as const)('%s generator', (type, gen) => {
  it('covers every bucket in the catalog', () => {
    expect(gen.buckets.slice().sort()).toEqual(bucketsForType(type).map((b) => b.id).sort())
  })
  for (const bucket of bucketsForType(type).map((b) => b.id)) {
    it(`${bucket}: classifies back to itself, never negative, result <= 99`, () => {
      const rng = createRng(7)
      for (let i = 0; i < N; i++) {
        const p = gen.generate(bucket, rng, DEFAULT_SETTINGS)
        expect(p.buckets[0]).toBe(bucket)
        const d = p.data
        if (d.type !== 'add' && d.type !== 'sub') throw new Error('wrong data type')
        const result = d.type === 'add' ? d.a + d.b : d.a - d.b
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(99)
        expect(p.steps.length).toBeGreaterThan(0)
        if (p.layout === 'inline') expect(p.steps[0].id).toBe('answer')
        else expect(p.steps[0].id).not.toBe('answer')
      }
    })
  }
  it('round-trips through fromSignature', () => {
    const rng = createRng(11)
    for (const bucket of gen.buckets) {
      const p = gen.generate(bucket, rng, DEFAULT_SETTINGS)
      const q = problemFromSignature(p.signature, rng, DEFAULT_SETTINGS)
      expect(q?.data).toEqual(p.data)
      expect(q?.buckets).toEqual(p.buckets)
    }
  })
})

describe('carry/borrow buckets use column layout', () => {
  it('carry buckets always columns, within10 never', () => {
    const rng = createRng(3)
    for (let i = 0; i < 200; i++) {
      expect(generateForBucket('add.2d2d.carry', rng, DEFAULT_SETTINGS).layout).toBe('columns')
      expect(generateForBucket('sub.2d2d.borrow', rng, DEFAULT_SETTINGS).layout).toBe('columns')
      expect(generateForBucket('add.within10', rng, DEFAULT_SETTINGS).layout).toBe('inline')
    }
  })
  it('explanations match size', () => {
    const rng = createRng(5)
    expect(generateForBucket('add.within5', rng, DEFAULT_SETTINGS).explanation.kind).toBe('dots')
    expect(generateForBucket('add.teenMakeTen', rng, DEFAULT_SETTINGS).explanation.kind).toBe('tenFrame')
    expect(generateForBucket('add.2d2d.carry', rng, DEFAULT_SETTINGS).explanation.kind).toBe('columns')
    expect(generateForBucket('sub.acrossTen', rng, DEFAULT_SETTINGS).explanation.kind).toBe('tenFrame')
    expect(generateForBucket('sub.2d1d.borrow', rng, DEFAULT_SETTINGS).explanation.kind).toBe('columns')
  })
})
