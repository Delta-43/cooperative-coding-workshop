import { useState, type FormEvent } from 'react'
import { CODE_PATTERN, MAX_NAME } from '../contract'
import { Duck } from '../ducks'
import { Pond } from '../Pond'

export interface JoinRequest {
  code: string
  name: string
}

// The host's QR code may carry the room as ?room=ABCD, so the code is filled in.
function codeFromAddress(): string {
  const room = new URLSearchParams(location.search).get('room') ?? ''
  return room.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)
}

export function JoinScreen({
  problem,
  initial,
  onJoin,
}: {
  problem: string | null
  initial: JoinRequest | null
  onJoin: (request: JoinRequest) => void
}) {
  const [code, setCode] = useState(() => initial?.code ?? codeFromAddress())
  const [name, setName] = useState(initial?.name ?? '')
  const [touched, setTouched] = useState(false)

  const trimmed = name.trim()
  const codeOk = CODE_PATTERN.test(code)
  const nameOk = trimmed.length > 0 && trimmed.length <= MAX_NAME

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (codeOk && nameOk) onJoin({ code, name: trimmed })
  }

  return (
    <main className="screen">
      <h1 className="brand">
        Guess <em>Closer!</em>
      </h1>
      <form className="card card-in" onSubmit={submit} noValidate>
        <Duck pose="swimming" />
        {problem && (
          <p className="alert" role="alert">
            {problem}
          </p>
        )}
        <label className="field">
          <span className="field-label">Room code</span>
          <input
            className="input input-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            placeholder="ABCD"
            aria-invalid={touched && !codeOk}
          />
          {touched && !codeOk && <span className="hint">The code is four letters, on the big screen.</span>}
        </label>
        <label className="field">
          <span className="field-label">Your nickname</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, MAX_NAME + 4))}
            autoComplete="nickname"
            enterKeyHint="go"
            placeholder="Ada"
            aria-invalid={touched && !nameOk}
          />
          <span className="hint">
            <span>{touched && !nameOk ? 'Pick a name of 1 to 16 characters.' : 'Everyone will see this.'}</span>
            <span>
              {trimmed.length}/{MAX_NAME}
            </span>
          </span>
        </label>
        <button className="button" type="submit">
          Jump in
        </button>
      </form>
      <Pond />
    </main>
  )
}
