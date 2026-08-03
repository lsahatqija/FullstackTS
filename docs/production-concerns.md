# Production concerns not implemented in this template

This template intentionally stops short of production-hardening concerns that are highly specific
to your hosting environment and organization. Before deploying to production, address:

- **HTTPS termination** — this template runs plain HTTP locally and via Compose. Use a reverse
  proxy, load balancer, or platform-managed TLS in production, and set `SESSION_COOKIE_SECURE=true`.
- **Managed database** — the bundled PostgreSQL container is for local development only. Use a
  managed/HA Postgres instance (with backups) in production.
- **Object storage** — `LocalFileStorage` is a development adapter. Implement a `FileStorage`
  adapter backed by S3, Azure Blob Storage, or Google Cloud Storage for production (see ADR 0004).
- **Backup policy** — no backup automation is included for the database or uploaded files.
- **Secret management** — `.env` files are for local development only. Use a secret manager (cloud
  provider secret store, Vault, etc.) in production instead of plain environment files.
- **Monitoring, metrics and tracing** — only structured request/error logging is included. No
  hosted logging, metrics, tracing, analytics, or error-reporting provider is wired up.
- **Horizontal scaling of sessions** — sessions are stored in Postgres (not in-memory), so multiple
  API instances already share session state; however, no load balancer or autoscaling
  configuration is provided.
