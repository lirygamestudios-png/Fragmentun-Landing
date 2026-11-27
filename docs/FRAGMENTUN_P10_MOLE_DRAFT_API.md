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

To prevent duplicate posts use the same unique slug. POST on an existing slug returns 409. Keep the returned ID for PATCH; a draft becomes non-editable through this integration if manually published, transferred to a different editor or marked with a publication timestamp. The public blog retains its existing RLS-based published-only read path. The database RPC must be reviewed and installed separately before any successful write is possible.

## Server-only configuration, NOT COMMITTED

The Preview branch must receive only **one new server-only variable** before activating the integration:
- `FRAGMENTUN_MOLE_TOKEN_SHA256`: SHA-256 hex digest of a unique high-entropy Bearer secret. Provide the raw token **only** to Mole through its secure credential field.

Use the existing FRAGMENTUN Supabase URL and **publishable** key for the connection. The API calls the dedicated PostgreSQL RPC `public.fragmentun_mole_draft_upsert_v1`; it never receives a Supabase service-role credential or an administrator session. SQL is supplied in `sql/FRAGMENTUN_P10_MOLE_RPC_REVIEW_ONLY.sql` and is **not applied**. The private credentials table must contain only a token hash and an approved real editor UUID, after a separate authorized enrollment.

**Security warning:** This draft-only database RPC is `SECURITY DEFINER`, which can bypass RLS depending on its database owner. Its allowlist, ownership conditions, and method scope therefore require independent review before enabling. This Preview branch contains **no service-role key**. The proposed SQL is review-only, and must not be applied to production without authorization. Add request rate limits, replay/abuse controls, explicit token expiration, audit and revocation tests before onboarding Mole.

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
4. Review and apply database RPC **only in an isolated authorized lab**; verify function grants and direct table denial; configure Preview-only hash and enroll a short-lived test token; test invalid/valid Bearer, create draft, repeat slug, edit own draft, reject forbidden fields, reject published or other-editor draft, verify public RLS and inspect DB rows.
5. Revoke a test token and prove rejection; verify public blog still only sees published content.
6. Approval before any production merge/deployment. Do not put a raw token in a commit, public link, test output or chat message.

Mole requires **only** the endpoint URL, raw Bearer token in its secure secret store, and this JSON contract. Mole must never receive a Supabase service key or an administrator password.
