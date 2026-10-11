import test from "node:test";
import assert from "node:assert/strict";
import {inspectUnpublishedOfficialSocialLink,canPublishUnconfiguredOfficialSocialLink} from "../lib/games/liry-social-link-policy.ts";
const link={network:"instagram",url:"https://www.instagram.com/lirygamesstudios/",ownerApproved:true,identityVerified:true};
test("dominios falsos y enlaces inseguros se rechazan",()=>{
 for(const url of ["http://instagram.com/example","https://instagram.com.evil.example/user","https://fake.example/user","https://www.instagram.com/"]){
  assert.equal(inspectUnpublishedOfficialSocialLink({...link,url}),"invalid");
 }
});
test("enlace sin validación del titular no se publica",()=>{
 assert.equal(inspectUnpublishedOfficialSocialLink({...link,ownerApproved:false}),"unverified");
 assert.equal(inspectUnpublishedOfficialSocialLink({...link,identityVerified:false}),"unverified");
});
test("redes ajenas y URLs con parámetros se rechazan",()=>{
 assert.equal(inspectUnpublishedOfficialSocialLink({...link,network:"unknown"}),"invalid");
 assert.equal(inspectUnpublishedOfficialSocialLink({...link,url:link.url+"?redirect=https://bad.example"}),"invalid");
});
test("una URL estructuralmente válida sigue pendiente de activación",()=>{
 assert.equal(inspectUnpublishedOfficialSocialLink(link),"pending_activation");
 assert.equal(canPublishUnconfiguredOfficialSocialLink(),false);
});
