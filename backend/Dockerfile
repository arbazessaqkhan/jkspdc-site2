# Multi-stage production build for JKSPDC Backend (NestJS + Prisma + Node 22 Alpine)

# ── Stage 1: Build ──
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# ── Stage 2: Production Runner ──
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Install openssl for Prisma runtime on Alpine
RUN apk add --no-cache openssl

# Create uploads directory and ensure node user has access
RUN mkdir -p /usr/src/app/uploads && chown -R node:node /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/src/main"]

