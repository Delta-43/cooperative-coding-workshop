import { formatNumber } from './format'

/**
 * A number in the mono font with its group separators tightened. JetBrains Mono gives a comma
 * a full digit's width, so 27,572 reads as "27 , 572" at display sizes.
 */
export function Digits({ value }: { value: number }) {
  const parts = formatNumber(value).split(/([,.])/)
  return (
    <>
      {parts.map((part, i) =>
        part === ',' || part === '.' ? (
          <span key={i} className="digits-sep">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}
