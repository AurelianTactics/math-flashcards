import type { Problem } from '../types'
import type { Boxes } from './boxes'
import { AddSubCard } from './cards/AddSubCard'

/** Dispatch to the card renderer for the problem type. */
export function ProblemCard({ problem, boxes }: { problem: Problem; boxes: Boxes }) {
  switch (problem.data.type) {
    case 'add':
    case 'sub':
      return <AddSubCard problem={problem} boxes={boxes} />
    default:
      return <p>This card type is coming soon.</p>
  }
}
