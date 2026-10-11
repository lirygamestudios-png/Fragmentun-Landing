import test from "node:test";
import assert from "node:assert/strict";
import {projectVerifiedCommunityPosts} from "../lib/games/liry-community-feed-contract.ts";
const post={id:"post_12345678",authorAlias:"Jugador Liry",body:"Saludos a la comunidad",verifiedAt:"2026-10-10T12:00:00Z",authorConsent:true};
test("publicaciones sin fuente y servicio autenticados permanecen ocultas",()=>{
 assert.deepEqual(projectVerifiedCommunityPosts([post],false,true),[]);
 assert.deepEqual(projectVerifiedCommunityPosts([post],true,false),[]);
});
test("la falta de consentimiento impide publicar contenidos",()=>{
 assert.deepEqual(projectVerifiedCommunityPosts([{...post,authorConsent:false}],true,true),[]);
});
test("rechazar duplicados, alias inseguros y fechas futuras",()=>{
 assert.deepEqual(projectVerifiedCommunityPosts([post,post],true,true),[]);
 assert.deepEqual(projectVerifiedCommunityPosts([{...post,authorAlias:"<script>"}],true,true),[]);
 assert.deepEqual(projectVerifiedCommunityPosts([{...post,verifiedAt:"2099-01-01T00:00:00Z"}],true,true),[]);
});
test("proyección solo incorpora campos públicos expresamente admitidos",()=>{
 const result=projectVerifiedCommunityPosts([{...post,secretToken:"private"}],true,true);
 assert.equal(result.length,1);
 assert.equal(Object.hasOwn(result[0],"secretToken"),false);
});
