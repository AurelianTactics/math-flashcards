import type { Explanation as ExplanationT } from '../../types'
import { DotsExplanation } from './DotsExplanation'
import { TenFrameExplanation } from './TenFrameExplanation'
import { ColumnsExplanation } from './ColumnsExplanation'

export function Explanation({ explanation }: { explanation: ExplanationT }) {
  switch (explanation.kind) {
    case 'dots':
      return <DotsExplanation a={explanation.a} b={explanation.b} op={explanation.op} />
    case 'tenFrame':
      return <TenFrameExplanation a={explanation.a} b={explanation.b} op={explanation.op} />
    case 'columns':
      return <ColumnsExplanation a={explanation.a} b={explanation.b} op={explanation.op} />
    default:
      return null
  }
}
