import { useMemo } from 'react'
import { useStore } from '../hooks/useStore'
import { bucketStats, learningPlan, summarizeSession, type SessionSummary } from '../skills/stats'
import { bucketLabel, bucketsForType } from '../skills/buckets'
import { CARD_TYPES, type BucketStat, type CardType, type StepId } from '../types'
import { problemFromSignature } from '../generators'
import { problemText } from '../problemText'
import { createRng } from '../rng'

const TYPE_NAMES: Record<CardType, string> = {
  add: 'Addition',
  sub: 'Subtraction',
  compare: 'Comparing',
  fraction: 'Shapes and fractions',
  sequence: 'Counting patterns',
  numberLine: 'Number line',
  numberGrid: 'Hundred grid',
  missing: 'Missing numbers',
}
const MASTERY_TEXT = { new: 'Just started', learning: 'Needs work', improving: 'Getting there', mastered: 'Great at this' }
const STEP_TEXT: Partial<Record<StepId, string>> = {
  ones: 'the ones column',
  carry: 'the carry box',
  tens: 'the tens column',
  borrow: 'deciding whether to borrow',
  newTens: 'the new tens digit after borrowing',
}
const pct = (x: number) => `${Math.round(x * 100)}%`
const missRng = createRng(1)
const missText = (sig: string) => {
  const p = problemFromSignature(sig, missRng, { soundOn: false, columnMode: 'auto' })
  return p ? problemText(p) : sig
}

function SessionCard({ title, s }: { title: string; s: SessionSummary | null }) {
  return (
    <div className="stat-tile">
      <span className="stat-title">{title}</span>
      {s && s.count > 0 ? (
        <>
          <span className="stat-big">{pct(s.accuracy)}</span>
          <span className="stat-sub">{s.correct} of {s.count} right. Best streak {s.bestStreak}.</span>
        </>
      ) : (
        <span className="stat-sub">No cards yet.</span>
      )}
    </div>
  )
}

function BucketRow({ s }: { s: BucketStat }) {
  const cls = 'bucket-row' + (s.unlocked ? '' : ' bucket-locked')
  const trend = s.trend === 'up' ? '▲ improving' : s.trend === 'down' ? '▼ slipping' : ''
  return (
    <li className={cls}>
      <div className="bucket-head">
        <span className="bucket-label">{bucketLabel(s.id)}</span>
        <span className={`chip chip-${s.unlocked ? s.mastery : 'locked'}`}>{s.unlocked ? MASTERY_TEXT[s.mastery] : 'Not yet unlocked'}</span>
      </div>
      {s.unlocked && s.n > 0 && (
        <div className="bucket-bar-row">
          <span className="bucket-bar" role="img" aria-label={`${pct(s.recentAcc)} right recently`}>
            <span className="bucket-bar-fill" style={{ width: pct(s.recentAcc) }} />
          </span>
          <span className="bucket-nums">
            {pct(s.recentAcc)} right lately · {s.n} tried{trend ? ` · ${trend}` : ''}
          </span>
        </div>
      )}
      {s.unlocked && s.mostMissedStep && STEP_TEXT[s.mostMissedStep] && s.acc < 0.9 && (
        <p className="bucket-note">Most slips happen on {STEP_TEXT[s.mostMissedStep]}.</p>
      )}
    </li>
  )
}

export function StatsPage() {
  const { store, sessionId } = useStore()
  const stats = useMemo(() => bucketStats(store.attempts), [store.attempts])
  const plan = useMemo(() => learningPlan(stats), [stats])
  const sessions = store.sessions
  const current = sessions.find((s) => s.id === sessionId) ?? null
  const previous = [...sessions].reverse().find((s) => s.id !== sessionId && store.attempts.some((a) => a.sessionId === s.id)) ?? null
  const today = current ? summarizeSession(store.attempts, current.id, current.startedAt) : null
  const last = previous ? summarizeSession(store.attempts, previous.id, previous.startedAt) : null
  const recentMisses = store.attempts.filter((a) => !a.correct).slice(-8).reverse()

  const list = (ids: string[]) => (ids.length ? ids.map(bucketLabel).join(', ') : null)

  return (
    <div className="stats">
      <section className="stat-row">
        <SessionCard title="Today" s={today} />
        <SessionCard title="Last time" s={last} />
        <div className="stat-tile">
          <span className="stat-title">All time</span>
          <span className="stat-big">{store.attempts.length}</span>
          <span className="stat-sub">cards answered</span>
        </div>
      </section>

      <section className="plan">
        <h2>Learning plan</h2>
        <p><strong>Great at:</strong> {list(plan.greatAt) ?? 'nothing locked in yet. Keep playing!'}</p>
        <p><strong>Working on:</strong> {list(plan.workingOn) ?? 'the first cards of each kind.'}</p>
        <p><strong>Next up:</strong> {list(plan.nextUp) ?? 'new skills unlock as the current ones improve.'}</p>
      </section>

      {CARD_TYPES.map((type) => (
        <section className="type-section" key={type}>
          <h2>{TYPE_NAMES[type]}</h2>
          <ul className="bucket-list">
            {bucketsForType(type).map((b) => (
              <BucketRow key={b.id} s={stats[b.id]} />
            ))}
          </ul>
        </section>
      ))}

      {recentMisses.length > 0 && (
        <section className="type-section">
          <h2>Recent misses</h2>
          <ul className="miss-list">
            {recentMisses.map((a) => (
              <li key={a.id}>
                <code>{missText(a.sig)}</code>
                <span className="miss-meta"> {bucketLabel(a.buckets[0])}{a.firstWrongStep && STEP_TEXT[a.firstWrongStep] ? `, slipped on ${STEP_TEXT[a.firstWrongStep]}` : ''}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
