/** Part-part-whole bar: the whole on top, the two parts underneath. */
export function PartWholeExplanation({ whole, parts, unknown }: { whole: number; parts: [number, number]; unknown: 'whole' | 'part' }) {
  const [p1, p2] = parts
  const w1 = Math.max(12, (p1 / whole) * 100)
  return (
    <div className="explain">
      <div className="partwhole">
        <div className={'pw-whole' + (unknown === 'whole' ? ' pw-unknown' : '')}>{whole}</div>
        <div className="pw-parts">
          <div className="pw-part" style={{ width: `${w1}%`, background: 'var(--blue)' }}>{p1}</div>
          <div className={'pw-part' + (unknown === 'part' ? ' pw-unknown' : '')} style={{ flex: 1, background: 'var(--pink)' }}>{p2}</div>
        </div>
      </div>
      <p className="explain-text">
        {unknown === 'whole'
          ? `${p1} and ${p2} are the two parts. Put them together: ${p1} + ${p2} = ${whole}.`
          : `${whole} is the whole. One part is ${p1}. The other part is what is left: ${whole} − ${p1} = ${p2}.`}
      </p>
    </div>
  )
}
