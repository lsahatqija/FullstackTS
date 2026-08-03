# ADR 0005: Shared contracts contain only transport schemas

## Status

Accepted.

## Context

It is tempting to let the frontend import backend types directly to "save time", but this quietly
couples the frontend to internal backend representations (password hashes, ORM row shapes, domain
entities) and makes it impossible to change backend internals without breaking the frontend build.

## Decision

`packages/contracts` contains **only** Zod schemas (and their inferred TypeScript types) that
describe the wire format between the frontend and the API: auth requests/responses, the public
user shape, file metadata, pagination, the standard error envelope, and health responses. It
never exports password hashes, session tokens, database row types, ORM models, or backend domain
entities (e.g. the backend-internal `User` type with `passwordHash` lives only in
`apps/api/src/modules/users/user.types.ts`).

## Consequences

- Both apps depend on the same source of truth for request/response shapes, catching mismatches at
  compile time.
- Backend internals (database schema, ORM choice, domain entities) can change freely without
  affecting the contract package or the frontend.
- Mapping functions (e.g. `toPublicUser`) explicitly convert internal types to contract types at
  the service boundary, making the boundary visible in code review.
