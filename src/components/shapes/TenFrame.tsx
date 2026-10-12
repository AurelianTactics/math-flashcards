/** A 2x5 ten frame. `cells` lists a CSS color per filled cell (max 10); null = empty. */
export function TenFrame({ cells, crossed = [], size = 34 }: { cells: (string | null)[]; crossed?: number[]; size?: number }) {
  const cols = 5
  const rows = 2
  const w = cols * size
  const h = rows * size
  return (
    <svg width={w + 2} height={h + 2} viewBox={`-1 -1 ${w + 2} ${h + 2}`} role="img" aria-label="ten frame">
      {Array.from({ length: 10 }, (_, i) => {
        const x = (i % cols) * size
        const y = Math.floor(i / cols) * size
        const fill = cells[i] ?? null
        const isCrossed = crossed.includes(i)
        return (
          <g key={i}>
            <rect x={x} y={y} width={size} height={size} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.5} />
            {fill && <circle cx={x + size / 2} cy={y + size / 2} r={size * 0.32} fill={fill} opacity={isCrossed ? 0.35 : 1} />}
            {isCrossed && (
              <path d={`M${x + size * 0.25} ${y + size * 0.25} L${x + size * 0.75} ${y + size * 0.75} M${x + size * 0.75} ${y + size * 0.25} L${x + size * 0.25} ${y + size * 0.75}`} stroke="var(--wrong)" strokeWidth={3} strokeLinecap="round" />
            )}
          </g>
        )
      })}
    </svg>
  )
}
