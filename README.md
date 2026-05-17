# payment-system-backend

Fictional payment system demonstrating Clean Architecture, TDD, and idempotent payments using Node.js, FastAPI, and PostgreSQL. **No authentication** — identity is resolved by `userId` (UUID) in the URL, request body, or query parameter.

---

## Architecture

```
payment-system-backend/
├── node-api/          # Node.js / Express / TypeScript — main REST API
├── python-service/    # Python / FastAPI — internal payment processor
└── docker-compose.yml
```

Both services follow Clean Architecture (Domain → Application → Infrastructure → Interface layers).

---

## Quick start

```bash
cp .env.example .env            # fill in values if needed (defaults work locally)
docker compose up -d            # starts postgres, postgres-test, python-service, node-api
curl http://localhost:3000/health
```

---

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `NODE_API_PORT` | Port for the Node API | `3000` |
| `DATABASE_URL` | Postgres connection (main) | see `.env.example` |
| `DATABASE_URL_TEST` | Postgres connection (tests) | see `.env.example` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `PROCESSOR_URL` | Python processor base URL | `http://python-service:8000` |
| `LOG_LEVEL` | Winston log level | `info` |

---

## API reference (`/api/v1`)

Full interactive docs at **`http://localhost:3000/api/v1/docs`**.

### Users

| Method | Path | Description |
|---|---|---|
| `POST` | `/users` | Create a user (`fullName`, `email`) |
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get user by id |

```bash
# Create user
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com"}'

# List users
curl http://localhost:3000/api/v1/users

# Get user
curl http://localhost:3000/api/v1/users/11111111-1111-4111-8111-111111111111
```

### Cards

| Method | Path | Description |
|---|---|---|
| `POST` | `/cards` | Register a card (`userId` in body) |
| `GET` | `/cards?user_id=:id` | List active cards for a user |
| `DELETE` | `/cards/:id?user_id=:id` | Soft-delete a card |

```bash
# Register card (userId in body; PAN and CVV are tokenized and never stored)
curl -X POST http://localhost:3000/api/v1/cards \
  -H 'Content-Type: application/json' \
  -d '{
    "userId":"11111111-1111-4111-8111-111111111111",
    "cardholderName":"Ada Lovelace",
    "cardNumber":"4242424242424242",
    "expiryMonth":12,
    "expiryYear":2030,
    "cvv":"123"
  }'

# List cards
curl http://localhost:3000/api/v1/cards?user_id=11111111-1111-4111-8111-111111111111

# Soft-delete card
curl -X DELETE \
  'http://localhost:3000/api/v1/cards/22222222-2222-4222-8222-222222222222?user_id=11111111-1111-4111-8111-111111111111'
```

### Payments

| Method | Path | Description |
|---|---|---|
| `POST` | `/payments` | Create a payment — requires `Idempotency-Key` header |
| `GET` | `/payments?user_id=:id` | List payment history (cursor pagination) |
| `GET` | `/payments/:id?user_id=:id` | Get payment detail |

```bash
# Create payment (idempotent)
curl -X POST http://localhost:3000/api/v1/payments \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: 8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d' \
  -d '{
    "userId":"11111111-1111-4111-8111-111111111111",
    "cardId":"22222222-2222-4222-8222-222222222222",
    "amount":19.99,
    "currency":"USD",
    "description":"Monthly subscription"
  }'

# List payments
curl 'http://localhost:3000/api/v1/payments?user_id=11111111-1111-4111-8111-111111111111&limit=20'

# Payment detail (user_id validates ownership)
curl 'http://localhost:3000/api/v1/payments/33333333-3333-4333-8333-333333333333?user_id=11111111-1111-4111-8111-111111111111'
```

---

## Testing

```bash
cd node-api

# Unit tests (domain + application)
npm run test:unit

# Integration tests (requires running postgres-test container)
npm run test:integration

# E2E tests (requires full docker-compose stack)
npm run test:e2e
```

---

## Security

No authentication is required. The following OWASP controls are in place:

- **Helmet.js** — secure HTTP headers
- **Rate limiting** — 100 req/IP/15 min
- **Zod validation** — all inputs validated before processing
- **Parameterized queries** — via Prisma (never `$queryRawUnsafe`)
- **No stack traces** in error responses
- **PAN & CVV never stored** — only `last4`, `brand`, and an opaque token
- **Resource ownership** — `card.userId` / `payment.userId` validated on every mutating request
- **IDOR-safe 404** — cross-user access returns 404, not 403
