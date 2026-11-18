import { useEffect, useRef } from 'react'

/**
 * Space, Enter, the right arrow or Page Down runs the screen's main action, so the host can
 * drive the game from a clicker or keyboard without hunting for the button.
 * A presentation clicker sends Page Down or the right arrow. Those always work, even when a
 * button still has focus after a mouse click; Space and Enter are left to a focused button,
 * which activates itself.
 */
export function usePrimaryKey(action: (() => void) | null) {
  const latest = useRef(action)
  useEffect(() => {
    latest.current = action
  }, [action])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      const activates = e.key === ' ' || e.key === 'Enter'
      if (!activates && e.key !== 'ArrowRight' && e.key !== 'PageDown') return
      const target = e.target
      if (target instanceof Element) {
        if (target.closest('input, textarea, select, [contenteditable]')) return
        if (activates && target.closest('button, a')) return
      }
      if (!latest.current) return
      e.preventDefault()
      latest.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
