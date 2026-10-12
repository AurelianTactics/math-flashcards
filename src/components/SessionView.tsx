import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Problem, StepResult } from '../types'
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

export function SessionView() {
  const { store, sessionId, appendAttempt } = useStore()
  const rng = useMemo(() => createRng(), [])
  const recentSigs = useRef<string[]>([])
  const startedAt = useRef(0)
  const storeRef = useRef(store)
  storeRef.current = store

  const nextProblem = useCallback((): Problem => {
    const s = storeRef.current
    const p = pickNext({ attempts: s.attempts, settings: s.settings, recentSigs: recentSigs.current, rng })
    recentSigs.current = [...recentSigs.current, p.signature].slice(-10)
    startedAt.current = performance.now()
    return p
  }, [rng])

  const [problem, setProblem] = useState<Problem>(nextProblem)
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [results, setResults] = useState<StepResult[]>([])
  const [phase, setPhase] = useState<Phase>('answering')
  const [burst, setBurst] = useState(0)
  const [streak, setStreak] = useState(0)
  const [shake, setShake] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advance = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setProblem(nextProblem())
    setStepIndex(0)
    setInput('')
    setResults([])
    setPhase('answering')
  }, [nextProblem])

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
      const result: StepResult = { id: step.id, tries: 1, firstTry: ok }
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
        setPhase('revealing')
        timer.current = setTimeout(goOn, REVEAL_MS)
      }
    },
    [problem, stepIndex, results, finish],
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
        if (e.kind === 'digit') {
          if (input.length >= step.maxLen) return
          const next = input + e.digit
          playTick()
          setInput(next)
          if (step.autoSubmit && next.length >= step.maxLen) submit(next)
        } else if (e.kind === 'backspace') {
          setInput((v) => v.slice(0, -1))
        } else if (e.kind === 'enter') {
          if (input.length > 0) submit(input)
        }
      } else if (step.kind === 'choice') {
        const key = e.kind === 'digit' ? e.digit : e.kind === 'char' ? e.char : null
        if (!key) return
        const idx = step.options.findIndex((o) => o.key === key)
        if (idx >= 0) submit(idx)
      }
    },
    [phase, problem, stepIndex, input, submit, advance],
  )
  useKeyboard(onKey)

  const boxes = boxViews(problem, stepIndex, input, results, phase === 'revealing')
  const step = problem.steps[stepIndex]
  const op = problem.data.type === 'sub' ? '-' : '+'
  const hint = phase === 'answering' && step ? stepHint(step, op) : phase === 'revealing' ? 'Not quite. This box should be:' : ''

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
              <ProblemCard problem={problem} boxes={boxes} />
            </div>
            <p className="hint">{hint}</p>
          </>
        )}
      </div>
      <Celebration burst={burst} />
    </div>
  )
}
