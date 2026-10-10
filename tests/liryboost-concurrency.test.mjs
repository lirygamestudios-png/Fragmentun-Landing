import test from "node:test";
import assert from "node:assert/strict";

/**
 * Modelo LOCAL de dos solicitudes concurrentes: la restricción de unicidad
 * debe decidir dentro de una transacción, no mediante una consulta previa.
 * No es una prueba de PostgreSQL/Supabase.
 */
class LocalUniqueReferralStore {
 #invited=new Set();
 async register(referrer,invited){
  await Promise.resolve(); // ambas solicitudes pueden alcanzar esta zona
  if(!referrer||!invited||referrer===invited)return {accepted:false,reason:"invalid"};
  // Operación síncrona equivalente al punto de linealización UNIQUE.
  if(this.#invited.has(invited))return {accepted:false,reason:"duplicate"};
  this.#invited.add(invited);
  return {accepted:true};
 }
 get size(){return this.#invited.size;}
}
test("dos solicitudes simultáneas por el mismo invitado producen una sola aceptación",async()=>{
 const store=new LocalUniqueReferralStore();
 const responses=await Promise.all([
  store.register("referrer-a","invited-z"),
  store.register("referrer-b","invited-z")
 ]);
 assert.equal(responses.filter(r=>r.accepted).length,1);
 assert.equal(responses.filter(r=>r.reason==="duplicate").length,1);
 assert.equal(store.size,1);
});
test("solicitudes para invitados distintos pueden aceptarse",async()=>{
 const store=new LocalUniqueReferralStore();
 const responses=await Promise.all([
  store.register("referrer-a","invited-a"),
  store.register("referrer-a","invited-b")
 ]);
 assert.equal(responses.filter(r=>r.accepted).length,2);
 assert.equal(store.size,2);
});
test("autorreferencia no se contabiliza",async()=>{
 const store=new LocalUniqueReferralStore();
 assert.deepEqual(await store.register("same","same"),{accepted:false,reason:"invalid"});
 assert.equal(store.size,0);
});
