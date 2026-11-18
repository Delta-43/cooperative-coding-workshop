import cards from "./trivia.json" with { type: "json" };

/** Give each question its fixed number: its place in the list, from 1. Call before shuffling. */
export function numbered(list) {
  return list.map((q, i) => ({ ...q, number: i + 1 }));
}

/** The card for a question number, or null. */
export function cardFor(number, table = cards) {
  const card = table[String(number)];
  return card ? { number, text: card.text, source: card.source } : null;
}

/** Fill in `fact` from the card table for questions that do not have their own. */
export function withCards(list, table = cards) {
  return list.map((q) => {
    if (q.fact) return q;
    const card = cardFor(q.number, table);
    return { ...q, fact: card ? { text: card.text, source: card.source } : null };
  });
}
