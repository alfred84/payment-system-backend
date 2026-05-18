# payment-system-backend

Fictional payment system demonstrating Clean Architecture, TDD, and idempotent payments using Node.js, FastAPI, and PostgreSQL.

**No authentication** — identity is resolved by `userId` (UUID) in the URL path, request body, or query parameter (`user_id`).

---

## Architecture

```
                    ┌─────────────────────┐
                    │   Client / curl     │
                    └──────────┬──────────┘
                               │ HTTP
                    ┌──────────▼──────────┐
                    │   node-api :3000    │
                    │  Express + Prisma   │
                    └──┬──────────────┬───┘
                       │              │
              ┌────────▼────┐   ┌─────▼────────────┐
              │  postgres   │   │ python-service   │
              │    :5432    │   │  :8000 /process  │
              └─────────────┘   └──────────────────┘
```

```
payment-system-backend/
├── node-api/          # Node.js / Express / TypeScript — main REST API
├── python-service/    # Python / FastAPI — internal payment processor
└── docker-compose.yml
```

Both services follow Clean Architecture (Domain → Application → Infrastructure → Interface layers).

---

## Technology stack

| Component | Version |
|-----------|---------|
| Node.js | ≥ 24 (LTS) |
| Express | ^5.1.0 |
| TypeScript | ^5.7.0 |
| Prisma | ^6.0.0 |
| PostgreSQL | 18 (Alpine image) |
| Python | 3.14 |
| FastAPI | ^0.136.0 |
| Pydantic | ^2.10.0 |

---

## Quick start

```bash
cp .env.example .env
docker compose up -d
curl http://localhost:3000/health
```

Interactive API docs: **http://localhost:3000/api/v1/docs**

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `development` |
| `NODE_API_PORT` | Port for the Node API | `3000` |
| `DATABASE_URL` | Postgres connection (main) | see `.env.example` |
| `DATABASE_URL_TEST` | Postgres connection (tests) | see `.env.example` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `PROCESSOR_URL` | Python processor base URL | `http://python-service:8000` |
| `LOG_LEVEL` | Winston log level | `info` |

---

## API reference (`/api/v1`)

### Users

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users` | Create a user (`fullName`, `email`) |
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get user by id |

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com"}'

curl http://localhost:3000/api/v1/users

curl http://localhost:3000/api/v1/users/11111111-1111-4111-8111-111111111111
```

### Cards

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/cards` | Register a card (`userId` in body) |
| `GET` | `/cards?user_id=:id` | List active cards for a user |
| `DELETE` | `/cards/:id?user_id=:id` | Soft-delete a card |

```bash
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

curl "http://localhost:3000/api/v1/cards?user_id=11111111-1111-4111-8111-111111111111"

curl -X DELETE \
  "http://localhost:3000/api/v1/cards/22222222-2222-4222-8222-222222222222?user_id=11111111-1111-4111-8111-111111111111"
```

### Payments

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/payments` | Create a payment — requires `Idempotency-Key` header |
| `GET` | `/payments?user_id=:id` | List payment history (cursor pagination) |
| `GET` | `/payments/:id?user_id=:id` | Get payment detail |

```bash
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

curl "http://localhost:3000/api/v1/payments?user_id=11111111-1111-4111-8111-111111111111&limit=20"

curl "http://localhost:3000/api/v1/payments/33333333-3333-4333-8333-333333333333?user_id=11111111-1111-4111-8111-111111111111"
```

---

## Testing

```bash
cd node-api
npm run test:unit
npm run test:integration   # requires postgres-test (docker compose)
npm run test:e2e         # requires full stack
```

---

## Security

See [SECURITY.md](./SECURITY.md). Summary:

- **Helmet.js** — secure HTTP headers
- **Rate limiting** — 100 req/IP/15 min
- **Zod validation** — all inputs validated before processing
- **Parameterized queries** — via Prisma (never `$queryRawUnsafe`)
- **No stack traces** in error responses
- **PAN & CVV never stored** — only `last4`, `brand`, and an opaque token
- **Resource ownership** — `card.userId` / `payment.userId` validated on every request
- **IDOR-safe 404** — cross-user access returns 404, not 403
- **No authentication** — deliberate scope limitation (documented in SECURITY.md)

---

# payment-system-backend (Español)

Sistema de pagos ficticio con **Clean Architecture**, **TDD** e idempotencia en cobros.

**Sin autenticación** — el usuario se identifica por `userId` (UUID) en la ruta, el cuerpo o el query `user_id`.

---

## Arquitectura

Ver diagrama ASCII en la sección en inglés. Estructura:

- `node-api/` — API REST principal (Node.js / Express / TypeScript / Prisma)
- `python-service/` — procesador interno de pagos (Python / FastAPI)
- `docker-compose.yml` — orquestación local

---

## Arranque rápido

```bash
cp .env.example .env
docker compose up -d
curl http://localhost:3000/health
```

Documentación interactiva: **http://localhost:3000/api/v1/docs**

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NODE_ENV` | Entorno de ejecución |
| `NODE_API_PORT` | Puerto de la API Node (default `3000`) |
| `DATABASE_URL` | Conexión PostgreSQL principal |
| `DATABASE_URL_TEST` | Conexión PostgreSQL para tests |
| `CORS_ORIGINS` | Orígenes CORS permitidos (separados por coma) |
| `PROCESSOR_URL` | URL del microservicio Python |
| `LOG_LEVEL` | Nivel de log Winston |

Valores por defecto en `.env.example`.

---

## API (`/api/v1`)

Ningún endpoint requiere `Authorization`.

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/users` | Crear usuario |
| `GET` | `/users` | Listar usuarios |
| `GET` | `/users/:id` | Obtener usuario |

### Tarjetas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/cards` | Registrar tarjeta (`userId` en body) |
| `GET` | `/cards?user_id=:id` | Listar tarjetas activas |
| `DELETE` | `/cards/:id?user_id=:id` | Baja lógica de tarjeta |

### Pagos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/payments` | Crear pago (header `Idempotency-Key` obligatorio) |
| `GET` | `/payments?user_id=:id` | Historial paginado |
| `GET` | `/payments/:id?user_id=:id` | Detalle de pago |

Ejemplos `curl` completos en la sección en inglés.

---

## Pruebas

```bash
cd node-api
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

## Seguridad

Ver [SECURITY.md](./SECURITY.md). La API es pública por diseño del enunciado; los controles aplicables son validación de entrada, no almacenar PAN/CVV, idempotencia, rate limiting y validación de pertenencia recurso↔usuario (404 ante acceso cruzado).
