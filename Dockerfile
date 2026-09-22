FROM node:20-alpine AS builder

WORKDIR /app

# 1. Build Backend
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci && npx prisma generate
COPY backend/ ./
RUN npm run build

# 2. Build Website (Frontend SSR)
WORKDIR /app/website
COPY website/package*.json ./
RUN npm ci
COPY website/ ./
RUN npm run build

# 3. Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl
RUN apk add --no-cache curl

# Setup Backend in production
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate
COPY --from=builder /app/backend/dist ./dist
COPY backend/uploads ./uploads

# Setup Website in production
WORKDIR /app/website
COPY website/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/website/dist ./dist

# Setup Proxy and Entrypoint
WORKDIR /app
COPY proxy.js ./
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 8080

CMD ["./start.sh"]
