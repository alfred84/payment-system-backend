# Payment System Backend

> Production-grade reference implementation for a Clean Architecture payments API.
> Bilingual documentation: **English (primary)** / **Español (secondary)**.

---

## English

### Overview

RESTful payment API built with **Node.js / Express / TypeScript** and a **Python / FastAPI**
payment processor microservice, backed by **PostgreSQL**. The system supports user
authentication (JWT + rotating refresh tokens), card tokenization, idempotent payments,
and OWASP-aligned security controls.

### Architecture

```
┌─────────────┐     HTTP (internal)     ┌──────────────────┐
│   Client    │ ──────────────────────► │    node-api      │
│  (Postman)  │      /api/v1/*          │  Express + TS    │
└─────────────┘                         └────────┬─────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
                    ▼                            ▼                            ▼
            ┌───────────────┐          ┌─────────────────┐          ┌─────────────────┐
            │  PostgreSQL   │          │ python-service  │          │  postgres-test  │
            │   (main DB)   │          │ POST /process   │          │  (tests only)   │
            └───────────────┘          └─────────────────┘          └─────────────────┘
```

### Tech stack

| Component        | Technology              | Version   |
|------------------|-------------------------|-----------|
| Node runtime     | Node.js LTS (Krypton)   | 24.x      |
| API framework    | Express                 | ^5.1.0    |
| Language         | TypeScript              | ^5.7.0    |
| ORM / migrations | Prisma                  | ^6.0.0    |
| Validation       | Zod                     | ^3.24.0   |
| Python runtime   | Python                  | 3.14      |
| Python framework | FastAPI                 | ^0.136.0  |
| Database         | PostgreSQL              | 18        |
| Containers       | Docker + Compose        | v2        |

### Quick start

```bash
cp .env.example .env
# Set JWT_ACCESS_SECRET (min 32 chars), e.g.:
# openssl rand -hex 32

docker compose up --build
```

Migrations run automatically when the `node-api` container starts (`prisma migrate deploy`).

| Service          | URL                               |
|------------------|-----------------------------------|
| Node API         | http://localhost:3000             |
| Health           | http://localhost:3000/health      |
| Swagger UI       | http://localhost:3000/api/v1/docs |
| Python processor | http://localhost:9000/health      |

### Environment variables

See [`.env.example`](./.env.example). Required at startup (validated with Zod):

| Variable            | Description                                      |
|---------------------|--------------------------------------------------|
| `DATABASE_URL`      | PostgreSQL connection string (main DB)           |
| `JWT_ACCESS_SECRET` | HS256 signing secret (min 32 characters)         |
| `PROCESSOR_URL`     | Internal Python service URL (Docker network)     |
| `CORS_ORIGINS`      | Comma-separated allowed browser origins          |

Optional: `DATABASE_URL_TEST`, `POSTGRES_*`, `PYTHON_SERVICE_PORT`, `PROCESSOR_APPROVAL_SEED`.

### API reference

Interactive OpenAPI 3.0 docs: **http://localhost:3000/api/v1/docs**

All routes use the `/api/v1` prefix.

| Method | Route              | Auth | Description                    |
|--------|--------------------|------|--------------------------------|
| POST   | `/auth/register`   | No   | Create user + tokens           |
| POST   | `/auth/login`      | No   | Login                          |
| POST   | `/auth/refresh`    | No   | Rotate refresh token           |
| POST   | `/auth/logout`     | Yes  | Revoke refresh token           |
| POST   | `/cards`           | Yes  | Register tokenized card        |
| GET    | `/cards`           | Yes  | List active cards              |
| DELETE | `/cards/:id`       | Yes  | Soft-delete own card           |
| POST   | `/payments`        | Yes  | Create payment (idempotent)    |
| GET    | `/payments`        | Yes  | List own payments (paginated)  |
| GET    | `/payments/:id`    | Yes  | Payment detail (own only)    |

### Example requests

Set a base URL and obtain tokens after register/login:

```bash
export API=http://localhost:3000/api/v1

# Health
curl -s "$API/../health"   # or http://localhost:3000/health

# Register
curl -s -X POST "$API/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"Str0ng!Passw0rd"}'

# Login (save accessToken from JSON)
curl -s -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"Str0ng!Passw0rd"}'

export ACCESS_TOKEN="<paste accessToken>"
export REFRESH_TOKEN="<paste refreshToken>"

# Refresh
curl -s -X POST "$API/auth/refresh" \
  -H 'Content-Type: application/json' \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# Logout
curl -s -X POST "$API/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# Register card
curl -s -X POST "$API/cards" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"cardholderName":"Ada Lovelace","cardNumber":"4242424242424242","expiryMonth":12,"expiryYear":2030,"cvv":"123"}'

export CARD_ID="<paste card id>"

# Create payment (idempotent) — use a new UUID per logical operation
curl -s -X POST "$API/payments" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Idempotency-Key: $(uuidgen 2>/dev/null || powershell -Command '[guid]::NewGuid()')" \
  -H 'Content-Type: application/json' \
  -d "{\"cardId\":\"$CARD_ID\",\"amount\":19.99,\"currency\":\"USD\",\"description\":\"Monthly subscription\"}"

# List payments
curl -s "$API/payments?limit=20" -H "Authorization: Bearer $ACCESS_TOKEN"

# Payment detail
export PAYMENT_ID="<paste payment id>"
curl -s "$API/payments/$PAYMENT_ID" -H "Authorization: Bearer $ACCESS_TOKEN"

# Delete card
curl -s -X DELETE "$API/cards/$CARD_ID" -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Security

See [`SECURITY.md`](./SECURITY.md) for the OWASP control matrix, idempotency policy, logging rules, and known limitations.

### Testing

```bash
# Node — unit (fast)
cd node-api && npm run test:unit

# Node — integration (requires postgres-test on localhost:5433)
cd node-api && npm run test:integration

# Node — e2e with mocked processor (CI path)
cd node-api && npm run test:e2e

# Node — e2e against live Python processor
docker compose up -d postgres-test python-service
cd node-api && npm run test:e2e:live

# Idempotency concurrency check (50 parallel requests → 1 row)
cd node-api && npm run test:idempotency-concurrency

# Python
cd python-service && pytest --cov=app --cov-fail-under=75
```

CI runs lint, tests, Docker builds, and dependency audits on every push to `develop` and PRs to `main`.

### Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Environment validation failed` on start | Missing/invalid `.env` | Copy `.env.example`, set `JWT_ACCESS_SECRET` (≥32 chars) |
| `502 PROCESSOR_UNAVAILABLE` on payments | Python image stale or down | `docker compose build python-service && docker compose up -d python-service` |
| Integration tests fail to connect DB | `postgres-test` not running | `docker compose up -d postgres-test` |
| Port 5433 already in use | Another Postgres instance | Change `POSTGRES_TEST_PORT` in `.env` |
| Live e2e cannot reach processor | Wrong `PROCESSOR_URL` in `.env` | Live tests force `http://localhost:9000`; ensure port 9000 is mapped |

### Project structure

```
payment-system-backend/
├── node-api/              # Express + TypeScript API (Clean Architecture)
├── python-service/        # FastAPI payment processor
├── docker/                # Dockerfiles and entrypoint (migrations on boot)
├── database/              # Schema reference (DBML)
├── docker-compose.yml     # Full dev stack
├── docker-compose.e2e.yml # Optional e2e profile (isolated container names)
└── .github/workflows/     # CI pipeline
```

---

## Español

### Resumen

API REST de pagos con **Node.js / Express / TypeScript** y un microservicio procesador en
**Python / FastAPI**, con base de datos **PostgreSQL**. Incluye autenticación JWT con refresh
rotativo, tokenización de tarjetas, pagos idempotentes y controles alineados con OWASP.

### Inicio rápido

```bash
cp .env.example .env
# Configurar JWT_ACCESS_SECRET (mínimo 32 caracteres)

docker compose up --build
```

Las migraciones se aplican al arrancar el contenedor `node-api`.

| Servicio          | URL                                      |
|-------------------|------------------------------------------|
| API Node          | http://localhost:3000                    |
| Verificación      | http://localhost:3000/health             |
| Documentación API | http://localhost:3000/api/v1/docs        |
| Procesador Python | http://localhost:9000/health             |

### Variables de entorno

Consulte [`.env.example`](./.env.example). Obligatorias: `DATABASE_URL`, `JWT_ACCESS_SECRET`,
`PROCESSOR_URL`, `CORS_ORIGINS`.

### Referencia de API

Documentación interactiva OpenAPI: **http://localhost:3000/api/v1/docs**

Prefijo común: `/api/v1`. Autenticación: header `Authorization: Bearer <accessToken>`.
Pagos: header obligatorio `Idempotency-Key` (UUID v4).

### Ejemplo rápido

```bash
# Registro
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"Str0ng!Passw0rd"}'

# Pago idempotente (sustituir TOKEN, CARD_ID y generar un UUID para Idempotency-Key)
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer TOKEN" \
  -H "Idempotency-Key: 8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d" \
  -H 'Content-Type: application/json' \
  -d '{"cardId":"CARD_ID","amount":19.99,"currency":"USD"}'
```

### Seguridad

Ver [`SECURITY.md`](./SECURITY.md) (matriz OWASP, idempotencia, registro de auditoría).

### Pruebas

```bash
cd node-api && npm run test:unit
cd node-api && npm run test:e2e
cd python-service && pytest --cov=app --cov-fail-under=75
```

### Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| Error de validación de entorno | Revisar `.env` y `JWT_ACCESS_SECRET` |
| 502 al crear pagos | Reconstruir `python-service`: `docker compose build python-service` |
| Tests de integración fallan | Levantar `postgres-test`: `docker compose up -d postgres-test` |

---

## License

Reference implementation for a technical assessment. Use and adapt under your organization's policies.
