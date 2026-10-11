/** Secretos de Liry: preparación sin fragmentos, desafíos ni recompensas disponibles. */
export type SecretCandidate={
 publicCode:string;
 published:boolean;
 ageAppropriate:boolean;
 gameAvailable:boolean;
 serverVerifiedCompletion:boolean;
};
export type SecretReview="invalid"|"unpublished"|"unverified"|"inactive";
const CODE=/^LIRY-SECRET-[A-Z0-9_-]{3,32}$/;
export function inspectInactiveSecret(candidate:unknown):SecretReview{
 if(!candidate||typeof candidate!=="object"||Array.isArray(candidate))return "invalid";
 const c=candidate as Record<string,unknown>;
 if(typeof c.publicCode!=="string"||!CODE.test(c.publicCode)||
  typeof c.published!=="boolean"||typeof c.ageAppropriate!=="boolean"||
  typeof c.gameAvailable!=="boolean"||typeof c.serverVerifiedCompletion!=="boolean")return "invalid";
 if(!c.published||!c.ageAppropriate||!c.gameAvailable)return "unpublished";
 if(!c.serverVerifiedCompletion)return "unverified";
 return "inactive";
}
/** Nunca se acreditan fragmentos a un visitante ni se generan recompensas ficticias. */
export function getInactiveSecretsSnapshot(){
 return {active:false,fragments:[],completedChallenges:[],rewards:[],progressVerified:false} as const;
}
export function canUnlockInactiveSecret():false{return false;}
