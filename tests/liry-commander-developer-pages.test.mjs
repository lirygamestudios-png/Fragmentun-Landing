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
