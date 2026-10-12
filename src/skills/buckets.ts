import type { BucketDef, BucketId, CardType, Op } from '../types'

/**
 * Skill bucket catalog. Each bucket has a tier within its card type; tier N+1
 * unlocks once every tier-N bucket is 'improving' or 'mastered'.
 */
export const BUCKETS: BucketDef[] = [
  // Addition
  { id: 'add.within5', type: 'add', tier: 1, label: 'Adding within 5' },
  { id: 'add.within10', type: 'add', tier: 2, label: 'Adding within 10' },
  { id: 'add.tensPlusOnes', type: 'add', tier: 3, label: 'Tens plus ones (20 + 7)' },
  { id: 'add.teenMakeTen', type: 'add', tier: 4, label: 'Sums 11–18 (make ten)' },
  { id: 'add.2d1d.noCarry', type: 'add', tier: 5, label: '2-digit + 1-digit, no carry' },
  { id: 'add.2d1d.carry', type: 'add', tier: 6, label: '2-digit + 1-digit with carry' },
  { id: 'add.2d2d.noCarry', type: 'add', tier: 7, label: '2-digit + 2-digit, no carry' },
  { id: 'add.2d2d.carry', type: 'add', tier: 8, label: '2-digit + 2-digit with carry' },
  // Subtraction
  { id: 'sub.within5', type: 'sub', tier: 1, label: 'Subtracting within 5' },
  { id: 'sub.within10', type: 'sub', tier: 2, label: 'Subtracting within 10' },
  { id: 'sub.teenNoBorrow', type: 'sub', tier: 3, label: 'Teens minus ones (15 − 3)' },
  { id: 'sub.acrossTen', type: 'sub', tier: 4, label: 'Subtracting across ten (14 − 6)' },
  { id: 'sub.2d1d.noBorrow', type: 'sub', tier: 5, label: '2-digit − 1-digit, no borrow' },
  { id: 'sub.2d1d.borrow', type: 'sub', tier: 6, label: '2-digit − 1-digit with borrow' },
  { id: 'sub.2d2d.noBorrow', type: 'sub', tier: 7, label: '2-digit − 2-digit, no borrow' },
  { id: 'sub.2d2d.borrow', type: 'sub', tier: 8, label: '2-digit − 2-digit with borrow' },
  // Comparison
  { id: 'compare.numbers', type: 'compare', tier: 1, label: 'Comparing numbers' },
  { id: 'compare.expressions', type: 'compare', tier: 2, label: 'Comparing sums (3 + 4 ? 8)' },
  // Fractions
  { id: 'fraction.halves', type: 'fraction', tier: 1, label: 'Halves' },
  { id: 'fraction.quarters', type: 'fraction', tier: 2, label: 'Quarters' },
  { id: 'fraction.thirds', type: 'fraction', tier: 3, label: 'Thirds' },
  // Sequences
  { id: 'seq.by1.fwd', type: 'sequence', tier: 1, label: 'Counting up by 1' },
  { id: 'seq.by1.back', type: 'sequence', tier: 1, label: 'Counting down by 1' },
  { id: 'seq.by2.fwd', type: 'sequence', tier: 1, label: 'Counting up by 2' },
  { id: 'seq.by10.fwd', type: 'sequence', tier: 1, label: 'Counting up by 10' },
  { id: 'seq.by5.fwd', type: 'sequence', tier: 2, label: 'Counting up by 5' },
  { id: 'seq.by2.back', type: 'sequence', tier: 2, label: 'Counting down by 2' },
  { id: 'seq.by5.back', type: 'sequence', tier: 3, label: 'Counting down by 5' },
  { id: 'seq.by10.back', type: 'sequence', tier: 3, label: 'Counting down by 10' },
  // Number line
  { id: 'line.read', type: 'numberLine', tier: 1, label: 'Reading a number line' },
  { id: 'line.locate', type: 'numberLine', tier: 2, label: 'Finding a number on the line' },
  { id: 'line.jump', type: 'numberLine', tier: 3, label: 'Jumping on the number line' },
  // Number grid
  { id: 'grid.plusMinus1', type: 'numberGrid', tier: 1, label: '1 more / 1 less on the 100 grid' },
  { id: 'grid.plusMinus10', type: 'numberGrid', tier: 2, label: '10 more / 10 less on the 100 grid' },
  // Missing number
  { id: 'missing.addend', type: 'missing', tier: 1, label: 'Missing addend (2 + ? = 4)' },
  { id: 'missing.subtrahend', type: 'missing', tier: 2, label: 'Missing subtrahend (8 − ? = 5)' },
  { id: 'missing.minuend', type: 'missing', tier: 3, label: 'Missing start (? − 3 = 5)' },
]

/** Tags are secondary labels that never act as a primary (scheduling) bucket. */
export const TAGS: Record<string, string> = {
  'add.doubles': 'Doubles (4 + 4)',
  'sub.tensApart': 'Tens apart (30 − 10)',
}

const byId = new Map(BUCKETS.map((b) => [b.id, b]))

export function bucketDef(id: BucketId): BucketDef | undefined {
  return byId.get(id)
}

export function bucketLabel(id: BucketId): string {
  return byId.get(id)?.label ?? TAGS[id] ?? id
}

export function bucketsForType(type: CardType): BucketDef[] {
  return BUCKETS.filter((b) => b.type === type)
}

export function maxTier(type: CardType): number {
  return Math.max(...bucketsForType(type).map((b) => b.tier))
}

/**
 * Classify an addition or subtraction problem. Returns [primaryBucket, ...tags].
 * Generators call this so that bucket and signature always agree.
 */
export function classifyAddSub(a: number, b: number, op: Op): BucketId[] {
  if (op === '+') return classifyAdd(a, b)
  return classifySub(a, b)
}

function classifyAdd(a: number, b: number): BucketId[] {
  const sum = a + b
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const tags: BucketId[] = []
  if (a === b && a <= 10) tags.push('add.doubles')

  let primary: BucketId
  if (hi <= 10 && sum <= 10) {
    primary = sum <= 5 ? 'add.within5' : 'add.within10'
  } else if (hi <= 9) {
    primary = 'add.teenMakeTen' // both single digit, sum 11..18
  } else if (lo <= 9) {
    if (hi % 10 === 0) primary = 'add.tensPlusOnes'
    else primary = hi % 10 + lo >= 10 ? 'add.2d1d.carry' : 'add.2d1d.noCarry'
  } else {
    primary = a % 10 + b % 10 >= 10 ? 'add.2d2d.carry' : 'add.2d2d.noCarry'
  }
  return [primary, ...tags]
}

function classifySub(a: number, b: number): BucketId[] {
  const tags: BucketId[] = []
  if (a >= 10 && b >= 10 && a % 10 === 0 && b % 10 === 0) tags.push('sub.tensApart')

  let primary: BucketId
  if (a <= 5) primary = 'sub.within5'
  else if (a <= 10) primary = 'sub.within10'
  else if (b <= 9 && a <= 19) primary = a % 10 >= b ? 'sub.teenNoBorrow' : 'sub.acrossTen'
  else if (b <= 9) primary = a % 10 >= b ? 'sub.2d1d.noBorrow' : 'sub.2d1d.borrow'
  else primary = a % 10 >= b % 10 ? 'sub.2d2d.noBorrow' : 'sub.2d2d.borrow'
  return [primary, ...tags]
}
