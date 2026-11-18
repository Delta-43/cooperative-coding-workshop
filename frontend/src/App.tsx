import { useEffect, useState } from 'react'
import { PlayerApp } from './player/PlayerApp'

// Hash routes, because GitHub Pages has no fallback for other paths.
// `#/host` is the big screen; the plain address is the join screen.
function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onChange = () => setHash(location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export function App() {
  const hash = useHash()
  if (hash.startsWith('#/host')) {
    return (
      <main className="screen">
        <h1 className="brand">
          Guess <em>Closer!</em>
        </h1>
        <p>The big screen arrives in F3.</p>
      </main>
    )
  }
  return <PlayerApp />
}
