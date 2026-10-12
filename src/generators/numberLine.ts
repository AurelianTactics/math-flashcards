import type { BucketId, ChoiceOption, Problem, Settings, Step } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { singleStep } from '../steps/columnSteps'
import { uid } from '../uid'

interface Spec {
  mode: 'read' | 'locate' | 'jump'
  min: number
  max: number
  tick: number
  target: number
  from?: number
  jump?: number
  options?: number[]
}

const RANGES: [number, number, number][] = [
  [0, 10, 5],
  [0, 20, 5],
  [0, 20, 10],
  [10, 30, 10],
]

function build(s: Spec): Problem {
  const base = { min: s.min, max: s.max, tick: s.tick }
  let steps: Step[]
  let signature: string
  let prompt: string
  let bucket: BucketId
  if (s.mode === 'locate') {
    const options: ChoiceOption[] = (s.options ?? []).map((v, i) => ({ key: String(i + 1), label: String(i + 1), value: String(v) }))
    steps = [{ id: 'choice', kind: 'choice', expected: (s.options ?? []).indexOf(s.target), options, label: '' }]
    signature = `line:locate:${s.min}-${s.max}:${s.tick}:${s.target}:${(s.options ?? []).join('.')}`
    prompt = `Which arrow points to ${s.target}?`
    bucket = 'line.locate'
  } else if (s.mode === 'jump') {
    steps = singleStep(s.target)
    const j = s.jump ?? 0
    signature = `line:jump:${s.min}-${s.max}:${s.tick}:${s.from}${j >= 0 ? '+' : '-'}${Math.abs(j)}`
    prompt = `Start at ${s.from}. Jump ${Math.abs(j)} ${j >= 0 ? 'forward' : 'back'}. Where do you land?`
    bucket = 'line.jump'
  } else {
    steps = singleStep(s.target)
    signature = `line:read:${s.min}-${s.max}:${s.tick}:${s.target}`
    prompt = 'What number is the arrow pointing to?'
    bucket = 'line.read'
  }
  return {
    id: uid(),
    signature,
    type: 'numberLine',
    buckets: [bucket],
    data: { type: 'numberLine', ...base, mode: s.mode, from: s.from, jump: s.jump, target: s.target, options: s.options },
    layout: 'inline',
    steps,
    explanation: { kind: 'numberLine', ...base, from: s.from, to: s.target },
    prompt,
  }
}

const MAKE: Record<BucketId, (rng: Rng) => Spec> = {
  'line.read': (rng) => {
    const [min, max, tick] = rng.pick(RANGES)
    let target = rng.int(min, max)
    if (target % tick === 0 && rng.chance(0.8)) target = Math.min(max, target + 1)
    return { mode: 'read', min, max, tick, target }
  },
  'line.locate': (rng) => {
    const [min, max, tick] = rng.pick(RANGES)
    const target = rng.int(min + 1, max - 1)
    const set = new Set<number>([target])
    while (set.size < 4) set.add(rng.int(min, max))
    const options = [...set].sort((a, b) => a - b)
    return { mode: 'locate', min, max, tick, target, options }
  },
  'line.jump': (rng) => {
    const [min, max, tick] = rng.pick(RANGES)
    const jump = rng.int(1, 5) * (rng.chance(0.6) ? 1 : -1)
    const from = jump > 0 ? rng.int(min, max - jump) : rng.int(min - jump, max)
    return { mode: 'jump', min, max, tick, from, jump, target: from + jump }
  },
}

export const numberLineGenerator: Generator = {
  type: 'numberLine',
  buckets: Object.keys(MAKE),
  generate(bucket, rng): Problem {
    const make = MAKE[bucket]
    if (!make) throw new Error(`numberLine: unknown bucket ${bucket}`)
    return build(make(rng))
  },
  fromSignature(sig, _rng: Rng, _settings: Settings) {
    let m = /^line:read:(\d+)-(\d+):(\d+):(\d+)$/.exec(sig)
    if (m) return build({ mode: 'read', min: +m[1], max: +m[2], tick: +m[3], target: +m[4] })
    m = /^line:locate:(\d+)-(\d+):(\d+):(\d+):([\d.]+)$/.exec(sig)
    if (m) return build({ mode: 'locate', min: +m[1], max: +m[2], tick: +m[3], target: +m[4], options: m[5].split('.').map(Number) })
    m = /^line:jump:(\d+)-(\d+):(\d+):(\d+)([+-])(\d+)$/.exec(sig)
    if (m) {
      const jump = (m[5] === '-' ? -1 : 1) * +m[6]
      return build({ mode: 'jump', min: +m[1], max: +m[2], tick: +m[3], from: +m[4], jump, target: +m[4] + jump })
    }
    return null
  },
}
