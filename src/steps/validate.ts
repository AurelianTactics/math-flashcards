import type { Attempt, Problem, Step, StepResult } from '../types'
import { uid } from '../uid'

/** Check one step. Digit steps compare normalized strings; choice steps compare option index. */
export function checkStep(step: Step, input: string | number): boolean {
  if (step.kind === 'digits') {
    const typed = String(input).replace(/^0+(?=\d)/, '')
    const expected = step.expected.replace(/^0+(?=\d)/, '')
    return typed === expected
  }
  return Number(input) === step.expected
}

/** Build the attempt record. A problem is correct only if every step was right on the first try. */
export function finalizeAttempt(problem: Problem, steps: StepResult[], ms: number, sessionId: string): Attempt {
  const firstWrong = steps.find((s) => !s.firstTry)
  return {
    id: uid(),
    ts: Date.now(),
    sessionId,
    sig: problem.signature,
    type: problem.type,
    buckets: problem.buckets,
    correct: steps.length > 0 && steps.every((s) => s.firstTry),
    steps,
    firstWrongStep: firstWrong?.id,
    ms: Math.max(0, Math.round(ms)),
  }
}

/** Final answer text for the whole problem (for the feedback panel). */
export function finalAnswer(problem: Problem): string {
  const d = problem.data
  switch (d.type) {
    case 'add':
      return String(d.a + d.b)
    case 'sub':
      return String(d.a - d.b)
    case 'compare':
      return d.answer === '!=' ? '≠' : d.answer
    case 'sequence':
      return String(d.answer)
    case 'numberGrid':
      return String(d.answer)
    case 'missing':
      return String(d.answer)
    case 'numberLine':
      return String(d.target)
    case 'fraction':
      return d.mode === 'countPieces' ? String(d.pieces) : 'the equal pieces'
  }
}
