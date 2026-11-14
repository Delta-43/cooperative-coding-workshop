import { DurableObject } from "cloudflare:workers";
import { scoreRound, finalOrder } from "./scoring.js";
import sampleQuestions from "./questions.sample.json";

const MAX_PLAYERS = 30;

function loadQuestions(env) {
  // The real set is stored as a secret named QUESTIONS (a JSON string), so the answers are not public.
  if (env.QUESTIONS) {
    try {
      const parsed = JSON.parse(env.QUESTIONS);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return sampleQuestions;
}

// One Room object per game. Game state lives in this.game and is saved after every change,
// because a hibernated Durable Object forgets its memory.
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
      this.game = {
        code: request.headers.get("x-room-code"),
        hostToken: crypto.randomUUID(),
        phase: "lobby",
        players: [], // { id, name, score, time }
        questionIndex: -1,
        answers: {}, // playerId -> number, for the current question
        answerTimes: {}, // playerId -> ms from the question opening to the last answer
        questionOpenedAt: null,
        reveal: null,
        answerShown: false, // true once the big screen shows the answer; until then players do not get the result
        questions: loadQuestions(this.env).map(({ text, unit, answer }) => ({ text, unit, answer })),
        nextPlayer: 1,
      };
      await this.save();
      return Response.json({ code: this.game.code, hostToken: this.game.hostToken }, { status: 201 });
    }

    if (!this.game) return Response.json({ error: "no_room" }, { status: 404 });

    const hostToken = url.searchParams.get("host");
    const isHost = hostToken !== null && hostToken === this.game.hostToken;
    if (hostToken !== null && !isHost) return new Response("Bad host token", { status: 403 });

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ role: isHost ? "host" : "player", playerId: null });
    if (isHost) this.send(server, this.stateFor(server));
    return new Response(null, { status: 101, webSocket: client });
  }

  // ---- WebSocket events ----

  async webSocketMessage(ws, raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return this.error(ws, "bad_message", "Messages must be JSON.");
    }
    if (!msg || typeof msg.type !== "string") return this.error(ws, "bad_message", "Missing type.");

    const who = ws.deserializeAttachment();
    const g = this.game;

    switch (msg.type) {
      case "join": {
        if (who.role !== "player") return this.error(ws, "not_allowed", "Only players can join.");
        const name = typeof msg.name === "string" ? msg.name.trim() : "";
        if (name.length < 1 || name.length > 16) return this.error(ws, "bad_name", "Use 1 to 16 characters.");

        // Coming back after a dropped connection.
        const existing = typeof msg.playerId === "string" ? g.players.find((p) => p.id === msg.playerId) : null;
        if (existing) {
          ws.serializeAttachment({ role: "player", playerId: existing.id });
        } else {
          if (g.players.length >= MAX_PLAYERS) return this.error(ws, "room_full", "The room is full.");
          if (g.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
            return this.error(ws, "name_taken", "That name is already in use.");
          }
          const player = { id: "p" + g.nextPlayer++, name, score: 0, time: 0 };
          g.players.push(player);
          ws.serializeAttachment({ role: "player", playerId: player.id });
        }
        break;
      }

      case "answer": {
        if (who.role !== "player" || !who.playerId) return this.error(ws, "not_allowed", "Join first.");
        if (g.phase !== "question") return this.error(ws, "wrong_phase", "No question is open.");
        if (typeof msg.value !== "number" || !Number.isFinite(msg.value)) return this.error(ws, "bad_message", "value must be a number.");
        g.answers[who.playerId] = msg.value;
        // A changed answer restarts the player's time, so nobody can lock in an early time and then edit.
        g.answerTimes ??= {};
        g.answerTimes[who.playerId] = Math.max(0, Date.now() - (g.questionOpenedAt ?? Date.now()));
        break;
      }

      case "start":
      case "reveal":
      case "show":
      case "next":
      case "kick": {
        if (who.role !== "host") return this.error(ws, "not_allowed", "Only the host can do that.");
        const failed = this.hostAction(msg);
        if (failed) return this.error(ws, failed[0], failed[1]);
        break;
      }

      default:
        return this.error(ws, "bad_message", `Unknown message type: ${msg.type}`);
    }

    await this.save();
    this.broadcast();
  }

  async webSocketClose(ws) {
    ws.close();
    this.broadcast();
  }

  async webSocketError(ws) {
    this.broadcast();
  }

  // ---- Game rules ----

  hostAction(msg) {
    const g = this.game;
    if (msg.type === "kick") {
      g.players = g.players.filter((p) => p.id !== msg.playerId);
      delete g.answers[msg.playerId];
      if (g.answerTimes) delete g.answerTimes[msg.playerId];
      for (const ws of this.ctx.getWebSockets()) {
        if (ws.deserializeAttachment().playerId === msg.playerId) ws.close(4000, "removed");
      }
      return null;
    }
    if (msg.type === "start") {
      if (g.phase !== "lobby") return ["wrong_phase", "The game has already started."];
      if (g.players.length < 1) return ["wrong_phase", "Wait for at least one player."];
      this.openQuestion(0);
      return null;
    }
    if (msg.type === "reveal") {
      if (g.phase !== "question") return ["wrong_phase", "No question is open."];
      const question = g.questions[g.questionIndex];
      const results = scoreRound(
        g.players.map((p) => ({ playerId: p.id, name: p.name, value: g.answers[p.id] ?? null, time: g.answerTimes?.[p.id] ?? null })),
        question.answer,
      );
      // Total time breaks equal final scores. No answer counts as the whole time the question was open.
      const roundLength = Math.max(0, Date.now() - (g.questionOpenedAt ?? Date.now()));
      for (const r of results) {
        const player = g.players.find((p) => p.id === r.playerId);
        player.score += r.points;
        player.time = (player.time ?? 0) + (r.time ?? roundLength);
      }
      g.reveal = { correct: question.answer, results };
      g.phase = "reveal";
      g.answerShown = false;
      return null;
    }
    if (msg.type === "show") {
      if (g.phase !== "reveal") return ["wrong_phase", "Reveal the answer first."];
      g.answerShown = true;
      return null;
    }
    if (msg.type === "next") {
      if (g.phase !== "reveal") return ["wrong_phase", "Reveal the answer first."];
      if (g.questionIndex + 1 >= g.questions.length) {
        g.phase = "over";
        g.reveal = null;
        g.answerShown = false;
      } else {
        this.openQuestion(g.questionIndex + 1);
      }
      return null;
    }
    return ["bad_message", "Unknown host action."];
  }

  openQuestion(index) {
    const g = this.game;
    g.phase = "question";
    g.questionIndex = index;
    g.answers = {};
    g.answerTimes = {};
    g.questionOpenedAt = Date.now();
    g.reveal = null;
    g.answerShown = false;
  }

  // ---- Sending ----

  stateFor(ws) {
    const g = this.game;
    const who = ws.deserializeAttachment() ?? { role: "player", playerId: null };
    const connectedIds = new Set(this.ctx.getWebSockets().map((s) => s.deserializeAttachment()?.playerId).filter(Boolean));
    const q = g.questions[g.questionIndex];
    const shown = g.phase === "reveal" && g.answerShown === true;
    // The big screen builds up to the answer. Until it is shown there, a player gets no result and no points from this round.
    const hidden = g.phase === "reveal" && !shown && who.role !== "host";
    const pending = hidden ? Object.fromEntries(g.reveal.results.map((r) => [r.playerId, r.points])) : {};
    return {
      type: "state",
      code: g.code,
      phase: g.phase,
      players: (g.phase === "over" ? finalOrder(g.players) : g.players).map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score - (pending[p.id] ?? 0),
        time: p.time ?? 0,
        connected: connectedIds.has(p.id),
        answered: g.phase === "question" || g.phase === "reveal" ? p.id in g.answers : false,
      })),
      answeredCount: Object.keys(g.answers).length,
      question: g.phase === "lobby" || g.phase === "over" || !q ? null : { index: g.questionIndex, total: g.questions.length, text: q.text, unit: q.unit },
      you: {
        role: who.role,
        playerId: who.playerId,
        answer: who.playerId && who.playerId in g.answers ? g.answers[who.playerId] : null,
      },
      answerShown: shown,
      reveal: g.phase === "reveal" && !hidden ? g.reveal : null,
    };
  }

  send(ws, message) {
    try {
      ws.send(JSON.stringify(message));
    } catch {}
  }

  error(ws, code, message) {
    this.send(ws, { type: "error", code, message });
  }

  broadcast() {
    for (const ws of this.ctx.getWebSockets()) this.send(ws, this.stateFor(ws));
  }
}
