/** Conteo visible del recorrido LIRY para catálogo propio y terceros publicados.
 * No inventa actividad, no identifica clientes y nunca desbloquea una compra.
 */
export type LiryJourneyCatalogItem=Readonly<{slug:string}>;
export function liryGlobalJourneySummary(
 own:readonly LiryJourneyCatalogItem[],
 approvedExternal:readonly LiryJourneyCatalogItem[],
 verifiedVisitedIds:readonly string[]|null
):Readonly<{catalogSize:number;visited:number;verified:boolean;percent:number}>{
 const ids=new Set<string>();
 for(const item of own.slice(0,9))if(item?.slug)ids.add(item.slug);
 for(const item of approvedExternal.slice(0,91))if(item?.slug)ids.add(item.slug);
 const visited=verifiedVisitedIds===null?0:new Set(verifiedVisitedIds.filter(id=>ids.has(id))).size;
 return {catalogSize:ids.size,visited,verified:verifiedVisitedIds!==null,percent:ids.size?Math.round(visited/ids.size*100):0};
}
