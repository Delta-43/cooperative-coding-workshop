import { formatNumber } from './format'

/**
 * A number in the mono font with its thousands commas tightened. JetBrains Mono gives a comma
 * a full digit's width, so 27,572 reads as "27 , 572" at display sizes. The decimal point keeps
 * its width: tightened, 243.02 reads as 24302.
 */
export function Digits({ value }: { value: number }) {
  const parts = formatNumber(value).split(/(,)/)
  return (
    <>
      {parts.map((part, i) =>
        part === ',' ? (
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
