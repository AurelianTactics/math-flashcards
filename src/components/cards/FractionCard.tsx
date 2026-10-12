import type { Problem } from '../../types'
import type { Boxes } from '../boxes'
import { AnswerBox } from '../AnswerBox'
import { ChoiceRow } from '../ChoiceRow'
import { DividedShape } from '../shapes/DividedShape'

export function FractionCard({ problem, boxes, onChoose }: { problem: Problem; boxes: Boxes; onChoose?: (i: number) => void }) {
  const d = problem.data
  if (d.type !== 'fraction') return null
  const step = problem.steps[0]
  if (d.mode === 'pickCorrect' && step.kind === 'choice') {
    return (
      <ChoiceRow
        options={step.options}
        box={boxes.choice ?? { state: 'pending', text: '' }}
        onChoose={onChoose}
        size="big"
        render={(o) => <DividedShape shape={d.shape} pieces={Number(o.value[0])} equal={o.value[1] === 'e'} size={110} />}
      />
    )
  }
  return (
    <div className="fraction-card">
      <DividedShape shape={d.shape} pieces={d.pieces} size={160} />
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
