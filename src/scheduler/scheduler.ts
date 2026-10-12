import type { Attempt, BucketId, BucketStat, CardType, Problem, Settings } from '../types'
import { CARD_TYPES } from '../types'
import type { Rng } from '../rng'
import { GENERATORS, generateForBucket, problemFromSignature } from '../generators'
import { bucketStats, unlockedBuckets } from '../skills/stats'
import { weakSignatures } from '../skills/weak'

export const WEAK_RESERVE_CHANCE = 0.15
export const MASTERED_SHARE = 0.25
export const RECENT_SIG_WINDOW = 5

export const DEFAULT_TYPE_WEIGHTS: Record<CardType, number> = {
  add: 0.4,
  sub: 0.4,
  compare: 0.2 / 6,
  fraction: 0.2 / 6,
  sequence: 0.2 / 6,
  numberLine: 0.2 / 6,
  numberGrid: 0.2 / 6,
  missing: 0.2 / 6,
}

const MASTERY_WEIGHT: Record<BucketStat['mastery'], number> = { learning: 4, new: 3, improving: 2, mastered: 1 }

function weightedPick<T>(items: T[], weight: (t: T) => number, rng: Rng): T {
  const total = items.reduce((s, t) => s + weight(t), 0)
  let r = rng.next() * total
  for (const t of items) {
    r -= weight(t)
    if (r < 0) return t
  }
  return items[items.length - 1]
}

/** Only card types that have a generator today. */
export function availableTypes(): CardType[] {
  return CARD_TYPES.filter((t) => GENERATORS[t])
}

export function pickType(settings: Settings, rng: Rng, types = availableTypes()): CardType {
  const w = (t: CardType) => Math.max(0, settings.typeWeights?.[t] ?? DEFAULT_TYPE_WEIGHTS[t])
  if (types.every((t) => w(t) === 0)) return rng.pick(types)
  return weightedPick(types, w, rng)
}

/**
 * Choose a bucket within a type. Mastered buckets collectively get MASTERED_SHARE of the
 * probability (confidence practice); the rest goes to buckets still being learned.
 */
export function pickBucket(stats: Record<BucketId, BucketStat>, type: CardType, rng: Rng): BucketId {
  const unlocked = unlockedBuckets(stats, type)
  const mastered = unlocked.filter((s) => s.mastery === 'mastered')
  const learning = unlocked.filter((s) => s.mastery !== 'mastered')
  let pool: BucketStat[]
  if (mastered.length === 0) pool = learning
  else if (learning.length === 0) pool = mastered
  else pool = rng.chance(MASTERED_SHARE) ? mastered : learning
  return weightedPick(pool, (s) => MASTERY_WEIGHT[s.mastery], rng).id
}

export interface PickArgs {
  attempts: Attempt[]
  settings: Settings
  /** Signatures served most recently (newest last). */
  recentSigs: string[]
  rng: Rng
  stats?: Record<BucketId, BucketStat>
}

/** Pure: pick the next problem from the attempt history. */
export function pickNext({ attempts, settings, recentSigs, rng, stats }: PickArgs): Problem {
  const recent = new Set(recentSigs.slice(-RECENT_SIG_WINDOW))
  const s = stats ?? bucketStats(attempts)

  if (rng.chance(WEAK_RESERVE_CHANCE)) {
    const weak = weakSignatures(attempts).filter((sig) => !recent.has(sig))
    if (weak.length > 0) {
      const p = problemFromSignature(rng.pick(weak), rng, settings)
      if (p) return p
    }
  }

  const type = pickType(settings, rng)
  const bucket = pickBucket(s, type, rng)
  let problem = generateForBucket(bucket, rng, settings)
  for (let i = 0; i < 5 && recent.has(problem.signature); i++) {
    problem = generateForBucket(bucket, rng, settings)
  }
  return problem
}
