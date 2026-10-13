/** LiryBoost: retirada pública con precedencia sobre una instantánea.
 * Entradas y revocaciones DEBEN proceder de la misma lectura consistente
 * de servidor. No se consultan ni modifican bases de datos.
 */
import {prepareConsentCurrentTop10,type VerifiedPublicListingEntry} from "./consent-current-top10.ts";
import type {PublicLiryBoostRow} from "./public-leaderboard.ts";
export function prepareRevocationSafeTop10(
 entries:ReadonlyArray<VerifiedPublicListingEntry>,
 revokedParticipantIds:ReadonlyArray<string>|null,
 consistentServerSnapshot:boolean,
 publicationAuthorized:boolean
):PublicLiryBoostRow[]{
 if(consistentServerSnapshot!==true||!Array.isArray(entries)||!Array.isArray(revokedParticipantIds))
  return [];
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 if(revokedParticipantIds.some(id=>typeof id!=="string"||!uuid.test(id)))return [];
 const revoked=new Set(revokedParticipantIds.map(id=>id.toLowerCase()));
 return prepareConsentCurrentTop10(entries.filter(e=>
   e&&typeof e.participantId==="string"&&!revoked.has(e.participantId.toLowerCase())
 ),publicationAuthorized);
}
