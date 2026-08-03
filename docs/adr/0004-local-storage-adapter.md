# ADR 0004: Local filesystem storage as an adapter, not part of the file service

## Status

Accepted.

## Context

Every real deployment eventually needs a different binary storage backend than "files on disk"
(S3, Azure Blob Storage, Google Cloud Storage, etc.). If the file service directly called
`fs.writeFile`, switching providers would require rewriting business logic (validation, ownership
checks, metadata persistence) alongside the storage mechanism.

## Decision

Define a small `FileStorage` interface (`save`, `get`, `getStream`, `delete`) in
`infrastructure/storage/file-storage.ts`. `LocalFileStorage` implements it for development, writing
files outside the source tree, under a directory that is Docker-volume-friendly and safe against
path traversal (validated, generated storage keys — never the original filename). `FileService`
depends only on the interface, injected via the composition root.

## Consequences

- A future `S3FileStorage`/`AzureBlobFileStorage` adapter can be dropped in by implementing the
  same four methods and swapping the instance in `apps/api/src/composition.ts`.
- Business rules (allowed types, size limits, ownership, metadata-vs-storage consistency) live in
  `FileService` exactly once, regardless of which storage backend is active.
- Local storage remains intentionally simple: no virus scanning, transcoding, or CDN integration —
  those are documented as future extension points, not implemented here.
