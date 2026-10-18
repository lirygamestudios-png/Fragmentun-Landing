-- Preparatory migration. Apply before enabling FRAGMENTUN_LEAD_AUTH_SECRET on both services.
-- One signature can be accepted only once, atomically across concurrent requests.
create table if not exists public.fragmentun_lead_signature_replays (
  signature text primary key,
  accepted_at timestamptz not null default now(),
  constraint signature_hex_valid check (signature ~ '^[a-f0-9]{64}$')
);
revoke all on public.fragmentun_lead_signature_replays from public, anon, authenticated;
create or replace function public.fragmentun_accept_lead_signature(p_signature text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  did_insert integer;
begin
  if p_signature is null or p_signature !~ '^[a-f0-9]{64}$' then
    return false;
  end if;
  insert into public.fragmentun_lead_signature_replays(signature)
  values (p_signature)
  on conflict do nothing;
  get diagnostics did_insert = row_count;
  return did_insert = 1;
end;
$$;
revoke all on function public.fragmentun_accept_lead_signature(text) from public, anon, authenticated;
grant execute on function public.fragmentun_accept_lead_signature(text) to service_role;
-- Operational cleanup: delete entries older than 24h using scheduled maintenance.
-- Never use a plain SELECT-then-INSERT check, which would race under concurrency.
