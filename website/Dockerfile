# Multi-stage production build for JKSPDC Citizen Portal (Astro SSR + Node 22 Alpine)

# ── Stage 1: Build ──
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --production

# ── Stage 2: Production Runner ──
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN chown -R node:node /usr/src/app

COPY --chown=node:node package*.json ./
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

USER node

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]

