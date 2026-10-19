#!/bin/bash
# Start JKSPDC Astro SSR frontend (production)
cd /workspace/repo/website
export BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:3000}"
export HOST="${HOST:-127.0.0.1}"
export PORT="${PORT:-4321}"
exec node dist/server/entry.mjs
