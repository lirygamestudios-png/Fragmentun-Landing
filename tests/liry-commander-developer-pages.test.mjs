import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const text=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const pages=[
 "app/admin/master/developers/page.tsx",
 "app/admin/master/developers/dossier/page.tsx",
 "app/admin/master/developers/review/page.tsx",
 "app/admin/master/integrations/providers/page.tsx"
];

test("all LIRYGAMES developer admin pages enforce session, admin role and MFA",()=>{
 for(const path of pages){
  const source=text(path);
  assert.match(source,/auth\.getUser\(\)/,path);
  assert.match(source,/profile\.role\s*!==\s*"admin"/,path);
  assert.match(source,/hasSatisfiedMfa\(supabase\)/,path);
  assert.match(source,/redirect\("\/admin\/lirygames\/login"\)/,path);
 }
});

test("new developer administration pages do not initiate live external provider operations",()=>{
 for(const path of pages){
  const source=text(path);
  assert.doesNotMatch(source,/fetch\s*\(|\.from\(["'](?:developer_applications|developer_verifications)["']\)/,path);
  assert.doesNotMatch(source,/(?:stripe\.transfers\.create|stripe\.paymentIntents\.create|paypal\.payouts\.create)/,path);
 }
});

test("Commander sidebar provides direct route to Liry Developers",()=>{
 const sidebar=text("components/MasterSidebar.tsx");
 assert.match(sidebar,/\/admin\/master\/developers","◇","Liry Developers"/);
});

test("Liry Developers links dossier, review, and provider readiness",()=>{
 const entry=text(pages[0]);
 for(const route of ["/admin/master/developers/dossier","/admin/master/developers/review","/admin/master/integrations/providers"]){
  assert.ok(entry.includes(route),route);
 }
});

test("identity release policy remains explicitly disabled",()=>{
 assert.match(text("lib/games/liry-developer-identity-policy.ts"),/LIRY_DEVELOPER_IDV_ENABLED\s*=\s*false/);
});

test("read-only pages do not include application submission forms",()=>{
 for(const path of pages)assert.doesNotMatch(text(path),/<form\b|<button\b/);
});

test("Commander navigation keeps FRAGMENTUN links out of LIRYGAMES UI",()=>{
 const sidebar=text("components/MasterSidebar.tsx");
 const home=text("app/admin/master/page.tsx");
 assert.ok(!sidebar.includes('href="/admin"') && !sidebar.includes('href="/es"'));
 assert.doesNotMatch(sidebar,/FRAGMENTUN Admin|Ver web pública/);
 assert.ok(sidebar.includes('href="/lirygames"'));
 assert.doesNotMatch(home,/title:"FRAGMENTUN"/);
});

test("sensitive provider screens remain informational and links stay in LIRYGAMES",()=>{
 const source=text("app/admin/master/integrations/providers/page.tsx");
 assert.match(source,/CUENTA ABIERTA · CONEXIÓN NO VERIFICADA/);
 assert.match(source,/Ninguna operación real autorizada/);
 assert.ok(!source.includes('href="/admin"'));
});

test("integration overview prevents reading shared FRAGMENTUN datasets",()=>{
 const source=text("app/admin/master/integrations/page.tsx");
 const gate=source.indexOf('const isolated=process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED==="true"');
 const read=source.indexOf('supabase.from("integration_logs")');
 assert.ok(gate>=0 && read>gate,"isolation gate must precede integrations queries");
 assert.ok(source.includes('endpoint.includes("pasoapugmsazziflaomp")'));
 assert.ok(source.includes('Consultas a integraciones suspendidas'));
});

test("Growth and Data reject shared database access for reads and mutations",()=>{
 for(const route of ["growth","data"]){
  const source=text("app/admin/master/"+route+"/page.tsx");
  assert.match(source,/function requireIsolatedLirygamesData\(\)/);
  assert.match(source,/requireIsolatedLirygamesData\(\);\s*const supabase=await createSupabaseServerClient\(\)/);
  assert.match(source,/LIRYGAMES_COMMUNITY_DATA_ISOLATED/);
  assert.match(source,/endpoint\.includes\("pasoapugmsazziflaomp"\)/);
  const fn=source.indexOf("export default async function");
  const gate=source.indexOf('process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED!=="true"',fn);
  const data=source.indexOf('supabase.from("analytics_events")',fn);
  assert.ok(gate>=0 && data>gate,"isolation gate precedes analytics reads");
 }
});

test("Finance and Commerce remain isolated from FRAGMENTUN",()=>{
 const finance=text("app/admin/master/finance/page.tsx");
 const commerce=text("app/admin/master/commerce/page.tsx");
 assert.ok(finance.includes('requireIsolatedFinanceData();'));
 assert.ok(finance.includes('LIRYGAMES_FINANCE_DATA_NOT_ISOLATED'));
 for(const source of [finance,commerce]){
  const page=source.indexOf('export default async function');
  const gate=source.indexOf('LIRYGAMES_COMMUNITY_DATA_ISOLATED',page);
  const firstBusinessRead=source.indexOf('supabase.from("shop_orders")',page);
  assert.ok(page>=0 && gate>page && firstBusinessRead>gate);
 }
});

test("Operations, Games and Publishing block shared data reads and server mutations",()=>{
 for(const domain of ["operations","games","publishing"]){
  const source=text("app/admin/master/"+domain+"/page.tsx");
  assert.match(source,/function requireIsolatedCommanderData\(\)/);
  assert.match(source,/LIRYGAMES_COMMANDER_DATA_NOT_ISOLATED/);
  const editor=source.indexOf('requireIsolatedCommanderData();');
  const auth=source.indexOf('const supabase=await createSupabaseServerClient();',editor);
  assert.ok(editor>=0&&auth>editor,domain+" mutation guard precedes DB client");
  const page=source.indexOf('export default async function');
  const gate=source.indexOf('process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED!=="true"',page);
  const query=source.indexOf('supabase.from(',source.indexOf('if(!profile) redirect(',page)+1);
  assert.ok(page>=0&&gate>page&&query>gate,domain+" read guard precedes domain queries");
 }
});

test("Sensitive Commander modules deny shared backend reads and mutations",()=>{
 for(const domain of ["automation","people","legal","security"]){
  const source=text("app/admin/master/"+domain+"/page.tsx");
  assert.match(source,/function requireIsolatedCommanderData\(\)/);
  assert.match(source,/LIRYGAMES_COMMANDER_DATA_NOT_ISOLATED/);
  const editor=source.indexOf("requireIsolatedCommanderData();");
  const editorAuth=source.indexOf("const supabase=await createSupabaseServerClient();",editor);
  assert.ok(editor>=0 && editorAuth>editor,"server action must deny shared backend: "+domain);
  const page=source.indexOf("export default async function");
  const gate=source.indexOf('process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED!=="true"',page);
  const businessQuery=source.indexOf('supabase.from(',source.indexOf('if(!profile) redirect(',page)+1);
  assert.ok(page>=0 && gate>page && businessQuery>gate,"page must gate domain queries: "+domain);
 }
});

test("Business oversight modules refuse shared backend reads and mutations",()=>{
 for(const domain of ["risk","strategy","capital","partners","suppliers","brand"]){
  const src=text("app/admin/master/"+domain+"/page.tsx");
  assert.match(src,/LIRYGAMES_COMMANDER_DATA_NOT_ISOLATED/);
  assert.ok(src.includes("requireIsolatedCommanderData();"),domain);
  const page=src.indexOf("export default async function");
  const gate=src.indexOf('process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED!=="true"',page);
  const firstRead=src.indexOf('supabase.from(',src.indexOf('if(!profile) redirect(',page)+1);
  assert.ok(gate>page&&firstRead>gate,domain);
 }
});

test("Audit, Maintenance and Backups do not read shared project records",()=>{
 for(const domain of ["audit","maintenance","backups"]){
  const src=text("app/admin/master/"+domain+"/page.tsx");
  const page=src.indexOf("export default async function");
  const gate=src.indexOf('process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED!=="true"',page);
  const query=src.indexOf('supabase.from(',src.indexOf('if(!profile',page)+1);
  assert.ok(page>=0&&gate>page&&query>gate,domain);
  assert.match(src,/endpoint|NEXT_PUBLIC_SUPABASE_URL/);
 }
});

test("Live Commander API requires context-bound MFA and isolated data",()=>{
 const source=text("app/api/admin/master/live/route.ts");
 assert.match(source,/isolatedLiryData\(\)/);
 assert.match(source,/hasSatisfiedMfa\(supabase\)/);
 assert.match(source,/liry_mfa_context/);
 assert.match(source,/admin_mfa_context_sessions/);
 assert.match(source,/token_hash/);
 assert.match(source,/lirygames_commander/);
 assert.match(source,/lirygames_mfa_required/);
 assert.match(source,/profile\.role!=="admin"/);
});

test("LIRYGAMES contact API refuses writes before isolation gate",()=>{
 const src=text("app/api/admin/lirygames-contact/route.ts");
 const route=src.indexOf("export async function PATCH");
 const gate=src.indexOf('process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED!=="true"',route);
 const client=src.indexOf("const supabase=await createSupabaseServerClient();",route);
 assert.ok(route>=0&&gate>route&&client>gate);
 assert.match(src,/lirygames_data_isolation_pending/);
 assert.match(src,/liry_mfa_context/);
});

test("Commander MFA validates factor ownership before challenging",()=>{
 const src=text("app/api/admin/lirygames/mfa/verify/route.ts");
 const factor=src.indexOf("const factor=(factors.data?.totp||[])");
 const challenge=src.indexOf("const challenge=await supabase.auth.mfa.challenge");
 assert.ok(factor>=0&&challenge>factor);
 assert.ok(src.includes('error:"wrong_factor"'));
 assert.ok(src.includes('const CONTEXT="lirygames_commander"'));
});

test("LIRYGAMES logout never returns success on auth sign-out error",()=>{
 const source=text("app/api/admin/lirygames/logout/route.ts");
 assert.match(source,/const\{error:signOutError\}=await supabase\.auth\.signOut\(\)/);
 assert.match(source,/error:"logout_failed"/);
 assert.match(source,/status:signOutError\?500:200/);
 assert.match(source,/liry_mfa_context/);
 assert.match(source,/Cache-Control/);
});

test("Commander logout UI handles API failures without claiming success",()=>{
 const src=text("components/MasterSidebar.tsx");
 assert.match(src,/if\(!response\.ok\)/);
 assert.match(src,/setSigningOut\(false\)/);
 assert.match(src,/window\.location\.assign\("\/admin\/lirygames\/login"\)/);
 assert.ok(!src.includes("finally{\n      window.location.assign"));
});

test("Commander logout fails closed when MFA context revocation fails",()=>{
 const src=text("app/api/admin/lirygames/logout/route.ts");
 const error=src.indexOf('if(contextError){');
 const signOut=src.indexOf('const{error:signOutError}=await supabase.auth.signOut()');
 assert.ok(error>=0&&signOut>error);
 assert.ok(src.includes('error:"context_revocation_failed"'));
 assert.ok(src.includes('status:500'));
});

test("Commander MFA rotation fails closed if prior sessions cannot be revoked",()=>{
 const src=text("app/api/admin/lirygames/mfa/verify/route.ts");
 const revoke=src.indexOf("const{error:revocationError}");
 const reject=src.indexOf('error:"context_revocation_failed"',revoke);
 const insert=src.indexOf("const{error:insertError}",revoke);
 assert.ok(revoke>=0&&reject>revoke&&insert>reject);
 assert.ok(src.includes("if(revocationError)"));
});

test("Commander layout requires current Supabase AAL2 and context MFA",()=>{
 const src=text("app/admin/master/layout.tsx");
 assert.match(src,/hasSatisfiedMfa\(supabase\)/);
 assert.match(src,/liry_mfa_context/);
 assert.match(src,/admin_mfa_context_sessions/);
 const aal2=src.indexOf("hasSatisfiedMfa(supabase)");
 const token=src.indexOf('cookieStore.get("liry_mfa_context")');
 assert.ok(aal2>=0&&token>aal2);
});

test("Developer dossier and review offer labeled reciprocal navigation",()=>{
 const dossier=text("app/admin/master/developers/dossier/page.tsx");
 const review=text("app/admin/master/developers/review/page.tsx");
 assert.ok(dossier.includes('aria-label="Navegación de Liry Developers"'));
 assert.ok(review.includes('aria-label="Navegación de Liry Developers"'));
 assert.ok(dossier.includes('href="/admin/master/developers/review"'));
 assert.ok(review.includes('href="/admin/master/developers/dossier"'));
});
