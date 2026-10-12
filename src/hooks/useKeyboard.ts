import { useEffect, useRef } from 'react'

export type KeyEvent =
  | { kind: 'digit'; digit: string }
  | { kind: 'backspace' }
  | { kind: 'enter' }
  | { kind: 'char'; char: string }

/**
 * Global keydown listener that turns keys into simple events.
 * Ignores keys while focus is in an input/textarea/select (settings page).
 */
export function useKeyboard(handler: (e: KeyEvent) => void, active = true) {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    if (!active) return
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement | null
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return
      if (/^[0-9]$/.test(ev.key)) {
        ev.preventDefault()
        ref.current({ kind: 'digit', digit: ev.key })
      } else if (ev.key === 'Backspace') {
        ev.preventDefault()
        ref.current({ kind: 'backspace' })
      } else if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault()
        ref.current({ kind: 'enter' })
      } else if (ev.key.length === 1) {
        ref.current({ kind: 'char', char: ev.key })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
}
