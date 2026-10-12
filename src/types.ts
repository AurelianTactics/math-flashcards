// ---------------------------------------------------------------------------
// Core domain types for math-flashcards. Everything else imports from here.
// ---------------------------------------------------------------------------

export type CardType =
  | 'add'
  | 'sub'
  | 'compare'
  | 'fraction'
  | 'sequence'
  | 'numberLine'
  | 'numberGrid'
  | 'missing'

export const CARD_TYPES: CardType[] = [
  'add',
  'sub',
  'compare',
  'fraction',
  'sequence',
  'numberLine',
  'numberGrid',
  'missing',
]

export type Op = '+' | '-'

// ---- Steps ----------------------------------------------------------------
// Every problem is a list of 1..N steps. Simple problems have exactly one.

export type StepId =
  | 'answer'
  | 'ones'
  | 'carry'
  | 'tens'
  | 'hundreds'
  | 'borrow'
  | 'newTens'
  | 'choice'

export interface ChoiceOption {
  /** Keyboard key that selects this option (e.g. '1', '2', '<'). */
  key: string
  /** Text label shown on the button (optional when a picture is rendered). */
  label?: string
  /** Opaque payload the card renderer can use to draw a picture option. */
  value: string
}

export type Step =
  | {
      id: StepId
      kind: 'digits'
      expected: string
      maxLen: number
      /** Short hint shown next to the active box, e.g. "ones", "carry". */
      label: string
      /** Submit as soon as maxLen digits are typed. */
      autoSubmit: boolean
    }
  | {
      id: StepId
      kind: 'choice'
      /** Index into options. */
      expected: number
      options: ChoiceOption[]
      label: string
    }

// ---- Problem data (what the card renders) --------------------------------

export type Expr = number | { a: number; b: number; op: Op }

export type CompareSymbol = '<' | '>' | '=' | '!='

export type ProblemData =
  | { type: 'add'; a: number; b: number }
  | { type: 'sub'; a: number; b: number }
  | { type: 'compare'; left: Expr; right: Expr; answer: CompareSymbol }
  | {
      type: 'fraction'
      pieces: 2 | 3 | 4
      shape: 'circle' | 'rect'
      mode: 'pickCorrect' | 'countPieces'
      /** For pickCorrect: the candidate pictures; value encodes pieces + whether equal. */
      options?: { pieces: number; equal: boolean }[]
    }
  | { type: 'sequence'; items: (number | null)[]; step: number; dir: 'fwd' | 'back'; answer: number }
  | {
      type: 'numberLine'
      min: number
      max: number
      tick: number
      mode: 'read' | 'locate' | 'jump'
      from?: number
      jump?: number
      target: number
      /** For locate mode: candidate positions. */
      options?: number[]
    }
  | { type: 'numberGrid'; start: number; delta: 1 | -1 | 10 | -10; answer: number }
  | {
      type: 'missing'
      /** Exactly one of a, b, c is null. Equation is a op b = c. */
      a: number | null
      b: number | null
      c: number | null
      op: Op
      answer: number
    }

// ---- Explanations (rendered after a wrong answer) ------------------------

export type Explanation =
  | { kind: 'dots'; a: number; b: number; op: Op }
  | { kind: 'tenFrame'; a: number; b: number; op: Op }
  | { kind: 'columns'; a: number; b: number; op: Op }
  | {
      kind: 'compare'
      leftValue: number
      rightValue: number
      leftText: string
      rightText: string
      symbol: CompareSymbol
    }
  | { kind: 'fraction'; pieces: number; shape: 'circle' | 'rect' }
  | { kind: 'sequence'; items: number[]; step: number; dir: 'fwd' | 'back'; answerIndex: number }
  | { kind: 'numberLine'; min: number; max: number; tick: number; from?: number; to: number }
  | { kind: 'grid'; from: number; to: number; delta: number }
  | { kind: 'partWhole'; whole: number; parts: [number, number]; unknown: 'whole' | 'part' }

// ---- Problem --------------------------------------------------------------

export interface Problem {
  /** Unique per serve. */
  id: string
  /** Deterministic description, e.g. 'add:37+25'. Same signature => same problem. */
  signature: string
  type: CardType
  /** [0] is the primary bucket (scheduling key); the rest are tags. */
  buckets: BucketId[]
  data: ProblemData
  layout: 'inline' | 'columns'
  steps: Step[]
  explanation: Explanation
  /** Short prompt text shown above the card, e.g. "What is 10 more?" */
  prompt: string
}

// ---- Attempts (append-only log) ------------------------------------------

export interface StepResult {
  id: StepId
  tries: number
  firstTry: boolean
}

export interface Attempt {
  id: string
  ts: number
  sessionId: string
  sig: string
  type: CardType
  buckets: BucketId[]
  /** true iff EVERY step was right on the first try. */
  correct: boolean
  steps: StepResult[]
  firstWrongStep?: StepId
  /** Milliseconds from first render to final step. */
  ms: number
}

// ---- Skills ---------------------------------------------------------------

export type BucketId = string

export interface BucketDef {
  id: BucketId
  type: CardType
  /** 1-based tier within its card type; tier N+1 unlocks when tier N is improving/mastered. */
  tier: number
  label: string
}

export type Mastery = 'new' | 'learning' | 'improving' | 'mastered'

export interface BucketStat {
  id: BucketId
  n: number
  acc: number
  recentAcc: number
  trend: 'up' | 'flat' | 'down'
  mastery: Mastery
  avgMs: number
  unlocked: boolean
  /** Step most often missed first (column buckets), if any. */
  mostMissedStep?: StepId
}

// ---- Store ----------------------------------------------------------------

export interface Settings {
  soundOn: boolean
  columnMode: 'auto' | 'always2digit'
  typeWeights?: Partial<Record<CardType, number>>
}

export interface Session {
  id: string
  startedAt: number
}

export interface StoreV1 {
  version: 1
  createdAt: number
  settings: Settings
  attempts: Attempt[]
  sessions: Session[]
}

export type Store = StoreV1
