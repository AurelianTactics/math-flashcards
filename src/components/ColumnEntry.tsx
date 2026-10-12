import type { Op } from '../types'
import type { Boxes, BoxView } from './boxes'

function Cell({ box, mini = false, label }: { box?: BoxView; mini?: boolean; label: string }) {
  if (!box) return <span className={'cell' + (mini ? ' cell-mini' : '')} />
  return (
    <span className={`cell ${mini ? 'cell-mini ' : ''}box box-${box.state}`} aria-label={label} aria-live="polite">
      {box.text}
      {box.state === 'active' && <span className="caret" aria-hidden="true" />}
    </span>
  )
}

function Digit({ n, crossed = false, prefix }: { n: number | null; crossed?: boolean; prefix?: string }) {
  return (
    <span className={'cell digit' + (crossed ? ' digit-crossed' : '')}>
      {prefix && <small className="digit-prefix">{prefix}</small>}
      {n ?? ''}
    </span>
  )
}

/**
 * Vertical column layout with the answer boxes the kid fills right to left.
 * Addition: carry box above the tens column. Subtraction: borrow box above the ones,
 * new-tens box above the (crossed-out) tens digit.
 */
export function ColumnEntry({ a, b, op, boxes }: { a: number; b: number; op: Op; boxes: Boxes }) {
  const aT = a >= 10 ? Math.floor(a / 10) : null
  const bT = b >= 10 ? Math.floor(b / 10) : null
  const aO = a % 10
  const bO = b % 10
  const borrowed = op === '-' && boxes.borrow?.state !== 'pending' && boxes.borrow?.state !== 'active' && boxes.borrow?.text === '1'
  const hasHundreds = Boolean(boxes.hundreds)

  return (
    <div className="columns" role="group" aria-label="column problem">
      <div className="col-row col-work">
        {op === '+' ? (
          <>
            <span className="cell" />
            <Cell box={boxes.carry} mini label="carry" />
            <span className="cell" />
          </>
        ) : (
          <>
            <span className="cell" />
            <Cell box={boxes.newTens} mini label="new tens" />
            <Cell box={boxes.borrow} mini label="borrow" />
          </>
        )}
      </div>
      <div className="col-row">
        <span className="cell" />
        <Digit n={aT} crossed={borrowed} />
        <Digit n={aO} prefix={borrowed ? '1' : undefined} />
      </div>
      <div className="col-row">
        <span className="cell op">{op === '+' ? '+' : '−'}</span>
        <Digit n={bT} />
        <Digit n={bO} />
      </div>
      <div className="col-rule" />
      <div className="col-row col-answer">
        {hasHundreds ? <Cell box={boxes.hundreds} label="hundreds" /> : <span className="cell" />}
        <Cell box={boxes.tens} label="tens" />
        <Cell box={boxes.ones} label="ones" />
      </div>
    </div>
  )
}
