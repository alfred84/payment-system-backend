# Security Policy — Payment System Backend

> OWASP-aligned security controls for the payment-system-backend project.
> Maps to `PROJECT_REQUIREMENTS.md` §4.1 and the implementation checklist in `PLAN.md` §8.

## Threat model

### Assets

| Asset | Impact if compromised |
|-------|------------------------|
| User credentials (password hashes) | Account takeover, fraudulent payments |
| Refresh tokens (hashed at rest) | Persistent session hijacking |
| JWT access secret | Forged authentication for any user |
| Opaque card tokens | Unauthorized charges via the processor |
| Payment records & audit trail | Financial fraud, regulatory exposure |

### Actors and abuse cases

| Actor | Typical abuse |
|-------|----------------|
| External attacker | Credential stuffing, IDOR on payments/cards, injection attempts |
| Malicious client | Replay of idempotency keys with altered bodies, refresh-token reuse |
| Compromised dependency | Supply-chain tampering (mitigated via lockfiles + CI audit) |

**In scope for this reference implementation:** application-layer controls (authZ, validation, idempotency, rate limits, safe logging).

**Out of scope (documented limitations):** WAF, DDoS edge protection, MFA, HSM/KMS for secrets, multi-region DR.

---

## OWASP controls (implementation + rationale)

| ID | Control | Implementation | Rationale |
|----|---------|----------------|-----------|
| **A01** | Broken Access Control | JWT middleware (`authenticate.ts`); every card/payment use case checks `resource.userId === jwt.sub`. Cross-user access returns **404** (not 403) to avoid resource enumeration. | IDOR is the primary risk for multi-tenant payment APIs; 404 equalizes “not found” and “not yours”. |
| **A02** | Cryptographic Failures | `bcrypt` cost **12** for passwords; refresh tokens stored as hashes; cards store **last4 + brand + opaque token** only — no PAN/CVV columns. | Meets PCI-minded storage rules for this exercise; raw card data never touches PostgreSQL. |
| **A03** | Injection | Prisma ORM (parameterized); **no** `$queryRawUnsafe`; Zod on all Node inputs; Pydantic v2 (`extra=forbid`) on `/process`. | Defense in depth: invalid shapes fail validation before SQL or domain logic. |
| **A04** | Insecure Design | `Idempotency-Key` (UUID v4) on `POST /payments`; fingerprint stored in metadata; unique index per user; amount > 0 with ≤2 decimal places; ISO 4217 currency; auth rate limits. | Prevents duplicate charges under retries and concurrent clients (see idempotency policy below). |
| **A05** | Security Misconfiguration | `helmet`, CORS whitelist from `CORS_ORIGINS`, Zod env validation at boot, public error mapper **never** attaches stack traces to HTTP responses. | Fail-fast configuration and consistent safe error envelopes. |
| **A06** | Vulnerable Components | `npm audit` / `pip-audit` in CI; Dependabot for npm + pip; `npm` **overrides** pin patched `tar` for native build tooling. | Automated dependency visibility; high/critical issues block merges. |
| **A07** | Authentication Failures | Access JWT **15 min**; refresh **7 days** with rotation; reuse revokes entire token family; login limiter **5 / IP / 15 min**; timing-safe bcrypt compare on login miss. | Limits brute force and stolen refresh-token replay windows. |
| **A08** | Software & Data Integrity | Committed lockfiles (`package-lock.json`, pinned requirements); CI uses `npm ci`; Docker images built from Dockerfiles in-repo. | Reproducible installs and supply-chain traceability. |
| **A09** | Logging & Monitoring | Winston JSON + recursive `redact()`; payment status transitions write `payment_audit_log` rows in the same transaction as `payments.update`. | Audit trail without leaking secrets into log streams. |
| **A10** | SSRF | Outbound HTTP only to `PROCESSOR_URL` from validated env; no user-controlled URLs in `fetch`. | Processor is the sole egress target for payment orchestration. |

### Idempotency policy

- Header: `Idempotency-Key` (UUID v4), required on `POST /payments`.
- **Same key + same body** within the retention window → return the existing payment (201 with same `id`).
- **Same key + different body** → `409 IDEMPOTENCY_CONFLICT`.
- **Concurrent inserts** on the same key → unique constraint → `IdempotencyRaceError` → refetch winner (see `CreatePaymentUseCase`).

### HTTP status choices (security-relevant)

| Situation | Status | Notes |
|-----------|--------|-------|
| Payment/card exists but belongs to another user | **404** | Same body as genuinely missing resource |
| Processor declines (business outcome) | **201** + `status: REJECTED` | Resource was created; not a transport error |
| Processor unreachable | **502** | `PROCESSOR_UNAVAILABLE`; pending row may exist — operational follow-up required |

---

## Libraries

| Concern | Library |
|---------|---------|
| Password hashing | `bcrypt` (cost 12) |
| Access tokens | `jsonwebtoken` (HS256) |
| Request validation | `zod` (Node), `pydantic` v2 (Python) |
| HTTP hardening | `helmet`, `cors` |
| Rate limiting | `express-rate-limit` |
| SQL access | Prisma ORM |

---

## Logging policy

**Never log:** passwords, password hashes, JWT secrets, refresh/access tokens, PAN, CVV, `Authorization` header values, idempotency keys.

**May log (structured JSON):** `requestId`, `userId` (when authenticated), `paymentId`, `amount`, `status`, event types.

All log objects pass through `shared/logger/redact.ts` before emission.

---

## Known limitations

- **HTTPS** is not terminated inside app containers; use a reverse proxy in production.
- **No WAF** or edge DDoS protection beyond auth rate limits.
- **Single-region PostgreSQL** — no failover in this repo.
- **No MFA** — email + password only.
- **HS256 JWT** — acceptable for this test; production should prefer asymmetric keys with rotation.
- **`tar` override** — pins a patched `tar` for `@mapbox/node-pre-gyp` (native `bcrypt` build); runtime does not extract tarballs in production images.

---

## Reporting a vulnerability

Please report security issues **privately** to the project maintainer. Do not open public issues with exploit details or proof-of-concept that could harm deployed systems.
