# ADR 0003: Secure HttpOnly cookies for browser authentication

## Status

Accepted.

## Context

Storing session tokens in `localStorage` or `sessionStorage` exposes them to any JavaScript
running on the page, including from a successful XSS attack, and requires manually attaching an
`Authorization` header to every request. Cookies can be marked `HttpOnly` (invisible to
JavaScript), `Secure` (HTTPS-only) and `SameSite` (mitigating CSRF), and are sent automatically by
the browser.

## Decision

- Session tokens are cryptographically random, opaque values. Only a SHA-256 hash of the token is
  stored in the `sessions` table; the raw token only ever exists in the cookie and in transit.
- The cookie is set with `HttpOnly`, `SameSite=Lax`, a scoped `path`, an expiration matching the
  session duration, and `Secure` whenever `SESSION_COOKIE_SECURE=true` (always in production).
- State-changing requests are additionally checked against an explicit `Origin` allowlist
  (`verifyRequestOrigin` middleware) as defense-in-depth against CSRF, on top of `SameSite`.
- CORS is configured with an explicit allowed-origins list and `credentials: true`; wildcard
  origins are never used together with credentials.

## Consequences

- The frontend never manually manages or reads the session token; `credentials: 'include'` on the
  API client is enough.
- Logout is a real server-side revocation (`sessions.revokedAt`), not just deleting client state.
- Cross-site scripting cannot exfiltrate the session token, since it is never exposed to
  JavaScript.
