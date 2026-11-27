# FRAGMENTUN BLOG — P10 Mole draft-only integration

Status: **disabled by default**. This file describes a **staging candidate**, not production authorization.

## HTTP contract

Endpoint: `POST /api/integrations/mole/drafts` (create) or `PATCH /api/integrations/mole/drafts` (edit an existing Mole-owned unpublished draft).

Headers:
- `Authorization: Bearer <random-token>` (32-256 permitted characters; pass through a secret store)
- `Content-Type: application/json`

Required JSON properties for POST: `slug`, `title_es`, `title_en`, `excerpt_es`, `excerpt_en`, `body_es`, `body_en`; optional `image_url` (empty string or null permitted). PATCH requires the same full payload plus a valid `id` UUID. Extra properties are rejected, including `published_es`, `published_en`, `updated_by`, `published_at`, or `created_at`. This API **does not support** partial PATCH.

Successful POST: HTTP 201 with `{"status":"draft_created","data":{"id":"...","slug":"..."}}`.
Successful PATCH: HTTP 200 with `{"status":"draft_updated","data":{"id":"...","slug":"..."}}`.
Failure examples: 401 invalid Bearer, 503 not configured, 400 invalid body, 409 duplicate slug or non-editable draft.

To prevent duplicate posts use the same unique slug. POST on an existing slug returns 409. Keep the returned ID for PATCH; a draft becomes non-editable through this integration if manually published, transferred to a different editor or marked with a publication timestamp. The public blog retains its existing RLS-based published-only read path.

## Server-only configuration, NOT COMMITTED

The Preview branch must explicitly receive these **server-only** environment variables before activating the integration:
- `FRAGMENTUN_MOLE_TOKEN_SHA256`: lowercase SHA-256 hex digest of a unique 32+ character random Bearer secret. The raw token is provided **only** to Mole through its secure credential field.
- `FRAGMENTUN_MOLE_EDITOR_UUID`: approved, real editor user UUID from Supabase. Do not fabricate a UUID.
- `FRAGMENTUN_MOLE_SUPABASE_SERVICE_ROLE_KEY`: Supabase server-only privileged key, stored as an encrypted Vercel server secret. Never use `NEXT_PUBLIC_` for this credential and never send it to Mole.

**Security warning:** A Supabase service-role credential is privileged and bypasses RLS. It is only used inside the route; the Bearer token grants only the route's narrow API operations, not direct database access. Before enabling this candidate outside an isolated Preview, prefer replacing the service-role access with an explicitly scoped, database-enforced write interface. Review token rotation, audit logging, abuse controls and deployment protection first.

## Safeguards

- Disabled by default; Bearer token hash required; timing-safe comparison.
- GET, PUT, DELETE rejected; all publication fields rejected; POST always inserts unpublished.
- Updates require matching writer identity and an *unpublished* state using an atomic database UPDATE condition.
- Input is allowlisted and bounded (125 KB request size). English/Spanish titles and bodies required.
- Existing interactive administrator session, MFA routes, landing, and production domain are unchanged.

## Required validation before giving Mole access

1. Vercel Preview build READY for branch `work/fragmentun-mole-editorial-p10`.
2. Local contract test `node --test tests/fragmentun-mole-p10-contract.test.mjs` and project build.
3. Without server secrets: reject Bearer requests and do not create DB rows.
4. After explicitly configuring Preview-only secrets: test invalid/valid Bearer, create draft, repeat slug, edit own draft, reject forbidden fields, reject published or other-editor draft, verify RLS and inspect DB rows.
5. Revoke a test token and prove rejection; verify public blog still only sees published content.
6. Approval before any production merge/deployment. Do not put a raw token in a commit, public link, test output or chat message.

Mole requires **only** the endpoint URL, raw Bearer token in its secure secret store, and this JSON contract. Mole must never receive a Supabase service key or an administrator password.
