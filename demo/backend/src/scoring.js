// Scoring rule from contract/messages.md: relative error. Equal error goes to the earlier answer.
const POINTS_BY_RANK = { 1: 3, 2: 2, 3: 1 };

export function relativeError(value, correct) {
  return Math.abs(value - correct) / Math.abs(correct);
}

// answers: [{ playerId, name, value, time }] where value is a number or null,
// and time is milliseconds from the question opening to the player's last answer.
// Returns results in rank order. Every answered player gets their own rank. Players with no answer come last.
export function scoreRound(answers, correct) {
  const answered = answers
    .filter((a) => typeof a.value === "number")
    .map((a) => ({ ...a, error: relativeError(a.value, correct), time: a.time ?? null }))
    .sort((a, b) => a.error - b.error || (a.time ?? Infinity) - (b.time ?? Infinity));

  answered.forEach((a, i) => {
    a.rank = i + 1;
    a.points = POINTS_BY_RANK[a.rank] ?? 0;
  });

  const silent = answers
    .filter((a) => typeof a.value !== "number")
    .map((a) => ({ playerId: a.playerId, name: a.name, value: null, error: null, time: null, rank: null, points: 0 }));

  return [
    ...answered.map(({ playerId, name, value, error, time, rank, points }) => ({ playerId, name, value, error, time, rank, points })),
    ...silent,
  ];
}

// Final order: more points first. Equal points: the lower total answer time first.
export function finalOrder(players) {
  return [...players].sort((a, b) => b.score - a.score || (a.time ?? 0) - (b.time ?? 0));
}
