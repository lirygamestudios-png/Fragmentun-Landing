import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const server=readFileSync(new URL("../lib/games/public-catalog-server.ts",import.meta.url),"utf8");
const front=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");

test("the FrontDesk preview avoids unnecessary reads of private game_titles",()=>{
 assert.doesNotMatch(server,/createSupabaseServerClient|\.from\(["']game_titles["']\)/);
 assert.match(server,/return plannedLiryGames;/);
});
test("the public catalog maps internal entries to generic identifiers",()=>{
 assert.match(front,/const publicCodenames=\[/);
 assert.match(front,/slug:`liry-public-/);
 assert.match(front,/title:publicCodenames\[index\]/);
 assert.doesNotMatch(front,/title:game\.title|slug:game\.slug/);
});
test("third-party publication remains gated off without a reviewed source",()=>{
 assert.match(server,/readAuthorizedExternalCatalog\(null,/);
 for(const flag of ["sourceApproved","publicReadEnabled","humanReleaseGateEnabled","independentCustodyEnabled"])
  assert.match(server,new RegExp(flag+":false"));
});
