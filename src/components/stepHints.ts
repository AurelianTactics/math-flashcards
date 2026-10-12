import type { Op, Step } from '../types'

/** Plain-language instruction for the active step. */
export function stepHint(step: Step, op: Op): string {
  switch (step.id) {
    case 'ones':
      return op === '+' ? 'Add the ones.' : 'Subtract the ones.'
    case 'carry':
      return 'What do you carry? Type 0 if nothing.'
    case 'tens':
      return op === '+' ? 'Add the tens (and the carry).' : 'Subtract the tens.'
    case 'hundreds':
      return 'Write the hundreds.'
    case 'borrow':
      return 'Do we need to borrow a ten? Type 1 for yes, 0 for no.'
    case 'newTens':
      return 'After borrowing, what does the tens digit become?'
    case 'choice':
      return step.label
    default:
      return 'Type the answer, then press Enter.'
  }
}
