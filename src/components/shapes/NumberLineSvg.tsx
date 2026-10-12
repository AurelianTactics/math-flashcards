export interface LineMarker {
  at: number
  color?: string
  label?: string
  /** Arrow pointing down at the tick (default) or a dot on the line. */
  kind?: 'arrow' | 'dot'
}

export interface LineJump {
  from: number
  to: number
  color?: string
}

/** A horizontal number line with labeled ticks, optional markers and hop arcs. */
export function NumberLineSvg({
  min,
  max,
  labelEvery = 1,
  markers = [],
  jumps = [],
  width = 640,
}: {
  min: number
  max: number
  labelEvery?: number
  markers?: LineMarker[]
  jumps?: LineJump[]
  width?: number
}) {
  const pad = 30
  const y = 70
  const span = max - min
  const x = (v: number) => pad + ((v - min) / span) * (width - pad * 2)
  const ticks = Array.from({ length: span + 1 }, (_, i) => min + i)
  return (
    <svg width={width} height={120} viewBox={`0 0 ${width} 120`} role="img" aria-label={`number line from ${min} to ${max}`}>
      <line x1={pad - 10} y1={y} x2={width - pad + 10} y2={y} stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={y - (t % labelEvery === 0 ? 12 : 7)} x2={x(t)} y2={y + (t % labelEvery === 0 ? 12 : 7)} stroke="var(--ink)" strokeWidth={2.5} />
          {t % labelEvery === 0 && (
            <text x={x(t)} y={y + 34} textAnchor="middle" fontSize={18} fontWeight={600} fill="var(--ink)">{t}</text>
          )}
        </g>
      ))}
      {jumps.map((j, i) => {
        const x1 = x(j.from)
        const x2 = x(j.to)
        const h = 28 + Math.min(18, Math.abs(x2 - x1) / 6)
        return (
          <path key={i} d={`M${x1} ${y - 14} Q${(x1 + x2) / 2} ${y - 14 - h} ${x2} ${y - 14}`} fill="none" stroke={j.color ?? 'var(--blue)'} strokeWidth={3} markerEnd="url(#arrowhead)" />
        )
      })}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill="var(--blue)" />
        </marker>
      </defs>
      {markers.map((m, i) =>
        m.kind === 'dot' ? (
          <g key={i}>
            <circle cx={x(m.at)} cy={y} r={9} fill={m.color ?? 'var(--marigold)'} stroke="var(--ink)" strokeWidth={2} />
            {m.label && <text x={x(m.at)} y={y - 22} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--ink)">{m.label}</text>}
          </g>
        ) : (
          <g key={i}>
            <path d={`M${x(m.at)} ${y - 18} l-9 -14 h18 z`} fill={m.color ?? 'var(--marigold)'} stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />
            {m.label && <text x={x(m.at)} y={y - 40} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--ink)">{m.label}</text>}
          </g>
        ),
      )}
    </svg>
  )
}
