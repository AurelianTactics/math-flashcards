import { DividedShape } from '../shapes/DividedShape'
import { PIECE_NAMES } from '../../generators/fractions'

const COLORS = ['var(--blue)', 'var(--pink)', 'var(--marigold)', 'var(--teal)']

export function FractionExplanation({ pieces, shape }: { pieces: number; shape: 'circle' | 'rect' }) {
  const names = PIECE_NAMES[pieces as 2 | 3 | 4] ?? { one: 'piece', many: 'pieces' }
  return (
    <div className="explain">
      <DividedShape shape={shape} pieces={pieces} size={170} numbered highlight={COLORS.slice(0, pieces).map((c) => c.replace(')', ')'))} />
      <p className="explain-text">
        This shape has {pieces} equal pieces. Equal means every piece is the same size. Each piece is one {names.one}; together they are {names.many}.
      </p>
    </div>
  )
}
