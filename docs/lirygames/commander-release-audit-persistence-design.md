# Commander Center — Release review audit persistence (design only)

Status: NOT DEPLOYED. No database modifications or grants are authorized by this document.

## Isolation prerequisites
- Target a separately provisioned and verified LIRYGAMES Supabase project, never the FRAGMENTUN project.
- Require `LIRYGAMES_COMMUNITY_DATA_ISOLATED=true` and a trusted server-side project-ID allowlist; do not rely on client-controlled environment variables alone.
- Block application writes until a separate database connection, roles, security review and explicit deployment approval are confirmed.

## Proposed append-only record
Each event must have a server-generated event UUID and recorded-at timestamp, and carry:
game_id, release_id, deployment_id, commit_sha, validation_run_id,
actor_user_id (from validated server session), reviewer_decision,
review_readiness, failure_reason_codes, correlation_id and event_schema_version.
No secrets, biometric material, ID scans or authorization tokens should be written.

## Enforcement requirements
- Use a dedicated private database schema not exposed to the Data API.
- Enable RLS as defense-in-depth and revoke all anonymous/client insert, update and delete privileges.
- Only a dedicated, tightly-scoped server-side write path can append events.
- Never accept actor_user_id, server timestamp, role, MFA or trusted evidence identifiers from request-body fields.
- Validate row ownership and release linkage against LIRYGAMES-owned tables.
- Explicitly deny UPDATE/DELETE even to ordinary application roles; plan separately for retention, lawful erasure and privileged administration.
- Add unique idempotency keys and transactionally append events; protect against duplicate review submissions.
- Use least-privilege grants, reviewed schema migrations, security advisors and negative integration tests before production.
- Audit entries are evidence of a decision, NOT authorization to publish. Keep the existing publication state transition blocked.

## Deferred verification checklist
1. Verify independent LIRYGAMES project identity and approved environments.
2. Review proposed migration and RLS/grants with security advisor.
3. Run isolated integration tests for blocked client writes, duplicate submissions and actor spoofing.
4. Verify rollback and retention policies.
5. Obtain explicit authorization before any migration, writes or actual publication activation.
