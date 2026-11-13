// Placeholder duck: flat fills, white ink lines. The real duck art comes with the workshop theme.
export function Duck() {
  return (
    <svg className="duck" viewBox="0 0 160 120" aria-hidden="true">
      <ellipse className="ln" cx="78" cy="78" rx="54" ry="30" fill="oklch(0.56 0.025 245)"/>
      <path className="ln" d="M30 70 Q18 52 8 56 Q14 76 30 86Z" fill="oklch(0.42 0.03 245)"/>
      <ellipse cx="82" cy="76" rx="26" ry="12" fill="oklch(0.42 0.03 245)" opacity=".7"/>
      <rect x="62" y="70" width="22" height="5" rx="1" fill="var(--c-red)"/>
      <circle className="ln" cx="124" cy="50" r="24" fill="var(--c-orange)"/>
      <path d="M110 40 Q128 30 146 44 Q140 60 124 58 Q112 54 110 40Z" fill="var(--c-teal)"/>
      <circle cx="130" cy="46" r="3" fill="var(--md-bg)"/>
      <path className="ln" d="M140 54 L162 56 Q160 64 142 64Z" fill="var(--md-soft)"/>
      <path d="M70 108 L62 118 M70 108 L74 118 M96 108 L88 118 M96 108 L100 118" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
