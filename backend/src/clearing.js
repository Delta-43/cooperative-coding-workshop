// When a room clears itself, and why. Pure, so it can be tested. See contract/messages.md, "Closing".
export const DEFAULT_IDLE_MS = 2 * 60 * 60 * 1000;
export const DEFAULT_CLEAR_AFTER_MS = 10 * 60 * 1000;

function setting(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** `game` needs `overAt` (set when the phase became "over") and `lastActivity`, both in ms. */
export function clearPlan(game, env) {
  if (game.overAt) {
    return { at: game.overAt + setting(env.CLEAR_AFTER_MS, DEFAULT_CLEAR_AFTER_MS), reason: "game over" };
  }
  return { at: (game.lastActivity ?? 0) + setting(env.IDLE_CLEAR_MS, DEFAULT_IDLE_MS), reason: "idle" };
}
