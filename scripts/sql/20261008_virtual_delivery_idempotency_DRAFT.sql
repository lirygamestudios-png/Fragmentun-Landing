-- DRAFT ONLY: apply exclusively to an isolated development database after review.
-- Intended for REAL verified deliveries only. Simulation payments MUST NOT write here.
-- PostgreSQL uniqueness supplies atomic protection against concurrent repeat webhooks.
create table if not exists public.game_virtual_delivery_receipts (
 id uuid primary key default gen_random_uuid(),
 purchase_event_id uuid not null,
 game_id uuid not null,
 item_id uuid not null,
 player_ref text not null check(length(player_ref)>0),
 provider text not null check(provider in ('stripe','paypal','verifone_2checkout','crypto')),
 external_payment_id text not null check(length(external_payment_id)>0),
 state text not null default 'pending' check(state in ('pending','granted','revoked','review')),
 created_at timestamptz not null default now(),
 granted_at timestamptz,
 unique(purchase_event_id,game_id,item_id,player_ref),
 unique(provider,external_payment_id,game_id,item_id,player_ref)
);
alter table public.game_virtual_delivery_receipts enable row level security;
revoke all on public.game_virtual_delivery_receipts from anon,authenticated;
comment on table public.game_virtual_delivery_receipts is 'Draft atomic delivery deduplication. Not a payment-confirmation source; no public writes. Requires backend transactional workflow.';
