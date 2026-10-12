import { HundredGrid } from '../shapes/HundredGrid'

export function GridExplanation({ from, to, delta }: { from: number; to: number; delta: number }) {
  const by10 = Math.abs(delta) === 10
  const how = by10
    ? delta > 0
      ? 'Go straight down one row. Every row down adds 10.'
      : 'Go straight up one row. Every row up takes away 10.'
    : delta > 0
      ? 'Move one square to the right. Each square to the right adds 1.'
      : 'Move one square to the left. Each square to the left takes away 1.'
  return (
    <div className="explain">
      <HundredGrid highlight={{ [from]: 'var(--marigold-soft)', [to]: 'var(--teal-soft)' }} arrow={{ from, to }} cell={30} />
      <p className="explain-text">
        {how} {from} {delta > 0 ? '+' : '−'} {Math.abs(delta)} = {to}.
      </p>
    </div>
  )
}
