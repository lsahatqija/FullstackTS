# ADR 0002: Feature-specific repository interfaces instead of a generic persistence API

## Status

Accepted.

## Context

A generic `BaseRepository<T>` or a universal query API is tempting because it reduces boilerplate,
but it tends to leak SQL-specific concepts (filters, joins, pagination internals) into service code
and makes it hard to express business-meaningful operations. It also makes swapping the
persistence provider harder, not easier, because callers become coupled to the generic query
shape rather than to the business operation they actually need.

## Decision

Each feature defines a narrow, business-oriented repository interface, for example:

```ts
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserData): Promise<User>;
  update(id: string, input: UpdateUserData): Promise<User>;
}
```

PostgreSQL adapters (`adapters/postgres-*.repository.ts`) implement these interfaces using Drizzle
ORM. Repositories never depend on Express request/response objects.

## Consequences

- Services depend on small, explicit contracts instead of a generic query surface.
- A different persistence provider (another SQL database, a document store, etc.) can be
  supported by writing a new adapter that implements the same interface — no service or
  controller changes required.
- Some duplication across repository interfaces (e.g. similar `findById` shapes) is accepted in
  exchange for clarity and decoupling.
