import type { BucketId, ChoiceOption, Problem, Settings, Step } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { singleStep } from '../steps/columnSteps'
import { uid } from '../uid'

type Pieces = 2 | 3 | 4
type Shape = 'circle' | 'rect'
type Mode = 'countPieces' | 'pickCorrect' | 'name'
interface Opt {
  pieces: number
  equal: boolean
}

export const PIECE_NAMES: Record<Pieces, { one: string; many: string }> = {
  2: { one: 'half', many: 'halves' },
  3: { one: 'third', many: 'thirds' },
  4: { one: 'fourth', many: 'fourths' },
}
const BUCKET: Record<Pieces, BucketId> = { 2: 'fraction.halves', 3: 'fraction.thirds', 4: 'fraction.quarters' }

const NAME_OPTIONS: ChoiceOption[] = [
  { key: '1', label: 'a half', value: '2' },
  { key: '2', label: 'a third', value: '3' },
  { key: '3', label: 'a fourth', value: '4' },
]

function build(mode: Mode, shape: Shape, pieces: Pieces, options?: Opt[]): Problem {
  let steps: Step[]
  let prompt: string
  let sig = `fraction:${mode}:${shape}:${pieces}`
  if (mode === 'countPieces') {
    steps = singleStep(pieces)
    prompt = 'How many equal pieces is this shape cut into?'
  } else if (mode === 'name') {
    steps = [{ id: 'choice', kind: 'choice', expected: NAME_OPTIONS.findIndex((o) => o.value === String(pieces)), options: NAME_OPTIONS, label: '' }]
    prompt = `This shape is cut into ${pieces} equal pieces. Each piece is called...`
  } else {
    const opts = options ?? []
    const choice: ChoiceOption[] = opts.map((o, i) => ({ key: String(i + 1), value: `${o.pieces}${o.equal ? 'e' : 'u'}` }))
    steps = [{ id: 'choice', kind: 'choice', expected: opts.findIndex((o) => o.pieces === pieces && o.equal), options: choice, label: '' }]
    prompt = `Which shape is cut into ${pieces} equal pieces (${PIECE_NAMES[pieces].many})?`
    sig += `:${choice.map((c) => c.value).join('.')}`
  }
  return {
    id: uid(),
    signature: sig,
    type: 'fraction',
    buckets: [BUCKET[pieces]],
    data: { type: 'fraction', pieces, shape, mode, options },
    layout: 'inline',
    steps,
    explanation: { kind: 'fraction', pieces, shape },
    prompt,
  }
}

function pickOptions(pieces: Pieces, rng: Rng): Opt[] {
  const others = ([2, 3, 4] as Pieces[]).filter((p) => p !== pieces)
  const opts: Opt[] = [
    { pieces, equal: true },
    { pieces, equal: false },
    { pieces: rng.pick(others), equal: true },
  ]
  return rng.shuffle(opts)
}

function gen(pieces: Pieces, rng: Rng): Problem {
  const shape: Shape = rng.chance(0.5) ? 'circle' : 'rect'
  const mode: Mode = rng.pick(['countPieces', 'pickCorrect', 'pickCorrect', 'name'])
  return build(mode, shape, pieces, mode === 'pickCorrect' ? pickOptions(pieces, rng) : undefined)
}

export const fractionGenerator: Generator = {
  type: 'fraction',
  buckets: Object.values(BUCKET),
  generate(bucket, rng): Problem {
    const pieces = (Object.keys(BUCKET) as unknown as Pieces[]).map(Number).find((p) => BUCKET[p as Pieces] === bucket) as Pieces | undefined
    if (!pieces) throw new Error(`fraction: unknown bucket ${bucket}`)
    return gen(pieces, rng)
  },
  fromSignature(sig, _rng: Rng, _settings: Settings) {
    const m = /^fraction:(countPieces|pickCorrect|name):(circle|rect):([234])(?::([234eu.]+))?$/.exec(sig)
    if (!m) return null
    const mode = m[1] as Mode
    const pieces = Number(m[3]) as Pieces
    let options: Opt[] | undefined
    if (mode === 'pickCorrect') {
      if (!m[4]) return null
      options = m[4].split('.').map((s) => ({ pieces: Number(s[0]), equal: s[1] === 'e' }))
    }
    return build(mode, m[2] as Shape, pieces, options)
  },
}
