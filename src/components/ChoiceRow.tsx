import type { ReactNode } from 'react'
import type { ChoiceOption } from '../types'
import type { BoxView } from './boxes'

/**
 * A row of keyed choices (press the key or click). After an answer, the right
 * option is outlined green and a wrong pick is outlined red.
 */
export function ChoiceRow({
  options,
  box,
  onChoose,
  render,
  size = 'normal',
}: {
  options: ChoiceOption[]
  box: BoxView
  onChoose?: (idx: number) => void
  render?: (o: ChoiceOption, i: number) => ReactNode
  size?: 'normal' | 'big'
}) {
  const answered = box.state === 'correct' || box.state === 'wrong'
  const right = answered ? Number(box.text) : -1
  const wrong = box.state === 'wrong' && box.given !== undefined ? Number(box.given) : -1
  return (
    <div className={`choices choices-${size}`} role="group">
      {options.map((o, i) => {
        const cls = ['choice', i === right ? 'choice-right' : '', i === wrong && i !== right ? 'choice-wrong' : ''].filter(Boolean).join(' ')
        return (
          <button type="button" key={o.key} className={cls} onClick={() => onChoose?.(i)} disabled={answered}>
            <span className="choice-key" aria-hidden="true">{o.key}</span>
            <span className="choice-body">{render ? render(o, i) : o.label ?? o.value}</span>
          </button>
        )
      })}
    </div>
  )
}
