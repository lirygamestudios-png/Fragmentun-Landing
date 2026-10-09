-- BORRADOR. NO EJECUTAR EN SUPABASE PRODUCTIVO.
create table if not exists public.game_payment_settlement_batches (
 id uuid primary key default gen_random_uuid(),
 provider text not null check(provider in ('stripe','paypal','verifone_2checkout','crypto')),
 provider_settlement_reference text not null,
 currency text not null default 'USD' check(currency='USD'),
 gross_cents bigint not null check(gross_cents>=0),
 fee_cents bigint not null check(fee_cents>=0),
 refund_cents bigint not null check(refund_cents>=0),
 adjustment_cents bigint not null default 0,
 bank_deposit_cents bigint check(bank_deposit_cents is null or bank_deposit_cents>=0),
 bank_reference text,
 provider_report_verified_at timestamptz,
 bank_deposit_verified_at timestamptz,
 status text not null default 'pending' check(status in ('pending','review','reconciled')),
 created_at timestamptz not null default now(),
 unique(provider,provider_settlement_reference),
 constraint verified_bank_requires_reference check(bank_deposit_verified_at is null or (bank_reference is not null and bank_deposit_cents is not null)),
 constraint reconciliation_requires_evidence check(status<>'reconciled' or (provider_report_verified_at is not null and bank_deposit_verified_at is not null and bank_deposit_cents=gross_cents-fee_cents-refund_cents+adjustment_cents))
);
alter table public.game_payment_settlement_batches enable row level security;
revoke all on public.game_payment_settlement_batches from anon, authenticated;
comment on table public.game_payment_settlement_batches is 'Draft settlement ledger. No public access, requires audited trusted backend.';
