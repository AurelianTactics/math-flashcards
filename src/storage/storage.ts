import type { Attempt, Store } from '../types'
import { freshStore, isAttempt, migrate } from './schema'

export const STORAGE_KEY = 'math-flashcards:store'

function getLocalStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

/** Load the store, migrating old data and recovering from corruption without throwing. */
export function load(): Store {
  const ls = getLocalStorage()
  if (!ls) return freshStore()
  const text = ls.getItem(STORAGE_KEY)
  if (!text) return freshStore()
  try {
    return migrate(JSON.parse(text))
  } catch {
    try {
      ls.setItem(`${STORAGE_KEY}:corrupt-${Date.now()}`, text)
    } catch {
      /* ignore */
    }
    return freshStore()
  }
}

export function saveNow(store: Store): void {
  const ls = getLocalStorage()
  if (!ls) return
  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* quota or private mode: ignore */
  }
}

let timer: ReturnType<typeof setTimeout> | null = null
let pending: Store | null = null
/** Debounced save (300ms). */
export function save(store: Store, delay = 300): void {
  if (timer) clearTimeout(timer)
  pending = store
  timer = setTimeout(() => {
    timer = null
    pending = null
    saveNow(store)
  }, delay)
}

/** Write a pending debounced save immediately (used on page unload). No-op when nothing is pending. */
export function flush(): void {
  if (!timer || !pending) return
  clearTimeout(timer)
  timer = null
  const s = pending
  pending = null
  saveNow(s)
}

export function exportJson(store: Store): string {
  return JSON.stringify(store, null, 2)
}

export function exportFilename(now = new Date()): string {
  const d = now.toISOString().slice(0, 10)
  return `math-flashcards-${d}.json`
}

export type ImportMode = 'replace' | 'merge'

/** Parse imported JSON. 'merge' keeps current settings and dedupes attempts by id. Throws on invalid input. */
export function importJson(text: string, current: Store, mode: ImportMode): Store {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (typeof raw !== 'object' || raw === null || !('attempts' in raw)) {
    throw new Error('That file does not look like a math-flashcards export.')
  }
  const incoming = migrate(raw)
  if (mode === 'replace') return incoming
  const seen = new Set(current.attempts.map((a) => a.id))
  const merged: Attempt[] = current.attempts.slice()
  for (const a of incoming.attempts) {
    if (isAttempt(a) && !seen.has(a.id)) {
      merged.push(a)
      seen.add(a.id)
    }
  }
  merged.sort((x, y) => x.ts - y.ts)
  const sessionIds = new Set(current.sessions.map((s) => s.id))
  const sessions = current.sessions.concat(incoming.sessions.filter((s) => !sessionIds.has(s.id)))
  return { ...current, attempts: merged, sessions }
}
