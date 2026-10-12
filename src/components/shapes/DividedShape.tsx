/**
 * A circle or rectangle cut into `pieces` parts. `equal: false` draws visibly uneven
 * pieces (a wrong answer for "which is cut into equal pieces?").
 */
export function DividedShape({
  shape,
  pieces,
  equal = true,
  size = 120,
  numbered = false,
  highlight,
}: {
  shape: 'circle' | 'rect'
  pieces: number
  equal?: boolean
  size?: number
  numbered?: boolean
  /** Fill colors per piece (optional). */
  highlight?: string[]
}) {
  // Fractions of the whole for each piece.
  const fractions = equal
    ? Array.from({ length: pieces }, () => 1 / pieces)
    : unevenFractions(pieces)
  const fill = (i: number) => highlight?.[i] ?? 'var(--paper)'

  if (shape === 'rect') {
    const w = size * 1.3
    const h = size * 0.8
    const starts = cumulative(fractions.map((f) => f * w))
    return (
      <svg width={w + 4} height={h + 4} viewBox={`-2 -2 ${w + 4} ${h + 4}`} role="img" aria-label={`rectangle in ${pieces} ${equal ? 'equal' : 'unequal'} pieces`}>
        {fractions.map((f, i) => {
          const pw = f * w
          const x = starts[i]
          return (
            <g key={i}>
              <rect x={x} y={0} width={pw} height={h} fill={fill(i)} stroke="var(--ink)" strokeWidth={3} />
              {numbered && <text x={x + pw / 2} y={h / 2 + 8} textAnchor="middle" fontSize={22} fontWeight={600} fill="var(--ink)">{i + 1}</text>}
            </g>
          )
        })}
      </svg>
    )
  }

  const r = size / 2
  const c = r + 2
  const startAngles = cumulative(fractions.map((f) => f * Math.PI * 2)).map((a) => a - Math.PI / 2)
  const sectors = fractions.map((f, i) => {
    const start = startAngles[i]
    const end = start + f * Math.PI * 2
    const large = f > 0.5 ? 1 : 0
    const x1 = c + r * Math.cos(start)
    const y1 = c + r * Math.sin(start)
    const x2 = c + r * Math.cos(end)
    const y2 = c + r * Math.sin(end)
    const mid = (start + end) / 2
    const d = pieces === 1 ? '' : `M${c} ${c} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
    return { i, d, lx: c + r * 0.55 * Math.cos(mid), ly: c + r * 0.55 * Math.sin(mid) + 8 }
  })
  return (
    <svg width={size + 4} height={size + 4} viewBox={`0 0 ${size + 4} ${size + 4}`} role="img" aria-label={`circle in ${pieces} ${equal ? 'equal' : 'unequal'} pieces`}>
      <circle cx={c} cy={c} r={r} fill="var(--paper)" stroke="var(--ink)" strokeWidth={3} />
      {sectors.map((s) => (
        <g key={s.i}>
          {s.d && <path d={s.d} fill={fill(s.i)} stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" />}
          {numbered && <text x={s.lx} y={s.ly} textAnchor="middle" fontSize={22} fontWeight={600} fill="var(--ink)">{s.i + 1}</text>}
        </g>
      ))}
    </svg>
  )
}

/** Running offsets: [0, a0, a0+a1, ...] with the same length as the input. */
function cumulative(sizes: number[]): number[] {
  const out: number[] = []
  let acc = 0
  for (const v of sizes) {
    out.push(acc)
    acc += v
  }
  return out
}

function unevenFractions(n: number): number[] {
  // Deterministic, clearly uneven splits.
  const table: Record<number, number[]> = {
    2: [0.3, 0.7],
    3: [0.15, 0.25, 0.6],
    4: [0.1, 0.2, 0.3, 0.4],
  }
  return table[n] ?? Array.from({ length: n }, () => 1 / n)
}
