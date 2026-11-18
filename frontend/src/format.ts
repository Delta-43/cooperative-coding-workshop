const numbers = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })

export const formatNumber = (n: number) => numbers.format(n)

export function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`
}

const times = (n: number) => formatNumber(n >= 10 ? Math.round(n) : Math.round(n * 10) / 10)

/** How far a guess was, in words: "Spot on!", "Under 1% off", "12% off", "75× too high", "3× too low". */
export function howFar(error: number, value: number, correct: number): string {
  if (error === 0) return 'Spot on!'
  if (correct > 0 && value > 0) {
    // Far misses read better as a multiple than as a percentage near 100.
    if (value >= correct * 2) return `${times(value / correct)}× too high`
    if (value <= correct / 2) return `${times(correct / value)}× too low`
  } else if (error >= 1) {
    return 'Way off'
  }
  const pct = error * 100
  if (pct < 1) return 'Under 1% off'
  return `${pct < 10 ? pct.toFixed(1).replace(/\.0$/, '') : Math.round(pct)}% off`
}
