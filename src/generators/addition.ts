import type { BucketId, Problem, Settings } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { makeAddSubProblem, parseAddSubSignature } from './addSub'

type Pair = [number, number]

/** Operand pairs per bucket. Sums are always ≤ 99. */
const PAIRS: Record<BucketId, (rng: Rng) => Pair> = {
  'add.within5': (rng) => {
    const sum = rng.int(2, 5)
    const a = rng.int(1, sum - 1)
    return [a, sum - a]
  },
  'add.within10': (rng) => {
    const sum = rng.int(6, 10)
    const a = rng.int(1, sum - 1)
    return [a, sum - a]
  },
  'add.tensPlusOnes': (rng) => [rng.int(1, 9) * 10, rng.int(1, 9)],
  'add.teenMakeTen': (rng) => {
    const a = rng.int(2, 9)
    const b = rng.int(Math.max(2, 11 - a), 9)
    return [a, b]
  },
  'add.2d1d.noCarry': (rng) => {
    const ones = rng.int(1, 8)
    const a = rng.int(1, 9) * 10 + ones
    return [a, rng.int(1, 9 - ones)]
  },
  'add.2d1d.carry': (rng) => {
    const ones = rng.int(1, 9)
    const a = rng.int(1, 8) * 10 + ones
    return [a, rng.int(10 - ones, 9)]
  },
  'add.2d2d.noCarry': (rng) => {
    const at = rng.int(1, 8)
    const bt = rng.int(1, 9 - at)
    const ao = rng.int(0, 9)
    const bo = rng.int(0, 9 - ao)
    return [at * 10 + ao, bt * 10 + bo]
  },
  'add.2d2d.carry': (rng) => {
    const ao = rng.int(1, 9)
    const bo = rng.int(10 - ao, 9)
    const at = rng.int(1, 7)
    const bt = rng.int(1, 8 - at)
    return [at * 10 + ao, bt * 10 + bo]
  },
}

export const additionGenerator: Generator = {
  type: 'add',
  buckets: Object.keys(PAIRS),
  generate(bucket, rng, settings): Problem {
    const make = PAIRS[bucket]
    if (!make) throw new Error(`addition: unknown bucket ${bucket}`)
    let [a, b] = make(rng)
    if (rng.chance(0.5)) [a, b] = [b, a]
    return makeAddSubProblem(a, b, '+', rng, settings)
  },
  fromSignature(sig, rng, settings: Settings) {
    const p = parseAddSubSignature(sig)
    if (!p || p.op !== '+') return null
    return makeAddSubProblem(p.a, p.b, '+', rng, settings)
  },
}
