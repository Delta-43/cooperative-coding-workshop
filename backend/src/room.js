import { DurableObject } from "cloudflare:workers";
import sample from "./questions.sample.json";

function loadQuestions(env) {
  let list = null;
  try {
    list = JSON.parse(env.QUESTIONS);
  } catch {
    list = null;
  }
  if (!Array.isArray(list) || list.length === 0) list = sample;
  return list.map(({ text, unit, answer, timeLimit, fact }) => ({ text, unit, answer, timeLimit, fact }));
}

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.game = null;
    ctx.blockConcurrencyWhile(async () => {
      this.game = (await ctx.storage.get("game")) ?? null;
    });
  }

  async save() {
    await this.ctx.storage.put("game", this.game);
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/create") {
      if (this.game) return new Response("exists", { status: 409 });
      const code = request.headers.get("x-room-code");
      const hostToken = crypto.randomUUID();
      this.game = {
        code, hostToken, phase: "lobby", players: [], questionIndex: -1,
        answers: {}, answerTimes: {}, questionOpenedAt: null, reveal: null,
        answerShown: false, nextPlayer: 1, questions: loadQuestions(this.env),
      };
      await this.save();
      return Response.json({ code, hostToken }, { status: 201 });
    }
    if (!this.game) return Response.json({ error: "no_room" }, { status: 404 });
    const host = url.searchParams.get("host");
    if (host !== null && host !== this.game.hostToken) return new Response("forbidden", { status: 403 });
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    pair[1].serializeAttachment({ role: host !== null ? "host" : "player", playerId: null });
    if (host !== null) this.send(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  stateFor(ws) {
    const g = this.game;
    const { role, playerId } = ws.deserializeAttachment() ?? { role: "player", playerId: null };
    return {
      type: "state", code: g.code, phase: g.phase,
      players: [], answeredCount: 0, question: null,
      you: { role, playerId, answer: null },
      answerShown: false, reveal: null,
    };
  }

  send(ws) {
    try { ws.send(JSON.stringify(this.stateFor(ws))); } catch { /* closed */ }
  }

  broadcast() {
    for (const ws of this.ctx.getWebSockets()) this.send(ws);
  }

  async webSocketMessage() {}
  async webSocketClose() {}
  async webSocketError() {}
}
