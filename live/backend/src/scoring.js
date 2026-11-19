// Pure scoring rules. See contract/messages.md, "Scoring".
const POINTS = [3, 2, 1];

export function relativeError(value, correct) {
  return Math.abs(value - correct) / Math.abs(correct);
}

/** answers: [{ playerId, name, value|null, time|null }]. Returns results in rank order. */
export function scoreRound(answers, correct) {
  const answered = answers
    .filter((a) => typeof a.value === "number")
    .map((a) => ({ ...a, error: relativeError(a.value, correct) }))
    .sort((x, y) => x.error - y.error || x.time - y.time);
  const ranked = answered.map((a, i) => ({
    playerId: a.playerId, name: a.name, value: a.value, error: a.error, time: a.time,
    rank: i + 1, points: POINTS[i] ?? 0,
  }));
  const missing = answers
    .filter((a) => typeof a.value !== "number")
    .map((a) => ({ playerId: a.playerId, name: a.name, value: null, error: null, time: null, rank: null, points: 0 }));
  return [...ranked, ...missing];
}

/** More score first; equal score goes to the lower total time. */
export function finalOrder(players) {
  return [...players].sort((a, b) => b.score - a.score || a.time - b.time);
}
