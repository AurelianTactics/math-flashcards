import type { Attempt } from '../types'

/**
 * Signatures that still need another look: the last attempt was wrong, or a wrong
 * answer in the last three attempts has not yet been followed by two correct ones.
 */
export function weakSignatures(attempts: Attempt[]): string[] {
  const bySig = new Map<string, Attempt[]>()
  for (const a of attempts) {
    const list = bySig.get(a.sig)
    if (list) list.push(a)
    else bySig.set(a.sig, [a])
  }
  const weak: string[] = []
  for (const [sig, list] of bySig) {
    const last3 = list.slice().sort((x, y) => x.ts - y.ts).slice(-3)
    const lastWrong = last3.map((a) => a.correct).lastIndexOf(false)
    if (lastWrong === -1) continue
    const correctAfter = last3.length - 1 - lastWrong
    if (correctAfter < 2) weak.push(sig)
  }
  return weak
}
