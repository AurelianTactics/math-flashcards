import type { BucketId, CardType, Problem, Settings } from '../types'
import type { Rng } from '../rng'

export interface Generator {
  type: CardType
  /** Primary buckets this generator can produce. */
  buckets: BucketId[]
  generate(bucket: BucketId, rng: Rng, settings: Settings): Problem
  /** Rebuild a problem from its signature (used to re-serve weak items). Null if not parseable. */
  fromSignature(sig: string, rng: Rng, settings: Settings): Problem | null
}
