import {safePublicThirdPartyCards,type ApprovedThirdPartyPublicRecord,type PublicThirdPartyCard} from "./liry-developer-publication";

/**
 * Preparatory read-only boundary for a future explicitly approved source.
 * Does not connect to a database, create rows, publish software or enable commerce.
 * Fail closed until the integrating server explicitly authorizes its source.
 */
export function projectApprovedExternalSource(
 source:unknown,
 options:{sourceApproved:boolean}
):readonly PublicThirdPartyCard[]{
 if(options?.sourceApproved!==true||!Array.isArray(source))return [];
 const verified:ApprovedThirdPartyPublicRecord[]=[];
 for(const item of source){
  if(item===null||typeof item!=="object"||Array.isArray(item))continue;
  const row=item as Record<string,unknown>;
  if(typeof row.gameId!=="string"||row.gameId.length===0||
     row.published!==true||row.releaseApproved!==true)continue;
  const s=row.submission;
  const card=row.publicCard;
  if(s===null||typeof s!=="object"||Array.isArray(s)||
     card===null||typeof card!=="object"||Array.isArray(card))continue;
  const submission=s as Record<string,unknown>;
  const publicCard=card as Record<string,unknown>;
  if(typeof submission.gameId!=="string"||
     typeof submission.developerId!=="string"||
     typeof submission.model!=="string"||
     typeof submission.state!=="string"||
     typeof publicCard.slug!=="string"||
     typeof publicCard.title!=="string"||
     typeof publicCard.model!=="string")continue;
  verified.push(row as unknown as ApprovedThirdPartyPublicRecord);
 }
 return safePublicThirdPartyCards(verified);
}
