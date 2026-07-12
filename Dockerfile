# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --legacy-peer-deps

# Generate Prisma client based on schema
RUN npx prisma generate

COPY . .
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ── Stage 2: production ───────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist           ./dist
COPY --from=builder /app/node_modules  ./node_modules
COPY --from=builder /app/package.json  ./package.json
COPY --from=builder /app/prisma        ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
