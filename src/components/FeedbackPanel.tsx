import type { Problem } from '../types'
import { finalAnswer } from '../steps/validate'
import { Explanation } from './explanations/Explanation'
import { exprText } from '../generators/comparison'
import { PIECE_NAMES } from '../generators/fractions'

const SYM: Record<string, string> = { '<': '<', '>': '>', '=': '=', '!=': '≠' }

function problemText(p: Problem): string {
  const d = p.data
  switch (d.type) {
    case 'add':
      return `${d.a} + ${d.b} = ${d.a + d.b}`
    case 'sub':
      return `${d.a} − ${d.b} = ${d.a - d.b}`
    case 'missing':
      return `${d.a ?? d.answer} ${d.op === '+' ? '+' : '−'} ${d.b ?? d.answer} = ${d.c ?? d.answer}`
    case 'compare':
      return `${exprText(d.left)} ${SYM[d.answer]} ${exprText(d.right)}`
    case 'sequence':
      return d.items.map((v) => (v === null ? d.answer : v)).join(', ')
    case 'numberGrid':
      return `${d.start} ${d.delta > 0 ? '+' : '−'} ${Math.abs(d.delta)} = ${d.answer}`
    case 'numberLine':
      if (d.mode === 'jump') return `${d.from} ${(d.jump ?? 0) >= 0 ? '+' : '−'} ${Math.abs(d.jump ?? 0)} = ${d.target}`
      if (d.mode === 'locate') return `${d.target} is arrow ${(d.options ?? []).indexOf(d.target) + 1}`
      return `The arrow points to ${d.target}`
    case 'fraction': {
      const names = PIECE_NAMES[d.pieces]
      if (d.mode === 'countPieces') return `${d.pieces} equal pieces`
      if (d.mode === 'name') return `Each piece is a ${names.one}`
      return `Shape ${(p.steps[0].kind === 'choice' ? p.steps[0].expected : 0) + 1} is cut into ${names.many}`
    }
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
