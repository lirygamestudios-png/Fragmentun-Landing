import test from "node:test";import assert from "node:assert/strict";
import {projectApprovedPublicDnaProfiles,getApprovedPublicDnaProfiles} from "../lib/games/liry-public-dna-projection.ts";
const card={slug:"external-1",title:"Authorized",description:"Approved",model:"freemium",coverUrl:null};
const profile={publicId:"external-1",origin:"third_party",affinity:[1,2,3,1,2,3],affinityApproved:true,releaseApproved:true,published:true};
test("No public DNA profile without independently trusted editorial source",async()=>{
 assert.deepEqual(projectApprovedPublicDnaProfiles([card],[profile]),[]);
 assert.deepEqual(await getApprovedPublicDnaProfiles([card]),[]);
});
test("only published cards with matching approved editorial profiles can be projected",()=>{
 assert.deepEqual(projectApprovedPublicDnaProfiles([card],[profile],true).map(x=>x.publicId),["external-1"]);
 assert.deepEqual(projectApprovedPublicDnaProfiles([], [profile],true),[]);
 assert.deepEqual(projectApprovedPublicDnaProfiles([card],[{...profile,affinityApproved:false}],true),[]);
 assert.deepEqual(projectApprovedPublicDnaProfiles([card],[{...profile,affinity:[99,2,3,1,2,3]}],true),[]);
});
