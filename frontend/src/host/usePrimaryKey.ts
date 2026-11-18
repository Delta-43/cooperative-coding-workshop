import { useEffect, useRef } from 'react'

/**
 * Space, Enter or the right arrow runs the screen's main action, so the host can drive
 * the game from a clicker or keyboard without hunting for the button.
 */
export function usePrimaryKey(action: (() => void) | null) {
  const latest = useRef(action)
  useEffect(() => {
    latest.current = action
  }, [action])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'ArrowRight' && e.key !== 'PageDown') return
      const target = e.target
      if (target instanceof Element && target.closest('input, textarea, button, a, [contenteditable]')) return
      if (!latest.current) return
      e.preventDefault()
      latest.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
