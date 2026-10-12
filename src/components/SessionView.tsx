import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CardType, Problem, StepResult, Store } from '../types'
import { onlyTypeWeights } from '../scheduler/focus'
import { useStore } from '../hooks/useStore'
import { useKeyboard, type KeyEvent } from '../hooks/useKeyboard'
import { createRng } from '../rng'
import { pickNext } from '../scheduler/scheduler'
import { checkStep, finalizeAttempt } from '../steps/validate'
import { playCorrect, playTick, playWrong, unlockAudio } from '../audio/sounds'
import { boxViews } from './boxes'
import { stepHint } from './stepHints'
import { ProblemCard } from './ProblemCard'
import { Celebration } from './Celebration'
import { FeedbackPanel } from './FeedbackPanel'

type Phase = 'answering' | 'revealing' | 'correct' | 'wrong'

const REVEAL_MS = 900
const CORRECT_MS = 1400

export function SessionView({ only }: { only?: CardType | null }) {
  const { store, sessionId, appendAttempt } = useStore()
  const rng = useMemo(() => createRng(), [])
  const recentSigs = useRef<string[]>([])
  const startedAt = useRef(0)
  const storeRef = useRef(store)
  useEffect(() => {
    storeRef.current = store
  }, [store])

  const nextProblem = useCallback(
    (s: Store, recent: string[]): Problem => {
      const override = onlyTypeWeights(only)
      const settings = override ? { ...s.settings, typeWeights: override } : s.settings
      return pickNext({ attempts: s.attempts, settings, recentSigs: recent, rng })
    },
    [rng, only],
  )

  const [problem, setProblem] = useState<Problem>(() => nextProblem(store, []))
  // Remember what was served (to avoid repeats) and when it appeared (to time the answer).
  useEffect(() => {
    recentSigs.current = [...recentSigs.current, problem.signature].slice(-10)
    startedAt.current = performance.now()
  }, [problem])
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInputState] = useState('')
  // Mirror of `input` that updates synchronously, so fast key sequences (digit then Enter) see the latest value.
  const inputRef = useRef('')
  const setInput = useCallback((v: string | ((prev: string) => string)) => {
    inputRef.current = typeof v === 'function' ? v(inputRef.current) : v
    setInputState(inputRef.current)
  }, [])
  const [results, setResults] = useState<StepResult[]>([])
  const [phase, setPhase] = useState<Phase>('answering')
  const [burst, setBurst] = useState(0)
  const [streak, setStreak] = useState(0)
  const [shake, setShake] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advance = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setProblem(nextProblem(storeRef.current, recentSigs.current))
    setStepIndex(0)
    setInput('')
    setResults([])
    setPhase('answering')
  }, [nextProblem, setInput])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const finish = useCallback(
    (all: StepResult[]) => {
      const ms = performance.now() - startedAt.current
      const attempt = finalizeAttempt(problem, all, ms, sessionId)
      appendAttempt(attempt)
      if (attempt.correct) {
        setStreak((s) => s + 1)
        setBurst((b) => b + 1)
        setPhase('correct')
        playCorrect()
        timer.current = setTimeout(advance, CORRECT_MS)
      } else {
        setStreak(0)
        setPhase('wrong')
      }
    },
    [problem, sessionId, appendAttempt, advance],
  )

  const submit = useCallback(
    (value: string | number) => {
      const step = problem.steps[stepIndex]
      if (!step) return
      const ok = checkStep(step, value)
      const result: StepResult = { id: step.id, tries: 1, firstTry: ok, given: String(value) }
      const all = [...results, result]
      const last = stepIndex === problem.steps.length - 1
      const goOn = () => {
        setResults(all)
        setInput('')
        if (last) finish(all)
        else {
          setStepIndex(stepIndex + 1)
          setPhase('answering')
        }
      }
      if (ok) {
        goOn()
      } else {
        playWrong()
        setShake((s) => s + 1)
        setInput(String(value))
        setPhase('revealing')
        timer.current = setTimeout(goOn, REVEAL_MS)
      }
    },
    [problem, stepIndex, results, finish, setInput],
  )

  const onKey = useCallback(
    (e: KeyEvent) => {
      unlockAudio()
      if (phase === 'correct' || phase === 'wrong') {
        if (e.kind === 'enter') advance()
        return
      }
      if (phase !== 'answering') return
      const step = problem.steps[stepIndex]
      if (!step) return
      if (step.kind === 'digits') {
        const cur = inputRef.current
        if (e.kind === 'digit') {
          if (cur.length >= step.maxLen) return
          const next = cur + e.digit
          playTick()
          setInput(next)
          if (step.autoSubmit && next.length >= step.maxLen) submit(next)
        } else if (e.kind === 'backspace') {
          setInput((v) => v.slice(0, -1))
        } else if (e.kind === 'enter') {
          if (cur.length > 0) submit(cur)
        }
      } else if (step.kind === 'choice') {
        const key = e.kind === 'digit' ? e.digit : e.kind === 'char' ? e.char : null
        if (!key) return
        const idx = step.options.findIndex((o) => o.key === key || o.altKeys?.includes(key))
        if (idx >= 0) submit(idx)
      }
    },
    [phase, problem, stepIndex, submit, advance, setInput],
  )
  useKeyboard(onKey)

  const boxes = boxViews(problem, stepIndex, input, results, phase === 'revealing')
  const step = problem.steps[stepIndex]
  const op = problem.data.type === 'sub' ? '-' : '+'
  const hint =
    phase === 'answering' && step
      ? stepHint(step, op)
      : phase === 'revealing'
        ? step?.kind === 'choice'
          ? 'Not quite. The right one is marked.'
          : 'Not quite. This box should be:'
        : ''

  return (
    <div className="session">
      <div className="session-top">
        <span className="streak" aria-label="streak">
          {streak > 0 ? `${streak} in a row` : ''}
        </span>
      </div>
      <div className={`card${phase === 'wrong' ? ' card-wrong' : ''}`} key={problem.id}>
        {phase === 'wrong' ? (
          <FeedbackPanel problem={problem} onNext={advance} />
        ) : (
          <>
            {problem.prompt && <p className="prompt">{problem.prompt}</p>}
            <div className={`card-body${shake ? ' shake' : ''}`} key={shake}>
              <ProblemCard problem={problem} boxes={boxes} onChoose={(idx) => phase === 'answering' && submit(idx)} />
            </div>
            <p className="hint">{hint}</p>
          </>
        )}
      </div>
      <Celebration burst={burst} />
    </div>
  )
}
