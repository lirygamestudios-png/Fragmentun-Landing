/**
 * Puerta de lectura, sin red ni base de datos.
 * El servidor deberá resolver identidad, consentimiento y verificación antes
 * de llamar a esta función; NO es un control de autorización independiente.
 */
import {preparePublicLiryBoostTop,type PublicLiryBoostEntry,type PublicLiryBoostRow} from "./public-leaderboard";
export type LiryBoostPublicationState={
 programActive:boolean;
 rulesPublished:boolean;
 verificationEnabled:boolean;
};
export function buildLiryBoostPublicSnapshot(
 state:LiryBoostPublicationState,
 authorizedVerifiedEntries:ReadonlyArray<PublicLiryBoostEntry>
):ReadonlyArray<PublicLiryBoostRow>{
 if(!state.programActive||!state.rulesPublished||!state.verificationEnabled)return [];
 return preparePublicLiryBoostTop(authorizedVerifiedEntries,true);
}
