#!/bin/bash
# Start JKSPDC NestJS backend (production)
cd /workspace/repo/backend
# Load managed env file if DATABASE_URL not already in environment
if [ -z "$DATABASE_URL" ] && [ -f /workspace/repo/backend/.env ]; then
  export $(grep -E '^DATABASE_URL=' /workspace/repo/backend/.env | head -1 | xargs)
fi
: "${DATABASE_URL:?DATABASE_URL must be set (via environment or backend/.env)}"
export DATABASE_URL
export PORT="${PORT:-3000}"
export CORS_ORIGIN="${CORS_ORIGIN:-*}"
export NODE_ENV="${NODE_ENV:-development}"
exec node dist/src/main.js
