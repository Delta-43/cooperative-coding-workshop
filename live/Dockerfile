# Guess Closer, in one container: the game server and the web page on one port.
#   docker build -t guess-closer .
#   docker run -p 8787:8787 guess-closer          then open http://localhost:8787
# It runs the same server code as the Cloudflare Worker, on the local workerd runtime.
FROM node:22-slim AS frontend
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_BACKEND_URL=same-origin
RUN npm run build

FROM node:22-slim
ENV WRANGLER_SEND_METRICS=false CI=1 PORT=8787
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
COPY --from=frontend /build/dist ./site
COPY container-start.mjs /app/container-start.mjs
RUN mkdir /data && chown node:node /data /app -R
USER node
EXPOSE 8787
VOLUME /data
CMD ["node", "/app/container-start.mjs"]
