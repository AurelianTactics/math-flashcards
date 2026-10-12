import type { Problem } from '../../types'
import type { Boxes } from '../boxes'
import { AnswerBox } from '../AnswerBox'

/** 2, 4, 6, [ ] as a row of tiles. */
export function SequenceCard({ problem, boxes }: { problem: Problem; boxes: Boxes }) {
  const d = problem.data
  if (d.type !== 'sequence') return null
  const step = problem.steps[0]
  const maxLen = step.kind === 'digits' ? step.maxLen : 1
  const box = boxes.answer ?? { state: 'pending' as const, text: '' }
  return (
    <div className="seq">
      {d.items.map((v, i) => (
        <span key={i} className="seq-item">
          {v === null ? <AnswerBox box={box} maxLen={maxLen} /> : <span className="seq-tile">{v}</span>}
          {i < d.items.length - 1 && <span className="seq-comma">,</span>}
        </span>
      ))}
    </div>
  )
}
