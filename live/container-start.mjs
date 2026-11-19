// Starts the game server inside the container.
// QUESTIONS (a JSON array) or QUESTIONS_FILE (a path to one) replaces the sample questions.
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const args = ['wrangler', 'dev', '--config', 'wrangler.container.jsonc', '--ip', '0.0.0.0',
  '--port', process.env.PORT || '8787', '--persist-to', '/data']

let questions = process.env.QUESTIONS
if (!questions && process.env.QUESTIONS_FILE) questions = readFileSync(process.env.QUESTIONS_FILE, 'utf8')
if (questions) {
  JSON.parse(questions) // fail early, with a clear message, if the file is not JSON
  args.push('--var', `QUESTIONS:${JSON.stringify(JSON.parse(questions))}`)
}

const child = spawn('npx', args, { stdio: 'inherit', cwd: '/app/backend' })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
child.on('exit', (code) => process.exit(code ?? 1))
