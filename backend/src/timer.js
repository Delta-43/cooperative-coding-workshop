// Pure timer helpers. All times are milliseconds since 1970 on the server's
// clock, and limits are in seconds. Callers pass `now` in; nothing here reads
// the clock.

export const DEFAULT_TIME_LIMIT = 20;
export const MIN_TIME_LIMIT = 5;
export const MAX_TIME_LIMIT = 120;

/** The question's own timeLimit if it is an integer from 5 to 120, else 20. */
export function timeLimitFor(question) {
  const limit = question?.timeLimit;
  if (Number.isInteger(limit) && limit >= MIN_TIME_LIMIT && limit <= MAX_TIME_LIMIT) {
    return limit;
  }
  return DEFAULT_TIME_LIMIT;
}

/** When answers close, given when the question opened. */
export function endsAt(openedAt, limitSeconds) {
  return openedAt + limitSeconds * 1000;
}

/** An answer is accepted up to and including endsAt. */
export function acceptsAnswer(now, endsAtMs) {
  return now <= endsAtMs;
}

/** Milliseconds left, never negative. */
export function timeLeftMs(now, endsAtMs) {
  return Math.max(0, endsAtMs - now);
}

function clamp(value, max) {
  return Math.min(Math.max(value, 0), max);
}

/** Milliseconds from opening to an answer, clamped to 0..limit. */
export function answerTime(openedAt, answeredAt, limitSeconds) {
  return clamp(answeredAt - openedAt, limitSeconds * 1000);
}

/** Time charged to a player with no answer: how long the question was open, at most the limit. */
export function noAnswerTime(openedAt, now, limitSeconds) {
  return clamp(now - openedAt, limitSeconds * 1000);
}
