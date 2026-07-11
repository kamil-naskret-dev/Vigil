# Vigil

Self-hosted uptime monitoring REST API. Vigil periodically checks your services and alerts you via email or webhook when something goes down — before your users do.

## Features

- **Monitor management** — create, update, pause, resume and delete HTTP monitors with configurable check intervals
- **Automatic checks** — BullMQ repeatable jobs ping each monitor on schedule; jobs survive Redis restarts
- **Alerting** — email (Nodemailer) and signed webhooks (HMAC-SHA256) on status change
- **Two-state alerting** — `DEGRADED` fires after 3 consecutive failures, `RECOVERED` fires on first success after degradation; no duplicate alerts
- **Statistics** — uptime %, response time percentiles (p50/p95/p99), check history with pagination
- **Dashboard** — aggregate summary across all monitors
- **Security** — JWT auth (access + refresh tokens), rate limiting, Helmet, CORS-ready
- **Observability** — structured JSON logs (Winston) with Request ID propagation
- **Production-ready** — multi-stage Docker build, `prisma migrate deploy` on container start

## Architecture

Hexagonal Architecture + CQRS + Domain Events.

```
src/
├── core/                       # Domain — zero framework dependencies
│   ├── domain/                 # Entities, Value Objects, Domain Events
│   └── application/            # Use Cases (Commands/Queries), Ports (interfaces)
├── infrastructure/             # Adapters: Prisma, BullMQ, Nodemailer, Winston
└── interface/                  # NestJS: Controllers, Guards, Filters, Modules
```

Key design decisions:
- Core layer imports nothing from NestJS or Prisma — only plain TypeScript
- Commands mutate state, Queries read state — never mixed
- Domain Events (`MonitorDegraded`, `MonitorRecovered`) are emitted by the entity after `save()`, dispatched in the use case
- `useFactory` pattern wires non-`@Injectable` handler classes into NestJS DI

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Database | PostgreSQL + Prisma ORM |
| Queue | BullMQ + Redis |
| Auth | JWT (access + refresh tokens) |
| Email | Nodemailer |
| Webhooks | Native `fetch` + HMAC-SHA256 signatures |
| Logging | Winston (JSON in prod, colorized in dev) |
| Docs | Swagger / OpenAPI |
| Tests | Jest + Supertest (E2E) |
| Container | Docker multi-stage build |

## Getting Started

### Prerequisites

- Node.js 22+
- Docker (for PostgreSQL and Redis)

### Local development

```bash
# 1. Clone and install
git clone <repo>
cd vigil
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start infrastructure
npm run docker:up

# 4. Run migrations
npx prisma migrate dev

# 5. Start in watch mode
npm run start:dev
```

API available at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api`
BullMQ dashboard at `http://localhost:3000/queues`

### Production (Docker)

```bash
# 1. Configure environment
cp .env.example .env.prod
# Set DATABASE_URL=postgresql://user:pass@postgres:5432/vigil
# Set REDIS_HOST=redis
# Set NODE_ENV=production

# 2. Build and start full stack
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

# 3. View logs
npm run docker:prod:logs
```

Migrations run automatically on container start.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | Environment | `production` |
| `LOG_LEVEL` | Winston log level | `info` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://vigil:vigil@localhost:5432/vigil` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Access token secret | — |
| `JWT_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | — |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `SMTP_HOST` | SMTP server host | `smtp.example.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use TLS | `false` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password | — |
| `SMTP_FROM` | Sender address | `Vigil <alerts@example.com>` |

## API Overview

```
POST   /auth/register          Register
POST   /auth/login             Login → { accessToken, refreshToken }
POST   /auth/refresh           Refresh access token
POST   /auth/logout            Revoke refresh token

GET    /monitors               List monitors (with uptime summary)
POST   /monitors               Create monitor
GET    /monitors/:id           Get monitor
PATCH  /monitors/:id           Update monitor
DELETE /monitors/:id           Delete monitor
POST   /monitors/:id/pause     Pause checking
POST   /monitors/:id/resume    Resume checking

GET    /monitors/:id/checks    Check history (paginated)
GET    /monitors/:id/stats     Statistics (uptime %, p50/p95/p99)

GET    /monitors/:id/channels  List alert channels
POST   /monitors/:id/channels  Add alert channel (email or webhook)
DELETE /monitors/:id/channels/:channelId

GET    /dashboard              Aggregate summary across all monitors

GET    /health                 Health check
```

Full interactive docs: `GET /api`

## Tests

```bash
# E2E tests (requires running postgres + redis)
npm run test:e2e
```

## Webhook Signature Verification

Every webhook POST includes an `X-Vigil-Signature` header:

```
X-Vigil-Signature: sha256=<hmac-hex>
```

Verify on your end:

```ts
import { createHmac } from 'crypto';

const expected = 'sha256=' + createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');

const valid = expected === req.headers['x-vigil-signature'];
```