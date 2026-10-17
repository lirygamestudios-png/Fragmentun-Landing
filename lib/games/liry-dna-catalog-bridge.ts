/** Adaptador entre el ADN universal y los 100 registros autorizados.
 * No asigna afinidades adivinadas ni recomienda juegos no aprobados.
 */
import {recommendUniversalLiryGames,type LiryAffinityVector,type LiryUniversalGame} from "./liry-universal-affinity";
import {OWN_GAME_RESERVED_SLOTS,THIRD_PARTY_CATALOG_CAPACITY} from "./liry-developer-publication";
export type LiryApprovedDnaCatalogRecord=Readonly<{
 publicId:string;
 origin:"first_party"|"third_party";
 published:boolean;
 releaseApproved:boolean;
 editorialAffinityApproved:boolean;
 affinity:LiryAffinityVector|null;
}>;
export function rankApprovedLiryDnaCatalog(records:readonly LiryApprovedDnaCatalogRecord[],answers:readonly number[],limit=3){
 if(answers.length!==6||answers.some(n=>!Number.isInteger(n)||n<0||n>3))return [];
 const catalog: LiryUniversalGame[]=records.map(item=>({
  publicId:item.publicId,origin:item.origin,published:item.published,
  releaseApproved:item.releaseApproved,affinityApproved:item.editorialAffinityApproved,affinity:item.affinity
 }));
 return recommendUniversalLiryGames(catalog,answers as unknown as LiryAffinityVector,limit);
}
export const LIRY_DNA_CATALOG_CAPACITY=OWN_GAME_RESERVED_SLOTS+THIRD_PARTY_CATALOG_CAPACITY;
