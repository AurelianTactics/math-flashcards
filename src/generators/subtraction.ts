import type { BucketId, Problem, Settings } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { makeAddSubProblem, parseAddSubSignature } from './addSub'

type Pair = [number, number]

/** Operand pairs (a, b) with a ≥ b so results are never negative. */
const PAIRS: Record<BucketId, (rng: Rng) => Pair> = {
  'sub.within5': (rng) => {
    const a = rng.int(2, 5)
    return [a, rng.int(1, a)]
  },
  'sub.within10': (rng) => {
    const a = rng.int(6, 10)
    return [a, rng.int(1, a)]
  },
  'sub.teenNoBorrow': (rng) => {
    const a = rng.int(11, 19)
    return [a, rng.int(1, a % 10)]
  },
  'sub.acrossTen': (rng) => {
    const a = rng.int(11, 18)
    return [a, rng.int((a % 10) + 1, 9)]
  },
  'sub.2d1d.noBorrow': (rng) => {
    const ones = rng.int(1, 9)
    const a = rng.int(2, 9) * 10 + ones
    return [a, rng.int(1, ones)]
  },
  'sub.2d1d.borrow': (rng) => {
    const ones = rng.int(0, 8)
    const a = rng.int(2, 9) * 10 + ones
    return [a, rng.int(ones + 1, 9)]
  },
  'sub.2d2d.noBorrow': (rng) => {
    const at = rng.int(1, 9)
    const bt = rng.int(1, at)
    const ao = rng.int(at === 1 ? 1 : 0, 9) // keep a >= 11 so it is not "within 10"
    const bo = rng.int(0, ao)
    return [at * 10 + ao, bt * 10 + bo]
  },
  'sub.2d2d.borrow': (rng) => {
    const at = rng.int(2, 9)
    const bt = rng.int(1, at - 1)
    const ao = rng.int(0, 8)
    const bo = rng.int(ao + 1, 9)
    return [at * 10 + ao, bt * 10 + bo]
  },
}

export const subtractionGenerator: Generator = {
  type: 'sub',
  buckets: Object.keys(PAIRS),
  generate(bucket, rng, settings): Problem {
    const make = PAIRS[bucket]
    if (!make) throw new Error(`subtraction: unknown bucket ${bucket}`)
    const [a, b] = make(rng)
    return makeAddSubProblem(a, b, '-', rng, settings)
  },
  fromSignature(sig, rng, settings: Settings) {
    const p = parseAddSubSignature(sig)
    if (!p || p.op !== '-') return null
    return makeAddSubProblem(p.a, p.b, '-', rng, settings)
  },
}
