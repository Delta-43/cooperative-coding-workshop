import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

/** A QR code for `value`, drawn as SVG so it stays sharp on a projector. */
export function QrCode({ value, label }: { value: string; label: string }) {
  const [svg, setSvg] = useState<{ value: string; markup: string } | null>(null)

  useEffect(() => {
    let live = true
    QRCode.toString(value, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#030302', light: '#ffffff' },
    }).then((markup) => {
      if (live) setSvg({ value, markup })
    })
    return () => {
      live = false
    }
  }, [value])

  return (
    <div
      className="qr"
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={svg?.value === value ? { __html: svg.markup } : undefined}
    />
  )
}
