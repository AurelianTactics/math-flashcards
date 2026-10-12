import type { Op } from '../../types'

function Dots({ n, color, crossedFrom }: { n: number; color: string; crossedFrom?: number }) {
  return (
    <div className="dots" aria-label={`${n} dots`}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={'dot' + (crossedFrom !== undefined && i >= crossedFrom ? ' dot-crossed' : '')} style={{ background: color }} />
      ))}
    </div>
  )
}

/** Count-the-objects explanation for small sums and differences (everything <= 10). */
export function DotsExplanation({ a, b, op }: { a: number; b: number; op: Op }) {
  if (op === '+') {
    return (
      <div className="explain">
        <div className="explain-row">
          <Dots n={a} color="var(--blue)" />
          <span className="explain-op">+</span>
          <Dots n={b} color="var(--pink)" />
        </div>
        <p className="explain-text">
          {a} blue {a === 1 ? 'dot' : 'dots'} and {b} pink {b === 1 ? 'dot' : 'dots'}. Count them all together: {a + b}.
        </p>
        <div className="explain-row">
          <Dots n={a + b} color="var(--blue)" />
        </div>
      </div>
    )
  }
  return (
    <div className="explain">
      <div className="explain-row">
        <Dots n={a} color="var(--blue)" crossedFrom={a - b} />
      </div>
      <p className="explain-text">
        Start with {a}. Take away {b} (the crossed-out ones). {a - b} {a - b === 1 ? 'is' : 'are'} left.
      </p>
    </div>
  )
}
