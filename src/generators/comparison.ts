import type { BucketId, ChoiceOption, CompareSymbol, Expr, Problem, Settings, Step } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { uid } from '../uid'

type Mode = 'ltgt' | 'eqne'

export function evalExpr(e: Expr): number {
  return typeof e === 'number' ? e : e.op === '+' ? e.a + e.b : e.a - e.b
}
export function exprText(e: Expr): string {
  return typeof e === 'number' ? String(e) : `${e.a} ${e.op === '+' ? '+' : '−'} ${e.b}`
}
function exprSig(e: Expr): string {
  return typeof e === 'number' ? String(e) : `${e.a}${e.op}${e.b}`
}
function parseExpr(s: string): Expr | null {
  const m = /^(\d+)(?:([+-])(\d+))?$/.exec(s)
  if (!m) return null
  if (!m[2]) return Number(m[1])
  return { a: Number(m[1]), b: Number(m[3]), op: m[2] as '+' | '-' }
}

export function compareAnswer(l: number, r: number, mode: Mode): CompareSymbol {
  if (mode === 'eqne') return l === r ? '=' : '!='
  return l < r ? '<' : l > r ? '>' : '='
}

const OPTIONS: Record<Mode, ChoiceOption[]> = {
  ltgt: [
    { key: '1', label: '<', altKeys: ['<', ','], value: '<' },
    { key: '2', label: '>', altKeys: ['>', '.'], value: '>' },
    { key: '3', label: '=', altKeys: ['='], value: '=' },
  ],
  eqne: [
    { key: '1', label: '=', altKeys: ['='], value: '=' },
    { key: '2', label: '≠', altKeys: ['!', '/'], value: '!=' },
  ],
}

function build(left: Expr, right: Expr, mode: Mode): Problem {
  const l = evalExpr(left)
  const r = evalExpr(right)
  const answer = compareAnswer(l, r, mode)
  const options = OPTIONS[mode]
  const step: Step = { id: 'choice', kind: 'choice', expected: options.findIndex((o) => o.value === answer), options, label: '' }
  const isExpr = typeof left !== 'number' || typeof right !== 'number'
  return {
    id: uid(),
    signature: `compare:${exprSig(left)}?${exprSig(right)}:${mode}`,
    type: 'compare',
    buckets: [isExpr ? 'compare.expressions' : 'compare.numbers'],
    data: { type: 'compare', left, right, answer, mode },
    layout: 'inline',
    steps: [step],
    explanation: { kind: 'compare', leftValue: l, rightValue: r, leftText: exprText(left), rightText: exprText(right), symbol: answer },
    prompt: mode === 'eqne' ? 'Are the two sides the same?' : 'Which sign goes in the middle?',
  }
}

function smallExpr(rng: Rng): Expr {
  if (rng.chance(0.6)) {
    const a = rng.int(1, 9)
    return { a, b: rng.int(1, 10 - Math.min(a, 9)), op: '+' }
  }
  const a = rng.int(2, 10)
  return { a, b: rng.int(1, a), op: '-' }
}

const MAKE: Record<BucketId, (rng: Rng) => [Expr, Expr, Mode]> = {
  'compare.numbers': (rng) => {
    const mode: Mode = rng.chance(0.35) ? 'eqne' : 'ltgt'
    const a = rng.int(0, 99)
    let b: number
    if (rng.chance(0.2)) b = a
    else {
      // mostly close numbers so it takes real comparing
      const near = rng.chance(0.6)
      b = near ? Math.max(0, Math.min(99, a + rng.int(-9, 9) || 1)) : rng.int(0, 99)
      if (b === a) b = Math.min(99, a + 1)
    }
    return [a, b, mode]
  },
  'compare.expressions': (rng) => {
    const mode: Mode = rng.chance(0.35) ? 'eqne' : 'ltgt'
    const left = smallExpr(rng)
    const lv = evalExpr(left)
    let right: Expr
    if (rng.chance(0.3)) right = smallExpr(rng)
    else if (rng.chance(0.4)) right = lv
    else right = Math.max(0, lv + rng.pick([-3, -2, -1, 1, 2, 3]))
    return rng.chance(0.5) ? [left, right, mode] : [right, left, mode]
  },
}

export const comparisonGenerator: Generator = {
  type: 'compare',
  buckets: Object.keys(MAKE),
  generate(bucket, rng): Problem {
    const make = MAKE[bucket]
    if (!make) throw new Error(`compare: unknown bucket ${bucket}`)
    const [l, r, mode] = make(rng)
    return build(l, r, mode)
  },
  fromSignature(sig, _rng: Rng, _settings: Settings) {
    const m = /^compare:([^?]+)\?([^:]+):(ltgt|eqne)$/.exec(sig)
    if (!m) return null
    const l = parseExpr(m[1])
    const r = parseExpr(m[2])
    if (l === null || r === null) return null
    return build(l, r, m[3] as Mode)
  },
}
