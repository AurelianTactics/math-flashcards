import type { Explanation, Op } from '../types'

/**
 * Pick the visual explanation for an add/sub problem:
 *  - dots:     everything ≤ 10 → count objects
 *  - tenFrame: single-digit sums 11–18, or teen minus one-digit → make-ten / friends of ten
 *  - columns:  any 2-digit operand → tens & ones blocks plus column arithmetic
 */
export function explainAddSub(a: number, b: number, op: Op): Explanation {
  if (op === '+') {
    if (a + b <= 10) return { kind: 'dots', a, b, op }
    if (a <= 9 && b <= 9) return { kind: 'tenFrame', a, b, op }
    return { kind: 'columns', a, b, op }
  }
  if (a <= 10) return { kind: 'dots', a, b, op }
  if (a <= 18 && b <= 9) return { kind: 'tenFrame', a, b, op }
  return { kind: 'columns', a, b, op }
}
