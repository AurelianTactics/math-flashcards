import type { Problem } from '../../types'
import type { Boxes } from '../boxes'
import { AnswerBox } from '../AnswerBox'

/** 2 + [ ] = 4 — the answer box sits where the missing number goes. */
export function MissingCard({ problem, boxes }: { problem: Problem; boxes: Boxes }) {
  const d = problem.data
  if (d.type !== 'missing') return null
  const step = problem.steps[0]
  const maxLen = step.kind === 'digits' ? step.maxLen : 1
  const box = boxes.answer ?? { state: 'pending' as const, text: '' }
  const slot = (v: number | null) => (v === null ? <AnswerBox box={box} maxLen={maxLen} /> : <span>{v}</span>)
  return (
    <div className="inline-problem">
      {slot(d.a)}
      <span className="op">{d.op === '+' ? '+' : '−'}</span>
      {slot(d.b)}
      <span className="op">=</span>
      {slot(d.c)}
    </div>
  )
}
