/** Contrato de consentimiento para futura inscripción: sin persistencia ni activación. */
export type ConsentRecord={userId:string;rulesVersion:string;privacyVersion:string;rulesAcceptedAt:string|null;privacyAcceptedAt:string|null;publicRankingOptIn:boolean;rankingConsentAt:string|null;rankingConsentRevokedAt:string|null};
export function evaluateLiryBoostConsent(record:ConsentRecord|null,expected:{rulesVersion:string;privacyVersion:string},now:number=Date.now()){
 if(!record||!record.userId.trim()||record.rulesVersion!==expected.rulesVersion||record.privacyVersion!==expected.privacyVersion)return {registrationAllowed:false,rankingAllowed:false};
 const validTime=(x:string|null)=>!!x&&Number.isFinite(Date.parse(x))&&Date.parse(x)<=now;
 const registrationAllowed=validTime(record.rulesAcceptedAt)&&validTime(record.privacyAcceptedAt);
 const rankingAllowed=registrationAllowed&&record.publicRankingOptIn===true&&validTime(record.rankingConsentAt)&&!record.rankingConsentRevokedAt;
 return {registrationAllowed,rankingAllowed};
}
