import { NumberLineSvg } from '../shapes/NumberLineSvg'

export function NumberLineExplanation({ min, max, tick, from, to }: { min: number; max: number; tick: number; from?: number; to: number }) {
  const jump = from !== undefined ? to - from : undefined
  const markers = from !== undefined ? [{ at: from, kind: 'dot' as const, label: String(from) }, { at: to, label: String(to), color: 'var(--teal)' }] : [{ at: to, label: String(to), color: 'var(--teal)' }]
  const jumps = from !== undefined ? Array.from({ length: Math.abs(jump ?? 0) }, (_, i) => ({ from: from + Math.sign(jump ?? 0) * i, to: from + Math.sign(jump ?? 0) * (i + 1) })) : []
  return (
    <div className="explain">
      <NumberLineSvg min={min} max={max} labelEvery={tick} markers={markers} jumps={jumps} />
      <p className="explain-text">
        {from !== undefined && jump !== undefined
          ? `Start at ${from} and hop ${Math.abs(jump)} ${jump >= 0 ? 'to the right' : 'to the left'}, one tick at a time. You land on ${to}.`
          : `Count the ticks from ${Math.floor(to / tick) * tick}: the arrow is at ${to}. Each small tick is 1.`}
      </p>
    </div>
  )
}
