import { Room } from "./room.js";
import { cardFor } from "./trivia.js";
export { Room };

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I and no O

function makeCode() {
  let code = "";
  for (let i = 0; i < 4; i++) code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return code;
}

function json(env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(env) },
  });
}

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });
    if (url.pathname === "/api/health") return json(env, { ok: true });

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      for (let i = 0; i < 5; i++) {
        const code = makeCode();
        const room = env.ROOM.get(env.ROOM.idFromName(code));
        const reply = await room.fetch("https://room/create", { method: "POST", headers: { "x-room-code": code } });
        if (reply.status === 201) return json(env, await reply.json(), 201);
      }
      return json(env, { error: "no_room" }, 503);
    }

    const card = url.pathname.match(/^\/api\/trivia\/(\d+)$/);
    if (card && request.method === "GET") {
      const found = cardFor(Number(card[1]));
      return found ? json(env, found) : json(env, { error: "no_card" }, 404);
    }

    const match = url.pathname.match(/^\/api\/rooms\/([A-Z]{4})\/ws$/);
    if (match) {
      if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });
      return env.ROOM.get(env.ROOM.idFromName(match[1])).fetch(request);
    }
    return json(env, { error: "no_room" }, 404);
  },
};
