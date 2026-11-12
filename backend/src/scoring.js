// Scoring rule from contract/messages.md: relative error, ties share a rank.
const POINTS_BY_RANK = { 1: 3, 2: 2, 3: 1 };

export function relativeError(value, correct) {
  return Math.abs(value - correct) / Math.abs(correct);
}

// answers: [{ playerId, name, value }] where value is a number or null.
// Returns results in rank order. Players with no answer come last.
export function scoreRound(answers, correct) {
  const answered = answers
    .filter((a) => typeof a.value === "number")
    .map((a) => ({ ...a, error: relativeError(a.value, correct) }))
    .sort((a, b) => a.error - b.error);

  let rank = 0;
  let previousError = null;
  answered.forEach((a, i) => {
    if (a.error !== previousError) rank = i + 1; // ties share a rank, the next rank is skipped
    previousError = a.error;
    a.rank = rank;
    a.points = POINTS_BY_RANK[rank] ?? 0;
  });

  const silent = answers
    .filter((a) => typeof a.value !== "number")
    .map((a) => ({ playerId: a.playerId, name: a.name, value: null, error: null, rank: null, points: 0 }));

  return [
    ...answered.map(({ playerId, name, value, error, rank, points }) => ({ playerId, name, value, error, rank, points })),
    ...silent,
  ];
}
