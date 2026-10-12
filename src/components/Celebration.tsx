import { useMemo } from 'react'

const COLORS = ['var(--marigold)', 'var(--teal)', 'var(--pink)', 'var(--blue)', 'var(--ink)']

/** One burst of confetti. Re-mount (change `burst`) to fire again. */
export function Celebration({ burst }: { burst: number }) {
  const pieces = useMemo(() => {
    if (burst === 0) return []
    let seed = burst * 9301 + 49297
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: 50 + (rnd() - 0.5) * 90,
      dx: (rnd() - 0.5) * 60,
      delay: rnd() * 0.15,
      rot: rnd() * 720 - 360,
      color: COLORS[i % COLORS.length],
      size: 8 + rnd() * 10,
      shape: rnd() > 0.5 ? 'circle' : 'square',
    }))
  }, [burst])
  if (pieces.length === 0) return null
  return (
    <div className="celebration" aria-hidden="true" key={burst}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`confetti confetti-${p.shape}`}
          style={{
            left: `${p.x}%`,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            ['--dx' as string]: `${p.dx}vw`,
            ['--rot' as string]: `${p.rot}deg`,
          }}
        />
      ))}
      <div className="cheer">{['Yes!', 'Nice!', 'You got it!', 'Super!', 'Great job!'][burst % 5]}</div>
    </div>
  )
}
