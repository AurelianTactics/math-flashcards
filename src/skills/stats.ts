import type { Attempt, BucketId, BucketStat, CardType, Mastery, StepId } from '../types'
import { BUCKETS, bucketsForType } from './buckets'

export const RECENT_WINDOW = 30
export const DECAY = 0.9

/** Recency-weighted accuracy: newest attempt has weight 1, next 0.9, then 0.81, ... */
export function weightedAccuracy(recent: Attempt[]): number {
  if (recent.length === 0) return 0
  let num = 0
  let den = 0
  for (let k = 0; k < recent.length; k++) {
    const w = Math.pow(DECAY, k)
    den += w
    if (recent[recent.length - 1 - k].correct) num += w
  }
  return num / den
}

export function masteryFor(n: number, recentAcc: number): Mastery {
  if (n < 5) return 'new'
  if (recentAcc < 0.7) return 'learning'
  if (recentAcc < 0.9 || n < 10) return 'improving'
  return 'mastered'
}

export function trendFor(sorted: Attempt[]): 'up' | 'flat' | 'down' {
  if (sorted.length < 20) return 'flat'
  const last = sorted.slice(-15)
  const prev = sorted.slice(-30, -15)
  const acc = (xs: Attempt[]) => xs.filter((a) => a.correct).length / xs.length
  const d = acc(last) - acc(prev)
  if (d >= 0.1) return 'up'
  if (d <= -0.1) return 'down'
  return 'flat'
}

function mostMissedStep(sorted: Attempt[]): StepId | undefined {
  const counts = new Map<StepId, number>()
  for (const a of sorted) if (a.firstWrongStep && a.firstWrongStep !== 'answer') counts.set(a.firstWrongStep, (counts.get(a.firstWrongStep) ?? 0) + 1)
  let best: StepId | undefined
  let bestN = 0
  for (const [id, n] of counts) if (n > bestN) [best, bestN] = [id, n]
  return best
}

/** Per-bucket statistics for every bucket in the catalog (primary bucket only). */
export function bucketStats(attempts: Attempt[]): Record<BucketId, BucketStat> {
  const byBucket = new Map<BucketId, Attempt[]>()
  for (const a of attempts) {
    const b = a.buckets[0]
    if (!b) continue
    const list = byBucket.get(b)
    if (list) list.push(a)
    else byBucket.set(b, [a])
  }
  const out: Record<BucketId, BucketStat> = {}
  for (const def of BUCKETS) {
    const sorted = (byBucket.get(def.id) ?? []).slice().sort((x, y) => x.ts - y.ts)
    const recent = sorted.slice(-RECENT_WINDOW)
    const n = sorted.length
    const recentAcc = weightedAccuracy(recent)
    out[def.id] = {
      id: def.id,
      n,
      acc: n ? sorted.filter((a) => a.correct).length / n : 0,
      recentAcc,
      trend: trendFor(sorted),
      mastery: masteryFor(n, recentAcc),
      avgMs: recent.length ? recent.reduce((s, a) => s + a.ms, 0) / recent.length : 0,
      unlocked: def.tier === 1,
      mostMissedStep: mostMissedStep(sorted),
    }
  }
  // Unlock tier N+1 when every tier-N bucket of that type is improving or mastered.
  for (const def of BUCKETS) {
    if (def.tier === 1) continue
    const prev = bucketsForType(def.type).filter((b) => b.tier === def.tier - 1)
    out[def.id].unlocked = prev.every((b) => {
      const m = out[b.id].mastery
      return (m === 'improving' || m === 'mastered') && out[b.id].unlocked
    })
  }
  return out
}

export function unlockedBuckets(stats: Record<BucketId, BucketStat>, type: CardType): BucketStat[] {
  return bucketsForType(type).map((b) => stats[b.id]).filter((s) => s.unlocked)
}

export interface SessionSummary {
  id: string
  startedAt: number
  count: number
  correct: number
  accuracy: number
  bestStreak: number
  avgMs: number
}

export function summarizeSession(attempts: Attempt[], sessionId: string, startedAt: number): SessionSummary {
  const list = attempts.filter((a) => a.sessionId === sessionId).sort((x, y) => x.ts - y.ts)
  let streak = 0
  let best = 0
  for (const a of list) {
    streak = a.correct ? streak + 1 : 0
    best = Math.max(best, streak)
  }
  const correct = list.filter((a) => a.correct).length
  return {
    id: sessionId,
    startedAt,
    count: list.length,
    correct,
    accuracy: list.length ? correct / list.length : 0,
    bestStreak: best,
    avgMs: list.length ? list.reduce((s, a) => s + a.ms, 0) / list.length : 0,
  }
}

export interface LearningPlan {
  greatAt: BucketId[]
  workingOn: BucketId[]
  nextUp: BucketId[]
}

/** Plain-language plan: what she has nailed, what to practice, what is newly open to try. */
export function learningPlan(stats: Record<BucketId, BucketStat>): LearningPlan {
  const greatAt = BUCKETS.filter((b) => stats[b.id].mastery === 'mastered').map((b) => b.id)
  const workingOn = BUCKETS.filter((b) => {
    const s = stats[b.id]
    return s.unlocked && s.mastery !== 'mastered' && s.n >= 3
  })
    .sort((x, y) => stats[x.id].recentAcc - stats[y.id].recentAcc)
    .slice(0, 3)
    .map((b) => b.id)
  // Next up: the first unlocked bucket per type that has barely been tried yet.
  const nextUp: BucketId[] = []
  const seenType = new Set<CardType>()
  for (const b of BUCKETS) {
    if (seenType.has(b.type)) continue
    const s = stats[b.id]
    if (s.unlocked && s.n < 3) {
      nextUp.push(b.id)
      seenType.add(b.type)
    }
  }
  return { greatAt, workingOn, nextUp }
}
