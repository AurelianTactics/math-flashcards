import { checkStep, finalizeAttempt } from './validate'
import { makeAddSubProblem } from '../generators/addSub'
import { createRng } from '../rng'
import { DEFAULT_SETTINGS } from '../storage/schema'
import type { Step } from '../types'

describe('checkStep', () => {
  it('compares digits', () => {
    const s: Step = { id: 'answer', kind: 'digits', expected: '12', maxLen: 2, label: '', autoSubmit: false }
    expect(checkStep(s, '12')).toBe(true)
    expect(checkStep(s, '012')).toBe(true)
    expect(checkStep(s, '2')).toBe(false)
  })
  it('compares choice index', () => {
    const s: Step = { id: 'choice', kind: 'choice', expected: 2, options: [], label: '' }
    expect(checkStep(s, 2)).toBe(true)
    expect(checkStep(s, '2')).toBe(true)
    expect(checkStep(s, 0)).toBe(false)
  })
})

describe('finalizeAttempt', () => {
  const p = makeAddSubProblem(37, 25, '+', createRng(1), DEFAULT_SETTINGS)
  it('is correct only if every step was first try', () => {
    const a = finalizeAttempt(p, [
      { id: 'ones', tries: 1, firstTry: true },
      { id: 'carry', tries: 1, firstTry: true },
      { id: 'tens', tries: 1, firstTry: true },
    ], 1234.6, 's1')
    expect(a.correct).toBe(true)
    expect(a.firstWrongStep).toBeUndefined()
    expect(a.ms).toBe(1235)
    expect(a.sig).toBe('add:37+25')
    expect(a.buckets[0]).toBe('add.2d2d.carry')
  })
  it('records the first wrong step', () => {
    const a = finalizeAttempt(p, [
      { id: 'ones', tries: 1, firstTry: true },
      { id: 'carry', tries: 2, firstTry: false },
      { id: 'tens', tries: 1, firstTry: true },
    ], 100, 's1')
    expect(a.correct).toBe(false)
    expect(a.firstWrongStep).toBe('carry')
  })
})
