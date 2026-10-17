/** Conteo visible del recorrido LIRY para catálogo propio y terceros publicados.
 * No inventa actividad, no identifica clientes y nunca desbloquea una compra.
 */
export type LiryJourneyCatalogItem=Readonly<{slug:string}>;
export function liryGlobalJourneySummary(
 own:readonly LiryJourneyCatalogItem[],
 approvedExternal:readonly LiryJourneyCatalogItem[],
 verifiedVisitedIds:readonly string[]|null
):Readonly<{catalogSize:number;visited:number;verified:boolean;percent:number}>{
 const ids=new Set(liryVisibleJourneyCatalog(own,approvedExternal).map(game=>game.slug));
 const visited=verifiedVisitedIds===null?0:new Set(verifiedVisitedIds.filter(id=>ids.has(id))).size;
 return {catalogSize:ids.size,visited,verified:verifiedVisitedIds!==null,percent:ids.size?Math.round(visited/ids.size*100):0};
}

/** La lista visual y el indicador utilizan exactamente los mismos identificadores. */
export function liryVisibleJourneyCatalog<T extends LiryJourneyCatalogItem,U extends LiryJourneyCatalogItem>(
 own:readonly T[],external:readonly U[]
):readonly (T|U)[]{
 const seen=new Set<string>();
 const result:(T|U)[]=[];
 let ownCount=0,externalCount=0;
 for(const item of own){
  if(ownCount>=9)break;
  if(typeof item?.slug!=="string"||!item.slug.trim()||seen.has(item.slug))continue;
  seen.add(item.slug);result.push(item);ownCount++;
 }
 for(const item of external){
  if(externalCount>=91)break;
  if(typeof item?.slug!=="string"||!item.slug.trim()||seen.has(item.slug))continue;
  seen.add(item.slug);result.push(item);externalCount++;
 }
 return result;
}
