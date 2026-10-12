/** Small seedable PRNG (mulberry32) so generators and the scheduler are testable. */
export interface Rng {
  next(): number // [0, 1)
  int(lo: number, hi: number): number // inclusive both ends
  pick<T>(arr: readonly T[]): T
  chance(p: number): boolean
  shuffle<T>(arr: readonly T[]): T[]
}

export function createRng(seed: number = Date.now() >>> 0): Rng {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const rng: Rng = {
    next,
    int(lo, hi) {
      if (hi < lo) [lo, hi] = [hi, lo]
      return lo + Math.floor(next() * (hi - lo + 1))
    },
    pick(arr) {
      if (arr.length === 0) throw new Error('pick from empty array')
      return arr[Math.floor(next() * arr.length)]
    },
    chance(p) {
      return next() < p
    },
    shuffle(arr) {
      const out = arr.slice()
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
  }
  return rng
}
