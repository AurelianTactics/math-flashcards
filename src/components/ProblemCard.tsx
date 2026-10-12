import type { Problem } from '../types'
import type { Boxes } from './boxes'
import { AddSubCard } from './cards/AddSubCard'
import { MissingCard } from './cards/MissingCard'
import { CompareCard } from './cards/CompareCard'
import { SequenceCard } from './cards/SequenceCard'
import { NumberLineCard } from './cards/NumberLineCard'
import { NumberGridCard } from './cards/NumberGridCard'
import { FractionCard } from './cards/FractionCard'

/** Dispatch to the card renderer for the problem type. */
export interface CardProps {
  problem: Problem
  boxes: Boxes
  onChoose?: (idx: number) => void
}

export function ProblemCard({ problem, boxes, onChoose }: CardProps) {
  switch (problem.data.type) {
    case 'add':
    case 'sub':
      return <AddSubCard problem={problem} boxes={boxes} />
    case 'missing':
      return <MissingCard problem={problem} boxes={boxes} />
    case 'compare':
      return <CompareCard problem={problem} boxes={boxes} onChoose={onChoose} />
    case 'sequence':
      return <SequenceCard problem={problem} boxes={boxes} />
    case 'numberLine':
      return <NumberLineCard problem={problem} boxes={boxes} onChoose={onChoose} />
    case 'numberGrid':
      return <NumberGridCard problem={problem} boxes={boxes} />
    case 'fraction':
      return <FractionCard problem={problem} boxes={boxes} onChoose={onChoose} />
    default:
      return <p>This card type is coming soon.</p>
  }
}
