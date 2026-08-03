# ADR 0001: Modular monolith instead of microservices

## Status

Accepted.

## Context

This template is meant to bootstrap many future projects that typically start with a small team,
a single deployable surface, and modest scale requirements. Microservices introduce network
boundaries, independent deployments, service discovery and distributed-failure handling — costs
that are rarely justified before a product has proven traction and a team large enough to own
multiple services.

## Decision

Ship a single Express API process (`apps/api`) organized internally as feature modules
(`modules/auth`, `modules/users`, `modules/files`, `modules/system`) with clear boundaries between
routes, controllers, services and repositories, plus a single Next.js frontend process
(`apps/web`). Both are independently deployable containers, but there is exactly one backend
process and one frontend process.

## Consequences

- Simpler local development, debugging and deployment.
- Feature modules can later be extracted into separate services if genuinely needed, because they
  already communicate through explicit interfaces (services depend on repository interfaces, not
  on each other's internals).
- No distributed transaction, service-mesh, or message-queue complexity to maintain.
