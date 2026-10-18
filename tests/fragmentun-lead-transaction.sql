-- Run ONLY on a disposable Supabase test database after applying
-- supabase/migrations/20261018_fragmentun_lead_signature_replay_guard.sql.
-- Never run this script on production: it intentionally inserts a synthetic lead.
-- A successful run ends in ROLLBACK.
begin;

do $$
declare
  sig text := repeat('a',64);
  bad_sig text := repeat('b',64);
  test_email text := 'fragmentun-qa-transaction@example.invalid';
  lead jsonb;
  accepted_first boolean;
  accepted_again boolean;
  stored_id uuid;
  still_unused boolean;
begin
  lead := jsonb_build_object(
    'email',test_email,'name','QA transaction','locale','es',
    'consent_marketing',true,'consent_version','qa',
    'consented_at',now()::text,'mailerlite_status','pending',
    'emotional_scores','{}'::jsonb
  );

  -- A valid signature stores the synthetic lead only once.
  select accepted,lead_id into accepted_first,stored_id
    from public.fragmentun_store_signed_lead(sig,lead);
  if not accepted_first or stored_id is null then
    raise exception 'First signature not accepted';
  end if;
  select accepted into accepted_again
    from public.fragmentun_store_signed_lead(sig,lead);
  if accepted_again then raise exception 'Replay accepted unexpectedly'; end if;

  -- Invalid records must not consume signatures after a DB exception.
  begin
    perform public.fragmentun_store_signed_lead(bad_sig,lead || '{"locale":"xx"}'::jsonb);
    raise exception 'Invalid locale was unexpectedly accepted';
  exception when check_violation then
    null;
  end;

  select not exists(
    select 1 from public.fragmentun_lead_signature_replays where signature=bad_sig
  ) into still_unused;
  if not still_unused then raise exception 'Failed write consumed signature'; end if;

  -- Restore validity and retry: transaction must accept this signature.
  select accepted into accepted_first
    from public.fragmentun_store_signed_lead(bad_sig,lead);
  if not accepted_first then raise exception 'Legitimate retry was rejected'; end if;
end $$;

rollback;
