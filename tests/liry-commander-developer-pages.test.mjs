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
 assert.doesNotMatch(sidebar,/href="\\/admin"(?!\\/)|href="\\/es"(?!\\/)/);
 assert.doesNotMatch(sidebar,/FRAGMENTUN Admin|Ver web pública/);
 assert.ok(sidebar.includes('href="/lirygames"'));
 assert.doesNotMatch(home,/title:"FRAGMENTUN"/);
});

test("sensitive provider screens remain informational and links stay in LIRYGAMES",()=>{
 const source=text("app/admin/master/integrations/providers/page.tsx");
 assert.match(source,/CUENTA ABIERTA · CONEXIÓN NO VERIFICADA/);
 assert.match(source,/Ninguna operación real autorizada/);
 assert.doesNotMatch(source,/href="\\/admin"(?!\\/master)/);
});
