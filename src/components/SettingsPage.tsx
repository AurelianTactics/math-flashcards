import { useRef, useState } from 'react'
import { useStore } from '../hooks/useStore'
import { exportFilename, exportJson, importJson, type ImportMode } from '../storage/storage'
import { CARD_TYPES, type CardType } from '../types'

const TYPE_NAMES: Record<CardType, string> = {
  add: 'Addition only',
  sub: 'Subtraction only',
  compare: 'Comparing only',
  fraction: 'Shapes and fractions only',
  sequence: 'Counting patterns only',
  numberLine: 'Number line only',
  numberGrid: 'Hundred grid only',
  missing: 'Missing numbers only',
}

export function SettingsPage({ only, setOnly }: { only: CardType | null; setOnly: (t: CardType | null) => void }) {
  const { store, updateSettings, replaceStore, resetAll } = useStore()
  const [mode, setMode] = useState<ImportMode>('merge')
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const download = () => {
    const blob = new Blob([exportJson(store)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFilename()
    a.click()
    URL.revokeObjectURL(url)
    setMessage(`Saved ${exportFilename()} to your downloads.`)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      const next = importJson(text, store, mode)
      replaceStore(next)
      setMessage(`Loaded ${file.name}. ${next.attempts.length} cards in history now.`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not read that file.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const reset = () => {
    if (window.confirm('Erase all progress? Export first if you want a backup.')) {
      resetAll()
      setMessage('Progress erased.')
    }
  }

  return (
    <div className="settings">
      <section>
        <h2>Playing</h2>
        <label className="row">
          <input type="checkbox" checked={store.settings.soundOn} onChange={(e) => updateSettings({ soundOn: e.target.checked })} />
          Sounds on
        </label>
        <label className="row">
          Column boxes for 2-digit problems
          <select value={store.settings.columnMode} onChange={(e) => updateSettings({ columnMode: e.target.value as 'auto' | 'always2digit' })}>
            <option value="auto">Only when carrying or borrowing (plus a few without)</option>
            <option value="always2digit">Every 2-digit problem</option>
          </select>
        </label>
        <label className="row">
          Practice focus
          <select value={only ?? ''} onChange={(e) => setOnly((e.target.value || null) as CardType | null)}>
            <option value="">Everything, mixed (mostly adding and subtracting)</option>
            {CARD_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_NAMES[t]}</option>
            ))}
          </select>
        </label>
      </section>

      <section>
        <h2>Progress file</h2>
        <p className="muted">Progress is stored in this browser. Save a file to back it up or move it to another computer.</p>
        <div className="row">
          <button type="button" className="btn" onClick={download}>Save progress to a file</button>
        </div>
        <div className="row">
          <label className="radio"><input type="radio" name="mode" checked={mode === 'merge'} onChange={() => setMode('merge')} /> Add to what is here</label>
          <label className="radio"><input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} /> Replace what is here</label>
        </div>
        <div className="row">
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Load progress from a file</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        <div className="row">
          <button type="button" className="btn btn-danger" onClick={reset}>Erase all progress</button>
        </div>
        {message && <p className="notice" role="status">{message}</p>}
      </section>
    </div>
  )
}
