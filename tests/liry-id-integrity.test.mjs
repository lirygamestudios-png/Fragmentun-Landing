import test from "node:test";
import assert from "node:assert/strict";
import {validateGamerAlias,isSafeAvatarStoragePath,DEFAULT_GAMER_PREFERENCES} from "../lib/games/liry-profile-contract.ts";
import {makePublicGamerSnapshot} from "../lib/games/public-gamer-snapshot.ts";

const activity=(overrides={})=>({
 accountId:"server-account",verifiedAt:"2026-10-10T12:00:00Z",
 gamesPlayed:1,achievedCount:1,playMinutes:30,visitedWorldIds:["ARENA-01"],
 achievementIds:["first_game"],experiencePoints:100,...overrides
});
test("perfil privado por defecto, promociones desactivadas",()=>{
 assert.equal(DEFAULT_GAMER_PREFERENCES.profileVisibility,"private");
 assert.equal(DEFAULT_GAMER_PREFERENCES.notifications.marketing,false);
 assert.equal(DEFAULT_GAMER_PREFERENCES.language,"es");
});
test("alias: rechazar vacío, demasiado corto, HTML y exceso de longitud",()=>{
 for(const alias of ["","  ","ab","<script>","a".repeat(33)])assert.equal(validateGamerAlias(alias),false);
 assert.equal(validateGamerAlias("Jugador Seguro"),true);
});
test("avatar: impedir rutas externas o fuera del espacio esperado",()=>{
 for(const path of ["../avatar.png","https://example.org/a.jpg","other/path.png","abc/../../secret.png"])
  assert.equal(isSafeAvatarStoragePath(path),false);
});
test("actividad sin certificación de servidor nunca genera XP",()=>{
 assert.equal(makePublicGamerSnapshot(true,activity(),false).verifiedActivity,null);
 assert.equal(makePublicGamerSnapshot(false,activity(),true).status,"visitor");
});
test("actividad alterada no se acredita aunque venga marcada como verificada",()=>{
 for(const change of [{experiencePoints:-1},{gamesPlayed:1.5},{achievedCount:2},{visitedWorldIds:["dup","dup"]},{achievementIds:["x","x"]},{verifiedAt:"2099-01-01T00:00:00Z"}]){
  const view=makePublicGamerSnapshot(true,activity(change),true);
  assert.equal(view.status,"identified_no_activity");
  assert.equal(view.verifiedActivity,null);
 }
});
test("proyección verificada omite identificador interno de cuenta",()=>{
 const view=makePublicGamerSnapshot(true,activity(),true);
 assert.equal(view.status,"verified");
 assert.equal(view.verifiedActivity?.experiencePoints,100);
 assert.equal(Object.hasOwn(view.verifiedActivity,"accountId"),false);
});
