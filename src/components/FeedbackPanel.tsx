import type { Problem } from '../types'
import { finalAnswer } from '../steps/validate'
import { Explanation } from './explanations/Explanation'

function problemText(p: Problem): string {
  const d = p.data
  switch (d.type) {
    case 'add':
      return `${d.a} + ${d.b} = ${d.a + d.b}`
    case 'sub':
      return `${d.a} − ${d.b} = ${d.a - d.b}`
    default:
      return `The answer is ${finalAnswer(p)}`
  }
}

/** Shown after a wrong answer: the right answer, a picture of why, and how to continue. */
export function FeedbackPanel({ problem, onNext }: { problem: Problem; onNext: () => void }) {
  return (
    <section className="feedback" aria-live="polite">
      <h2 className="feedback-answer">{problemText(problem)}</h2>
      <p className="feedback-lead">Let's look at why.</p>
      <Explanation explanation={problem.explanation} />
      <button type="button" className="btn btn-big" onClick={onNext} autoFocus>
        Next card (Enter)
      </button>
    </section>
  )
}
