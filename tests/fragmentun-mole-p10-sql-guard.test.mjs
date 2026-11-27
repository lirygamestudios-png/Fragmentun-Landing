import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../sql/FRAGMENTUN_P10_MOLE_RPC_REVIEW_ONLY.sql",import.meta.url),"utf8");

test("P10 SQL remains review only and requires no raw credentials in repository",()=>{
 assert.match(sql,/REVIEW ONLY\. DO NOT APPLY TO PRODUCTION/);
 assert.doesNotMatch(sql,/INSERT INTO fragmentun_integrations\.mole_credentials/);
 assert.doesNotMatch(sql,/secret_[A-Za-z0-9]{20,}/);
});
test("P10 secret enrollment requires hashing, expiry and revocation capability",()=>{
 assert.match(sql,/token_hash bytea PRIMARY KEY/);
 assert.match(sql,/sha256\(convert_to\(p_token,'UTF8'\)\)/);
 assert.match(sql,/enabled IS TRUE AND expires_at > now\(\)/);
 assert.match(sql,/enabled boolean NOT NULL DEFAULT false/);
});
test("P10 SQL denies unauthorized schema access and enforces FORCE RLS",()=>{
 assert.match(sql,/REVOKE ALL ON SCHEMA fragmentun_integrations FROM PUBLIC, anon, authenticated/);
 assert.match(sql,/REVOKE ALL ON TABLE fragmentun_integrations\.mole_credentials FROM PUBLIC, anon, authenticated/);
 assert.match(sql,/ALTER TABLE fragmentun_integrations\.mole_credentials FORCE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.fragmentun_mole_draft_upsert_v1\(text,jsonb,uuid\) FROM PUBLIC, authenticated/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.fragmentun_mole_draft_upsert_v1\(text,jsonb,uuid\) TO anon/);
});
test("P10 SQL revalidates editor membership on every write",()=>{
 assert.match(sql,/FROM public\.admin_profiles p/);
 assert.match(sql,/p\.user_id = v_editor AND p\.role IN \('admin','editor'\)/);
 assert.match(sql,/editor_not_authorized/);
});
test("P10 SQL rejects caller-supplied publication flags and only inserts as drafts",()=>{
 assert.match(sql,/jsonb_object_keys\(p_draft\)/);
 assert.match(sql,/published_es,published_en,published_at,updated_by/);
 assert.match(sql,/false,false,null,v_editor/);
 assert.doesNotMatch(sql,/EXECUTE .*\bDELETE\b/);
});
test("P10 SQL updates only drafts owned by the enrolled editor",()=>{
 assert.match(sql,/WHERE id=p_id AND updated_by=v_editor AND published_es IS FALSE/);
 assert.match(sql,/AND published_en IS FALSE AND published_at IS NULL/);
 assert.match(sql,/not_editable/);
});
