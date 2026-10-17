/** Read-only projection for Liry ADN. Requires independently approved public cards
 * AND separately approved six-dimensional affinity profiles.
 * No active source: no invented profiles or automatic publication.
 */
import type {PublicThirdPartyCard} from "./liry-developer-publication";
import {validLiryAffinityVector,type LiryAffinityVector} from "./liry-universal-affinity";
import type {LiryApprovedDnaCatalogRecord} from "./liry-dna-catalog-bridge";

export type LiryEditorialAffinityRecord=Readonly<{
 publicId:string;
 origin:"first_party"|"third_party";
 affinity:unknown;
 affinityApproved:boolean;
 releaseApproved:boolean;
 published:boolean;
}>;
export function projectApprovedPublicDnaProfiles(
 publicExternalCards:readonly PublicThirdPartyCard[],
 editorialRecords:readonly LiryEditorialAffinityRecord[]|null,
 trustedEditorialSource=false
):readonly LiryApprovedDnaCatalogRecord[]{
 if(!trustedEditorialSource||!editorialRecords)return [];
 const allowed=new Set(publicExternalCards.map(card=>card.slug));
 const seen=new Set<string>();
 const result:LiryApprovedDnaCatalogRecord[]=[];
 for(const record of editorialRecords){
  if(record?.origin!=="third_party"||!allowed.has(record.publicId)||seen.has(record.publicId)||
    record.published!==true||record.releaseApproved!==true||record.affinityApproved!==true||
    !validLiryAffinityVector(record.affinity))continue;
  seen.add(record.publicId);
  result.push({publicId:record.publicId,origin:"third_party",published:true,releaseApproved:true,
   editorialAffinityApproved:true,affinity:record.affinity as LiryAffinityVector});
  if(result.length>=91)break;
 }
 return result;
}
/** Production read remains closed until a separately authorized editorial source exists. */
export async function getApprovedPublicDnaProfiles(
 publicExternalCards:readonly PublicThirdPartyCard[]
):Promise<readonly LiryApprovedDnaCatalogRecord[]>{
 return projectApprovedPublicDnaProfiles(publicExternalCards,null,false);
}
