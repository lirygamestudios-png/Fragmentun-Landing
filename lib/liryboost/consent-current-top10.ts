/** LiryBoost: filtro previo de vigencia de consentimiento público.
 * Solo admite evidencias verificadas por servidor en una lectura consistente.
 * No consulta DB ni autoriza publicaciones reales por sí mismo.
 */
import {preparePublicLiryBoostTop,type PublicLiryBoostEntry,type PublicLiryBoostRow} from "./public-leaderboard.ts";

export type VerifiedPublicListingEntry=PublicLiryBoostEntry&{
 consentCurrent:unknown;
 participationEligible:unknown;
 serverVerified:unknown;
};
export function prepareConsentCurrentTop10(
 entries:ReadonlyArray<VerifiedPublicListingEntry>,
 publicationAuthorized:boolean
):PublicLiryBoostRow[]{
 if(publicationAuthorized!==true||!Array.isArray(entries))return [];
 return preparePublicLiryBoostTop(entries.filter(e=>
  e?.consentCurrent===true&&e.participationEligible===true&&e.serverVerified===true
 ),true);
}
