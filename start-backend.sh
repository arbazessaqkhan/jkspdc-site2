#!/bin/bash
# Start JKSPDC NestJS backend (production) — self-healing:
# ensures PostgreSQL is installed/running and the database exists before
# launching the app. Postgres does NOT survive container replacement, so
# this script rebuilds it whenever it's missing.
set -e
cd /workspace/repo/backend

# 1. Load managed env file if DATABASE_URL not already in environment
if [ -z "$DATABASE_URL" ] && [ -f /workspace/repo/backend/.env ]; then
  export $(grep -E '^DATABASE_URL=' /workspace/repo/backend/.env | head -1 | xargs)
fi
: "${DATABASE_URL:?DATABASE_URL must be set (via environment or backend/.env)}"
export DATABASE_URL

DBUSER=$(node -e "console.log(new URL(process.env.DATABASE_URL).username)")
DBPASS=$(node -e "console.log(decodeURIComponent(new URL(process.env.DATABASE_URL).password))")
DBNAME=$(node -e "console.log(new URL(process.env.DATABASE_URL).pathname.replace('/',''))")

# 2. Ensure PostgreSQL is installed, running, and the role/database exist
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  echo "[start-backend] PostgreSQL missing — installing..."
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql-17 || \
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql
fi
if ! sudo -u postgres pg_isready -q 2>/dev/null; then
  echo "[start-backend] Starting PostgreSQL cluster..."
  sudo pg_ctlcluster 17 main start 2>/dev/null || sudo pg_lsclusters --no-header 2>/dev/null | \
    while read -r ver name port status _; do
      [ "$status" = "down" ] && sudo pg_ctlcluster "$ver" "$name" start
    done || true
  sleep 3
fi
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DBUSER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER $DBUSER WITH PASSWORD '$DBPASS';"
sudo -u postgres psql -c "ALTER USER $DBUSER WITH PASSWORD '$DBPASS';" >/dev/null
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DBNAME'" | grep -q 1 || \
  sudo -u postgres createdb -O "$DBUSER" "$DBNAME"

# Wait for readiness (max ~30s)
for i in $(seq 1 15); do
  if sudo -u postgres pg_isready -q 2>/dev/null; then break; fi
  sleep 2
done

# 3. Apply migrations (idempotent) + seed when DB is empty
npx prisma migrate deploy >/dev/null 2>&1 || npx prisma migrate deploy
CNT=$(DATABASE_URL="$DATABASE_URL" node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(c=>{console.log(c);return p.\$disconnect();}).catch(()=>{console.log(0);})" 2>/dev/null || echo 0)
if [ "$CNT" = "0" ]; then
  echo "[start-backend] Database empty — seeding..."
  DATABASE_URL="$DATABASE_URL" INITIAL_ADMIN_PASSWORD="${INITIAL_ADMIN_PASSWORD:-Jkspdc@2026}" node prisma/seed.js || true
  DATABASE_URL="$DATABASE_URL" node prisma/seed-stations.js || true
  DATABASE_URL="$DATABASE_URL" node prisma/seed_ipp_projects.js || true
  DATABASE_URL="$DATABASE_URL" node prisma/seed_downloads.js || true
fi

# 4. Launch the app
export PORT="${PORT:-3000}"
export CORS_ORIGIN="${CORS_ORIGIN:-*}"
export NODE_ENV="${NODE_ENV:-development}"
exec node dist/src/main.js
