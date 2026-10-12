/** Tens rods and ones cubes for a number up to 99. */
export function BaseTenBlocks({ n, color, unit = 14 }: { n: number; color: string; unit?: number }) {
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const gap = 6
  const rodW = unit
  const rodH = unit * 10
  const width = tens * (rodW + gap) + (ones > 0 ? unit * 2 + gap : 0) + 2
  const height = rodH + 2
  return (
    <svg width={width} height={height} viewBox={`-1 -1 ${width} ${height}`} role="img" aria-label={`${tens} tens and ${ones} ones`}>
      {Array.from({ length: tens }, (_, t) => (
        <g key={`t${t}`} transform={`translate(${t * (rodW + gap)},0)`}>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={0} y={i * unit} width={unit} height={unit} fill={color} stroke="var(--paper)" strokeWidth={1.2} />
          ))}
        </g>
      ))}
      {Array.from({ length: ones }, (_, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        return (
          <rect
            key={`o${i}`}
            x={tens * (rodW + gap) + col * unit}
            y={rodH - (row + 1) * unit}
            width={unit}
            height={unit}
            fill={color}
            stroke="var(--paper)"
            strokeWidth={1.2}
          />
        )
      })}
    </svg>
  )
}
