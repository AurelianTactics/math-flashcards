import type { Problem, Settings } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { singleStep } from '../steps/columnSteps'
import { uid } from '../uid'

function build(items: (number | null)[]): Problem | null {
  const blank = items.indexOf(null)
  if (blank === -1 || items.filter((x) => x === null).length !== 1) return null
  // step from any adjacent known pair
  let step = 0
  for (let i = 0; i + 1 < items.length; i++) {
    if (items[i] !== null && items[i + 1] !== null) {
      step = (items[i + 1] as number) - (items[i] as number)
      break
    }
  }
  if (step === 0) return null
  const first = items.findIndex((x) => x !== null)
  const answer = (items[first] as number) + step * (blank - first)
  const dir = step > 0 ? 'fwd' : 'back'
  const by = Math.abs(step)
  if (![1, 2, 5, 10].includes(by)) return null
  const full = items.map((x) => (x === null ? answer : x)) as number[]
  return {
    id: uid(),
    signature: `seq:${items.map((x) => (x === null ? '_' : x)).join(',')}`,
    type: 'sequence',
    buckets: [`seq.by${by}.${dir}`],
    data: { type: 'sequence', items, step, dir, answer },
    layout: 'inline',
    steps: singleStep(answer),
    explanation: { kind: 'sequence', items: full, step, dir, answerIndex: blank },
    prompt: blank === items.length - 1 ? 'What number comes next?' : 'What number is missing?',
  }
}

const START: Record<string, (rng: Rng, len: number) => number> = {
  'seq.by1.fwd': (rng) => rng.int(1, 94),
  'seq.by1.back': (rng, len) => rng.int(len, 99),
  'seq.by2.fwd': (rng) => rng.int(0, 88),
  'seq.by2.back': (rng, len) => rng.int(len * 2, 98),
  'seq.by5.fwd': (rng) => rng.int(0, 15) * 5,
  'seq.by5.back': (rng, len) => rng.int(len, 19) * 5,
  'seq.by10.fwd': (rng) => (rng.chance(0.5) ? rng.int(0, 5) * 10 : rng.int(1, 55)),
  'seq.by10.back': (rng, len) => (rng.chance(0.5) ? rng.int(len, 10) * 10 : rng.int(len * 10 + 1, 99)),
}

export const sequenceGenerator: Generator = {
  type: 'sequence',
  buckets: Object.keys(START),
  generate(bucket, rng): Problem {
    const start = START[bucket]
    if (!start) throw new Error(`sequence: unknown bucket ${bucket}`)
    const by = Number(/by(\d+)/.exec(bucket)![1])
    const dir = bucket.endsWith('fwd') ? 1 : -1
    const len = rng.chance(0.5) ? 4 : 5
    const s = start(rng, len)
    const full = Array.from({ length: len }, (_, i) => s + dir * by * i)
    const blank = rng.chance(0.7) ? len - 1 : rng.int(1, len - 2)
    const items = full.map((x, i) => (i === blank ? null : x))
    const p = build(items)
    if (!p) throw new Error(`sequence: could not build ${items.join(',')}`)
    return p
  },
  fromSignature(sig, _rng: Rng, _settings: Settings) {
    const m = /^seq:([\d_,]+)$/.exec(sig)
    if (!m) return null
    const items = m[1].split(',').map((x) => (x === '_' ? null : Number(x)))
    if (items.some((x) => x !== null && Number.isNaN(x))) return null
    return build(items)
  },
}
