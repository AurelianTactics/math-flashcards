import { bucketStats, learningPlan, masteryFor, summarizeSession, trendFor, weightedAccuracy } from './stats'
import { weakSignatures } from './weak'
import type { Attempt } from '../types'

const mk = (sig: string, bucket: string, correct: boolean, ts: number, firstWrongStep?: Attempt['firstWrongStep']): Attempt => ({
  id: `${sig}-${ts}`, ts, sessionId: 's1', sig, type: 'add', buckets: [bucket], correct,
  steps: [{ id: 'answer', tries: 1, firstTry: correct }], firstWrongStep, ms: 1000,
})

describe('mastery', () => {
  it('thresholds', () => {
    expect(masteryFor(3, 1)).toBe('new')
    expect(masteryFor(6, 0.5)).toBe('learning')
    expect(masteryFor(6, 0.8)).toBe('improving')
    expect(masteryFor(6, 0.95)).toBe('improving')
    expect(masteryFor(12, 0.95)).toBe('mastered')
  })
  it('recent misses weigh more than old ones', () => {
    const oldMiss = [mk('a', 'b', false, 1), ...Array.from({ length: 9 }, (_, i) => mk('a', 'b', true, i + 2))]
    const newMiss = [...Array.from({ length: 9 }, (_, i) => mk('a', 'b', true, i + 1)), mk('a', 'b', false, 10)]
    expect(weightedAccuracy(oldMiss)).toBeGreaterThan(weightedAccuracy(newMiss))
  })
  it('trend compares last 15 with the 15 before', () => {
    const up = [...Array.from({ length: 15 }, (_, i) => mk('a', 'b', i % 2 === 0, i)), ...Array.from({ length: 15 }, (_, i) => mk('a', 'b', true, 20 + i))]
    expect(trendFor(up)).toBe('up')
    expect(trendFor(up.slice(0, 10))).toBe('flat')
  })
})

describe('bucketStats', () => {
  it('unlocks the next tier once the previous is improving', () => {
    const attempts = Array.from({ length: 6 }, (_, i) => mk('add:1+1', 'add.within5', true, i))
    const s = bucketStats(attempts)
    expect(s['add.within5'].mastery).toBe('improving')
    expect(s['add.within10'].unlocked).toBe(true)
    expect(s['add.tensPlusOnes'].unlocked).toBe(false)
    expect(s['sub.within10'].unlocked).toBe(false)
  })
  it('reports the most missed step', () => {
    const attempts = [
      mk('x', 'add.2d2d.carry', false, 1, 'carry'),
      mk('y', 'add.2d2d.carry', false, 2, 'carry'),
      mk('z', 'add.2d2d.carry', false, 3, 'tens'),
    ]
    expect(bucketStats(attempts)['add.2d2d.carry'].mostMissedStep).toBe('carry')
  })
})

describe('learningPlan', () => {
  it('lists great / working on / next up', () => {
    const attempts = [
      ...Array.from({ length: 12 }, (_, i) => mk('a', 'add.within5', true, i)),
      ...Array.from({ length: 6 }, (_, i) => mk('b', 'add.within10', i % 2 === 0, 20 + i)),
      ...Array.from({ length: 6 }, (_, i) => mk('c', 'sub.within5', i < 5, 40 + i)),
    ]
    const plan = learningPlan(bucketStats(attempts))
    expect(plan.greatAt).toEqual(['add.within5'])
    expect(plan.workingOn[0]).toBe('add.within10')
    expect(plan.nextUp).toContain('sub.within10')
  })
})

describe('weakSignatures', () => {
  it('flags a wrong last attempt and clears after two corrects', () => {
    expect(weakSignatures([mk('p', 'b', false, 1)])).toEqual(['p'])
    expect(weakSignatures([mk('p', 'b', false, 1), mk('p', 'b', true, 2)])).toEqual(['p'])
    expect(weakSignatures([mk('p', 'b', false, 1), mk('p', 'b', true, 2), mk('p', 'b', true, 3)])).toEqual([])
    expect(weakSignatures([mk('p', 'b', true, 1)])).toEqual([])
  })
})

describe('summarizeSession', () => {
  it('counts, accuracy, best streak', () => {
    const attempts = [mk('a', 'b', true, 1), mk('a', 'b', true, 2), mk('a', 'b', false, 3), mk('a', 'b', true, 4)]
    const s = summarizeSession(attempts, 's1', 0)
    expect(s).toMatchObject({ count: 4, correct: 3, bestStreak: 2 })
    expect(s.accuracy).toBeCloseTo(0.75)
  })
})
