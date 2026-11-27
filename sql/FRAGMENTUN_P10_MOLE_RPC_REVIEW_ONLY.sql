-- FRAGMENTUN P10: REVIEW ONLY. DO NOT APPLY TO PRODUCTION DATABASE.
-- The draft-only RPC does not require a service-role credential in Vercel.
-- Requires PostgreSQL with built-in sha256(bytea). No credential is created.
-- Staging design only: execute in a disposable database, not the live FRAGMENTUN Supabase project.
-- A successful SQL parse or static contract test does NOT prove RLS isolation.
BEGIN;
CREATE SCHEMA IF NOT EXISTS fragmentun_integrations;
REVOKE ALL ON SCHEMA fragmentun_integrations FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS fragmentun_integrations.mole_credentials (
  token_hash bytea PRIMARY KEY CHECK (octet_length(token_hash) = 32),
  editor_user_id uuid NOT NULL REFERENCES auth.users(id),
  enabled boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE fragmentun_integrations.mole_credentials FROM PUBLIC, anon, authenticated;
ALTER TABLE fragmentun_integrations.mole_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragmentun_integrations.mole_credentials FORCE ROW LEVEL SECURITY;

-- SECURITY DEFINER must be owned by an approved privileged DB role; verify owner\n-- and FORCE RLS behavior in a disposable database before applying.\nCREATE OR REPLACE FUNCTION public.fragmentun_mole_draft_upsert_v1(
 p_token text, p_draft jsonb, p_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
 SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
 v_editor uuid;
 v_slug text;
 v_title_es text;
 v_title_en text;
 v_excerpt_es text;
 v_excerpt_en text;
 v_body_es text;
 v_body_en text;
 v_image text;
 v_id uuid;
 v_keys text[] := ARRAY['slug','title_es','title_en','excerpt_es','excerpt_en','body_es','body_en','image_url'];
BEGIN
 IF p_token IS NULL OR length(p_token) < 32 OR length(p_token) > 256
    OR p_token !~ '^[A-Za-z0-9._~-]+$' THEN
  RAISE EXCEPTION 'unauthorized' USING ERRCODE='28000';
 END IF;
 SELECT editor_user_id INTO v_editor
 FROM fragmentun_integrations.mole_credentials
 WHERE token_hash = sha256(convert_to(p_token,'UTF8'))
   AND enabled IS TRUE AND expires_at > now();
 IF v_editor IS NULL THEN RAISE EXCEPTION 'unauthorized' USING ERRCODE='28000'; END IF;
 -- The enrolled identity must still be an active editorial member.
 -- Revoking the admin_profiles role immediately stops further Mole writes.
 IF NOT EXISTS (
   SELECT 1 FROM public.admin_profiles p
   WHERE p.user_id = v_editor AND p.role IN ('admin','editor')
 ) THEN
   RAISE EXCEPTION 'editor_not_authorized' USING ERRCODE='28000';
 END IF;
 IF p_draft IS NULL OR jsonb_typeof(p_draft) <> 'object'
    OR EXISTS (SELECT 1 FROM jsonb_object_keys(p_draft) k WHERE k <> ALL(v_keys)) THEN
  RAISE EXCEPTION 'invalid_draft' USING ERRCODE='22023';
 END IF;
 -- Reject non-string values even when text coercion might look valid.
 IF EXISTS (SELECT 1 FROM unnest(v_keys) k
            WHERE k <> 'image_url' AND
            (NOT p_draft ? k OR jsonb_typeof(p_draft->k) <> 'string'))
    OR (p_draft ? 'image_url' AND jsonb_typeof(p_draft->'image_url') NOT IN ('string','null')) THEN
   RAISE EXCEPTION 'invalid_draft' USING ERRCODE='22023';
 END IF;
 v_slug := btrim(p_draft->>'slug');
 v_title_es := btrim(p_draft->>'title_es');
 v_title_en := btrim(p_draft->>'title_en');
 v_excerpt_es := btrim(p_draft->>'excerpt_es');
 v_excerpt_en := btrim(p_draft->>'excerpt_en');
 v_body_es := btrim(p_draft->>'body_es');
 v_body_en := btrim(p_draft->>'body_en');
 v_image := nullif(btrim(coalesce(p_draft->>'image_url','')),'');
 IF v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR length(v_slug)>90 OR
   length(v_title_es) NOT BETWEEN 1 AND 180 OR length(v_title_en) NOT BETWEEN 1 AND 180 OR
   length(v_excerpt_es)>400 OR length(v_excerpt_en)>400 OR
   length(v_body_es) NOT BETWEEN 1 AND 50000 OR length(v_body_en) NOT BETWEEN 1 AND 50000 OR
   (v_image IS NOT NULL AND (length(v_image)>1000 OR
      (v_image !~ '^https://[^[:space:]]+$' AND v_image !~ '^/[A-Za-z0-9_.-][A-Za-z0-9/_.-]*))) THEN
   RAISE EXCEPTION 'invalid_draft' USING ERRCODE='22023';
 END IF;
 IF p_id IS NULL THEN
   INSERT INTO public.fragmentun_blog_posts
   (slug,title_es,title_en,excerpt_es,excerpt_en,body_es,body_en,image_url,
    published_es,published_en,published_at,updated_by)
   VALUES (v_slug,v_title_es,v_title_en,v_excerpt_es,v_excerpt_en,v_body_es,v_body_en,v_image,
    false,false,null,v_editor)
   RETURNING id INTO v_id;
 ELSE
   UPDATE public.fragmentun_blog_posts SET
    title_es=v_title_es,title_en=v_title_en,
    excerpt_es=v_excerpt_es,excerpt_en=v_excerpt_en,
    body_es=v_body_es,body_en=v_body_en,image_url=v_image,
    updated_at=now()
   WHERE id=p_id AND slug=v_slug AND updated_by=v_editor AND published_es IS FALSE
     AND published_en IS FALSE AND published_at IS NULL
   RETURNING id INTO v_id;
   IF v_id IS NULL THEN RAISE EXCEPTION 'not_editable' USING ERRCODE='P0002'; END IF;
 END IF;
 RETURN jsonb_build_object('id',v_id,'slug',v_slug);
END;
$function$;
REVOKE ALL ON FUNCTION public.fragmentun_mole_draft_upsert_v1(text,jsonb,uuid) FROM PUBLIC, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fragmentun_mole_draft_upsert_v1(text,jsonb,uuid) TO anon;
COMMIT;

-- Credential enrollment must be performed separately, only after review:
--   - Generate a fresh high-entropy secret outside chat and commit history.
--   - Insert only sha256(convert_to(token,'UTF8')), real editor UUID, expires_at, enabled=true.
--   - Store matching hash in Vercel's Preview-only FRAGMENTUN_MOLE_TOKEN_SHA256.
--   - Store raw token only in Mole's secured credentials vault.
-- NEVER put raw credentials into SQL files, logs, chat or GitHub.
-- Mandatory live-negative verification: anon without token cannot create, edit or publish;
-- revoked editor and expired token fail; published, foreign and renamed slugs cannot update.
-- Runtime abuse throttling and audit logging are NOT yet implemented: activation blocked.
))) THEN
   RAISE EXCEPTION 'invalid_draft' USING ERRCODE='22023';
 END IF;
 IF p_id IS NULL THEN
   INSERT INTO public.fragmentun_blog_posts
   (slug,title_es,title_en,excerpt_es,excerpt_en,body_es,body_en,image_url,
    published_es,published_en,published_at,updated_by)
   VALUES (v_slug,v_title_es,v_title_en,v_excerpt_es,v_excerpt_en,v_body_es,v_body_en,v_image,
    false,false,null,v_editor)
   RETURNING id INTO v_id;
 ELSE
   UPDATE public.fragmentun_blog_posts SET
    title_es=v_title_es,title_en=v_title_en,
    excerpt_es=v_excerpt_es,excerpt_en=v_excerpt_en,
    body_es=v_body_es,body_en=v_body_en,image_url=v_image,
    updated_at=now()
   WHERE id=p_id AND slug=v_slug AND updated_by=v_editor AND published_es IS FALSE
     AND published_en IS FALSE AND published_at IS NULL
   RETURNING id INTO v_id;
   IF v_id IS NULL THEN RAISE EXCEPTION 'not_editable' USING ERRCODE='P0002'; END IF;
 END IF;
 RETURN jsonb_build_object('id',v_id,'slug',v_slug);
END;
$function$;
REVOKE ALL ON FUNCTION public.fragmentun_mole_draft_upsert_v1(text,jsonb,uuid) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.fragmentun_mole_draft_upsert_v1(text,jsonb,uuid) TO anon;
COMMIT;

-- Credential enrollment must be performed separately, only after review:
--   - Generate a fresh high-entropy secret outside chat and commit history.
--   - Insert only sha256(convert_to(token,'UTF8')), real editor UUID, expires_at, enabled=true.
--   - Store matching hash in Vercel's Preview-only FRAGMENTUN_MOLE_TOKEN_SHA256.
--   - Store raw token only in Mole's secured credentials vault.
-- NEVER put raw credentials into SQL files, logs, chat or GitHub.
