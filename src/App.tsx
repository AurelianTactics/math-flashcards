import { useState } from 'react'
import { StoreProvider } from './hooks/useStore'
import { SessionView } from './components/SessionView'
import type { CardType } from './types'

type View = 'play' | 'stats' | 'settings'

export default function App() {
  const [view, setView] = useState<View>('play')
  const only = (new URLSearchParams(window.location.search).get('only') as CardType | null) ?? null
  return (
    <StoreProvider>
      <div className="app">
        <nav className="nav" aria-label="main">
          <span className="brand">Math cards</span>
          <div className="tabs">
            {(['play', 'stats', 'settings'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                className={'tab' + (view === v ? ' tab-on' : '')}
                aria-current={view === v ? 'page' : undefined}
                onClick={() => setView(v)}
              >
                {v === 'play' ? 'Play' : v === 'stats' ? 'Progress' : 'Settings'}
              </button>
            ))}
          </div>
        </nav>
        <main className="main">
          {view === 'play' && <SessionView only={only} />}
          {view === 'stats' && <p className="soon">Progress page is coming next.</p>}
          {view === 'settings' && <p className="soon">Settings are coming next.</p>}
        </main>
      </div>
    </StoreProvider>
  )
}
