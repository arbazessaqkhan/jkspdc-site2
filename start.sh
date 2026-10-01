#!/bin/sh
set -e

echo "[1/3] Starting JKSPDC NestJS Backend..."
cd /app/backend
npx prisma migrate deploy
node dist/src/main.js &

echo "[2/3] Starting JKSPDC Astro Frontend SSR..."
cd /app/website
HOST=127.0.0.1 PORT=4321 node dist/server/entry.mjs &

echo "[3/3] Starting Unified Reverse Proxy on port ${PORT:-8080}..."
cd /app
export PORT="${PORT:-8080}"
exec node proxy.js
