import type { Op } from '../../types'
import { TenFrame } from '../shapes/TenFrame'

const BLUE = 'var(--blue)'
const PINK = 'var(--pink)'

function cells(n: number, color: string): (string | null)[] {
  return Array.from({ length: 10 }, (_, i) => (i < n ? color : null))
}

/** Make-ten (friends of 10) explanation for sums 11-18 and teen subtraction. */
export function TenFrameExplanation({ a, b, op }: { a: number; b: number; op: Op }) {
  if (op === '+') {
    const need = 10 - a // how many b gives to a to make ten
    const rest = b - need
    const filled = cells(a, BLUE).map((c) => c ?? PINK)
    return (
      <div className="explain">
        <div className="explain-row">
          <TenFrame cells={cells(a, BLUE)} />
          <span className="explain-op">+</span>
          <TenFrame cells={cells(b, PINK)} />
        </div>
        <p className="explain-text">
          {a} and {need} are friends of 10. Move {need} pink {need === 1 ? 'dot' : 'dots'} over to fill the first frame.
        </p>
        <div className="explain-row">
          <TenFrame cells={filled} />
          <span className="explain-op">+</span>
          <TenFrame cells={cells(rest, PINK)} />
        </div>
        <p className="explain-text">
          Now it is 10 and {rest}. 10 + {rest} = {a + b}.
        </p>
      </div>
    )
  }
  // subtraction: a is 11..18, b <= 9
  const extra = a - 10
  if (b <= extra) {
    const crossed = Array.from({ length: b }, (_, i) => extra - 1 - i)
    return (
      <div className="explain">
        <div className="explain-row">
          <TenFrame cells={cells(10, BLUE)} />
          <TenFrame cells={cells(extra, BLUE)} crossed={crossed} />
        </div>
        <p className="explain-text">
          {a} is 10 and {extra}. Take {b} away from the {extra}: {extra} - {b} = {extra - b}. 10 + {extra - b} = {a - b}.
        </p>
      </div>
    )
  }
  const more = b - extra
  const crossedTen = Array.from({ length: more }, (_, i) => 9 - i)
  return (
    <div className="explain">
      <div className="explain-row">
        <TenFrame cells={cells(10, BLUE)} />
        <TenFrame cells={cells(extra, BLUE)} crossed={Array.from({ length: extra }, (_, i) => i)} />
      </div>
      <p className="explain-text">
        {a} is 10 and {extra}. First take away {extra} to get down to 10.
      </p>
      <div className="explain-row">
        <TenFrame cells={cells(10, BLUE)} crossed={crossedTen} />
      </div>
      <p className="explain-text">
        Then take {more} more from the 10: 10 - {more} = {a - b}. So {a} - {b} = {a - b}.
      </p>
    </div>
  )
}
