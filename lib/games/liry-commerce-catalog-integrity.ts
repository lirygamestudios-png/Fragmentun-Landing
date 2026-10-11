/** Contrato de integridad comercial; valida datos, pero NO habilita productos ni cobros. */
export type CommerceProductCandidate={
 publicCode:string;channel:"in_game_items"|"physical_merchandise"|"digital_collectibles";
 priceMinor:number;currency:"USD"|"DOP";serverCatalogVerified:boolean;
};
const CODE=/^[A-Z0-9][A-Z0-9_-]{5,63}$/;
export function isWellFormedCommerceProduct(value:unknown):value is CommerceProductCandidate{
 if(!value||typeof value!=="object"||Array.isArray(value))return false;
 const x=value as Record<string,unknown>;
 return typeof x.publicCode==="string"&&CODE.test(x.publicCode)&&
 ["in_game_items","physical_merchandise","digital_collectibles"].includes(String(x.channel))&&
 typeof x.priceMinor==="number"&&Number.isSafeInteger(x.priceMinor)&&x.priceMinor>=0&&
 (x.currency==="USD"||x.currency==="DOP")&&x.serverCatalogVerified===true;
}
export function inspectInactiveCommerceCatalog(value:unknown):"invalid"|"duplicate"|"inactive"{
 if(!Array.isArray(value)||value.length===0||value.length>100)return "invalid";
 if(!value.every(isWellFormedCommerceProduct))return "invalid";
 if(new Set(value.map((x:CommerceProductCandidate)=>x.publicCode)).size!==value.length)return "duplicate";
 return "inactive"; // Catálogo real y cobros bloqueados hasta activación autorizada.
}
