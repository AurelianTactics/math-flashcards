import { GENERATORS, problemFromSignature } from './index'
import { createRng } from '../rng'
import { DEFAULT_SETTINGS } from '../storage/schema'
import { BUCKETS, bucketsForType } from '../skills/buckets'
import { CARD_TYPES } from '../types'

describe('every card type has a generator covering its buckets', () => {
  it.each(CARD_TYPES)('%s', (type) => {
    const g = GENERATORS[type]
    expect(g).toBeDefined()
    expect(g!.buckets.slice().sort()).toEqual(bucketsForType(type).map((b) => b.id).sort())
  })
})

describe.each(BUCKETS.map((b) => [b.id, b.type] as const))('%s', (bucket, type) => {
  it('generates valid problems that classify to the bucket and round-trip', () => {
    const g = GENERATORS[type]!
    const rng = createRng(bucket.length * 31)
    for (let i = 0; i < 300; i++) {
      const p = g.generate(bucket, rng, DEFAULT_SETTINGS)
      expect(p.type).toBe(type)
      expect(p.buckets[0]).toBe(bucket)
      expect(p.steps.length).toBeGreaterThan(0)
      for (const s of p.steps) {
        if (s.kind === 'digits') {
          expect(s.expected).toMatch(/^\d+$/)
          expect(s.expected.length).toBeLessThanOrEqual(s.maxLen)
        } else {
          expect(s.expected).toBeGreaterThanOrEqual(0)
          expect(s.expected).toBeLessThan(s.options.length)
          expect(new Set(s.options.map((o) => o.key)).size).toBe(s.options.length)
        }
      }
      const q = problemFromSignature(p.signature, rng, DEFAULT_SETTINGS)
      expect(q, `fromSignature failed for ${p.signature}`).not.toBeNull()
      expect(q!.signature).toBe(p.signature)
      expect(q!.data).toEqual(p.data)
      expect(q!.buckets).toEqual(p.buckets)
      // add/sub may re-roll the optional column layout; only compare steps when the layout matches
      if (q!.layout === p.layout) expect(q!.steps.map((s) => s.expected)).toEqual(p.steps.map((s) => s.expected))
    }
  })
})

describe('type-specific sanity', () => {
  const rng = createRng(99)
  it('sequences stay within 0..100 and have exactly one blank', () => {
    for (const b of GENERATORS.sequence!.buckets) {
      for (let i = 0; i < 200; i++) {
        const p = GENERATORS.sequence!.generate(b, rng, DEFAULT_SETTINGS)
        if (p.data.type !== 'sequence') throw new Error()
        expect(p.data.items.filter((x) => x === null)).toHaveLength(1)
        for (const v of [...p.data.items, p.data.answer]) if (v !== null) {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(100)
        }
      }
    }
  })
  it('grid answers stay within 1..100', () => {
    for (const b of GENERATORS.numberGrid!.buckets) {
      for (let i = 0; i < 200; i++) {
        const p = GENERATORS.numberGrid!.generate(b, rng, DEFAULT_SETTINGS)
        if (p.data.type !== 'numberGrid') throw new Error()
        expect(p.data.answer).toBeGreaterThanOrEqual(1)
        expect(p.data.answer).toBeLessThanOrEqual(100)
      }
    }
  })
  it('number line targets stay on the line', () => {
    for (const b of GENERATORS.numberLine!.buckets) {
      for (let i = 0; i < 200; i++) {
        const p = GENERATORS.numberLine!.generate(b, rng, DEFAULT_SETTINGS)
        if (p.data.type !== 'numberLine') throw new Error()
        expect(p.data.target).toBeGreaterThanOrEqual(p.data.min)
        expect(p.data.target).toBeLessThanOrEqual(p.data.max)
      }
    }
  })
  it('missing-number answers are never negative', () => {
    for (const b of GENERATORS.missing!.buckets) {
      for (let i = 0; i < 200; i++) {
        const p = GENERATORS.missing!.generate(b, rng, DEFAULT_SETTINGS)
        if (p.data.type !== 'missing') throw new Error()
        expect(p.data.answer).toBeGreaterThanOrEqual(0)
      }
    }
  })
  it('comparison answers are consistent with the mode', () => {
    for (let i = 0; i < 300; i++) {
      const p = GENERATORS.compare!.generate('compare.expressions', rng, DEFAULT_SETTINGS)
      if (p.data.type !== 'compare') throw new Error()
      if (p.data.mode === 'eqne') expect(['=', '!=']).toContain(p.data.answer)
      else expect(['<', '>', '=']).toContain(p.data.answer)
    }
  })
})
