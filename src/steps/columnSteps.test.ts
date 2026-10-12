import { buildAddSteps, buildSubSteps, expectedDigits, needsColumnMode, singleStep } from './columnSteps'
import { createRng } from '../rng'

describe('column steps', () => {
  it.each([
    [37, 25, ['2', '1', '6']],
    [45, 32, ['7', '0', '7']],
    [37, 5, ['2', '1', '4']],
    [58, 7, ['5', '1', '6']],
  ])('add %i + %i -> %j', (a, b, digits) => {
    const steps = buildAddSteps(a, b)
    expect(expectedDigits(steps)).toEqual(digits)
    expect(steps.map((s) => s.id)).toEqual(['ones', 'carry', 'tens'])
  })
  it('adds a hundreds step for sums >= 100', () => {
    expect(expectedDigits(buildAddSteps(65, 47))).toEqual(['2', '1', '1', '1'])
  })
  it.each([
    [52, 17, ['1', '4', '5', '3'], ['borrow', 'newTens', 'ones', 'tens']],
    [46, 23, ['0', '3', '2'], ['borrow', 'ones', 'tens']],
    [23, 18, ['1', '1', '5', '0'], ['borrow', 'newTens', 'ones', 'tens']],
    [52, 7, ['1', '4', '5', '4'], ['borrow', 'newTens', 'ones', 'tens']],
  ])('sub %i - %i -> %j', (a, b, digits, ids) => {
    const steps = buildSubSteps(a, b)
    expect(expectedDigits(steps)).toEqual(digits)
    expect(steps.map((s) => s.id)).toEqual(ids)
  })
  it('single step holds the whole answer', () => {
    const [s] = singleStep(7)
    expect(s).toMatchObject({ id: 'answer', expected: '7', maxLen: 1 })
    expect(singleStep(12)[0]).toMatchObject({ expected: '12', maxLen: 2 })
  })
})

describe('needsColumnMode', () => {
  const auto = { columnMode: 'auto' as const }
  it('always columns when carrying or borrowing', () => {
    const rng = createRng(1)
    expect(needsColumnMode('+', 37, 25, rng, auto)).toBe(true)
    expect(needsColumnMode('+', 37, 5, rng, auto)).toBe(true)
    expect(needsColumnMode('-', 52, 17, rng, auto)).toBe(true)
  })
  it('never columns for single-digit problems', () => {
    const rng = createRng(2)
    for (let i = 0; i < 100; i++) expect(needsColumnMode('+', 4, 3, rng, auto)).toBe(false)
  })
  it('sometimes columns for 2-digit no-carry', () => {
    const rng = createRng(3)
    let n = 0
    for (let i = 0; i < 1000; i++) if (needsColumnMode('+', 45, 32, rng, auto)) n++
    expect(n).toBeGreaterThan(200)
    expect(n).toBeLessThan(400)
  })
  it('always2digit forces columns for any 2-digit operand', () => {
    const rng = createRng(4)
    expect(needsColumnMode('+', 23, 4, rng, { columnMode: 'always2digit' })).toBe(true)
    expect(needsColumnMode('+', 3, 4, rng, { columnMode: 'always2digit' })).toBe(false)
  })
})
