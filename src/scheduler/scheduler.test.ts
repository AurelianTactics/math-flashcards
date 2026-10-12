import { pickNext, availableTypes } from './scheduler'
import { createRng } from '../rng'
import { DEFAULT_SETTINGS } from '../storage/schema'
import { bucketStats } from '../skills/stats'
import { bucketDef } from '../skills/buckets'
import type { Attempt } from '../types'

const mk = (sig: string, bucket: string, correct: boolean, ts: number, type: 'add' | 'sub' = 'add'): Attempt => ({
  id: `${sig}-${ts}`, ts, sessionId: 's', sig, type, buckets: [bucket], correct,
  steps: [{ id: 'answer', tries: 1, firstTry: correct }], ms: 1000,
})

describe('pickNext', () => {
  it('serves ~80% add/sub when other types exist', () => {
    const rng = createRng(1)
    let addSub = 0
    const N = 2000
    for (let i = 0; i < N; i++) {
      const p = pickNext({ attempts: [], settings: DEFAULT_SETTINGS, recentSigs: [], rng })
      if (p.type === 'add' || p.type === 'sub') addSub++
    }
    const expected = availableTypes().length === 2 ? 1 : 0.8
    expect(addSub / N).toBeGreaterThan(expected - 0.04)
    if (availableTypes().length > 2) expect(addSub / N).toBeLessThan(0.84)
  })
  it('only serves unlocked (tier 1) buckets with no history', () => {
    const rng = createRng(2)
    for (let i = 0; i < 500; i++) {
      const p = pickNext({ attempts: [], settings: DEFAULT_SETTINGS, recentSigs: [], rng })
      expect(bucketDef(p.buckets[0])?.tier).toBe(1)
    }
  })
  it('gives mastered buckets ~25% once others are unlocked', () => {
    const attempts: Attempt[] = []
    for (let i = 0; i < 20; i++) attempts.push(mk(`add:1+${i % 4}`, 'add.within5', true, i))
    const stats = bucketStats(attempts)
    expect(stats['add.within5'].mastery).toBe('mastered')
    expect(stats['add.within10'].unlocked).toBe(true)
    const rng = createRng(3)
    let mastered = 0
    const N = 3000
    for (let i = 0; i < N; i++) {
      const p = pickNext({ attempts, settings: { ...DEFAULT_SETTINGS, typeWeights: { add: 1, sub: 0 } }, recentSigs: [], rng, stats })
      if (p.buckets[0] === 'add.within5') mastered++
    }
    expect(mastered / N).toBeGreaterThan(0.18)
    expect(mastered / N).toBeLessThan(0.32)
  })
  it('re-serves weak signatures about 15% of the time', () => {
    const attempts = [mk('add:2+3', 'add.within5', false, 1)]
    const rng = createRng(4)
    let weak = 0
    const N = 3000
    for (let i = 0; i < N; i++) {
      const p = pickNext({ attempts, settings: DEFAULT_SETTINGS, recentSigs: [], rng })
      if (p.signature === 'add:2+3') weak++
    }
    expect(weak / N).toBeGreaterThan(0.13)
    expect(weak / N).toBeLessThan(0.24)
  })
  it('avoids signatures served in the last 5 when it can', () => {
    const rng = createRng(5)
    const recent = ['add:1+1', 'add:1+2', 'add:2+1', 'add:0+1', 'add:1+0']
    let repeats = 0
    for (let i = 0; i < 300; i++) {
      const p = pickNext({ attempts: [], settings: { ...DEFAULT_SETTINGS, typeWeights: { add: 1, sub: 0 } }, recentSigs: recent, rng })
      if (recent.includes(p.signature)) repeats++
    }
    expect(repeats).toBeLessThan(10)
  })
})
