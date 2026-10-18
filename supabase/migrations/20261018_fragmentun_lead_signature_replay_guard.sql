-- Staged transaction-only implementation: apply before deploying the matching Edge Function.
-- This procedure atomically claims a signature and stores its lead.
-- A failed upsert rolls back the signature claim automatically.
create table if not exists public.fragmentun_lead_signature_replays (
  signature text primary key,
  accepted_at timestamptz not null default now(),
  constraint signature_hex_valid check (signature ~ '^[a-f0-9]{64}$')
);
revoke all on public.fragmentun_lead_signature_replays from public, anon, authenticated;

create or replace function public.fragmentun_store_signed_lead(p_signature text, p_lead jsonb)
returns table(accepted boolean, lead_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
  stored_id uuid;
begin
  if p_signature is null or p_signature !~ '^[a-f0-9]{64}$' or p_lead is null then
    return query select false, null::uuid;
    return;
  end if;

  insert into public.fragmentun_lead_signature_replays(signature)
    values (p_signature) on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then
    return query select false, null::uuid;
    return;
  end if;

  insert into public.leads (
    email,name,locale,source,medium,campaign,content,session_id,
    mailerlite_subscriber_id,consent_marketing,consent_version,consented_at,
    mailerlite_status,last_error,emotional_profile,emotional_scores
  )
  values (
    p_lead->>'email',p_lead->>'name',p_lead->>'locale',p_lead->>'source',
    p_lead->>'medium',p_lead->>'campaign',p_lead->>'content',p_lead->>'session_id',
    p_lead->>'mailerlite_subscriber_id',(p_lead->>'consent_marketing')::boolean,
    p_lead->>'consent_version',(p_lead->>'consented_at')::timestamptz,
    p_lead->>'mailerlite_status',p_lead->>'last_error',p_lead->>'emotional_profile',
    coalesce(p_lead->'emotional_scores','{}'::jsonb)
  )
  on conflict (email) do update set
    name=excluded.name,locale=excluded.locale,source=excluded.source,
    medium=excluded.medium,campaign=excluded.campaign,content=excluded.content,
    session_id=excluded.session_id,mailerlite_subscriber_id=excluded.mailerlite_subscriber_id,
    consent_marketing=excluded.consent_marketing,consent_version=excluded.consent_version,
    consented_at=excluded.consented_at,mailerlite_status=excluded.mailerlite_status,
    last_error=excluded.last_error,emotional_profile=excluded.emotional_profile,
    emotional_scores=excluded.emotional_scores
  returning id into stored_id;
  return query select true, stored_id;
end;
$$;
revoke all on function public.fragmentun_store_signed_lead(text,jsonb) from public, anon, authenticated;
grant execute on function public.fragmentun_store_signed_lead(text,jsonb) to service_role;

-- Maintenance plan (not scheduled): delete signatures older than 24h.
-- Existing signing enforces a 5-minute timestamp window.
