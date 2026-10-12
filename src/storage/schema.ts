import type { Attempt, Settings, Store, StoreV1 } from '../types'
import { uid } from '../uid'

export const CURRENT_VERSION = 1

export const DEFAULT_SETTINGS: Settings = {
  soundOn: true,
  columnMode: 'auto',
}

export function freshStore(now = Date.now()): StoreV1 {
  return { version: 1, createdAt: now, settings: { ...DEFAULT_SETTINGS }, attempts: [], sessions: [] }
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null

export function isAttempt(x: unknown): x is Attempt {
  if (!isObj(x)) return false
  return (
    typeof x.id === 'string' &&
    typeof x.ts === 'number' &&
    typeof x.sig === 'string' &&
    typeof x.type === 'string' &&
    Array.isArray(x.buckets) &&
    typeof x.correct === 'boolean' &&
    Array.isArray(x.steps) &&
    typeof x.ms === 'number'
  )
}

export function isStoreV1(x: unknown): x is StoreV1 {
  if (!isObj(x)) return false
  if (x.version !== 1) return false
  if (!isObj(x.settings)) return false
  if (!Array.isArray(x.attempts) || !x.attempts.every(isAttempt)) return false
  if (!Array.isArray(x.sessions)) return false
  return true
}

/**
 * Migrations indexed by the version they migrate FROM. migrations[0] handles
 * anything unversioned (returns a fresh store). Add migrations[1] when v2 exists.
 */
export const migrations: ((raw: unknown) => unknown)[] = [
  () => freshStore(),
]

/** Bring any raw parsed value up to the current version, or a fresh store if it cannot be. */
export function migrate(raw: unknown): Store {
  let cur: unknown = raw
  let version = isObj(cur) && typeof cur.version === 'number' ? cur.version : 0
  if (version > CURRENT_VERSION) return freshStore()
  while (version < CURRENT_VERSION) {
    const step = migrations[version]
    if (!step) return freshStore()
    cur = step(cur)
    version = isObj(cur) && typeof cur.version === 'number' ? cur.version : CURRENT_VERSION
  }
  if (!isStoreV1(cur)) return freshStore()
  // Fill any missing settings with defaults so new settings keys are safe.
  cur.settings = { ...DEFAULT_SETTINGS, ...cur.settings }
  return cur
}

export function newSession(now = Date.now()) {
  return { id: uid(), startedAt: now }
}
