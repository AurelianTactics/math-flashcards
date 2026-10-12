import type { Explanation as ExplanationT } from '../../types'
import { DotsExplanation } from './DotsExplanation'
import { TenFrameExplanation } from './TenFrameExplanation'
import { ColumnsExplanation } from './ColumnsExplanation'
import { CompareExplanation } from './CompareExplanation'
import { FractionExplanation } from './FractionExplanation'
import { SequenceExplanation } from './SequenceExplanation'
import { NumberLineExplanation } from './NumberLineExplanation'
import { GridExplanation } from './GridExplanation'
import { PartWholeExplanation } from './PartWholeExplanation'

export function Explanation({ explanation }: { explanation: ExplanationT }) {
  switch (explanation.kind) {
    case 'dots':
      return <DotsExplanation a={explanation.a} b={explanation.b} op={explanation.op} />
    case 'tenFrame':
      return <TenFrameExplanation a={explanation.a} b={explanation.b} op={explanation.op} />
    case 'columns':
      return <ColumnsExplanation a={explanation.a} b={explanation.b} op={explanation.op} />
    case 'compare':
      return <CompareExplanation {...explanation} />
    case 'fraction':
      return <FractionExplanation pieces={explanation.pieces} shape={explanation.shape} />
    case 'sequence':
      return <SequenceExplanation {...explanation} />
    case 'numberLine':
      return <NumberLineExplanation {...explanation} />
    case 'grid':
      return <GridExplanation {...explanation} />
    case 'partWhole':
      return <PartWholeExplanation {...explanation} />
  }
}
