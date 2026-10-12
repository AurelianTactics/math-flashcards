import type { BucketId, Op, Problem, Settings } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { singleStep } from '../steps/columnSteps'
import { uid } from '../uid'

interface Parts {
  a: number | null
  b: number | null
  c: number | null
  op: Op
}

function build(p: Parts): Problem {
  const { a, b, c, op } = p
  let answer: number
  let bucket: BucketId
  if (op === '+') {
    answer = a === null ? (c as number) - (b as number) : (c as number) - (a as number)
    bucket = 'missing.addend'
  } else if (a === null) {
    answer = (b as number) + (c as number)
    bucket = 'missing.minuend'
  } else {
    answer = (a as number) - (c as number)
    bucket = 'missing.subtrahend'
  }
  const whole = op === '+' ? (c ?? answer) : (a ?? answer)
  const parts: [number, number] = op === '+' ? [a ?? answer, b ?? answer] : [b ?? answer, c ?? answer]
  const s = (n: number | null) => (n === null ? '_' : String(n))
  return {
    id: uid(),
    signature: `missing:${s(a)}${op}${s(b)}=${s(c)}`,
    type: 'missing',
    buckets: [bucket],
    data: { type: 'missing', a, b, c, op, answer },
    layout: 'inline',
    steps: singleStep(answer),
    explanation: { kind: 'partWhole', whole, parts, unknown: op === '-' && a === null ? 'whole' : 'part' },
    prompt: 'What number goes in the box?',
  }
}

const MAKE: Record<BucketId, (rng: Rng) => Parts> = {
  'missing.addend': (rng) => {
    const c = rng.int(2, 20)
    const a = rng.int(1, c - 1)
    const b = c - a
    return rng.chance(0.5) ? { a, b: null, c, op: '+' } : { a: null, b, c, op: '+' }
  },
  'missing.subtrahend': (rng) => {
    const a = rng.int(2, 20)
    const b = rng.int(1, a - 1)
    return { a, b: null, c: a - b, op: '-' }
  },
  'missing.minuend': (rng) => {
    const b = rng.int(1, 10)
    const c = rng.int(1, 10)
    return { a: null, b, c, op: '-' }
  },
}

export const missingGenerator: Generator = {
  type: 'missing',
  buckets: Object.keys(MAKE),
  generate(bucket, rng): Problem {
    const make = MAKE[bucket]
    if (!make) throw new Error(`missing: unknown bucket ${bucket}`)
    return build(make(rng))
  },
  fromSignature(sig, _rng: Rng, _settings: Settings) {
    const m = /^missing:(\d+|_)([+-])(\d+|_)=(\d+|_)$/.exec(sig)
    if (!m) return null
    const n = (x: string) => (x === '_' ? null : Number(x))
    const parts: Parts = { a: n(m[1]), b: n(m[3]), c: n(m[4]), op: m[2] as Op }
    if ([parts.a, parts.b, parts.c].filter((v) => v === null).length !== 1) return null
    return build(parts)
  },
}
