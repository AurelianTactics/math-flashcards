import type { BucketId, CardType, Problem, Settings } from '../types'
import type { Rng } from '../rng'
import type { Generator } from './types'
import { additionGenerator } from './addition'
import { subtractionGenerator } from './subtraction'
import { comparisonGenerator } from './comparison'
import { fractionGenerator } from './fractions'
import { sequenceGenerator } from './sequences'
import { numberLineGenerator } from './numberLine'
import { numberGridGenerator } from './numberGrid'
import { missingGenerator } from './missingNumber'

export const GENERATORS: Partial<Record<CardType, Generator>> = {
  add: additionGenerator,
  sub: subtractionGenerator,
  compare: comparisonGenerator,
  fraction: fractionGenerator,
  sequence: sequenceGenerator,
  numberLine: numberLineGenerator,
  numberGrid: numberGridGenerator,
  missing: missingGenerator,
}

export function generatorForBucket(bucket: BucketId): Generator | undefined {
  return Object.values(GENERATORS).find((g) => g.buckets.includes(bucket))
}

export function generateForBucket(bucket: BucketId, rng: Rng, settings: Settings): Problem {
  const g = generatorForBucket(bucket)
  if (!g) throw new Error(`no generator for bucket ${bucket}`)
  return g.generate(bucket, rng, settings)
}

export function problemFromSignature(sig: string, rng: Rng, settings: Settings): Problem | null {
  for (const g of Object.values(GENERATORS)) {
    const p = g.fromSignature(sig, rng, settings)
    if (p) return p
  }
  return null
}
