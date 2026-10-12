import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Attempt, Settings, Store } from '../types'
import { flush, load, save, saveNow } from '../storage/storage'
import { newSession } from '../storage/schema'
import { setSoundEnabled } from '../audio/sounds'

interface StoreApi {
  store: Store
  sessionId: string
  appendAttempt(a: Attempt): void
  updateSettings(patch: Partial<Settings>): void
  replaceStore(next: Store): void
  resetAll(): void
}

const Ctx = createContext<StoreApi | null>(null)

export function StoreProvider({ children, initial }: { children: ReactNode; initial?: Store }) {
  const [store, setStore] = useState<Store>(() => {
    const s = initial ?? load()
    const session = newSession()
    return { ...s, sessions: [...s.sessions, session] }
  })
  const sessionId = useMemo(() => store.sessions[store.sessions.length - 1]?.id ?? 'none', [store.sessions])
  const first = useRef(true)

  useEffect(() => {
    setSoundEnabled(store.settings.soundOn)
    if (first.current) {
      first.current = false
      saveNow(store)
      return
    }
    save(store)
  }, [store])

  useEffect(() => {
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [])

  const appendAttempt = useCallback((a: Attempt) => {
    setStore((s) => ({ ...s, attempts: [...s.attempts, a] }))
  }, [])
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])
  const replaceStore = useCallback((next: Store) => {
    setStore((s) => {
      const keep = s.sessions[s.sessions.length - 1]
      const sessions = next.sessions.some((x) => x.id === keep.id) ? next.sessions : [...next.sessions, keep]
      return { ...next, sessions }
    })
  }, [])
  const resetAll = useCallback(() => {
    setStore((s) => ({ ...s, attempts: [], sessions: s.sessions.slice(-1) }))
  }, [])

  const api = useMemo<StoreApi>(
    () => ({ store, sessionId, appendAttempt, updateSettings, replaceStore, resetAll }),
    [store, sessionId, appendAttempt, updateSettings, replaceStore, resetAll],
  )
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStore(): StoreApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used inside StoreProvider')
  return v
}
