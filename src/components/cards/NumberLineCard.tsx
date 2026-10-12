import type { Problem } from '../../types'
import type { Boxes } from '../boxes'
import { AnswerBox } from '../AnswerBox'
import { ChoiceRow } from '../ChoiceRow'
import { NumberLineSvg, type LineMarker } from '../shapes/NumberLineSvg'

export function NumberLineCard({ problem, boxes, onChoose }: { problem: Problem; boxes: Boxes; onChoose?: (i: number) => void }) {
  const d = problem.data
  if (d.type !== 'numberLine') return null
  const step = problem.steps[0]
  let markers: LineMarker[] = []
  if (d.mode === 'read') markers = [{ at: d.target }]
  else if (d.mode === 'locate') markers = (d.options ?? []).map((v, i) => ({ at: v, label: String(i + 1) }))
  else if (d.mode === 'jump' && d.from !== undefined) markers = [{ at: d.from, kind: 'dot', label: String(d.from) }]

  return (
    <div className="line-card">
      <NumberLineSvg min={d.min} max={d.max} labelEvery={d.tick} markers={markers} />
      {step.kind === 'choice' ? (
        <ChoiceRow options={step.options} box={boxes.choice ?? { state: 'pending', text: '' }} onChoose={onChoose} />
      ) : (
        <div className="inline-problem line-answer">
          <AnswerBox box={boxes.answer ?? { state: 'pending', text: '' }} maxLen={step.maxLen} />
        </div>
      )}
    </div>
  )
}
