import type { Problem } from '../../types'
import type { Boxes } from '../boxes'
import { ChoiceRow } from '../ChoiceRow'
import { exprText } from '../../generators/comparison'

const SHOW: Record<string, string> = { '<': '<', '>': '>', '=': '=', '!=': '≠' }

/** 7 ? 9 with the sign choices underneath. */
export function CompareCard({ problem, boxes, onChoose }: { problem: Problem; boxes: Boxes; onChoose?: (i: number) => void }) {
  const d = problem.data
  if (d.type !== 'compare') return null
  const step = problem.steps[0]
  if (step.kind !== 'choice') return null
  const box = boxes.choice ?? { state: 'pending' as const, text: '' }
  const answered = box.state === 'correct' || box.state === 'wrong'
  const shown = answered ? SHOW[step.options[Number(box.text)].value] : '?'
  return (
    <div className="compare-card">
      <div className="inline-problem compare-problem">
        <span>{exprText(d.left)}</span>
        <span className={`box compare-slot box-${answered ? box.state : 'active'}`}>{shown}</span>
        <span>{exprText(d.right)}</span>
      </div>
      <ChoiceRow options={step.options} box={box} onChoose={onChoose} size="big" />
    </div>
  )
}
