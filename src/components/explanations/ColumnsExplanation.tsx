import type { Op } from '../../types'
import { BaseTenBlocks } from '../shapes/BaseTenBlocks'

const d = (n: number) => [Math.floor(n / 10), n % 10] as const
const tens = (n: number) => `${n} ${n === 1 ? 'ten' : 'tens'}`
const ones = (n: number) => `${n} ${n === 1 ? 'one' : 'ones'}`

/** Tens-and-ones blocks plus the worked column arithmetic. */
export function ColumnsExplanation({ a, b, op }: { a: number; b: number; op: Op }) {
  const [aT, aO] = d(a)
  const [bT, bO] = d(b)
  const result = op === '+' ? a + b : a - b
  const [rT, rO] = d(result)
  const sym = op === '+' ? '+' : '-'

  let lines: string[]
  let carryMark = ''
  if (op === '+') {
    const onesSum = aO + bO
    if (onesSum >= 10) {
      carryMark = '1'
      lines = [
        `Ones: ${aO} + ${bO} = ${onesSum}. Write ${rO}, carry the 1 ten.`,
        `Tens: 1 + ${aT} + ${bT} = ${aT + bT + 1}.`,
        `Answer: ${result}.`,
      ]
    } else {
      lines = [`Ones: ${aO} + ${bO} = ${onesSum}. Nothing to carry.`, `Tens: ${aT} + ${bT} = ${aT + bT}.`, `Answer: ${result}.`]
    }
  } else if (aO < bO) {
    lines = [
      `Ones: ${aO} is smaller than ${bO}, so borrow a ten. ${aT} tens becomes ${aT - 1}, and the ones become ${aO + 10}.`,
      `Ones: ${aO + 10} - ${bO} = ${rO}.`,
      `Tens: ${aT - 1} - ${bT} = ${rT}.`,
      `Answer: ${result}.`,
    ]
  } else {
    lines = [`Ones: ${aO} - ${bO} = ${rO}.`, `Tens: ${aT} - ${bT} = ${rT}.`, `Answer: ${result}.`]
  }

  return (
    <div className="explain">
      <div className="explain-row explain-blocks">
        <div className="block-group">
          <BaseTenBlocks n={a} color="var(--blue)" />
          <span className="block-label">{a} is {tens(aT)} and {ones(aO)}</span>
        </div>
        <span className="explain-op">{sym}</span>
        <div className="block-group">
          <BaseTenBlocks n={b} color="var(--pink)" />
          <span className="block-label">{b} is {tens(bT)} and {ones(bO)}</span>
        </div>
      </div>
      <div className="worked">
        <div className="worked-grid">
          <span />
          <span className="worked-carry">{carryMark}</span>
          <span />
          <span />
          <span>{aT}</span>
          <span>{aO}</span>
          <span>{sym}</span>
          <span>{bT}</span>
          <span>{bO}</span>
          <span className="worked-rule" />
          <span className="worked-rule" />
          <span className="worked-rule" />
          <span />
          <span className="worked-answer">{rT || ''}</span>
          <span className="worked-answer">{rO}</span>
        </div>
        <ol className="worked-steps">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
