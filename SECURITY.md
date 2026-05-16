# Security Policy — Payment System Backend

> OWASP-aligned security controls for the payment-system-backend project.
> Updated as implementation phases complete.

## Threat model (summary)

| Asset              | Risk if compromised                          |
|--------------------|----------------------------------------------|
| User credentials   | Account takeover                             |
| Refresh tokens     | Persistent session hijacking                 |
| Card tokens (opaque)| Unauthorized charges via processor           |
| Payment records    | Financial fraud, regulatory exposure         |
| JWT access secret  | Forged authentication for any user           |

**Actors:** external attackers, malicious clients, compromised dependencies.

## OWASP controls implemented

| ID  | Control                         | Implementation                                      | Status   |
|-----|---------------------------------|-----------------------------------------------------|----------|
| A01 | Broken Access Control           | JWT middleware + ownership checks in use cases      | Phase 4+ |
| A02 | Cryptographic Failures          | bcrypt (cost 12), tokenized cards, hashed refresh   | Phase 2+ |
| A03 | Injection                       | Prisma parameterized queries; Zod + Pydantic v2     | Phase 0+ |
| A04 | Insecure Design                 | Idempotency keys, amount validation, rate limiting  | Phase 4+ |
| A05 | Security Misconfiguration       | Helmet, CORS whitelist, env Zod validation, no stacks | Phase 4+ |
| A06 | Vulnerable Components           | `npm audit` + `pip-audit` in CI                     | Phase 0+ |
| A07 | Authentication Failures         | 15-min JWT, rotating refresh, login rate limit      | Phase 4+ |
| A08 | Software & Data Integrity       | Lockfiles, `npm ci` in CI                           | Phase 0+ |
| A09 | Logging & Monitoring            | Winston JSON + redactor; payment audit log          | Phase 4+ |
| A10 | SSRF                            | Processor URL from env only; no user-supplied URLs  | Phase 3+ |

## Libraries used for security

| Concern           | Library                    |
|-------------------|----------------------------|
| Password hashing  | `bcrypt` (cost factor 12)  |
| Access tokens     | `jsonwebtoken` (HS256)     |
| Request validation| `zod` (Node), `pydantic` v2 (Python) |
| HTTP headers      | `helmet`                   |
| Rate limiting     | `express-rate-limit`       |
| SQL access        | Prisma ORM (parameterized)   |

## Logging policy

**Never log:** passwords, password hashes, JWT secrets, refresh/access tokens,
full card numbers (PAN), CVV, `Authorization` header values, idempotency keys.

Structured JSON logs include: `timestamp`, `level`, `event_type`, `requestId`,
`userId` (when authenticated), `paymentId`, `amount`, `status` (for payment events).

## Known limitations

- **HTTPS:** not terminated inside the application container; use a reverse proxy
  (nginx, Traefik) or TLS in production. Local dev uses plain HTTP.
- **No WAF** or DDoS protection beyond `express-rate-limit` on auth endpoints.
- **Single-region database** — no multi-region failover in this reference implementation.
- **No MFA** — email + password only.
- **HS256 JWT** — acceptable for this test; production should consider RS256 with key rotation.

## Reporting a vulnerability

If you discover a security issue, please report it privately to the project maintainer.
Do not open a public issue with exploit details.
