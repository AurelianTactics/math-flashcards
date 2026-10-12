import type { Problem } from '../../types'
import type { Boxes } from '../boxes'
import { AnswerBox } from '../AnswerBox'
import { HundredGrid } from '../shapes/HundredGrid'

/** The 100 grid with the start number highlighted and an answer box beside it. */
export function NumberGridCard({ problem, boxes }: { problem: Problem; boxes: Boxes }) {
  const d = problem.data
  if (d.type !== 'numberGrid') return null
  const step = problem.steps[0]
  const maxLen = step.kind === 'digits' ? step.maxLen : 1
  const sym = d.delta > 0 ? '+' : '−'
  return (
    <div className="grid-card">
      <HundredGrid highlight={{ [d.start]: 'var(--marigold-soft)' }} cell={34} />
      <div className="inline-problem grid-answer">
        <span>{d.start}</span>
        <span className="op">{sym}</span>
        <span>{Math.abs(d.delta)}</span>
        <span className="op">=</span>
        <AnswerBox box={boxes.answer ?? { state: 'pending', text: '' }} maxLen={maxLen} />
      </div>
    </div>
  )
}
