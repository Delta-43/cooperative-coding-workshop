import { useEffect, useState, type ReactNode } from 'react'

// The host screen is designed as a 960 x 540 frame and scaled to fit the projector.
function useFit() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 960, window.innerHeight / 540))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return scale
}

export function Key({ k, children }: { k: string; children: ReactNode }) {
  return (
    <span className="key">
      <kbd>{k}</kbd>
      {children}
    </span>
  )
}

interface StageProps {
  room?: string
  step: string
  count?: string
  help: string
  space: string
  children: ReactNode
}

export function Stage({ room, step, count, help, space, children }: StageProps) {
  const scale = useFit()
  return (
    <div className="stage-wrap">
      <div className="stage" style={{ transform: `scale(${scale})` }}>
        <div className="bracket tl" />
        <div className="bracket tr" />
        <div className="bracket bl" />
        <div className="bracket br" />
        <div className="meta top">
          <span>{room ? `ROOM ${room}` : 'GUESS CLOSER!'}</span>
          <span className="stamp">{step}</span>
          <span>{count ?? ''}</span>
        </div>
        {children}
        <div className="meta bottom">
          <span>{help}</span>
          <span className="keys">
            <Key k="Space">{space}</Key>
            <Key k="Backspace">back</Key>
            <Key k="Esc">players</Key>
          </span>
        </div>
      </div>
    </div>
  )
}
