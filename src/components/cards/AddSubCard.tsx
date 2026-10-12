import type { Problem } from '../../types'
import type { Boxes } from '../boxes'
import { AnswerBox } from '../AnswerBox'
import { ColumnEntry } from '../ColumnEntry'

/** Renders an add/sub problem either inline (3 + 4 = [ ]) or as columns. */
export function AddSubCard({ problem, boxes }: { problem: Problem; boxes: Boxes }) {
  const d = problem.data
  if (d.type !== 'add' && d.type !== 'sub') return null
  const op = d.type === 'add' ? '+' : '-'
  if (problem.layout === 'columns') {
    return <ColumnEntry a={d.a} b={d.b} op={op} boxes={boxes} />
  }
  const step = problem.steps[0]
  const box = boxes.answer ?? { state: 'pending', text: '' }
  return (
    <div className="inline-problem">
      <span>{d.a}</span>
      <span className="op">{op === '+' ? '+' : '−'}</span>
      <span>{d.b}</span>
      <span className="op">=</span>
      <AnswerBox box={box} maxLen={step.kind === 'digits' ? step.maxLen : 1} />
    </div>
  )
}
