import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/games/worlds/page.tsx",import.meta.url),"utf8");
test("world editor fails closed before creating a Supabase client",()=>{
 assert.match(source,/function commanderWorldDataIsolated\(\)/);
 assert.match(source,/LIRYGAMES_COMMUNITY_DATA_ISOLATED==="true"/);
 assert.match(source,/if\(!commanderWorldDataIsolated\(\)\)throw new Error\("LIRYGAMES_COMMANDER_DATA_NOT_ISOLATED"\)/);
});
test("world administration blocks reads when backend is not isolated",()=>{
 assert.match(source,/if\(!commanderWorldDataIsolated\(\)\)return <main/);
 assert.match(source,/Datos de LIRYGAMES no aislados/);
 assert.match(source,/NO VERIFICADO/);
});
