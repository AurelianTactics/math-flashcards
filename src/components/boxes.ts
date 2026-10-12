import type { Problem, Step, StepId, StepResult } from '../types'

export type BoxState = 'pending' | 'active' | 'correct' | 'wrong'
export interface BoxView {
  state: BoxState
  text: string
  /** What was actually given when it differs from text (wrong answers). */
  given?: string
}
export type Boxes = Partial<Record<StepId, BoxView>>

/**
 * Compute what every answer box shows from the session state.
 * `revealing` means the active step was just answered wrong and shows the right digit.
 */
export function boxViews(problem: Problem, stepIndex: number, input: string, results: StepResult[], revealing: boolean): Boxes {
  const out: Boxes = {}
  problem.steps.forEach((step: Step, i) => {
    const expected = step.kind === 'digits' ? step.expected : String(step.expected)
    if (i < stepIndex) {
      const r = results[i]
      out[step.id] = { state: r && !r.firstTry ? 'wrong' : 'correct', text: expected, given: r?.given }
    } else if (i === stepIndex) {
      out[step.id] = revealing ? { state: 'wrong', text: expected, given: input } : { state: 'active', text: input }
    } else {
      out[step.id] = { state: 'pending', text: '' }
    }
  })
  return out
}
