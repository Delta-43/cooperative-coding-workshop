import { Room } from "./room.js";
export { Room };

const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O: easy to confuse with 1 and 0

function makeCode() {
  let code = "";
  for (let i = 0; i < 4; i++) code += CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)];
  return code;
}

function cors(env, request, response) {
  const allowed = env.ALLOWED_ORIGIN || "*";
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", allowed);
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { status: response.status, webSocket: response.webSocket, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return cors(env, request, new Response(null, { status: 204 }));

    if (url.pathname === "/api/health") return cors(env, request, Response.json({ ok: true }));

    // Create a room. The Durable Object stores the host token.
    if (url.pathname === "/api/rooms" && request.method === "POST") {
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = makeCode();
        const stub = env.ROOM.get(env.ROOM.idFromName(code));
        const reply = await stub.fetch(new Request("https://room/create", { method: "POST", headers: { "x-room-code": code } }));
        if (reply.status === 201) return cors(env, request, reply);
      }
      return cors(env, request, Response.json({ error: "no_room" }, { status: 503 }));
    }

    // WebSocket for a room: /api/rooms/KQWZ/ws
    const match = url.pathname.match(/^\/api\/rooms\/([A-Z]{4})\/ws$/);
    if (match) {
      if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });
      const code = match[1];
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      const forward = new Request(request);
      forward.headers.set("x-room-code", code);
      return stub.fetch(forward);
    }

    return cors(env, request, Response.json({ error: "no_room" }, { status: 404 }));
  },
};
