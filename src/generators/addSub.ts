import type { Op, Problem, Settings } from '../types'
import type { Rng } from '../rng'
import { classifyAddSub } from '../skills/buckets'
import { buildAddSteps, buildSubSteps, needsColumnMode, singleStep } from '../steps/columnSteps'
import { explainAddSub } from './explain'
import { uid } from '../uid'

export function addSubSignature(a: number, b: number, op: Op): string {
  return op === '+' ? `add:${a}+${b}` : `sub:${a}-${b}`
}

export function parseAddSubSignature(sig: string): { a: number; b: number; op: Op } | null {
  const m = /^(add|sub):(\d+)([+-])(\d+)$/.exec(sig)
  if (!m) return null
  return { a: Number(m[2]), b: Number(m[4]), op: m[3] as Op }
}

/** Build a full add/sub Problem from operands. Shared by the add and sub generators. */
export function makeAddSubProblem(a: number, b: number, op: Op, rng: Rng, settings: Settings): Problem {
  const columns = needsColumnMode(op, a, b, rng, settings)
  const answer = op === '+' ? a + b : a - b
  const steps = columns ? (op === '+' ? buildAddSteps(a, b) : buildSubSteps(a, b)) : singleStep(answer)
  return {
    id: uid(),
    signature: addSubSignature(a, b, op),
    type: op === '+' ? 'add' : 'sub',
    buckets: classifyAddSub(a, b, op),
    data: op === '+' ? { type: 'add', a, b } : { type: 'sub', a, b },
    layout: columns ? 'columns' : 'inline',
    steps,
    explanation: explainAddSub(a, b, op),
    prompt: '',
  }
}
