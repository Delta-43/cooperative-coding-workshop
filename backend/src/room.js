import { DurableObject } from "cloudflare:workers";
import sample from "./questions.sample.json";
import { timeLimitFor, endsAt, acceptsAnswer, answerTime, noAnswerTime } from "./timer.js";
import { scoreRound, finalOrder } from "./scoring.js";

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
        answerShown: false, nextPlayer: 1, questionEndsAt: null, questions: loadQuestions(this.env),
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

  socketsOf(playerId) {
    return this.ctx.getWebSockets().filter((s) => s.readyState === 1 && s.deserializeAttachment()?.playerId === playerId);
  }

  stateFor(ws) {
    const g = this.game;
    const { role, playerId } = ws.deserializeAttachment() ?? { role: "player", playerId: null };
    const inRound = g.phase === "question" || g.phase === "reveal";
    return {
      type: "state", code: g.code, phase: g.phase,
      players: this.playersFor(role).map((p) => ({
        id: p.id, name: p.name, score: p.score, time: p.time,
        connected: this.socketsOf(p.id).length > 0,
        answered: inRound && g.answers[p.id] !== undefined,
      })),
      answeredCount: Object.keys(g.answers).length,
      question: this.questionView(),
      you: { role, playerId, answer: playerId ? g.answers[playerId] ?? null : null },
      answerShown: g.phase === "reveal" && g.answerShown,
      reveal: g.phase === "reveal" && (role === "host" || g.answerShown) ? g.reveal : null,
    };
  }

  // A player does not see this round's points until the host sends "show".
  playersFor(role) {
    const g = this.game;
    if (g.phase === "over") return finalOrder(g.players);
    if (g.phase === "reveal" && role !== "host" && !g.answerShown && g.reveal) {
      const gained = Object.fromEntries(g.reveal.results.map((r) => [r.playerId, r.points]));
      return g.players.map((p) => ({ ...p, score: p.score - (gained[p.id] ?? 0) }));
    }
    return g.players;
  }

  questionView() {
    const g = this.game;
    if (g.phase !== "question" && g.phase !== "reveal") return null;
    const q = g.questions[g.questionIndex];
    return {
      index: g.questionIndex, total: g.questions.length, text: q.text, unit: q.unit,
      timeLimit: timeLimitFor(q), endsAt: g.questionEndsAt, serverTime: Date.now(),
      fact: q.fact ?? null,
    };
  }

  openQuestion(index) {
    const g = this.game;
    g.phase = "question";
    g.questionIndex = index;
    g.answers = {};
    g.answerTimes = {};
    g.questionOpenedAt = Date.now();
    g.questionEndsAt = endsAt(g.questionOpenedAt, timeLimitFor(g.questions[index]));
    g.reveal = null;
    g.answerShown = false;
  }

  send(ws) {
    try { ws.send(JSON.stringify(this.stateFor(ws))); } catch { /* closed */ }
  }

  broadcast() {
    for (const ws of this.ctx.getWebSockets()) if (ws.readyState === 1) this.send(ws);
  }

  fail(ws, code, message) {
    ws.send(JSON.stringify({ type: "error", code, message }));
  }

  async webSocketMessage(ws, raw) {
    const g = this.game;
    let msg;
    try { msg = JSON.parse(raw); } catch { return this.fail(ws, "bad_message", "That was not valid JSON."); }
    if (!msg || typeof msg.type !== "string") return this.fail(ws, "bad_message", "A message needs a type.");
    const att = ws.deserializeAttachment() ?? { role: "player", playerId: null };
    const isHost = att.role === "host";

    switch (msg.type) {
      case "join": {
        if (isHost) return this.fail(ws, "not_allowed", "The host cannot join as a player.");
        const known = typeof msg.playerId === "string" && g.players.find((p) => p.id === msg.playerId);
        if (known) {
          ws.serializeAttachment({ role: "player", playerId: known.id });
          break;
        }
        const name = typeof msg.name === "string" ? msg.name.trim() : "";
        if (name.length < 1 || name.length > 16) return this.fail(ws, "bad_name", "Pick a name of 1 to 16 characters.");
        if (g.players.length >= 30) return this.fail(ws, "room_full", "This room is full.");
        if (g.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return this.fail(ws, "name_taken", "That name is already in use.");
        const player = { id: "p" + g.nextPlayer++, name, score: 0, time: 0 };
        g.players.push(player);
        ws.serializeAttachment({ role: "player", playerId: player.id });
        break;
      }
      case "answer": {
        if (isHost || !att.playerId || !g.players.some((p) => p.id === att.playerId)) return this.fail(ws, "not_allowed", "Join the game first.");
        if (g.phase !== "question") return this.fail(ws, "wrong_phase", "Answers are closed.");
        const now = Date.now();
        if (!acceptsAnswer(now, g.questionEndsAt)) return this.fail(ws, "time_up", "Time is up.");
        if (typeof msg.value !== "number" || !Number.isFinite(msg.value)) return this.fail(ws, "bad_message", "An answer is a number.");
        g.answers[att.playerId] = msg.value;
        g.answerTimes[att.playerId] = answerTime(g.questionOpenedAt, now, timeLimitFor(g.questions[g.questionIndex]));
        break;
      }
      case "start": {
        if (!isHost) return this.fail(ws, "not_allowed", "Only the host can do that.");
        if (g.phase !== "lobby" || g.players.length === 0) return this.fail(ws, "wrong_phase", "Wait for players, then start from the lobby.");
        this.openQuestion(0);
        break;
      }
      case "reveal": {
        if (!isHost) return this.fail(ws, "not_allowed", "Only the host can do that.");
        if (g.phase !== "question") return this.fail(ws, "wrong_phase", "There is no question to reveal.");
        const q = g.questions[g.questionIndex];
        const limit = timeLimitFor(q);
        const now = Date.now();
        const results = scoreRound(
          g.players.map((p) => ({ playerId: p.id, name: p.name, value: g.answers[p.id] ?? null, time: g.answerTimes[p.id] ?? null })),
          q.answer,
        );
        for (const p of g.players) {
          p.score += results.find((r) => r.playerId === p.id).points;
          p.time += g.answerTimes[p.id] ?? noAnswerTime(g.questionOpenedAt, now, limit);
        }
        g.reveal = { correct: q.answer, results };
        g.phase = "reveal";
        g.answerShown = false;
        break;
      }
      case "show": {
        if (!isHost) return this.fail(ws, "not_allowed", "Only the host can do that.");
        if (g.phase !== "reveal") return this.fail(ws, "wrong_phase", "Reveal the question first.");
        g.answerShown = true;
        break;
      }
      case "next": {
        if (!isHost) return this.fail(ws, "not_allowed", "Only the host can do that.");
        if (g.phase !== "reveal") return this.fail(ws, "wrong_phase", "Reveal the question first.");
        if (g.questionIndex + 1 >= g.questions.length) {
          g.phase = "over";
          g.reveal = null;
          g.answerShown = false;
        } else this.openQuestion(g.questionIndex + 1);
        break;
      }
      case "kick": {
        if (!isHost) return this.fail(ws, "not_allowed", "Only the host can do that.");
        const id = msg.playerId;
        const sockets = this.socketsOf(id);
        g.players = g.players.filter((p) => p.id !== id);
        delete g.answers[id];
        delete g.answerTimes[id];
        for (const s of sockets) s.close(4000, "removed");
        break;
      }
      default:
        return this.fail(ws, "bad_message", "Unknown message type.");
    }
    await this.save();
    this.broadcast();
  }

  async webSocketClose(ws, code, reason) { try { ws.close(code, reason); } catch { /* already closed */ } this.broadcast(); }
  async webSocketError() { this.broadcast(); }
}
