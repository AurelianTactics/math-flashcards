import type { Op, Settings, Step } from '../types'
import type { Rng } from '../rng'

const digit = (n: number) => String(n % 10)

/** A single answer box for the whole result. Enter submits; auto-submits at maxLen. */
export function singleStep(answer: number): Step[] {
  const expected = String(answer)
  return [{ id: 'answer', kind: 'digits', expected, maxLen: Math.max(1, expected.length), label: 'answer', autoSubmit: false }]
}

/** Right-to-left column addition: ones sum → carry (0 if none) → tens sum (→ hundreds). */
export function buildAddSteps(a: number, b: number): Step[] {
  const onesSum = (a % 10) + (b % 10)
  const carry = Math.floor(onesSum / 10)
  const tensSum = Math.floor(a / 10) + Math.floor(b / 10) + carry
  const steps: Step[] = [
    { id: 'ones', kind: 'digits', expected: digit(onesSum), maxLen: 1, label: 'ones', autoSubmit: true },
    { id: 'carry', kind: 'digits', expected: String(carry), maxLen: 1, label: 'carry', autoSubmit: true },
    { id: 'tens', kind: 'digits', expected: digit(tensSum), maxLen: 1, label: 'tens', autoSubmit: true },
  ]
  if (tensSum >= 10) {
    steps.push({ id: 'hundreds', kind: 'digits', expected: String(Math.floor(tensSum / 10)), maxLen: 1, label: 'hundreds', autoSubmit: true })
  }
  return steps
}

/** Right-to-left column subtraction: borrow? → new tens digit (if borrowed) → ones → tens. */
export function buildSubSteps(a: number, b: number): Step[] {
  const aOnes = a % 10
  const bOnes = b % 10
  const aTens = Math.floor(a / 10)
  const bTens = Math.floor(b / 10)
  const borrow = aOnes < bOnes ? 1 : 0
  const newTens = aTens - borrow
  const ones = aOnes + borrow * 10 - bOnes
  const tens = newTens - bTens
  const steps: Step[] = [
    { id: 'borrow', kind: 'digits', expected: String(borrow), maxLen: 1, label: 'borrow?', autoSubmit: true },
  ]
  if (borrow) {
    steps.push({ id: 'newTens', kind: 'digits', expected: digit(newTens), maxLen: 1, label: 'new tens', autoSubmit: true })
  }
  steps.push(
    { id: 'ones', kind: 'digits', expected: digit(ones), maxLen: 1, label: 'ones', autoSubmit: true },
    { id: 'tens', kind: 'digits', expected: digit(tens), maxLen: 1, label: 'tens', autoSubmit: true },
  )
  return steps
}

export function hasCarry(a: number, b: number): boolean {
  return (a % 10) + (b % 10) >= 10
}
export function hasBorrow(a: number, b: number): boolean {
  return a % 10 < b % 10
}

/** Probability that a 2-digit problem with no carry/borrow still uses columns (practices "carry = 0"). */
export const NO_CARRY_COLUMN_CHANCE = 0.3

/**
 * Decide whether a problem uses the column (right-to-left) entry UI.
 * Carry/borrow always → columns. Both operands 2-digit with no carry → columns 30% of the time.
 */
export function needsColumnMode(op: Op, a: number, b: number, rng: Rng, settings: Pick<Settings, 'columnMode'>): boolean {
  const twoDigit = (n: number) => n >= 10
  // Single-digit problems (including 7 + 3 = 10 and 8 + 5 = 13) are answered whole, never in columns.
  if (!twoDigit(a) && !twoDigit(b)) return false
  // Results within 10 (10 + 0, 10 - 10) are not column problems either.
  if (op === '+' ? a + b <= 10 : a <= 10) return false
  if (op === '+' && hasCarry(a, b)) return true
  if (op === '-' && hasBorrow(a, b)) return true
  if (settings.columnMode === 'always2digit') return true
  if (twoDigit(a) && twoDigit(b)) return rng.chance(NO_CARRY_COLUMN_CHANCE)
  return false
}

/** Expected digits for a column step list, in order (handy for tests and explanations). */
export function expectedDigits(steps: Step[]): string[] {
  return steps.map((s) => (s.kind === 'digits' ? s.expected : String(s.expected)))
}
