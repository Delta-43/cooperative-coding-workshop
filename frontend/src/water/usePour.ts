import { useEffect, useState } from 'react'

export type PourStage = 'pouring' | 'settling' | 'calm'

/** The results pour: 5 s of rough, bubbly filling, 3 s of jitter, then calm water that stays. */
export function usePour() {
  const [stage, setStage] = useState<PourStage>('pouring')

  useEffect(() => {
    const a = setTimeout(() => setStage('settling'), 5000)
    const b = setTimeout(() => setStage('calm'), 8000)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [])

  return {
    stage,
    agitation: stage === 'pouring' ? 2.6 : stage === 'settling' ? 1.5 : 0.8,
    bubbles: stage === 'pouring',
    stream: stage === 'pouring',
    fillSeconds: 5,
  }
}
