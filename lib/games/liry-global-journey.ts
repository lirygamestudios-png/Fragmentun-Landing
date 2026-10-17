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
 let ownCount=0,externalCount=0;
 for(const item of own){
  if(ownCount>=9)break;
  if(typeof item?.slug!=="string"||!item.slug.trim()||ids.has(item.slug))continue;
  ids.add(item.slug);ownCount++;
 }
 for(const item of approvedExternal){
  if(externalCount>=91)break;
  if(typeof item?.slug!=="string"||!item.slug.trim()||ids.has(item.slug))continue;
  ids.add(item.slug);externalCount++;
 }
 const visited=verifiedVisitedIds===null?0:new Set(verifiedVisitedIds.filter(id=>ids.has(id))).size;
 return {catalogSize:ids.size,visited,verified:verifiedVisitedIds!==null,percent:ids.size?Math.round(visited/ids.size*100):0};
}
