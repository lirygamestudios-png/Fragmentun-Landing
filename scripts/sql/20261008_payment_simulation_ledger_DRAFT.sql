-- DRAFT ONLY: DO NOT APPLY TO PRODUCTION OR EXISTING SUPABASE.
-- Sandbox checkout ledger, intentionally separate from shop_orders and game_entitlements.
create table if not exists public.game_payment_simulation_orders (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null check (length(idempotency_key) between 16 and 100),
  request_fingerprint text not null check (request_fingerprint ~ '^[a-f0-9]{64}$'),
  provider text not null check (provider in ('stripe','paypal','verifone_2checkout','crypto')),
  item_code text not null check (item_code in ('skin-demo','effect-demo')),
  currency text not null default 'USD' check (currency='USD'),
  amount_cents integer not null check (amount_cents in (299,499)),
  simulated_outcome text not null check (simulated_outcome in ('paid','failed','refunded')),
  reference text not null unique,
  created_at timestamptz not null default now(),
  constraint simulation_actor_key_unique unique (actor_user_id,idempotency_key)
);
alter table public.game_payment_simulation_orders enable row level security;
-- No anonymous policies. No write policies for authenticated roles:
-- Insert must be mediated by a privileged, audited backend after MFA and role checks.
revoke all on public.game_payment_simulation_orders from anon, authenticated;
comment on table public.game_payment_simulation_orders is
'Non-financial sandbox audit. Never a source of fulfilled entitlements or recognized revenue.';
-- Transaction behavior in server adapter:
-- (1) Insert on actor_user_id + idempotency_key UNIQUE.
-- (2) On conflict, SELECT original by same actor/key, compare request_fingerprint.
-- (3) Same fingerprint: return same simulated receipt. Different fingerprint: HTTP 409.
-- (4) Never grant entitlements or write shop_orders/game_purchase_events.
