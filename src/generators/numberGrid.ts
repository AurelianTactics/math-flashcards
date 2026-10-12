import type { BucketId, Problem, Settings } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { singleStep } from '../steps/columnSteps'
import { uid } from '../uid'

type Delta = 1 | -1 | 10 | -10

function build(start: number, delta: Delta): Problem | null {
  const answer = start + delta
  if (start < 1 || start > 100 || answer < 1 || answer > 100) return null
  const amount = Math.abs(delta)
  const more = delta > 0
  return {
    id: uid(),
    signature: `grid:${start}:${more ? '+' : '-'}${amount}`,
    type: 'numberGrid',
    buckets: [amount === 1 ? 'grid.plusMinus1' : 'grid.plusMinus10'],
    data: { type: 'numberGrid', start, delta, answer },
    layout: 'inline',
    steps: singleStep(answer),
    explanation: { kind: 'grid', from: start, to: answer, delta },
    prompt: `What is ${amount} ${more ? 'more' : 'less'} than ${start}?`,
  }
}

const MAKE: Record<BucketId, (rng: Rng) => [number, Delta]> = {
  'grid.plusMinus1': (rng) => [rng.int(2, 99), rng.chance(0.5) ? 1 : -1],
  'grid.plusMinus10': (rng) => [rng.int(11, 90), rng.chance(0.5) ? 10 : -10],
}

export const numberGridGenerator: Generator = {
  type: 'numberGrid',
  buckets: Object.keys(MAKE),
  generate(bucket, rng): Problem {
    const make = MAKE[bucket]
    if (!make) throw new Error(`numberGrid: unknown bucket ${bucket}`)
    const [start, delta] = make(rng)
    const p = build(start, delta)
    if (!p) throw new Error(`numberGrid: bad problem ${start} ${delta}`)
    return p
  },
  fromSignature(sig, _rng: Rng, _settings: Settings) {
    const m = /^grid:(\d+):([+-])(1|10)$/.exec(sig)
    if (!m) return null
    const delta = ((m[2] === '-' ? -1 : 1) * Number(m[3])) as Delta
    return build(Number(m[1]), delta)
  },
}
