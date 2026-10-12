/** The 1–100 grid, ten per row. Cells can be colored; an arrow can show a move. */
export function HundredGrid({
  highlight = {},
  arrow,
  cell = 40,
}: {
  highlight?: Record<number, string>
  arrow?: { from: number; to: number }
  cell?: number
}) {
  const size = cell * 10
  const pos = (n: number) => ({ x: ((n - 1) % 10) * cell + cell / 2, y: Math.floor((n - 1) / 10) * cell + cell / 2 })
  return (
    <svg width={size + 2} height={size + 2} viewBox={`-1 -1 ${size + 2} ${size + 2}`} role="img" aria-label="hundred grid" className="hundred-grid">
      {Array.from({ length: 100 }, (_, i) => {
        const n = i + 1
        const { x, y } = pos(n)
        const fill = highlight[n]
        return (
          <g key={n}>
            <rect x={x - cell / 2} y={y - cell / 2} width={cell} height={cell} fill={fill ?? 'var(--paper)'} stroke="var(--grid)" strokeWidth={1.5} />
            <text x={x} y={y + cell * 0.18} textAnchor="middle" fontSize={cell * 0.42} fontWeight={fill ? 700 : 500} fill="var(--ink)">{n}</text>
          </g>
        )
      })}
      {arrow && (
        <>
          <defs>
            <marker id="gridArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L6 3 L0 6 Z" fill="var(--blue)" />
            </marker>
          </defs>
          {(() => {
            // Draw from the edge of the start cell to the edge of the target cell so numbers stay readable.
            const a = pos(arrow.from)
            const b = pos(arrow.to)
            const dx = Math.sign(b.x - a.x) * cell * 0.42
            const dy = Math.sign(b.y - a.y) * cell * 0.42
            return <line x1={a.x + dx} y1={a.y + dy} x2={b.x - dx * 1.3} y2={b.y - dy * 1.3} stroke="var(--blue)" strokeWidth={3} strokeLinecap="round" markerEnd="url(#gridArrow)" />
          })()}
        </>
      )}
    </svg>
  )
}
