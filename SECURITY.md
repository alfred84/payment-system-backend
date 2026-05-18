# Security Policy — Payment System Backend

> OWASP-aligned controls for a **public API without authentication**.
> Maps to `PROJECT_REQUIREMENTS.md` §4.1 and the implementation checklist in `PLAN.md` §8.

## Deliberate scope exclusion: no authentication layer

This reference implementation **does not** implement login, JWT, refresh tokens,
password hashing, or session middleware. Identity is resolved by the `userId`
(UUID) supplied in the URL path, request body, or query parameter.

**Implication:** OWASP **A01** (access control via credentials), **A02**
(password/credential storage), and **A07** (authentication failures) are **not
applicable** in their classic form. The equivalent risk — **IDOR** — is mitigated
by validating `resource.userId === requestUserId` on every card/payment operation
and returning **404** (not 403) for cross-user access.

A production deployment would add OAuth2/OIDC or API keys behind a gateway; that
is out of scope for this exercise.

---

## Threat model

### Assets

| Asset | Impact if compromised |
|-------|------------------------|
| Opaque card tokens | Unauthorized charges via the internal processor |
| Payment records & audit trail | Financial fraud, regulatory exposure |
| User PII (`fullName`, `email`) | Privacy breach, phishing targeting |
| Database credentials (`DATABASE_URL`) | Full data exfiltration |

### Actors and abuse cases

| Actor | Typical abuse |
|-------|----------------|
| External attacker | IDOR on payments/cards (guessing UUIDs), injection attempts, rate-limit exhaustion |
| Malicious client | Replay of `Idempotency-Key` with altered body, registering cards against another user's id |
| Compromised dependency | Supply-chain tampering (mitigated via lockfiles + CI audit) |

**In scope:** input validation, resource ownership checks, idempotency, rate limits, safe logging, SSRF prevention.

**Out of scope:** WAF, DDoS edge protection, MFA, HSM/KMS, multi-region DR, TLS termination inside app containers.

---

## OWASP controls (implementation + rationale)

| ID | Control | Implementation | Rationale |
|----|---------|----------------|-----------|
| **A01** | Broken Access Control | Every card/payment use case checks `resource.userId === input.userId`. Cross-user access returns **404** (not 403). | Prevents IDOR without an auth layer; 404 avoids resource enumeration. |
| **A02** | Cryptographic Failures | Cards store **last4 + brand + opaque token** only — no PAN/CVV columns. No passwords stored. | PCI-minded storage for this exercise. |
| **A03** | Injection | Prisma ORM (parameterized); **no** `$queryRawUnsafe`; Zod on all Node inputs; Pydantic v2 (`extra=forbid`) on `/process`. | Invalid shapes fail before SQL or domain logic. |
| **A04** | Insecure Design | `Idempotency-Key` (UUID v4) on `POST /payments`; fingerprint in metadata; unique index per user; amount > 0 with ≤2 decimals; ISO 4217 currency; general API rate limit (100 / IP / 15 min). | Prevents duplicate charges and abusive traffic. |
| **A05** | Security Misconfiguration | `helmet`, CORS whitelist from `CORS_ORIGINS`, Zod env validation at boot, error mapper **never** attaches stack traces to HTTP responses. | Fail-fast config and safe error envelopes. |
| **A06** | Vulnerable Components | `npm audit` / `pip-audit` in CI; Dependabot for npm + pip. | High/critical issues block merges. |
| **A07** | Authentication Failures | **N/A** — no authentication layer by design. Documented limitation. | See scope exclusion above. |
| **A08** | Software & Data Integrity | Committed lockfiles; CI uses `npm ci`; Docker images built from Dockerfiles in-repo. | Reproducible installs. |
| **A09** | Logging & Monitoring | Winston JSON + recursive `redact()`; payment status transitions write `payment_audit_log` in the same transaction as `payments.update`. | Audit trail without leaking card secrets. |
| **A10** | SSRF | Outbound HTTP only to `PROCESSOR_URL` from validated env; no user-controlled URLs in `fetch`. | Processor is the sole egress target. |

### Idempotency policy

- Header: `Idempotency-Key` (UUID v4), required on `POST /payments`.
- **Same key + same body** within the retention window → return the existing payment (201 with same `id`).
- **Same key + different body** → `409 IDEMPOTENCY_CONFLICT`.
- **Concurrent inserts** on the same key → unique constraint → race handler refetches winner (`CreatePaymentUseCase`).

### HTTP status choices (security-relevant)

| Situation | Status | Notes |
|-----------|--------|-------|
| Payment/card exists but belongs to another user | **404** | Same body as genuinely missing resource |
| Processor declines (business outcome) | **201** + `status: REJECTED` | Resource created; not a transport error |
| Processor unreachable | **502** | `PROCESSOR_UNAVAILABLE` |

---

## Libraries

| Concern | Library |
|---------|---------|
| Request validation | `zod` (Node), `pydantic` v2 (Python) |
| HTTP hardening | `helmet`, `cors` |
| Rate limiting | `express-rate-limit` (general API limiter) |
| SQL access | Prisma ORM |
| Structured logging | `winston` |

---

## Logging policy

**Never log:** PAN, CVV, card tokens, idempotency keys, full card numbers.

**May log (structured JSON):** `requestId`, `userId`, `paymentId`, `amount`, `status`, event types.

All log objects pass through `shared/logger/redact.ts` before emission.

---

## Known limitations

- **No authentication** — anyone who knows a `userId` UUID can act as that user. Acceptable for this test; unacceptable in production without a gateway.
- **HTTPS** is not terminated inside app containers; use a reverse proxy in production.
- **No WAF** or edge DDoS protection beyond application rate limits.
- **Single-region PostgreSQL** — no failover in this repo.

---

## Reporting a vulnerability

Please report security issues **privately** to the project maintainer. Do not open public issues with exploit details or proof-of-concept that could harm deployed systems.
