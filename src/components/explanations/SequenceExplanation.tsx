export function SequenceExplanation({ items, step, dir, answerIndex }: { items: number[]; step: number; dir: 'fwd' | 'back'; answerIndex: number }) {
  const by = Math.abs(step)
  return (
    <div className="explain">
      <div className="seq seq-explain">
        {items.map((v, i) => (
          <span key={i} className="seq-item">
            <span className={'seq-tile' + (i === answerIndex ? ' seq-tile-answer' : '')}>{v}</span>
            {i < items.length - 1 && <span className="seq-hop">{dir === 'fwd' ? '+' : '−'}{by}</span>}
          </span>
        ))}
      </div>
      <p className="explain-text">
        The numbers go {dir === 'fwd' ? 'up' : 'down'} by {by} each time. Counting {dir === 'fwd' ? 'up' : 'down'} by {by}s: {items.join(', ')}.
      </p>
    </div>
  )
}
