import type { BoxView } from './boxes'

/** One answer box for a whole-number answer; width scales with the expected length. */
export function AnswerBox({ box, maxLen, label }: { box: BoxView; maxLen: number; label?: string }) {
  const chars = Math.max(1, maxLen)
  return (
    <span
      className={`box box-${box.state}`}
      style={{ minWidth: `${chars * 0.75 + 0.5}em` }}
      aria-label={label ?? 'answer'}
      aria-live="polite"
    >
      {box.text}
      {box.state === 'active' && <span className="caret" aria-hidden="true" />}
    </span>
  )
}
