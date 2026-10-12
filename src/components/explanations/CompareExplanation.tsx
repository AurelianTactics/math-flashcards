import type { CompareSymbol } from '../../types'

const WORDS: Record<CompareSymbol, string> = { '<': 'is less than', '>': 'is more than', '=': 'is the same as', '!=': 'is not the same as' }
const SHOW: Record<CompareSymbol, string> = { '<': '<', '>': '>', '=': '=', '!=': '≠' }

/** Two bars sized by value, so the bigger side is visibly bigger. */
export function CompareExplanation({ leftValue, rightValue, leftText, rightText, symbol }: { leftValue: number; rightValue: number; leftText: string; rightText: string; symbol: CompareSymbol }) {
  const max = Math.max(leftValue, rightValue, 1)
  const bar = (v: number, text: string, color: string) => (
    <div className="bar-row">
      <span className="bar-label">{text}{text !== String(v) ? ` = ${v}` : ''}</span>
      <span className="bar" style={{ width: `${Math.max(4, (v / max) * 100)}%`, background: color }} />
    </div>
  )
  return (
    <div className="explain">
      <div className="bars">
        {bar(leftValue, leftText, 'var(--blue)')}
        {bar(rightValue, rightText, 'var(--pink)')}
      </div>
      <p className="explain-text">
        {leftValue} {WORDS[symbol]} {rightValue}, so {leftText} {SHOW[symbol]} {rightText}.
        {symbol === '<' && ' The small end of the sign points to the smaller number.'}
        {symbol === '>' && ' The open side of the sign faces the bigger number.'}
      </p>
    </div>
  )
}
