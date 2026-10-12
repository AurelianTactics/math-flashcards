import { useEffect, useState } from 'react'
import { StoreProvider } from './hooks/useStore'
import { SessionView } from './components/SessionView'
import { StatsPage } from './components/StatsPage'
import { SettingsPage } from './components/SettingsPage'
import { CARD_TYPES, type CardType } from './types'

type View = 'play' | 'stats' | 'settings'

function onlyFromUrl(): CardType | null {
  const v = new URLSearchParams(window.location.search).get('only')
  return v && CARD_TYPES.includes(v as CardType) ? (v as CardType) : null
}

export default function App() {
  const [view, setView] = useState<View>('play')
  const [only, setOnly] = useState<CardType | null>(onlyFromUrl)

  // Keep ?only= in the address bar so a focused practice link can be bookmarked.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (only) url.searchParams.set('only', only)
    else url.searchParams.delete('only')
    window.history.replaceState(null, '', url)
  }, [only])

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
          {view === 'stats' && <StatsPage />}
          {view === 'settings' && <SettingsPage only={only} setOnly={setOnly} />}
        </main>
      </div>
    </StoreProvider>
  )
}
