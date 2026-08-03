# Fullstack TS Template

A reusable full-stack TypeScript template: an Express 5 API, a Next.js App Router frontend, and a
PostgreSQL database, organized as a modular monolith. It ships with minimal "Hello World"
functionality (register/login, a protected dashboard, and image upload) that exercises every major
architectural piece so you can build real features on top of it with confidence.

## Template purpose

This repository is a starting point for new projects, not a finished product. It intentionally
contains only the minimum functionality needed to prove that authentication, persistence, file
storage, validation, error handling, logging and Docker infrastructure all work together end to
end. Automated testing is deliberately not set up (see [Intentional exclusions](#intentional-exclusions)).

## Prerequisites

- Node.js >= 20.11
- pnpm >= 9 (`corepack enable` will install the pinned version automatically)
- Docker and Docker Compose (for the database and/or full-stack workflow)

## Installation

```bash
pnpm install
```

This also builds `packages/contracts` once (via `postinstall`) so both apps can resolve it.

## Environment setup

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

Backend-only variables (database URL, session secret, upload limits, etc.) are validated on API
startup and are never read ad hoc from `process.env` elsewhere in the code — see
`apps/api/src/config/env.ts`. Only variables prefixed `NEXT_PUBLIC_` are exposed to the browser;
everything else in `apps/web` stays server-side (see `apps/web/src/lib/config/env.ts`).

## Local development

### Hybrid workflow (recommended): Postgres in Docker, apps run locally with hot reload

```bash
pnpm docker:up      # starts only the postgres service
pnpm db:migrate
pnpm db:seed        # optional: creates development-only users
pnpm dev            # runs the API and the web app in parallel, both with hot reload
```

- API: http://localhost:4000
- API docs (Swagger UI, development only): http://localhost:4000/api/docs
- Web app: http://localhost:3000

You can also run each app individually: `pnpm dev:api` or `pnpm dev:web`.

### Full Docker workflow

```bash
pnpm docker:up   # or: docker compose up -d --build
```

This starts Postgres, the API and the web app as containers. Run migrations/seed against the
containerized database with `pnpm db:migrate` / `pnpm db:seed` (they use `DATABASE_URL` from your
local `.env`, which should point at `localhost:5432` when Postgres's port is published).

## Production build

```bash
pnpm build       # builds packages/contracts, apps/api and apps/web
pnpm typecheck
pnpm lint
```

Each app also has a standalone Dockerfile (`apps/api/Dockerfile`, `apps/web/Dockerfile`) producing
a multi-stage, non-root production image.

## Repository structure

```
apps/
  api/     Express 5 modular-monolith backend
  web/     Next.js App Router frontend
packages/
  contracts/      Shared Zod transport schemas (source of truth for request/response types)
  config/         Shared base tsconfig
  eslint-config/  Shared ESLint flat config
infrastructure/
  docker/         Reserved for extra infra assets (Dockerfiles live next to each app)
docs/              Architecture decision records and production-concerns notes
```

## Request flow

```
Route → middleware → controller → service → repository / infrastructure adapter
```

- **Routes** declare endpoints and attach middleware.
- **Controllers** translate HTTP input into service calls and service results into HTTP responses.
  They never touch the database directly.
- **Services** hold use-case/business logic and depend on repository/storage interfaces, not
  concrete adapters.
- **Repositories** define feature-specific persistence operations; **adapters** (e.g.
  `PostgresUserRepository`) implement them and never depend on Express request/response objects.

## Authentication flow

1. `POST /api/v1/auth/register` or `/login` validates input, hashes/verifies the password with
   Argon2id, and creates an opaque, cryptographically random session token.
2. Only a SHA-256 hash of the token is stored in the `sessions` table; the raw token is sent to the
   browser in a `Secure` (in production), `HttpOnly`, `SameSite=Lax` cookie — never in
   `localStorage`.
3. `requireAuth` middleware reads the cookie, hashes it, loads the session, checks expiry/revocation,
   and attaches the resulting public user to `req.authUser`.
4. `GET /api/v1/auth/me` returns the current user (or `null`) and is what the frontend uses to
   authoritatively decide whether a visitor is signed in — see `getServerUser()` in
   `apps/web/src/lib/auth/get-server-user.ts`, called from the `(authenticated)` layout before any
   protected content renders (no flash of protected content).
5. `POST /api/v1/auth/logout` revokes the session server-side and clears the cookie.

### Extending authentication later

The controller/service/repository boundaries are designed so you can add, without changing them:

- **OAuth/social login**: add a new `oauth.service.ts` that still calls the same
  `SessionRepository`/`UserRepository` to create sessions and users.
- **MFA**: add a verification step inside `AuthService.login` before issuing a session.
- **Email verification / password reset**: add columns + repository methods on `UserRepository`
  and new routes in the `auth` module; no controller/service contracts need to change shape.

## Database migrations

Schema lives in `apps/api/src/infrastructure/database/schema.ts` (Drizzle ORM). After changing it:

```bash
pnpm --filter @template/api run db:generate   # generates a new SQL migration file
pnpm db:migrate                                # applies pending migrations
```

## Database seeding

```bash
pnpm db:seed
```

Creates one development admin and one development user (credentials configurable via
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`). The seed
script refuses to run when `NODE_ENV=production`.

## File-storage behavior

Uploads go through `POST /api/v1/files` (multipart, authenticated, single `file` field). The file
service:

1. Checks the declared MIME type against an allowlist, then inspects the actual bytes
   (`file-type`) to confirm it really is an allowed image type.
2. Generates a random storage key (never the original filename) and saves the binary via the
   `FileStorage` interface — implemented by `LocalFileStorage` for development, storing files
   outside the source tree (`UPLOAD_DIR`, mounted as a Docker volume).
3. Persists metadata (owner, storage key, original name, mime type, size) in Postgres; if that
   fails, the just-saved binary is deleted to avoid orphaned files.
4. Serves content only through `GET /api/v1/files/:id/content`, which enforces ownership and sets
   an explicit `Content-Type`/`Content-Disposition` — the upload directory is never served via
   plain `express.static`.

To replace local storage with S3/Azure Blob/GCS, implement `FileStorage` in a new adapter and swap
it in `apps/api/src/composition.ts`; no controller or service code changes.

## API documentation

- OpenAPI JSON: `GET /api/v1/openapi.json`
- Swagger UI (development only): `http://localhost:4000/api/docs`

## Adding a feature module

1. Create `apps/api/src/modules/<feature>/` with `*.routes.ts`, `*.controller.ts`, `*.service.ts`,
   `*.repository.ts`, `*.types.ts`, and `adapters/postgres-<feature>.repository.ts`.
2. Add any transport schemas to `packages/contracts` if the frontend needs them.
3. Wire the repository/service/controller together in `apps/api/src/composition.ts`.
4. Mount the router in `apps/api/src/routes.ts` under `/api/v1`.

## Adding a route

Add a handler method to the relevant controller, then register it on the module's `*.routes.ts`
router, attaching any required middleware (`requireAuth`, `requireRole`, rate limiters, etc.).

## Adding a service

Create a class in `<feature>.service.ts` that receives its repository/infrastructure dependencies
via constructor parameters. Keep HTTP concerns (status codes, cookies, headers) out of services.

## Adding a repository

Define a narrow, business-oriented interface in `<feature>.repository.ts` (avoid a generic
`BaseRepository<T>`), then implement it under `adapters/` for the persistence provider you need.

## Replacing the PostgreSQL adapter

Implement the relevant repository interfaces (`UserRepository`, `SessionRepository`,
`FileRepository`) against your chosen store, then swap the instances created in
`apps/api/src/composition.ts`. Services and controllers are unaffected.

## Replacing local file storage

Implement the `FileStorage` interface (`save`, `get`, `getStream`, `delete`) in a new adapter (e.g.
`S3FileStorage`) and construct it instead of `LocalFileStorage` in `apps/api/src/composition.ts`.

## Common troubleshooting

- **API fails to start with a configuration error** — check `.env` against `.env.example`; the API
  validates configuration and refuses to start if anything required is missing or malformed.
- **`ECONNREFUSED` to Postgres** — ensure `pnpm docker:up` is running and `DATABASE_URL` matches the
  exposed port.
- **Cookies not being sent from the frontend** — confirm `NEXT_PUBLIC_API_URL`/`API_INTERNAL_URL`
  and `CORS_ALLOWED_ORIGINS` agree on protocol/host, and that both apps are served from the same
  site (cookies use `SameSite=Lax`).
- **Uploaded files disappear after a restart** — make sure `UPLOAD_DIR` is a mounted volume, not an
  ephemeral container path.

## Intentional exclusions

This template deliberately does **not** include: automated tests, microservices, message queues,
background workers, Redis, WebSockets, GraphQL, search engines, event sourcing, CQRS,
multi-tenancy, payments, email/SMS delivery, OAuth/social login, MFA, push notifications,
analytics, feature-flag services, audit-history systems, complex caching, Kubernetes, Terraform,
cloud-specific deployment, cloud storage adapters, virus scanning, media processing,
internationalization content, generated admin panels, large UI frameworks, elaborate permission
systems, or generic plugin systems. See `docs/` for architecture decisions and unimplemented
production concerns.
