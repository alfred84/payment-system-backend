# Payment System Backend

> Production-grade reference implementation for a Clean Architecture payments API.
> Bilingual documentation: **English (primary)** / **Español (secondary)**.

---

## English

### Overview

RESTful payment API built with **Node.js / Express / TypeScript** and a **Python / FastAPI**
payment processor microservice, backed by **PostgreSQL**. The system supports user
authentication (JWT), card tokenization, idempotent payments, and OWASP-aligned security controls.

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
            │   (main DB)   │          │ FastAPI /process│          │  (tests only)   │
            └───────────────┘          └─────────────────┘          └─────────────────┘
```

### Tech stack

| Component        | Technology              | Version   |
|------------------|-------------------------|-----------|
| Node runtime     | Node.js LTS (Krypton)   | 24.x      |
| API framework    | Express                 | ^5.1.0    |
| Language         | TypeScript              | ^5.7.0    |
| ORM              | Prisma                  | ^6.0.0    |
| Validation       | Zod                     | ^4.0.0    |
| Python runtime   | Python                  | 3.14      |
| Python framework | FastAPI                 | ^0.115.0  |
| Database         | PostgreSQL              | 18        |
| Containers       | Docker + Compose        | v2        |

### Quick start

```bash
cp .env.example .env
# Edit .env — set JWT_ACCESS_SECRET (openssl rand -hex 32)

docker compose up --build
```

| Service         | URL                                      |
|-----------------|------------------------------------------|
| Node API        | http://localhost:3000                    |
| Health check    | http://localhost:3000/health             |
| Swagger UI      | http://localhost:3000/api/v1/docs        |
| Python processor| http://localhost:9000/health             |

### Environment variables

See [`.env.example`](./.env.example) for the full list. Required at startup:

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `DATABASE_URL`      | PostgreSQL connection string         |
| `JWT_ACCESS_SECRET` | HS256 signing secret (min 32 chars) |
| `PROCESSOR_URL`     | Internal Python service URL          |
| `CORS_ORIGINS`      | Comma-separated allowed origins      |

### API reference

Interactive docs: **http://localhost:3000/api/v1/docs** (OpenAPI 3.0 / Swagger UI).

### Security

See [`SECURITY.md`](./SECURITY.md) for OWASP controls, logging policy, and known limitations.

### Testing

```bash
# Node — unit tests (fast, no Docker)
cd node-api && npm run test:unit

# Node — integration (requires postgres-test)
cd node-api && npm run test:integration

# Node — e2e
cd node-api && npm run test:e2e

# Python
cd python-service && pytest
```

### Example requests

```bash
# Health
curl http://localhost:3000/health

# Register (Phase 4+)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"correct horse battery staple"}'
```

---

## Español

### Resumen

API REST de pagos con **Node.js / Express / TypeScript** y un microservicio procesador en
**Python / FastAPI**, con base de datos **PostgreSQL**. Incluye autenticación JWT,
tokenización de tarjetas, pagos idempotentes y controles de seguridad alineados con OWASP.

### Inicio rápido

```bash
cp .env.example .env
docker compose up --build
```

| Servicio          | URL                                      |
|-------------------|------------------------------------------|
| API Node          | http://localhost:3000                    |
| Verificación      | http://localhost:3000/health             |
| Documentación API | http://localhost:3000/api/v1/docs        |
| Procesador Python | http://localhost:9000/health             |

### Variables de entorno

Consulte [`.env.example`](./.env.example). Obligatorias: `DATABASE_URL`, `JWT_ACCESS_SECRET`,
`PROCESSOR_URL`, `CORS_ORIGINS`.

### Seguridad

Ver [`SECURITY.md`](./SECURITY.md).

### Pruebas

```bash
cd node-api && npm run test:unit
cd python-service && pytest
```

---

## Project structure

```
payment-system-backend/
├── node-api/           # Express + TypeScript API (Clean Architecture)
├── python-service/     # FastAPI payment processor
├── docker/             # Dockerfiles and entrypoints
├── database/           # Schema reference (DBML)
└── .github/workflows/  # CI pipeline
```

Implementation plan: see `PLAN.md` (local, not committed).
